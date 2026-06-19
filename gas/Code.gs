/**
 * 埼玉県公園マップ 集計・WebアプリAPI（リアルタイム反映＋Teamsワンタップ承認 対応版）
 *
 * 【この版でできること】
 *  - approved（公開済）に加え、未承認の報告を「確認中(pending)」として即時にマップへ返す（action=live）
 *  - フォーム送信時にTeamsへ通知し、リンクを押すだけで承認・公開（action=approve）
 *  - 送信された緯度・経度があればそれを採用（無い場合のみ名前でジオコーディング）
 *  - 従来の手動メニュー（①集計／②公開）もそのまま利用可
 *
 * 【セットアップ】
 *  1. スプレッドシート → 拡張機能 → Apps Script に貼り付けて保存
 *  2. 下の「設定」を埋める（TEAMS_WEBHOOK_URL / APPROVE_TOKEN / WEBAPP_URL）
 *  3. メニュー「公園マップ管理 → ③ Teams通知トリガーを設定」を一度実行（フォーム送信時通知が有効化）
 *  4. デプロイ → デプロイを管理 → 既存デプロイを編集 → 新バージョン → デプロイ
 *     （URLは変わりません。parks.html の GAS_URL はそのままでOK）
 */

// ═══ 設定 ═══
const SHEET_NAME          = 'フォームの回答 1';   // フォーム回答シート名
const APPROVED_SHEET_NAME = '承認済みデータ';
const APPROVED_COL        = 9;     // 集計結果シートの承認列（I列）
const MIN_REPORTS         = 2;
const MIN_MAJORITY        = 0.7;

const COL_PARK_NAME = 2;   // 既定の列（ヘッダー自動検出に失敗した時のフォールバック）
const COL_CATCHBALL = 3;
const COL_NOTES     = 4;
const ANSWER_YES    = 'できる';
const ANSWER_NO     = 'できない';

// ▼ リアルタイム反映・Teams承認 用 ▼
const TEAMS_WEBHOOK_URL = '';            // ← TeamsのIncoming Webhook URL（空なら通知しない）
const APPROVE_TOKEN     = 'spba-park-2026';  // ← 承認リンクの合言葉（任意の文字列に変更可）
const WEBAPP_URL        = 'https://script.google.com/macros/s/AKfycbyBqycA_v8614sI_4vWtqniSlValz6q-3BtfF-5iXyCKTeB3oScXR4RcRNR7ZYbQjFi/exec'; // デプロイ済みウェブアプリ /exec URL

// ═══ WebアプリPOST（ワンタップ投票） ═══
function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.action === 'vote') {
      const name = String(d.name || '').trim();
      if (!name) return _json({ ok: false, error: 'no name' });
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) return _json({ ok: false, error: 'no sheet' });
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const c = detectCols_(headers);
      const row = new Array(Math.max(sheet.getLastColumn(), c.name + 1, c.cb + 1)).fill('');
      row[0] = new Date();
      row[c.name] = name;
      row[c.cb] = (d.vote === 'yes') ? ANSWER_YES : ANSWER_NO;
      if (c.lat >= 0 && d.lat) row[c.lat] = d.lat;
      if (c.lng >= 0 && d.lng) row[c.lng] = d.lng;
      sheet.appendRow(row);
      _publishVoteState(name);   // しきい値を満たせば自動で承認済みデータへ反映
      return _json({ ok: true });
    }
    if (d.action === 'approve') { return _json(approveByName(d.name, d.token)); }
    if (d.action === 'reject') { return _json(rejectSubmission(d.name, d.ts, d.token)); }
    if (d.action === 'rejectPark') { return _json(rejectAllPending_(d.name, d.token)); }
    return _json({ ok: false, error: 'unknown action' });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// 投票しきい値（3票以上＋多数決7割以上）を満たしたら承認済みデータへ自動反映。
