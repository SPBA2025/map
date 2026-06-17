// 公園マップ本体
// 依存: data/parks-data.js（先に読み込まれていること）
/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let map, clusterer;
let placesMarkers = {};          // place_id → AdvancedMarkerElement
let curated = {};                // 公園名 → parkData エントリ
const activeFilters = { catchball: false };
let searchTimeout = null;
let currentLocationMarker = null;
let currentUserLatLng = null;    // { lat, lng }
let prefBoundaryData = null;     // google.maps.Data（埼玉県境界）
let cityBoundaryData = null;     // google.maps.Data（市区町村境界）
let gasUpdated = null;
let _saitamaRings = null;        // Nominatim から取得した正確な境界リング群

/* ═══════════════════════════════════════════════
   埼玉県判定
═══════════════════════════════════════════════ */
const SAITAMA_BOUNDS = {
  minLat: 35.7520, maxLat: 36.2870, minLng: 138.9750, maxLng: 139.9260
};
// フォールバック用の粗い近似ポリゴン（Nominatim 未取得時のみ使用）
const SAITAMA_POLYGON = [
  [35.9900,138.9750],[36.1500,139.0500],[36.2870,139.1500],
  [36.2870,139.3500],[36.2200,139.5000],[36.2870,139.6500],
  [36.2400,139.7500],[36.1800,139.8500],[36.0500,139.9260],
  [35.9000,139.9260],[35.8500,139.9000],[35.8000,139.8500],
  [35.7520,139.7500],[35.7520,139.5500],[35.7800,139.4500],
  [35.8000,139.3000],[35.8500,139.1500],[35.9200,139.0500],
  [35.9900,138.9750]
];

function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isInSaitama(lat, lng) {
  if (lat < SAITAMA_BOUNDS.minLat || lat > SAITAMA_BOUNDS.maxLat ||
      lng < SAITAMA_BOUNDS.minLng || lng > SAITAMA_BOUNDS.maxLng) return false;
  // Nominatim から取得した正確な境界を使用（取得済みなら）
  if (_saitamaRings) return _saitamaRings.some(ring => pointInPolygon(lat, lng, ring));
  return pointInPolygon(lat, lng, SAITAMA_POLYGON);
}

/* parks-data.js をインデックス化 */
parkData.forEach(p => { curated[p.name] = p; });

/* ═══════════════════════════════════════════════
   MAP INIT（ネイティブ Google Maps）
═══════════════════════════════════════════════ */
async function initMap() {
  try {
  // 前回表示位置を復元（24時間以内のみ）
  const PARK_LAST_VIEW_KEY = 'parkMapLastView';
  const PARK_LAST_VIEW_TTL = 24 * 60 * 60 * 1000;
  let pInitCenter = { lat: 35.8617, lng: 139.6455 };
  let pInitZoom = 11;
  try {
    const raw = localStorage.getItem(PARK_LAST_VIEW_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (v && v.ts && (Date.now() - v.ts < PARK_LAST_VIEW_TTL) && typeof v.lat === 'number' && typeof v.lng === 'number') {
        pInitCenter = { lat: v.lat, lng: v.lng };
        if (typeof v.zoom === 'number' && v.zoom >= 7 && v.zoom <= 18) pInitZoom = v.zoom;
      }
    }
  } catch(e) {}
  map = new google.maps.Map(document.getElementById('map'), {
    center: pInitCenter,
    zoom: pInitZoom,
    mapTypeId: 'roadmap',
    // DEMO_MAP_ID: AdvancedMarkerElement を使うために必要。
    // 本番運用時は Google Cloud Console で独自 Map ID を発行して置き換えてください。
    mapId: 'DEMO_MAP_ID',
    mapTypeControl: false,   // 独自ボタンで制御
    fullscreenControl: false,
    streetViewControl: false,
    rotateControl: false,
    // cameraControl: Google Maps 新機能（3D傾き・回転） — このマップでは不要なので明示的に無効化
    cameraControl: false,
    zoomControl: true,
    zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
  });
  // idle時に表示位置を保存（debounce）
  let _pSaveViewT = null;
  map.addListener('idle', () => {
    clearTimeout(_pSaveViewT);
    _pSaveViewT = setTimeout(() => {
      try {
        const c = map.getCenter();
        if (!c) return;
        localStorage.setItem(PARK_LAST_VIEW_KEY, JSON.stringify({
          lat: c.lat(), lng: c.lng(), zoom: map.getZoom(), ts: Date.now()
        }));
      } catch(e) {}
    }, 800);
  });

  // スケルトン非表示（初回 idle で）
  let _parkSkeletonHidden = false;
  map.addListener('idle', () => {
    if (!_parkSkeletonHidden) {
      const sk = document.getElementById('map-skeleton');
      if (sk) sk.classList.add('hidden');
      _parkSkeletonHidden = true;
    }
  });
  setTimeout(() => {
    const sk = document.getElementById('map-skeleton');
    if (sk && !_parkSkeletonHidden) { sk.classList.add('hidden'); _parkSkeletonHidden = true; }
  }, 4000);

  // MarkerClusterer（@googlemaps/markerclusterer）
  if (typeof markerclusterer === 'undefined') {
    // CDN 読み込み失敗時はクラスタリングなしで動作
    clusterer = { addMarker(m){m.map=map}, addMarkers(ms){ms.forEach(m=>m.map=map)}, removeMarker(m){m.map=null}, clearMarkers(){Object.values(placesMarkers).forEach(m=>m.map=null)} };
  } else {
    clusterer = new markerclusterer.MarkerClusterer({ map, markers: [] });
  }

  setupMapTypeButtons();
  setupEventListeners();

  // map.controls にボタンを登録（Googleコントロールとの重なり防止）
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
    document.getElementById('park-map-type-bar')
  );
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(
    document.getElementById('park-action-btns')
  );

  // 埼玉県境界線を常時表示
  loadFixedBoundary();

  // ローディングオーバーレイを非表示
  const _ov = document.getElementById('loading-overlay');
  if (_ov) { _ov.classList.add('fade-out'); setTimeout(() => _ov.classList.add('hidden'), 400); }

  // 公園データを静的配置（parks-data.js の lat/lng を使用。 Places API は使わない）
  placeStaticParksFromData();

  // 初期ロード時はモーダルを確実に閉じておく（自動表示を防止）
  const _pm = document.getElementById('park-modal');
  if (_pm) _pm.classList.remove('open');

  // 地図移動完了時: 一覧を表示範囲で更新
  map.addListener('idle', () => {
    renderOsmPins();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderParkList();
    }, 600);
    // アナリティクス: 地図移動完了
    if (window.Analytics) {
      const c = map.getCenter();
      window.Analytics.mapZoom(map.getZoom(), c ? {lat: c.lat(), lng: c.lng()} : null);
    }
  });

  // GAS から承認済みデータ取得（バックグラウンド・ノンブロッキング）
  loadGasData();
  } catch(err) {
    console.error('initMap エラー:', err);
    document.getElementById('map').innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:#6a6a6a;font-size:13px"><span class="msi" style="font-size:36px;color:#c45500">warning</span><div>地図の読み込みに失敗しました</div><div style="font-size:11px;color:#aaa">${err.message}</div></div>`;
  }
}

