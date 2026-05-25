/**
 * 埼玉県野球協議会マップ - アナリティクス
 *
 * 役割:
 *   - GA4 (Google Analytics 4) の初期化
 *   - Microsoft Clarity の初期化
 *   - 12種類のカスタムイベント送信関数を提供
 *
 * 使い方:
 *   1. config.js を先に読み込む
 *   2. このファイルを読み込む
 *   3. window.Analytics.* を呼び出す
 *
 * 同意制御:
 *   - cookie-consent.js が window.__analyticsEnabled を制御
 *   - true の場合のみ GA4 / Clarity / イベント送信が動作
 *   - false / 未設定の場合はサイレント（DEBUG_ANALYTICS=true で console.log）
 */
(function() {
  'use strict';
  const cfg = window.APP_CONFIG || {};
  const DEBUG = !!cfg.DEBUG_ANALYTICS;

  // ── ヘルパー: 同意状態を判定 ────────────────────
  function enabled() {
    return window.__analyticsEnabled === true;
  }

  // ── ヘルパー: ログ出力（DEBUG時のみ） ─────────────
  function log(name, params) {
    if (DEBUG) {
      console.log('[Analytics] ' + name, params || {});
    }
  }

  // ── イベント送信のベース関数 ───────────────────
  function sendEvent(name, params) {
    if (!enabled()) {
      log('(blocked: no consent) ' + name, params);
      return;
    }
    try {
      if (typeof gtag === 'function') {
        gtag('event', name, params || {});
      }
      log(name, params);
    } catch (e) {
      // 解析失敗でユーザー体験を損なわない
      log('(error) ' + name, e && e.message);
    }
  }

  // ── GA4 / Clarity の初期化（同意取得時に呼ばれる） ─
  let analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    // GA4
    if (cfg.GA4_MEASUREMENT_ID && !cfg.GA4_MEASUREMENT_ID.includes('XXXX')) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.GA4_MEASUREMENT_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', cfg.GA4_MEASUREMENT_ID, { anonymize_ip: true });
      log('GA4 loaded: ' + cfg.GA4_MEASUREMENT_ID);
    } else {
      log('GA4 skipped (placeholder ID)');
    }

    // Clarity
    if (cfg.CLARITY_ID && !cfg.CLARITY_ID.includes('YYYY')) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r); t.async=1;
        t.src='https://www.clarity.ms/tag/'+i;
        y=l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t,y);
      })(window, document, 'clarity', 'script', cfg.CLARITY_ID);
      log('Clarity loaded: ' + cfg.CLARITY_ID);
    } else {
      log('Clarity skipped (placeholder ID)');
    }
  }

  // ── 12種類のカスタムイベント関数 ────────────────

  /**
   * 1. team_pin_click — チームピンクリック
   * @param {Object} team {id, name, city/municipality, cat/category}
   */
  function teamPinClick(team) {
    if (!team) return;
    sendEvent('team_pin_click', {
      team_id: team.id || '',
      team_name: team.name || '',
      municipality: team.municipality || team.city || '',
      category: team.category || team.cat || ''
    });
  }

  /**
   * 2. park_pin_click — 公園ピンクリック
   * @param {Object} park {id, name, city/municipality}
   */
  function parkPinClick(park) {
    if (!park) return;
    sendEvent('park_pin_click', {
      park_id: park.id || '',
      park_name: park.name || '',
      municipality: park.municipality || park.city || ''
    });
  }

  /**
   * 3. filter_change — フィルター変更
   * @param {string} filterType 'category' / 'gender' / 'catchball' / 'view_style' / 'index' / 'city' 等
   * @param {*} value 選択値
   */
  function filterChange(filterType, value) {
    sendEvent('filter_change', {
      filter_type: String(filterType || ''),
      value: String(value == null ? '' : value)
    });
  }

  /**
   * 4. keyword_search — キーワード検索（debounce 推奨）
   * @param {string} query 検索文字列
   * @param {number|Array} results 結果件数 or 結果配列
   */
  function keywordSearch(query, results) {
    const count = Array.isArray(results) ? results.length : (results | 0);
    sendEvent('keyword_search', {
      query: String(query || ''),
      result_count: count
    });
  }

  /**
   * 5. map_zoom — 地図ズーム/パン完了（debounce 500ms 推奨）
   * @param {number} zoom
   * @param {Object} center {lat, lng}
   */
  let _mapZoomTimer;
  function mapZoom(zoom, center) {
    clearTimeout(_mapZoomTimer);
    _mapZoomTimer = setTimeout(function() {
      sendEvent('map_zoom', {
        zoom_level: zoom == null ? '' : zoom,
        center_lat: center && center.lat != null ? center.lat : '',
        center_lng: center && center.lng != null ? center.lng : ''
      });
    }, 500);
  }

  /**
   * 6. cta_apply — 体験申込ボタンクリック（将来のCTA UIから呼び出す）
   * @param {Object} team
   */
  function ctaApply(team) {
    if (!team) return;
    sendEvent('cta_apply', {
      team_id: team.id || '',
      team_name: team.name || ''
    });
  }

  /**
   * 7. external_link — 外部リンククリック
   * @param {string} url
   * @param {string} linkType 'hp' / 'x' / 'instagram' / 'tiktok' / 'parkful' / 'other'
   */
  function externalLink(url, linkType) {
    sendEvent('external_link', {
      url: String(url || ''),
      link_type: String(linkType || 'other')
    });
  }

  /**
   * 8. info_missing_report — 情報修正報告
   * @param {string|number} entityId team_id か park_id
   * @param {string} reason
   */
  function infoMissingReport(entityId, reason) {
    sendEvent('info_missing_report', {
      entity_id: String(entityId == null ? '' : entityId),
      reason: String(reason || '')
    });
  }

  /**
   * 9. municipality_view — 市町村単位の表示・選択（debounce 500ms）
   * @param {string} municipality 市町村名
   *
   * 副作用：localStorage に市町村別クリック回数を記録し、
   * 3回以上の市町村 TOP3 を GA4 の user_property（興味市町村）として送信する
   */
  let _muniViewTimer, _muniViewLast;
  const CITY_COUNT_KEY = 'cityClickCounts';
  function _bumpCityCount(city) {
    try {
      const raw = localStorage.getItem(CITY_COUNT_KEY);
      const counts = raw ? JSON.parse(raw) : {};
      counts[city] = (counts[city] || 0) + 1;
      localStorage.setItem(CITY_COUNT_KEY, JSON.stringify(counts));
      return counts;
    } catch(e) { return {}; }
  }
  function _updateInterestCityProperties(counts) {
    if (!enabled() || typeof gtag === 'undefined') return;
    // 3回以上クリックされた市町村を回数降順で TOP3 抽出
    const top = Object.entries(counts)
      .filter(function(e) { return e[1] >= 3; })
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, 3)
      .map(function(e) { return e[0]; });
    if (!top.length) return;
    const props = {
      interest_city_1: top[0] || '',
      interest_city_2: top[1] || '',
      interest_city_3: top[2] || '',
    };
    try {
      gtag('set', 'user_properties', props);
      if (DEBUG) console.log('[Analytics] user_properties set', props);
    } catch(e) {}
  }
  function municipalityView(municipality) {
    if (!municipality) return;
    if (_muniViewLast === municipality) return; // 同一連続発火を抑制
    clearTimeout(_muniViewTimer);
    _muniViewTimer = setTimeout(function() {
      _muniViewLast = municipality;
      sendEvent('municipality_view', { municipality: String(municipality) });
      const counts = _bumpCityCount(String(municipality));
      _updateInterestCityProperties(counts);
    }, 500);
  }

  // ── 追加5種（事業判断データ） ─────────────────

  /**
   * 10. modal_open — モーダル開封
   * @param {string} modalType 'chart' / 'compare' / 'park_detail' / 'team_detail'
   * @param {Object} ctx 任意のコンテキスト（例：{city, team_id}）
   */
  function modalOpen(modalType, ctx) {
    const params = { modal_type: String(modalType || '') };
    if (ctx && typeof ctx === 'object') {
      Object.keys(ctx).forEach(function(k) {
        params[k] = String(ctx[k] == null ? '' : ctx[k]);
      });
    }
    sendEvent('modal_open', params);
  }

  /**
   * 11. city_compare — 市町村比較
   * @param {string} cityA
   * @param {string} cityB
   */
  function cityCompare(cityA, cityB) {
    sendEvent('city_compare', {
      city_a: String(cityA || ''),
      city_b: String(cityB || '')
    });
  }

  /**
   * 12. list_item_click — チーム/公園一覧からのクリック
   * @param {string} listType 'team' / 'park' / 'nearby'
   * @param {Object} item {id, name, municipality/city}
   */
  function listItemClick(listType, item) {
    if (!item) return;
    sendEvent('list_item_click', {
      list_type: String(listType || ''),
      item_id: item.id || '',
      item_name: item.name || '',
      municipality: item.municipality || item.city || ''
    });
  }

  /**
   * 13. empty_result — 検索結果0件
   * @param {string} query
   * @param {string} context 'team_search' / 'park_search' / 'nearby' 等
   */
  let _emptyResultTimer, _emptyResultLast;
  function emptyResult(query, context) {
    const key = (context || '') + '|' + (query || '');
    if (_emptyResultLast === key) return;
    clearTimeout(_emptyResultTimer);
    _emptyResultTimer = setTimeout(function() {
      _emptyResultLast = key;
      sendEvent('empty_result', {
        query: String(query || ''),
        context: String(context || '')
      });
    }, 700);
  }

  /**
   * 14. gps_use — 現在地利用
   * @param {string} result 'granted' / 'denied' / 'unavailable' / 'requested'
   */
  function gpsUse(result) {
    sendEvent('gps_use', {
      result: String(result || 'requested')
    });
  }

  // ── 公開 API ────────────────────────────────
  window.Analytics = {
    loadAnalytics: loadAnalytics,
    teamPinClick: teamPinClick,
    parkPinClick: parkPinClick,
    filterChange: filterChange,
    keywordSearch: keywordSearch,
    mapZoom: mapZoom,
    ctaApply: ctaApply,
    externalLink: externalLink,
    infoMissingReport: infoMissingReport,
    municipalityView: municipalityView,
    modalOpen: modalOpen,
    cityCompare: cityCompare,
    listItemClick: listItemClick,
    emptyResult: emptyResult,
    gpsUse: gpsUse,
  };
})();