// 写真・備考は触らない（＝人の審査が必要な情報は従来どおり承認制）。
function _publishVoteState(name) {
  const live = aggregateLive();
  const p = live[name];
  if (!p) return;
  const decisive = p.yes + p.no;
  const total = p.yes + p.no + p.unknown;
  if (total < 3 || decisive === 0) return;
  const maj = Math.max(p.yes, p.no) / decisive;
  if (maj < 0.7) return;
  const catchball = p.yes >= p.no;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(APPROVED_SHEET_NAME);
  const HEADERS = ['id', 'name', 'address', 'lat', 'lng', 'catchball', 'area', 'toilet', 'parking', 'parkful_url', 'notes', 'reports', 'majority', 'yes_count', 'no_count', 'unknown_count', 'photo'];
  if (!sh) { sh = ss.insertSheet(APPROVED_SHEET_NAME); sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]); }
  const data = sh.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) { if (String(data[i][1]).trim() === name) { rowIdx = i; break; } }
  const majPct = Math.round(maj * 100);
  if (rowIdx >= 0) {
    // 既存行: 判定と票数だけ更新（住所/座標/写真/備考は維持）
    sh.getRange(rowIdx + 1, 6).setValue(catchball);
    sh.getRange(rowIdx + 1, 12, 1, 5).setValues([[total, majPct, p.yes, p.no, p.unknown]]);
  } else {
    // 新規: 座標を確定して追加（写真なし＝審査前）
    let lat = p.lat, lng = p.lng, address = '';
    if (lat >= 35 && lat <= 37 && lng >= 138 && lng <= 141) { address = reverseGeocode_(lat, lng); }
    else { const g = geocodeParkName(name); lat = g.lat; lng = g.lng; address = g.address; }
    const id = 1000 + (data.length - 1);
    sh.appendRow([id, name, address, lat, lng, catchball, '', null, null, '', '', total, majPct, p.yes, p.no, p.unknown, '']);
  }
}

// ═══ WebアプリGET ═══
function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action;

  if (action === 'approve') {
    // Teamsのリンクから押される → 結果を人間向けHTMLで返す
    const r = approveByName(p.name, p.token);
    const html = r.ok
      ? `<div style="font-family:sans-serif;padding:40px;text-align:center"><h2>✅ 「${escapeHtml(r.name)}」を公開しました</h2><p>キャッチボール: <b>${r.catchball === null ? '判定不明' : (r.catchball ? '可' : '不可')}</b> ／ 報告 ${r.reports}件</p><p style="color:#888">マップに反映されます（数分以内）。</p></div>`
      : `<div style="font-family:sans-serif;padding:40px;text-align:center"><h2>⚠️ 承認できませんでした</h2><p>${escapeHtml(r.error || '')}</p></div>`;
    return HtmlService.createHtmlOutput(html);
  }
  if (action === 'reject') {
    const r = rejectSubmission(p.name, p.ts, p.token);
    const html = r.ok
      ? `<div style="font-family:sans-serif;padding:40px;text-align:center"><h2>🚫 報告を却下しました</h2><p style="color:#888">「${escapeHtml(r.name)}」のこの報告1件を集計から除外しました。他に正しい報告があれば公園は残ります。</p></div>`
      : `<div style="font-family:sans-serif;padding:40px;text-align:center"><h2>⚠️ 却下できませんでした</h2><p>${escapeHtml(r.error || '')}</p></div>`;
    return HtmlService.createHtmlOutput(html);
  }
  if (action === 'adminList') {
    if (p.token !== APPROVE_TOKEN) return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'token' })).setMimeType(ContentService.MimeType.JSON);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, items: adminPendingList_() })).setMimeType(ContentService.MimeType.JSON);
  }

  let result;
  if (action === 'live' || action === 'aggregate') {
    result = getLiveParks();         // 公開済＋確認中
  } else {
    result = getApprovedParks();     // 'approved' / デフォルト（従来互換）
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ═══ 公開済みデータを返す（従来どおり）═══
function getApprovedParks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const approvedSheet = ss.getSheetByName(APPROVED_SHEET_NAME);
  if (!approvedSheet) return { parks: [], pending: [], updated: null };
  const data = approvedSheet.getDataRange().getValues();
  if (data.length <= 1) return { parks: [], pending: [], updated: null };
  const parks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    parks.push({
      id: row[0], name: row[1], address: row[2],
      lat: parseFloat(row[3]) || 0, lng: parseFloat(row[4]) || 0,
      catchball: (row[5] === '' || row[5] === null) ? null : (row[5] === true || row[5] === 'TRUE' || row[5] === '可'),
      area: row[6] || '',
      toilet: row[7] === true || row[7] === 'TRUE' ? true : (row[7] === false || row[7] === 'FALSE' ? false : null),
      parking: row[8] === true || row[8] === 'TRUE' ? true : (row[8] === false || row[8] === 'FALSE' ? false : null),
      parkful_url: row[9] || '', notes: row[10] || '',
      reports: parseInt(row[11]) || 0, majority: parseInt(row[12]) || 0,
      yes_count: parseInt(row[13]) || 0, no_count: parseInt(row[14]) || 0, unknown_count: parseInt(row[15]) || 0,
      photo: row[16] || ''
    });
  }
  return { parks, pending: [], updated: new Date().toISOString() };
}

