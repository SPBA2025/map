/**
 * ミニトースト通知
 *
 * 使い方:
 *   Toast.show('小学生のみ表示中（123件）');
 *   Toast.show('絞込をリセットしました', { type: 'info', duration: 2000 });
 *   Toast.show('エラー', { type: 'error' });
 *
 * 設計:
 *   - 画面下中央に小さく表示（モバイル）／左下（PC）
 *   - 同時に1つだけ表示（既存があれば差し替え）
 *   - 既定 2.5 秒で自動消滅
 *   - type: 'info'（既定 / ネイビー）| 'success'（緑）| 'warn'（橙）| 'error'（赤）
 */
(function() {
  'use strict';
  let currentEl = null;
  let currentTimer = null;

  function injectStyle() {
    if (document.getElementById('toast-style')) return;
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `
#app-toast{position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);background:rgba(27,40,66,0.94);color:#f8f2e6;padding:10px 16px;border-radius:24px;font-size:13px;font-weight:600;letter-spacing:.01em;z-index:9200;box-shadow:0 6px 20px rgba(27,40,66,0.28);display:inline-flex;align-items:center;gap:8px;max-width:min(90vw,420px);line-height:1.5;opacity:0;pointer-events:none;transition:opacity .22s,transform .22s cubic-bezier(0.32,0.72,0,1);backdrop-filter:blur(8px);font-family:inherit}
#app-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
#app-toast .toast-icon{flex-shrink:0;width:18px;height:18px;border-radius:50%;background:#f1a41d;color:#1b2842;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}
#app-toast .toast-icon .material-symbols-rounded{font-size:14px}
#app-toast.t-success{background:rgba(5,150,105,0.95)}
#app-toast.t-success .toast-icon{background:#fff;color:#059669}
#app-toast.t-warn{background:rgba(217,119,6,0.95)}
#app-toast.t-warn .toast-icon{background:#fff;color:#d97706}
#app-toast.t-error{background:rgba(200,32,46,0.95)}
#app-toast.t-error .toast-icon{background:#fff;color:#c8202e}
@media (min-width:769px){
  #app-toast{left:24px;bottom:24px;transform:translateX(0) translateY(20px);transform-origin:left bottom}
  #app-toast.show{transform:translateX(0) translateY(0)}
}
@media (prefers-reduced-motion: reduce){
  #app-toast{transition:opacity .12s}
}
    `.trim();
    document.head.appendChild(s);
  }

  const ICONS = {
    info: 'info',
    success: 'check',
    warn: 'warning',
    error: 'priority_high',
  };

  function show(message, opts) {
    if (!message) return;
    injectStyle();
    const { type = 'info', duration = 2500 } = opts || {};
    // 既存があれば再利用（差し替え）
    if (!currentEl) {
      currentEl = document.createElement('div');
      currentEl.id = 'app-toast';
      currentEl.setAttribute('role', 'status');
      currentEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(currentEl);
    }
    currentEl.className = '';
    if (type !== 'info') currentEl.classList.add('t-' + type);
    currentEl.innerHTML = `<span class="toast-icon"><span class="material-symbols-rounded">${ICONS[type] || ICONS.info}</span></span><span>${message}</span>`;
    // 一旦リセットしてアニメーションをトリガー
    void currentEl.offsetWidth;
    currentEl.classList.add('show');
    if (type !== 'info') currentEl.classList.add('t-' + type);
    if (currentTimer) clearTimeout(currentTimer);
    currentTimer = setTimeout(hide, duration);
  }

  function hide() {
    if (!currentEl) return;
    currentEl.classList.remove('show');
    if (currentTimer) { clearTimeout(currentTimer); currentTimer = null; }
  }

  window.Toast = { show, hide };
})();
