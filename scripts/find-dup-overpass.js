/**
 * 重複座標の公園21件を、OSM Overpass で名前直接検索（leisure=park以外の運動場・緑地・pitchも対象）
 * → 市区町村チェックで絞り、精度の高い候補を出す。自動では書き換えない。
 * 実行: node scripts/find-dup-overpass.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SB = { latMin: 35.7, latMax: 36.35, lngMin: 138.7, lngMax: 139.95 };
const inSB = (lat, lng) => lat >= SB.latMin && lat <= SB.latMax && lng >= SB.lngMin && lng <= SB.lngMax;
const normJP = s => (s || '').normalize('NFKC').replace(/[\s　・･\-‐－—~〜\/／()（）「」『』.,、。]/g, '').replace(/第([0-9])/g, '$1').toLowerCase();

(async () => {
  const parks = eval(fs.readFileSync(path.join(ROOT, 'data', 'parks-data.js'), 'utf8').match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
  const byCoord = {};
  parks.forEach(p => { const k = p.lat + ',' + p.lng; (byCoord[k] = byCoord[k] || []).push(p); });
  const stuck = Object.values(byCoord).filter(v => v.length > 1).flat();

  const muniTxt = await (await fetch('https://maps.gsi.go.jp/js/muni.js')).text();
  const muni = {}; const re = /MUNI_ARRAY\["(11\d{3})"\]\s*=\s*'[^']*?,([^,']+)'/g; let m;
  while ((m = re.exec(muniTxt))) muni[m[1]] = m[2].replace(/　/g, '').trim();

  // Overpass: 全21名をORで一括検索（全地物タイプ）
  const names = stuck.map(p => p.name.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'));
  const q = `[out:json][timeout:90];
area["name"="埼玉県"]["admin_level"="4"]->.s;
nwr["name"~"${names.join('|')}"](area.s);
out center tags;`;
  const eps = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ];
  let data = null;
  for (let a = 0; a < 2 && !data; a++) for (const ep of eps) {
    try {
      process.stdout.write('Overpass ' + ep + ' ... ');
      const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'SaitamaParkMap/1.0 (info@saitamabaseball.com)' }, body: 'data=' + encodeURIComponent(q) });
      if (!res.ok) { console.log('HTTP ' + res.status); await sleep(1500); continue; }
      data = await res.json(); console.log('OK'); break;
    } catch (e) { console.log('NG ' + e.message); await sleep(1500); }
  }
  if (!data) { console.error('Overpass全滅'); process.exit(1); }
  const feats = data.elements.filter(e => e.tags && e.tags.name).map(e => { const c = e.center || e; return { name: e.tags.name, lat: c.lat, lng: c.lon, n: normJP(e.tags.name) }; }).filter(f => f.lat != null && inSB(f.lat, f.lng));
  console.log('OSM候補総数:', feats.length, '\n');

  async function rev(lat, lng) { try { const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`); const d = await r.json(); return d && d.results ? (muni[d.results.muniCd] || '') : ''; } catch (e) { return ''; } }

  const fixes = [];
  for (const p of stuck) {
    const pn = normJP(p.name);
    // 名前一致（双方向 includes、または完全一致）
    let cand = feats.filter(f => f.n === pn || f.n.includes(pn) || pn.includes(f.n));
    // 市チェック
    let chosen = null;
    for (const c of cand) {
      const city = await rev(c.lat, c.lng); await sleep(200);
      const ok = city && (city === p.city || city.startsWith(p.city) || p.city.startsWith(city));
      if (ok) { chosen = { ...c, city }; break; }
    }
    if (chosen) {
      fixes.push({ id: p.id, name: p.name, city: p.city, lat: +chosen.lat.toFixed(6), lng: +chosen.lng.toFixed(6), osmName: chosen.name });
      console.log(`✓ id${p.id} ${p.name} → ${chosen.name} @ ${chosen.lat.toFixed(6)},${chosen.lng.toFixed(6)} (${chosen.city})`);
    } else {
      console.log(`✗ id${p.id} ${p.name} → OSMに精度一致なし`);
    }
  }
  console.log('\nOSMで精度確定:', fixes.length, '/', stuck.length, '件');
  fs.writeFileSync(path.join(ROOT, 'scripts', '_dup-fixes.json'), JSON.stringify(fixes, null, 2));
  console.log('→ scripts/_dup-fixes.json に保存');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