// ═══ 公開済＋確認中(pending) を返す（リアルタイム反映の中核）═══
function getLiveParks() {
  const approvedRes = getApprovedParks();
  const approvedNames = {};
  approvedRes.parks.forEach(p => { approvedNames[String(p.name).trim()] = true; });
  const live = aggregateLive();   // 却下された投稿は既に除外済み
  approvedRes.parks.forEach(function (pk) { const _lv = live[String(pk.name).trim()]; if (_lv && _lv.latestTs) pk.updated = _lv.latestTs; });
  const pending = [];
  for (const name in live) {
    if (approvedNames[name]) continue;        // 公開済はpendingに出さない
    const p = live[name];
    const total = p.yes + p.no + p.unknown;
    if (total <= 0) continue;                 // 全て却下された公園は出さない
    pending.push({
      name, status: 'pending',
      lat: p.lat || 0, lng: p.lng || 0,
      reports: total, yes_count: p.yes, no_count: p.no, unknown_count: p.unknown,
      catchball: null,      // 確認中は判定保留
      updated: p.latestTs
      // notes は審査前のため返さない（不適切表示の防止）
    });
  }
  return { parks: approvedRes.parks, pending, updated: new Date().toISOString() };
}

// ═══ フォーム回答をその場で集計（書き込みなし）═══
function aggregateLive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};
  const c = detectCols_(data[0]);
  const rejected = rejectedRowSet_();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // 却下された投稿（送信時刻msで一意特定）はスキップ
    const _tsv = row[0];
    const _tms = (_tsv instanceof Date) ? _tsv.getTime() : (_tsv ? new Date(_tsv).getTime() : NaN);
    if (!isNaN(_tms) && rejected[String(_tms)]) continue;
    const name = String(row[c.name] || '').trim();
    if (!name) continue;
    const cb = String(row[c.cb] || '').trim();
    const note = String(row[c.note] || '').trim();
    if (!map[name]) map[name] = { name, yes: 0, no: 0, unknown: 0, notes: [], lat: 0, lng: 0, photo: '', latestTs: 0 };
    const _ts = (row[0] instanceof Date) ? row[0].getTime() : (row[0] ? new Date(row[0]).getTime() : 0);
    if (_ts > map[name].latestTs) map[name].latestTs = _ts;
    if (cb.indexOf(ANSWER_YES) >= 0 && cb.indexOf(ANSWER_NO) < 0) map[name].yes++;
    else if (cb.indexOf(ANSWER_NO) >= 0) map[name].no++;
    else map[name].unknown++;
    if (note && note !== 'undefined') map[name].notes.push(note);
    if (c.lat >= 0 && c.lng >= 0) {
      const la = parseFloat(row[c.lat]), ln = parseFloat(row[c.lng]);
      if (la >= 35 && la <= 37 && ln >= 138 && ln <= 141) { map[name].lat = la; map[name].lng = ln; }
    }
    if (c.photo >= 0) { const ph = String(row[c.photo] || '').trim(); if (/^https?:\/\//.test(ph)) map[name].photo = ph; }
  }
  return map;
}

