/**
 * 公園マップ 承認ページ（事務局用） — admin.js
 *
 * 目的:
 *  - Teams から開く事務局用の承認ページ。プロファイル非依存・Safe Links 回避・
 *    スキャナーの自動発火回避のため、承認/却下は「このページからの明示的な操作」で行う。
 *  - 一覧取得は GET(action=adminList)。承認/却下は POST(text/plain) の fire-and-forget。
 *    CORS でレスポンスは読めない前提のため、成否は一覧の再取得で判断する。
 *
 * 合言葉(token):
 *  - localStorage 'spba_admin_token' に保存。
 *  - URL ハッシュ #t=... があればそれを採用し localStorage に保存（ハッシュは消す）。
 *  - 無ければ合言葉入力欄を表示。token 不一致なら再入力。
 */
(function () {
  'use strict';

  var TOKEN_KEY = 'spba_admin_token';
  var token = '';

  var $ = function (id) { return document.getElementById(id); };

  // ── 合言葉の取得 ──────────────────────────────
  function readTokenFromHash() {
    var h = location.hash || '';
    var m = h.match(/[#&]t=([^&]+)/);
    if (m) {
      try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
    }
    return '';
  }

  function init() {
    var hashToken = readTokenFromHash();
    if (hashToken) {
      token = hashToken;
      try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
      // ハッシュをURLから消す（合言葉が履歴・画面に残らないように）
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    } else {
      try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { token = ''; }
    }

    bindGate();
    $('refresh-btn').addEventListener('click', loadList);
    bindLightbox();

    if (token) {
      loadList();
    } else {
      showGate();
    }
  }

  // ── 合言葉ゲート ──────────────────────────────
  function showGate(errMsg) {
    $('gate').style.display = '';
    $('status-bar').style.display = 'none';
    $('list').innerHTML = '';
    $('empty-state').style.display = 'none';
    $('refresh-btn').style.display = 'none';
    $('gate-err').textContent = errMsg || '';
    var input = $('gate-input');
    input.value = '';
    setTimeout(function () { input.focus(); }, 60);
  }

  function bindGate() {
    var submit = function () {
      var v = ($('gate-input').value || '').trim();
      if (!v) { $('gate-err').textContent = '合言葉を入力してください'; return; }
      token = v;
      try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
      $('gate').style.display = 'none';
      loadList();
    };
    $('gate-btn').addEventListener('click', submit);
    $('gate-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  }

  // ── 一覧取得（GET） ───────────────────────────
  function setStatus(text, loading) {
    var bar = $('status-bar');
    bar.style.display = '';
    bar.className = loading ? 'is-loading' : '';
    var icon = loading ? '<span class="msi spin">progress_activity</span>'
                       : '<span class="msi">inventory_2</span>';
    bar.innerHTML = icon + '<span>' + text + '</span>';
  }

  function loadList() {
    if (!token) { showGate(); return; }
    $('gate').style.display = 'none';
    $('refresh-btn').style.display = '';
    $('empty-state').style.display = 'none';
    setStatus('読み込み中…', true);

    fetch(GAS_URL + '?action=adminList&token=' + encodeURIComponent(token))
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || res.ok === false) {
          // token 不一致など
          if (res && res.error === 'token') {
            try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
            token = '';
            showGate('合言葉が違います。もう一度入力してください。');
          } else {
            setStatus('取得に失敗しました（' + ((res && res.error) || '不明') + '）', false);
          }
          return;
        }
        renderList(res.items || []);
      })
      .catch(function (err) {
        setStatus('通信に失敗しました。更新ボタンで再試行してください。', false);
        console.warn('adminList error', err);
      });
  }

  // ── 一覧描画 ──────────────────────────────────
  function renderList(items) {
    var list = $('list');
    // 報告が多い順（合計票数）に並べる
    items.sort(function (a, b) {
      var ta = (a.yes || 0) + (a.no || 0) + (a.unknown || 0);
      var tb = (b.yes || 0) + (b.no || 0) + (b.unknown || 0);
      return tb - ta;
    });

    if (!items.length) {
      list.innerHTML = '';
      $('status-bar').style.display = 'none';
      $('empty-state').style.display = '';
      return;
    }

    $('empty-state').style.display = 'none';
    setStatus('承認待ち ' + items.length + ' 件', false);
    list.innerHTML = items.map(renderCard).join('');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function renderCard(p) {
    var name = p.name || '';
    var total = (p.yes || 0) + (p.no || 0) + (p.unknown || 0);
    var nameEsc = esc(name);
    var nameAttr = esc(name).replace(/'/g, '&#39;');

    var votes =
      '<div class="pc-votes">' +
        '<span class="vote-chip vote-yes"><span class="msi">check_circle</span>できる <span class="vc-num">' + (p.yes || 0) + '</span></span>' +
        '<span class="vote-chip vote-no"><span class="msi">cancel</span>できない <span class="vc-num">' + (p.no || 0) + '</span></span>' +
        '<span class="vote-chip vote-unknown"><span class="msi">help</span>不明 <span class="vc-num">' + (p.unknown || 0) + '</span></span>' +
      '</div>';

    var notes = '';
    if (p.notes && p.notes.length) {
      notes = '<div class="pc-notes">' + p.notes.map(function (n) {
        return '<div class="pc-note"><span class="msi">sticky_note_2</span><span>' + esc(n) + '</span></div>';
      }).join('') + '</div>';
    }

    var photos = '';
    if (p.photos && p.photos.length) {
      photos = '<div class="pc-photos">' + p.photos.map(function (u) {
        var ue = esc(u);
        return '<img class="pc-photo" src="' + ue + '" alt="' + nameEsc + 'の写真" loading="lazy" data-full="' + ue + '">';
      }).join('') + '</div>';
    }

    return '' +
      '<div class="park-card" data-name="' + nameEsc + '">' +
        '<div class="pc-head">' +
          '<div class="pc-name">' + nameEsc + '</div>' +
          '<span class="pc-badge"><span class="msi">hourglass_top</span>承認待ち</span>' +
        '</div>' +
        votes +
        notes +
        photos +
        '<div class="pc-actions">' +
          '<button class="pc-btn btn-approve" type="button" onclick="window.__adminApprove(\'' + nameAttr + '\',this)">' +
            '<span class="msi">check</span>承認して公開</button>' +
          '<button class="pc-btn btn-reject" type="button" onclick="window.__adminReject(\'' + nameAttr + '\',this)">' +
            '<span class="msi">block</span>却下</button>' +
        '</div>' +
      '</div>';
  }

  // ── 承認/却下（POST: fire-and-forget） ─────────
  // text/plain でプリフライトを回避。CORS でレスポンスは読めないため、
  // 1.2 秒後に一覧を再取得して反映を確認する。
  function postAction(payload) {
    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).catch(function () { /* fire-and-forget */ });
  }

  function lockCard(btn, label) {
    var card = btn.closest('.park-card');
    if (!card) return;
    card.querySelectorAll('.pc-btn').forEach(function (b) { b.disabled = true; });
    btn.innerHTML = '<span class="msi spin">progress_activity</span>' + label;
  }

  window.__adminApprove = function (name, btn) {
    if (!token) { showGate(); return; }
    lockCard(btn, '公開中…');
    postAction({ action: 'approve', name: name, token: token });
    setStatus('「' + name + '」を承認しました。反映を確認しています…', true);
    setTimeout(loadList, 1200);
  };

  window.__adminReject = function (name, btn) {
    if (!token) { showGate(); return; }
    if (!confirm('「' + name + '」の未承認の報告をすべて却下します。よろしいですか？')) return;
    lockCard(btn, '却下中…');
    postAction({ action: 'rejectPark', name: name, token: token });
    setStatus('「' + name + '」を却下しました。反映を確認しています…', true);
    setTimeout(loadList, 1200);
  };

  // ── 画像ライトボックス ────────────────────────
  function bindLightbox() {
    var lb = $('lightbox');
    var lbImg = lb.querySelector('img');
    document.addEventListener('click', function (e) {
      var img = e.target.closest('.pc-photo');
      if (img) { lbImg.src = img.getAttribute('data-full') || img.src; lb.classList.add('open'); }
    });
    lb.addEventListener('click', function () { lb.classList.remove('open'); lbImg.src = ''; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) { lb.classList.remove('open'); lbImg.src = ''; }
    });
  }

  // ── 起動 ──────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
