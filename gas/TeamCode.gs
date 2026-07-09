/**
 * 埼玉県野球チームマップ 情報提供API（クラウドソーシング承認・差分オーバーレイ版）
 *
 * 【役割】公園マップ(Code.gs)とは独立した、チームマップ専用のWebアプリAPI。
 *  - チーム情報フォームの回答を受信 → Teamsへ通知（onFormSubmit）
 *  - 事務局が承認ページ(shonin.html)で承認/却下
 *  - 承認済みの「差分（上書き／新規チーム）」を JSON 配信（action=teamOverrides）
 *    → team-map.js が土台(teams-data.js 2,143件)に重ねて表示（git push 不要・即反映）
 *
 * 【公園版との違い】
 *  - 投票・自動公開はしない（SNSリンク等は不適切URL混入の恐れ→全件承認制）
 *  - 1送信＝1提案（修正 or 新規）として個別に扱う（公園のように名前で集計しない）
 *
 * 【セットアップ】
 *  1. チーム情報フォームの「回答先スプレッドシート」を開く
 *  2. 拡張機能 → Apps Script に、このファイルを丸ごと貼り付けて保存
 *  3. 下の「設定」を埋める（TEAMS_WEBHOOK_URL / APPROVE_TOKEN）
 *  4. メニュー「チームマップ管理 → Teams通知トリガーを設定」を一度実行
 *  5. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」/ アクセス「全員」→ デプロイ
 *     → 発行された /exec URL を config.js の TEAM_GAS_URL と shonin.html の TEAM_GAS_URL に設定
 *
 * 【フォームの質問（＝回答シートの見出し）推奨】
 *  種別 / チーム名 / 市区町村 / 公式HP・ホームページ / X（旧Twitter） / Instagram /
 *  その他URL / 活動場所 / 活動日 / 連絡先 / カテゴリ / 性別 / 男子の人数 / 女子の人数 /
 *  ボール / 所属リーグ / 緯度 / 経度 / 補足・連絡事項
 *  ※ 見出しはキーワード自動検出。多少違っても拾えるが、上記推奨に合わせると確実。
 */

// ═══ 設定 ═══
const TEAM_SHEET_NAME    = 'フォームの回答 1';     // フォーム回答シート名
const TEAM_OVERRIDE_SHEET = '承認済みチーム差分';   // 承認済みの上書き/新規を貯めるシート
const TEAM_REJECT_SHEET  = '却下ログ';

const TEAMS_WEBHOOK_URL = '';                       // ← TeamsのIncoming Webhook URL（空なら通知しない。公園と同じURLでも可）
const APPROVE_TOKEN     = '__SET_IN_DEPLOYED_GAS__';// ← 合言葉。公開リポジトリには実値を書かない（公園と同じ値にすれば承認ページは1合言葉で両対応）

// 承認済み差分シートの見出し
const TEAM_OVERRIDE_HEADERS = [
  '承認日時', '種別', 'チーム名', '市区町村', '緯度', '経度',
  'カテゴリ', '性別', '男子数', '女子数', 'ボール', '所属リーグ',
  '公式HP', 'X', 'Instagram', 'その他URL', '活動場所', '活動日', '連絡先', '補足', 'ロゴ',
  '送信ID(sourceTs)', 'キー(key)'
];

// ═══ WebアプリGET ═══
function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action;

  if (action === 'adminTeamList') {
    if (p.token !== APPROVE_TOKEN) return _tjson({ ok: false, error: 'token' });
    return _tjson({ ok: true, items: adminTeamList_() });
  }
  if (action === 'adminTeamHistory') {
    if (p.token !== APPROVE_TOKEN) return _tjson({ ok: false, error: 'token' });
    return _tjson(adminTeamHistory_());
  }
  // 既定: 承認済みの差分（上書き/新規）を配信 → team-map.js が土台に重ねる
  return _tjson(getTeamOverrides());
}

// ═══ WebアプリPOST（承認/却下） ═══
function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.action === 'approveTeam') { return _tjson(approveTeam(d.ts, d.token, d.lat, d.lng)); }
    if (d.action === 'rejectTeam')  { return _tjson(rejectTeam(d.ts, d.token)); }
    return _tjson({ ok: false, error: 'unknown action' });
  } catch (err) {
    return _tjson({ ok: false, error: String(err) });
  }
}

