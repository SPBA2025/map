/**
 * 公園座標の修正ワークシートCSVを生成（読み取り専用・データ変更なし）
 *
 * check-coord-city.js と同じ判定で、表記市町村の中心から閾値km超ズレた公園を抽出し、
 * 〈公園名・市・現在の誤座標・Googleマップ検索リンク・正しい座標の記入欄〉のCSVを
 * デスクトップに出力する（UTF-8 BOM付き＝Excelで文字化けしない）。
 *
 * 実行: node scripts/make-coord-worksheet.js [閾値km(既定12)]
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const THRESHOLD = Number(process.argv[2]) || 12;
// 実デスクトップを検出（このPCは OneDrive リダイレクトのため C:\Users\..\Desktop は表示されない）
function desktopDir() {
  const home = os.homedir();
  const cands = [
    path.join(home, 'OneDrive - 株式会社西武ライオンズ', 'デスクトップ'),
    path.join(home, 'OneDrive', 'デスクトップ'),
    path.join(home, 'OneDrive', 'Desktop'),
    path.join(home, 'Desktop'),
  ];
  for (const d of cands) { try { if (fs.statSync(d).isDirectory()) return d; } catch (e) {} }
  return path.join(home, 'Desktop');
}
const OUT = path.join(desktopDir(), '公園座標修正ワークシート.csv');

const html = fs.readFileSync(path.join(ROOT, 'parks.html'), 'utf8');
const center = {};
const re = /<option value="([\d.]+),([\d.]+),\d+"[^>]*>([^<]+)<\/option>/g;
let m;
while ((m = re.exec(html))) {
  const label = m[3].replace(/（.*?）/g, '').trim();
  if (!center[label]) center[label] = [+m[1], +m[2]];
}
const src = fs.readFileSync(path.join(ROOT, 'data', 'parks-data.js'), 'utf8');
const parkData = eval(src.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);

function hav(a, b) {
  const R = 6371, toR = x => x * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function nearestCity(p) {
  let best = null, bd = 1e9;
  for (const [c, xy] of Object.entries(center)) { const d = hav([p.lat, p.lng], xy); if (d < bd) { bd = d; best = c; } }
  return [best, Math.round(bd)];
}

const rows = [];
for (const p of parkData) {
  const key = (p.city || '').startsWith('さいたま市') ? 'さいたま市' : p.city;
  const c = center[key];
  if (!c) continue;
  const d = hav([p.lat, p.lng], c);
  if (d > THRESHOLD) {
    const [nc, nd] = nearestCity(p);
    const q = encodeURIComponent(`${p.name} ${p.city} 埼玉県`);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    rows.push({ id: p.id, name: p.name, city: p.city, lat: p.lat, lng: p.lng, near: `${nc}(${nd}km)`, d: Math.round(d), url });
  }
}
rows.sort((a, b) => b.d - a.d);

function esc(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
const header = ['id', '公園名', '表記の市', '現在の緯度(誤)', '現在の経度(誤)', 'ピンの実際の地域', 'ズレkm', 'Googleマップで場所を確認', '正しい緯度【記入】', '正しい経度【記入】', '備考【記入：座標修正/市名も誤り/削除候補 等】'];
const lines = [header.map(esc).join(',')];
for (const r of rows) lines.push([r.id, r.name, r.city, r.lat, r.lng, r.near, r.d, r.url, '', '', ''].map(esc).join(','));

fs.writeFileSync(OUT, '﻿' + lines.join('\r\n'), 'utf8');
console.log(`出力: ${OUT}`);
console.log(`対象: ${rows.length} 件（${THRESHOLD}km超ズレ）`);
