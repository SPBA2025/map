/**
 * 重複座標で残っている公園を Nominatim(OSM) で名前検索して座標候補を出す（無料）。
 * - 各公園 "<名前> <市町村> 埼玉県" → "<名前> 埼玉県" の順で検索
 * - 埼玉県内に絞り、Nominatim の住所(city/town/village)と park.city を照合
 * - 候補を _nominatim.json とコンソールに出力（自動では書き換えない）
 * Nominatim 利用規約: 1req/秒・User-Agent必須。実行: node scripts/geocode-nominatim.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SB = { latMin: 35.7, latMax: 36.35, lngMin: 138.7, lngMax: 139.95 };
const inSB = (lat, lng) => lat >= SB.latMin && lat <= SB.latMax && lng >= SB.lngMin && lng <= SB.lngMax;
const UA = { 'User-Agent': 'SaitamaBaseballParkMap/1.0 (info@saitamabaseball.com)' };

async function nomi(q) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=jp&q=' + encodeURIComponent(q);
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(url, { headers: UA }); if (r.ok) return await r.json(); } catch (e) {}
    await sleep(1200);
  }
  return [];
}
const cityOf = a => a ? (a.city || a.town || a.village || a.county || '') : '';

(async () => {
  const parks = eval(fs.readFileSync(path.join(ROOT, 'data', 'parks-data.js'), 'utf8').match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
  const bad = new Set(['36.1314,139.6019', '35.9141,139.5095', '35.9251,139.4858', '36.1389,139.4558', '36.1039,139.5722', '36.0271,139.3638', '36.0622,139.6669', '36.0778,139.7383', '36.076,139.3224']);
  const remain = parks.filter(p => bad.has(p.lat + ',' + p.lng));
  console.log('対象:', remain.length, '件\n');

  const out = [];
  for (const p of remain) {
    let chosen = null;
    for (const q of [`${p.name} ${p.city} 埼玉県`, `${p.name} 埼玉県`]) {
      const res = await nomi(q); await sleep(1200);
      const cands = res.map(r => ({ lat: +r.lat, lng: +r.lon, city: cityOf(r.address), name: r.display_name.split(',')[0], cls: r.category || r.class, type: r.type }))
        .filter(c => inSB(c.lat, c.lng));
      // 市一致を最優先、次に leisure/parkらしさ
      const ranked = cands.sort((a, b) => {
        const am = a.city && (a.city.includes(p.city) || p.city.includes(a.city)) ? 1 : 0;
        const bm = b.city && (b.city.includes(p.city) || p.city.includes(b.city)) ? 1 : 0;
        if (am !== bm) return bm - am;
        const ap = (a.cls === 'leisure' || a.type === 'park') ? 1 : 0;
        const bp = (b.cls === 'leisure' || b.type === 'park') ? 1 : 0;
        return bp - ap;
      });
      if (ranked.length) {
        const top = ranked[0];
        const cityMatch = top.city && (top.city.includes(p.city) || p.city.includes(top.city));
        if (cityMatch) { chosen = { ...top, q }; break; }
        if (!chosen) chosen = { ...top, q, weak: true };
      }
    }
    const status = chosen ? (chosen.weak ? '△市未確認' : '○市一致') : '×なし';
    out.push({ id: p.id, name: p.name, city: p.city, chosen });
    console.log(`${status} id${p.id} ${p.name}（${p.city}）` + (chosen ? ` → ${chosen.lat.toFixed(6)},${chosen.lng.toFixed(6)} [${chosen.city || '?'}] ${chosen.name}` : ''));
  }
  fs.writeFileSync(path.join(ROOT, 'scripts', '_nominatim.json'), JSON.stringify(out, null, 2));
  const ok = out.filter(o => o.chosen && !o.chosen.weak).length, weak = out.filter(o => o.chosen && o.chosen.weak).length;
  console.log(`\n○市一致:${ok} △未確認:${weak} ×なし:${out.length - ok - weak} → scripts/_nominatim.json`);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