/* ═══════════════════════════════════════════════
   GAS からデータ取得
═══════════════════════════════════════════════ */
async function loadGasData() {
  if (!GAS_URL || GAS_URL === 'YOUR_GAS_WEBAPP_URL_HERE') return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res  = await fetch(`${GAS_URL}?action=approved`, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json();
    if (json.parks && json.parks.length > 0) {
      json.parks.forEach(p => { curated[p.name] = p; });
      console.log(`✓ GASから${json.parks.length}件の承認済みデータを取得`);
      renderGasReportedParks(json.parks);
    }
    if (json.updated) {
      gasUpdated = new Date(json.updated);
      updateLastUpdated();
    }
  } catch(e) {
    console.warn('GASデータ取得エラー（parks-data.jsのみ使用）:', e);
  }
}

/* GAS承認済みの「報告のある公園」を地図へ反映。
   既存ピンと同名 → showParkModal でモーダルにマージ表示（ピンは増やさない）。
   地図に無い報告公園 → 新規ピンとして追加（タップで報告内容が見える）。 */
function renderGasReportedParks(gasParks) {
  if (!Array.isArray(gasParks) || !map) return;
  const existingNames = {};
  Object.values(placesMarkers).forEach(m => { if (m._parkInfo) existingNames[m._parkInfo.name] = true; });
  let added = 0;
  gasParks.forEach(g => {
    if (!g.lat || !g.lng) return;
    if (existingNames[g.name]) return;                 // 同名の既存ピンあり → モーダルでマージ表示
    const key = 'gas-' + g.id;
    if (placesMarkers[key]) return;                    // 二重追加防止
    // 登録済みピンと近接(80m以内)なら重複とみなしスキップ
    const dup = Object.values(placesMarkers).some(m => {
      const i = m._parkInfo; if (!i || i.lat == null) return false;
      return Math.hypot((i.lat - g.lat) * 111000, (i.lng - g.lng) * 91000) < 80;
    });
    if (dup) return;
    const info = Object.assign({ place_id: key }, g);
    const mk = createMarker(g.lat, g.lng, info);
    placesMarkers[key] = mk;
    if (!activeFilters.catchball || g.catchball === true) clusterer.addMarker(mk);
    added++;
  });
  if (added) { updateStats(); renderParkList(); console.log(`[GAS] 報告のある公園 ${added}件を地図に追加`); }
}

/* ═══════════════════════════════════════════════
   登録済み公園を TextSearch で全件配置
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   静的データから公園を配置（Places API 不使用・無料）
   parks-data.js に lat/lng が事前埋め込みされた公園のみ
═══════════════════════════════════════════════ */
function placeStaticParksFromData() {
  const targets = parkData.filter(p => p.catchball !== undefined && p.lat && p.lng);
  targets.forEach(p => {
    const fakeResult = {
      // place_id は placesMarkers のキーになるため一意な値が必須
      // （未設定だと undefined キーで全件が上書きされ 1件しか残らない）
      place_id: 'static-' + p.id,
      name: p.name,
      formatted_address: p.address || '',
      vicinity: p.address || '',
      geometry: { location: { lat: () => p.lat, lng: () => p.lng } }
    };
    addRegisteredParkToMap(fakeResult, p);
  });
  const loadingEl = document.getElementById('loading-parks');
  if (loadingEl) loadingEl.textContent = `${targets.length}件`;
  updateStats();
  renderParkList();
  console.log(`[静的配置] ${targets.length}件の公園を配置（Places API 不使用）`);
}

