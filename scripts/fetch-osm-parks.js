/**
 * OpenStreetMap から埼玉県内の公園を一括取得し、未登録公園データを生成（一度きり・無料）
 *
 * - leisure=park（名前付き）を Overpass API で取得
 * - 既存 parks-data.js（登録済み230件）と重複する近接公園は除外（150m以内）
 * - OSM内の近接重複も除外（25m以内）
 * - data/parks-osm.js に「未登録（情報未収集）」公園として書き出す
 *
 * 出典: © OpenStreetMap contributors (ODbL)。実行: node scripts/fetch-osm-parks.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'parks-osm.js');
const r6 = v => Math.round(v * 1e6) / 1e6;

function hav(a, b) {
  const R = 6371000, toR = x => x * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s)); // meters
}

(async () => {
  // 1) Overpass 取得
  const q = `[out:json][timeout:120];
area["name"="埼玉県"]["admin_level"="4"]->.s;
( way["leisure"="park"]["name"](area.s);
  relation["leisure"="park"]["name"](area.s); );
out center tags;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let data = null;
  outer:
  for (let attempt = 0; attempt < 2 && !data; attempt++) {
    for (const ep of endpoints) {
      try {
        process.stdout.write(`取得試行: ${ep} ... `);
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'SaitamaBaseballParkMap/1.0 (info@saitamabaseball.com)' },
          body: 'data=' + encodeURIComponent(q),
        });
        if (!res.ok) { console.log('HTTP ' + res.status); await sleep(2000); continue; }
        data = await res.json();
        console.log('OK');
        break outer;
      } catch (e) { console.log('NG ' + e.message); await sleep(2000); }
    }
  }
  if (!data) { console.error('全エンドポイントで取得失敗'); process.exit(1); }
  let osm = data.elements
    .filter(e => e.tags && e.tags.name && (e.center || (e.lat != null)))
    .map(e => { const c = e.center || e; return { name: e.tags.name.trim(), lat: r6(+c.lat), lng: r6(+c.lon) }; });
  console.log('OSM取得:', osm.length, '件');

  // 2) 既存登録済み(parks-data.js)を読み込み
  const src = fs.readFileSync(path.join(ROOT, 'data', 'parks-data.js'), 'utf8');
  const registered = eval(src.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
  console.log('登録済み:', registered.length, '件');

  // 3) 登録済みと近接(150m以内)するOSM公園を除外
  let removedReg = 0;
  osm = osm.filter(p => {
    const dup = registered.some(r => r.lat && r.lng && hav([p.lat, p.lng], [r.lat, r.lng]) < 150);
    if (dup) removedReg++;
    return !dup;
  });
  console.log('登録済みと重複で除外:', removedReg, '件');

  // 4) OSM内の近接重複(25m以内)を除外
  const kept = [];
  let removedSelf = 0;
  for (const p of osm) {
    if (kept.some(k => hav([p.lat, p.lng], [k.lat, k.lng]) < 25)) { removedSelf++; continue; }
    kept.push(p);
  }
  console.log('OSM内重複で除外:', removedSelf, '件');
  console.log('最終 未登録公園:', kept.length, '件');

  // 5) 書き出し（コンパクト：1行1件）
  const header = `/**
 * 埼玉県内の未登録（情報未収集）公園データ — OpenStreetMap 由来
 * © OpenStreetMap contributors (ODbL)。scripts/fetch-osm-parks.js で生成。
 * 登録済み(parks-data.js)と重複する近接公園は除外済み。
 * 公園マップでグレーの「情報未登録」ピンとして表示し、タップで報告フォームへ。
 */
const parkOsmData = [
`;
  const body = kept.map(p => `  { name:${JSON.stringify(p.name)}, lat:${p.lat}, lng:${p.lng} }`).join(',\n');
  fs.writeFileSync(OUT, header + body + '\n];\n', 'utf8');
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log('\n出力:', OUT, `(${kb}KB)`);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
