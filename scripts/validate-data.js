/**
 * データ整合性チェック
 *
 * 使い方:
 *   node scripts/validate-data.js
 *
 * parks-data.js / teams-data.js を読み込み、 以下を検証する:
 *   - id の重複がない（公園）
 *   - 必須フィールドが存在する
 *   - lat/lng が埼玉県の境界内にある
 *   - カテゴリ・性別が定義済みの値である（チーム）
 *
 * エラーがあれば一覧表示して exit code 1 で終了する。
 * リファクタリングやデータ更新後に必ず実行すること。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 埼玉県のおおよその境界（既存実装の GEO_SAITAMA_BOUNDS と同値）
const BOUNDS = { latMin: 35.6, latMax: 36.4, lngMin: 138.8, lngMax: 140.1 };

const errors = [];
const warnings = [];

function loadDataFile(filename, globalName) {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) {
    errors.push(`${filename} が見つかりません`);
    return null;
  }
  const code = fs.readFileSync(filePath, 'utf-8');
  const sandbox = { window: {} };
  try {
    // const/let 宣言・window 代入の両形式に対応
    const fn = new Function('window', code + `\n; return (typeof ${globalName} !== 'undefined') ? ${globalName} : window.${globalName};`);
    return fn(sandbox.window);
  } catch (e) {
    errors.push(`${filename} の構文エラー: ${e.message}`);
    return null;
  }
}

function inBounds(lat, lng) {
  return lat >= BOUNDS.latMin && lat <= BOUNDS.latMax &&
         lng >= BOUNDS.lngMin && lng <= BOUNDS.lngMax;
}

// ─── 公園データ検証 ───
function validateParks() {
  const parks = loadDataFile('parks-data.js', 'parkData');
  if (!parks) return;
  if (!Array.isArray(parks)) { errors.push('parkData が配列ではありません'); return; }

  console.log(`[parks-data.js] ${parks.length} 件`);

  const seenIds = new Set();
  const seenCoords = new Map();

  parks.forEach((p, i) => {
    const label = `parks[${i}] ${p.name || '(名前なし)'}`;
    if (p.id === undefined) errors.push(`${label}: id がありません`);
    else if (seenIds.has(p.id)) errors.push(`${label}: id ${p.id} が重複しています`);
    else seenIds.add(p.id);

    if (!p.name) errors.push(`${label}: name がありません`);
    if (!p.city) warnings.push(`${label}: city がありません`);
    if (p.catchball === undefined) warnings.push(`${label}: catchball が未定義（マップに表示されません）`);

    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') {
      errors.push(`${label}: lat/lng がありません（マップに表示されません）`);
    } else if (!inBounds(p.lat, p.lng)) {
      errors.push(`${label}: 座標が埼玉県の範囲外です (${p.lat}, ${p.lng})`);
    } else {
      const key = `${p.lat},${p.lng}`;
      if (seenCoords.has(key)) {
        warnings.push(`${label}: 座標が「${seenCoords.get(key)}」と完全に重複（マーカーが重なります）`);
      } else {
        seenCoords.set(key, p.name);
      }
    }
  });
}

// ─── チームデータ検証 ───
function validateTeams() {
  const teams = loadDataFile('teams-data.js', 'TEAM_DATA_RAW');
  if (!teams) return;
  if (!Array.isArray(teams)) { errors.push('TEAM_DATA_RAW が配列ではありません'); return; }

  console.log(`[teams-data.js] ${teams.length} 件`);

  const VALID_CAT = new Set(['elem', 'jhs', 'hs', 'univ', 'club', 'independent']);
  // 'both' = 男女両方が在籍する一般チーム（male/female フィルタを両方通過する正当な値）
  const VALID_GENDER = new Set(['male', 'female', 'mixed', 'both']);

  teams.forEach((t, i) => {
    const label = `teams[${i}] ${t.name || '(名前なし)'}`;
    if (!t.name) errors.push(`${label}: name がありません`);
    if (!VALID_CAT.has(t.cat)) errors.push(`${label}: cat が不正です (${t.cat})`);
    if (!VALID_GENDER.has(t.gender)) errors.push(`${label}: gender が不正です (${t.gender})`);
    if (!t.city) warnings.push(`${label}: city がありません`);
    if (typeof t.lat === 'number' && typeof t.lng === 'number') {
      if (!inBounds(t.lat, t.lng)) errors.push(`${label}: 座標が埼玉県の範囲外です (${t.lat}, ${t.lng})`);
    } else {
      warnings.push(`${label}: lat/lng がありません（ピン表示されません）`);
    }
  });
}

// ─── 実行 ───
validateParks();
validateTeams();

console.log('');
if (warnings.length) {
  console.log(`警告 ${warnings.length} 件:`);
  warnings.slice(0, 20).forEach(w => console.log('  [警告] ' + w));
  if (warnings.length > 20) console.log(`  ... 他 ${warnings.length - 20} 件`);
}
if (errors.length) {
  console.log(`エラー ${errors.length} 件:`);
  errors.forEach(e => console.log('  [エラー] ' + e));
  console.log('\n検証失敗。修正してから再実行してください。');
  process.exit(1);
} else {
  console.log(`検証OK（警告 ${warnings.length} 件 / エラー 0 件）`);
}