// ヘッダー行から列番号を自動検出（フォームの列順が変わっても動くように）
function detectCols_(headers) {
  const find = (kw, def) => {
    for (let i = 0; i < headers.length; i++) { if (kw.some(k => String(headers[i]).indexOf(k) >= 0)) return i; }
    return def;
  };
  return {
    name: find(['公園名', '名称'], COL_PARK_NAME - 1),
    cb:   find(['キャッチ'], COL_CATCHBALL - 1),
    note: find(['備考', '補足', '気づい'], COL_NOTES - 1),
    lat:  find(['緯度'], -1),
    lng:  find(['経度'], -1),
    photo: find(['写真', 'photo'], -1)
  };
}

// ═══ ワンタップ承認: 指定公園を集計→座標確定→承認済みデータに反映 ═══
function approveByName(name, token) {
  if (token !== APPROVE_TOKEN) return { ok: false, error: '合言葉が違います' };
  name = String(name || '').trim();
  if (!name) return { ok: false, error: '公園名がありません' };
  const live = aggregateLive();
  const p = live[name];
  if (!p) return { ok: false, error: '該当する報告が見つかりません: ' + name };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(APPROVED_SHEET_NAME);
  const HEADERS = ['id', 'name', 'address', 'lat', 'lng', 'catchball', 'area', 'toilet', 'parking', 'parkful_url', 'notes', 'reports', 'majority', 'yes_count', 'no_count', 'unknown_count', 'photo'];
  if (!sh) { sh = ss.insertSheet(APPROVED_SHEET_NAME); sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]); }

  const total = p.yes + p.no + p.unknown;
  const majority = total > 0 ? Math.round(Math.max(p.yes, p.no) / total * 100) : 0;
  const catchball = (p.yes === 0 && p.no === 0) ? null : (p.yes >= p.no);

  // 座標: 提出された緯度経度を優先。無ければ名前でジオコーディング
  let lat = p.lat, lng = p.lng, address = '';
  if (lat >= 35 && lat <= 37 && lng >= 138 && lng <= 141) { address = reverseGeocode_(lat, lng); }
  else { const g = geocodeParkName(name); lat = g.lat; lng = g.lng; address = g.address; }

  const note = p.notes.length ? p.notes[p.notes.length - 1] : '';
  const data = sh.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) { if (String(data[i][1]).trim() === name) { rowIdx = i; break; } }
  const id = rowIdx >= 0 ? data[rowIdx][0] : (1000 + (data.length - 1));
  // 写真は「上書き」ではなく既存の承認済み写真に今回分を追加（重複除去・最新12枚まで保持）
  const existingPhoto = (rowIdx >= 0) ? String(data[rowIdx][16] || '') : '';
  const photoSet = [];
  (existingPhoto + '|' + (p.photo || '')).split('|').forEach(function (s) { const u = s.trim(); if (/^https?:\/\//.test(u) && photoSet.indexOf(u) < 0) photoSet.push(u); });
  const photoStr = photoSet.slice(-12).join('|');
  const rowVals = [id, name, address, lat, lng, catchball, '', null, null, '', note, total, majority, p.yes, p.no, p.unknown, photoStr];
  if (rowIdx >= 0) sh.getRange(rowIdx + 1, 1, 1, HEADERS.length).setValues([rowVals]);
  else sh.appendRow(rowVals);

  return { ok: true, name, catchball, reports: total };
}

// ═══ 却下: その投稿1件だけを集計から除外（行は消さず「却下ログ」へ退避＝非破壊）═══
function rejectSubmission(name, ts, token) {
  if (token !== APPROVE_TOKEN) return { ok: false, error: '合言葉が違います' };
  name = String(name || '').trim();
  ts = String(ts || '').trim();
  if (!ts) return { ok: false, error: '投稿IDがありません（古い通知の可能性）' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let rj = ss.getSheetByName('却下ログ');
  if (!rj) { rj = ss.insertSheet('却下ログ'); rj.getRange(1, 1, 1, 5).setValues([['submissionId', 'name', 'キャッチボール', '備考', 'rejectedAt']]); }
  const d = rj.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) { if (String(d[i][0]) === ts) return { ok: true, name }; }  // 重複は無視
  // 却下した投稿の中身（できた/できない・備考）も記録して、後から判断できるようにする
  let cbVal = '', noteVal = '';
  try {
    const sheet = ss.getSheetByName(SHEET_NAME);
    const sdata = sheet.getDataRange().getValues();
    const c = detectCols_(sdata[0]);
    for (let i = 1; i < sdata.length; i++) {
      const r = sdata[i];
      const t = (r[0] instanceof Date) ? r[0].getTime() : (r[0] ? new Date(r[0]).getTime() : NaN);
      if (String(t) === ts) { cbVal = String(r[c.cb] || ''); noteVal = String(r[c.note] || ''); break; }
    }
  } catch (e) {}
  rj.appendRow([ts, name, cbVal, noteVal, new Date()]);
  return { ok: true, name };
}

// 承認ページ用: 未承認（pending）の報告を、写真・備考・送信ID付きで公園ごとに返す（要token）
function adminPendingList_() {
  const approvedRes = getApprovedParks();
  const approvedNames = {};
  approvedRes.parks.forEach(function (p) { approvedNames[String(p.name).trim()] = true; });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const c = detectCols_(data[0]);
  const rejected = rejectedRowSet_();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const tms = (row[0] instanceof Date) ? row[0].getTime() : (row[0] ? new Date(row[0]).getTime() : NaN);
    if (!isNaN(tms) && rejected[String(tms)]) continue;
    const name = String(row[c.name] || '').trim();
    if (!name || approvedNames[name]) continue;
    if (!map[name]) map[name] = { name: name, yes: 0, no: 0, unknown: 0, notes: [], photos: [], tsList: [], lat: 0, lng: 0 };
    const cb = String(row[c.cb] || '').trim();
    if (cb.indexOf(ANSWER_YES) >= 0 && cb.indexOf(ANSWER_NO) < 0) map[name].yes++;
    else if (cb.indexOf(ANSWER_NO) >= 0) map[name].no++;
    else map[name].unknown++;
    const note = (c.note >= 0) ? String(row[c.note] || '').trim() : '';
    if (note && note !== 'undefined' && map[name].notes.indexOf(note) < 0) map[name].notes.push(note);
    if (c.photo >= 0) { String(row[c.photo] || '').split('|').forEach(function (u) { u = u.trim(); if (/^https?:\/\//.test(u) && map[name].photos.indexOf(u) < 0) map[name].photos.push(u); }); }
    if (!isNaN(tms)) map[name].tsList.push(String(tms));
    if (c.lat >= 0 && c.lng >= 0) { const la = parseFloat(row[c.lat]), ln = parseFloat(row[c.lng]); if (la >= 35 && la <= 37 && ln >= 138 && ln <= 141) { map[name].lat = la; map[name].lng = ln; } }
  }
  return Object.keys(map).map(function (k) { return map[k]; });
}

// 承認ページ用: 指定公園の未承認の報告をすべて却下
function rejectAllPending_(name, token) {
  if (token !== APPROVE_TOKEN) return { ok: false, error: '合言葉が違います' };
  name = String(name || '').trim();
  if (!name) return { ok: false, error: '公園名がありません' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const c = detectCols_(data[0]);
  let n = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[c.name] || '').trim() !== name) continue;
    const tms = (row[0] instanceof Date) ? row[0].getTime() : (row[0] ? new Date(row[0]).getTime() : NaN);
    if (isNaN(tms)) continue;
    const r = rejectSubmission(name, String(tms), token);
    if (r && r.ok) n++;
  }
  return { ok: true, name: name, count: n };
}

// 却下された投稿の送信時刻ms集合
function rejectedRowSet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rj = ss.getSheetByName('却下ログ');
  const set = {};
  if (rj) { const d = rj.getDataRange().getValues(); for (let i = 1; i < d.length; i++) { if (d[i][0] !== '' && d[i][0] != null) set[String(d[i][0])] = true; } }
  return set;
}

// 選択した行の公園を承認して公開（集計結果 or フォームの回答 で行を選んで実行）。プロファイル非依存。
function approveSelected() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  const row = sh.getActiveRange().getRow();
  if (row <= 1) { ui.alert('承認したい公園の行（2行目以降）を選んでから実行してください。'); return; }
  let name = '';
  if (sh.getName() === '集計結果') {
    name = String(sh.getRange(row, 1).getValue() || '').trim();
  } else if (sh.getName() === SHEET_NAME) {
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const c = detectCols_(headers);
    name = String(sh.getRange(row, c.name + 1).getValue() || '').trim();
  } else {
    ui.alert('「集計結果」または「' + SHEET_NAME + '」シートで、公園の行を選んでから実行してください。'); return;
  }
  if (!name) { ui.alert('この行に公園名がありません。'); return; }
  const r = approveByName(name, APPROVE_TOKEN);
  if (r && r.ok) ui.alert('「' + name + '」を公開しました。数分でマップに反映されます。');
  else ui.alert('公開できませんでした：' + ((r && r.error) || '不明') + '\n※「却下ログ」に入っている場合は、先に「却下を取り消す」で戻してください。');
}

// 「フォームの回答 1」で選択した報告（行）を却下（非破壊で却下ログに記録）
function rejectSelectedResponse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  if (sh.getName() !== SHEET_NAME) { ui.alert('「' + SHEET_NAME + '」シートで、却下したい報告の行を選んでから実行してください。'); return; }
  const row = sh.getActiveRange().getRow();
  if (row <= 1) { ui.alert('見出し行ではなく、報告の行（2行目以降）を選んでください。'); return; }
  const tsCell = sh.getRange(row, 1).getValue();
  const ts = (tsCell instanceof Date) ? String(tsCell.getTime()) : '';
  if (!ts) { ui.alert('この行の送信時刻（A列）が読み取れません。'); return; }
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const c = detectCols_(headers);
  const name = String(sh.getRange(row, c.name + 1).getValue() || '').trim();
  const res = ui.alert('この報告を却下しますか？', '「' + name + '」のこの報告1件を集計から除外します（非破壊。あとで「却下を取り消す」で戻せます）。', ui.ButtonSet.OK_CANCEL);
  if (res !== ui.Button.OK) return;
  let rj = ss.getSheetByName('却下ログ');
  if (!rj) { rj = ss.insertSheet('却下ログ'); rj.getRange(1, 1, 1, 5).setValues([['submissionId', 'name', 'キャッチボール', '備考', 'rejectedAt']]); }
  const d = rj.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) { if (String(d[i][0]) === ts) { ui.alert('この報告は既に却下済みです。'); return; } }
  const cbVal = String(sh.getRange(row, c.cb + 1).getValue() || '');
  const noteVal = (c.note >= 0) ? String(sh.getRange(row, c.note + 1).getValue() || '') : '';
  rj.appendRow([ts, name, cbVal, noteVal, new Date()]);
  ui.alert('「' + name + '」の報告を却下しました。次回マップ読み込みで集計から外れます。');
}

