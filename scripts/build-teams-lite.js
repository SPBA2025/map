/**
 * build-teams-lite.js — 公園マップ用の軽量チームデータ生成
 *
 * teams-data.js(578KB) を parks.html に読ませずに「公園の近くの少年野球チーム」を
 * 表示するため、実グラウンド座標を持つ少年野球(elem)チームだけを抽出した
 * data/teams-lite.js を生成する。
 *
 * 座標の由来: js/team-map.js 内の PLACE_COORDS（活動場所名→グラウンド座標テーブル）。
 * teams-data.js の lat/lng は市区町村代表点のため使わない（PLACE_COORDS一致分のみ採用）。
 *
 * 除外・統合（「近くのチーム」として誤案内しないため）:
 *  - 活動場所名に「○○市立/町立/村立」があり、チームの市町村と食い違う行は除外
 *    （teams-data.js の活動場所が名前の一部一致で別市の学校に紐づいている行があるため）
 *  - 同じ座標または同じ市区町村で、名前が同一・包含関係の行は同一チームの重複登録として1件に統合
 *    （連盟とスポーツ少年団の両方に「○○」「○○スポーツ少年団」で登録されているケース）
 *
 * 使い方: node scripts/build-teams-lite.js
 * （teams-data.js または team-map.js の PLACE_COORDS を更新したら再実行してコミット）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// 埼玉県のおおよその境界（scripts/validate-data.js の BOUNDS と同値）
const BOUNDS = { latMin: 35.6, latMax: 36.4, lngMin: 138.8, lngMax: 140.1 };

// ── teams-data.js を読み込み（validate-data.js と同じサンドボックス方式） ──
function loadDataFile(filename, globalName) {
  const code = fs.readFileSync(path.join(ROOT, filename), 'utf-8');
  const fn = new Function('window', code + `\n; return (typeof ${globalName} !== 'undefined') ? ${globalName} : window.${globalName};`);
  return fn({});
}

// ── team-map.js から PLACE_COORDS を抽出（Object.assign(PLACE_COORDS, {...}) は1箇所のみ） ──
function loadPlaceCoords() {
  const src = fs.readFileSync(path.join(ROOT, 'js/team-map.js'), 'utf-8');
  const m = src.match(/Object\.assign\(PLACE_COORDS,\s*(\{[\s\S]*?\})\);/);
  if (!m) throw new Error('PLACE_COORDS が team-map.js から抽出できません（書式変更?）');
  return new Function('return (' + m[1] + ');')();
}

// さいたま市の区は市単位にそろえる
const muniOf = city => String(city || '').replace(/^(さいたま市).*$/, '$1');

// 活動場所名から設置自治体を取り出す（「戸田市立喜沢小学校」→「戸田市」。なければ null）
function placeMuni(place) {
  const m = String(place || '').match(/^(.+?[市町村])立/);
  return m ? m[1] : null;
}

// 名前の比較用正規化（全角半角・小書きカナ・キリル文字の見た目同字・団体種別の語尾を吸収）
const SMALL_KANA = { 'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ', 'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ッ': 'ツ' };
const CYRILLIC = { 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'У': 'Y' };
function normName(name) {
  return String(name).normalize('NFKC')
    .replace(/[ァィゥェォャュョッ]/g, c => SMALL_KANA[c])
    .replace(/[АВЕКМНОРСТХУ]/g, c => CYRILLIC[c])
    .replace(/(野球スポーツ少年団|スポーツ少年団|少年野球クラブ|少年野球部|少年野球団|少年団|野球部|野球クラブ|ベースボールクラブ|[\s　])/g, '')
    .toUpperCase();
}
function sameTeam(a, b) {
  if (a === b) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  return s.length >= 3 && l.includes(s);
}

const teams = loadDataFile('data/teams-data.js', 'TEAM_DATA_RAW');
const placeCoords = loadPlaceCoords();
console.log(`teams-data: ${teams.length}件 / PLACE_COORDS: ${Object.keys(placeCoords).length}件`);

// ── 抽出: 少年野球(elem) かつ 活動場所の実座標を持ち、設置自治体が食い違わないチーム ──
const candidates = [];
let skippedMismatch = 0;
for (const t of teams) {
  if (t.cat !== 'elem') continue;
  if (!t.place || t.place === '-') continue;
  const pc = placeCoords[t.place];   // 値は [lat, lng] の配列形式
  if (!pc) continue;
  const pm = placeMuni(t.place);
  if (pm && pm !== muniOf(t.city)) { skippedMismatch++; continue; }
  const lat = Math.round(pc[0] * 1e5) / 1e5;
  const lng = Math.round(pc[1] * 1e5) / 1e5;
  if (isNaN(lat) || isNaN(lng)) continue;
  if (lat < BOUNDS.latMin || lat > BOUNDS.latMax || lng < BOUNDS.lngMin || lng > BOUNDS.lngMax) {
    console.warn(`県外座標をスキップ: ${t.name} (${lat},${lng})`);
    continue;
  }
  const g = t.gender === 'female' ? 'f' : t.gender === 'mixed' ? 'x' : '';
  const b = String(t.ball || '').indexOf('硬') >= 0 ? 'h' : 'n';
  candidates.push({ row: [t.name, t.city, lat, lng, t.place, g, b], key: normName(t.name), ll: lat + ',' + lng });
}

// ── 重複登録の統合: 同じ座標 or 同じ市区町村 ＋ 名前が同一・包含 → 長い（正式な）名前の行を残す ──
const kept = [];
let merged = 0;
for (const c of candidates) {
  const dup = kept.find(k => (k.ll === c.ll || k.row[1] === c.row[1]) && sameTeam(k.key, c.key));
  if (!dup) { kept.push(c); continue; }
  merged++;
  if (c.row[0].length > dup.row[0].length) { dup.row = c.row; dup.key = c.key; dup.ll = c.ll; }
}
const rows = kept.map(k => k.row);
console.log(`自治体食い違いで除外: ${skippedMismatch}件 / 重複登録を統合: ${merged}件`);

// ── 検証 ──
if (rows.length < 350) {
  console.error(`件数が少なすぎます: ${rows.length}件（350件以上を想定）`);
  process.exit(1);
}

// ── 出力 ──
const today = new Date().toISOString().slice(0, 10);
const body = rows.map(r => JSON.stringify(r)).join(',\n');
const out = `/**
 * teams-lite.js — 公園マップ用の軽量チームデータ（自動生成・手編集しない）
 * 生成: ${today} / ${rows.length}件（少年野球のうち実グラウンド座標を持つチーム。自治体食い違い除外・重複統合済み）
 * 再生成: node scripts/build-teams-lite.js
 * 形式: [チーム名, 市区町村, lat, lng, 活動場所, 性別(''=男子・共通/'f'=女子/'x'=混合), ボール('n'=軟式/'h'=硬式)]
 */
window.TEAMS_LITE = [
${body}
];
`;
fs.writeFileSync(path.join(ROOT, 'data/teams-lite.js'), out);
const kb = (Buffer.byteLength(out, 'utf-8') / 1024).toFixed(1);
console.log(`data/teams-lite.js を生成: ${rows.length}件 / ${kb}KB`);