/* 登録済み公園専用マーカー配置（名前不一致でも parkData の情報を使用）*/
function addRegisteredParkToMap(place, parkEntry) {
  if (placesMarkers[place.place_id]) {
    const existing = placesMarkers[place.place_id];
    // 既に登録済み情報あり → スキップ
    if (existing._parkInfo && existing._parkInfo.catchball !== undefined) return;
    // 情報なし青マーカー → 除去して上書き
    clusterer.removeMarker(existing);
    delete placesMarkers[place.place_id];
  }

  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
  if (!isInSaitama(lat, lng)) return;

  const parkInfo = {
    name: parkEntry.name,
    lat, lng,
    address: place.vicinity || place.formatted_address || '',
    place_id: place.place_id,
    ...parkEntry
  };

  const marker = createMarker(lat, lng, parkInfo);
  placesMarkers[place.place_id] = marker;
  curated[place.name] = parkEntry;

  if (!activeFilters.catchball || parkEntry.catchball === true) {
    clusterer.addMarker(marker);
  }
  console.log(`[登録配置] ${parkEntry.name}（${parkEntry.city}）→ API名: ${place.name}`);
}

/* ═══════════════════════════════════════════════
   マーカー生成（AdvancedMarkerElement）
   ネイティブ Google Maps なのでピン位置が正確
═══════════════════════════════════════════════ */
function createMarker(lat, lng, parkInfo) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = makeMarkerHtml(parkInfo.catchball);
  const content = wrapper.firstElementChild;
  content.style.cursor = 'pointer';
  content.addEventListener('click', (e) => {
    e.stopPropagation();
    showParkModal(parkInfo);
  });

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat, lng },
    content,
    title: parkInfo.name,
  });
  marker._parkInfo = parkInfo;
  return marker;
}

/* Airbnb 風ピン HTML */
function makeMarkerHtml(catchball) {
  let bg, shadow, icon;
  if (catchball === true)       { bg='#00a854'; shadow='rgba(0,168,84,0.4)';  icon='sports_baseball'; }
  else if (catchball === false) { bg='#ff385c'; shadow='rgba(255,56,92,0.4)'; icon='close'; }
  else if (catchball === null)  { bg='#c45500'; shadow='rgba(196,85,0,0.4)';  icon='help'; }
  else                          { bg='#717171'; shadow='rgba(0,0,0,0.2)';     icon='place'; }
  return `
    <div style="position:relative;width:32px;height:42px;filter:drop-shadow(0 2px 6px ${shadow});cursor:pointer">
      <div style="position:absolute;top:0;left:0;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:2px solid #fff"></div>
      <div style="position:absolute;top:0;left:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:#fff"><span class="msi" style="font-size:16px">${icon}</span></div>
    </div>`;
}

/* ═══════════════════════════════════════════════
   フィルター適用
═══════════════════════════════════════════════ */
function applyFilters() {
  // clusterer.clearMarkers() は各マーカーの .map を null にしてクリア
  clusterer.clearMarkers();

  const visible = Object.values(placesMarkers).filter(marker => {
    const info = marker._parkInfo;
    if (activeFilters.catchball && info.catchball !== true) return false;
    return true;
  });

  clusterer.addMarkers(visible);
  updateStats();
  renderParkList();
  renderOsmPins();
}

/* ═══════════════════════════════════════════════
   未登録公園（OSM由来）のグレーピン
   ズームイン時(>=14)のみ、表示範囲内を最大120件だけ描画。
   タップ→showParkModalで「情報未登録」表示＋情報提供フォーム。
═══════════════════════════════════════════════ */
let osmMarkers = {};
const OSM_MIN_ZOOM = 14;
function renderOsmPins() {
  if (typeof parkOsmData === 'undefined' || !map) return;
  const clearAll = () => { for (const k in osmMarkers) { osmMarkers[k].map = null; delete osmMarkers[k]; } };
  // 「キャッチボール可のみ」絞込中、または広域ズームでは未登録ピンを出さない
  if (activeFilters.catchball || map.getZoom() < OSM_MIN_ZOOM) { clearAll(); return; }
  const b = map.getBounds();
  if (!b) return;
  // 表示範囲外を撤去
  for (const k in osmMarkers) {
    const p = parkOsmData[k];
    if (!p || !b.contains(new google.maps.LatLng(p.lat, p.lng))) { osmMarkers[k].map = null; delete osmMarkers[k]; }
  }
  // 表示範囲内を追加（最大120件で頭打ち）
  let count = Object.keys(osmMarkers).length;
  for (let i = 0; i < parkOsmData.length && count < 120; i++) {
    if (osmMarkers[i]) continue;
    const p = parkOsmData[i];
    if (!b.contains(new google.maps.LatLng(p.lat, p.lng))) continue;
    const m = createMarker(p.lat, p.lng, { name: p.name, lat: p.lat, lng: p.lng, unregistered: true });
    m.map = map;
    osmMarkers[i] = m;
    count++;
  }
}