function _tjson(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ═══ 列の自動検出（見出しが多少違っても拾う） ═══
function detectTeamCols_(headers) {
  const find = (kw, def) => {
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i]);
      if (kw.some(k => h.indexOf(k) >= 0)) return i;
    }
    return (def === undefined ? -1 : def);
  };
  return {
    ts:      0, // A列＝タイムスタンプ
    shubetsu: find(['種別', '区分']),
    name:    find(['チーム名', '団体名']),
    city:    find(['市区町村', '市町村', 'エリア']),
    hp:      find(['公式HP', 'ホームページ', '公式サイト', 'HP']),
    x:       find(['X（', 'X(', 'Twitter', '旧Twitter', 'エックス']),
    ig:      find(['Instagram', 'インスタ']),
    other:   find(['その他URL', 'その他のURL', '他のSNS', 'その他のSNS']),
    place:   find(['活動場所', 'グラウンド', '練習場', '活動グラウンド']),
    days:    find(['活動日', '曜日', '練習日']),
    contact: find(['連絡先', '問い合わせ', 'メール']),
    cat:     find(['カテゴリ', '世代', 'カテゴリー']),
    gender:  find(['性別']),
    male:    find(['男子']),
    female:  find(['女子']),
    ball:    find(['ボール', '軟式', '硬式']),
    league:  find(['リーグ', '所属']),
    lat:     find(['緯度']),
    lng:     find(['経度']),
    note:    find(['補足', '連絡事項', '備考']),
    submitter: find(['提供者']),   // 事務局のみ参照。地図には絶対に出さない
    logo:    find(['ロゴ', 'logo'])
  };
}

// 値の取り出しユーティリティ
function _cell(row, idx) { return (idx >= 0 && idx < row.length) ? row[idx] : ''; }
function _str(v) { const s = String(v == null ? '' : v).trim(); return (s === '-' || s === 'undefined') ? '' : s; }
function _tms(v) { return (v instanceof Date) ? v.getTime() : (v ? new Date(v).getTime() : NaN); }

// カテゴリを内部コードへ（小学生→elem 等）
function normCat_(v) {
  const s = String(v || '');
  if (s.indexOf('小') >= 0) return 'elem';
  if (s.indexOf('中') >= 0) return 'jhs';
  if (s.indexOf('高') >= 0) return 'hs';
  if (s.indexOf('大学') >= 0 || s.indexOf('大') >= 0) return 'univ';
  if (s.indexOf('独立') >= 0) return 'independent';
  if (s.indexOf('クラブ') >= 0 || s.indexOf('一般') >= 0 || s.indexOf('企業') >= 0) return 'club';
  return '';
}
function normGender_(v) {
  const s = String(v || '');
  if (s.indexOf('女') >= 0) return 'female';
  if (s.indexOf('混') >= 0) return 'mixed';
  if (s.indexOf('男') >= 0) return 'male';
  return '';
}
// URL健全化: 空/ハイフン→''、危険スキーム除去、スキーム無しは https:// を補う
function sanitizeUrl_(v) {
  const s = _str(v);
  if (!s) return '';
  if (/^javascript:|^data:|^vbscript:/i.test(s)) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return 'https://' + s.replace(/^\/+/, '');
}
function validLat_(v) { const n = parseFloat(v); return (n >= 35 && n <= 37) ? n : NaN; }
function validLng_(v) { const n = parseFloat(v); return (n >= 138 && n <= 141) ? n : NaN; }

// チーム名+市区町村 → 照合キー（client/team-map.js と同じ正規化にすること）
function teamKey_(name, city) {
  const n = s => String(s || '').normalize ? String(s || '').normalize('NFKC') : String(s || '');
  const clean = s => n(s).replace(/[\s　]+/g, '').toLowerCase();
  return clean(name) + '|' + clean(city);
}

