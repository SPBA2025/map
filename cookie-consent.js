/**
 * Cookie 同意バナー
 *
 * 動作:
 *   - 初回訪問時にバナー表示
 *   - 「同意する」→ localStorage に true 保存 + Analytics 有効化
 *   - 「同意しない」→ localStorage に false 保存（バナー非表示・解析は発火しない）
 *   - 同意状態は永続化（再訪時はバナー非表示）
 *   - 設定変更したい場合は window.openCookieSettings() を呼ぶと再表示
 */
(function() {
  'use strict';
  const KEY = 'cookieConsent';

  // バナーHTML を生成
  function createBanner() {
    const wrap = document.createElement('div');
    wrap.id = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie 同意');
    wrap.innerHTML = `
      <div class="cb-inner">
        <div class="cb-text">
          本サイトはアクセス解析・サイト改善のため Cookie を使用します。
          詳細は <a href="/privacy.html">プライバシーポリシー</a> をご覧ください。
        </div>
        <div class="cb-btns">
          <button type="button" class="cb-btn cb-decline" id="cb-decline">同意しない</button>
          <button type="button" class="cb-btn cb-accept" id="cb-accept">同意する</button>
        </div>
      </div>
    `;
    return wrap;
  }

  // スタイル（インライン注入）
  function injectStyle() {
    if (document.getElementById('cookie-banner-style')) return;
    const style = document.createElement('style');
    style.id = 'cookie-banner-style';
    style.textContent = `
#cookie-banner{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:9000;background:#001f5b;color:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.25);padding:16px 18px;max-width:760px;margin:0 auto;animation:cb-slideup .35s cubic-bezier(0.32,0.72,0,1) both}
@keyframes cb-slideup{from{transform:translateY(120%);opacity:0}to{transform:translateY(0);opacity:1}}
#cookie-banner .cb-inner{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
#cookie-banner .cb-text{flex:1 1 280px;font-size:13px;line-height:1.6;color:#fff}
#cookie-banner .cb-text a{color:#c9a84c;text-decoration:underline;text-underline-offset:2px}
#cookie-banner .cb-text a:hover{color:#fff}
#cookie-banner .cb-btns{display:flex;gap:8px;flex-shrink:0}
#cookie-banner .cb-btn{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;border:1.5px solid transparent;transition:background-color .15s,color .15s,transform .12s}
#cookie-banner .cb-btn:active{transform:scale(0.96)}
#cookie-banner .cb-accept{background:#c9a84c;color:#001f5b;border-color:#c9a84c}
#cookie-banner .cb-accept:hover{background:#fff;border-color:#fff}
#cookie-banner .cb-decline{background:transparent;color:#fff;border-color:rgba(255,255,255,0.5)}
#cookie-banner .cb-decline:hover{background:rgba(255,255,255,0.1);border-color:#fff}
#cookie-banner.hidden{display:none}
@media(max-width:560px){
  #cookie-banner{padding:14px 14px}
  #cookie-banner .cb-text{font-size:12.5px}
  #cookie-banner .cb-btns{width:100%;justify-content:stretch}
  #cookie-banner .cb-btn{flex:1;padding:11px 12px;min-height:44px}
}
    `.trim();
    document.head.appendChild(style);
  }

  // バナー表示
  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    injectStyle();
    const banner = createBanner();
    document.body.appendChild(banner);

    document.getElementById('cb-accept').addEventListener('click', function() {
      try { localStorage.setItem(KEY, 'true'); } catch(e) {}
      banner.classList.add('hidden');
      enableAnalytics();
    });
    document.getElementById('cb-decline').addEventListener('click', function() {
      try { localStorage.setItem(KEY, 'false'); } catch(e) {}
      banner.classList.add('hidden');
      // Analytics は無効のまま
    });
  }

  // 解析タグ有効化
  function enableAnalytics() {
    window.__analyticsEnabled = true;
    if (window.Analytics && typeof window.Analytics.loadAnalytics === 'function') {
      window.Analytics.loadAnalytics();
    }
  }

  // 初期化
  function init() {
    let consent = null;
    try { consent = localStorage.getItem(KEY); } catch(e) {}

    if (consent === 'true') {
      // 既に同意済み → 即有効化
      enableAnalytics();
    } else if (consent === 'false') {
      // 拒否済み → 何もしない
    } else {
      // 未回答 → バナー表示
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    }
  }

  // 後から設定変更したい場合の公開API
  window.openCookieSettings = function() {
    try { localStorage.removeItem(KEY); } catch(e) {}
    const existing = document.getElementById('cookie-banner');
    if (existing) existing.remove();
    showBanner();
  };

  init();
})();