// 「却下ログ」で選択した行の却下を取り消す（行を削除→次回読み込みで報告が集計に復活）
function unrejectSelected() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  if (sh.getName() !== '却下ログ') { ui.alert('「却下ログ」シートを開き、取り消したい行を選んでから実行してください。'); return; }
  const row = sh.getActiveRange().getRow();
  if (row <= 1) { ui.alert('見出し行ではなく、却下データの行（2行目以降）を選んでください。'); return; }
  const name = sh.getRange(row, 2).getValue();
  const res = ui.alert('却下を取り消しますか？', '「' + name + '」のこの却下を取り消します。報告は次回マップ読み込みで集計に復活します。', ui.ButtonSet.OK_CANCEL);
  if (res !== ui.Button.OK) return;
  sh.deleteRow(row);
  ui.alert('「' + name + '」の却下を取り消しました。');
}

// ═══ フォーム送信時: Teamsへ通知（承認リンク付き）═══
function onFormSubmit(e) {
  try {
    if (!TEAMS_WEBHOOK_URL) return;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const c = detectCols_(headers);
    const vals = (e && e.values) ? e.values : [];
    const name = String(vals[c.name] || '').trim();
    const cb = String(vals[c.cb] || '').trim();
    const photo = (c.photo >= 0) ? String(vals[c.photo] || '').trim() : '';
    const note = (c.note >= 0) ? String(vals[c.note] || '').trim() : '';
    if (!name) return;
    // この投稿を一意に特定するID（送信時刻ms）。却下を「投稿単位」にするために使う
    let ts = '';
    try {
      const rowNum = (e && e.range) ? e.range.getRow() : sheet.getLastRow();
      const tv = sheet.getRange(rowNum, 1).getValue();
      if (tv instanceof Date) ts = String(tv.getTime());
    } catch (e2) {}
    const base = WEBAPP_URL || ScriptApp.getService().getUrl();
    const approveUrl = base + '?action=approve&token=' + encodeURIComponent(APPROVE_TOKEN) + '&name=' + encodeURIComponent(name);
    const rejectUrl = ts ? (base + '?action=reject&token=' + encodeURIComponent(APPROVE_TOKEN) + '&name=' + encodeURIComponent(name) + '&ts=' + encodeURIComponent(ts)) : '';
    notifyTeams_(name, cb, approveUrl, photo, rejectUrl, note);
  } catch (err) { console.warn('onFormSubmit', err); }
}

