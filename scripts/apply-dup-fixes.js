/**
 * 重複座標の修正:
 *  - OSMで精度一致した3件を parks-data.js に反映（lat/lng＋住所を再取得）
 *  - 残りの重複公園は「Googleマップで調べる用」ワークシートCSVを出力（人の確認用）
 * 実行: node scripts/apply-dup-fixes.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'parks-data.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const r6 = v => Math.round(v * 1e6) / 1e6;

// OSMで精度一致・市一致を確認済みの確実な修正
const FIXES = [
  { id: 18, lat: 35.895704, lng: 139.501314 }, // 高階運動広場（川越市）OSM一致
  { id: 99, lat: 36.028109, lng: 139.364168 }, // 唐子中央公園（東松山市）OSM一致
  { id: 81, lat: 36.103838, lng: 139.582557 }, // 騎西城山公園（加須市）OSM「城山公園」一致
];

(async () => {
  let content = fs.readFileSync(DATA, 'utf8');
  // GSI muni 表
  const muniTxt = await (await fetch('https://maps.gsi.go.jp/js/muni.js')).text();
  const muni = {}; const re = /MUNI_ARRAY\["(11\d{3})"\]\s*=\s*'[^']*?,([^,']+)'/g; let m;
  while ((m = re.exec(muniTxt))) muni[m[1]] = m[2].replace(/　/g, '').trim();
  async function addrOf(lat, lng) {
    try { const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`); const d = await r.json(); const x = d && d.results; return x && x.muniCd && x.lv01Nm ? (muni[x.muniCd] || '') + x.lv01Nm : ''; } catch (e) { return ''; }
  }

  // 1) 確実3件を反映
  let lines = content.split('\n');
  const applied = [];
  for (const f of FIXES) {
    const lat = r6(f.lat), lng = r6(f.lng);
    const addr = await addrOf(lat, lng); await sleep(250);
    let hit = 0;
    lines = lines.map(line => {
      if (!new RegExp('\\bid:' + f.id + ',').test(line)) return line;
      hit++;
      let l = line.replace(/lat:[-\d.]+/, 'lat:' + lat).replace(/lng:[-\d.]+/, 'lng:' + lng);
      if (addr) { l = /address:'[^']*'/.test(l) ? l.replace(/address:'[^']*'/, `address:'${addr}'`) : l.replace(/(lng:[-\d.]+)(\s*})/, `$1, address:'${addr}'$2`); }
      return l;
    });
    if (hit === 1) applied.push({ id: f.id, lat, lng, addr });
    else console.log(`!! id${f.id} 該当${hit}行（1でない）`);
  }
  content = lines.join('\n');
  // 整合性チェック
  const parks = eval(content.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
  if (parks.length !== 230) { console.error('件数異常', parks.length); process.exit(1); }
  fs.writeFileSync(DATA, content, 'utf8');
  console.log('反映:', applied.length, '件');
  applied.forEach(a => { const p = parks.find(x => x.id === a.id); console.log(`  id${a.id} ${p.name} → ${a.lat},${a.lng} (${a.addr})`); });

  // 2) 残りの重複公園 → ワークシート
  const byCoord = {};
  parks.forEach(p => { const k = p.lat + ',' + p.lng; (byCoord[k] = byCoord[k] || []).push(p); });
  const remain = Object.values(byCoord).filter(v => v.length > 1).flat();
  const header = 'id,公園名,市町村,現在の座標,Googleマップで開く,正しいlat,正しいlng\n';
  const csv = header + remain.map(p => {
    const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.name + ' ' + p.city + ' 埼玉県');
    return [p.id, p.name, p.city, `${p.lat}/${p.lng}`, url, '', ''].join(',');
  }).join('\n');
  const out = '﻿' + csv;
  const dests = [
    path.join(process.env.USERPROFILE || 'C:/Users/k.iwama', 'OneDrive - 株式会社西武ライオンズ', 'デスクトップ', '公園重複座標ワークシート.csv'),
    path.join(process.env.USERPROFILE || 'C:/Users/k.iwama', 'Desktop', '公園重複座標ワークシート.csv'),
  ];
  for (const d of dests) { try { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, out, 'utf8'); console.log('ワークシート:', d); } catch (e) {} }
  console.log('\n残り要手動:', remain.length, '件（ワークシートに記入 → apply で反映）');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
