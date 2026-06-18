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
      yes_count: parseInt(row[13]) || 0, no_count: parseInt(row[14]) || 0, unknown_count: parseInt(row[15]) || 0
    });
  }
  return { parks, pending: [], updated: new Date().toISOString() };
}

// ═══ 公開済＋確認中(pending) を返す（リアルタイム反映の中核）═══
function getLiveParks() {
  const approvedRes = getApprovedParks();
  const approvedNames = {};
  approvedRes.parks.forEach(p => { approvedNames[String(p.name).trim()] = true; });
  const live = aggregateLive();
  const pending = [];
  for (const name in live) {
    if (approvedNames[name]) continue;        // 公開済はpendingに出さない
    const p = live[name];
    const total = p.yes + p.no + p.unknown;
    pending.push({
      name, status: 'pending',
      lat: p.lat || 0, lng: p.lng || 0,
      reports: total, yes_count: p.yes, no_count: p.no, unknown_count: p.unknown,
      catchball: null      // 確認中は判定保留
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
  const map = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = String(row[c.name] || '').trim();
    if (!name) continue;
    const cb = String(row[c.cb] || '').trim();
    const note = String(row[c.note] || '').trim();
    if (!map[name]) map[name] = { name, yes: 0, no: 0, unknown: 0, notes: [], lat: 0, lng: 0 };
    if (cb.indexOf(ANSWER_YES) >= 0 && cb.indexOf(ANSWER_NO) < 0) map[name].yes++;
    else if (cb.indexOf(ANSWER_NO) >= 0) map[name].no++;
    else map[name].unknown++;
    if (note && note !== 'undefined') map[name].notes.push(note);
    if (c.lat >= 0 && c.lng >= 0) {
      const la = parseFloat(row[c.lat]), ln = parseFloat(row[c.lng]);
      if (la >= 35 && la <= 37 && ln >= 138 && ln <= 141) { map[name].lat = la; map[name].lng = ln; }
    }
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
    lng:  find(['経度'], -1)
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
  const HEADERS = ['id', 'name', 'address', 'lat', 'lng', 'catchball', 'area', 'toilet', 'parking', 'parkful_url', 'notes', 'reports', 'majority', 'yes_count', 'no_count', 'unknown_count'];
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
  const rowVals = [id, name, address, lat, lng, catchball, '', null, null, '', note, total, majority, p.yes, p.no, p.unknown];
  if (rowIdx >= 0) sh.getRange(rowIdx + 1, 1, 1, HEADERS.length).setValues([rowVals]);
  else sh.appendRow(rowVals);

  return { ok: true, name, catchball, reports: total };
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
    if (!name) return;
    const base = WEBAPP_URL || ScriptApp.getService().getUrl();
    const approveUrl = base + '?action=approve&token=' + encodeURIComponent(APPROVE_TOKEN) + '&name=' + encodeURIComponent(name);
    notifyTeams_(name, cb, approveUrl);
  } catch (err) { console.warn('onFormSubmit', err); }
}

function notifyTeams_(name, cb, approveUrl) {
  // Teams「Workflows」(Power Automate)のWebhook向け Adaptiveカード形式
  const payload = {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard',
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.4',
        body: [
          { type: 'TextBlock', text: '🆕 公園マップに報告が届きました', weight: 'Bolder', size: 'Medium' },
          { type: 'FactSet', facts: [
            { title: '公園名', value: name },
            { title: 'キャッチボール', value: cb || '(未回答)' }
          ] }
        ],
        actions: [{ type: 'Action.OpenUrl', title: '✅ 承認して公開', url: approveUrl }]
      }
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
  const parkMap = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
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
  const approved = data.slice(1).filter(row => String(row[8]).trim() === '✓');
  if (approved.length === 0) { SpreadsheetApp.getUi().alert('承認済みデータがありません。I列に✓を入力してください。'); return; }
  approved.forEach(row => approveByName(row[0], APPROVE_TOKEN));
  SpreadsheetApp.getUi().alert(`✅ ${approved.length}件を公開しました！マップに反映されます。`);
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
    .addItem('① 集計する', 'aggregateReports')
    .addItem('② 承認済みデータを公開', 'publishApproved')
    .addSeparator()
    .addItem('③ Teams通知トリガーを設定', 'setupTriggers')
    .addToUi();
}