// 1送信(row) → 提案オブジェクト
function rowToProposal_(row, c) {
  const name = _str(_cell(row, c.name));
  const city = _str(_cell(row, c.city));
  const shubetsuRaw = String(_cell(row, c.shubetsu) || '');
  let type = (shubetsuRaw.indexOf('新規') >= 0 || shubetsuRaw.indexOf('追加') >= 0) ? 'new'
           : (shubetsuRaw.indexOf('修正') >= 0 || shubetsuRaw.indexOf('変更') >= 0) ? 'edit'
           : ''; // 不明
  const lat = validLat_(_cell(row, c.lat));
  const lng = validLng_(_cell(row, c.lng));
  const tms = _tms(row[c.ts]);
  return {
    ts: isNaN(tms) ? '' : String(tms),
    type: type,
    name: name,
    city: city,
    lat: isNaN(lat) ? '' : lat,
    lng: isNaN(lng) ? '' : lng,
    cat: normCat_(_cell(row, c.cat)),
    gender: normGender_(_cell(row, c.gender)),
    male: _str(_cell(row, c.male)),
    female: _str(_cell(row, c.female)),
    ball: _str(_cell(row, c.ball)),
    league: _str(_cell(row, c.league)),
    hp: sanitizeUrl_(_cell(row, c.hp)),
    x_url: sanitizeUrl_(_cell(row, c.x)),
    ig: sanitizeUrl_(_cell(row, c.ig)),
    other_url: sanitizeUrl_(_cell(row, c.other)),
    place: _str(_cell(row, c.place)),
    days: _str(_cell(row, c.days)),
    contact: _str(_cell(row, c.contact)),
    note: _str(_cell(row, c.note)),
    logo: sanitizeUrl_(_cell(row, c.logo)),
    submitter: _str(_cell(row, c.submitter))   // 承認ページ・通知のみ。getTeamOverrides/approveTeam では書き出さない＝非公開
  };
}

// ═══ 承認済み差分を配信（team-map.js が読む） ═══
// 同一キーは「非空フィールドを後勝ちでマージ」して1件に集約。
function getTeamOverrides() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TEAM_OVERRIDE_SHEET);
  if (!sh) return { ok: true, overrides: [], updated: null };
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { ok: true, overrides: [], updated: null };
  const H = {}; data[0].forEach((h, i) => H[String(h)] = i);
  const gi = k => (H[k] == null ? -1 : H[k]);
  const idx = {
    when: gi('承認日時'), type: gi('種別'), name: gi('チーム名'), city: gi('市区町村'),
    lat: gi('緯度'), lng: gi('経度'), cat: gi('カテゴリ'), gender: gi('性別'),
    male: gi('男子数'), female: gi('女子数'), ball: gi('ボール'), league: gi('所属リーグ'),
    hp: gi('公式HP'), x: gi('X'), ig: gi('Instagram'), other: gi('その他URL'),
    place: gi('活動場所'), days: gi('活動日'), contact: gi('連絡先'), note: gi('補足'), logo: gi('ロゴ'),
    key: gi('キー(key)')
  };
  const map = {};
  let latest = 0;
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    const name = _str(r[idx.name]);
    if (!name) continue;
    const key = (idx.key >= 0 && _str(r[idx.key])) ? _str(r[idx.key]) : teamKey_(name, _str(r[idx.city]));
    const o = map[key] || { key: key };
    const set = (f, v) => { const s = _str(v); if (s !== '') o[f] = s; };
    o.type = _str(r[idx.type]) || o.type || 'edit';
    set('name', r[idx.name]); set('city', r[idx.city]);
    if (validLat_(r[idx.lat])) o.lat = validLat_(r[idx.lat]);
    if (validLng_(r[idx.lng])) o.lng = validLng_(r[idx.lng]);
    set('cat', r[idx.cat]); set('gender', r[idx.gender]);
    set('male', r[idx.male]); set('female', r[idx.female]);
    set('ball', r[idx.ball]); set('league', r[idx.league]);
    set('hp', r[idx.hp]); set('x_url', r[idx.x]); set('ig', r[idx.ig]); set('other_url', r[idx.other]);
    set('place', r[idx.place]); set('days', r[idx.days]); set('contact', r[idx.contact]); set('note', r[idx.note]);
    set('logo', r[idx.logo]);
    map[key] = o;
    const w = _tms(r[idx.when]); if (!isNaN(w) && w > latest) latest = w;
  }
  const overrides = Object.keys(map).map(k => map[k]);
  return { ok: true, overrides: overrides, updated: latest ? new Date(latest).toISOString() : null };
}

