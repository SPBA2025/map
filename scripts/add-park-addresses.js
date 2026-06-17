/**
 * 公園に住所を付与（リバースジオコーディング・無料/国土地理院）
 *
 * 1) GSI 自治体コード表から埼玉県(11xxx)の muniCd→名称マップを生成 → data/saitama-muni.js
 *    （さいたま市は「さいたま市南区」等、区まで含む。全角スペースは除去）
 * 2) 登録済み parks-data.js の各公園を座標からリバースジオコーディングし、
 *    住所 = 市区町村名 + 大字/丁目(lv01Nm) を address として埋め込む
 *
 * グレー(未登録)公園はブラウザ側でタップ時に取得（このスクリプトは登録済みのみ）。
 * 実行: node scripts/add-park-addresses.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  // 1) GSI muni 表
  const muniRes = await fetch('https://maps.gsi.go.jp/js/muni.js');
  const muniTxt = await muniRes.text();
  const muni = {};
  const re = /MUNI_ARRAY\["(11\d{3})"\]\s*=\s*'[^']*?,([^,']+)'/g;
  let m;
  while ((m = re.exec(muniTxt))) { muni[m[1]] = m[2].replace(/　/g, '').trim(); }
  console.log('埼玉の自治体コード:', Object.keys(muni).length, '件');
  fs.writeFileSync(path.join(ROOT, 'data', 'saitama-muni.js'),
    '/* 埼玉県の自治体コード→名称（さいたま市は区まで）。国土地理院 muni.js 由来。住所表示用 */\n' +
    'window.SAITAMA_MUNI = ' + JSON.stringify(muni) + ';\n', 'utf8');

  // 2) 登録済み公園を読み込み
  const DATA = path.join(ROOT, 'data', 'parks-data.js');
  let content = fs.readFileSync(DATA, 'utf8');
  const parks = eval(content.match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]);

  async function rev(lat, lng) {
    for (let i = 0; i < 2; i++) {
      try {
        const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`);
        if (!r.ok) { await sleep(500); continue; }
        const d = await r.json();
        if (d && d.results) return d.results;
      } catch (e) { await sleep(500); }
    }
    return null;
  }

  let ok = 0, fail = 0;
  const addrById = {};
  for (let i = 0; i < parks.length; i++) {
    const p = parks[i];
    if (!p.lat || !p.lng) { fail++; continue; }
    const res = await rev(p.lat, p.lng);
    await sleep(250);
    if (res && res.muniCd && res.lv01Nm) {
      const muniName = muni[res.muniCd] || p.city || '';
      const addr = muniName + res.lv01Nm;
      addrById[p.id] = addr;
      ok++;
      if (ok % 40 === 0) console.log(`  ...${ok}/${parks.length}`);
    } else { fail++; }
  }
  console.log(`リバースジオコーディング 成功:${ok} / 失敗:${fail}`);

  // 3) parks-data.js に address を行単位で追記（id一致行の lng:... } の直前に挿入）
  let lines = content.split('\n');
  let applied = 0;
  lines = lines.map(line => {
    const idm = line.match(/\bid:(\d+),/);
    if (!idm) return line;
    const id = +idm[1];
    if (!addrById[id]) return line;
    if (/address:/.test(line)) {
      return line.replace(/address:'[^']*'/, `address:'${addrById[id]}'`);
    }
    // lng:数値 の直後（閉じ } の前）に , address:'...' を挿入
    const nl = line.replace(/(lng:[-\d.]+)(\s*})/, `$1, address:'${addrById[id]}'$2`);
    if (nl !== line) applied++;
    return nl;
  });
  fs.writeFileSync(DATA, lines.join('\n'), 'utf8');
  console.log(`address 付与: ${applied}件 → parks-data.js 更新`);
  // サンプル
  const sample = eval(fs.readFileSync(DATA, 'utf8').match(/const parkData\s*=\s*(\[[\s\S]*?\n\]);/)[1]).slice(0, 5);
  sample.forEach(p => console.log(`  ${p.name}（${p.city}）→ ${p.address || '(なし)'}`));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
