/**
 * 公園データ一括ジオコーディング
 *
 * parks-data.js の lat/lng なしの公園を、
 * 無料 API（Nominatim / 国土地理院）でジオコーディングして
 * parks-data.js に座標を埋め込む。
 *
 * 実行: node scripts/geocode-parks.js
 *
 * 使用 API（両方無料）:
 *   1. OpenStreetMap Nominatim (1req/秒制限あり)
 *   2. 国土地理院 Address Search (制限なし)
 *
 * 完了後は parks.html で Places API を使わずに全公園を表示可能。
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '..', 'parks-data.js');
const SAITAMA_BOUNDS = { latMin: 35.6, latMax: 36.4, lngMin: 138.8, lngMax: 140.1 };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=jp`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SaitamaBaseballParkMap/1.0 (info@saitamabaseball.com)' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), source: 'OSM' };
    }
  } catch (e) {
    // 無視
  }
  return null;
}

async function geocodeGSI(query) {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].geometry && data[0].geometry.coordinates) {
      const [lng, lat] = data[0].geometry.coordinates;
      return { lat: parseFloat(lat), lng: parseFloat(lng), source: 'GSI' };
    }
  } catch (e) {
    // 無視
  }
  return null;
}

function inSaitama(lat, lng) {
  return lat >= SAITAMA_BOUNDS.latMin && lat <= SAITAMA_BOUNDS.latMax
      && lng >= SAITAMA_BOUNDS.lngMin && lng <= SAITAMA_BOUNDS.lngMax;
}

async function geocode(name, city) {
  // 複数クエリパターン × 複数 API
  const queries = [
    `${name} ${city} 埼玉県`,
    `${city} ${name}`,
    `${name} 埼玉県`,
  ];

  // Nominatim を試す（公園名検索が得意）
  for (const q of queries) {
    const r = await geocodeNominatim(q);
    await sleep(1100); // Nominatim 1req/秒制限
    if (r && inSaitama(r.lat, r.lng)) return r;
  }

  // 国土地理院（住所ベース、 制限なし）
  for (const q of queries) {
    const r = await geocodeGSI(q);
    await sleep(150);
    if (r && inSaitama(r.lat, r.lng)) return r;
  }

  return null;
}

async function main() {
  // parks-data.js 読み込み
  const content = fs.readFileSync(DATA_PATH, 'utf-8');
  const arrMatch = content.match(/const parkData = (\[[\s\S]*?\n\];)/);
  if (!arrMatch) {
    console.error('parkData 配列が見つかりません');
    process.exit(1);
  }
  const parkData = eval(arrMatch[1]);
  const targets = parkData.filter(p => !p.lat && p.catchball !== undefined);
  console.log(`対象: ${targets.length}件 / 全${parkData.length}件\n`);

  // ジオコーディング実行
  let success = 0, failed = 0;
  const failedList = [];
  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const tag = `[${(i + 1).toString().padStart(3, ' ')}/${targets.length}]`;
    process.stdout.write(`${tag} ${p.name} (${p.city}) ... `);
    const result = await geocode(p.name, p.city);
    if (result) {
      p._lat = Math.round(result.lat * 10000) / 10000;
      p._lng = Math.round(result.lng * 10000) / 10000;
      p._source = result.source;
      success++;
      console.log(`OK ${p._lat},${p._lng} (${result.source})`);
    } else {
      failed++;
      failedList.push(`${p.name}（${p.city}）`);
      console.log(`FAIL`);
    }
  }
  console.log(`\n=== 結果 ===`);
  console.log(`成功: ${success} / 失敗: ${failed}`);
  if (failedList.length > 0) {
    console.log(`\n失敗一覧（${failedList.length}件）:`);
    failedList.forEach(n => console.log(`  - ${n}`));
  }

  // parks-data.js に座標を埋め込み
  let updated = content;
  let inserted = 0;
  for (const p of targets) {
    if (p._lat && p._lng) {
      // 「{ id:N, ... },」の形を検出して、 lat: lng: を末尾に挿入
      const idPattern = new RegExp(
        `(\\{\\s*id:${p.id}\\b[^}]*?)(\\s*\\}\\s*,?)`,
        'm'
      );
      const m = idPattern.exec(updated);
      if (m && !m[1].includes('lat:')) {
        updated = updated.replace(idPattern, `$1, lat:${p._lat}, lng:${p._lng}$2`);
        inserted++;
      }
    }
  }
  fs.writeFileSync(DATA_PATH, updated);
  console.log(`\nparks-data.js を更新: ${inserted}件 lat/lng 挿入`);
}

main().catch(e => { console.error(e); process.exit(1); });