// ═══ 承認待ち（pending）一覧を返す（要token・承認ページ用） ═══
// 承認済み(sourceTs)・却下済み(却下ログ) でない送信を、提案内容そのまま返す。
function adminTeamList_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(TEAM_SHEET_NAME);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const c = detectTeamCols_(data[0]);
  const approved = approvedTsSet_();
  const rejected = teamRejectedSet_();
  const items = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const p = rowToProposal_(row, c);
    if (!p.ts || !p.name) continue;
    if (approved[p.ts] || rejected[p.ts]) continue;
    items.push(p);
  }
  // 新しい順
  items.sort((a, b) => (parseInt(b.ts) || 0) - (parseInt(a.ts) || 0));
  return items;
}

// ═══ 承認・却下の履歴を返す（要token・承認ページ用） ═══
// 承認済み＝「承認済みチーム差分」の各行（1行=1承認。マージしない）
// 却下＝「却下ログ」（submissionId=投稿日時ms / rejectedAt=却下日時）
function adminTeamHistory_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const approved = [];
  const sh = ss.getSheetByName(TEAM_OVERRIDE_SHEET);
  if (sh) {
    const data = sh.getDataRange().getValues();
    if (data.length > 1) {
      const H = {}; data[0].forEach((h, i) => H[String(h)] = i);
      const gi = k => (H[k] == null ? -1 : H[k]);
      const idx = {
        when: gi('承認日時'), type: gi('種別'), name: gi('チーム名'), city: gi('市区町村'),
        cat: gi('カテゴリ'), place: gi('活動場所'),
        hp: gi('公式HP'), x: gi('X'), ig: gi('Instagram'), other: gi('その他URL'), logo: gi('ロゴ')
      };
      const at = (r, i2) => (i2 >= 0 ? r[i2] : '');
      for (let i = 1; i < data.length; i++) {
        const r = data[i];
        const name = _str(at(r, idx.name));
        if (!name) continue;
        approved.push({
          when: (idx.when >= 0) ? (isNaN(_tms(r[idx.when])) ? '' : _tms(r[idx.when])) : '',
          type: _str(at(r, idx.type)), name: name, city: _str(at(r, idx.city)),
          cat: _str(at(r, idx.cat)), place: _str(at(r, idx.place)),
          hp: _str(at(r, idx.hp)), x_url: _str(at(r, idx.x)), ig: _str(at(r, idx.ig)), other_url: _str(at(r, idx.other)),
          logo: _str(at(r, idx.logo))
        });
      }
      approved.sort((a, b) => (b.when || 0) - (a.when || 0));
    }
  }
  const rejected = [];
  const rj = ss.getSheetByName(TEAM_REJECT_SHEET);
  if (rj) {
    const d = rj.getDataRange().getValues();
    for (let i = 1; i < d.length; i++) {
      const r = d[i];
      if (r[0] === '' || r[0] == null) continue;
      const ra = _tms(r[4]);
      rejected.push({ ts: String(r[0]), name: _str(r[1]), shubetsu: _str(r[2]), note: _str(r[3]), rejectedAt: isNaN(ra) ? '' : ra });
    }
    rejected.sort((a, b) => (b.rejectedAt || 0) - (a.rejectedAt || 0));
  }
  return { ok: true, approved: approved, rejected: rejected };
}

// 承認済みシートの sourceTs 集合
function approvedTsSet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TEAM_OVERRIDE_SHEET);
  const set = {};
  if (!sh) return set;
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return set;
  let col = -1; data[0].forEach((h, i) => { if (String(h).indexOf('sourceTs') >= 0 || String(h).indexOf('送信ID') >= 0) col = i; });
  if (col < 0) return set;
  for (let i = 1; i < data.length; i++) { const v = _str(data[i][col]); if (v) set[v] = true; }
  return set;
}

// 却下ログの送信ID集合
function teamRejectedSet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rj = ss.getSheetByName(TEAM_REJECT_SHEET);
  const set = {};
  if (rj) { const d = rj.getDataRange().getValues(); for (let i = 1; i < d.length; i++) { if (d[i][0] !== '' && d[i][0] != null) set[String(d[i][0])] = true; } }
  return set;
}

