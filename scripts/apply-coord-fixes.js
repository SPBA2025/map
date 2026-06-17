/**
 * 公園座標の手動修正を parks-data.js に反映（id指定のピンポイント置換）
 * ワークシート（公園座標修正ワークシート.csv）でユーザーが調べた正しい座標を適用する。
 * 既存の行構造・コメントは保持し、該当idの lat/lng（必要なら name）だけを書き換える。
 *
 * 実行: node scripts/apply-coord-fixes.js
 */
const fs = require('fs');
const path = require('path');
const DATA = path.resolve(__dirname, '..', 'data', 'parks-data.js');
const SB = { latMin: 35.6, latMax: 36.4, lngMin: 138.8, lngMax: 140.1 };
const r6 = v => Math.round(v * 1e6) / 1e6;

const fixes = [
  { id: 180, lat: 36.05604127, lng: 139.6032756 },
  { id: 35,  lat: 36.13161144, lng: 139.3807699 },
  { id: 38,  lat: 36.17635291, lng: 139.3425963 },
  { id: 62,  lat: 36.13108323, lng: 139.433007 },
  { id: 46,  lat: 36.14455939, lng: 139.3727331, name: '伊勢町ふれあい公園' },
  { id: 227, lat: 36.0180211,  lng: 139.4661377, name: '吉見南部緑地河川敷グラウンド' },
  { id: 63,  lat: 36.13693841, lng: 139.4635158 },
  { id: 76,  lat: 35.83256196, lng: 139.341492 },
  { id: 77,  lat: 35.8344502,  lng: 139.3413467 },
  { id: 228, lat: 36.01871393, lng: 139.4882485 },
  { id: 21,  lat: 35.90692112, lng: 139.4343643 },
  { id: 41,  lat: 36.12545127, lng: 139.4009106 },
  { id: 136, lat: 36.17749372, lng: 139.2703729 },
  { id: 138, lat: 36.22252773, lng: 139.2762994 },
  { id: 135, lat: 36.12378199, lng: 139.3011827 },
  { id: 139, lat: 36.1357437,  lng: 139.2269157 },
  { id: 144, lat: 36.12018558, lng: 139.2206497 },
  { id: 79,  lat: 36.0902866,  lng: 139.5822218 },
  { id: 137, lat: 36.18218173, lng: 139.2964416 },
  { id: 140, lat: 36.18002784, lng: 139.3085585 },
  { id: 141, lat: 36.1877253,  lng: 139.3000748 },
  { id: 143, lat: 36.1958557,  lng: 139.2991367 },
  { id: 142, lat: 36.18869002, lng: 139.3139695 },
  { id: 208, lat: 35.90039426, lng: 139.3815332 },
  { id: 27,  lat: 35.94337526, lng: 139.4665798 },
];

let content = fs.readFileSync(DATA, 'utf8');
let lines = content.split('\n');
const applied = [];
const errors = [];

for (const f of fixes) {
  const nlat = r6(f.lat), nlng = r6(f.lng);
  if (nlat < SB.latMin || nlat > SB.latMax || nlng < SB.lngMin || nlng > SB.lngMax) {
    errors.push(`id${f.id}: 新座標が埼玉県範囲外 (${nlat},${nlng})`); continue;
  }
  let hit = 0;
  lines = lines.map(line => {
    if (!new RegExp('\\bid:' + f.id + ',').test(line)) return line;
    hit++;
    let l = line.replace(/lat:[-\d.]+/, 'lat:' + nlat).replace(/lng:[-\d.]+/, 'lng:' + nlng);
    if (f.name) l = l.replace(/name:'[^']*'/, "name:'" + f.name + "'");
    return l;
  });
  if (hit === 1) applied.push(f.id);
  else errors.push(`id${f.id}: 該当行 ${hit} 件（1でない）`);
}

if (errors.length) { console.error('中断 — エラー:\n' + errors.join('\n')); process.exit(1); }

const out = lines.join('\n');
// 整合性チェック: eval して件数・更新内容を検証
const arr = eval(out.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
console.log('parkData 件数:', arr.length, '（変化なしのはず）');
for (const f of fixes) {
  const p = arr.find(x => x.id === f.id);
  console.log(`id${f.id} ${p.name} → ${p.lat},${p.lng}${f.name ? ' [改称]' : ''}`);
}
fs.writeFileSync(DATA, out, 'utf8');
console.log('\n適用:', applied.length, '件 → data/parks-data.js に書き込み完了');
