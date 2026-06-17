/**
 * 公園データの座標 × 市町村表記 整合チェック（読み取り専用・データ変更なし）
 *
 * 各公園の lat/lng が「表記された市町村の中心」からどれだけ離れているかを測り、
 * 大きくズレている＝座標が誤っている可能性が高い公園を洗い出す。
 * 市町村の中心座標は parks.html の市町村セレクタ <option value="lat,lng,zoom"> から取得。
 *
 * 実行: node scripts/check-coord-city.js [閾値km(既定12)]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const THRESHOLD = Number(process.argv[2]) || 12; // km

// 1) 市町村中心座標を parks.html から抽出
const html = fs.readFileSync(path.join(ROOT, 'parks.html'), 'utf8');
const center = {};
const re = /<option value="([\d.]+),([\d.]+),\d+"[^>]*>([^<]+)<\/option>/g;
let m;
while ((m = re.exec(html))) {
  const lat = +m[1], lng = +m[2];
  const label = m[3].replace(/（.*?）/g, '').trim(); // 「さいたま市（全域）」→「さいたま市」
  if (!center[label]) center[label] = [lat, lng];
}

// 2) parkData 読み込み
const src = fs.readFileSync(path.join(ROOT, 'data', 'parks-data.js'), 'utf8');
const parkData = eval(src.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);

// 3) ハバーサイン距離(km)
function hav(a, b) {
  const R = 6371, toR = x => x * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function nearestCity(p) {
  let best = null, bd = 1e9;
  for (const [c, xy] of Object.entries(center)) {
    const d = hav([p.lat, p.lng], xy);
    if (d < bd) { bd = d; best = c; }
  }
  return [best, bd];
}

// 4) 照合
const flagged = [];
let noCenter = 0;
for (const p of parkData) {
  let key = (p.city || '').startsWith('さいたま市') ? 'さいたま市' : p.city;
  const c = center[key];
  if (!c) { noCenter++; continue; }
  const d = hav([p.lat, p.lng], c);
  if (d > THRESHOLD) {
    const [nc, nd] = nearestCity(p);
    flagged.push({ id: p.id, name: p.name, city: p.city, d: Math.round(d), near: nc, nd: Math.round(nd), lat: p.lat, lng: p.lng });
  }
}
flagged.sort((a, b) => b.d - a.d);

console.log(`市町村中心の取得数: ${Object.keys(center).length} / 中心不明でスキップ: ${noCenter}`);
console.log(`表記市町村の中心から ${THRESHOLD}km 超ズレ: ${flagged.length} 件\n`);
for (const f of flagged) {
  console.log(`id${f.id} ${f.name}（表記:${f.city}）→ 表記中心から ${f.d}km ／ 最寄り中心=${f.near}(${f.nd}km)  [${f.lat},${f.lng}]`);
}