// ═══ 承認: 指定送信(ts)を承認済み差分シートへ反映 ═══
// 新規チームで座標が未送信の場合、承認ページから lat/lng を渡せる（任意）。
function approveTeam(ts, token, lat, lng) {
  if (token !== APPROVE_TOKEN) return { ok: false, error: '合言葉が違います' };
  ts = String(ts || '').trim();
  if (!ts) return { ok: false, error: '送信IDがありません' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(TEAM_SHEET_NAME);
  if (!sheet) return { ok: false, error: '回答シートが見つかりません' };
  const data = sheet.getDataRange().getValues();
  const c = detectTeamCols_(data[0]);
  let prop = null;
  for (let i = 1; i < data.length; i++) {
    if (String(_tms(data[i][c.ts])) === ts) { prop = rowToProposal_(data[i], c); break; }
  }
  if (!prop) return { ok: false, error: '該当する送信が見つかりません（古い通知の可能性）' };

  // 承認ページから座標補正があれば優先（新規チームで地図ピック未使用の場合に使う）
  const la = validLat_(lat), ln = validLng_(lng);
  if (!isNaN(la)) prop.lat = la;
  if (!isNaN(ln)) prop.lng = ln;

  // 新規なのに座標が無ければ承認しない（地図に置けないため）
  if (prop.type === 'new' && (prop.lat === '' || prop.lng === '')) {
    return { ok: false, error: '新規チームは緯度・経度が必要です（承認ページで地図位置を指定してください）' };
  }

  let sh = ss.getSheetByName(TEAM_OVERRIDE_SHEET);
  if (!sh) { sh = ss.insertSheet(TEAM_OVERRIDE_SHEET); sh.getRange(1, 1, 1, TEAM_OVERRIDE_HEADERS.length).setValues([TEAM_OVERRIDE_HEADERS]); }
  // 同じ送信IDが既に承認済みなら二重追加しない
  const ex = sh.getDataRange().getValues();
  let tsCol = -1; ex[0].forEach((h, i) => { if (String(h).indexOf('sourceTs') >= 0 || String(h).indexOf('送信ID') >= 0) tsCol = i; });
  if (tsCol >= 0) { for (let i = 1; i < ex.length; i++) { if (String(ex[i][tsCol]) === ts) return { ok: true, name: prop.name, dup: true }; } }

  const key = teamKey_(prop.name, prop.city);
  sh.appendRow([
    new Date(), prop.type || 'edit', prop.name, prop.city, prop.lat, prop.lng,
    prop.cat, prop.gender, prop.male, prop.female, prop.ball, prop.league,
    prop.hp, prop.x_url, prop.ig, prop.other_url, prop.place, prop.days, prop.contact, prop.note, prop.logo,
    ts, key
  ]);
  return { ok: true, name: prop.name, type: prop.type };
}

// ═══ 却下: その送信1件を却下ログへ退避（非破壊） ═══
function rejectTeam(ts, token) {
  if (token !== APPROVE_TOKEN) return { ok: false, error: '合言葉が違います' };
  ts = String(ts || '').trim();
  if (!ts) return { ok: false, error: '送信IDがありません' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let rj = ss.getSheetByName(TEAM_REJECT_SHEET);
  if (!rj) { rj = ss.insertSheet(TEAM_REJECT_SHEET); rj.getRange(1, 1, 1, 5).setValues([['submissionId', 'チーム名', '種別', '補足', 'rejectedAt']]); }
  const d = rj.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) { if (String(d[i][0]) === ts) return { ok: true }; }
  // 中身も記録
  let name = '', shubetsu = '', note = '';
  try {
    const sheet = ss.getSheetByName(TEAM_SHEET_NAME);
    const sdata = sheet.getDataRange().getValues();
    const c = detectTeamCols_(sdata[0]);
    for (let i = 1; i < sdata.length; i++) {
      if (String(_tms(sdata[i][c.ts])) === ts) {
        name = _str(_cell(sdata[i], c.name)); shubetsu = String(_cell(sdata[i], c.shubetsu) || ''); note = _str(_cell(sdata[i], c.note)); break;
      }
    }
  } catch (e) {}
  rj.appendRow([ts, name, shubetsu, note, new Date()]);
  return { ok: true, name: name };
}

// ═══ フォーム送信時: Teamsへ通知（承認ページへ誘導） ═══
function onFormSubmit(e) {
  try {
    if (!TEAMS_WEBHOOK_URL) return;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TEAM_SHEET_NAME);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const c = detectTeamCols_(headers);
    const vals = (e && e.values) ? e.values : [];
    const name = _str(_cell(vals, c.name));
    if (!name) return;
    const shubetsuRaw = String(_cell(vals, c.shubetsu) || '');
    const type = (shubetsuRaw.indexOf('新規') >= 0 || shubetsuRaw.indexOf('追加') >= 0) ? '新規チーム' : '情報修正';
    const city = _str(_cell(vals, c.city));
    notifyTeamsTeam_(name, type, city, vals, c);
  } catch (err) { console.warn('onFormSubmit(team)', err); }
}