function notifyTeams_(name, cb, approveUrl, photo, rejectUrl, note) {
  // Teams「Workflows」(Power Automate)のWebhook向け Adaptiveカード形式
  const body = [
    { type: 'TextBlock', text: '🆕 公園マップに報告が届きました', weight: 'Bolder', size: 'Medium' },
    { type: 'FactSet', facts: [
      { title: '公園名', value: name },
      { title: 'キャッチボール', value: cb || '(未回答)' }
    ] }
  ];
  if (note) body.push({ type: 'TextBlock', text: '📝 備考: ' + note, wrap: true, isSubtle: true, spacing: 'Small' });
  (photo ? String(photo).split('|') : []).map(function (s) { return s.trim(); }).filter(function (u) { return /^https?:\/\//.test(u); }).slice(0, 4).forEach(function (u) {
    body.push({ type: 'Image', url: u, size: 'Large', altText: name + 'の写真' });
  });
  body.push({ type: 'TextBlock', text: '👉 [承認ページを開く](https://map.saitamabaseball.com/shonin.html)', wrap: true, weight: 'Bolder', color: 'Accent', spacing: 'Medium' });
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
function setupTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'onFormSubmit') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('onFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
  SpreadsheetApp.getUi().alert('Teams通知トリガーを設定しました。\nフォーム送信時にTeamsへ承認リンクが届きます。');
}

