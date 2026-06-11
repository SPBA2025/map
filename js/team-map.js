// 競技者人口マップ（チームマップ）本体
// 依存: data/teams-data.js, data/geo-cities.js, data/geo-wards.js（先に読み込まれていること）
// ── データ（カテゴリ×性別）──────────────────────
const cityData = [
  {city:'さいたま市',lat:35.861,lng:139.645,region:'南部',children:68557,elem_m:2344,elem_f:142,jhs_m:1776,jhs_f:58,hs_m:1015,hs_f:118,univ_m:0,univ_f:0,club_m:1997,club_f:27},
  {city:'川口市',lat:35.806,lng:139.724,region:'南部',children:28152,elem_m:714,elem_f:50,jhs_m:533,jhs_f:13,hs_m:200,hs_f:10,univ_m:0,univ_f:0,club_m:831,club_f:9},
  {city:'草加市',lat:35.826,lng:139.807,region:'南部',children:11002,elem_m:431,elem_f:59,jhs_m:242,jhs_f:1,hs_m:88,hs_f:18,univ_m:0,univ_f:0,club_m:196,club_f:1},
  {city:'越谷市',lat:35.889,lng:139.79,region:'南部',children:16949,elem_m:647,elem_f:69,jhs_m:539,jhs_f:11,hs_m:262,hs_f:39,univ_m:0,univ_f:0,club_m:1314,club_f:3},
  {city:'八潮市',lat:35.82,lng:139.84,region:'南部',children:4267,elem_m:115,elem_f:16,jhs_m:100,jhs_f:2,hs_m:19,hs_f:3,univ_m:0,univ_f:0,club_m:73,club_f:0},
  {city:'三郷市',lat:35.834,lng:139.877,region:'南部',children:7341,elem_m:82,elem_f:9,jhs_m:127,jhs_f:6,hs_m:35,hs_f:0,univ_m:0,univ_f:0,club_m:109,club_f:1},
  {city:'吉川市',lat:35.892,lng:139.842,region:'南部',children:3896,elem_m:124,elem_f:17,jhs_m:79,jhs_f:1,hs_m:3,hs_f:0,univ_m:0,univ_f:0,club_m:284,club_f:0},
  {city:'松伏町',lat:35.928,lng:139.834,region:'南部',children:1127,elem_m:38,elem_f:2,jhs_m:38,jhs_f:3,hs_m:1,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'蕨市',lat:35.826,lng:139.68,region:'南部',children:3168,elem_m:72,elem_f:4,jhs_m:88,jhs_f:0,hs_m:83,hs_f:10,univ_m:0,univ_f:0,club_m:23,club_f:0},
  {city:'戸田市',lat:35.817,lng:139.677,region:'南部',children:7664,elem_m:228,elem_f:18,jhs_m:202,jhs_f:4,hs_m:30,hs_f:5,univ_m:0,univ_f:0,club_m:1135,club_f:15},
  {city:'朝霞市',lat:35.794,lng:139.594,region:'南部',children:7703,elem_m:212,elem_f:13,jhs_m:108,jhs_f:4,hs_m:54,hs_f:6,univ_m:0,univ_f:0,club_m:846,club_f:6},
  {city:'志木市',lat:35.834,lng:139.575,region:'南部',children:4086,elem_m:123,elem_f:7,jhs_m:73,jhs_f:40,hs_m:151,hs_f:2,univ_m:0,univ_f:0,club_m:39,club_f:0},
  {city:'新座市',lat:35.794,lng:139.563,region:'南部',children:8288,elem_m:180,elem_f:20,jhs_m:220,jhs_f:5,hs_m:161,hs_f:15,univ_m:134,univ_f:8,club_m:239,club_f:4},
  {city:'和光市',lat:35.78,lng:139.606,region:'南部',children:4257,elem_m:226,elem_f:23,jhs_m:126,jhs_f:9,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:160,club_f:1},
  {city:'富士見市',lat:35.858,lng:139.549,region:'南部',children:5493,elem_m:38,elem_f:4,jhs_m:182,jhs_f:1,hs_m:21,hs_f:2,univ_m:0,univ_f:0,club_m:61,club_f:24},
  {city:'ふじみ野市',lat:35.881,lng:139.521,region:'南部',children:5772,elem_m:19,elem_f:0,jhs_m:127,jhs_f:0,hs_m:32,hs_f:0,univ_m:0,univ_f:0,club_m:529,club_f:23},
  {city:'三芳町',lat:35.851,lng:139.525,region:'南部',children:1738,elem_m:32,elem_f:2,jhs_m:35,jhs_f:2,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:20,club_f:0},
  {city:'川越市',lat:35.925,lng:139.486,region:'西部',children:16490,elem_m:111,elem_f:4,jhs_m:575,jhs_f:9,hs_m:622,hs_f:32,univ_m:90,univ_f:29,club_m:136,club_f:3},
  {city:'所沢市',lat:35.799,lng:139.469,region:'西部',children:15174,elem_m:117,elem_f:6,jhs_m:357,jhs_f:3,hs_m:121,hs_f:16,univ_m:0,univ_f:0,club_m:129,club_f:1},
  {city:'入間市',lat:35.854,lng:139.391,region:'西部',children:6246,elem_m:122,elem_f:6,jhs_m:220,jhs_f:6,hs_m:152,hs_f:13,univ_m:0,univ_f:0,club_m:182,club_f:0},
  {city:'狭山市',lat:35.853,lng:139.412,region:'西部',children:5959,elem_m:266,elem_f:22,jhs_m:277,jhs_f:2,hs_m:137,hs_f:15,univ_m:0,univ_f:0,club_m:696,club_f:2},
  {city:'飯能市',lat:35.856,lng:139.33,region:'西部',children:3486,elem_m:202,elem_f:7,jhs_m:97,jhs_f:2,hs_m:118,hs_f:6,univ_m:0,univ_f:0,club_m:128,club_f:0},
  {city:'日高市',lat:35.907,lng:139.32,region:'西部',children:1695,elem_m:0,elem_f:0,jhs_m:85,jhs_f:2,hs_m:4,hs_f:0,univ_m:0,univ_f:0,club_m:24,club_f:1},
  {city:'毛呂山町',lat:35.933,lng:139.31,region:'西部',children:1012,elem_m:24,elem_f:2,jhs_m:73,jhs_f:2,hs_m:44,hs_f:2,univ_m:0,univ_f:0,club_m:14,club_f:0},
  {city:'越生町',lat:35.96,lng:139.291,region:'西部',children:320,elem_m:4,elem_f:0,jhs_m:11,jhs_f:0,hs_m:79,hs_f:5,univ_m:0,univ_f:0,club_m:45,club_f:0},
  {city:'鶴ヶ島市',lat:35.937,lng:139.391,region:'西部',children:2935,elem_m:0,elem_f:0,jhs_m:81,jhs_f:4,hs_m:33,hs_f:3,univ_m:0,univ_f:0,club_m:86,club_f:0},
  {city:'坂戸市',lat:35.957,lng:139.402,region:'西部',children:4307,elem_m:97,elem_f:3,jhs_m:122,jhs_f:2,hs_m:124,hs_f:10,univ_m:107,univ_f:0,club_m:117,club_f:0},
  {city:'東松山市',lat:36.042,lng:139.401,region:'西部',children:4355,elem_m:168,elem_f:6,jhs_m:161,jhs_f:4,hs_m:161,hs_f:1,univ_m:0,univ_f:0,club_m:125,club_f:0},
  {city:'滑川町',lat:36.063,lng:139.411,region:'西部',children:1291,elem_m:30,elem_f:5,jhs_m:38,jhs_f:2,hs_m:59,hs_f:6,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'嵐山町',lat:36.061,lng:139.327,region:'西部',children:654,elem_m:18,elem_f:3,jhs_m:73,jhs_f:1,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'小川町',lat:36.055,lng:139.262,region:'西部',children:822,elem_m:25,elem_f:3,jhs_m:25,jhs_f:2,hs_m:4,hs_f:1,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'ときがわ町',lat:36.023,lng:139.276,region:'西部',children:339,elem_m:12,elem_f:1,jhs_m:30,jhs_f:1,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:41,club_f:3},
  {city:'川島町',lat:36.003,lng:139.474,region:'西部',children:651,elem_m:49,elem_f:7,jhs_m:0,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'吉見町',lat:36.046,lng:139.454,region:'西部',children:568,elem_m:26,elem_f:0,jhs_m:16,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'鳩山町',lat:35.99,lng:139.34,region:'西部',children:396,elem_m:5,elem_f:0,jhs_m:11,jhs_f:2,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'春日部市',lat:35.975,lng:139.753,region:'東部',children:9225,elem_m:299,elem_f:43,jhs_m:330,jhs_f:8,hs_m:248,hs_f:19,univ_m:136,univ_f:4,club_m:594,club_f:1},
  {city:'久喜市',lat:36.063,lng:139.668,region:'東部',children:6619,elem_m:200,elem_f:22,jhs_m:191,jhs_f:6,hs_m:99,hs_f:9,univ_m:0,univ_f:0,club_m:362,club_f:0},
  {city:'幸手市',lat:36.081,lng:139.727,region:'東部',children:1791,elem_m:64,elem_f:8,jhs_m:34,jhs_f:1,hs_m:4,hs_f:0,univ_m:0,univ_f:0,club_m:136,club_f:5},
  {city:'白岡市',lat:36.02,lng:139.674,region:'東部',children:2622,elem_m:88,elem_f:4,jhs_m:41,jhs_f:2,hs_m:21,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'宮代町',lat:36.02,lng:139.728,region:'東部',children:1534,elem_m:55,elem_f:6,jhs_m:18,jhs_f:0,hs_m:13,hs_f:4,univ_m:0,univ_f:0,club_m:40,club_f:0},
  {city:'杉戸町',lat:36.025,lng:139.769,region:'東部',children:1718,elem_m:109,elem_f:14,jhs_m:8,jhs_f:1,hs_m:101,hs_f:10,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'蓮田市',lat:35.994,lng:139.658,region:'東部',children:2584,elem_m:76,elem_f:18,jhs_m:56,jhs_f:3,hs_m:19,hs_f:0,univ_m:0,univ_f:0,club_m:410,club_f:2},
  {city:'上尾市',lat:35.977,lng:139.595,region:'東部',children:10705,elem_m:350,elem_f:37,jhs_m:259,jhs_f:7,hs_m:130,hs_f:10,univ_m:0,univ_f:0,club_m:23,club_f:0},
  {city:'伊奈町',lat:35.99,lng:139.625,region:'東部',children:2217,elem_m:88,elem_f:16,jhs_m:31,jhs_f:2,hs_m:147,hs_f:12,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'桶川市',lat:36.002,lng:139.554,region:'東部',children:3364,elem_m:96,elem_f:10,jhs_m:56,jhs_f:2,hs_m:26,hs_f:1,univ_m:0,univ_f:0,club_m:36,club_f:0},
  {city:'北本市',lat:36.026,lng:139.527,region:'東部',children:2524,elem_m:124,elem_f:10,jhs_m:51,jhs_f:14,hs_m:21,hs_f:2,univ_m:0,univ_f:0,club_m:70,club_f:0},
  {city:'鴻巣市',lat:36.066,lng:139.521,region:'東部',children:5241,elem_m:219,elem_f:18,jhs_m:201,jhs_f:6,hs_m:28,hs_f:2,univ_m:0,univ_f:0,club_m:125,club_f:1},
  {city:'加須市',lat:36.131,lng:139.601,region:'東部',children:4820,elem_m:179,elem_f:33,jhs_m:117,jhs_f:20,hs_m:184,hs_f:36,univ_m:73,univ_f:27,club_m:361,club_f:38},
  {city:'羽生市',lat:36.175,lng:139.548,region:'東部',children:2296,elem_m:104,elem_f:7,jhs_m:40,jhs_f:0,hs_m:3,hs_f:3,univ_m:0,univ_f:0,club_m:31,club_f:0},
  {city:'行田市',lat:36.138,lng:139.455,region:'東部',children:3138,elem_m:104,elem_f:8,jhs_m:131,jhs_f:3,hs_m:15,hs_f:1,univ_m:0,univ_f:0,club_m:445,club_f:6},
  {city:'熊谷市',lat:36.147,lng:139.389,region:'北部',children:8351,elem_m:226,elem_f:14,jhs_m:325,jhs_f:16,hs_m:203,hs_f:12,univ_m:84,univ_f:4,club_m:666,club_f:3},
  {city:'深谷市',lat:36.198,lng:139.28,region:'北部',children:6437,elem_m:245,elem_f:18,jhs_m:126,jhs_f:11,hs_m:129,hs_f:22,univ_m:0,univ_f:0,club_m:546,club_f:4},
  {city:'本庄市',lat:36.241,lng:139.189,region:'北部',children:3462,elem_m:164,elem_f:28,jhs_m:136,jhs_f:8,hs_m:178,hs_f:12,univ_m:0,univ_f:0,club_m:341,club_f:5},
  {city:'美里町',lat:36.198,lng:139.387,region:'北部',children:459,elem_m:9,elem_f:6,jhs_m:14,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'神川町',lat:36.233,lng:139.109,region:'北部',children:479,elem_m:16,elem_f:4,jhs_m:12,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'上里町',lat:36.244,lng:139.218,region:'北部',children:1326,elem_m:39,elem_f:6,jhs_m:54,jhs_f:2,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'寄居町',lat:36.119,lng:139.196,region:'北部',children:1201,elem_m:104,elem_f:10,jhs_m:13,jhs_f:0,hs_m:5,hs_f:4,univ_m:0,univ_f:0,club_m:98,club_f:0},
  {city:'秩父市',lat:35.991,lng:139.086,region:'秩父',children:2429,elem_m:99,elem_f:5,jhs_m:87,jhs_f:0,hs_m:31,hs_f:4,univ_m:0,univ_f:0,club_m:180,club_f:4},
  {city:'横瀬町',lat:35.993,lng:139.115,region:'秩父',children:307,elem_m:34,elem_f:1,jhs_m:21,jhs_f:1,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'皆野町',lat:36.072,lng:139.111,region:'秩父',children:343,elem_m:15,elem_f:0,jhs_m:18,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'長瀞町',lat:36.108,lng:139.119,region:'秩父',children:226,elem_m:13,elem_f:1,jhs_m:13,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'小鹿野町',lat:36.021,lng:139.027,region:'秩父',children:303,elem_m:21,elem_f:2,jhs_m:24,jhs_f:0,hs_m:10,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'東秩父村',lat:36.068,lng:139.183,region:'秩父',children:57,elem_m:0,elem_f:0,jhs_m:0,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
];
const wardData = [
  {city:'さいたま市西区',lat:35.868,lng:139.567,region:'南部',children:4976,elem_m:0,elem_f:0,jhs_m:83,jhs_f:1,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:14},
  {city:'さいたま市北区',lat:35.908,lng:139.629,region:'南部',children:7130,elem_m:67,elem_f:4,jhs_m:189,jhs_f:39,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'さいたま市大宮区',lat:35.906,lng:139.624,region:'南部',children:6815,elem_m:467,elem_f:16,jhs_m:245,jhs_f:3,hs_m:383,hs_f:51,univ_m:0,univ_f:0,club_m:948,club_f:4},
  {city:'さいたま市見沼区',lat:35.919,lng:139.658,region:'南部',children:7120,elem_m:75,elem_f:1,jhs_m:236,jhs_f:4,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'さいたま市中央区',lat:35.88,lng:139.622,region:'南部',children:4830,elem_m:184,elem_f:8,jhs_m:72,jhs_f:2,hs_m:65,hs_f:5,univ_m:0,univ_f:0,club_m:221,club_f:0},
  {city:'さいたま市桜区',lat:35.852,lng:139.596,region:'南部',children:3964,elem_m:159,elem_f:20,jhs_m:93,jhs_f:1,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'さいたま市浦和区',lat:35.858,lng:139.642,region:'南部',children:10291,elem_m:884,elem_f:62,jhs_m:407,jhs_f:0,hs_m:484,hs_f:56,univ_m:0,univ_f:0,club_m:705,club_f:9},
  {city:'さいたま市南区',lat:35.829,lng:139.64,region:'南部',children:10220,elem_m:196,elem_f:16,jhs_m:166,jhs_f:1,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:36,club_f:0},
  {city:'さいたま市緑区',lat:35.859,lng:139.686,region:'南部',children:8950,elem_m:180,elem_f:7,jhs_m:151,jhs_f:0,hs_m:0,hs_f:0,univ_m:0,univ_f:0,club_m:0,club_f:0},
  {city:'さいたま市岩槻区',lat:35.946,lng:139.694,region:'南部',children:4261,elem_m:132,elem_f:8,jhs_m:134,jhs_f:7,hs_m:83,hs_f:6,univ_m:0,univ_f:0,club_m:87,club_f:0},
];
const cityMap = {};
cityData.forEach(d=>cityMap[d.city]=d);
wardData.forEach(d=>cityMap[d.city]=d);
const CATS = ['elem','jhs','hs','univ','club'];
const CAT_JP = {elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ',independent:'独立'};
// ── 状態 ────────────────────────────────────────────
let currentView     = 'choro';
let currentIndex    = 'abs';
let currentGender   = 'all';
let activeCats      = new Set(['elem','jhs','hs','univ','club','independent']);
const activeRegions = new Set(['南部','東部','西部','北部','秩父']); // 全地域固定
let useWardView     = false;
let selectedCity    = '';
let selectedCityCat = null;
let choroLayer      = null;
let popupLayer      = null; // ヒートマップ/バブル時のポップアップ用透明オーバーレイ
let bubbleLayer     = null;
let bubbleMarkers   = [];
let _gmDataLayer = null; let _gmBubbleItems = [];
let markerGroup     = null;
let showPins        = true;
let teamPinLayers   = [];
let _pinDataCache = [];   // {lat,lng,t} per filtered pin
let _clusterMarkers = []; // currently rendered markers (individual or cluster)
let _pinInfoWindow  = null;
let _cityInfoWindow = null; // choroLayer/popupLayer 共通IW（ピンクリック時に閉じる）
// 市町村ポップアップ用 InfoWindow を初期化（domready で max-height を強制適用）
function _ensureCityInfoWindow() {
  if (_cityInfoWindow) return _cityInfoWindow;
  _cityInfoWindow = new google.maps.InfoWindow();
  // popup の DOM 完成後に max-height を強制設定 + Google Maps が書き換えても元に戻す
  google.maps.event.addListener(_cityInfoWindow, 'domready', () => {
    const enforce = () => {
      const el = document.querySelector('.city-popup-wrap');
      if (!el) return;
      const maxH = Math.round(window.innerHeight * 0.45);
      el.style.setProperty('max-height', maxH + 'px', 'important');
      el.style.setProperty('overflow', 'hidden', 'important');
      el.style.setProperty('display', 'flex', 'important');
      el.style.setProperty('flex-direction', 'column', 'important');
      // 親の .gm-style-iw-d / .gm-style-iw-c も同じ高さに揃える
      let p = el.parentElement;
      while (p && p !== document.body) {
        if (p.classList && (p.classList.contains('gm-style-iw-d') || p.classList.contains('gm-style-iw-c'))) {
          p.style.setProperty('max-height', (maxH + 50) + 'px', 'important');
          p.style.setProperty('overflow', 'visible', 'important');
        }
        p = p.parentElement;
      }
    };
    setTimeout(enforce, 0);
    setTimeout(enforce, 50);
    setTimeout(enforce, 200);
  });
  return _cityInfoWindow;
}
let _markerClicked  = false; // mousedownで先行セット → Dataレイヤーclick抑制
let teamActiveCats  = new Set(['elem']);
let teamGender      = 'all';
let teamListOpen    = false;
let currentRankCat  = 'all';
let currentRankGender = 'all';
let areaFilterActive = false;
let userLocMarker   = null;
let _choroMaxCache = 1;
let _choroRateMaxCache = 1;
let _choroSortedCache = [];
let _choroRateSortedCache = [];
let teamData        = [];
// 小学生参加率（%）= 小学生競技者数 ÷ 児童数
// 現在の表示モード（abs/rate）に応じた値を返す
// ── Map init ─────────────────────────────────────────
window.onerror=function(msg,src,line,col,err){
  console.error('[GLOBAL ERROR]',msg,'@',src,line+':'+col);
  return false;
};
window.initMap = function() {
  // ─── InfoWindow 排他制御 ───
  // 同時に複数のポップアップが表示されないよう、 すべての InfoWindow を追跡し
  // 新しい open() が呼ばれたら他を自動的に close する
  if (!window.__infoWindowExclusivePatched) {
    window.__infoWindowExclusivePatched = true;
    window.__allInfoWindows = window.__allInfoWindows || new Set();
    const OrigIW = google.maps.InfoWindow;
    google.maps.InfoWindow = function(opts) {
      const iw = new OrigIW(opts);
      window.__allInfoWindows.add(iw);
      const origOpen = iw.open.bind(iw);
      iw.open = function() {
        // 自分以外の全 InfoWindow を閉じる（排他制御）
        window.__allInfoWindows.forEach(other => {
          if (other !== iw && typeof other.close === 'function') {
            try { other.close(); } catch(e) {}
          }
        });
        return origOpen.apply(iw, arguments);
      };
      return iw;
    };
    // プロトタイプチェーンを維持
    google.maps.InfoWindow.prototype = OrigIW.prototype;
  }

  // さいたま市選択時に全区をマッチさせるヘルパー
  function _cityMatch(teamCity, filterCity) {
    return teamCity === filterCity ||
      (filterCity === 'さいたま市' && teamCity.startsWith('さいたま市'));
  }

  function getFiltered() {
    const base = useWardView
      ? [...wardData, ...cityData.filter(d=>d.city!=='さいたま市')]
      : cityData;
    let result = base.filter(d=>activeRegions.has(d.region));
    if(areaFilterActive){
      const bounds = map.getBounds();
      result = result.filter(d => d.lat && d.lng && bounds.contains(new google.maps.LatLng(d.lat, d.lng)));
    }
    return result;
  }
  // 動的スケール用ヘルパー（0〜1の比率で白→赤を均等補間）
  function _dynColor(ratio){
    function lerp(a,b,t){return Math.round(a+(b-a)*t);}
    function rgb(r,g,b){return 'rgb('+r+','+g+','+b+')';}
    // 白→薄青→水色→緑→黄緑→黄→オレンジ→赤（均等8ステップ）
    const stops=[
      [0,  [255,255,255]],
      [1/7,[190,225,255]],
      [2/7,[ 80,190,220]],
      [3/7,[ 50,175,100]],
      [4/7,[180,220, 50]],
      [5/7,[255,200,  0]],
      [6/7,[255, 90,  0]],
      [7/7,[180,  0,  0]],
    ];
    const r=Math.max(0,Math.min(1,ratio));
    for(let i=1;i<stops.length;i++){
      const [t0,c0]=stops[i-1],[t1,c1]=stops[i];
      if(r<=t1+0.0001){
        const t=(r-t0)/(t1-t0);
        return rgb(lerp(c0[0],c1[0],t),lerp(c0[1],c1[1],t),lerp(c0[2],c1[2],t));
      }
    }
    return 'rgb(180,0,0)';
  }
  // パーセンタイルランクで ratio を計算（分布に偏りがあっても色が均等に出る）
  function _percentileRatio(v, sortedVals){
    if(!sortedVals || sortedVals.length===0) return 0;
    let lo=0, hi=sortedVals.length-1;
    while(lo<hi){ const mid=(lo+hi)>>1; if(sortedVals[mid]<v) lo=mid+1; else hi=mid; }
    return lo / (sortedVals.length - 1);
  }
  function choroColor(v, maxV){
    if(!v || isNaN(v)) return 'rgb(245,248,255)';
    return _dynColor(_percentileRatio(v, _choroSortedCache));
  }
  function choroColorRate(v, maxV){
    if(!v || isNaN(v)) return 'rgb(245,248,255)';
    return _dynColor(_percentileRatio(v, _choroRateSortedCache));
  }
  function calcVal(d){
    return calcValForCat(d, 'all');
  }
  function calcRate(d){
    if(!d.children || d.children===0) return 0;
    const elem = (currentGender==='all')   ? (d.elem_m||0)+(d.elem_f||0)
               : (currentGender==='male')  ? (d.elem_m||0)
               :                             (d.elem_f||0);
    return elem / d.children * 100;
  }
  function getDisplayVal(d){
    return currentIndex==='rate' ? calcRate(d) : calcVal(d);
  }
  function popupHTML(d){
    const total=calcVal(d);
    const male=CATS.reduce((s,c)=>s+(activeCats.has(c)?d[c+'_m']||0:0),0);
    const fem =CATS.reduce((s,c)=>s+(activeCats.has(c)?d[c+'_f']||0:0),0);
    const gL=currentGender==='all'?'合計':currentGender==='male'?'男子':'女子';
    const thisRate = d.children ? calcRate(d) : null;
    const rateStr  = thisRate !== null ? thisRate.toFixed(1)+'%' : '－';
    const childStr = d.children ? d.children.toLocaleString()+'人' : '－';
    // 県平均参加率（childrenデータのある市町村のみ）
    const allBase = useWardView ? [...wardData,...cityData.filter(x=>x.city!=='さいたま市')] : cityData;
    const withChildren = allBase.filter(x=>x.children>0);
    const avgRate = withChildren.length
      ? withChildren.reduce((s,x)=>s+calcRate(x),0)/withChildren.length : 0;
    // 比較ゲージ用スケール（最大値）
    const maxRate = Math.max(thisRate||0, avgRate, 1);
    const thisW   = thisRate !== null ? Math.round(thisRate/maxRate*100) : 0;
    const avgW    = Math.round(avgRate/maxRate*100);
    const diff    = thisRate !== null ? (thisRate - avgRate) : null;
    const diffStr = diff !== null
      ? (diff>=0?'▲ +':'▼ ')+Math.abs(diff).toFixed(1)+'%（県平均比）' : '';
    const diffColor = diff===null?'#888':diff>=0?'#059669':'#dc2626';
    // フィルター連動・県内順位（人数）
    const _filtered = getFiltered();
    const _sortedForRank = [..._filtered].sort((a,b)=>getDisplayVal(b)-getDisplayVal(a));
    const _rankIdx = _sortedForRank.findIndex(x=>x.city===d.city);
    const _rankTotal = _filtered.length; // 0件の市町村も含めた全体数
    const _rank = _rankIdx >= 0 ? _rankIdx + 1 : null;
    const _rankColor = _rank===1?'#d4a017':_rank===2?'#8a9aaa':_rank===3?'#b87333':'#555';
    const _rankLabel = _rank ? `第${_rank}位` : '－';
    const _rankMedal = _rank===1?'<span class="rank-medal gold">1</span>':_rank===2?'<span class="rank-medal silver">2</span>':_rank===3?'<span class="rank-medal bronze">3</span>':'';
    // 参加率順位（小学生・childrenデータあり）
    const _rateFiltered = _filtered.filter(x=>x.children>0);
    const _rateSorted = [..._rateFiltered].sort((a,b)=>calcRate(b)-calcRate(a));
    const _rateRankIdx = _rateSorted.findIndex(x=>x.city===d.city);
    const _rateRank = (thisRate!==null && _rateRankIdx>=0) ? _rateRankIdx+1 : null;
    const _rateRankTotal = _rateFiltered.length;
    const _rateRankColor = _rateRank===1?'#d4a017':_rateRank===2?'#8a9aaa':_rateRank===3?'#b87333':'#059669';
    const _rateRankMedal = _rateRank===1?'<span class="rank-medal gold">1</span>':_rateRank===2?'<span class="rank-medal silver">2</span>':_rateRank===3?'<span class="rank-medal bronze">3</span>':'';
    // チームバッジ
    const CAT_COLORS2={elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626',independent:'#64748b'};
    const CAT_JP3={elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ',independent:'独立'};
    const cityTeams=teamData.filter(t=>t.city===d.city);
    let teamSection='';
    if(cityTeams.length){
      const catCounts={};
      cityTeams.forEach(t=>{catCounts[t.cat]=(catCounts[t.cat]||0)+1;});
      const badges=Object.entries(catCounts).map(([c,n])=>
        `<span class="pu-cat-badge" style="background:${CAT_COLORS2[c]||'#888'};"
          onclick="window.applyCityFilterByCat('${d.city}','${c}')" title="${CAT_JP3[c]||c}チームを一覧表示">
          ${n} ${CAT_JP3[c]||c} ▶
        </span>`).join('');
      teamSection=`<div class="pu-teams-section">
        <div class="pu-teams-title">登録チーム ${cityTeams.length}件 <span style="font-size:8px;color:#999;font-weight:400;">タップで一覧</span></div>
        <div class="pu-cat-row">${badges}</div>
      </div>`;
    }
    // カテゴリ別グリッド
    const CAT_COLORS3={elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626',independent:'#64748b'};
    const catGrid=[...activeCats].map(c=>{
      const n=calcSingle(d,c);
      return `<div class="pu-cat-cell" onclick="window.applyCityFilterByCat('${d.city}','${c}')" title="${CAT_JP[c]}チームを一覧表示">
        <div class="pu-cat-cell-num" style="color:${CAT_COLORS3[c]};">${n}</div>
        <div class="pu-cat-cell-lbl">${CAT_JP[c]} <span style="font-size:8px;color:#999;">▶</span></div>
      </div>`;
    }).join('');
    return `<div class="city-popup-wrap" style="max-height:45vh !important;overflow:hidden !important;display:flex !important;flex-direction:column !important">
      <div class="pu-header">
        <div class="pu-city">${d.city}</div>
        <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:3px;">
          ${_rank ? `<span style="display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:#eff6ff;color:${_rankColor};border:1px solid ${_rankColor}40;">${_rankMedal}人数 ${_rankLabel}<span style="font-size:8px;font-weight:400;color:#999;margin-left:1px;">/${_rankTotal}</span></span>` : ''}
          ${_rateRank ? `<span style="display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:#ecfdf5;color:${_rateRankColor};border:1px solid ${_rateRankColor}40;">${_rateRankMedal}参加率 第${_rateRank}位<span style="font-size:8px;font-weight:400;color:#999;margin-left:1px;">/${_rateRankTotal}</span></span>` : ''}
          ${thisRate !== null ? `
          <div class="pu-rate-chip">
            <span class="pu-rate-chip-label">小学生参加率</span>
            <span class="pu-rate-chip-val">${rateStr}</span>
          </div>` : ''}
        </div>
      </div>
      <div class="pu-body">
        <div class="pu-row pu-row-total"><span>${gL}計</span><span>${total}人</span></div>
        ${currentGender==='all'?`
        <div class="pu-row pu-row-sub"><span>　男子</span><span>${male}人</span></div>
        <div class="pu-row pu-row-sub"><span>　女子</span><span>${fem}人</span></div>`:''}
        <div class="pu-cat-grid">${catGrid}</div>
        <div class="pu-row pu-row-sub" style="font-size:10px;border-top:1px solid rgba(15,30,58,0.06);padding-top:4px;">
          <span>児童数（公立小学校在籍）</span><span style="color:#999;">${childStr}</span>
        </div>
        ${thisRate !== null ? `
        <div class="pu-rate-cmp">
          <div class="pu-rate-cmp-title">小学生参加率 県平均比較</div>
          <div class="pu-rate-cmp-row">
            <span class="pu-rate-cmp-lbl">この市町村</span>
            <div class="pu-rate-cmp-bar">
              <div class="pu-rate-cmp-fill" style="width:${thisW}%;background:var(--action);"></div>
            </div>
            <span class="pu-rate-cmp-val" style="color:#3b82f6;">${thisRate.toFixed(1)}%</span>
          </div>
          <div class="pu-rate-cmp-row">
            <span class="pu-rate-cmp-lbl">県平均</span>
            <div class="pu-rate-cmp-bar">
              <div class="pu-rate-cmp-fill" style="width:${avgW}%;background:#c0cce0;"></div>
            </div>
            <span class="pu-rate-cmp-val" style="color:#999;">${avgRate.toFixed(1)}%</span>
          </div>
          <div class="pu-rate-diff" style="color:${diffColor};">${diffStr}</div>
        </div>` : ''}
        ${teamSection}
      </div>
      <div class="pu-foot">
        <button class="pu-btn pu-btn-chart" onclick="window.openChartModal('${d.city}')"><span class="msi" style="font-size:14px">bar_chart</span>詳細グラフ</button>
        <button class="pu-btn pu-btn-cmp" onclick="window.openCmpModal('${d.city}')"><span class="msi" style="font-size:14px">balance</span>比較</button>
      </div>
    </div>`;
  }
  function calcSingle(d,c){
    if(currentGender==='all') return (d[c+'_m']||0)+(d[c+'_f']||0);
    return currentGender==='male'?d[c+'_m']||0:d[c+'_f']||0;
  }
  function isMobile(){
    const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    return ua || window.innerWidth <= 768;
  }
  // ── Google Maps 初期化 ──
  const SAITAMA_BOUNDS_ARRAY = [[35.77, 138.95], [36.28, 139.92]];
  // 前回表示位置を復元（24時間以内のみ）
  const LAST_VIEW_KEY = 'mapLastView';
  const LAST_VIEW_TTL = 24 * 60 * 60 * 1000;
  let initialCenter = { lat: 36.0, lng: 139.4 };
  let initialZoom = 9;
  try {
    const raw = localStorage.getItem(LAST_VIEW_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (v && v.ts && (Date.now() - v.ts < LAST_VIEW_TTL) && typeof v.lat === 'number' && typeof v.lng === 'number') {
        initialCenter = { lat: v.lat, lng: v.lng };
        if (typeof v.zoom === 'number' && v.zoom >= 7 && v.zoom <= 18) initialZoom = v.zoom;
      }
    }
  } catch(e) {}
  const map = new google.maps.Map(document.getElementById('map'), {
    center: initialCenter,
    zoom: initialZoom,
    mapId: 'DEMO_MAP_ID',
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    rotateControl: false,
    // cameraControl: Google Maps 新機能（3D傾き・回転） — このマップでは不要なので明示的に無効化
    cameraControl: false,
    zoomControl: true,
    zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
  });
  // idle時に表示位置を保存（debounce）+ スケルトン非表示
  let _saveViewT = null;
  let _skeletonHidden = false;
  map.addListener('idle', () => {
    if (!_skeletonHidden) {
      const sk = document.getElementById('map-skeleton');
      if (sk) sk.classList.add('hidden');
      _skeletonHidden = true;
    }
    clearTimeout(_saveViewT);
    _saveViewT = setTimeout(() => {
      try {
        const c = map.getCenter();
        if (!c) return;
        localStorage.setItem(LAST_VIEW_KEY, JSON.stringify({
          lat: c.lat(), lng: c.lng(), zoom: map.getZoom(), ts: Date.now()
        }));
      } catch(e) {}
    }, 800);
  });
  // 安全策：4秒経過したら強制的にスケルトン非表示
  setTimeout(() => {
    const sk = document.getElementById('map-skeleton');
    if (sk && !_skeletonHidden) { sk.classList.add('hidden'); _skeletonHidden = true; }
  }, 4000);
  // ボタンをGoogleマップのコントロールレイヤーに登録（重なり防止）
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
    document.getElementById('map-type-bar')
  );
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(
    document.getElementById('map-action-btns')
  );
  const SAITAMA_BOUNDS = new google.maps.LatLngBounds(
    {lat: 35.77, lng: 138.95},
    {lat: 36.28, lng: 139.92}
  );
  function maxVal(){
    const base=useWardView?[...wardData,...cityData.filter(d=>d.city!=='さいたま市')]:cityData;
    return Math.max(...base.map(getDisplayVal),1);
  }
  // ── BUBBLE ──
  function updateBubble(data){
    removeBubble();
    const mx=maxVal();
    const iw = new google.maps.InfoWindow();
    data.forEach(d=>{
      const v=getDisplayVal(d),r=Math.sqrt(v/mx)*30+4;
      const pct=v/mx;
      const col=pct>.7?'#ff3300':pct>.45?'#ff8800':pct>.25?'#ffcc00':pct>.12?'#00ee88':'#0088ff';
      const el=document.createElement('div');
      el.style.cssText=`width:${r*2}px;height:${r*2}px;border-radius:50%;background:${col};opacity:.7;border:1px solid rgba(255,255,255,.35);cursor:pointer`;
      const m=new google.maps.marker.AdvancedMarkerElement({position:{lat:d.lat,lng:d.lng},content:el,title:d.city,map});
      m._data=d;
      m.addEventListener('gmp-click',()=>{iw.setContent(popupHTML(d));iw.open({map, anchor: m});});
      bubbleMarkers.push(m);
    });
  }
  function removeBubble(){bubbleMarkers.forEach(m=>m.map=null);bubbleMarkers=[];}
  // ── CHORO ──
  // ヒートマップ/バブル用・透明ポップアップオーバーレイ
  function initPopupLayer() {
    if (popupLayer) { popupLayer.setMap(null); popupLayer = null; }
    const geo = useWardView ? geoDataWard : geoDataCity;
    popupLayer = new google.maps.Data({map: null});
    popupLayer.addGeoJson(geo);
    popupLayer.setStyle({ fillOpacity: 0, strokeOpacity: 0, strokeWeight: 0 });
    popupLayer.addListener('click', function(event) {
      if (_markerClicked) return;
      const name = event.feature.getProperty('name') || '';
      const d = cityMap[name];
      if (!d) return;
      _ensureCityInfoWindow();
      _cityInfoWindow.setContent(popupHTML(d));
      _cityInfoWindow.setPosition(event.latLng);
      _cityInfoWindow.open(map);
      _filterCityOnly(d.city);
      setTimeout(_panForPopup, 300);
      // アナリティクス: 市町村ポップアップ表示
      if (window.Analytics) window.Analytics.municipalityView(d.city);
    });
  }
  function showPopupLayer() {
    if (!popupLayer) initPopupLayer();
    popupLayer.setMap(map);
  }
  function hidePopupLayer() {
    if (popupLayer) popupLayer.setMap(null);
  }

  function updateChoro(){
    if(choroLayer){choroLayer.setMap(null);choroLayer=null;}
    const base = useWardView
      ? [...wardData,...cityData.filter(d=>d.city!=='さいたま市')]
      : cityData;
    let activeData = base.filter(d => activeRegions.has(d.region));
    if(areaFilterActive){
      const bounds = map.getBounds();
      activeData = activeData.filter(d => d.lat && d.lng && bounds.contains(new google.maps.LatLng(d.lat, d.lng)));
    }
    _choroMaxCache = Math.max(1, ...activeData.map(d => calcVal(d)));
    _choroSortedCache = activeData.map(d=>calcVal(d)).filter(v=>v>0).sort((a,b)=>a-b);
    _choroRateSortedCache = activeData.map(d=>calcRate(d)).filter(v=>v>0).sort((a,b)=>a-b);
    _choroRateMaxCache = Math.max(1, ...activeData.map(d => calcRate(d)));
    const geo = useWardView ? geoDataWard : geoDataCity;
    _ensureCityInfoWindow();
    const iw = _cityInfoWindow;
    choroLayer = new google.maps.Data({map});
    choroLayer.addGeoJson(geo);
    choroLayer.setStyle(function(feature){
      const name = feature.getProperty('name') || '';
      const d = cityMap[name];
      if(!d || !activeRegions.has(d.region)) return {fillColor:'#f5f5f5',strokeColor:'#e0e0de',strokeWeight:0.8,fillOpacity:0.5};
      if(areaFilterActive && d.lat && d.lng && !map.getBounds().contains(new google.maps.LatLng(d.lat, d.lng)))
        return {fillColor:'#e8eef4',strokeColor:'#e0e0de',strokeWeight:0.5,fillOpacity:0.3};
      const dv = currentIndex==='rate' ? calcRate(d) : calcVal(d);
      const fc = currentIndex==='rate' ? choroColorRate(dv,_choroRateMaxCache) : choroColor(dv,_choroMaxCache);
      return {fillColor:fc,strokeColor:'rgba(255,255,255,0.6)',strokeWeight:1,fillOpacity:0.85};
    });
    choroLayer.addListener('mouseover', function(event){
      choroLayer.overrideStyle(event.feature, {strokeWeight:2,strokeColor:'rgba(255,255,255,0.9)',fillOpacity:0.95});
    });
    choroLayer.addListener('mouseout', function(event){
      choroLayer.revertStyle(event.feature);
    });
    choroLayer.addListener('click', function(event){
      if (_markerClicked) return;
      const name = event.feature.getProperty('name') || '';
      const d = cityMap[name];
      if(!d) return;
      iw.setContent(popupHTML(d));
      iw.setPosition(event.latLng);
      iw.open(map);
      choroLayer.overrideStyle(event.feature,{strokeWeight:2,strokeColor:'rgba(255,255,255,0.9)',fillOpacity:0.92});
      _filterCityOnly(d.city);
      setTimeout(() => {
        google.maps.event.addListenerOnce(iw, 'closeclick', () => {
          choroLayer.revertStyle(event.feature);
          _filterCityOnly(null);
        });
      }, 0);
    });
  }
  function removeChoro(){if(choroLayer){choroLayer.setMap(null);choroLayer=null;}}
  // ── UPDATE ALL ──
  const RANK_CAT_COLORS = {all:'#555',elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626',independent:'#64748b'};
  function calcValForCat(d, cat) {
    // all_male / elem_female 等の男女別ランキングに対応
    let genderOverride = null;
    let baseCat = cat;
    if (cat && cat.endsWith('_male'))   { baseCat = cat.replace('_male','');   genderOverride = 'male'; }
    if (cat && cat.endsWith('_female')) { baseCat = cat.replace('_female',''); genderOverride = 'female'; }
    const g = genderOverride || currentGender;
    const cats = baseCat === 'all' ? Array.from(activeCats) : (activeCats.has(baseCat) ? [baseCat] : []);
    let v = 0;
    cats.forEach(c => {
      if (g==='all')    v += (d[c+'_m']||0)+(d[c+'_f']||0);
      else if (g==='male')   v += (d[c+'_m']||0);
      else              v += (d[c+'_f']||0);
    });
    return v;
  }
  function updateRanking(data) {
    const rl = document.getElementById('rank-list'); rl.innerHTML = '';
    const isRate = currentIndex==='rate';
    const getVal = d => isRate ? calcRate(d) : calcValForCat(d, currentRankCat);
    const sorted = [...data].sort((a,b)=>getVal(b)-getVal(a));
    const MEDALS = ['<span class="rank-medal gold">1</span>','<span class="rank-medal silver">2</span>','<span class="rank-medal bronze">3</span>'];
    // TOP10を先に収集して最大値を確定
    const top10 = [];
    let rank = 0;
    for (const d of sorted) {
      const v = getVal(d);
      if (v <= 0) continue;
      rank++;
      if (rank > 10) break;
      top10.push({ d, v, rank });
    }
    const maxV = top10.length > 0 ? top10[0].v : 1;
    top10.forEach(({ d, v, rank }) => {
      const li = document.createElement('li');
      const isTop3 = rank <= 3;
      li.className = 'rank-item' + (isTop3 ? ' top3-item' : '');
      const medalOrNum = isTop3
        ? `<span class="rank-medal">${MEDALS[rank-1]}</span>`
        : `<span class="rank-num">${rank}</span>`;
      const valStr = isRate
        ? `${v.toFixed(1)}<span>%</span>`
        : `${Math.round(v).toLocaleString()}<span>人</span>`;
      const barPct = Math.round(v / maxV * 100);
      li.innerHTML = `
        <div class="rank-row">
          ${medalOrNum}
          <span class="rank-city">${d.city}</span>
          <span class="rank-val">${valStr}</span>
        </div>
        <div class="rank-bar-wrap">
          <div class="rank-bar-track">
            <div class="rank-bar-fill" style="width:${barPct}%"></div>
          </div>
        </div>`;
      li.onclick = () => { if(window.focusCity) window.focusCity(d.city); };
      // 比較ボタン
      const cmpBtn = document.createElement('button');
      cmpBtn.className = 'rank-cmp-btn';
      cmpBtn.innerHTML = '<span class="msi" style="font-size:14px">balance</span>';
      cmpBtn.title = `${d.city}を比較`;
      cmpBtn.onclick = e => { e.stopPropagation(); window.openCmpModal(d.city); };
      li.querySelector('.rank-row').appendChild(cmpBtn);
      rl.appendChild(li);
    });
  }
  // ランキング: カテゴリプルダウン変更
  window._onRankCatChange = function(cat) {
    // 参加率モードは小学生固定（念のため防衛）
    if (currentIndex === 'rate') return;
    currentRankCat = cat;
    _updateRankingFromUI();
  };
  // ランキング: 男女ボタン
  window._onRankGender = function(g) {
    currentRankGender = g;
    // ボタンスタイル更新
    ['all','male','fem'].forEach(x => {
      const btn = document.getElementById('rgb-' + x);
      if (!btn) return;
      const isOn = (x === 'all' && g === 'all') || (x === 'male' && g === 'male') || (x === 'fem' && g === 'female');
      btn.style.background = isOn ? '#2563eb' : '#f0efed';
      btn.style.color      = isOn ? '#fff'    : '#555';
      btn.style.fontWeight = isOn ? '700'     : '400';
    });
    _updateRankingFromUI();
  };
  // ランキング: カテゴリ+男女からcurrentRankCatを組み立てて更新
  function _updateRankingFromUI() {
    const baseCat = currentRankCat.replace(/_male$|_female$/,'');
    const isRate  = currentIndex === 'rate';
    // 参加率モードは全体固定
    const g = isRate ? 'all' : currentRankGender;
    const composed = g === 'all' ? baseCat : baseCat + '_' + g;
    window.setRankCat(composed);
  }
  window.setRankCat = function(cat) {
    currentRankCat = cat;
    updateRanking(getFiltered());
  };
  function updateHeaderBadges(){
    // 現在のフィルター状態（gender, selectedCity, areaFilter）を反映したチーム数をバッジに表示
    const bounds = areaFilterActive ? map.getBounds() : null;
    const counts = {elem:0,jhs:0,hs:0,univ:0,club:0,independent:0};
    teamData.forEach(t => {
      if(currentGender==='male'   && t.gender==='female') return;
      if(currentGender==='female' && t.gender==='male')   return;
      if(selectedCity && !_cityMatch(t.city, selectedCity)) return;
      if(bounds && !(t.lat && t.lng && bounds.contains([t.lat,t.lng]))) return;
      if(counts[t.cat] !== undefined) counts[t.cat]++;
    });
    const lbl = {elem:'小',jhs:'中',hs:'高',univ:'大',club:'企',independent:'独'};
    const ids  = {elem:'hdr-cat-elem',jhs:'hdr-cat-jhs',hs:'hdr-cat-hs',univ:'hdr-cat-univ',club:'hdr-cat-club',independent:'hdr-cat-ind'};
    Object.entries(ids).forEach(([cat,eid])=>{
      const el = document.getElementById(eid);
      if(el) el.innerHTML = counts[cat]+'<span class="hdr-cat-lbl">'+lbl[cat]+'</span>';
    });
  }

  function update(){
    const data=getFiltered();
    // header stat
    const total = currentIndex==='rate'
      ? (data.reduce((s,d)=>s+calcRate(d),0)/data.length)
      : data.reduce((s,d)=>s+calcVal(d),0);
    document.getElementById('hdr-p').textContent =
      currentIndex==='rate' ? total.toFixed(1)+'%平均' : Math.round(total).toLocaleString();
    // 市区町村数
    const cityEl = document.getElementById('hdr-city-count');
    const cityLbl = document.getElementById('hdr-city-lbl');
    if(cityEl) cityEl.textContent = data.length;
    if(cityLbl) cityLbl.textContent = useWardView ? '市区町村' : '市町村';
    // ranking
    updateRanking(data);
    // layers
    if(currentView==='choro'){removeBubble();hidePopupLayer();updateChoro();}
    else{removeChoro();updateBubble(data);showPopupLayer();}
    // 凡例の動的最大値更新（choroが計算した後に呼ぶ）
    updateLegend();
    updateHeaderBadges();
  }
  update();
  // 初期表示を埼玉県全域にフィット（サイドバー幅考慮）
  const _fitSaitama = () => {
    const sidebarW = !isMobile() ? 280 : 0;
    map.fitBounds(SAITAMA_BOUNDS, {
      left: sidebarW + 10, top: 10, right: 10, bottom: 10
    });
  };
  setTimeout(_fitSaitama, 300);
  google.maps.event.addListenerOnce(map, 'idle', _fitSaitama);
  // ── CONTROLS ──
  // ── 凡例 動的更新 ──────────────────────────────────
  function updateLegend() {
    // コロプレス凡例の最大値ラベルを動的更新
    const maxAbs = _choroMaxCache || 1;
    const maxRate = _choroRateMaxCache || 1;
    // 「少 / 多」ラベルは変わらないが、最大値を注記として表示
    const choroSec = document.getElementById('leg-choro');
    if (choroSec) {
      let note = choroSec.querySelector('[data-choro-note]');
      if (!note) {
        note = document.createElement('div');
        note.setAttribute('data-choro-note','1');
        note.style.cssText = 'font-size:9px;color:#999;margin-top:4px;';
        choroSec.appendChild(note);
      }
      note.textContent = `最大: ${Math.round(maxAbs).toLocaleString()}人（現在の表示条件）`;
    }
    const rateSec = document.getElementById('leg-rate');
    if (rateSec) {
      let note = rateSec.querySelector('[data-rate-note]');
      if (!note) {
        note = document.createElement('div');
        note.setAttribute('data-rate-note','1');
        note.style.cssText = 'font-size:9px;color:#999;margin-top:4px;';
        rateSec.appendChild(note);
      }
      note.textContent = `最大: ${maxRate.toFixed(1)}%（現在の表示条件）`;
    }
  }
  // ═══════════════════════════════════════
  // URL状態保存・復元
  // ═══════════════════════════════════════

  // ═══════════════════════════════════════
  // 表示エリア絞り込み
  // ═══════════════════════════════════════
  function _syncFabArea() {
    const aBtn = document.getElementById('mfi-area');
    const clr  = document.getElementById('mfi-area-clear');
    if (aBtn) aBtn.classList.toggle('active', areaFilterActive);
    if (clr)  clr.style.display = areaFilterActive ? '' : 'none';
  }

  window.toggleAreaFilter = function(){
    areaFilterActive = !areaFilterActive;
    const btn = document.getElementById('btn-area-filter');
    const clearBtn = document.getElementById('btn-area-filter-clear');
    if (btn) btn.classList.toggle('active', areaFilterActive);
    if (clearBtn) clearBtn.classList.toggle('show', areaFilterActive);
    _syncFabArea();
    update();
    _pushState();
  };

  window.clearAreaFilter = function(){
    areaFilterActive = false;
    const btn = document.getElementById('btn-area-filter');
    const clearBtn = document.getElementById('btn-area-filter-clear');
    if (btn) btn.classList.remove('active');
    if (clearBtn) clearBtn.classList.remove('show');
    _syncFabArea();
    update();
    _pushState();
    if (window.Toast) Toast.show('表示範囲の絞込を解除しました', { type: 'success' });
  };

  // チーム情報修正の提案フォームを開く（GoogleフォームURLが設定されていればプリフィルで開く）
  window.reportTeamInfo = function(teamName) {
    try {
      if (window.Analytics) window.Analytics.infoMissingReport('team:' + (teamName || 'unknown'), 'team_report_form');
      const cfg = window.APP_CONFIG || {};
      const formUrl = cfg.TEAM_INFO_FORM_URL || '';
      if (formUrl) {
        // Google フォームの場合は ?usp=pp_url 形式
        const sep = formUrl.includes('?') ? '&' : '?';
        // entry.1520807350 = チーム名フィールド (埼玉県競技者人口マップ 情報提供フォーム)
        const url = formUrl + sep + 'usp=pp_url&entry.1520807350=' + encodeURIComponent(teamName || '');
        window.open(url, '_blank', 'noopener');
      } else {
        // フォーム未設定時はお問い合わせページにフォールバック
        const fallback = cfg.CONTACT_URL || 'https://www.saitamabaseball.com/contact-8';
        window.open(fallback, '_blank', 'noopener');
        if (window.Toast) Toast.show('お問い合わせページへ移動します（' + (teamName || '') + '）', { duration: 3000 });
      }
    } catch(e) { console.warn('reportTeamInfo', e); }
  };

  // 現在の表示状態をクリップボードにコピー（共有用）
  window.shareCurrentView = function() {
    try {
      // 最新の状態をURLに反映してから取得
      _pushState();
      const url = window.location.href;
      const useNative = navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (useNative) {
        navigator.share({
          title: '埼玉県野球チームマップ',
          text: '埼玉県の野球チーム分布を表示しています',
          url: url
        }).catch(() => {
          // キャンセル時など → クリップボードコピーにフォールバック
          _copyToClipboard(url);
        });
      } else {
        _copyToClipboard(url);
      }
    } catch(e) { console.warn('share', e); }
  };
  function _copyToClipboard(text) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => { if (window.Toast) Toast.show('共有リンクをコピーしました', { type: 'success' }); },
        () => { fallback(); if (window.Toast) Toast.show('共有リンクをコピーしました', { type: 'success' }); }
      );
    } else {
      fallback();
      if (window.Toast) Toast.show('共有リンクをコピーしました', { type: 'success' });
    }
  }

  // すべての絞込をリセット（空状態カードから呼ばれる）
  window.clearAllFilters = function() {
    try {
      // 性別フィルター
      currentGender = 'all';
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.toggle('on', b.dataset.gender === 'all'));
      // 市町村絞込
      if (typeof window.clearCityFilter === 'function') window.clearCityFilter();
      // エリア絞込
      areaFilterActive = false;
      document.getElementById('btn-area-filter')?.classList.remove('active');
      document.getElementById('btn-area-filter-clear')?.classList.remove('show');
      _syncFabArea && _syncFabArea();
      // タブを全件に
      if (typeof window.setTlpTab === 'function') window.setTlpTab('all');
      // 検索キーワード
      const ts = document.getElementById('tlp-search-input');
      if (ts) ts.value = '';
      const hs = document.getElementById('hdr-search-input');
      if (hs) hs.value = '';
      update();
      _pushState && _pushState();
      if (window.Toast) Toast.show('絞込をリセットしました', { type: 'success' });
    } catch(e) { console.warn('clearAllFilters', e); }
  };

  // 地図移動時にエリアフィルター中なら再描画
  // ポップアップがパネルに隠れないよう自動パン
  // ポップアップ連動：ズーム・再表示なしで絞り込みだけ行う
  // ── ヘッダーチーム名検索 ─────────────────────────────
  const CAT_COLOR_MAP = {elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626',independent:'#64748b'};
  let _hdrMatches = [];
  window.onHdrSearch = function(val) {
    const q = val.trim();
    const clearBtn = document.getElementById('hdr-search-clear');
    const dd = document.getElementById('hdr-search-dropdown');
    clearBtn.classList.toggle('show', q.length > 0);
    if (!q) { dd.classList.remove('show'); dd.innerHTML=''; _hdrMatches=[]; return; }
    // チーム名・市町村名で前方一致→部分一致の順でソート
    const q_lc = q.toLowerCase();
    _hdrMatches = teamData
      .filter(t => t.name.toLowerCase().includes(q_lc) || t.city.includes(q))
      .sort((a,b) => {
        const aStart = a.name.toLowerCase().startsWith(q_lc) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(q_lc) ? 0 : 1;
        return aStart - bStart || a.name.localeCompare(b.name,'ja');
      })
      .slice(0, 30);
    let html = '';
    if (_hdrMatches.length) {
      html = _hdrMatches.map((t,i) =>
        `<div class="hdr-sd-item" onclick="window.hdrSearchJump(${i})">
          <div class="hdr-sd-dot" style="background:${CAT_COLOR_MAP[t.cat]||'#888'};"></div>
          <div class="hdr-sd-name">${t.name}</div>
          <div class="hdr-sd-city">${t.city}</div>
        </div>`
      ).join('');
    }
    // 住所検索オプション（2文字以上で常に表示）
    if (q.length >= 2) {
      html += `<div class="hdr-sd-addr" id="hdr-addr-btn" onclick="window.searchByAddress()">
        <span class="addr-icon msi" style="font-size:16px">place</span>
        <span class="addr-text">
          「<strong>${q}</strong>」の住所で近くのチームを検索
          <span class="addr-sub">Enterキーでも検索できます</span>
        </span>
      </div>`;
    }
    if (!html) {
      html = '<div class="hdr-sd-empty">見つかりません</div>';
    }
    dd.innerHTML = html;
    dd.classList.add('show');
  };

  // Enterキー: チームマッチがあれば最初のチームへ、なければ住所検索
  window.hdrSearchEnter = function() {
    if (_hdrMatches.length > 0) {
      window.hdrSearchJump(0);
    } else {
      window.searchByAddress();
    }
  };

  // ── 住所ジオコーディング（Nominatim + GSI フォールバック）──
  const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search?format=json&countrycodes=jp&limit=3&q=';

  async function _geocodeAddress(query) {
    // 1) Nominatim (OpenStreetMap) を試行
    try {
      const nRes = await fetch(NOMINATIM_API + encodeURIComponent(query + ' 埼玉県'), {
        headers: { 'Accept-Language': 'ja' }
      });
      if (nRes.ok) {
        const nData = await nRes.json();
        if (nData && nData.length > 0) {
          return [parseFloat(nData[0].lat), parseFloat(nData[0].lon)];
        }
      }
      // 「埼玉県」なしで再試行
      const nRes2 = await fetch(NOMINATIM_API + encodeURIComponent(query), {
        headers: { 'Accept-Language': 'ja' }
      });
      if (nRes2.ok) {
        const nData2 = await nRes2.json();
        if (nData2 && nData2.length > 0) {
          return [parseFloat(nData2[0].lat), parseFloat(nData2[0].lon)];
        }
      }
    } catch(e) { console.warn('Nominatim failed:', e.message); }

    // 2) GSI (国土地理院) フォールバック
    try {
      const gRes = await fetch('https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + encodeURIComponent(query + ' 埼玉'));
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData && gData.length > 0) {
          const [lng, lat] = gData[0].geometry.coordinates;
          return [lat, lng];
        }
      }
    } catch(e) { console.warn('GSI fallback failed:', e.message); }

    return null;
  }

  window.searchByAddress = async function() {
    const q = (document.getElementById('hdr-search-input').value || '').trim();
    if (!q) return;
    const dd = document.getElementById('hdr-search-dropdown');
    const addrBtn = document.getElementById('hdr-addr-btn');
    if (addrBtn) { addrBtn.classList.add('loading'); addrBtn.querySelector('.addr-text').innerHTML = '<span class="msi" style="font-size:13px;vertical-align:-2px">refresh</span> 「' + q + '」を検索中...'; }

    try {
      const coords = await _geocodeAddress(q);
      dd.classList.remove('show');
      if (coords) {
        _cachedUserLoc = { lat: coords[0], lng: coords[1], _ts: Date.now() };
        _doNearbySearch(coords[0], coords[1], false);
      } else {
        if (addrBtn) {
          addrBtn.classList.remove('loading');
          addrBtn.querySelector('.addr-text').innerHTML = '<span class="msi" style="font-size:13px;vertical-align:-2px;color:#dc2626">error</span> 住所が見つかりませんでした。もう少し詳しく入力してください。';
          dd.classList.add('show');
          setTimeout(() => { dd.classList.remove('show'); }, 3000);
        }
      }
    } catch(e) {
      console.error('Address geocode error:', e);
      if (addrBtn) {
        addrBtn.classList.remove('loading');
        addrBtn.querySelector('.addr-text').innerHTML = '<span class="msi" style="font-size:13px;vertical-align:-2px;color:#dc2626">error</span> 検索に失敗しました';
        setTimeout(() => { dd.classList.remove('show'); }, 2000);
      }
    }
  };
  window.hdrSearchJump = function(idx) {
    const t = _hdrMatches[idx];
    if (!t) return;
    document.getElementById('hdr-search-input').value = t.name;
    document.getElementById('hdr-search-dropdown').classList.remove('show');
    document.getElementById('hdr-search-clear').classList.add('show');

    // サイドバー検索にも反映してチームリストをフィルタリング
    const sideSearch = document.getElementById('team-search');
    if (sideSearch) {
      sideSearch.value = t.name;
      const sideBtn = document.getElementById('search-clear');
      if (sideBtn) sideBtn.classList.add('show');
    }
    renderTeamPins(); // フィルター適用

    // チームリストパネルを開く
    if (!teamListOpen) window.toggleTeamList();

    // 小学生チームはピンにジャンプ
    if (t.cat === 'elem') {
      // ピンのマーカーを名前で検索（座標ずれを考慮）
      const _findAndOpenPin = () => {
        let found = false;
        teamPinLayers.forEach(marker => {
          if (marker._teamName === t.name) {
            map.setCenter(marker.position); map.setZoom(15);
            setTimeout(() => {
              const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
              _iw.open({map, anchor: marker});
            }, 300);
            found = true;
          }
        });
        return found;
      };
      if (!showPins) { showPins=true; const cb=document.getElementById('chk-pins'); if(cb) cb.checked=true; renderTeamPins(); }
      // 活動場所座標を優先
      const _pc = (t.place && t.place!=='-') ? PLACE_COORDS[t.place] : null;
      const _lat = _pc ? _pc[0] : t.lat;
      const _lng = _pc ? _pc[1] : t.lng;
      if (_lat && _lng) {
        map.setCenter({lat:_lat, lng:_lng}); map.setZoom(16);
        setTimeout(_findAndOpenPin, 500);
      }
    } else {
      // その他カテゴリは市町村にズーム＋ポップアップ表示
      const cityEntry = (useWardView?[...wardData,...cityData.filter(x=>x.city!=='さいたま市')]:cityData)
        .find(x=>x.city===t.city);
      if (cityEntry) {
        map.setCenter({lat:cityEntry.lat, lng:cityEntry.lng}); map.setZoom(13);
        // チーム情報のポップアップを表示
        setTimeout(() => {
          const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
          _iw.setPosition(new google.maps.LatLng(cityEntry.lat, cityEntry.lng));
          _iw.open(map);
          _panForPopup();
        }, 400);
      }
    }

    // モバイルではサイドバーを閉じる
    if (isMobile()) {
      const sb = document.getElementById('sidebar');
      const bd = document.getElementById('backdrop');
      const hb = document.getElementById('hbg');
      if (sb) sb.style.transform = 'translateX(100%)';
      if (bd) bd.classList.remove('show');
      if (hb) hb.classList.remove('open');
    }
  };
  window.clearHdrSearch = function() {
    document.getElementById('hdr-search-input').value = '';
    document.getElementById('hdr-search-dropdown').classList.remove('show');
    document.getElementById('hdr-search-clear').classList.remove('show');
    _hdrMatches = [];
    // サイドバー検索もクリア
    const sideSearch = document.getElementById('team-search');
    if (sideSearch && sideSearch.value) {
      sideSearch.value = '';
      const sideBtn = document.getElementById('search-clear');
      if (sideBtn) sideBtn.classList.remove('show');
      filterTeamPins();
    }
  };
  // ドロップダウン外クリックで閉じる
  document.addEventListener('click', e => {
    const wrap = document.getElementById('hdr-search-wrap');
    if (wrap && !wrap.contains(e.target)) {
      document.getElementById('hdr-search-dropdown').classList.remove('show');
    }
  });

  // ── チームリスト内 検索→地図ジャンプ ──────────────────
  let _tlpMatches = [];
  window.onTlpSearch = function(val) {
    const q = val.trim();
    const clearBtn = document.getElementById('tlp-search-clear-btn');
    const dd = document.getElementById('tlp-search-dd');
    clearBtn.classList.toggle('show', q.length > 0);
    if (!q) { dd.classList.remove('show'); dd.innerHTML=''; _tlpMatches=[]; return; }
    const q_lc = q.toLowerCase();
    _tlpMatches = teamData
      .filter(t => t.name.toLowerCase().includes(q_lc) || t.city.includes(q))
      .sort((a,b) => {
        const aS = a.name.toLowerCase().startsWith(q_lc) ? 0 : 1;
        const bS = b.name.toLowerCase().startsWith(q_lc) ? 0 : 1;
        return aS - bS || a.name.localeCompare(b.name,'ja');
      })
      .slice(0, 25);
    if (!_tlpMatches.length) {
      dd.innerHTML = '<div style="padding:10px;text-align:center;color:#9ab0c8;font-size:11px;">見つかりません</div>';
    } else {
      const CAT_CM = {elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626',independent:'#64748b'};
      const CAT_JM = {elem:'小',jhs:'中',hs:'高',univ:'大',club:'企',independent:'独'};
      dd.innerHTML = _tlpMatches.map((t,i) =>
        `<div class="tlp-sd-item" onclick="window.tlpSearchJump(${i})">
          <div class="tlp-sd-dot" style="background:${CAT_CM[t.cat]||'#888'};"></div>
          <div class="tlp-sd-name">${t.name}</div>
          <div class="tlp-sd-meta">${t.city}・${CAT_JM[t.cat]||''}</div>
        </div>`
      ).join('');
    }
    dd.classList.add('show');
  };
  window.tlpSearchJump = function(idx) {
    const t = _tlpMatches[idx];
    if (!t) return;
    document.getElementById('tlp-search-input').value = t.name;
    document.getElementById('tlp-search-dd').classList.remove('show');
    document.getElementById('tlp-search-clear-btn').classList.add('show');
    if (t.cat === 'elem') {
      if (!showPins) { showPins=true; const cb=document.getElementById('chk-pins'); if(cb) cb.checked=true; renderTeamPins(); }
      const _pc = (t.place && t.place!=='-') ? PLACE_COORDS[t.place] : null;
      const _lat = _pc ? _pc[0] : t.lat;
      const _lng = _pc ? _pc[1] : t.lng;
      if (_lat && _lng) {
        map.setCenter({lat:_lat, lng:_lng}); map.setZoom(16);
        if (isMobile()) window.closeTeamList();
        setTimeout(() => {
          teamPinLayers.forEach(marker => {
            if (marker._teamName === t.name) {
              map.setCenter(marker.position); map.setZoom(15);
              setTimeout(() => {
                const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
                _iw.open({map, anchor: marker});
              }, 300);
            }
          });
        }, 500);
      }
    } else {
      // 非小学生カテゴリ：市町村にズーム＋チーム情報ポップアップ表示
      const ce = (useWardView?[...wardData,...cityData.filter(x=>x.city!=='さいたま市')]:cityData).find(x=>x.city===t.city);
      if (ce) {
        map.setCenter({lat:ce.lat, lng:ce.lng}); map.setZoom(13);
        setTimeout(() => {
          const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
          _iw.setPosition(new google.maps.LatLng(ce.lat, ce.lng));
          _iw.open(map);
          _panForPopup();
        }, 400);
      }
    }
  };
  window.clearTlpSearch = function() {
    document.getElementById('tlp-search-input').value = '';
    document.getElementById('tlp-search-dd').classList.remove('show');
    document.getElementById('tlp-search-clear-btn').classList.remove('show');
    _tlpMatches = [];
  };
  document.addEventListener('click', e => {
    const row = document.getElementById('tlp-search-row');
    if (row && !row.contains(e.target)) {
      const dd = document.getElementById('tlp-search-dd');
      if (dd) dd.classList.remove('show');
    }
  });

  function _filterCityOnly(cityName) {
    selectedCity    = cityName || null;
    selectedCityCat = null;
    const bar = document.getElementById('city-filter-bar');
    if (selectedCity) {
      const count = teamData.filter(t => _cityMatch(t.city, selectedCity)).length;
      document.getElementById('city-filter-name').innerHTML = '<span class="msi" style="font-size:14px;vertical-align:-2px">place</span> ' + selectedCity;
      document.getElementById('city-filter-count').textContent = count + 'チーム';
      bar.classList.add('show');
      if (!teamListOpen) window.toggleTeamList();
    } else {
      bar.classList.remove('show');
      if (teamListOpen) window.closeTeamList();
    }
    const sel = document.getElementById('city-select');
    if (sel) sel.value = selectedCity || '';
    if (!selectedCity && typeof window.setTlpTab === 'function') window.setTlpTab('all');
    renderTeamPins();
  }

  function _panForPopup() {
    // Google Maps InfoWindow では自動パンされるため最小限の実装
    _shrinkListForPopup();
  }

  // ポップアップ下端に合わせてリストパネルを縮める
  function _shrinkListForPopup() {
    if (!teamListOpen) return;
    const iwEl = document.querySelector('.gm-style-iw');
    if (!iwEl) return;
    const tlpPanel = document.getElementById('team-list-panel');
    if (!tlpPanel) return;
    const popRect = iwEl.getBoundingClientRect();
    const needed = popRect.bottom + 16;
    const tlpRect = tlpPanel.getBoundingClientRect();
    if (needed > tlpRect.top) {
      const mapContainer = document.getElementById('map-container');
      const headerH = document.getElementById('header').offsetHeight || 48;
      const isMob = isMobile();
      const bnavH = isMob ? 56 : 0;
      const availH = window.innerHeight - headerH - bnavH;
      const newPanelH = window.innerHeight - needed - bnavH;
      const minPanelH = 80;
      const clampedH = Math.max(newPanelH, minPanelH);
      tlpPanel.style.height = clampedH + 'px';
      tlpPanel.style.maxHeight = clampedH + 'px';
      mapContainer.style.height = (availH - clampedH) + 'px';
    }
  }

  // ── ローディング非表示 ──────────────────────────────────
  google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
    setTimeout(function() {
      var ov = document.getElementById('loading-overlay');
      if (ov) {
        ov.classList.add('fade-out');
        setTimeout(function() { ov.classList.add('hidden'); }, 520);
      }
    }, 600);
  });

  google.maps.event.addListener(map, 'idle', function(){
    if(areaFilterActive) update();
    // アナリティクス: 地図移動完了でズーム＋中心座標を記録
    if (window.Analytics) {
      const c = map.getCenter();
      window.Analytics.mapZoom(map.getZoom(), c ? {lat: c.lat(), lng: c.lng()} : null);
    }
  });
  let _zoomDebounceTimer = null;
  map.addListener('zoom_changed', function() {
    clearTimeout(_zoomDebounceTimer);
    _zoomDebounceTimer = setTimeout(() => {
      if (showPins && _pinDataCache.length > 0) _drawPinsByZoom(map.getZoom());
    }, 120);
  });

  function _pushState(){
    const state = {
      view:   currentView,
      idx:    currentIndex,
      gender: currentGender,
      city:   selectedCity || '',
      area:   areaFilterActive ? '1' : '',
    };
    try {
      // URL のクエリパラメータにも書く（共有用）
      const url = new URL(window.location.href);
      const params = url.searchParams;
      // 既定値は省略してURL短縮
      const setOrDelete = (k, v, defaultVal) => {
        if (v && v !== defaultVal) params.set(k, v);
        else params.delete(k);
      };
      setOrDelete('view',   state.view,   'choro');
      setOrDelete('idx',    state.idx,    'abs');
      setOrDelete('gender', state.gender, 'all');
      setOrDelete('city',   state.city,   '');
      setOrDelete('area',   state.area,   '');
      const newUrl = url.pathname + (params.toString() ? '?' + params.toString() : '') + url.hash;
      history.replaceState(state, '', newUrl);
    } catch(e) {
      // about:srcdoc など replaceState 不可の環境では history.state のみ更新
      try { history.replaceState(state, ''); } catch(e2) {}
    }
  }
  function _restoreState(){
    // URL クエリパラメータを最優先（共有リンク経由の復元）
    let state = null;
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      if (params.has('view') || params.has('idx') || params.has('gender') || params.has('city') || params.has('area')) {
        state = {
          view:   params.get('view')   || '',
          idx:    params.get('idx')    || '',
          gender: params.get('gender') || '',
          city:   params.get('city')   || '',
          area:   params.get('area')   || '',
        };
      }
    } catch(e) {}
    if (!state) state = history.state;
    if(!state) return;
    if(state.view)   window.setView(state.view);
    if(state.idx)    window.setIndex(state.idx);
    if(state.gender) window.setGender(state.gender);
    if(state.city)   window.applyCityFilter(state.city);
    if(state.area==='1') window.toggleAreaFilter();
  }
  window.setIndex=function(idx){
    if (window.Analytics) window.Analytics.filterChange('index', idx);
    currentIndex=idx;
    ['abs','rate'].forEach(x=>document.getElementById('idx-'+x).classList.remove('on'));
    document.getElementById('idx-'+idx).classList.add('on');
    const isRate = idx === 'rate';

    // 参加率時: 性別選択を非表示・全体にリセット
    const genderWrap = document.getElementById('gender-wrap');
    if (genderWrap) genderWrap.style.display = isRate ? 'none' : '';
    if (isRate && currentGender !== 'all') {
      window.setGender('all');
    }

    const sel = document.getElementById('rank-cat-select');

    // 参加率モード: カテゴリは小学生のみ有効、他はdisabled
    if (sel) {
      Array.from(sel.options).forEach(opt => {
        // 小学生(elem)と全カテゴリは参加率でも有効にしたいが、
        // calcRateはelemのみ計算 → elem固定にする
        const isElem = opt.value === 'elem';
        opt.disabled = isRate && !isElem;
        opt.style.color = (isRate && !isElem) ? '#bbb' : '';
      });
      // 参加率切替時: 強制的にelemに設定
      if (isRate) {
        currentRankCat = 'elem';
        sel.value = 'elem';
      }
    }

    // 参加率モード: 男女ボタンをdisabled + 全体にリセット
    ['male','fem'].forEach(x => {
      const btn = document.getElementById('rgb-' + x);
      if (!btn) return;
      btn.disabled = isRate;
      btn.style.opacity = isRate ? '0.35' : '1';
      btn.style.cursor  = isRate ? 'not-allowed' : 'pointer';
    });
    if (isRate && currentRankGender !== 'all') {
      window._onRankGender('all');
    }

    document.getElementById('rate-note').style.display = idx==='rate'?'':'none';
    const rankRateNote = document.getElementById('rank-rate-note');
    if(rankRateNote) rankRateNote.style.display = idx==='rate' ? '' : 'none';
    _updateLegendVisibility();
    update();
    _pushState();
  };
  window.setView=function(mode){
    if (window.Analytics) window.Analytics.filterChange('view_style', mode);
    currentView=mode;
    document.querySelectorAll('.vbtn').forEach(b=>b.classList.remove('on'));
    document.getElementById('btn-'+mode).classList.add('on');
    _updateLegendVisibility();
    update();
    _pushState();
  };
  function _updateLegendVisibility(){
    const isRate  = currentIndex==='rate';
    document.getElementById('leg-choro').style.display = (!isRate) ? '' : 'none';
    document.getElementById('leg-rate').style.display  = ( isRate) ? '' : 'none';
  }
  window.toggleCat=function(cat,btn){
    activeCats.has(cat)?activeCats.delete(cat):activeCats.add(cat);
    btn.classList.toggle('on');
    if (window.Analytics) window.Analytics.filterChange('category', cat + ':' + (activeCats.has(cat) ? 'on' : 'off'));
    update();
  };
  window.setGender=function(g){
    if (window.Analytics) window.Analytics.filterChange('gender', g);
    currentGender=g;
    ['all','male','fem'].forEach(x=>{
      const el=document.getElementById('gb-'+x);
      if(el) el.classList.remove('on');
    });
    const btnId = g==='female'?'fem':g;
    const el=document.getElementById('gb-'+btnId);
    if(el) el.classList.add('on');
    updateLegend();
    update();
    renderTeamPins();
    _pushState();
    if (window.Toast) {
      const lbl = g==='male'?'男子':g==='female'?'女子':'全体';
      Toast.show(`性別フィルター: ${lbl}`);
    }
  };
  window.toggleWard=function(v){useWardView=v;if(popupLayer){popupLayer.setMap(null);popupLayer=null;}initCitySelect();update();};
  
  // ═══════════════════════════════════════════════
  // チームデータ（ダミー10件 ── 実データに差し替え）
  // 列: name, cat, gender, city, lat, lng, address, days, contact, note
  // cat: elem / jhs / hs / univ / club
  // gender: male / female / mixed
  // ═══════════════════════════════════════════════
  // /* __TEAM_DATA_START__ */
    teamData = window.TEAM_DATA_RAW || [];
  // /* __TEAM_DATA_END__ */
  // CSVが揃ったらここを差し替えます。lat/lngがない場合は住所から変換対応。
  const CAT_COLOR={elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626',independent:'#64748b'};
  const CAT_JP2  ={elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ',independent:'独立'};
  const GEN_JP   ={male:'男子',female:'女子',mixed:'混合'};
  const GEN_TAG  ={male:'tag-m',female:'tag-f',mixed:'tag-mix'};
  // ※ renderTeamPins()はbuildTeamList定義後に呼ぶ（後述）
  function makeTeamIconHTML(cat, gender, ball){
    const basecol = CAT_COLOR[cat] || '#888';

    // 性別による色: female=ピンク, mixed=紫, male/both=カテゴリ色
    let col = basecol;
    if (gender === 'female') col = '#e0448a';
    else if (gender === 'mixed') col = '#8844cc';

    // 内部マーク: female=♀, mixed=両丸（硬式の◇マークは廃止）
    let inner = '';
    if (gender === 'female') {
      inner = `<div style="
        width:7px;height:7px;border-radius:50%;
        background:rgba(255,255,255,0.9);
        position:absolute;top:6px;left:6px;
      "></div>`;
    } else if (gender === 'mixed') {
      inner = `<div style="
        width:5px;height:5px;border-radius:50%;
        background:rgba(255,255,255,0.85);
        position:absolute;top:5px;left:5px;
        box-shadow:4px 4px 0 rgba(255,255,255,0.7);
      "></div>`;
    }

    return `<div style="
      position:relative;
      width:30px;height:30px;
      background:linear-gradient(135deg,${col},${col}cc);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2.5px solid rgba(255,255,255,0.95);
      box-shadow:0 3px 10px rgba(0,0,0,0.35),0 1px 3px rgba(0,0,0,0.2);
      cursor:pointer;
      position:relative;
    ">${inner}<!-- タッチエリア拡大（モバイル時のみ有効、見た目に影響なし） -->
    <div style="position:absolute;top:-8px;left:-8px;width:44px;height:44px;border-radius:50%;background:transparent;"></div>
    </div>`;
  }
  function teamPopupHTML(t){
    // 空欄判定: '-', '', null, undefined はすべて非表示
    // 空欄・システム内部メモは非表示
    const NOTE_EXCLUDE = new Set(['両方に登録','構成員未登録','学童(連盟)のみ','スポ少のみ']);
    const has = v => v && v !== '-' && String(v).trim() !== '';
    const hasNote2 = has(t.note) && !NOTE_EXCLUDE.has(String(t.note).trim());
    const hasPlace  = has(t.place);
    const hasDays   = has(t.days);
    const hasNote   = hasNote2;
    const hasBall   = has(t.ball);
    const hasLeague = has(t.league);
    const hasAddr   = has(t.address);
    const hasContact= has(t.contact);
    const hasHp     = has(t.hp);
    const hasX      = has(t.x_url);
    const hasIg     = has(t.ig);
    const hasOther  = has(t.other_url);
    const hasOldUrl = !hasHp && has(t.url);
    // SNSリンク群（アイコンは他セクションと統一: Material Symbols + ブランドSVG）
    const X_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
    const IG_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';
    const snsLinks = [
      hasHp     ? `<a href="${t.hp}"        target="_blank" rel="noopener" class="pu-sns-link pu-sns-hp" style="display:inline-flex;align-items:center;gap:4px"><span class="msi" style="font-size:14px">public</span>HP</a>` : '',
      hasX      ? `<a href="${t.x_url}"     target="_blank" rel="noopener" class="pu-sns-link pu-sns-x"  style="display:inline-flex;align-items:center;gap:4px;color:#000">${X_SVG}X</a>` : '',
      hasIg     ? `<a href="${t.ig}"        target="_blank" rel="noopener" class="pu-sns-link pu-sns-ig" style="display:inline-flex;align-items:center;gap:4px;color:#e1306c">${IG_SVG}Instagram</a>` : '',
      hasOther  ? `<a href="${t.other_url}" target="_blank" rel="noopener" class="pu-sns-link pu-sns-other" style="display:inline-flex;align-items:center;gap:4px"><span class="msi" style="font-size:14px">link</span>Link</a>` : '',
      hasOldUrl ? `<a href="${t.url}"       target="_blank" rel="noopener" class="pu-sns-link pu-sns-hp" style="display:inline-flex;align-items:center;gap:4px"><span class="msi" style="font-size:14px">public</span>HP</a>` : '',
    ].filter(Boolean).join('');
    return `<div class="team-popup-wrap">
      <div class="pu-header">
        <div class="pu-header-icon"><span class="msi" style="font-size:18px">sports_baseball</span></div>
        <div>
          <div class="pu-team-name">${t.name}</div>
          <div class="pu-team-loc" style="display:inline-flex;align-items:center;gap:3px"><span class="msi" style="font-size:13px">place</span>${t.city}</div>
        </div>
      </div>
      <div class="team-popup-tags">
        <span class="pu-tag tag-${t.cat}">${CAT_JP2[t.cat]}</span>
        ${t.gender==='female'?`<span class="pu-tag tag-f">女子</span>`:''}
        ${t.gender==='mixed'?`<span class="pu-tag" style="background:#8844cc">混合</span>`:''}
        ${hasBall?`<span class="pu-tag" style="background:var(--ink-3)">${t.ball}</span>`:''}
      </div>
      ${(hasLeague||hasPlace||hasAddr||hasDays||hasContact)?`<div class="team-popup-rows">
        ${hasLeague  ? `<div class="team-popup-row"><span>所属</span><span>${t.league}</span></div>` : ''}
        ${hasPlace   ? `<div class="team-popup-row"><span>活動場所</span><span>${t.place}</span></div>` : ''}
        ${hasAddr    ? `<div class="team-popup-row"><span>住所</span><span>${t.address}</span></div>` : ''}
        ${hasDays    ? `<div class="team-popup-row"><span>活動日</span><span>${t.days}</span></div>` : ''}
        ${hasContact ? `<div class="team-popup-row"><span>連絡先</span><span>${t.contact}</span></div>` : ''}
      </div>`:''}
      ${snsLinks ? `<div class="pu-sns-row">${snsLinks}</div>` : ''}
      ${hasNote  ? `<div class="team-popup-note">${t.note}</div>` : ''}
      <div class="pu-foot">
        <a href="javascript:void(0)" class="pu-report" data-team-name="${t.name.replace(/"/g,'&quot;')}" onclick="window.reportTeamInfo && window.reportTeamInfo(this.dataset.teamName)">
          <span class="msi" style="font-size:12px;vertical-align:-2px">edit_note</span>情報の修正を提案
        </a>
      </div>
    </div>`;
  }
  window.PLACE_COORDS = window.PLACE_COORDS || {};
  const PLACE_COORDS = window.PLACE_COORDS;
  Object.assign(PLACE_COORDS, {
    '入間市立新久小学校':[35.85042,139.39564],
    '入間市立藤沢北小学校':[35.848135,139.391509],
    '入間市立豊岡小学校':[35.852639,139.397948],
    '入間市立高倉小学校':[35.850525,139.387777],
    '入間市立黒須小学校第二グラウンド':[35.855391,139.398982],
    '所沢市立泉小学校':[35.802499,139.47315],
    '所沢市立美原小学校':[35.79708,139.466067],
    '西富小学校':[35.804958,139.461574],
    'in加須きずなスタジアム':[36.136834,139.608619],
    'さいたま市立三橋小学校':[35.873787,139.568238],
    'さいたま市立上落合小学校':[35.87991,139.617904],
    'さいたま市立下落合小学校':[35.877923,139.617352],
    'さいたま市立与野本町小学校':[35.873754,139.624039],
    'さいたま市立与野西北小学校':[35.850652,139.591309],
    'さいたま市立仲町小学校':[35.856086,139.634094],
    'さいたま市立北浦和小学校':[35.855047,139.638284],
    'さいたま市立向小学校':[35.860353,139.692365],
    'さいたま市立和土小学校':[35.861016,139.565106],
    'さいたま市立善前小学校':[35.859738,139.687652],
    'さいたま市立土合小学校':[35.831171,139.637837],
    'さいたま市立大宮東小学校':[35.925633,139.657342],
    'さいたま市立大東小学校':[35.901987,139.629573],
    'さいたま市立大砂土小学校':[35.911425,139.653181],
    'さいたま市立大砂土東小学校':[35.920744,139.652445],
    'さいたま市立大谷口小学校':[35.824498,139.640086],
    'さいたま市立大門小学校':[35.86456,139.68766],
    'さいたま市立宮前小学校':[35.913537,139.629772],
    'さいたま市立尾間木小学校':[35.861369,139.687746],
    'さいたま市立岩槻小学校':[35.952022,139.691035],
    'さいたま市立島小学校':[35.826917,139.6349985],
    'さいたま市立常盤小学校':[35.858982,139.638204],
    'さいたま市立指扇小学校':[35.867571,139.573419],
    'さいたま市立新和小学校':[35.862443,139.650915],
    'さいたま市立春岡小学校':[35.860619,139.647132],
    'さいたま市立木崎小学校':[35.86858,139.57457],
    'さいたま市立本太小学校':[35.861646,139.6434515],
    'さいたま市立東大成小学校':[35.901917,139.623602],
    'さいたま市立柏崎小学校':[35.946343,139.693329],
    'さいたま市立栄和小学校':[35.835275,139.633391],
    'さいたま市立桜木小学校':[35.903376,139.636087],
    'さいたま市立植水小学校':[35.867075,139.562419],
    'さいたま市立植竹小学校':[35.91327,139.630896],
    'さいたま市立沼影小学校':[35.831231,139.6324],
    'さいたま市立泰平小学校':[35.926961,139.658152],
    'さいたま市立浦和大里小学校':[35.853956,139.644203],
    'さいたま市立片柳小学校':[35.915238,139.653946],
    'さいたま市立神田小学校':[35.9017,139.627103],
    'さいたま市立芝原小学校':[35.924708,139.66225],
    'さいたま市立芝川小学校':[35.901665,139.616514],
    'さいたま市立西原小学校':[35.832573999999994,139.6390975],
    'さいたま市立西浦和小学校':[35.822616,139.636448],
    'さいたま市立谷田小学校':[35.833893,139.64317],
    'さいたま市立辻小学校':[35.822484,139.633547],
    'さいたま市立道祖土小学校':[35.913738,139.661666],
    'さいたま市立野田小学校':[35.861681,139.693806],
    'さいたま市立針ヶ谷小学校':[35.857518999999996,139.63464],
    'さいたま市立鈴谷小学校':[35.873705,139.620802],
    'さいたま市立高砂小学校':[35.8588115,139.6382705],
    'さいたま市芝原小学校':[35.915835,139.656533],
    'ときがわ町立明覚小学校':[36.016785,139.274956],
    'ふじみ野市立上野台小学校':[35.879973,139.513464],
    'ふるさと広場':[36.123312,139.607866],
    'みずほグラウンド':[36.150219,139.38542],
    'グラウンド':[35.994983,139.087107],
    'メインに氷川小学校':[35.821315,139.802455],
    '三橋小学校':[35.863186,139.559391],
    '三芳町立藤久保小学校':[35.847268,139.520187],
    '三角広場':[35.804638,139.717584],
    '三郷市立前川小学校':[35.828534,139.877813],
    '三郷市立彦成小学校':[35.834836,139.870491],
    '三郷市立新和小学校':[35.830022,139.87093],
    '三郷市立瑞木小学校':[35.835742,139.872829],
    '三郷市立高州小学校':[35.829081,139.870913],
    '上尾市民球場':[35.977365,139.601955],
    '上尾市立今泉小学校':[35.983245,139.590939],
    '上尾市立原市南小学校':[35.975708,139.596339],
    '上尾市立原市小学校':[35.983094,139.601068],
    '上尾市立大石南小学校':[35.984975,139.602938],
    '上尾市立大石小学校':[35.970172,139.59041],
    '上尾市立富士見小学校':[35.979747,139.5918],
    '上尾市立平方小学校':[35.974378,139.597866],
    '上尾市立東小学校':[35.978512,139.59691],
    '上尾市立東町小学校':[35.972268,139.598459],
    '上尾市立瓦葺小学校':[35.974912,139.589524],
    '上里町立七本木小学校':[36.245787,139.225796],
    '上里町立神保原小学校':[36.24516,139.184257],
    '下鎌田小学校':[35.998701,139.470315],
    '主に常盤小学校':[35.861303,139.635028],
    '久喜市立久喜小学校':[36.060409,139.669413],
    '久喜市立太田小学校':[36.068754,139.661134],
    '久喜市立栢間小学校':[36.056936,139.663595],
    '久喜市立鷲宮小学校':[36.062948,139.674466],
    '井泉グラウンド':[36.175009,139.542858],
    '伊奈町立小室小学校':[35.985187,139.623155],
    '伊奈町立小針北小学校':[35.98926,139.632261],
    '会場:影森グラウンド':[35.986542,139.079011],
    '入間市立宮寺小学校':[35.856722,139.396724],
    '入間市立東町小学校':[35.854845,139.398882],
    '入間市立東金子小学校':[35.851277,139.394099],
    '入間市立藤沢南小学校':[35.853868,139.38446],
    '入間市立藤沢東小学校':[35.851567,139.388333],
    '入間市立金子小学校':[35.850611,139.398123],
    '入間市藤沢地区体育館グラウンド':[35.859017,139.391802],
    '八幡北小学校':[35.819098,139.811243],
    '八潮市立八條小学校':[35.821149,139.835737],
    '八潮市立大原小学校':[35.814315,139.83408],
    '八潮市立大曽根小学校':[35.817315,139.846893],
    '八潮市立大瀬小学校':[35.812397,139.843785],
    '八潮市立松之木小学校':[35.824836,139.845825],
    '加須きずなスタジアム':[36.135458,139.601486],
    '加須市立三俣小学校':[36.130605,139.601797],
    '加須市立元和小学校':[36.137048,139.608151],
    '加須市立北川辺西小学校':[36.135253,139.595054],
    '加須市立礼羽小学校':[36.123009,139.598186],
    '北本市立中丸小学校':[36.025365,139.523883],
    '北本市立石戸小学校':[36.030726,139.522642],
    '北桜ファイターズ＝埼玉県行田市総合公園野球場':[36.137853,139.459687],
    '半田公園・番匠免グラウンド':[35.834574,139.881195],
    '南越谷小学校':[35.886023,139.795568],
    '又グラウンド':[35.872914,139.570676],
    '吉川市立北谷小学校':[35.890969,139.845696],
    '吉川市立旭小学校':[35.899922,139.844398],
    '吉川市立栄小学校':[35.887218,139.838987],
    '吉見町立南小学校':[36.046629,139.457679],
    '和光市立北原小学校':[35.781699,139.606183],
    '和光市立広沢小学校':[35.776076,139.609341],
    '和光市立新倉小学校':[35.787401,139.602247],
    '和光市立白子小学校':[35.787526,139.600857],
    '和光市立第三小学校':[35.785538,139.599477],
    '和光市立第五小学校':[35.783657,139.603019],
    '唐子中央公園':[36.038932,139.407384],
    '坂戸市内グラウンド':[35.956664,139.400426],
    '埼玉上尾ボーイズ専用グラウンド（岩槻）':[35.984424,139.587973],
    '埼玉県越谷市越ヶ谷小学校':[35.88131,139.790631],
    '場所】旭公園球場':[35.888321,139.846931],
    '多目的グラウンド':[36.234745,139.189061],
    '大利根運動公園野球場':[36.129854,139.598929],
    '大沼公園':[36.181602,139.553928],
    '大泉緑地公園':[36.144445,139.395085],
    '大田スタジアム':[36.12437,139.600776],
    '大石北小学校':[35.973243,139.601932],
    '大野小学校':[35.857878,139.68728],
    '大阪シティ信用金庫スタジアム':[36.055785,139.669703],
    '宝珠花河川敷グラウンド':[35.970847,139.756056],
    '宮代町立笠原小学校':[36.026968,139.729137],
    '宮代町立須賀小学校':[36.015428,139.722117],
    '宮原公園':[35.903527,139.630428],
    '寄居小グラウンド':[36.112689,139.203373],
    '寄居町立折原小学校':[36.119095,139.19346],
    '富士見市運動公園':[35.855203,139.556914],
    '小室小学校グラウンド':[35.989731,139.620795],
    '小川町立八和田小学校':[36.056521,139.264803],
    '岩槻城址公園野球場':[35.9424,139.689571],
    '岩槻川通公園野球場':[35.944631,139.696076],
    '嵐山町立菅谷小学校':[36.068698,139.327579],
    '川口市営球場':[35.800528,139.723068],
    '川口市立上青木小学校':[35.813224,139.716523],
    '川口市立元郷小学校':[35.801037,139.717955],
    '川口市立差間小学校':[35.79959,139.726971],
    '川口市立幸町小学校':[35.79815,139.728874],
    '川口市立新郷南小学校':[35.80583,139.72253],
    '川口市立新郷小学校':[35.808223,139.722789],
    '川口市立朝日東小学校':[35.808194,139.720191],
    '川口市立朝日西小学校':[35.798043,139.723208],
    '川口市立柳崎小学校':[35.812419,139.726842],
    '川口市立芝中央小学校':[35.809876,139.718472],
    '川口市立芝西小学校':[35.799555,139.730196],
    '川口市立辻小学校':[35.803928,139.723094],
    '川口市立里小学校':[35.80986,139.724827],
    '川口市立青木中央小学校':[35.811182,139.73055],
    '川口市立青木北小学校':[35.806711,139.731645],
    '川口市立飯塚小学校':[35.813136,139.722706],
    '川口市立鳩ヶ谷小学校':[35.813209,139.729687],
    '川越市立仙波小学校':[35.923777,139.482427],
    '川越市立武蔵野小学校':[35.927567,139.480513],
    '川越市立泉小学校':[35.930593,139.491157],
    '川越市立高階南小学校':[35.919781,139.479201],
    '川通球場':[35.926938,139.658466],
    '市民球場':[35.89244,139.783216],
    '平方野球場':[35.98234,139.598257],
    '幸手市立上高野小学校':[36.076043,139.726178],
    '幸手市立八代小学校':[36.08405,139.729334],
    '幸手市立幸手小学校':[36.07975,139.723457],
    '影森グラウンド':[35.987618,139.07999],
    '志木市立宗岡第三小学校':[35.830528,139.568608],
    '志木市立志木小学校':[35.841626,139.575394],
    '志木市立志木第三小学校':[35.829106,139.57064],
    '志木市立志木第二小学校':[35.830949,139.573534],
    '志木市立志木第四小学校':[35.833747,139.578593],
    '成田小学校グラウンド':[36.142394,139.393765],
    '戸塚第二公園':[35.808728,139.72789],
    '戸田市立喜沢小学校':[35.816817,139.681131],
    '戸田市立戸田東小学校':[35.822787,139.672979],
    '戸田市立戸田第一小学校':[35.817494,139.683616],
    '戸田市立戸田第二小学校':[35.822288,139.673112],
    '戸田市立新曽小学校':[35.814419,139.670843],
    '戸田市立笹目東小学校':[35.824406,139.671252],
    '戸田市立美女木小学校':[35.822195,139.67671],
    '戸田市立美谷本小学校':[35.821904,139.680945],
    '所沢市立北中小学校':[35.802159,139.46302],
    '所沢市立北小学校':[35.804895,139.468854],
    '所沢市立安松小学校':[35.793519,139.476372],
    '所沢市立小手指小学校':[35.799046,139.474644],
    '所沢市立山口小学校':[35.799546,139.465389],
    '所沢市立若狭小学校':[35.806589,139.469854],
    '手子林公民館グラウンド':[36.182647,139.550532],
    '折之口ふれあい公園':[36.199936,139.281754],
    '新座市営馬場運動場':[35.800555,139.556176],
    '新座市立八石小学校':[35.799154,139.561411],
    '新座市立大和田小学校':[35.787185,139.565071],
    '新座市立新座小学校':[35.795005,139.559861],
    '新座市立新開小学校':[35.798652,139.558611],
    '新座市立東北小学校':[35.801903,139.556895],
    '新座市立東野小学校':[35.78895,139.555822],
    '新座市立栄小学校':[35.788094,139.568839],
    '新座市立栗原小学校':[35.786858,139.557387],
    '新座市立西堀小学校':[35.801057,139.562644],
    '新座市立野寺小学校':[35.79351,139.562048],
    '新座市立野火止小学校':[35.798231,139.564701],
    '於：総合公園野球場':[36.018379,139.52209],
    '春日小学校':[36.192149,139.273847],
    '春日部市立上沖小学校':[35.978587,139.760679],
    '春日部市立小渕小学校':[35.974277,139.755765],
    '春日部市立武里南小学校':[35.972516,139.749949],
    '春日部市立武里小学校':[35.969871,139.745226],
    '春日部市立牛島小学校':[35.97232,139.750602],
    '春日部市立立野小学校':[35.982476,139.757873],
    '春日部市立粕壁小学校':[35.9691055,139.749244],
    '春日部市立豊春小学校':[35.971694,139.750997],
    '春日部市立豊野小学校':[35.977757,139.754353],
    '朝霞市営球場':[35.800445,139.595848],
    '朝霞市立朝霞第三小学校':[35.799375,139.595203],
    '朝霞市立朝霞第二小学校':[35.787461,139.601391],
    '朝霞市立朝霞第八小学校':[35.801213,139.601993],
    '朝霞市立朝霞第六小学校':[35.786638,139.592912],
    '朝霞市立朝霞第十小学校':[35.786644,139.5981],
    '朝霞第4小学校':[35.791157,139.590006],
    '朝霞第7小学校':[35.793901,139.587287],
    '本庄市立北泉小学校':[36.236001,139.186788],
    '杉戸町立杉戸小学校':[36.027388,139.7657535],
    '杉戸町立西小学校':[36.024817,139.775485],
    '村君小学校':[36.181014,139.544214],
    '東松山市立唐子小学校':[36.047354,139.40232],
    '東松山市立大岡小学校':[36.048657,139.395904],
    '東松山市立青鳥小学校':[36.048383,139.396361],
    '松伏町立松伏小学校':[35.923763,139.827918],
    '松伏町立金杉小学校':[35.92917,139.829481],
    '栗橋西小学校':[36.059579,139.672782],
    '桜ヶ丘小学校':[36.193325,139.275376],
    '桶川市立加納小学校':[35.998064,139.550085],
    '桶川市立日出谷小学校':[35.99629,139.553378],
    '桶川市立朝日小学校':[36.0062,139.55463],
    '武里地区公民館グラウンド、正善小学校、備後小学校':[35.976575,139.752386],
    '毛呂山町立毛呂山小学校':[35.935264,139.308395],
    '江南グラウンド':[36.122741,139.203448],
    '江南総合グラウンドCコート':[36.154747,139.382575],
    '江面小学校':[36.058808,139.670704],
    '江面第2小学校':[36.059375,139.673356],
    '浦和総合運動場':[35.826628,139.644056],
    '深谷市浄化センターとなりグラウンド':[36.200129,139.280774],
    '深谷市立常盤小学校':[36.198361,139.279208],
    '深谷市立深谷小学校':[36.202746,139.283158],
    '深谷市立深谷西小学校':[36.191713,139.280852],
    '滑川町立福田小学校':[36.06177,139.406389],
    '潮止小や大瀬小学校':[35.81601,139.834792],
    '熊谷市立別府小学校':[36.145064,139.381459],
    '熊谷市立吉見小学校':[36.149169,139.394259],
    '熊谷市立大麻生小学校':[36.14037,139.392521],
    '狭山市児童公園野球場':[35.855547,139.417413],
    '狭山市立入間川小学校':[35.853631,139.419544],
    '狭山市立入間川東小学校':[35.855341,139.408943],
    '狭山市立入間野小学校':[35.855844,139.415535],
    '狭山市立南小学校':[35.851777,139.411472],
    '狭山市立堀兼小学校':[35.856718,139.405442],
    '狭山市立奥富小学校':[35.855052,139.418454],
    '狭山市立富士見小学校':[35.852053,139.413273],
    '狭山市立山王小学校':[35.846551,139.410897],
    '狭山市立広瀬小学校':[35.855186,139.413934],
    '狭山市立狭山台小学校':[35.849722,139.41596],
    '狭山市立笹井小学校':[35.84781,139.406115],
    '町民グラウンド':[36.02492,139.723047],
    '白岡市立南小学校':[36.024482,139.680146],
    '白岡市立白岡東小学校':[36.014473,139.680878],
    '白岡市立西小学校':[36.018502,139.675931],
    '皆野スポーツ公園多目的グラウンド':[36.068241,139.116959],
    '目白台グラウンド':[35.926293,139.311733],
    '県営大宮球場':[35.911486,139.628416],
    '石井前原グラウンド':[35.959978,139.401844],
    '砂中央公園':[35.845455,139.588754],
    '秩父市立南小学校':[35.994019,139.089196],
    '立野球場':[35.793528,139.596424],
    '第3球場':[36.139162,139.396169],
    '第二小学校グラウンド':[35.854467,139.330234],
    '総合運動公園多目的公園内・野球場':[36.0655895,139.6668895],
    '総合運動場':[35.799983,139.475644],
    '美南小学校':[35.892611,139.841736],
    '羽生中央公園野球場':[36.18281,139.550523],
    '羽生市立羽生北小学校':[36.176151,139.549197],
    '肥塚公園':[36.153106,139.384902],
    '舟戸グラウンド':[35.80287,139.723882],
    '若泉Cグラウンド':[36.245448,139.189212],
    '若泉運動公園第一グラウンド':[36.233006,139.185591],
    '草加市立八幡小学校':[35.821819,139.805333],
    '草加市立新田小学校':[35.831252000000006,139.80357700000002],
    '草加市立松原小学校':[35.828579,139.813939],
    '草加市立栄小学校':[35.818085,139.803489],
    '草加市立清門小学校':[35.824438,139.80373],
    '草加市立瀬崎小学校':[35.830605,139.809001],
    '草加市立花栗南小学校':[35.828362,139.813535],
    '草加市立草加小学校':[35.833046,139.809837],
    '草加市立西町小学校':[35.831226,139.800143],
    '草加市立谷塚小学校':[35.824802,139.807713],
    '草加市立高砂小学校':[35.827554,139.799342],
    '荒川河川敷第6グラウンド':[36.152615,139.383909],
    '蓮田南小学校':[35.998532,139.663872],
    '蓮田市立蓮田中央小学校':[36.001127,139.650694],
    '蕨市立北小学校':[35.826615,139.683511],
    '蕨市立南小学校':[35.829871,139.68273],
    '蕨市立西小学校':[35.818027,139.686809],
    '蕨高校のグラウンド':[35.819943,139.68757],
    '行田市立下忍小学校':[36.139305,139.454572],
    '行田市立北小学校':[36.141317,139.453968],
    '行田市立南小学校':[36.138805,139.447809],
    '行田市立埼玉小学校':[36.138495,139.453808],
    '行田市立東小学校':[36.138788,139.461843],
    '行田市立泉小学校':[36.131489,139.450546],
    '豊野台公園・大利根西部公園':[36.124107,139.60517],
    '越生町立越生小学校':[35.956775,139.293223],
    '越谷市立出羽小学校':[35.890024,139.785487],
    '越谷市立北越谷小学校':[35.885036,139.78331],
    '越谷市立千間台小学校':[35.881434,139.792284],
    '越谷市立南越谷小学校':[35.883171,139.789387],
    '越谷市立城ノ上小学校':[35.88302,139.792711],
    '越谷市立大沢小学校':[35.893103,139.792007],
    '越谷市立大相模小学校':[35.887304,139.79103],
    '越谷市立大袋北小学校':[35.894109,139.797436],
    '越谷市立大袋小学校':[35.894605,139.791607],
    '越谷市立大間野小学校':[35.882937,139.797742],
    '越谷市立宮本小学校':[35.881326,139.784438],
    '越谷市立川柳小学校':[35.891402,139.7945],
    '越谷市立平方小学校':[35.892967,139.783833],
    '越谷市立桜井小学校':[35.89318,139.788066],
    '越谷市立花田小学校':[35.881805,139.788066],
    '越谷市立荻島小学校':[35.891428,139.794068],
    '越谷市立蒲生小学校':[35.892516,139.786805],
    '越谷市立西方小学校':[35.88273,139.782411],
    '越谷市立鷺後小学校':[35.893032,139.795311],
    '運動公園野球場':[35.828962,139.872462],
    '道満グリーンパーク野球場':[35.806415,139.723311],
    '野球場':[35.778163,139.607225],
    '長瀞第一／近隣の小学校':[36.114463,139.119729],
    '開進第二小学校':[35.89205,139.792036],
    '青葉グラウンド':[36.056136,139.670098],
    '青葉台球場':[35.796757,139.590312],
    '飯能市立南高麗小学校':[35.848238,139.33464],
    '飯能市立双柳小学校':[35.853172,139.337523],
    '飯能市立富士見小学校':[35.851807,139.32718],
    '飯能市立精明小学校':[35.852002,139.335525],
    '飯能市立飯能第一小学校':[35.855277,139.327032],
    '高槻小学校':[35.86124,139.563572],
    '鳩山町の小学校':[35.994972,139.336269],
    '鴻巣市立下忍小学校':[36.071579,139.515661],
    '鴻巣市立広田小学校':[36.06577,139.51642],
    '鴻巣市立松原小学校':[36.06509,139.526782],
    '鴻巣市立田間宮小学校':[36.064417,139.513938],
    '鴻巣市立箕田小学校':[36.064064,139.528765],
    '鴻巣市立赤見台第一小学校':[36.06528,139.519768],
    '鴻巣市立馬室小学校':[36.073989,139.526376],
    '鷲宮運動広場':[36.06201,139.668281],
    '黒浜小学校':[36.001028,139.651845],
    '／明治神宮野球場':[36.135522,139.598555]
  });
  const PLACE_TRUSTED={
    'さいたま市立上落合小学校':1,
    'さいたま市立下落合小学校':1,
    'さいたま市立土合小学校':1,
    'さいたま市立島小学校':1,
    'さいたま市立沼影小学校':1,
    'さいたま市立高砂小学校':1,
    '久喜市立久喜小学校':1,
    '和光市立第三小学校':1,
    '寄居小グラウンド':1,
    '川口市立幸町小学校':1,
    '春日部市立立野小学校':1,
    '春日部市立粕壁小学校':1,
    '本庄市立北泉小学校':1,
    '杉戸町立杉戸小学校':1,
    '東松山市立唐子小学校':1,
    '総合運動公園多目的公園内・野球場':1,
    '草加市立新田小学校':1,
    '草加市立栄小学校':1,
    '行田市立南小学校':1,
    '行田市立東小学校':1,
    '越谷市立大沢小学校':1,
    '越谷市立大袋小学校':1,
    '越谷市立蒲生小学校':1
  };
  function _drawPinsByZoom(zoom) {
    _clusterMarkers.forEach(m => { m.map = null; });
    _clusterMarkers = [];
    if (!showPins || _pinDataCache.length === 0) return;
    // モバイルではピンが指で押しづらくなるため、 ひとつ深いズームレベルまで
    // クラスタ表示を維持する（11 → 12）
    const indivZoomThreshold = isMobile() ? 12 : 11;
    if (zoom >= indivZoomThreshold) {
      // 個別マーカー表示
      teamPinLayers = []; // ズーム変化時も再同期
      _pinDataCache.forEach(({lat, lng, t}) => {
        const el = document.createElement('div');
        el.innerHTML = makeTeamIconHTML(t.cat, t.gender, t.ball);
        const content = el.firstElementChild || el;
        // mousedown でフラグを立て、Data層のクリックを抑制
        content.addEventListener('mousedown', () => {
          _markerClicked = true;
          setTimeout(() => { _markerClicked = false; }, 600);
        }, true);
        // DOM click でポップアップを開く（gmp-click より確実）
        content.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!_pinInfoWindow) return;
          if (_cityInfoWindow) _cityInfoWindow.close();
          _pinInfoWindow.setContent(teamPopupHTML(t));
          _pinInfoWindow.setPosition({lat, lng});
          _pinInfoWindow.open(map);
          if (window.Analytics) window.Analytics.teamPinClick(t);
        });
        const m = new google.maps.marker.AdvancedMarkerElement({
          position: {lat, lng}, content,
          title: t.name, map,
        });
        m._teamName = t.name;
        _clusterMarkers.push(m);
        teamPinLayers.push(m);
      });
    } else {
      // クラスター表示中は個別マーカーなし
      teamPinLayers = [];
      // 市区町村単位でグループ化
      const groups = {};
      _pinDataCache.forEach(({lat, lng, t}) => {
        const key = t.city || '不明';
        if (!groups[key]) groups[key] = {lat, lng, count: 0};
        else { groups[key].lat = (groups[key].lat * groups[key].count + lat) / (groups[key].count + 1);
               groups[key].lng = (groups[key].lng * groups[key].count + lng) / (groups[key].count + 1); }
        groups[key].count++;
      });
      Object.entries(groups).forEach(([city, {lat, lng, count}]) => {
        const size = count < 5 ? 36 : count < 15 ? 44 : 52;
        const bg   = count < 5 ? '#3b82f6' : count < 15 ? '#f59e0b' : '#ef4444';
        const div = document.createElement('div');
        div.style.cssText = [
          `width:${size}px;height:${size}px`, `background:${bg}`,
          'border-radius:50%', 'border:2.5px solid #fff',
          'display:flex;align-items:center;justify-content:center',
          'color:#fff;font-size:13px;font-weight:700;font-family:inherit',
          'box-shadow:0 2px 8px rgba(0,0,0,.25)', 'cursor:pointer',
        ].join(';');
        div.textContent = count;
        div.addEventListener('mousedown', () => {
          _markerClicked = true;
          setTimeout(() => { _markerClicked = false; }, 600);
        }, true);
        const m = new google.maps.marker.AdvancedMarkerElement({
          position: {lat, lng}, content: div, map,
          zIndex: 1000 + count,
        });
        m.addEventListener('gmp-click', () => {
          map.setCenter({lat, lng});
          map.setZoom(Math.min((map.getZoom() || 9) + 2, 13));
        });
        _clusterMarkers.push(m);
      });
    }
  }

  window.renderTeamPins = function renderTeamPins(){
    teamPinLayers=[];

    const kw=(document.getElementById('team-search').value||'').trim();
    const _areaBounds = areaFilterActive ? map.getBounds() : null;
    // 共通フィルター条件（性別・検索ワード・市区町村・エリア）
    const baseFilter = t => {
      if(currentGender==='male' && t.gender==='female') return false;
      if(currentGender==='female' && t.gender!=='female' && t.gender!=='mixed') return false;
      if(kw&&!t.name.includes(kw)&&!t.city.includes(kw)) return false;
      if(selectedCity && !_cityMatch(t.city, selectedCity)) return false;
      if(selectedCityCat && t.cat !== selectedCityCat) return false;
      if(_areaBounds && !(t.lat && t.lng && _areaBounds.contains(new google.maps.LatLng(t.lat, t.lng)))) return false;
      return true;
    };
    // リスト：全カテゴリ（showPinsに関係なく常に更新）
    const listFiltered = teamData.filter(t => baseFilter(t));
    tlpAllFiltered = listFiltered;
    updateTlpTabCounts(listFiltered);
    renderTlpBody(listFiltered);
    updateHeaderBadges();

    if(!showPins) {
      _drawPinsByZoom(map.getZoom()); // 既存マーカーを消去
      document.getElementById('team-count').textContent='チーム数: 0件表示中';
      document.getElementById('hdr-teams').textContent = '－';
      updateBnavBadge(0);
      return;
    }

    // ピン：小学生のみ
    const pinFiltered = teamData.filter(t => t.cat === 'elem' && baseFilter(t));
    const LEAGUE_FALLBACK = {
      '入間西':[35.856,139.330],'入間東':[35.830,139.490],
      '比企':[36.050,139.350],'北葛':[36.120,139.720],
      '南埼':[35.870,139.800],'白岡町':[36.017,139.678],
      '埼玉県':[36.000,139.400]
    };
    _pinInfoWindow = _pinInfoWindow || new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -8)
    });
    _pinDataCache = [];
    pinFiltered.forEach(t => {
      const _pc = (t.place && t.place!=='-') ? PLACE_COORDS[t.place] : null;
      let _lat = _pc ? _pc[0] : t.lat;
      let _lng = _pc ? _pc[1] : t.lng;
      if(!_lat || !_lng) {
        const fb = LEAGUE_FALLBACK[t.city] || (cityMap[t.city] ? [cityMap[t.city].lat, cityMap[t.city].lng] : null);
        if(fb){ _lat=fb[0]; _lng=fb[1]; } else return;
      }
      _pinDataCache.push({lat: _lat, lng: _lng, t});
    });
    _drawPinsByZoom(map.getZoom());
    document.getElementById('team-count').textContent=`少年野球ピン: ${pinFiltered.length}件表示中`;
    updateBnavBadge(pinFiltered.length);
    // ヘッダー統計更新（ピン数）
    document.getElementById('hdr-teams').textContent = pinFiltered.length.toLocaleString();
  };
  const renderTeamPins = window.renderTeamPins; // ローカル参照も保持
  // ── チームリスト ─────────────────────────────────────
  let tlpActiveCat = 'all';
  let tlpSortKey = 'cat'; // 'cat' | 'name' | 'city' // 現在のタブ
  let tlpAllFiltered = [];  // buildTeamListに渡された全データを保持


  // ── 検索クリアボタン制御 ──────────────────────────────
  let _searchEventTimer;
  window.onSearchInput = function() {
    const val = document.getElementById('team-search').value;
    const btn = document.getElementById('search-clear');
    if (btn) btn.classList.toggle('show', val.length > 0);
    filterTeamPins();
    // 検索キーワードがある場合はチームリストパネルを自動的に開く
    const kw = val.trim();
    if (kw.length > 0) {
      if (!teamListOpen) window.toggleTeamList();
      // ヘッダー検索にも反映
      const hdrInput = document.getElementById('hdr-search-input');
      if (hdrInput) hdrInput.value = kw;
      const hdrClear = document.getElementById('hdr-search-clear');
      if (hdrClear) hdrClear.classList.toggle('show', kw.length > 0);
    }
    // アナリティクス: 検索イベント（debounce 700ms）
    clearTimeout(_searchEventTimer);
    _searchEventTimer = setTimeout(() => {
      if (kw.length < 2) return; // 短すぎる入力は無視
      const matched = teamData.filter(t => {
        const s = (t.name + ' ' + (t.city||'') + ' ' + (t.league||'')).toLowerCase();
        return s.includes(kw.toLowerCase());
      });
      if (window.Analytics) {
        window.Analytics.keywordSearch(kw, matched.length);
        if (matched.length === 0) {
          window.Analytics.emptyResult(kw, 'team_search');
        }
      }
    }, 700);
  };
  // サイドバー検索で1件に絞り込まれた場合にポップアップ表示
  window.onSearchInputJump = function() {
    const kw = (document.getElementById('team-search').value || '').trim();
    if (!kw) return;
    // 現在のフィルター結果からチェック
    const matched = tlpAllFiltered.filter(t => t.name.includes(kw));
    if (matched.length === 1) {
      const t = matched[0];
      if (t.cat === 'elem') {
        const _pc = (t.place && t.place!=='-') ? PLACE_COORDS[t.place] : null;
        const _lat = _pc ? _pc[0] : t.lat;
        const _lng = _pc ? _pc[1] : t.lng;
        if (_lat && _lng) {
          if (!showPins) { showPins=true; const cb=document.getElementById('chk-pins'); if(cb) cb.checked=true; renderTeamPins(); }
          map.setCenter({lat:_lat, lng:_lng}); map.setZoom(16);
          setTimeout(() => {
            teamPinLayers.forEach(marker => {
              if (marker._teamName === t.name) {
                map.setCenter(marker.position); map.setZoom(15);
                setTimeout(() => {
                  const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
                  _iw.open({map, anchor: marker});
                }, 300);
              }
            });
          }, 500);
        }
      } else {
        const cityEntry = (useWardView?[...wardData,...cityData.filter(x=>x.city!=='さいたま市')]:cityData)
          .find(x=>x.city===t.city);
        if (cityEntry) {
          map.setCenter({lat:cityEntry.lat, lng:cityEntry.lng}); map.setZoom(13);
          setTimeout(() => {
            const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
            _iw.setPosition(new google.maps.LatLng(cityEntry.lat, cityEntry.lng));
            _iw.open(map);
            _panForPopup();
          }, 400);
        }
      }
    } else if (matched.length === 0 || kw.length >= 2) {
      // チームが見つからない or 2文字以上 → 住所検索を試行
      // ヘッダー検索に転送して住所検索実行
      const hdrInput = document.getElementById('hdr-search-input');
      if (hdrInput) hdrInput.value = kw;
      window.searchByAddress();
    }
  };
  window.clearSearch = function() {
    const inp = document.getElementById('team-search');
    if (inp) { inp.value = ''; inp.focus(); }
    const btn = document.getElementById('search-clear');
    if (btn) btn.classList.remove('show');
    // ヘッダー検索もクリア
    const hdrInput = document.getElementById('hdr-search-input');
    if (hdrInput) hdrInput.value = '';
    const hdrClear = document.getElementById('hdr-search-clear');
    if (hdrClear) hdrClear.classList.remove('show');
    filterTeamPins();
  };

  // ── チームリストフィルター状態バー ────────────────────
  function updateTlpFilterBar() {
    const bar = document.getElementById('tlp-filter-bar');
    if (!bar) return;
    // ラベル以外のchipを削除
    bar.querySelectorAll('.tlp-chip').forEach(el => el.remove());

    const chips = [];
    // 市区町村
    if (selectedCity) {
      chips.push({ label: '<span class="msi" style="font-size:12px;vertical-align:-2px">place</span> ' + selectedCity + (selectedCityCat ? '｜' + ({elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ'}[selectedCityCat]||selectedCityCat) : ''), action: () => window.clearCityFilter() });
    }
    // キーワード
    const kw = (document.getElementById('team-search') || {}).value || '';
    if (kw.trim()) {
      chips.push({ label: '<span class="msi" style="font-size:12px;vertical-align:-2px">search</span> ' + kw.trim(), action: () => window.clearSearch() });
    }
    // 性別
    if (currentGender !== 'all') {
      const gLabel = {male:'男子のみ', female:'女子のみ'}[currentGender] || currentGender;
      chips.push({ label: '<span class="msi" style="font-size:12px;vertical-align:-2px">person</span> ' + gLabel, action: null });
    }

    if (chips.length === 0) {
      bar.classList.remove('show');
      return;
    }
    bar.classList.add('show');
    chips.forEach(c => {
      const chip = document.createElement('span');
      chip.className = 'tlp-chip';
      chip.innerHTML = c.label;
      if (c.action) {
        const x = document.createElement('button');
        x.className = 'tlp-chip-x';
        x.innerHTML = '<span class="msi" style="font-size:12px">close</span>';
        x.onclick = c.action;
        chip.appendChild(x);
      }
      bar.appendChild(chip);
    });
  }

  window.setTlpSort = function(key) {
    tlpSortKey = key;
    renderTlpBody(tlpAllFiltered);
  };

  window.setTlpTab = function(cat) {
    tlpActiveCat = cat;
    // タブのon切り替え
    document.querySelectorAll('.tlp-tab').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.cat === cat);
    });
    // 現在の全データから再描画
    renderTlpBody(tlpAllFiltered);
  };

  function updateTlpTabCounts(filtered) {
    const cats = ['all','elem','jhs','hs','club'];
    cats.forEach(c => {
      const el = document.getElementById('tlp-tab-n-' + c);
      if (!el) return;
      const n = c === 'all' ? filtered.length : filtered.filter(t => t.cat === c).length;
      el.textContent = n > 0 ? n : '';
    });
  }

  function renderTlpBody(filtered) {
    updateTlpFilterBar();
    const body = document.getElementById('tlp-body');
    const count = document.getElementById('tlp-count');
    // タブでフィルタリング
    const toShow = tlpActiveCat === 'all' ? filtered : filtered.filter(t => t.cat === tlpActiveCat);
    count.textContent = toShow.length + '件';
    body.innerHTML = '';
    if (toShow.length === 0) {
      body.innerHTML = `
        <div class="tlp-empty">
          <div class="tlp-empty-icon"><span class="msi">search_off</span></div>
          <div class="tlp-empty-title">条件に一致するチームがありません</div>
          <div class="tlp-empty-sub">絞込条件を変えるか、リセットしてもう一度お試しください</div>
          <button class="tlp-empty-btn" onclick="window.clearAllFilters && window.clearAllFilters()">
            <span class="msi" style="font-size:14px;vertical-align:-2px;margin-right:4px">refresh</span>絞込をリセット
          </button>
        </div>`;
      return;
    }
    // ソート
    const catOrder = {elem:0,jhs:1,hs:2,univ:3,club:4,independent:5};
    const sorted = [...toShow].sort((a,b)=>{
      if(tlpSortKey==='name') return a.name.localeCompare(b.name,'ja');
      if(tlpSortKey==='city') return a.city.localeCompare(b.city,'ja')||a.name.localeCompare(b.name,'ja');
      // cat (default): カテゴリ→市区町村→チーム名
      return (catOrder[a.cat]||0)-(catOrder[b.cat]||0)||a.city.localeCompare(b.city,'ja')||a.name.localeCompare(b.name,'ja');
    });
    sorted.forEach(t => {
      const col = CAT_COLOR[t.cat] || '#888';
      const genLabel = GEN_JP[t.gender] || t.gender;
      const item = document.createElement('div');
      item.className = 'tlp-item';
      const ballBadge = t.ball==='硬式'
        ? `<span style="display:inline-block;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:700;background:#fff3cc;color:#a07000;border:1px solid #e8c840;">硬式</span>`
        : t.ball==='軟式'
        ? `<span style="display:inline-block;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:700;background:#e8f3ff;color:#1a6ab0;border:1px solid #a8ccee;">軟式</span>`
        : '';
      item.innerHTML = `
        <div class="tlp-dot" style="background:${t.gender==='female'?'#e0448a':t.gender==='mixed'?'#8844cc':col};"></div>
        <div class="tlp-name">${t.name}</div>
        <div class="tlp-city">${t.city}</div>
        <div class="tlp-tags">
          <span class="tlp-tag" style="background:${col};">${CAT_JP2[t.cat]}</span>
          ${ballBadge}
          ${t.gender==='female'?`<span class="tlp-tag" style="background:#e0448a;">女子</span>`
            :t.gender==='mixed'?`<span class="tlp-tag" style="background:#8844cc;">混合</span>`
            :''}
        </div>
        ${t.league?`<div style="font-size:9px;color:#999;margin-top:3px;line-height:1.3;padding-left:14px;">${t.league}</div>`:''}
        ${(()=>{const lks=[
          t.hp&&t.hp!=='-'?`<a href="${t.hp}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#3b82f6;text-decoration:none;display:inline-flex;align-items:center" title="HP"><span class="msi" style="font-size:14px">public</span></a>`:'',
          t.x_url&&t.x_url!=='-'?`<a href="${t.x_url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#000;text-decoration:none;display:inline-flex;align-items:center" title="X (Twitter)"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>`:'',
          t.ig&&t.ig!=='-'?`<a href="${t.ig}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#e1306c;text-decoration:none;display:inline-flex;align-items:center" title="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>`:'',
          t.other_url&&t.other_url!=='-'?`<a href="${t.other_url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#555;text-decoration:none;display:inline-flex;align-items:center" title="Link"><span class="msi" style="font-size:14px">link</span></a>`:'',
        ].filter(Boolean);return lks.length?`<div style="display:flex;gap:6px;align-items:center;margin-top:4px;padding-left:14px;">${lks.join('')}</div>`:''})()}`;
      // タップで地図ジャンプ＋ポップアップ
      item.addEventListener('click', () => {
        if (t.cat === 'elem') {
          // 小学生：地図移動＋ピンポップアップ（チーム名で正確にマッチ）
          if (!showPins) { showPins = true; const cb=document.getElementById('chk-pins'); if(cb) cb.checked=true; renderTeamPins(); }
          const _pc = (t.place && t.place!=='-') ? PLACE_COORDS[t.place] : null;
          const _lat = _pc ? _pc[0] : t.lat;
          const _lng = _pc ? _pc[1] : t.lng;
          if (_lat && _lng) { map.setCenter({lat:_lat, lng:_lng}); map.setZoom(15); }
          if (isMobile()) window.closeTeamList();
          setTimeout(() => {
            const target = teamPinLayers.find(layer => layer._teamName === t.name);
            if (target) {
              map.setCenter(target.position); map.setZoom(15);
              setTimeout(() => {
                const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
                _iw.open({map, anchor: target});
              }, 300);
            }
          }, 450);
        } else {
          // 中学生以上：市町村にズーム＋チーム情報ポップアップ表示
          const cityEntry = (useWardView ? [...wardData,...cityData.filter(x=>x.city!=='さいたま市')] : cityData)
            .find(x => x.city === t.city);
          if (isMobile()) window.closeTeamList();
          if (cityEntry && cityEntry.lat && cityEntry.lng) {
            map.setCenter({lat:cityEntry.lat, lng:cityEntry.lng}); map.setZoom(13);
            setTimeout(() => {
              const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
              _iw.setPosition(new google.maps.LatLng(cityEntry.lat, cityEntry.lng));
              _iw.open(map);
              _panForPopup();
            }, 400);
          }
          item.style.background = '#eef4ff';
          setTimeout(() => { item.style.background = ''; }, 800);
        }
      });
      body.appendChild(item);
    });
  }
  function applyMapPadding(open) {
    const isMob = isMobile();
    const bnavH = isMob ? 56 : 0;
    const panelH = open
      ? Math.round(window.innerHeight * (isMob ? 0.45 : 0.40))
      : 0;
    const totalReserved = panelH + bnavH;
    const mapContainer = document.getElementById('map-container');
    // 上部 (site-header + map-header) と下部 (site-footer) を差し引く
    // ただし panel 開時は team-list-panel が site-footer を覆うため、site-footer 分は差し引かない
    const siteHeaderH = document.getElementById('site-header')?.offsetHeight || 0;
    const mapHeaderH = document.getElementById('header')?.offsetHeight || 48;
    const siteFooterH = (isMob || open) ? 0 : (document.getElementById('site-footer')?.offsetHeight || 0);
    const availH = window.innerHeight - siteHeaderH - mapHeaderH - siteFooterH - totalReserved;
    mapContainer.style.height = availH + 'px';
    mapContainer.style.paddingBottom = '';
    // Google Maps にリサイズを通知 + 開いているポップアップを再オープン（auto-pan を新サイズで再評価）
    requestAnimationFrame(() => {
      google.maps.event.trigger(map, 'resize');
      try {
        if (_cityInfoWindow && _cityInfoWindow.getMap && _cityInfoWindow.getMap()) {
          const pos = _cityInfoWindow.getPosition && _cityInfoWindow.getPosition();
          const content = _cityInfoWindow.getContent && _cityInfoWindow.getContent();
          if (pos && content) {
            // 一度閉じて再オープン → Google Maps の auto-pan が新 viewport で再計算される
            _cityInfoWindow.close();
            setTimeout(() => {
              _cityInfoWindow.setPosition(pos);
              _cityInfoWindow.open(map);
            }, 60);
          }
        }
      } catch(e) {}
    });
  }
  window.toggleTeamList = function() {
    teamListOpen = !teamListOpen;
    document.getElementById('team-list-panel').classList.toggle('open', teamListOpen);
    document.getElementById('btn-show-list').style.display = teamListOpen ? 'none' : 'flex';
    applyMapPadding(teamListOpen);
  };
  window.closeTeamList = function() {
    teamListOpen = false;
    document.getElementById('team-list-panel').classList.remove('open');
    document.getElementById('btn-show-list').style.display = 'flex';
    applyMapPadding(false);
  };
  // カテゴリバッジ固定値セット（teamData代入後に一度だけ実行）
  (function(){
    const _cc = {elem:0,jhs:0,hs:0,univ:0,club:0,independent:0};
    teamData.forEach(t=>{ if(_cc[t.cat]!==undefined) _cc[t.cat]++; });
    const _lbl = {elem:'小',jhs:'中',hs:'高',univ:'大',club:'企',independent:'独'};
    const _id  = {elem:'hdr-cat-elem',jhs:'hdr-cat-jhs',hs:'hdr-cat-hs',univ:'hdr-cat-univ',club:'hdr-cat-club',independent:'hdr-cat-ind'};
    Object.entries(_id).forEach(([cat,eid])=>{
      const el=document.getElementById(eid);
      if(el) el.innerHTML = _cc[cat]+'<span class="hdr-cat-lbl">'+_lbl[cat]+'</span>';
    });
  })();
  renderTeamPins(); // チームピン初期表示（全関数定義後）
  initCitySelect();  // 市区町村ドロップダウン初期化
  window.togglePins=function(v){showPins=v;renderTeamPins();};

  window.toggleTeamCat=function(cat,btn){
    teamActiveCats.has(cat)?teamActiveCats.delete(cat):teamActiveCats.add(cat);
    btn.classList.toggle('on');renderTeamPins();
  };
  window.setTeamGender=function(g){ /* 性別フィルター廃止 */ };
  window.filterTeamPins=function(){renderTeamPins();};
  // ── HAMBURGER ──
  const sidebar=document.getElementById('sidebar');
  const backdrop=document.getElementById('backdrop');
  const hbg=document.getElementById('hbg');
  // desktop: show / mobile: hidden（ハンバーガーで開閉）
  if(isMobile()){
    sidebar.classList.add('hidden');
  } else {
    sidebar.classList.remove('hidden');
  }
  // ══════════════════════════════════════════
  // 市町村詳細グラフ
  // ══════════════════════════════════════════
  const CHART_COLORS = {
    elem:'#3b82f6', jhs:'#059669', hs:'#d97706', univ:'#7c3aed', club:'#dc2626'
  };
  const CHART_CATS  = ['elem','jhs','hs','univ','club'];
  const CHART_LABELS= {elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ'};
  window.openChartModal = function(cityName) {
    const d = cityMap[cityName];
    if (!d) return;
    if (window.Analytics) window.Analytics.modalOpen('chart', {city: cityName});
    const modal = document.getElementById('chart-modal');
    document.getElementById('chart-title').textContent = cityName + ' 野球人口詳細';
    const rate = d.children ? ((d.elem_m||0)+(d.elem_f||0)) / d.children * 100 : null;
    const rateArea = document.getElementById('chart-rate-area');
    rateArea.innerHTML = rate !== null
      ? `<div class="chart-rate-box">
           <div class="chart-rate-num">${rate.toFixed(1)}%</div>
           <div class="chart-rate-label">小学生参加率<br><span style="font-size:9px;">児童数 ${d.children.toLocaleString()}人（令和7年度学校便覧）</span></div>
         </div>` : '';
    const total = CHART_CATS.reduce((s,c)=>(s+(d[c+'_m']||0)+(d[c+'_f']||0)), 0);
    document.getElementById('chart-sub').textContent = `合計 ${total}人`;
    const bars = document.getElementById('chart-bars');
    bars.innerHTML = '';
    // カテゴリ別棒グラフ（男女セット）
    bars.innerHTML += '<div class="chart-section">▌ カテゴリ別人数</div>';
    const catMax = Math.max(1, ...CHART_CATS.map(c=>(d[c+'_m']||0)+(d[c+'_f']||0)));
    CHART_CATS.forEach(c => {
      const m = d[c+'_m']||0, f = d[c+'_f']||0, tot = m+f;
      if (tot === 0) return;
      const pct = Math.round(tot/catMax*100);
      bars.innerHTML += `
        <div class="chart-bar-wrap">
          <div class="chart-bar-label"><span>${CHART_LABELS[c]}</span><span>${tot}人 (男${m} 女${f})</span></div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width:${pct}%;background:${CHART_COLORS[c]};">
              <span class="chart-bar-val">${tot > 0 ? tot+'人' : ''}</span>
            </div>
          </div>
        </div>`;
    });
    // チーム数（カテゴリ別）
    const cityTeams = teamData.filter(t => t.city === d.city);
    if (cityTeams.length > 0) {
      const teamCatColors = {elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626'};
      const catCounts = {};
      cityTeams.forEach(t => { catCounts[t.cat] = (catCounts[t.cat]||0)+1; });
      const teamMax = Math.max(...Object.values(catCounts));
      bars.innerHTML += '<div class="chart-section">チーム数</div>';
      bars.innerHTML += `<div style="font-size:11px;color:#999;margin-bottom:8px;">登録チーム合計 <span style="font-size:18px;font-variant-numeric:tabular-nums;color:var(--ink);">${cityTeams.length}</span> 件</div>`;
      CHART_CATS.forEach(c => {
        const n = catCounts[c] || 0;
        if (!n) return;
        const pct = Math.round(n / teamMax * 100);
        bars.innerHTML += `
          <div class="chart-bar-wrap">
            <div class="chart-bar-label"><span>${CHART_LABELS[c]}</span><span>${n}チーム</span></div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width:${pct}%;background:${teamCatColors[c]};">
                <span class="chart-bar-val">${n}チーム</span>
              </div>
            </div>
          </div>`;
      });
    }
    // 県内順位（市町村データ全体で何位か）
    const allCities = Object.values(cityMap).filter(x=>!x.city.includes('区')||x.city==='さいたま市');
    const sorted = [...allCities].sort((a,b)=>
      (CHART_CATS.reduce((s,c)=>(s+(b[c+'_m']||0)+(b[c+'_f']||0)),0)) -
      (CHART_CATS.reduce((s,c)=>(s+(a[c+'_m']||0)+(a[c+'_f']||0)),0))
    );
    const rank = sorted.findIndex(x=>x.city===d.city) + 1;
    // 参加率順位
    const withChildren = allCities.filter(x=>x.children>0);
    const rateSorted = [...withChildren].sort((a,b)=>{
      const rA = ((a.elem_m||0)+(a.elem_f||0))/a.children;
      const rB = ((b.elem_m||0)+(b.elem_f||0))/b.children;
      return rB - rA;
    });
    const rateRank = rate!==null ? rateSorted.findIndex(x=>x.city===d.city)+1 : null;
    bars.innerHTML += `<div class="chart-section">県内順位</div>
      <div style="display:flex;gap:16px;align-items:baseline;padding:6px 0;">
        <div>
          <span style="font-size:10px;color:#999;">人数</span><br>
          <span style="font-size:20px;font-weight:700;color:var(--ink);">第 <span style="font-size:28px;">${rank}</span> 位</span>
          <span style="font-size:11px;color:#999;"> / ${sorted.length}</span>
        </div>
        ${rateRank ? `<div>
          <span style="font-size:10px;color:#999;">小学生参加率</span><br>
          <span style="font-size:20px;font-weight:700;color:var(--ink);">第 <span style="font-size:28px;">${rateRank}</span> 位</span>
          <span style="font-size:11px;color:#999;"> / ${withChildren.length}</span>
        </div>` : ''}
      </div>`;
    modal.classList.add('open');
    modal.onclick = e => { if (e.target === modal) window.closeChartModal(); };
  };
  window.closeChartModal = function() {
    document.getElementById('chart-modal').classList.remove('open');
  };

  // ── 全モーダル共通: ESCで閉じる ──
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    // 開いているモーダルを優先度順に閉じる
    const chart = document.getElementById('chart-modal');
    const cmp = document.getElementById('cmp-modal');
    if (chart && chart.classList.contains('open')) { window.closeChartModal(); return; }
    if (cmp && cmp.classList.contains('open')) { window.closeCmpModal && window.closeCmpModal(); return; }
    // チームリストパネル
    const tlp = document.getElementById('team-list-panel');
    if (tlp && tlp.classList.contains('open')) { window.closeTeamList && window.closeTeamList(); return; }
    // 近傍パネル
    const nbp = document.getElementById('nearby-panel');
    if (nbp && nbp.classList.contains('open')) { window.closeNearby && window.closeNearby(); return; }
    // モバイルのサイドバー
    const sb = document.getElementById('sidebar');
    if (sb && !sb.classList.contains('hidden') && window.innerWidth <= 768) {
      window.closeSidebar && window.closeSidebar(); return;
    }
  });

  // ══════════════════════════
  // 市町村比較モード
  // ══════════════════════════
  const CMP_CATS   = ['elem','jhs','hs','univ','club'];
  const CMP_LABELS = {elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ'};
  const CMP_COLORS = {elem:'#3b82f6',jhs:'#059669',hs:'#d97706',univ:'#7c3aed',club:'#dc2626'};

  function _cmpInitSelects(defaultA) {
    const cities = Object.values(cityMap)
      .filter(d => !d.city.includes('区') || d.city === 'さいたま市')
      .map(d => d.city).sort((a,b)=>a.localeCompare(b,'ja'));
    ['cmp-sel-a','cmp-sel-b'].forEach((id,idx) => {
      const sel = document.getElementById(id);
      if (!sel || sel.options.length > 1) return;
      sel.innerHTML = '<option value="">選択してください</option>';
      cities.forEach(c => {
        const o = document.createElement('option');
        o.value = o.textContent = c;
        sel.appendChild(o);
      });
    });
    if (defaultA) document.getElementById('cmp-sel-a').value = defaultA;
  }

  window.renderCmp = function() {
    const nameA = document.getElementById('cmp-sel-a').value;
    const nameB = document.getElementById('cmp-sel-b').value;
    const body  = document.getElementById('cmp-body');
    if (!nameA || !nameB) { body.innerHTML = '<div style="text-align:center;color:#999;padding:20px;font-size:12px;">2つの市町村を選択してください</div>'; return; }
    const dA = cityMap[nameA], dB = cityMap[nameB];
    if (!dA || !dB) return;
    // アナリティクス: 市町村比較イベント
    if (window.Analytics) window.Analytics.cityCompare(nameA, nameB);

    const totalA = CMP_CATS.reduce((s,c)=>s+(dA[c+'_m']||0)+(dA[c+'_f']||0),0);
    const totalB = CMP_CATS.reduce((s,c)=>s+(dB[c+'_m']||0)+(dB[c+'_f']||0),0);
    const rateA  = dA.children ? ((dA.elem_m||0)+(dA.elem_f||0))/dA.children*100 : null;
    const rateB  = dB.children ? ((dB.elem_m||0)+(dB.elem_f||0))/dB.children*100 : null;
    const teamsA = teamData.filter(t=>t.city===nameA).length;
    const teamsB = teamData.filter(t=>t.city===nameB).length;

    // 県内順位
    const allCities = Object.values(cityMap).filter(d=>!d.city.includes('区')||d.city==='さいたま市');
    const sorted = [...allCities].sort((a,b)=>
      CMP_CATS.reduce((s,c)=>(s+(b[c+'_m']||0)+(b[c+'_f']||0)),0) -
      CMP_CATS.reduce((s,c)=>(s+(a[c+'_m']||0)+(a[c+'_f']||0)),0));
    const rankA = sorted.findIndex(d=>d.city===nameA)+1;
    const rankB = sorted.findIndex(d=>d.city===nameB)+1;

    function winner(a,b,higherIsBetter=true){
      if(a===null||b===null) return '';
      const win = higherIsBetter ? a>b : a<b;
      return win ? '<span class="cmp-winner a">◀ A</span>' : (a<b ? '<span class="cmp-winner b">B ▶</span>' : '');
    }
    function pct(v,max){ return max>0 ? Math.round(v/max*100) : 0; }

    // KPIカード
    const kpiHtml = `
      <div class="cmp-kpi-row">
        <div class="cmp-kpi" style="border-top:3px solid #2563eb">
          <div class="cmp-kpi-val" style="color:#2563eb">${totalA.toLocaleString()}</div>
          <div class="cmp-kpi-lbl">競技者数合計</div>
        </div>
        <div class="cmp-kpi" style="border-top:3px solid #d97706">
          <div class="cmp-kpi-val" style="color:#d97706">${totalB.toLocaleString()}</div>
          <div class="cmp-kpi-lbl">競技者数合計</div>
        </div>
      </div>
      <div class="cmp-kpi-row">
        <div class="cmp-kpi">
          <div class="cmp-kpi-val">${rateA!==null?rateA.toFixed(1)+'%':'－'}</div>
          <div class="cmp-kpi-lbl">小学生参加率</div>
        </div>
        <div class="cmp-kpi">
          <div class="cmp-kpi-val">${rateB!==null?rateB.toFixed(1)+'%':'－'}</div>
          <div class="cmp-kpi-lbl">小学生参加率</div>
        </div>
      </div>
      <div class="cmp-kpi-row">
        <div class="cmp-kpi">
          <div class="cmp-kpi-val">${teamsA}</div>
          <div class="cmp-kpi-lbl">登録チーム数</div>
        </div>
        <div class="cmp-kpi">
          <div class="cmp-kpi-val">${teamsB}</div>
          <div class="cmp-kpi-lbl">登録チーム数</div>
        </div>
      </div>
      <div class="cmp-kpi-row">
        <div class="cmp-kpi">
          <div class="cmp-kpi-val">第${rankA}位</div>
          <div class="cmp-kpi-lbl">県内順位</div>
        </div>
        <div class="cmp-kpi">
          <div class="cmp-kpi-val">第${rankB}位</div>
          <div class="cmp-kpi-lbl">県内順位</div>
        </div>
      </div>`;

    // カテゴリ別棒グラフ（横並び）
    const catMax = Math.max(1,...CMP_CATS.map(c=>Math.max((dA[c+'_m']||0)+(dA[c+'_f']||0),(dB[c+'_m']||0)+(dB[c+'_f']||0))));
    let barsHtml = '<div class="cmp-bar-section">カテゴリ別 競技者数</div>';
    CMP_CATS.forEach(c => {
      const vA = (dA[c+'_m']||0)+(dA[c+'_f']||0);
      const vB = (dB[c+'_m']||0)+(dB[c+'_f']||0);
      if(!vA && !vB) return;
      barsHtml += `
        <div class="cmp-bar-wrap">
          <div class="cmp-bar-label">
            <span style="font-weight:700;color:${CMP_COLORS[c]}">${CMP_LABELS[c]}</span>
            <span>${vA.toLocaleString()} vs ${vB.toLocaleString()} 人 ${winner(vA,vB)}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            <div class="cmp-bar-track"><div class="cmp-bar-fill" style="width:${pct(vA,catMax)}%;background:#2563eb"></div></div>
            <div class="cmp-bar-track"><div class="cmp-bar-fill" style="width:${pct(vB,catMax)}%;background:#d97706"></div></div>
          </div>
        </div>`;
    });

    // 参加率比較バー
    if(rateA!==null || rateB!==null){
      const rMax = Math.max(rateA||0, rateB||0, 1);
      barsHtml += `<div class="cmp-bar-section">小学生参加率</div>
        <div class="cmp-bar-wrap">
          <div class="cmp-bar-label"><span>参加率</span><span>${rateA!==null?rateA.toFixed(1)+'%':'－'} vs ${rateB!==null?rateB.toFixed(1)+'%':'－'} ${winner(rateA,rateB)}</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            <div class="cmp-bar-track"><div class="cmp-bar-fill" style="width:${pct(rateA||0,rMax)}%;background:#2563eb"></div></div>
            <div class="cmp-bar-track"><div class="cmp-bar-fill" style="width:${pct(rateB||0,rMax)}%;background:#d97706"></div></div>
          </div>
        </div>`;
    }

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
        <div class="cmp-col-title a" style="display:inline-flex;align-items:center;gap:4px"><span class="msi" style="font-size:14px;color:#3b82f6">circle</span>${nameA}</div>
        <div class="cmp-col-title b" style="display:inline-flex;align-items:center;gap:4px"><span class="msi" style="font-size:14px;color:#d97706">circle</span>${nameB}</div>
      </div>
      ${kpiHtml}
      ${barsHtml}`;
  };

  window.openCmpModal = function(defaultCity) {
    if (window.Analytics) window.Analytics.modalOpen('compare', {city: defaultCity || ''});
    _cmpInitSelects(defaultCity);
    document.getElementById('cmp-modal').classList.add('open');
    window.renderCmp();
    document.getElementById('cmp-modal').onclick = e => {
      if(e.target===document.getElementById('cmp-modal')) window.closeCmpModal();
    };
  };
  window.closeCmpModal = function() {
    document.getElementById('cmp-modal').classList.remove('open');
  };
  // Escape キーでモーダルを閉じる
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      window.closeChartModal();
      if (window.closeCmpModal) window.closeCmpModal();
    }
  });
  // ══════════════════════════════════════════
  // 現在地から近いチーム検索
  // ══════════════════════════════════════════
  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // チームの最適座標を返す（活動場所座標 > チーム住所座標）
  function _teamBestCoords(t) {
    const _pc = (t.place && t.place !== '-') ? PLACE_COORDS[t.place] : null;
    const lat = _pc ? _pc[0] : t.lat;
    const lng = _pc ? _pc[1] : t.lng;
    if (!lat || !lng) {
      // cityDataからフォールバック
      const cd = cityMap[t.city];
      if (cd && cd.lat && cd.lng) return [cd.lat, cd.lng];
      return null;
    }
    return [lat, lng];
  }

  // 現在地キャッシュ（セッション中に再利用）
  let _cachedUserLoc = null;

  // 近くのチーム検索（位置情報 or 地図タップ or フォールバック）
  function _doNearbySearch(lat, lng, usedFallback) {
    const btn = document.getElementById('btn-nearby');
    btn.classList.remove('locating');
    btn.innerHTML = '<span class="msi" style="font-size:18px">my_location</span>';
    if (userLocMarker) userLocMarker.map = null;
    if (!usedFallback) {
      const el = document.createElement('div');
      el.className = 'loc-pulse';
      userLocMarker = new google.maps.marker.AdvancedMarkerElement({
        position: {lat, lng},
        content: el,
        map,
        title: '現在地',
      });
    }
    const visible = teamData.filter(t => teamActiveCats.has(t.cat));
    const withDist = visible
      .map(t => {
        const coords = _teamBestCoords(t);
        if (!coords) return null;
        return { ...t, _blat: coords[0], _blng: coords[1], km: haversineKm(lat, lng, coords[0], coords[1]) };
      })
      .filter(Boolean)
      .sort((a,b) => a.km - b.km)
      .slice(0, 20);
    const body = document.getElementById('nbp-body');
    body.innerHTML = '';
    const headerNote = usedFallback
      ? '<div style="font-size:10px;color:var(--caution);padding:4px 8px 0;text-align:center;display:flex;align-items:center;justify-content:center;gap:3px"><span class="msi" style="font-size:12px">push_pin</span>地図の中心から近い順に表示しています</div>'
      : '<div style="font-size:10px;color:#059669;padding:4px 8px 0;text-align:center;"><span style="display:inline-flex;align-items:center;gap:3px"><span class="msi" style="font-size:12px">place</span>指定地点から近い順に表示</span><br><span style="color:var(--ink-3);font-size:9px;">（再タップで地点を変更できます）</span></div>';
    if (!withDist.length) {
      body.innerHTML = headerNote + '<div class="nbp-empty">表示中のチームがありません。</div>';
    } else {
      const n=document.createElement('div'); n.innerHTML=headerNote; body.appendChild(n.firstElementChild);
      withDist.forEach((t, i) => {
        const col = CAT_COLOR[t.cat] || '#888';
        const km = t.km < 1 ? Math.round(t.km*1000)+'m' : t.km.toFixed(1)+'km';
        const item = document.createElement('div');
        item.className = 'nbp-item';
        const nbpBall = t.ball==='硬式'
          ? `<span style="display:inline-block;padding:0 4px;border-radius:6px;font-size:8px;font-weight:700;background:#fff3cc;color:#a07000;border:1px solid #e8c840;margin-left:3px;">硬式</span>`
          : t.ball==='軟式'
          ? `<span style="display:inline-block;padding:0 4px;border-radius:6px;font-size:8px;font-weight:700;background:#e8f3ff;color:#1a6ab0;border:1px solid #a8ccee;margin-left:3px;">軟式</span>`
          : '';
        const nbpLinks = [
          t.hp      && t.hp!=='-'      ? `<a href="${t.hp}"        target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#3b82f6;text-decoration:none;display:inline-flex;align-items:center" title="HP"><span class="msi" style="font-size:13px">public</span></a>` : '',
          t.x_url   && t.x_url!=='-'   ? `<a href="${t.x_url}"     target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#000;text-decoration:none;display:inline-flex;align-items:center" title="X (Twitter)"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>` : '',
          t.ig      && t.ig!=='-'      ? `<a href="${t.ig}"        target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#e1306c;text-decoration:none;display:inline-flex;align-items:center" title="Instagram"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : '',
          t.other_url && t.other_url!=='-' ? `<a href="${t.other_url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#555;text-decoration:none;display:inline-flex;align-items:center" title="Link"><span class="msi" style="font-size:13px">link</span></a>` : '',
        ].filter(Boolean).join(' ');
        item.innerHTML = `
          <div class="nbp-rank">${i+1}</div>
          <div class="nbp-dot" style="background:${col};"></div>
          <div class="nbp-info">
            <div class="nbp-name">${t.name}${nbpBall}</div>
            <div class="nbp-meta">${t.city}・${CAT_JP2[t.cat]}${t.gender==='female'?' (女子)':''}${nbpLinks ? ' '+nbpLinks : ''}</div>
          </div>
          <div class="nbp-km">${km}</div>`;
        item.addEventListener('click', () => {
          const tLat = t._blat, tLng = t._blng;
          window.closeNearby();
          if (t.cat === 'elem') {
            // 小学生：ピンにジャンプ
            if (!showPins) { showPins=true; const cb=document.getElementById('chk-pins'); if(cb) cb.checked=true; renderTeamPins(); }
            map.setCenter({lat:tLat, lng:tLng}); map.setZoom(15);
            setTimeout(() => {
              const target = teamPinLayers.find(layer => layer._teamName === t.name);
              if (target) {
                map.setCenter(target.position); map.setZoom(15);
                setTimeout(() => {
                  const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
                  _iw.open({map, anchor: target});
                }, 300);
              }
            }, 500);
          } else {
            // 非小学生：市町村ズーム＋チーム情報ポップアップ
            const cityEntry = (useWardView ? [...wardData,...cityData.filter(x=>x.city!=='さいたま市')] : cityData)
              .find(x => x.city === t.city);
            const popLat = cityEntry ? cityEntry.lat : tLat;
            const popLng = cityEntry ? cityEntry.lng : tLng;
            map.setCenter({lat:popLat, lng:popLng}); map.setZoom(13);
            setTimeout(() => {
              const _iw = new google.maps.InfoWindow({content: teamPopupHTML(t)});
              _iw.setPosition(new google.maps.LatLng(popLat, popLng));
              _iw.open(map);
              _panForPopup();
            }, 400);
          }
        });
        body.appendChild(item);
      });
    }
    document.getElementById('nbp-dist').textContent =
      withDist.length ? `最寄り ${withDist[0].km < 1 ? Math.round(withDist[0].km*1000)+'m' : withDist[0].km.toFixed(1)+'km'}` : '';
    document.getElementById('nearby-panel').classList.add('open');
    if (!usedFallback) { map.setCenter({lat, lng}); map.setZoom(13); }
  }

  // ── 地図タップモード管理 ──
  let _tapModeActive = false;
  let _tapOverlay = null; // 透明オーバーレイ要素

  function _enterTapMode() {
    _tapModeActive = true;
    const banner = document.getElementById('loc-tap-banner');
    const mapC = document.getElementById('map-container');
    if (banner) banner.classList.add('show');
    if (mapC) mapC.classList.add('tap-mode');
    const btn = document.getElementById('btn-nearby');
    btn.classList.remove('locating');
    btn.innerHTML = '<span class="msi" style="font-size:18px">my_location</span>';

    // 地図の上に透明オーバーレイを配置してすべてのレイヤークリックを遮断
    _tapOverlay = document.createElement('div');
    _tapOverlay.id = 'tap-overlay';
    _tapOverlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:900;cursor:crosshair;background:transparent;';
    const mapEl = document.getElementById('map');
    mapEl.parentElement.insertBefore(_tapOverlay, mapEl.nextSibling);

    _tapOverlay.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      // クリック位置をmap座標に変換（Google Maps Projection を使用）
      const mapRect = mapEl.getBoundingClientRect();
      const x = e.clientX - mapRect.left;
      const y = e.clientY - mapRect.top;
      const proj = map.getProjection();
      const topRight = proj.fromLatLngToPoint(map.getBounds().getNorthEast());
      const bottomLeft = proj.fromLatLngToPoint(map.getBounds().getSouthWest());
      const scale = Math.pow(2, map.getZoom());
      const worldPoint = new google.maps.Point(
        x / scale + bottomLeft.x,
        y / scale + topRight.y
      );
      const latlng = proj.fromPointToLatLng(worldPoint);
      _exitTapMode();
      _cachedUserLoc = { lat: latlng.lat(), lng: latlng.lng(), _ts: Date.now() };
      _doNearbySearch(latlng.lat(), latlng.lng(), false);
    });
  }

  function _exitTapMode() {
    _tapModeActive = false;
    const banner = document.getElementById('loc-tap-banner');
    const mapC = document.getElementById('map-container');
    if (banner) banner.classList.remove('show');
    if (mapC) mapC.classList.remove('tap-mode');
    if (_tapOverlay) {
      _tapOverlay.remove();
      _tapOverlay = null;
    }
  }

  window.cancelTapMode = function() {
    _exitTapMode();
  };

  window.searchNearby = function() {
    // タップモード中なら解除
    if (_tapModeActive) { _exitTapMode(); return; }

    const btn = document.getElementById('btn-nearby');

    // キャッシュがあれば再利用（5分以内は再取得しない）
    if (_cachedUserLoc && _cachedUserLoc._ts && (Date.now() - _cachedUserLoc._ts < 300000)) {
      _doNearbySearch(_cachedUserLoc.lat, _cachedUserLoc.lng, false);
      return;
    }

    // Geolocation失敗時 → 地図タップモードに切り替え
    const runWithTapMode = () => {
      btn.classList.remove('locating');
      btn.innerHTML = '<span class="msi" style="font-size:18px">my_location</span>';
      _enterTapMode();
    };

    if (!navigator.geolocation) { runWithTapMode(); if (window.Analytics) window.Analytics.gpsUse('unavailable'); return; }

    btn.classList.add('locating');
    btn.innerHTML = '<span class="msi" style="font-size:18px">hourglass_empty</span>';
    if (window.Analytics) window.Analytics.gpsUse('requested');

    const timer = setTimeout(() => { runWithTapMode(); }, 10000);

    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(timer);
        _cachedUserLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, _ts: Date.now() };
        if (window.Analytics) window.Analytics.gpsUse('granted');
        _doNearbySearch(pos.coords.latitude, pos.coords.longitude, false);
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Geolocation error:', err.code, err.message);
        if (window.Analytics) window.Analytics.gpsUse(err.code === 1 ? 'denied' : 'unavailable');
        runWithTapMode();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  };

  window.closeNearby = function() {
    document.getElementById('nearby-panel').classList.remove('open');
    _exitTapMode();
  };
  // ══════════════════════════════════════════
  // 市区町村フィルター
  // ══════════════════════════════════════════
  // ドロップダウンの選択肢を cityData から生成
  function initCitySelect() {
    const sel = document.getElementById('city-select');
    if (!sel) return;
    // 区ごと表示時は区＋さいたま市以外の市町村、通常は63市町村
    const cities = useWardView
      ? [...wardData.map(d => d.city), ...cityData.filter(d => d.city !== 'さいたま市').map(d => d.city)]
          .sort((a,b) => a.localeCompare(b, 'ja'))
      : [...new Set(cityData.map(d => d.city))].sort((a,b) => a.localeCompare(b, 'ja'));
    const placeholder = useWardView ? '── 市区町村を選択 ──' : '── 市町村を選択 ──';
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    cities.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
    // タイトル更新
    const titleEl = document.getElementById('city-section-title');
    if (titleEl) titleEl.textContent = useWardView ? '市区町村絞り込み' : '市町村絞り込み';
  }
  window.applyCityFilter = function(cityName) {
    selectedCity = cityName || null;
    selectedCityCat = null; // カテゴリ絞り込みリセット
    // フィルターバー表示
    const bar = document.getElementById('city-filter-bar');
    if (selectedCity) {
      const count = teamData.filter(t => _cityMatch(t.city, selectedCity)).length;
      document.getElementById('city-filter-name').innerHTML = '<span class="msi" style="font-size:14px;vertical-align:-2px">place</span> ' + selectedCity;
      document.getElementById('city-filter-count').textContent = count + 'チーム';
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
    // ドロップダウン同期
    const sel = document.getElementById('city-select');
    if (sel) sel.value = selectedCity || '';
    // タブをリセット（絞り込み解除時は「全て」に戻す）
    if (!selectedCity && typeof window.setTlpTab === 'function') window.setTlpTab('all');
    // チームリスト更新 & 開く
    renderTeamPins();
    if (selectedCity) {
      if (!teamListOpen) window.toggleTeamList();
      // スマホはボトムナビバッジのactiveも更新
      const bnavBtn = document.getElementById('bnav-list');
      if (bnavBtn) bnavBtn.classList.add('active');
      // ── ズーム＋ポップアップ ──
      const zoomAndPopup = () => {
        // パネル分の下側パディングを確保（パネル高さ=60vh）
        const panelH = teamListOpen ? Math.round(window.innerHeight * 0.6) : 40;
        // 市区町村の中心座標を使ってズーム＋ポップアップ
        const all = useWardView
          ? [...wardData, ...cityData.filter(x => x.city !== 'さいたま市')]
          : cityData;
        const entry = all.find(d => d.city === selectedCity);
        if (entry && entry.lat && entry.lng) {
          map.setCenter({lat:entry.lat, lng:entry.lng}); map.setZoom(12);
          setTimeout(() => {
            const d = (useWardView ? [...wardData,...cityData.filter(x=>x.city!=='さいたま市')] : cityData).find(x=>x.city===selectedCity);
            if (d) {
              _ensureCityInfoWindow();
              const iw = _cityInfoWindow;
              iw.setContent(popupHTML(d));
              iw.setPosition(new google.maps.LatLng(entry.lat, entry.lng));
              iw.open(map);
              setTimeout(_panForPopup, 300);
            }
          }, 400);
        }
      };
      setTimeout(zoomAndPopup, 100);
    }
  }
  window.setMapType = function(type) {
    map.setMapTypeId(type);
    document.querySelectorAll('.mtype-btn,.smtype-btn').forEach(b => b.classList.toggle('active', b.dataset.mtype === type));
  };
  window.resetMapView = function() {
    const sidebarW = !isMobile() ? 280 : 0;
    map.fitBounds(SAITAMA_BOUNDS, {
      left: sidebarW + 10, top: 10, right: 10, bottom: 10
    });
    // エリアフィルター解除
    if (areaFilterActive) {
      areaFilterActive = false;
      const btn = document.getElementById('btn-area-filter');
      if (btn) { btn.innerHTML = '<span class="msi" style="font-size:14px;vertical-align:-2px">crop_free</span> エリア絞込'; btn.style.background = ''; }
      update();
    }
  };

  window.focusCity = function(cityName) {
    // モバイル: サイドバーを閉じて地図を見えるようにする
    if (isMobile()) {
      const sb = document.getElementById('sidebar');
      if (sb && !sb.classList.contains('hidden')) {
        sb.classList.add('hidden');
        const hbg = document.getElementById('hbg');
        if (hbg) hbg.classList.remove('open');
        const bd = document.getElementById('backdrop');
        if (bd) bd.classList.remove('show');
      }
    }
    window.applyCityFilter(cityName);
    _pushState();
  };
  window.selectCityFilter = function(cityName) {
    window.applyCityFilter(cityName);
  };
  window.clearCityFilter = function() {
    window.applyCityFilter('');
  };
  // カテゴリ指定付き市区町村フィルター（バッジタップ）
  window.applyCityFilterByCat = function(cityName, cat) {
    const CAT_JP3={elem:'小学生',jhs:'中学生',hs:'高校生',univ:'大学生',club:'企業・クラブ'};
    selectedCity = cityName;
    selectedCityCat = cat;
    // フィルターバー表示
    const bar = document.getElementById('city-filter-bar');
    const count = teamData.filter(t => _cityMatch(t.city, cityName) && t.cat === cat).length;
    document.getElementById('city-filter-name').innerHTML = '<span class="msi" style="font-size:14px;vertical-align:-2px">place</span> ' + cityName + '｜' + (CAT_JP3[cat]||cat);
    document.getElementById('city-filter-count').textContent = count + 'チーム';
    bar.classList.add('show');
    // ドロップダウン同期
    const sel = document.getElementById('city-select');
    if(sel) sel.value = cityName;
    // リスト更新して開く
    renderTeamPins();
    if(!teamListOpen) window.toggleTeamList();
    const bnavBtn = document.getElementById('bnav-list');
    if(bnavBtn) bnavBtn.classList.add('active');
    // タブをカテゴリに合わせる
    const tabCats = ['elem','jhs','hs','club'];
    window.setTlpTab(tabCats.includes(cat) ? cat : 'all');
    // ズーム（applyCityFilter と同じ処理）
    setTimeout(() => {
      const panelH = teamListOpen ? Math.round(window.innerHeight * 0.6) : 40;
      const all = useWardView ? [...wardData,...cityData.filter(x=>x.city!=='さいたま市')] : cityData;
      const entry = all.find(d => d.city === cityName);
      if (entry && entry.lat && entry.lng) {
        map.setCenter({lat:entry.lat, lng:entry.lng}); map.setZoom(12);
        setTimeout(() => {
          const d = cityMap[cityName];
          if (d) {
            _ensureCityInfoWindow();
            _cityInfoWindow.setContent(popupHTML(d));
            _cityInfoWindow.setPosition(new google.maps.LatLng(entry.lat, entry.lng));
            _cityInfoWindow.open(map);
          }
        }, 400);
      }
    }, 100);
  };
  // ══════════════════════════════════════════
  // スマホ ボトムナビ制御
  // ══════════════════════════════════════════
  const VIEW_LABELS = {choro:'色分け', bubble:'バブル'};
  const VIEW_ORDER  = ['choro','bubble'];
  window.bnavToggleList = function() {
    const panel = document.getElementById('team-list-panel');
    const isOpen = panel.classList.contains('open');
    // 近傍パネルは閉じる
    if(window.closeNearby) window.closeNearby();
    if (isOpen) {
      window.closeTeamList();
      document.getElementById('bnav-list').classList.remove('active');
    } else {
      window.toggleTeamList();
      document.getElementById('bnav-list').classList.add('active');
    }
  };
  window.bnavCycleView = function() {
    const idx = VIEW_ORDER.indexOf(currentView);
    const next = VIEW_ORDER[(idx + 1) % VIEW_ORDER.length];
    window.setView(next);
    // ボタンラベル更新
    const el = document.getElementById('bnav-view-label');
    if (el) el.textContent = VIEW_LABELS[next];
  };
  // チームリストが閉じたらバッジボタンのactiveを解除
  const _origCloseList = window.closeTeamList;
  window.closeTeamList = function() {
    _origCloseList();
    const btn = document.getElementById('bnav-list');
    if (btn) btn.classList.remove('active');
  };
  // ボトムナビのバッジ（チーム数）を renderTeamPins と同期
  function updateBnavBadge(n) {
    const el = document.getElementById('bnav-badge');
    if (el) el.textContent = n;
  }
  window.toggleSidebar=function(){
    if(!isMobile()) return;
    const open=!sidebar.classList.contains('hidden');
    sidebar.classList.toggle('hidden',open);
    backdrop.classList.toggle('show',!open);
    hbg.classList.toggle('open',!open);
  };
  window.closeSidebar=function(){
    sidebar.classList.add('hidden');
    backdrop.classList.remove('show');
    hbg.classList.remove('open');
  };

  // ── PC サイドバー折りたたみ（マップ領域を最大化）──
  const PC_COLLAPSE_KEY = 'pcSidebarCollapsed';
  window.toggleSidebarPC = function() {
    const collapsed = sidebar.classList.toggle('pc-collapsed');
    const btn = document.getElementById('sidebar-collapse-btn');
    if (btn) {
      btn.classList.toggle('collapsed', collapsed);
      btn.setAttribute('aria-label', collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる');
      btn.setAttribute('title', collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる');
    }
    try { localStorage.setItem(PC_COLLAPSE_KEY, collapsed ? '1' : '0'); } catch(e) {}
    // Google Maps にサイズ変更を通知
    setTimeout(() => {
      try { google.maps.event.trigger(map, 'resize'); } catch(e) {}
    }, 320);
  };
  // 初期状態を復元（PC のみ）
  try {
    if (!isMobile() && localStorage.getItem(PC_COLLAPSE_KEY) === '1') {
      sidebar.classList.add('pc-collapsed');
      const btn = document.getElementById('sidebar-collapse-btn');
      if (btn) {
        btn.classList.add('collapsed');
        btn.setAttribute('aria-label', 'サイドバーを開く');
        btn.setAttribute('title', 'サイドバーを開く');
      }
    }
  } catch(e) {}

  // ── モバイル検索：チームリストを開いて検索欄にフォーカス ──
  window.mobOpenSearch = function() {
    const panel = document.getElementById('team-list-panel');
    if (!panel.classList.contains('open')) window.toggleTeamList();
    const btn = document.getElementById('bnav-list');
    if (btn) btn.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('tlp-search-input');
      if (input) { input.focus(); input.scrollIntoView({behavior:'smooth'}); }
    }, 320);
  };

  // ── FAB 展開/収縮 ──
  window.mobFabToggle = function() {
    const fab  = document.getElementById('mob-fab');
    const menu = document.getElementById('mob-fab-menu');
    const isOpen = menu.classList.toggle('open');
    fab.classList.toggle('open', isOpen);
    // エリア解除ボタンの表示制御
    const clr = document.getElementById('mfi-area-clear');
    if (clr) clr.style.display = areaFilterActive ? '' : 'none';
    const aBtn = document.getElementById('mfi-area');
    if (aBtn) aBtn.classList.toggle('active', areaFilterActive);
  };
  window.mobFabClose = function() {
    document.getElementById('mob-fab')?.classList.remove('open');
    document.getElementById('mob-fab-menu')?.classList.remove('open');
  };

  // ── チームリスト 3段階サイズ ──
  window.mobTlpCycleSize = function() {
    const panel = document.getElementById('team-list-panel');
    const btn   = document.getElementById('tlp-expand');
    if (!panel.classList.contains('open')) {
      panel.classList.add('open');
      panel.classList.remove('full');
      if (btn) btn.textContent = '▲';
    } else if (!panel.classList.contains('full')) {
      panel.classList.add('full');
      if (btn) btn.textContent = '▼';
    } else {
      panel.classList.remove('open','full');
      if (btn) btn.textContent = '▲';
      const listBtn = document.getElementById('bnav-list');
      if (listBtn) listBtn.classList.remove('active');
    }
  };

  // モバイルのみ展開ボタンを表示
  if (window.isMobile && isMobile()) {
    const eb = document.getElementById('tlp-expand');
    if (eb) eb.style.display = '';
  }

  applyMapPadding(false); // 初期高さを設定
  _restoreState();

  window.addEventListener('resize',()=>{
    applyMapPadding(teamListOpen);
    if(!isMobile()){
      sidebar.classList.remove('hidden');
      backdrop.classList.remove('show');
      const eb = document.getElementById('tlp-expand');
      if (eb) eb.style.display = 'none';
    } else {
      const eb = document.getElementById('tlp-expand');
      if (eb) eb.style.display = '';
    }
    update();
  });
}; // end initMap

  // ══════════════════════════════════════════════
  // 活動場所ジオコーディング（国土地理院API）
  // ══════════════════════════════════════════════
  const GSI_API = 'https://msearch.gsi.go.jp/address-search/AddressSearch?q=';
  const GEO_CACHE_KEY = 'saitama_place_coords_v3'; // v3: Google Geocoder に切替
  const GEO_SAITAMA_BOUNDS = {latMin:35.6, latMax:36.4, lngMin:138.8, lngMax:140.1};
  let _geoCache = {};

  function _inSaitama(lat, lng) {
    return lat >= GEO_SAITAMA_BOUNDS.latMin && lat <= GEO_SAITAMA_BOUNDS.latMax &&
           lng >= GEO_SAITAMA_BOUNDS.lngMin && lng <= GEO_SAITAMA_BOUNDS.lngMax;
  }

  async function _geocodeOne(placeName) {
    if (_geoCache[placeName]) return _geoCache[placeName];
    const geocoder = new google.maps.Geocoder();
    const _tryGeocode = (address) => new Promise(resolve => {
      geocoder.geocode({ address, region: 'JP' }, (results, status) => {
        if (status === 'OK' && results.length > 0) {
          const loc = results[0].geometry.location;
          resolve([loc.lat(), loc.lng()]);
        } else {
          resolve(null);
        }
      });
    });
    try {
      // 「埼玉県」付きで検索
      let coords = await _tryGeocode(placeName + ' 埼玉県');
      if (coords && _inSaitama(coords[0], coords[1])) return coords;
      // 埼玉県なしで再試行
      coords = await _tryGeocode(placeName);
      if (coords && _inSaitama(coords[0], coords[1])) return coords;
      return null;
    } catch(e) { return null; }
  }

  function _saveGeoCache() {
    try {
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(_geoCache));
    } catch(e) {}
  }

  function _loadGeoCache() {
    try {
      const s = localStorage.getItem(GEO_CACHE_KEY);
      if (s) _geoCache = JSON.parse(s);
    } catch(e) { _geoCache = {}; }
  }

  // PLACE_COORDSをジオキャッシュで上書き・追加する
  function _applyGeoCache() {
    const pc = window.PLACE_COORDS;
    if (!pc) return 0;
    let updated = 0;
    for (const [place, coords] of Object.entries(_geoCache)) {
      if (coords) {
        pc[place] = coords; // 既存更新 + 新規追加
        updated++;
      }
    }
    return updated;
  }

  // 未取得placeを全てジオコーディングする（バックグラウンド）
  const _GEO_PLACES = ['in加須きずなスタジアム', 'さいたま市立三橋小学校', 'さいたま市立上落合小学校', 'さいたま市立下落合小学校', 'さいたま市立与野本町小学校', 'さいたま市立与野西北小学校', 'さいたま市立仲町小学校', 'さいたま市立北浦和小学校', 'さいたま市立向小学校', 'さいたま市立和土小学校', 'さいたま市立善前小学校', 'さいたま市立土合小学校', 'さいたま市立大宮東小学校', 'さいたま市立大東小学校', 'さいたま市立大砂土小学校', 'さいたま市立大砂土東小学校', 'さいたま市立大谷口小学校', 'さいたま市立大門小学校', 'さいたま市立宮前小学校', 'さいたま市立尾間木小学校', 'さいたま市立岩槻小学校', 'さいたま市立島小学校', 'さいたま市立常盤小学校', 'さいたま市立指扇小学校', 'さいたま市立新和小学校', 'さいたま市立春岡小学校', 'さいたま市立木崎小学校', 'さいたま市立本太小学校', 'さいたま市立東大成小学校', 'さいたま市立柏崎小学校', 'さいたま市立栄和小学校', 'さいたま市立桜木小学校', 'さいたま市立植水小学校', 'さいたま市立植竹小学校', 'さいたま市立沼影小学校', 'さいたま市立泰平小学校', 'さいたま市立浦和大里小学校', 'さいたま市立片柳小学校', 'さいたま市立神田小学校', 'さいたま市立芝原小学校', 'さいたま市立芝川小学校', 'さいたま市立西原小学校', 'さいたま市立西浦和小学校', 'さいたま市立谷田小学校', 'さいたま市立辻小学校', 'さいたま市立道祖土小学校', 'さいたま市立野田小学校', 'さいたま市立針ヶ谷小学校', 'さいたま市立鈴谷小学校', 'さいたま市立高砂小学校', 'さいたま市芝原小学校', 'ときがわ町立明覚小学校', 'ふじみ野市立上野台小学校', 'ふるさと広場', 'みずほグラウンド', 'グラウンド', 'メインに氷川小学校', '三橋小学校', '三芳町立藤久保小学校', '三角広場', '三郷市立前川小学校', '三郷市立彦成小学校', '三郷市立新和小学校', '三郷市立瑞木小学校', '三郷市立高州小学校', '上尾市民球場', '上尾市立今泉小学校', '上尾市立原市南小学校', '上尾市立原市小学校', '上尾市立大石南小学校', '上尾市立大石小学校', '上尾市立富士見小学校', '上尾市立平方小学校', '上尾市立東小学校', '上尾市立東町小学校', '上尾市立瓦葺小学校', '上里町立七本木小学校', '上里町立神保原小学校', '下鎌田小学校', '主に常盤小学校', '久喜市立久喜小学校', '久喜市立太田小学校', '久喜市立栢間小学校', '久喜市立鷲宮小学校', '井泉グラウンド', '伊奈町立小室小学校', '伊奈町立小針北小学校', '会場:影森グラウンド', '入間市立宮寺小学校', '入間市立新久小学校', '入間市立東町小学校', '入間市立東金子小学校', '入間市立藤沢北小学校', '入間市立藤沢南小学校', '入間市立藤沢東小学校', '入間市立豊岡小学校', '入間市立金子小学校', '入間市立高倉小学校', '入間市立黒須小学校第二グラウンド', '入間市藤沢地区体育館グラウンド', '八幡北小学校', '八潮市立八條小学校', '八潮市立大原小学校', '八潮市立大曽根小学校', '八潮市立大瀬小学校', '八潮市立松之木小学校', '加須きずなスタジアム', '加須市立三俣小学校', '加須市立元和小学校', '加須市立北川辺西小学校', '加須市立礼羽小学校', '北本市立石戸小学校', '北桜ファイターズ＝埼玉県行田市総合公園野球場', '半田公園・番匠免グラウンド', '南越谷小学校', '又グラウンド', '吉川市立北谷小学校', '吉川市立旭小学校', '吉川市立栄小学校', '吉見町立南小学校', '和光市立北原小学校', '和光市立広沢小学校', '和光市立新倉小学校', '和光市立白子小学校', '和光市立第三小学校', '和光市立第五小学校', '唐子中央公園', '坂戸市内グラウンド', '埼玉上尾ボーイズ専用グラウンド（岩槻）', '埼玉県越谷市越ヶ谷小学校', '場所】旭公園球場', '多目的グラウンド', '大利根運動公園野球場', '大沼公園', '大泉緑地公園', '大田スタジアム', '大石北小学校', '大野小学校', '大阪シティ信用金庫スタジアム', '宝珠花河川敷グラウンド', '宮代町立笠原小学校', '宮代町立須賀小学校', '宮原公園', '寄居小グラウンド', '寄居町立折原小学校', '富士見市運動公園', '小室小学校グラウンド', '小川町立八和田小学校', '岩槻城址公園野球場', '岩槻川通公園野球場', '嵐山町立菅谷小学校', '川口市営球場', '川口市立上青木小学校', '川口市立元郷小学校', '川口市立差間小学校', '川口市立幸町小学校', '川口市立新郷南小学校', '川口市立新郷小学校', '川口市立朝日東小学校', '川口市立朝日西小学校', '川口市立柳崎小学校', '川口市立芝中央小学校', '川口市立芝西小学校', '川口市立辻小学校', '川口市立里小学校', '川口市立青木中央小学校', '川口市立青木北小学校', '川口市立飯塚小学校', '川口市立鳩ヶ谷小学校', '川越市立仙波小学校', '川越市立武蔵野小学校', '川越市立泉小学校', '川越市立高階南小学校', '川通球場', '市民球場', '平方野球場', '幸手市立上高野小学校', '幸手市立八代小学校', '幸手市立幸手小学校', '影森グラウンド', '志木市立宗岡第三小学校', '志木市立志木小学校', '志木市立志木第三小学校', '志木市立志木第二小学校', '志木市立志木第四小学校', '成田小学校グラウンド', '戸塚第二公園', '戸田市立喜沢小学校', '戸田市立戸田東小学校', '戸田市立戸田第一小学校', '戸田市立戸田第二小学校', '戸田市立新曽小学校', '戸田市立笹目東小学校', '戸田市立美女木小学校', '戸田市立美谷本小学校', '所沢市立北中小学校', '所沢市立北小学校', '所沢市立安松小学校', '所沢市立小手指小学校', '所沢市立山口小学校', '所沢市立泉小学校', '所沢市立美原小学校', '所沢市立若狭小学校', '手子林公民館グラウンド', '折之口ふれあい公園', '新座市営馬場運動場', '新座市立八石小学校', '新座市立大和田小学校', '新座市立新座小学校', '新座市立新開小学校', '新座市立東北小学校', '新座市立東野小学校', '新座市立栄小学校', '新座市立栗原小学校', '新座市立西堀小学校', '新座市立野寺小学校', '新座市立野火止小学校', '於：総合公園野球場', '春日小学校', '春日部市立上沖小学校', '春日部市立小渕小学校', '春日部市立武里南小学校', '春日部市立武里小学校', '春日部市立牛島小学校', '春日部市立立野小学校', '春日部市立粕壁小学校', '春日部市立豊春小学校', '春日部市立豊野小学校', '朝霞市営球場', '朝霞市立朝霞第三小学校', '朝霞市立朝霞第二小学校', '朝霞市立朝霞第八小学校', '朝霞市立朝霞第六小学校', '朝霞市立朝霞第十小学校', '朝霞第4小学校', '朝霞第7小学校', '本庄市立北泉小学校', '杉戸町立杉戸小学校', '杉戸町立西小学校', '村君小学校', '東松山市立唐子小学校', '東松山市立大岡小学校', '東松山市立青鳥小学校', '松伏町立松伏小学校', '松伏町立金杉小学校', '栗橋西小学校', '桜ヶ丘小学校', '桶川市立加納小学校', '桶川市立日出谷小学校', '桶川市立朝日小学校', '武里地区公民館グラウンド、正善小学校、備後小学校', '毛呂山町立毛呂山小学校', '江南グラウンド', '江面小学校', '江面第2小学校', '浦和総合運動場', '深谷市浄化センターとなりグラウンド', '深谷市立常盤小学校', '深谷市立深谷小学校', '深谷市立深谷西小学校', '滑川町立福田小学校', '潮止小や大瀬小学校', '熊谷市立別府小学校', '熊谷市立吉見小学校', '熊谷市立大麻生小学校', '狭山市児童公園野球場', '狭山市立入間川小学校', '狭山市立入間川東小学校', '狭山市立入間野小学校', '狭山市立南小学校', '狭山市立堀兼小学校', '狭山市立奥富小学校', '狭山市立富士見小学校', '狭山市立山王小学校', '狭山市立広瀬小学校', '狭山市立狭山台小学校', '狭山市立笹井小学校', '町民グラウンド', '白岡市立南小学校', '白岡市立白岡東小学校', '白岡市立西小学校', '皆野スポーツ公園多目的グラウンド', '目白台グラウンド', '県営大宮球場', '石井前原グラウンド', '砂中央公園', '秩父市立南小学校', '立野球場', '第3球場', '第二小学校グラウンド', '総合運動公園多目的公園内・野球場', '総合運動場', '美南小学校', '羽生中央公園野球場', '羽生市立羽生北小学校', '舟戸グラウンド', '若泉Cグラウンド', '若泉運動公園第一グラウンド', '草加市立八幡小学校', '草加市立新田小学校', '草加市立松原小学校', '草加市立栄小学校', '草加市立清門小学校', '草加市立瀬崎小学校', '草加市立花栗南小学校', '草加市立草加小学校', '草加市立西町小学校', '草加市立谷塚小学校', '草加市立高砂小学校', '荒川河川敷第6グラウンド', '蓮田南小学校', '蓮田市立蓮田中央小学校', '蕨市立北小学校', '蕨市立南小学校', '蕨市立西小学校', '蕨高校のグラウンド', '行田市立下忍小学校', '行田市立北小学校', '行田市立南小学校', '行田市立埼玉小学校', '行田市立東小学校', '行田市立泉小学校', '西富小学校', '豊野台公園・大利根西部公園', '越生町立越生小学校', '越谷市立出羽小学校', '越谷市立北越谷小学校', '越谷市立千間台小学校', '越谷市立南越谷小学校', '越谷市立城ノ上小学校', '越谷市立大沢小学校', '越谷市立大相模小学校', '越谷市立大袋北小学校', '越谷市立大袋小学校', '越谷市立大間野小学校', '越谷市立宮本小学校', '越谷市立川柳小学校', '越谷市立平方小学校', '越谷市立桜井小学校', '越谷市立花田小学校', '越谷市立荻島小学校', '越谷市立蒲生小学校', '越谷市立西方小学校', '越谷市立鷺後小学校', '運動公園野球場', '道満グリーンパーク野球場', '野球場', '長瀞第一／近隣の小学校', '開進第二小学校', '青葉グラウンド', '青葉台球場', '飯能市立南高麗小学校', '飯能市立双柳小学校', '飯能市立富士見小学校', '飯能市立精明小学校', '飯能市立飯能第一小学校', '高槻小学校', '鳩山町の小学校', '鴻巣市立下忍小学校', '鴻巣市立広田小学校', '鴻巣市立松原小学校', '鴻巣市立田間宮小学校', '鴻巣市立箕田小学校', '鴻巣市立赤見台第一小学校', '鴻巣市立馬室小学校', '鷲宮運動広場', '黒浜小学校', '／明治神宮野球場'];

  async function runGeocodingAll() {
    _loadGeoCache();
    const todo = _GEO_PLACES.filter(p => !_geoCache[p]);
    if (todo.length === 0) {
      // キャッシュから適用してピン再描画
      const n = _applyGeoCache();
      if (n > 0 && window.renderTeamPins) window.renderTeamPins();
      return;
    }
    // ジオコーディング進捗バー表示
    const bar = document.createElement('div');
    bar.id = 'geo-progress-bar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:4px;background:#0a1628;z-index:9999;';
    const fill = document.createElement('div');
    fill.style.cssText = 'height:100%;background:#3b82f6;width:0%;transition:width .3s;';
    bar.appendChild(fill);
    document.body.appendChild(bar);
    const _geoStatusEl = document.getElementById('geo-status');
    const _geoFillEl   = document.getElementById('geo-status-fill');
    const _geoTextEl   = document.getElementById('geo-status-text');
    if (_geoStatusEl) _geoStatusEl.style.display = 'block';

    let done = 0;
    for (const place of todo) {
      const coords = await _geocodeOne(place);
      if (coords) _geoCache[place] = coords;
      done++;
      const _pct = (done / todo.length * 100).toFixed(0);
      fill.style.width = _pct + '%';
      if (_geoFillEl) _geoFillEl.style.width = _pct + '%';
      if (_geoTextEl) _geoTextEl.innerHTML = '<span class="msi" style="font-size:13px;vertical-align:-2px">my_location</span> 活動場所を更新中... ' + done + '/' + todo.length;
      if (done % 20 === 0) {
        _saveGeoCache();
        _applyGeoCache();
        if (window.renderTeamPins) window.renderTeamPins(); // 20件ごとに部分更新
      }
      await new Promise(r => setTimeout(r, 200)); // 200ms間隔（Google Geocoder レート対策）
    }
    _saveGeoCache();
    _applyGeoCache();
    if (window.renderTeamPins) window.renderTeamPins();
    // バー・ステータス除去
    setTimeout(() => {
      bar.remove();
      if (_geoStatusEl) {
        if (_geoTextEl) _geoTextEl.innerHTML = '<span class="msi" style="font-size:13px;vertical-align:-2px;color:#00a854">check_circle</span> 活動場所座標を更新しました';
        setTimeout(() => { _geoStatusEl.style.display = 'none'; }, 3000);
      }
    }, 1000);
  }


  // ── ジオコーディング起動（全関数定義後） ──
  (function initGeocoding() {
    _loadGeoCache();
    var nApplied = _applyGeoCache();
    if (nApplied > 0 && window.renderTeamPins) window.renderTeamPins();
    setTimeout(function() { runGeocodingAll(); }, 2500);
  })();

  // ── アナリティクス: 外部SNSリンク・チームリスト項目クリックを捕捉 ──
  document.addEventListener('click', function(e) {
    if (!window.Analytics) return;
    // 外部SNSリンク
    const link = e.target.closest('.pu-sns-link, .pu-sns-row a, [data-ext-link]');
    if (link) {
      let type = 'other';
      if (link.classList.contains('pu-sns-hp') || link.title === 'HP') type = 'hp';
      else if (link.classList.contains('pu-sns-x') || link.title.startsWith('X')) type = 'x';
      else if (link.classList.contains('pu-sns-ig') || link.title === 'Instagram') type = 'instagram';
      else if (link.classList.contains('pu-sns-other') || link.title === 'Link') type = 'other';
      window.Analytics.externalLink(link.href, type);
      return;
    }
    // チーム一覧パネル / 近傍パネルの項目クリック
    const listItem = e.target.closest('.tlp-item, .nbp-item');
    if (listItem) {
      const name = listItem.querySelector('.tlp-name, .nbp-name')?.textContent?.trim() || '';
      const city = listItem.querySelector('.tlp-city, .nbp-city')?.textContent?.trim() || '';
      const listType = listItem.classList.contains('nbp-item') ? 'nearby' : 'team';
      window.Analytics.listItemClick(listType, {id:'', name, city});
    }
  }, true);

