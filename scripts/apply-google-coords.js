/**
 * Googleマップで確定した18公園の正しい座標を parks-data.js に反映。
 * - 各座標を国土地理院でリバースジオコーディングし、市区町村が park.city と一致するか検証
 * - 一致したものだけ lat/lng＋address を更新（不一致は警告して保留）
 * 実行: node scripts/apply-google-coords.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'parks-data.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const r6 = v => Math.round(v * 1e6) / 1e6;
const SB = { latMin: 35.7, latMax: 36.35, lngMin: 138.7, lngMax: 139.95 };

const FIXES = [
  { id: 24, lat: 35.9356589, lng: 139.5370729, city: '川越市' },   // 入間大橋緑地
  { id: 29, lat: 35.8702794, lng: 139.4991568, city: '川越市' },   // 高階南公共広場
  { id: 31, lat: 35.8738138, lng: 139.4757104, city: '川越市' },   // スポーツパーク福原
  { id: 59, lat: 36.0962384, lng: 139.4853588, city: '行田市' },   // つきみちした公園
  { id: 67, lat: 36.1358116, lng: 139.4791865, city: '行田市' },   // つるまき公園
  { id: 78, lat: 36.0847051, lng: 139.5655948, city: '加須市' },   // ふるさと広場
  { id: 83, lat: 36.1089526, lng: 139.5786488, city: '加須市' },   // 騎西総合公園
  { id: 86, lat: 36.1221841, lng: 139.6379331, city: '加須市' },   // かぞインター公園
  { id: 87, lat: 36.1367026, lng: 139.6010466, city: '加須市' },   // 加須市民運動公園
  { id: 89, lat: 36.1461591, lng: 139.6429942, city: '加須市' },   // 加須北部公園
  { id: 93, lat: 36.1200121, lng: 139.6249921, city: '加須市' },   // 鎮守前公園
  { id: 104, lat: 36.0375672, lng: 139.364725, city: '東松山市' }, // 新郷公園
  { id: 176, lat: 36.0497163, lng: 139.5758465, city: '久喜市' },  // 森下緑地グラウンド
  { id: 181, lat: 36.0667922, lng: 139.5995132, city: '久喜市' },  // あやめ公園
  { id: 200, lat: 36.0852561, lng: 139.743438, city: '幸手市' },   // 上吉羽中央公園
  { id: 201, lat: 36.0859911, lng: 139.7406325, city: '幸手市' },  // 上吉羽西公園
  { id: 224, lat: 36.0771951, lng: 139.313011, city: '嵐山町' },   // 花見台第２公園
  { id: 225, lat: 36.076684, lng: 139.3228687, city: '嵐山町' },   // 花見台第１公園
];

(async () => {
  let content = fs.readFileSync(DATA, 'utf8');
  const muniTxt = await (await fetch('https://maps.gsi.go.jp/js/muni.js')).text();
  const muni = {}; const re = /MUNI_ARRAY\["(11\d{3})"\]\s*=\s*'[^']*?,([^,']+)'/g; let m;
  while ((m = re.exec(muniTxt))) muni[m[1]] = m[2].replace(/　/g, '').trim();
  async function rev(lat, lng) { for (let i = 0; i < 2; i++) { try { const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`); const d = await r.json(); if (d && d.results) return d.results; } catch (e) {} await sleep(400); } return null; }

  let lines = content.split('\n');
  const ok = [], warn = [];
  for (const f of FIXES) {
    const lat = r6(f.lat), lng = r6(f.lng);
    if (lat < SB.latMin || lat > SB.latMax || lng < SB.lngMin || lng > SB.lngMax) { warn.push(`id${f.id} 県外座標`); continue; }
    const res = await rev(lat, lng); await sleep(250);
    const muniName = res ? (muni[res.muniCd] || '') : '';
    // さいたま市は区が付くが今回は対象外。市名の前方一致で判定
    const base = muniName.replace(/(市|町|村).*$/, m2 => m2[0]); // 市/町/村 までに丸める
    const cityMatch = muniName && (muniName === f.city || muniName.startsWith(f.city) || f.city.startsWith(muniName.replace(/[区].*$/, '')));
    const addr = res && res.lv01Nm ? muniName + res.lv01Nm : '';
    if (!cityMatch) { warn.push(`id${f.id} 市不一致: 期待${f.city} / 実${muniName} (${lat},${lng}) → 保留`); continue; }
    let hit = 0;
    lines = lines.map(line => {
      if (!new RegExp('\\bid:' + f.id + ',').test(line)) return line;
      hit++;
      let l = line.replace(/lat:[-\d.]+/, 'lat:' + lat).replace(/lng:[-\d.]+/, 'lng:' + lng);
      if (addr) l = /address:'[^']*'/.test(l) ? l.replace(/address:'[^']*'/, `address:'${addr}'`) : l.replace(/(lng:[-\d.]+)(\s*})/, `$1, address:'${addr}'$2`);
      return l;
    });
    if (hit === 1) ok.push({ id: f.id, lat, lng, addr });
    else warn.push(`id${f.id} 該当${hit}行`);
  }
  content = lines.join('\n');
  const parks = eval(content.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
  if (parks.length !== 230) { console.error('件数異常', parks.length); process.exit(1); }
  fs.writeFileSync(DATA, content, 'utf8');

  console.log('反映:', ok.length, '件');
  ok.forEach(a => { const p = parks.find(x => x.id === a.id); console.log(`  id${a.id} ${p.name} → ${a.lat},${a.lng} (${a.addr})`); });
  if (warn.length) { console.log('\n要確認:', warn.length, '件'); warn.forEach(w => console.log('  ' + w)); }

  // 重複が解消されたか
  const byc = {}; parks.forEach(p => { const k = p.lat + ',' + p.lng; (byc[k] = byc[k] || []).push(p.id); });
  const dups = Object.values(byc).filter(v => v.length > 1);
  console.log('\n残り重複座標グループ:', dups.length);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