// ═══ 以下、従来の手動メニュー機能（そのまま利用可）═══
function aggregateReports() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { SpreadsheetApp.getUi().alert(`シート「${SHEET_NAME}」が見つかりません。`); return; }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) { SpreadsheetApp.getUi().alert('回答データがありません。'); return; }
  const c = detectCols_(data[0]);
  const rejected = rejectedRowSet_();
  const parkMap = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const _tms = (row[0] instanceof Date) ? row[0].getTime() : (row[0] ? new Date(row[0]).getTime() : NaN);
    if (!isNaN(_tms) && rejected[String(_tms)]) continue;   // 却下した報告は集計に出さない
    const name = String(row[c.name] || '').trim();
    const catchball = String(row[c.cb] || '').trim();
    const notes = String(row[c.note] || '').trim();
    if (!name) continue;
    if (!parkMap[name]) parkMap[name] = { yes: 0, no: 0, unknown: 0, notes: [] };
    if (catchball.indexOf(ANSWER_YES) >= 0 && catchball.indexOf(ANSWER_NO) < 0) parkMap[name].yes++;
    else if (catchball.indexOf(ANSWER_NO) >= 0) parkMap[name].no++;
    else parkMap[name].unknown++;
    if (notes && notes !== 'undefined') parkMap[name].notes.push(notes);
  }
  let resultSheet = ss.getSheetByName('集計結果');
  if (!resultSheet) resultSheet = ss.insertSheet('集計結果'); else resultSheet.clearContents();
  const headers = ['公園名', 'できる', 'できない', 'わからない', '合計', '確信度', '判定', '備考（最新）', '承認（✓）'];
  resultSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  resultSheet.getRange(1, 9, 1, 1).setBackground('#fff2cc');
  const rows = [];
  for (const [name, counts] of Object.entries(parkMap)) {
    const total = counts.yes + counts.no + counts.unknown;
    const majority = total > 0 ? Math.max(counts.yes, counts.no) / total : 0;
    let confidence, judgment;
    if (counts.yes === 0 && counts.no === 0) { confidence = '低'; judgment = '不明'; }
    else if (total >= MIN_REPORTS && majority >= MIN_MAJORITY) { confidence = '高'; judgment = counts.yes >= counts.no ? '可' : '不可'; }
    else { confidence = '低'; judgment = counts.yes > counts.no ? '可（要確認）' : '不可（要確認）'; }
    const latestNote = counts.notes.length > 0 ? counts.notes[counts.notes.length - 1] : '';
    rows.push([name, counts.yes, counts.no, counts.unknown, total, confidence, judgment, latestNote, '']);
  }
  if (rows.length > 0) {
    resultSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    for (let i = 0; i < rows.length; i++) if (rows[i][5] === '高') resultSheet.getRange(i + 2, 1, 1, 8).setBackground('#e6f4ea');
  }
  SpreadsheetApp.getUi().alert(`集計完了！\n・総報告数: ${data.length - 1}件\n・集計公園数: ${Object.keys(parkMap).length}件\n\nI列に✓→「②承認済みデータを公開」を実行してください。`);
}

