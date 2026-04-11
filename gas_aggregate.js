/**
 * 埼玉県公園マップ 集計・WebアプリAPI
 *
 * 【セットアップ】
 * 1. スプレッドシート → 拡張機能 → Apps Script
 * 2. このコードを貼り付けて保存
 * 3. 「デプロイ」→「新しいデプロイ」
 * 4. 種類：ウェブアプリ
 *    実行ユーザー：自分
 *    アクセスできるユーザー：全員
 * 5. デプロイ → 表示されたURLをparks.htmlのGAS_URLに貼り付け
 */

// ═══ 設定 ═══
const SHEET_NAME    = 'フォームの回答 1';
const APPROVED_COL  = 9;   // 承認列（I列）に ✓ を入れると公開
const MIN_REPORTS   = 2;
const MIN_MAJORITY  = 0.7;

const COL_PARK_NAME = 2;
const COL_CATCHBALL = 3;
const COL_NOTES     = 4;
const ANSWER_YES    = 'できる';
const ANSWER_NO     = 'できない';

// ═══ WebアプリのGETエンドポイント ═══
// parks.html から fetch() で呼ばれる
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  let result;
  if (action === 'approved') {
    result = getApprovedParks();
  } else if (action === 'aggregate') {
    result = getAggregatedParks();
  } else {
    result = getApprovedParks(); // デフォルト
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══ 承認済みデータを返す（parks.htmlが使用）═══
function getApprovedParks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 承認済みシートがあればそこから返す
  const approvedSheet = ss.getSheetByName('承認済みデータ');
  if (!approvedSheet) return { parks: [], updated: null };

  const data = approvedSheet.getDataRange().getValues();
  if (data.length <= 1) return { parks: [], updated: null };

  const parks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    parks.push({
      id:        row[0],
      name:      row[1],
      address:   row[2],
      lat:       parseFloat(row[3]) || 0,
      lng:       parseFloat(row[4]) || 0,
      catchball: (row[5] === '' || row[5] === null) ? null : (row[5] === true || row[5] === 'TRUE' || row[5] === '可'),
      area:      row[6] || '',
      toilet:    row[7] === true || row[7] === 'TRUE' ? true : (row[7] === false || row[7] === 'FALSE' ? false : null),
      parking:   row[8] === true || row[8] === 'TRUE' ? true : (row[8] === false || row[8] === 'FALSE' ? false : null),
      parkful_url: row[9] || '',
      notes:     row[10] || '',
      reports:   parseInt(row[11]) || 0,
      majority:  parseInt(row[12]) || 0,
      yes_count: parseInt(row[13]) || 0,
      no_count:  parseInt(row[14]) || 0,
      unknown_count: parseInt(row[15]) || 0
    });
  }

  return {
    parks,
    updated: new Date().toISOString()
  };
}

// ═══ 集計してスプレッドシートに書き込む ═══
function aggregateReports() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`シート「${SHEET_NAME}」が見つかりません。`);
    return;
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('回答データがありません。');
    return;
  }

  // 公園ごとに集計
  const parkMap = {};
  for (let i = 1; i < data.length; i++) {
    const row       = data[i];
    const name      = String(row[COL_PARK_NAME - 1]).trim();
    const catchball = String(row[COL_CATCHBALL - 1]).trim();
    const notes     = String(row[COL_NOTES - 1]).trim();
    if (!name) continue;
    if (!parkMap[name]) parkMap[name] = { yes: 0, no: 0, unknown: 0, notes: [] };
    if (catchball === ANSWER_YES)     parkMap[name].yes++;
    else if (catchball === ANSWER_NO) parkMap[name].no++;
    else                              parkMap[name].unknown++;
    if (notes && notes !== 'undefined') parkMap[name].notes.push(notes);
  }

  // 集計結果シート更新
  let resultSheet = ss.getSheetByName('集計結果');
  if (!resultSheet) resultSheet = ss.insertSheet('集計結果');
  else resultSheet.clearContents();

  const headers = ['公園名', 'できる', 'できない', 'わからない', '合計', '確信度', '判定', '備考（最新）', '承認（✓）'];
  resultSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  resultSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  resultSheet.getRange(1, 9, 1, 1).setBackground('#fff2cc'); // 承認列を黄色に

  const rows = [];
  let nextId = 1000;

  for (const [name, counts] of Object.entries(parkMap)) {
    const total    = counts.yes + counts.no + counts.unknown;
    const maxVote  = Math.max(counts.yes, counts.no);
    const majority = total > 0 ? maxVote / total : 0;

    let confidence, judgment;
    if (counts.yes === 0 && counts.no === 0) {
      confidence = '低';
      judgment   = '不明';
    } else if (total >= MIN_REPORTS && majority >= MIN_MAJORITY) {
      confidence = '高';
      judgment   = counts.yes >= counts.no ? '可' : '不可';
    } else {
      confidence = '低';
      judgment   = counts.yes > counts.no ? '可（要確認）' : '不可（要確認）';
    }

    const latestNote = counts.notes.length > 0 ? counts.notes[counts.notes.length - 1] : '';
    rows.push([name, counts.yes, counts.no, counts.unknown, total, confidence, judgment, latestNote, '']);
    nextId++;
  }

  if (rows.length > 0) {
    resultSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    // 確信度「高」を緑色に
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][5] === '高') {
        resultSheet.getRange(i + 2, 1, 1, 8).setBackground('#e6f4ea');
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    `集計完了！\n` +
    `・総報告数: ${data.length - 1}件\n` +
    `・集計公園数: ${Object.keys(parkMap).length}件\n\n` +
    `「集計結果」シートの承認列（I列）に ✓ を入力し、\n` +
    `「承認済みデータを公開」を実行してください。`
  );
}