function notifyTeamsTeam_(name, type, city, vals, c) {
  const facts = [
    { title: '種別', value: type },
    { title: 'チーム名', value: name }
  ];
  if (city) facts.push({ title: '市区町村', value: city });
  const place = _str(_cell(vals, c.place)); if (place) facts.push({ title: '活動場所', value: place });
  const sns = [];
  [['HP', c.hp], ['X', c.x], ['IG', c.ig], ['その他', c.other]].forEach(function (p) { const u = _str(_cell(vals, p[1])); if (u) sns.push(p[0]); });
  if (sns.length) facts.push({ title: 'SNS', value: sns.join(' / ') });
  const submitter = _str(_cell(vals, c.submitter)); if (submitter) facts.push({ title: '提供者', value: submitter });
  const body = [
    { type: 'TextBlock', text: 'チームマップに情報提供が届きました', weight: 'Bolder', size: 'Medium' },
    { type: 'FactSet', facts: facts },
    { type: 'TextBlock', text: '[承認ページを開く（チームタブ）](https://map.saitamabaseball.com/shonin.html)', wrap: true, weight: 'Bolder', color: 'Accent', spacing: 'Medium' }
  ];
  const payload = {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: { type: 'AdaptiveCard', $schema: 'http://adaptivecards.io/schemas/adaptive-card.json', version: '1.4', body: body }
    }]
  };
  UrlFetchApp.fetch(TEAMS_WEBHOOK_URL, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
}

// 通知トリガーを設定（メニューから一度だけ実行）
function setupTeamTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'onFormSubmit') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('onFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
  SpreadsheetApp.getUi().alert('Teams通知トリガーを設定しました。\nフォーム送信時にTeamsへ通知が届きます。');
}

// ═══ スプレッドシートのメニュー（承認ページが使えない時の手動操作） ═══
function approveSelectedTeam() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  if (sh.getName() !== TEAM_SHEET_NAME) { ui.alert('「' + TEAM_SHEET_NAME + '」シートで、承認したい行を選んでから実行してください。'); return; }
  const row = sh.getActiveRange().getRow();
  if (row <= 1) { ui.alert('見出し行ではなく、提案の行（2行目以降）を選んでください。'); return; }
  const ts = String(_tms(sh.getRange(row, 1).getValue()));
  if (ts === 'NaN') { ui.alert('この行の送信時刻（A列）が読み取れません。'); return; }
  const r = approveTeam(ts, APPROVE_TOKEN);
  if (r && r.ok) ui.alert('「' + (r.name || '') + '」を承認しました。数分でマップに反映されます。');
  else ui.alert('承認できませんでした：' + ((r && r.error) || '不明'));
}

function rejectSelectedTeam() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  if (sh.getName() !== TEAM_SHEET_NAME) { ui.alert('「' + TEAM_SHEET_NAME + '」シートで、却下したい行を選んでから実行してください。'); return; }
  const row = sh.getActiveRange().getRow();
  if (row <= 1) { ui.alert('見出し行ではなく、提案の行（2行目以降）を選んでください。'); return; }
  const ts = String(_tms(sh.getRange(row, 1).getValue()));
  if (ts === 'NaN') { ui.alert('この行の送信時刻（A列）が読み取れません。'); return; }
  const res = ui.alert('この提案を却下しますか？', '非破壊（却下ログへ退避）。あとで却下ログの行を消せば戻せます。', ui.ButtonSet.OK_CANCEL);
  if (res !== ui.Button.OK) return;
  const r = rejectTeam(ts, APPROVE_TOKEN);
  ui.alert(r && r.ok ? '却下しました。' : ('却下できませんでした：' + ((r && r.error) || '不明')));
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('チームマップ管理')
    .addItem('選択した提案を承認', 'approveSelectedTeam')
    .addItem('選択した提案を却下', 'rejectSelectedTeam')
    .addSeparator()
    .addItem('Teams通知トリガーを設定', 'setupTeamTriggers')
    .addToUi();
}
