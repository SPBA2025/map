/**
 * 初回ユーザー向けオンボーディング
 *
 * 動作:
 *   - 初回訪問時のみ表示（localStorage 'onboardingSeen' = 'true' で次回以降スキップ）
 *   - 3ステップの簡易ヒント
 *   - 「使い方を見る」ボタンで再表示可能 → window.openOnboarding()
 *   - ページ種別を data-page 属性または引数で判定（team / park）
 *
 * 設計:
 *   - SPBA カラー（クリーム + ネイビー + 赤）に統一
 *   - モバイル/PC 両対応
 *   - ESC キー・背景クリックで閉じる
 */
(function() {
  'use strict';

  const KEY = 'onboardingSeen';

  // ページ種別判定（body の data-page="team|park"、なければ自動検出）
  function detectPage() {
    const dp = document.body && document.body.dataset && document.body.dataset.page;
    if (dp) return dp;
    if (document.getElementById('search-box')) return 'park';
    return 'team';
  }

  const COPY = {
    team: {
      title: '埼玉県のチームを探そう',
      steps: [
        { icon: 'map', text: '地図のピンをタップ／クリックでチーム詳細を表示' },
        { icon: 'tune', text: '右パネルでカテゴリ・地域・キーワードで絞込' },
        { icon: 'location_on', text: '市町村バブルをタップでそのエリアにズーム' },
      ]
    },
    park: {
      title: 'キャッチボール公園を探そう',
      steps: [
        { icon: 'sports_baseball', text: '🟢=可 🟡=条件付き 🔴=禁止 で識別' },
        { icon: 'my_location', text: '「現在地周辺の公園を探す」で近くを検索' },
        { icon: 'flag', text: '情報の誤り・追加は「情報提供」から報告' },
      ]
    }
  };

  function injectStyle() {
    if (document.getElementById('onboarding-style')) return;
    const s = document.createElement('style');
    s.id = 'onboarding-style';
    s.textContent = `
#onboarding-overlay{position:fixed;inset:0;z-index:9500;background:rgba(27,40,66,0.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:ob-fade .25s ease both}
@keyframes ob-fade{from{opacity:0}to{opacity:1}}
@keyframes ob-pop{from{transform:translateY(12px) scale(.97);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
#onboarding-overlay .ob-card{background:#f8f2e6;color:#1b2842;border-radius:16px;max-width:440px;width:100%;box-shadow:0 12px 40px rgba(27,40,66,0.3);padding:28px 26px 22px;border-top:4px solid #c8202e;animation:ob-pop .3s cubic-bezier(0.32,0.72,0,1) both;position:relative}
#onboarding-overlay .ob-close{position:absolute;top:12px;right:12px;background:transparent;border:none;color:#1b2842;cursor:pointer;padding:6px;border-radius:8px;display:flex;align-items:center;justify-content:center}
#onboarding-overlay .ob-close:hover{background:rgba(27,40,66,0.08)}
#onboarding-overlay .ob-close .material-symbols-rounded{font-size:22px}
#onboarding-overlay h2{margin:0 0 18px;font-size:19px;font-weight:700;color:#1b2842;line-height:1.4;padding-right:28px}
#onboarding-overlay .ob-steps{display:flex;flex-direction:column;gap:14px;margin-bottom:22px}
#onboarding-overlay .ob-step{display:flex;align-items:flex-start;gap:12px;font-size:14px;line-height:1.55;color:#1b2842}
#onboarding-overlay .ob-step-icon{flex-shrink:0;width:36px;height:36px;border-radius:50%;background:#1b2842;color:#f8f2e6;display:flex;align-items:center;justify-content:center}
#onboarding-overlay .ob-step-icon .material-symbols-rounded{font-size:20px}
#onboarding-overlay .ob-step-num{font-weight:700;color:#c8202e;margin-right:4px}
#onboarding-overlay .ob-actions{display:flex;justify-content:flex-end;gap:10px}
#onboarding-overlay .ob-btn{padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:background-color .15s,color .15s,transform .12s,border-color .15s;font-family:inherit}
#onboarding-overlay .ob-btn:active{transform:scale(0.97)}
#onboarding-overlay .ob-primary{background:#1b2842;color:#f8f2e6;border-color:#1b2842}
#onboarding-overlay .ob-primary:hover{background:#c8202e;border-color:#c8202e}
@media(max-width:560px){
  #onboarding-overlay .ob-card{padding:24px 20px 18px}
  #onboarding-overlay h2{font-size:17px}
  #onboarding-overlay .ob-step{font-size:13.5px}
}
    `.trim();
    document.head.appendChild(s);
  }

  function open(force) {
    if (!force) {
      try { if (localStorage.getItem(KEY) === 'true') return; } catch(e) {}
    }
    if (document.getElementById('onboarding-overlay')) return;
    injectStyle();
    const page = detectPage();
    const copy = COPY[page] || COPY.team;
    const wrap = document.createElement('div');
    wrap.id = 'onboarding-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'ob-title');
    wrap.innerHTML = `
      <div class="ob-card">
        <button type="button" class="ob-close" aria-label="閉じる" id="ob-close">
          <span class="material-symbols-rounded">close</span>
        </button>
        <h2 id="ob-title">${copy.title}</h2>
        <div class="ob-steps">
          ${copy.steps.map((st, i) => `
            <div class="ob-step">
              <div class="ob-step-icon"><span class="material-symbols-rounded">${st.icon}</span></div>
              <div><span class="ob-step-num">${i+1}.</span>${st.text}</div>
            </div>
          `).join('')}
        </div>
        <div class="ob-actions">
          <button type="button" class="ob-btn ob-primary" id="ob-start">はじめる</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    function close() {
      try { localStorage.setItem(KEY, 'true'); } catch(e) {}
      wrap.remove();
    }
    document.getElementById('ob-start').addEventListener('click', close);
    document.getElementById('ob-close').addEventListener('click', close);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => open(false));
    } else {
      open(false);
    }
  }

  window.openOnboarding = function() { open(true); };

  init();
})();