// ═══ 承認済みデータをシートに書き込む ═══
function publishApproved() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resultSheet = ss.getSheetByName('集計結果');
  if (!resultSheet) {
    SpreadsheetApp.getUi().alert('先に「集計」を実行してください。');
    return;
  }

  const data = resultSheet.getDataRange().getValues();
  const approved = data.slice(1).filter(row => String(row[8]).trim() === '✓');

  if (approved.length === 0) {
    SpreadsheetApp.getUi().alert('承認済みデータがありません。\nI列に ✓ を入力してください。');
    return;
  }

  // 承認済みデータシート
  let approvedSheet = ss.getSheetByName('承認済みデータ');
  if (!approvedSheet) approvedSheet = ss.insertSheet('承認済みデータ');
  else approvedSheet.clearContents();

  const headers = ['id', 'name', 'address', 'lat', 'lng', 'catchball', 'area', 'toilet', 'parking', 'parkful_url', 'notes', 'reports', 'majority', 'yes_count', 'no_count', 'unknown_count'];
  approvedSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  approvedSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

  let idCounter = 1000;
  const rows = [];
  for (const row of approved) {
    const name      = row[0];
    const yes       = parseInt(row[1]) || 0;
    const no        = parseInt(row[2]) || 0;
    const unknown   = parseInt(row[3]) || 0;
    const total     = parseInt(row[4]) || 0;
    const judgment  = String(row[6]);
    const notes     = row[7] || '';
    const majority  = total > 0 ? Math.round(Math.max(yes, no) / total * 100) : 0;
    const catchball = judgment === '不明' ? null : judgment.startsWith('可');

    // 座標を自動取得
    const geo = geocodeParkName(name);

    rows.push([
      idCounter++, name, geo.address, geo.lat, geo.lng,
      catchball, '', null, null, '', notes, total, majority, yes, no, unknown
    ]);
  }

  if (rows.length === 0) {
    SpreadsheetApp.getUi().alert('公開できるデータがありませんでした。');
    return;
  }

  approvedSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  SpreadsheetApp.getUi().alert(
    `✅ ${rows.length}件を公開しました！\nマップに即時反映されます。`
  );
}

// ═══ 座標自動取得 ═══
function geocodeParkName(name) {
  try {
    const geocoder = Maps.newGeocoder().setLanguage('ja').setRegion('jp');
    const result   = geocoder.geocode(name + ' 埼玉県');
    if (result.status === 'OK' && result.results.length > 0) {
      const loc  = result.results[0].geometry.location;
      const addr = result.results[0].formatted_address
        .replace('日本、', '').replace(/〒\d{3}-\d{4} /, '');
      return { lat: loc.lat, lng: loc.lng, address: addr };
    }
  } catch(e) {
    console.warn('ジオコーディングエラー:', name, e);
  }
  return { lat: 0, lng: 0, address: '' };
}

// ═══ メニュー ═══
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 公園マップ管理')
    .addItem('① 集計する', 'aggregateReports')
    .addSeparator()
    .addItem('② 承認済みデータを公開', 'publishApproved')
    .addToUi();
}