function publishApproved() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resultSheet = ss.getSheetByName('集計結果');
  if (!resultSheet) { SpreadsheetApp.getUi().alert('先に「①集計」を実行してください。'); return; }
  const data = resultSheet.getDataRange().getValues();
  const approved = data.slice(1).filter(function (row) {
    const v = String(row[8]).trim().toUpperCase();
    return v && v !== 'FALSE' && v !== '0';
  });
  if (approved.length === 0) { SpreadsheetApp.getUi().alert('承認マークが付いた行がありません。I列に ✓ を入れてください。'); return; }
  let ok = 0; const fails = [];
  approved.forEach(function (row) {
    const r = approveByName(row[0], APPROVE_TOKEN);
    if (r && r.ok) ok++; else fails.push('・' + row[0] + ' … ' + ((r && r.error) || '不明'));
  });
  let msg = '公開できた：' + ok + '件';
  if (fails.length) msg += '\n\n公開できなかった：' + fails.length + '件\n' + fails.join('\n');
  SpreadsheetApp.getUi().alert(msg);
}

function geocodeParkName(name) {
  try {
    const geocoder = Maps.newGeocoder().setLanguage('ja').setRegion('jp');
    const result = geocoder.geocode(name + ' 埼玉県');
    if (result.status === 'OK' && result.results.length > 0) {
      const loc = result.results[0].geometry.location;
      const addr = result.results[0].formatted_address.replace('日本、', '').replace(/〒\d{3}-\d{4} /, '');
      return { lat: loc.lat, lng: loc.lng, address: addr };
    }
  } catch (e) { console.warn('ジオコーディングエラー:', name, e); }
  return { lat: 0, lng: 0, address: '' };
}

function reverseGeocode_(lat, lng) {
  try {
    const r = Maps.newGeocoder().setLanguage('ja').reverseGeocode(lat, lng);
    if (r.status === 'OK' && r.results.length > 0) return r.results[0].formatted_address.replace('日本、', '').replace(/〒\d{3}-\d{4} /, '');
  } catch (e) {}
  return '';
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

function onOpen() {
  SpreadsheetApp.getUi().createMenu('📊 公園マップ管理')
    .addItem('選択した公園を承認（集計結果で行を選んで）', 'approveSelected')
    .addItem('選択した報告を却下（フォームの回答で行を選んで）', 'rejectSelectedResponse')
    .addSeparator()
    .addItem('① 集計する', 'aggregateReports')
    .addItem('② 承認済みデータを公開', 'publishApproved')
    .addSeparator()
    .addItem('③ Teams通知トリガーを設定', 'setupTriggers')
    .addSeparator()
    .addItem('却下を取り消す（却下ログで選択行）', 'unrejectSelected')
    .addToUi();
}