/* ═══════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════ */
function renderModalContent(park, toilet, parking) {
  const toiletHtml  = toilet  !== null ? `<div class="park-row"><span class="park-row-label">トイレ</span><span class="park-row-value">${toilet  ? 'あり' : 'なし'}</span></div>` : '';
  const parkingHtml = parking !== null ? `<div class="park-row"><span class="park-row-label">駐車場</span><span class="park-row-value">${parking ? 'あり' : 'なし'}</span></div>` : '';
  // Google Maps リンク: 実在の place_id がある場合のみ place 指定。
  // 静的データの 'static-N' は架空なので、 公園名＋市町村で検索リンクにする。
  const isRealPlaceId = park.place_id && !String(park.place_id).startsWith('static-');
  const gmapUrl = isRealPlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${park.place_id}`
    : `https://www.google.com/maps/search/${encodeURIComponent(park.name + ' ' + (park.city || '') + ' 埼玉県')}`;

  let cbStyle, cbText, cbIcon;
  if (park.catchball === true)       { cbStyle='background:rgba(0,168,84,0.1);color:#00a854';  cbText='キャッチボール可';        cbIcon='check_circle'; }
  else if (park.catchball === false) { cbStyle='background:rgba(255,56,92,0.1);color:#ff385c'; cbText='不可・要確認';            cbIcon='cancel'; }
  else if (park.catchball === null)  { cbStyle='background:rgba(196,85,0,0.1);color:#c45500';  cbText='判定不明（報告あり）';    cbIcon='help'; }
  else                               { cbStyle='background:#f7f7f7;color:#6a6a6a';             cbText='情報未登録';              cbIcon='info'; }

  document.getElementById('modal-park-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;margin-bottom:14px;${cbStyle}">
      <span class="msi" style="font-size:22px">${cbIcon}</span>
      <span style="font-weight:700;font-size:13px">${cbText}</span>
    </div>
    <div class="park-row">
      <span class="park-row-label">住所</span>
      <span class="park-row-value" id="modal-addr"><a href="${gmapUrl}" target="_blank" style="color:var(--action);text-decoration:none">${park.address || park.city || '地図で見る'} ↗</a></span>
    </div>
    ${park.area ? `<div class="park-row"><span class="park-row-label">広さ</span><span class="park-row-value">${park.area}</span></div>` : ''}
    ${toiletHtml}
    ${parkingHtml}
    ${park.notes ? `<div class="park-row"><span class="park-row-label">備考</span><span class="park-row-value">${park.notes}</span></div>` : ''}
    <div style="margin-top:16px;border:1px solid var(--border);border-radius:12px;overflow:hidden">
      <div style="padding:12px 14px;background:var(--surface-2);border-bottom:1px solid var(--border)">
        <div style="font-size:11px;font-weight:700;color:var(--ink);margin-bottom:8px">
          ユーザー報告${park.reports > 0 ? `（${park.reports}件）` : ''}
        </div>
        ${park.reports > 0 ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span style="display:inline-flex;align-items:center;gap:3px;padding:3px 10px;background:rgba(0,168,84,0.1);border-radius:14px;color:#00a854;font-size:11px;font-weight:600"><span class="msi" style="font-size:13px">check</span>できる ${park.yes_count || 0}票</span>
          <span style="display:inline-flex;align-items:center;gap:3px;padding:3px 10px;background:rgba(255,56,92,0.1);border-radius:14px;color:#ff385c;font-size:11px;font-weight:600"><span class="msi" style="font-size:13px">close</span>できない ${park.no_count || 0}票</span>
          <span style="display:inline-flex;align-items:center;gap:3px;padding:3px 10px;background:rgba(196,85,0,0.1);border-radius:14px;color:#c45500;font-size:11px;font-weight:600"><span class="msi" style="font-size:13px">help</span>不明 ${park.unknown_count || 0}票</span>
        </div>` : `<div style="font-size:12px;color:var(--ink-3)">まだ報告がありません。最初の報告者になりましょう！</div>`}
      </div>
      <a id="modal-report-link" href="#" target="_blank"
         style="display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 14px;background:var(--surface);color:var(--ink-2);font-size:12px;font-weight:600;text-decoration:none;transition:.15s"
         onmouseover="this.style.background='var(--surface-2)';this.style.color='var(--ink)'"
         onmouseout="this.style.background='var(--surface)';this.style.color='var(--ink-2)'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        この公園の情報を提供する
      </a>
    </div>
  `;
}

async function showParkModal(park) {
  // GAS承認済みの報告集計があれば取り込んで表示（ピン色＝catchball は手動データを尊重し上書きしない）
  if (typeof curated !== 'undefined') {
    const g = curated[park.name];
    if (g && g.reports != null && g !== park) {
      park = Object.assign({}, park, {
        reports: g.reports, yes_count: g.yes_count, no_count: g.no_count,
        unknown_count: g.unknown_count, notes: park.notes || g.notes || ''
      });
    }
  }
  document.getElementById('modal-park-name').textContent = park.name;
  // アナリティクス: 公園ピン/モーダル開封
  if (window.Analytics) {
    window.Analytics.parkPinClick(park);
    window.Analytics.modalOpen('park_detail', {park_id: park.id || '', park_name: park.name || ''});
  }

  const initToilet  = park.toilet  !== undefined ? park.toilet  : null;
  const initParking = park.parking !== undefined ? park.parking : null;
  renderModalContent(park, initToilet, initParking);
  setupModalLinks(park);

  // 住所が事前埋め込みされていない（グレー/未登録）公園は、タップ時に国土地理院で1回だけ取得（無料）
  if (!park.address && park.lat && park.lng) fetchParkAddress(park);

  // 注意: Places API 系は課金されるため、このマップでは使用禁止（docs/REFACTORING_PLAN.md 参照）
}

// ── 未登録公園の住所をタップ時に取得（国土地理院リバースジオコーディング・無料） ──
const _addrCache = {};
async function fetchParkAddress(park) {
  const el = document.getElementById('modal-addr');
  if (!el) return;
  const gmapUrl = `https://www.google.com/maps/search/${encodeURIComponent(park.name + ' 埼玉県')}`;
  const link = txt => `<a href="${gmapUrl}" target="_blank" style="color:var(--action);text-decoration:none">${txt} ↗</a>`;
  const key = park.lat.toFixed(5) + ',' + park.lng.toFixed(5);
  if (_addrCache[key] !== undefined) { el.innerHTML = link(_addrCache[key] || '地図で見る'); return; }
  el.innerHTML = '<span style="color:var(--ink-3)">住所を取得中…</span>';
  try {
    const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${park.lat}&lon=${park.lng}`);
    const d = await r.json();
    const res = d && d.results;
    if (res && res.muniCd && res.lv01Nm) {
      const muni = (window.SAITAMA_MUNI && window.SAITAMA_MUNI[res.muniCd]) || '';
      const addr = (muni + res.lv01Nm).replace(/^−$|^-$/, '');
      _addrCache[key] = addr;
      el.innerHTML = link(addr || '地図で見る');
      return;
    }
  } catch (e) { /* ネットワーク失敗時はフォールバック */ }
  _addrCache[key] = '';
  el.innerHTML = link('地図で見る');
}

function setupModalLinks(park) {
  const linkBtn = document.getElementById('modal-parkful-link');
  if (park.parkful_url) {
    linkBtn.href = park.parkful_url;
    linkBtn.style.display = '';
  } else {
    linkBtn.style.display = 'none';
  }
  const cfg = window.APP_CONFIG || {};
  const FORM_URL   = cfg.PARK_FORM_URL || '';
  const NAME_ENTRY = cfg.PARK_FORM_ENTRY_NAME || 'entry.837577971';
  const LAT_ENTRY  = cfg.PARK_FORM_ENTRY_LAT || '';
  const LNG_ENTRY  = cfg.PARK_FORM_ENTRY_LNG || '';
  const reportLink = document.getElementById('modal-report-link');
  if (FORM_URL) {
    let url = `${FORM_URL}?usp=pp_url&${NAME_ENTRY}=${encodeURIComponent(park.name)}`;
    // 登録済み・グレーピンとも座標を持つので一緒にプリフィル（グレーの座標捨てを解消）
    if (LAT_ENTRY && park.lat != null) url += `&${LAT_ENTRY}=${park.lat}`;
    if (LNG_ENTRY && park.lng != null) url += `&${LNG_ENTRY}=${park.lng}`;
    reportLink.href = url;
  } else {
    reportLink.href = cfg.CONTACT_URL || 'https://www.saitamabaseball.com/contact-8';
  }
  // 情報修正ボタンクリックでアナリティクスイベントを発火
  reportLink.onclick = function() {
    if (window.Analytics) window.Analytics.infoMissingReport('park:' + park.name, 'park_report_form');
  };
  document.getElementById('park-modal').classList.add('open');
}

function closeParkModal() {
  document.getElementById('park-modal').classList.remove('open');
}

// ── 全モーダル共通: ESCで閉じる ──
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  const modal = document.getElementById('park-modal');
  if (modal && modal.classList.contains('open')) { closeParkModal(); return; }
  // モバイルのサイドバー
  const sb = document.getElementById('sidebar');
  if (sb && sb.classList.contains('open') && window.innerWidth <= 768) {
    sb.classList.remove('open');
    document.getElementById('hbg')?.classList.remove('open');
  }
});

/* ═══════════════════════════════════════════════
   STATS / LIST
═══════════════════════════════════════════════ */
function updateStats() {
  const total = Object.keys(placesMarkers).length;
  const matchedRegistered = Object.values(placesMarkers)
    .filter(m => m._parkInfo && m._parkInfo.catchball !== undefined && m._parkInfo.catchball !== null)
    .length;
  document.getElementById('total-parks').textContent = total;
  document.getElementById('catchball-parks').textContent = matchedRegistered;
}

// U3: 日本語あいまい一致用の正規化（全角/半角・カタカナ/ひらがな・記号差を吸収）
function _normJP(s){
  return (s||'').normalize('NFKC').toLowerCase()
    .replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s　・･_\-‐－—~〜/／()（）「」『』.,、。]/g, '');
}
function _jpInc(hay, needle){ return _normJP(hay).includes(_normJP(needle)); }

function renderParkList() {
  const list       = document.getElementById('park-list');
  const searchTerm = (document.getElementById('hdr-search-input').value || '').trim();
  const bounds     = map.getBounds();
  if (!bounds) return;
  const sortMode = document.getElementById('sort-select')?.value || 'name';

  let filtered = Object.values(placesMarkers)
    .filter(marker => {
      const p = marker._parkInfo;
      if (!p) return false;
      if (!bounds.contains(new google.maps.LatLng(p.lat, p.lng))) return false;
      if (activeFilters.catchball && p.catchball !== true) return false;
      if (searchTerm && !_jpInc(p.name, searchTerm) && !_jpInc(p.city || '', searchTerm)) return false;
      return true;
    })
    .map(m => m._parkInfo);

  if (sortMode === 'near' && currentUserLatLng) {
    filtered.sort((a, b) => {
      const da = Math.hypot(a.lat - currentUserLatLng.lat, a.lng - currentUserLatLng.lng);
      const db = Math.hypot(b.lat - currentUserLatLng.lat, b.lng - currentUserLatLng.lng);
      return da - db;
    });
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }

  list.innerHTML = '';
  document.getElementById('park-count').textContent = `(${filtered.length}件)`;

  if (filtered.length === 0) {
    const hasSearch = !!searchTerm;
    const hasFilter = !!activeFilters.catchball;
    const tip = hasSearch
      ? '検索キーワードを変えるか、地図を移動してみてください'
      : hasFilter
      ? '「キャッチボール可」絞込を解除すると候補が増えます'
      : '地図をドラッグして他のエリアを表示してください';
    list.innerHTML = `
      <li class="park-empty">
        <div class="park-empty-icon"><span class="msi">search_off</span></div>
        <div class="park-empty-title">この範囲に公園がありません</div>
        <div class="park-empty-sub">${tip}</div>
        ${(hasSearch || hasFilter) ? `
          <button class="park-empty-btn" onclick="window.clearParkFilters && window.clearParkFilters()">
            <span class="msi" style="font-size:14px;vertical-align:-2px;margin-right:4px">refresh</span>絞込をリセット
          </button>` : ''}
      </li>`;
    return;
  }

  filtered.forEach(park => {
    const cbClass = park.catchball === true ? 'cb-yes' : park.catchball === false ? 'cb-no' : park.catchball === null ? 'cb-unknown' : '';
    const badgeClass = park.catchball === true ? 'catchball' : park.catchball === false ? 'no-catchball' : 'unknown-catchball';
    const cbText = park.catchball === true  ? '<span class="msi" style="font-size:11px;vertical-align:-1px">check</span> 可'
                 : park.catchball === false ? '<span class="msi" style="font-size:11px;vertical-align:-1px">close</span> 不可'
                                            : '<span class="msi" style="font-size:11px;vertical-align:-1px">help</span> 不明';
    let distText = '';
    if (sortMode === 'near' && currentUserLatLng) {
      const dx   = (park.lat - currentUserLatLng.lat) * 111000;
      const dy   = (park.lng - currentUserLatLng.lng) * 111000 * Math.cos(currentUserLatLng.lat * Math.PI / 180);
      const dist = Math.round(Math.sqrt(dx*dx + dy*dy));
      distText = dist < 1000 ? dist+'m' : (dist/1000).toFixed(1)+'km';
    }
    const item = document.createElement('li');
    item.className = `park-item${cbClass ? ' '+cbClass : ''}`;
    item.innerHTML = `
      <div class="park-item-top">
        <div class="park-item-name">${park.name}</div>
        <span class="park-item-badge ${badgeClass}">${cbText}</span>
      </div>
      <div class="park-item-meta">
        <span class="park-item-addr">${park.address || park.city || ''}</span>
        ${park.reports > 0 ? `<span style="font-size:9px;color:var(--ink-3);display:inline-flex;align-items:center;gap:2px"><span class="msi" style="font-size:11px">comment</span>${park.reports}件</span>` : ''}
        ${distText ? `<span class="park-item-dist">${distText}</span>` : ''}
      </div>
    `;
    item.onclick = () => {
      map.setCenter({ lat: park.lat, lng: park.lng });
      map.setZoom(16);
      showParkModal(park);
    };
    list.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════
   最終更新日表示
═══════════════════════════════════════════════ */
function updateLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el || !gasUpdated) return;
  const fmt = gasUpdated.toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
  el.textContent = `ユーザー報告データ更新: ${fmt}`;
  el.style.display = 'block';
}

/* ═══════════════════════════════════════════════
   境界線（google.maps.Data レイヤー）
═══════════════════════════════════════════════ */
function fetchBoundary(query) {
  const q = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&polygon_geojson=1&limit=1&countrycodes=jp`;
  return fetch(url, { headers: { 'Accept-Language': 'ja', 'User-Agent': 'saitama-park-map/1.0' } })
    .then(r => r.json())
    .then(data => {
      if (!data || data.length === 0 || !data[0].geojson) throw new Error('no data');
      const geom = data[0].geojson;
      // addGeoJson() は Feature/FeatureCollection が必要。生 Geometry をラップする
      if (geom.type === 'Feature' || geom.type === 'FeatureCollection') return geom;
      return { type: 'Feature', geometry: geom, properties: {} };
    });
}

function loadFixedBoundary() {
  fetchBoundary('埼玉県').then(geojson => {
    // 正確な境界リングを isInSaitama() に登録（GeoJSON は [lng,lat]、内部は [lat,lng]）
    const geom = geojson.geometry || geojson;
    if (geom.type === 'Polygon') {
      _saitamaRings = [geom.coordinates[0].map(([lng, lat]) => [lat, lng])];
    } else if (geom.type === 'MultiPolygon') {
      _saitamaRings = geom.coordinates.map(poly => poly[0].map(([lng, lat]) => [lat, lng]));
    }

    prefBoundaryData = new google.maps.Data();
    prefBoundaryData.addGeoJson(geojson);
    prefBoundaryData.setStyle({
      strokeColor: '#78716c',
      strokeWeight: 2,
      strokeOpacity: 0.7,
      fillColor:    '#78716c',
      fillOpacity:  0.05,
    });
    prefBoundaryData.setMap(map);
  }).catch(e => console.warn('埼玉県境界線取得エラー:', e));
}

function showCityBoundary(cityName) {
  if (cityBoundaryData) {
    cityBoundaryData.setMap(null);
    cityBoundaryData = null;
  }
  fetchBoundary(cityName + ' 埼玉県').then(geojson => {
    cityBoundaryData = new google.maps.Data();
    cityBoundaryData.addGeoJson(geojson);
    cityBoundaryData.setStyle({
      strokeColor: '#1a56db',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor:    '#1a56db',
      fillOpacity:  0.07,
    });
    cityBoundaryData.setMap(map);
  }).catch(e => console.warn('境界線取得エラー:', e));
}

/* ═══════════════════════════════════════════════
   MAP TYPE ボタン
═══════════════════════════════════════════════ */
function setupMapTypeButtons() {
  document.querySelectorAll('.map-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      map.setMapTypeId(btn.dataset.type);
      document.querySelectorAll('.map-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

const _MAP_TYPES = ['roadmap','satellite','hybrid'];
window.cycleMapType = function() {
  if (!map) return;
  const cur = map.getMapTypeId();
  const next = _MAP_TYPES[(_MAP_TYPES.indexOf(cur) + 1) % _MAP_TYPES.length];
  map.setMapTypeId(next);
  document.querySelectorAll('.map-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === next));
};

/* ═══════════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════════ */
// 公園マップの絞込を全てリセット（空状態カードから呼ばれる）
window.clearParkFilters = function() {
  try {
    // 検索キーワード
    ['hdr-search-input', 'sidebar-search', 'mobile-top-search-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['hdr-search-clear', 'sidebar-search-clear', 'mobile-top-search-clear'].forEach(id => {
      document.getElementById(id)?.classList.remove('show');
    });
    // キャッチボール可フィルター
    activeFilters.catchball = false;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('on'));
    if (typeof applyFilters === 'function') applyFilters();
    renderParkList();
    if (window.Toast) Toast.show('絞込をリセットしました', { type: 'success' });
  } catch(e) { console.warn('clearParkFilters', e); }
};

function setupEventListeners() {
  // フィルター
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.dataset.filter;
      this.classList.toggle('on');
      activeFilters[filter] = this.classList.contains('on');
      applyFilters();
    });
  });

  // 公園名検索
  document.getElementById('hdr-search-input').addEventListener('input', function() {
    document.getElementById('hdr-search-clear').classList.toggle('show', this.value.length > 0);
    renderParkList();
  });
  document.getElementById('hdr-search-clear').addEventListener('click', function() {
    document.getElementById('hdr-search-input').value = '';
    this.classList.remove('show');
    renderParkList();
  });

  // ハンバーガーメニュー
  document.getElementById('hbg').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
    this.classList.toggle('open');
  });

  // モーダル背景クリックで閉じる
  document.getElementById('park-modal').addEventListener('click', function(e) {
    if (e.target === this) closeParkModal();
  });

  // ソート
  document.getElementById('sort-select').addEventListener('change', function() {
    renderParkList();
    if (window.Toast) {
      const lbl = this.value === 'near' ? '近い順' : '名前順';
      Toast.show(`並び替え: ${lbl}`);
    }
  });

  // サイドバー内検索（モバイル用）
  const sbSearch = document.getElementById('sidebar-search-input');
  const sbClear  = document.getElementById('sidebar-search-clear');
  const hdrInput = document.getElementById('hdr-search-input');
  // マップ上部のモバイル検索バー
  const mtsInput = document.getElementById('mobile-top-search-input');
  const mtsClear = document.getElementById('mobile-top-search-clear');
  let _parkSearchTimer;
  const syncAllSearch = (val) => {
    hdrInput.value = val;
    sbSearch.value = val;
    if (mtsInput) mtsInput.value = val;
    const hasVal = val.length > 0;
    sbClear.classList.toggle('show', hasVal);
    document.getElementById('hdr-search-clear').classList.toggle('show', hasVal);
    if (mtsClear) mtsClear.classList.toggle('show', hasVal);
    // アナリティクス: 検索 + 空結果検知（debounce）
    clearTimeout(_parkSearchTimer);
    _parkSearchTimer = setTimeout(() => {
      const kw = val.trim();
      if (kw.length < 2) return;
      const matched = (typeof parkData !== 'undefined' ? parkData : []).filter(p => {
        const s = ((p.name || '') + ' ' + (p.city || '')).toLowerCase();
        return s.includes(kw.toLowerCase());
      });
      if (window.Analytics) {
        window.Analytics.keywordSearch(kw, matched.length);
        if (matched.length === 0) window.Analytics.emptyResult(kw, 'park_search');
      }
    }, 700);
  };
  sbSearch.addEventListener('input', function() {
    syncAllSearch(this.value);
    renderParkList();
  });
  sbClear.addEventListener('click', function() {
    syncAllSearch('');
    renderParkList();
  });
  // ヘッダー検索とサイドバー検索を双方向同期
  hdrInput.addEventListener('input', function() {
    syncAllSearch(this.value);
  });
  // モバイル上部検索バーの連動
  if (mtsInput) {
    mtsInput.addEventListener('input', function() {
      syncAllSearch(this.value);
      renderParkList();
    });
    mtsClear.addEventListener('click', function() {
      syncAllSearch('');
      renderParkList();
      mtsInput.focus();
    });
  }

  // 市区町村選択
  document.getElementById('city-select').addEventListener('change', function() {
    if (!this.value) {
      if (cityBoundaryData) { cityBoundaryData.setMap(null); cityBoundaryData = null; }
      return;
    }
    const [lat, lng, zoom] = this.value.split(',').map(Number);
    const cityName = this.options[this.selectedIndex].text;
    map.setCenter({ lat, lng });
    map.setZoom(zoom);
    showCityBoundary(cityName);
  });

  // 現在地ボタン
  const gpsBtn = document.getElementById('gps-btn');

  const gpsSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;flex-shrink:0"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" stroke-dasharray="4 2"/></svg>`;

  gpsBtn.addEventListener('click', function() {
    if (!navigator.geolocation) {
      if (window.Analytics) window.Analytics.gpsUse('unavailable');
      alert('このブラウザは位置情報に対応していません');
      return;
    }
    this.classList.add('locating');
    this.textContent = '取得中...';
    if (window.Analytics) window.Analytics.gpsUse('requested');

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        currentUserLatLng = { lat, lng };
        if (window.Analytics) window.Analytics.gpsUse('granted');

        // 既存の現在地マーカーを除去
        if (currentLocationMarker) currentLocationMarker.map = null;

        const locContent = document.createElement('div');
        locContent.className = 'current-location-marker';
        currentLocationMarker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map,
          content: locContent,
          title: '現在地',
        });

        map.setCenter({ lat, lng });
        map.setZoom(14);

        if (!isInSaitama(lat, lng)) {
          setTimeout(() => alert('現在地は埼玉県外です。埼玉県内のみ公園データを表示します。'), 300);
        }

        gpsBtn.classList.remove('locating');
        gpsBtn.innerHTML = `${gpsSvg} 現在地`;
      },
      (err) => {
        gpsBtn.classList.remove('locating');
        gpsBtn.innerHTML = `${gpsSvg} 現在地`;
        if (window.Analytics) window.Analytics.gpsUse(err && err.code === 1 ? 'denied' : 'unavailable');
        alert('位置情報の取得に失敗しました。\nブラウザの位置情報の許可を確認してください。');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

// 全域表示
window.parkResetView = function() {
  map.setCenter({ lat: 35.8617, lng: 139.6455 });
  map.setZoom(11);
};

// ── PC サイドバー折りたたみ ──
const PARK_PC_COLLAPSE_KEY = 'parkPcSidebarCollapsed';
window.toggleSidebarPC = function() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  const collapsed = sb.classList.toggle('pc-collapsed');
  const btn = document.getElementById('sidebar-collapse-btn');
  if (btn) {
    btn.classList.toggle('collapsed', collapsed);
    btn.setAttribute('aria-label', collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる');
    btn.setAttribute('title', collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる');
  }
  try { localStorage.setItem(PARK_PC_COLLAPSE_KEY, collapsed ? '1' : '0'); } catch(e) {}
  setTimeout(() => {
    try { google.maps.event.trigger(map, 'resize'); } catch(e) {}
  }, 320);
};
// 初期状態を復元（PC のみ）
(function restoreParkSidebarState() {
  try {
    const isMob = window.innerWidth <= 768;
    if (!isMob && localStorage.getItem(PARK_PC_COLLAPSE_KEY) === '1') {
      const sb = document.getElementById('sidebar');
      const btn = document.getElementById('sidebar-collapse-btn');
      if (sb) sb.classList.add('pc-collapsed');
      if (btn) {
        btn.classList.add('collapsed');
        btn.setAttribute('aria-label', 'サイドバーを開く');
        btn.setAttribute('title', 'サイドバーを開く');
      }
    }
  } catch(e) {}
})();

// キャッチボール可フィルタートグル（ボタンと連動）
window.parkToggleCatchball = function() {
  const btn = document.getElementById('pbtn-catchball');
  const filterBtn = document.querySelector('.filter-btn[data-filter="catchball"]');
  activeFilters.catchball = !activeFilters.catchball;
  if (window.Analytics) window.Analytics.filterChange('catchball', activeFilters.catchball ? 'on' : 'off');
  if (btn) btn.classList.toggle('active', activeFilters.catchball);
  if (filterBtn) filterBtn.classList.toggle('on', activeFilters.catchball);
  applyFilters();
  if (window.Toast) Toast.show(activeFilters.catchball ? 'キャッチボール可の公園のみ表示' : '全公園を表示');
};

// ─── 報告リンク（地図にない公園・情報の誤りを報告）───
// 共用フォームを直接開く控えめな導線。<a target="_blank"> なのでポップアップブロックされず、
// モバイル/PC問わず確実に動く（旧：地図タップ→ポップアップ方式は不安定だったため廃止）。
function setupReportLink() {
  const rl = document.getElementById('report-missing-link');
  if (!rl) return;
  const cfg = window.APP_CONFIG || {};
  rl.href = cfg.PARK_FORM_URL
    ? cfg.PARK_FORM_URL + (cfg.PARK_FORM_URL.includes('?') ? '&' : '?') + 'usp=pp_url'
    : (cfg.CONTACT_URL || 'https://www.saitamabaseball.com/contact-8');
  if (!rl.dataset.bound) {
    rl.dataset.bound = '1';
    rl.addEventListener('click', () => {
      if (window.Analytics) window.Analytics.infoMissingReport('park_missing', 'park_report_form_link');
    });
  }
}
// 地図の読み込みに依存せず、DOM構築後（config.js実行後）に報告リンクを設定する。
// ※initMap 内だけだと、地図が遅い/失敗したときリンクが href="#" のまま死ぬため。
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupReportLink);
else setupReportLink();

// 一覧パネルトグル（モバイル用 - サイドバー開閉）
window.parkToggleList = function() {
  const sb = document.getElementById('sidebar');
  const hbg = document.getElementById('hbg');
  const btn = document.getElementById('pbnav-list');
  const isOpen = sb.classList.toggle('open');
  hbg.classList.toggle('open', isOpen);
  if (btn) btn.classList.toggle('active', isOpen);
};

// 検索を開く（PC: ヘッダー検索フォーカス / モバイル: サイドバーを開いて検索欄にフォーカス）
window.parkOpenSearch = function() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const sb = document.getElementById('sidebar');
    const hbg = document.getElementById('hbg');
    sb.classList.add('open');
    hbg.classList.add('open');
    setTimeout(() => document.getElementById('sidebar-search-input').focus(), 350);
  } else {
    document.getElementById('hdr-search-input').focus();
  }
};
