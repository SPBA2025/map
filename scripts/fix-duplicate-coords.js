/**
 * 重複座標（フォールバック地点に固まっている）公園の正しい座標を探す（無料）
 *
 * 1) parks-data.js から「同一座標が2件以上」の公園を抽出
 * 2) 各公園の正しい座標候補を次の2系統から取得:
 *    a) OSM未登録データ(parks-osm.js)の名前一致（正規化して双方向 includes）
 *    b) 国土地理院 住所検索 (AddressSearch) で「市町村+公園名」
 * 3) 各候補を地理院リバースジオコーディングで市区町村チェック → park.city と一致するものだけ採用
 * 4) 候補をワークシートCSV（OneデスクトップとDesktop両方）＋コンソールに出力
 *    ※自動では parks-data.js を書き換えない（誤り再発防止のため人の確認を挟む）
 *
 * 実行: node scripts/fix-duplicate-coords.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SB = { latMin: 35.7, latMax: 36.35, lngMin: 138.7, lngMax: 139.95 };
const inSB = (lat, lng) => lat >= SB.latMin && lat <= SB.latMax && lng >= SB.lngMin && lng <= SB.lngMax;

const normJP = s => (s || '').normalize('NFKC').replace(/[\s　・･\-‐－—~〜\/／()（）「」『』.,、。第]/g, '').toLowerCase();

async function gsiReverse(lat, lng) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`);
      if (r.ok) { const d = await r.json(); if (d && d.results) return d.results; }
    } catch (e) {}
    await sleep(400);
  }
  return null;
}
async function gsiSearch(q) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`);
      if (r.ok) { const d = await r.json(); if (Array.isArray(d)) return d; }
    } catch (e) {}
    await sleep(400);
  }
  return [];
}

(async () => {
  const parks = eval(fs.readFileSync(path.join(ROOT, 'data', 'parks-data.js'), 'utf8').match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
  const osm = eval(fs.readFileSync(path.join(ROOT, 'data', 'parks-osm.js'), 'utf8').replace('const parkOsmData', 'global.__osm') + '; global.__osm');
  const muniTxt = await (await fetch('https://maps.gsi.go.jp/js/muni.js')).text();
  const muni = {}; const re = /MUNI_ARRAY\["(11\d{3})"\]\s*=\s*'[^']*?,([^,']+)'/g; let m;
  while ((m = re.exec(muniTxt))) muni[m[1]] = m[2].replace(/　/g, '').trim();
  const cityOf = res => res && res.muniCd ? (muni[res.muniCd] || '') : '';

  // 重複座標グループ
  const byCoord = {};
  parks.forEach(p => { const k = p.lat + ',' + p.lng; (byCoord[k] = byCoord[k] || []).push(p); });
  const stuck = Object.values(byCoord).filter(v => v.length > 1).flat();
  console.log('重複座標の公園:', stuck.length, '件 を調査\n');

  // OSM名前インデックス
  const osmNorm = osm.map(o => ({ ...o, n: normJP(o.name) }));

  const rows = [];
  for (const p of stuck) {
    const pn = normJP(p.name);
    const cands = [];

    // a) OSM名前一致（双方向 includes、3文字以上）
    if (pn.length >= 3) {
      for (const o of osmNorm) {
        if (o.n.length >= 3 && (o.n.includes(pn) || pn.includes(o.n))) {
          if (inSB(o.lat, o.lng)) cands.push({ src: 'OSM', name: o.name, lat: o.lat, lng: o.lng });
        }
      }
    }
    // b) 地理院住所検索
    for (const q of [p.city + p.name, p.name]) {
      const res = await gsiSearch(q); await sleep(250);
      for (const f of res.slice(0, 3)) {
        const c = f.geometry && f.geometry.coordinates;
        if (c && inSB(c[1], c[0])) cands.push({ src: 'GSI', name: (f.properties && f.properties.title) || q, lat: c[1], lng: c[0] });
      }
    }

    // 候補を市区町村チェックして採点
    let best = null;
    const seen = new Set();
    for (const c of cands) {
      const key = c.lat.toFixed(4) + ',' + c.lng.toFixed(4);
      if (seen.has(key)) continue; seen.add(key);
      const rev = await gsiReverse(c.lat, c.lng); await sleep(250);
      const city = cityOf(rev);
      const cityMatch = city && (city === p.city || city.replace(/[市町村区].*$/, '') === p.city.replace(/[市町村区].*$/, '') || city.startsWith(p.city) || p.city.startsWith(city));
      const score = (c.src === 'OSM' ? 2 : 0) + (cityMatch ? 3 : 0);
      const cand = { ...c, city, cityMatch, score };
      if (!best || score > best.score) best = cand;
    }

    const verdict = best && best.cityMatch ? (best.score >= 5 ? '高' : '中') : '要手動';
    rows.push({ p, best, verdict });
    console.log(`id${p.id} ${p.name}（${p.city}）[${verdict}]`);
    if (best) console.log(`   候補(${best.src}): ${best.name} @ ${best.lat.toFixed(6)},${best.lng.toFixed(6)} → ${best.city}${best.cityMatch ? ' ✓市一致' : ' ✗市違い'}`);
    else console.log('   候補なし');
  }

  // ワークシートCSV
  const header = 'id,公園名,市町村,現在の誤座標,候補ソース,候補座標lat,候補座標lng,候補の市,自動判定,採用する正しいlat,採用する正しいlng\n';
  const csv = header + rows.map(({ p, best, verdict }) =>
    [p.id, p.name, p.city, `${p.lat}/${p.lng}`, best ? best.src : '', best ? best.lat.toFixed(6) : '', best ? best.lng.toFixed(6) : '',
     best ? best.city : '', verdict, best && best.cityMatch ? best.lat.toFixed(6) : '', best && best.cityMatch ? best.lng.toFixed(6) : ''
    ].join(',')).join('\n');
  const csvBom = '﻿' + csv;
  const dests = [
    path.join(process.env.USERPROFILE || 'C:/Users/k.iwama', 'OneDrive - 株式会社西武ライオンズ', 'デスクトップ', '公園重複座標ワークシート.csv'),
    path.join(process.env.USERPROFILE || 'C:/Users/k.iwama', 'Desktop', '公園重複座標ワークシート.csv'),
  ];
  for (const d of dests) { try { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, csvBom, 'utf8'); console.log('\nCSV出力:', d); } catch (e) { console.log('CSV出力失敗:', d, e.message); } }

  const hi = rows.filter(r => r.verdict === '高').length, mid = rows.filter(r => r.verdict === '中').length, man = rows.filter(r => r.verdict === '要手動').length;
  console.log(`\n判定サマリー → 高:${hi} 中:${mid} 要手動:${man}`);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
