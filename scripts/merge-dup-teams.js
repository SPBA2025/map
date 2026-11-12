/**
 * merge-dup-teams.js — 少年野球チームの重複登録を1行にまとめる
 *
 * teams-data.js には、同じ小学生チームが
 *   「埼玉県スポーツ少年団野球部会」と「埼玉県野球連盟（学童）」の両方に登録されているため
 * 2行入っているケースがある（例: BATOS浦和野球部 ×2、本太ビクターズ と 本太ビクターズスポーツ少年団）。
 * チームマップの一覧・件数・検索で同じチームが2回出るので、1行に統合する。
 *
 * 同一チームの判定（build-teams-lite.js と同じ名前の正規化を使う）:
 *  - どちらも cat:'elem'、同じ市区町村
 *  - 正規化した名前が同一 または 一方が他方を含む（3文字以上）
 *  - 片方が スポーツ少年団野球部会、もう片方が 野球連盟（学童）
 *  - EXCLUDE に挙げた組は別チームとして統合しない
 *
 * 統合のしかた:
 *  - 名前はスポーツ少年団側（多くは「○○スポーツ少年団」の正式名。学童側には「西原フレンズフレンズ」のような誤記がある）
 *  - 所属（league）は両方を「／」でつなぐ
 *  - 人数（male/female/total）と性別（gender）は、選手数（total）が多いほうの行の値
 *  - そのほかの項目（活動場所・HP・SNS・座標など）はスポーツ少年団側の値。'-' や空なら、学童側の値で補う
 *  - ただし活動場所は、スポーツ少年団側が球場（例: 島小タイガースの「県営大宮球場」）や
 *    3チーム以上で同じ場所（例: 春日部市の8チームが「粕壁小学校」）のときは学童側を採る
 *
 * 使い方: node scripts/merge-dup-teams.js          … 統合する組を表示するだけ（書き換えない）
 *         node scripts/merge-dup-teams.js --write  … data/teams-data.js を書き換える
 * 書き換えたら node scripts/build-teams-lite.js と node scripts/validate-data.js を実行する。
 * 統合済みの行は所属が「／」つなぎになるので、再実行しても二重に統合されない。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'data', 'teams-data.js');
const WRITE = process.argv.includes('--write');

const LG_SPS = '埼玉県スポーツ少年団野球部会';
const LG_GAKUDO = '埼玉県野球連盟（学童）';

// 名前は似ているが別チームとみる組（市区町村|名前A|名前B）
const EXCLUDE = [
  'さいたま市浦和区|さくらそう|さくらそう浦和ガールズ',        // どちらも学童で、活動場所も別
  '東松山市|東松山ベースボールクラブ|東松山野球スポーツ少年団', // 正規化で「東松山」だけが残って一致してしまう。活動場所も別
];

// ── build-teams-lite.js と同じ名前の正規化 ──
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

// ── teams-data.js を1行1チームとして読む ──
const src = fs.readFileSync(FILE, 'utf-8');
const EOL = src.includes('\r\n') ? '\r\n' : '\n';   // 作業コピーの改行コード（autocrlf）を保つ
const lines = src.split(/\r?\n/);
const rowLines = [];   // { idx: 行番号, t: オブジェクト }
lines.forEach((line, idx) => {
  const m = line.match(/^\s*(\{name:.*\}),?\s*$/);
  if (!m) return;
  rowLines.push({ idx, t: new Function('return (' + m[1] + ');')() });
});
const all = new Function('window', src + '\n;return window.TEAM_DATA_RAW;')({});
if (all.length !== rowLines.length) {
  throw new Error(`1行1チームの前提が崩れています（配列 ${all.length}件 / 行 ${rowLines.length}件）`);
}

// ── 同一チームの組を探す ──
const isExcluded = (city, a, b) =>
  EXCLUDE.includes(`${city}|${a}|${b}`) || EXCLUDE.includes(`${city}|${b}|${a}`);
const sps = rowLines.filter(r => r.t.cat === 'elem' && r.t.league === LG_SPS);
const gak = rowLines.filter(r => r.t.cat === 'elem' && r.t.league === LG_GAKUDO);
const pairs = [];
const usedG = new Set();
for (const s of sps) {
  const ks = normName(s.t.name);
  const hits = gak.filter(g => !usedG.has(g.idx) && g.t.city === s.t.city &&
    sameTeam(ks, normName(g.t.name)) && !isExcluded(s.t.city, s.t.name, g.t.name));
  if (!hits.length) continue;
  if (hits.length > 1) {
    console.warn(`候補が複数あるため統合しません: ${s.t.city} ${s.t.name} ⇔ ${hits.map(h => h.t.name).join(' / ')}`);
    continue;
  }
  usedG.add(hits[0].idx);
  pairs.push([s, hits[0]]);
}

// ── 統合 ──
const empty = v => v === undefined || v === null || v === '' || v === '-';
const placeCount = {};
all.forEach(t => { if (!empty(t.place)) placeCount[t.place] = (placeCount[t.place] || 0) + 1; });
function merge(s, g) {
  const base = s.t, other = g.t;
  const cnt = (+g.t.total || 0) > (+s.t.total || 0) ? g.t : s.t;
  const out = {};
  for (const k of Object.keys(base)) out[k] = empty(base[k]) && !empty(other[k]) ? other[k] : base[k];
  for (const k of Object.keys(other)) if (!(k in out)) out[k] = other[k];
  out.name = base.name;
  out.league = `${LG_SPS}／${LG_GAKUDO}`;
  out.gender = cnt.gender; out.male = cnt.male; out.female = cnt.female; out.total = cnt.total;
  // 活動場所: スポーツ少年団側が球場、または3チーム以上で同じ場所（事務局の所在地とみられる）のときは学童側を採る
  if (!empty(other.place) && other.place !== base.place &&
      (/球場/.test(base.place) || (placeCount[base.place] || 0) >= 3)) {
    out.place = other.place;
  }
  return out;
}
function ser(o) {
  return '{' + Object.entries(o).map(([k, v]) =>
    typeof v === 'number' ? `${k}:${v}` : `${k}:'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  ).join(',') + '}';
}

const replace = new Map();   // 行番号 → 新しい行（null は削除）
for (const [s, g] of pairs) {
  const m = merge(s, g);
  const keepIdx = Math.min(s.idx, g.idx), dropIdx = Math.max(s.idx, g.idx);
  const indent = lines[keepIdx].match(/^\s*/)[0];
  replace.set(keepIdx, `${indent}${ser(m)},`);
  replace.set(dropIdx, null);
  console.log(`${s.t.city}\t${s.t.name}(${s.t.total}) + ${g.t.name}(${g.t.total}) → ${m.name}(${m.total}) 活動場所:${m.place}`);
}
console.log(`統合する組: ${pairs.length} / ${all.length}件 → ${all.length - pairs.length}件`);

if (!WRITE) { console.log('（表示のみ。書き換えるには --write）'); process.exit(0); }

let outLines = lines.map((l, i) => (replace.has(i) ? replace.get(i) : l)).filter(l => l !== null);
// 配列の最後の要素の末尾カンマを元の書式（なし）にそろえる
const lastRow = outLines.map((l, i) => (/^\s*\{name:/.test(l) ? i : -1)).filter(i => i >= 0).pop();
outLines[lastRow] = outLines[lastRow].replace(/,\s*$/, '');
let out = outLines.join(EOL);
out = out.replace(/^( \* - )\d+件$/m, `$1${all.length - pairs.length}件（スポーツ少年団と学童の重複登録 ${pairs.length}組を統合済み）`);
const check = new Function('window', out + '\n;return window.TEAM_DATA_RAW;')({});
if (check.length !== all.length - pairs.length) throw new Error('書き換え後の件数が合いません');
fs.writeFileSync(FILE, out);
console.log(`data/teams-data.js を書き換えました: ${check.length}件`);
