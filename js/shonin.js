/**
 * 公園・チームマップ 承認ページ（事務局用） — shonin.js
 *
 * 目的:
 *  - Teams から開く事務局用の承認ページ。プロファイル非依存・Safe Links 回避・
 *    スキャナーの自動発火回避のため、承認/却下は「このページからの明示的な操作」で行う。
 *  - 一覧取得は GET(action=adminList / adminTeamList)。承認/却下は POST(text/plain) の
 *    fire-and-forget。CORS でレスポンスは読めない前提のため、成否は一覧の再取得で判断する。
 *  - タブで「公園」「チーム」を切替。合言葉(token)は両方共通（GAS側に同じ値を設定）。
 *
 * 合言葉(token):
 *  - localStorage 'spba_admin_token' に保存。URL ハッシュ #t=... があればそれを採用。
 */
(function () {
  'use strict';

  var TOKEN_KEY = 'spba_admin_token';
  var token = '';
  var currentTab = 'park'; // 'park' | 'team'

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // ── 合言葉の取得 ──────────────────────────────
  function readTokenFromHash() {
    var h = location.hash || '';
    var m = h.match(/[#&]t=([^&]+)/);
    if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }
    return '';
  }

  function init() {
    var hashToken = readTokenFromHash();
    if (hashToken) {
      token = hashToken;
      try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    } else {
      try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { token = ''; }
    }

    bindGate();
    bindTabs();
    $('refresh-btn').addEventListener('click', loadList);
    bindLightbox();

    if (token) { showTabs(); loadList(); } else { showGate(); }
  }

  // ── タブ ──────────────────────────────────────
  function showTabs() { var tb = $('tabbar'); if (tb) tb.style.display = 'flex'; }
  function hideTabs() { var tb = $('tabbar'); if (tb) tb.style.display = 'none'; }
  function bindTabs() {
    var tabs = document.querySelectorAll('#tabbar .tab');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.dataset.tab;
        if (tab === currentTab) return;
        currentTab = tab;
        tabs.forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
        $('list').innerHTML = '';
        loadList();
      });
    });
  }

  // ── 合言葉ゲート ──────────────────────────────
  function showGate(errMsg) {
    $('gate').style.display = '';
    $('status-bar').style.display = 'none';
    $('list').innerHTML = '';
    $('empty-state').style.display = 'none';
    $('refresh-btn').style.display = 'none';
    hideTabs();
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
      showTabs();
      loadList();
    };
    $('gate-btn').addEventListener('click', submit);
    $('gate-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  }

  // ── ステータス ────────────────────────────────
  function setStatus(text, loading) {
    var bar = $('status-bar');
    bar.style.display = '';
    bar.className = loading ? 'is-loading' : '';
    var icon = loading ? '<span class="msi spin">progress_activity</span>'
                       : '<span class="msi">inventory_2</span>';
    bar.innerHTML = icon + '<span>' + text + '</span>';
  }

  function onTokenError() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    token = '';
    showGate('合言葉が違います。もう一度入力してください。');
  }

  // ── 一覧取得（タブで振り分け） ─────────────────
  function loadList() {
    if (!token) { showGate(); return; }
    $('gate').style.display = 'none';
    showTabs();
    $('refresh-btn').style.display = '';
    $('empty-state').style.display = 'none';
    setStatus('読み込み中…', true);
    if (currentTab === 'team') loadTeamList(); else loadParkList();
  }

  // ════════════════════════════════════════════
  // 公園（従来）
  // ════════════════════════════════════════════
  function loadParkList() {
    fetch(GAS_URL + '?action=adminList&token=' + encodeURIComponent(token))
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || res.ok === false) {
          if (res && res.error === 'token') onTokenError();
          else setStatus('取得に失敗しました（' + ((res && res.error) || '不明') + '）', false);
          return;
        }
        renderParkList(res.items || []);
      })
      .catch(function (err) {
        setStatus('通信に失敗しました。更新ボタンで再試行してください。', false);
        console.warn('adminList error', err);
      });
  }

  function renderParkList(items) {
    var list = $('list');
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
    setStatus('公園 承認待ち ' + items.length + ' 件', false);
    list.innerHTML = items.map(renderParkCard).join('');
  }

  function renderParkCard(p) {
    var name = p.name || '';
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
        votes + notes + photos +
        '<div class="pc-actions">' +
          '<button class="pc-btn btn-approve" type="button" onclick="window.__adminApprove(\'' + nameAttr + '\',this)">' +
            '<span class="msi">check</span>承認して公開</button>' +
          '<button class="pc-btn btn-reject" type="button" onclick="window.__adminReject(\'' + nameAttr + '\',this)">' +
            '<span class="msi">block</span>却下</button>' +
        '</div>' +
      '</div>';
  }

  window.__adminApprove = function (name, btn) {
    if (!token) { showGate(); return; }
    lockCard(btn, '公開中…');
    postAction(GAS_URL, { action: 'approve', name: name, token: token });
    setStatus('「' + name + '」を承認しました。反映を確認しています…', true);
    setTimeout(loadList, 1200);
  };

  window.__adminReject = function (name, btn) {
    if (!token) { showGate(); return; }
    if (!confirm('「' + name + '」の未承認の報告をすべて却下します。よろしいですか？')) return;
    lockCard(btn, '却下中…');
    postAction(GAS_URL, { action: 'rejectPark', name: name, token: token });
    setStatus('「' + name + '」を却下しました。反映を確認しています…', true);
    setTimeout(loadList, 1200);
  };

  // ════════════════════════════════════════════
  // チーム
  // ════════════════════════════════════════════
  var CAT_JP = { elem: '小学生', jhs: '中学生', hs: '高校生', univ: '大学生', club: '企業・クラブ', independent: '独立' };
  var GEN_JP = { male: '男子', female: '女子', mixed: '混合' };

  function teamUrl() { return window.TEAM_GAS_URL || ''; }

  function loadTeamList() {
    var base = teamUrl();
    if (!base) {
      $('list').innerHTML = '';
      $('status-bar').style.display = 'none';
      $('empty-state').style.display = '';
      $('empty-state').querySelector('.es-title').textContent = 'チーム承認APIが未設定です';
      $('empty-state').querySelector('.es-sub').textContent = 'shonin.html の TEAM_GAS_URL に、デプロイした TeamCode.gs の /exec URL を設定してください。';
      return;
    }
    var sep = base.indexOf('?') >= 0 ? '&' : '?';
    fetch(base + sep + 'action=adminTeamList&token=' + encodeURIComponent(token))
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || res.ok === false) {
          if (res && res.error === 'token') onTokenError();
          else setStatus('取得に失敗しました（' + ((res && res.error) || '不明') + '）', false);
          return;
        }
        renderTeamList(res.items || []);
      })
      .catch(function (err) {
        setStatus('通信に失敗しました。更新ボタンで再試行してください。', false);
        console.warn('adminTeamList error', err);
      });
  }

  function renderTeamList(items) {
    var list = $('list');
    if (!items.length) {
      list.innerHTML = '';
      $('status-bar').style.display = 'none';
      var es = $('empty-state');
      es.style.display = '';
      es.querySelector('.es-title').textContent = '承認待ちのチーム情報はありません';
      es.querySelector('.es-sub').textContent = '新しい情報提供が届くとここに表示されます。';
      return;
    }
    $('empty-state').style.display = 'none';
    setStatus('チーム 承認待ち ' + items.length + ' 件', false);
    list.innerHTML = items.map(renderTeamCard).join('');
  }

  function teamRow(label, val) {
    if (val == null || val === '') return '';
    return '<div class="tc-row"><span class="tc-k">' + esc(label) + '</span><span class="tc-v">' + esc(val) + '</span></div>';
  }
  function teamLink(label, url, color) {
    if (!url) return '';
    return '<a class="tc-sns" href="' + esc(url) + '" target="_blank" rel="noopener" style="color:' + (color || '#1a6ab0') + '">' + esc(label) + '</a>';
  }

  function renderTeamCard(p) {
    var ts = esc(p.ts);
    var isNew = (p.type === 'new');
    var typeLabel = isNew ? '新規チーム' : (p.type === 'edit' ? '情報修正' : '種別不明');
    var typeCls = isNew ? 'tc-type-new' : (p.type === 'edit' ? 'tc-type-edit' : 'tc-type-unknown');
    var hasCoord = (p.lat !== '' && p.lat != null && p.lng !== '' && p.lng != null);
    var needCoord = isNew && !hasCoord;

    var ninzu = (p.male || p.female) ? ((p.male || 0) + '男 / ' + (p.female || 0) + '女') : '';
    var fields = '' +
      teamRow('カテゴリ', CAT_JP[p.cat] || p.cat || '') +
      teamRow('性別', GEN_JP[p.gender] || p.gender || '') +
      teamRow('人数', ninzu) +
      teamRow('ボール', p.ball) +
      teamRow('所属', p.league) +
      teamRow('活動場所', p.place) +
      teamRow('活動日', p.days) +
      teamRow('連絡先', p.contact) +
      teamRow('補足', p.note);

    var sns = [
      teamLink('HP', p.hp, '#1a6ab0'),
      teamLink('X', p.x_url, '#000'),
      teamLink('Instagram', p.ig, '#e1306c'),
      teamLink('その他', p.other_url, '#555')
    ].filter(Boolean).join('');
    var snsRow = sns ? '<div class="tc-sns-row">' + sns + '</div>' : '';

    var coordBlock = '';
    if (isNew) {
      coordBlock =
        '<div class="tc-coord">' +
          '<span class="tc-k">座標</span>' +
          '<input class="tc-lat" type="text" inputmode="decimal" placeholder="緯度" value="' + (hasCoord ? esc(p.lat) : '') + '">' +
          '<input class="tc-lng" type="text" inputmode="decimal" placeholder="経度" value="' + (hasCoord ? esc(p.lng) : '') + '">' +
        '</div>' +
        (needCoord ? '<div class="tc-warn"><span class="msi">warning</span>地図に置くため緯度・経度が必要です（Googleマップで地点を右クリック→数値をコピー）</div>' : '');
    }

    var submitterBlock = '';
    if (p.submitter) {
      var sub = esc(p.submitter);
      var mail = (String(p.submitter).match(/[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/) || [])[0];
      if (mail) sub = sub.replace(esc(mail), '<a href="mailto:' + esc(mail) + '">' + esc(mail) + '</a>');
      submitterBlock = '<div class="tc-submitter"><span class="msi">lock_person</span><span><b>提供者（非公開）</b>：' + sub + '</span></div>';
    }

    return '' +
      '<div class="park-card" data-ts="' + ts + '" data-needcoord="' + (needCoord ? '1' : '0') + '">' +
        '<div class="pc-head">' +
          (p.logo ? '<img class="tc-logo" src="' + esc(p.logo) + '" alt="logo" loading="lazy">' : '') +
          '<div class="pc-name">' + esc(p.name) + ' <span class="tc-city">' + esc(p.city || '') + '</span></div>' +
          '<span class="pc-badge ' + typeCls + '">' + esc(typeLabel) + '</span>' +
        '</div>' +
        (fields ? '<div class="tc-fields">' + fields + '</div>' : '') +
        snsRow +
        coordBlock +
        submitterBlock +
        '<div class="pc-actions">' +
          '<button class="pc-btn btn-approve" type="button" onclick="window.__teamApprove(\'' + ts + '\',this)">' +
            '<span class="msi">check</span>承認して反映</button>' +
          '<button class="pc-btn btn-reject" type="button" onclick="window.__teamReject(\'' + ts + '\',this)">' +
            '<span class="msi">block</span>却下</button>' +
        '</div>' +
      '</div>';
  }

  window.__teamApprove = function (ts, btn) {
    if (!token) { showGate(); return; }
    var card = btn.closest('.park-card');
    var lat = '', lng = '';
    if (card) {
      var li = card.querySelector('.tc-lat'), ni = card.querySelector('.tc-lng');
      if (li) lat = (li.value || '').trim();
      if (ni) lng = (ni.value || '').trim();
      if (card.dataset.needcoord === '1' && (!lat || !lng)) {
        alert('新規チームは緯度・経度が必要です。Googleマップで位置を確認して入力してください。');
        return;
      }
    }
    lockCard(btn, '反映中…');
    postAction(teamUrl(), { action: 'approveTeam', ts: ts, token: token, lat: lat, lng: lng });
    setStatus('承認しました。反映を確認しています…', true);
    setTimeout(loadList, 1200);
  };

  window.__teamReject = function (ts, btn) {
    if (!token) { showGate(); return; }
    if (!confirm('この情報提供を却下します。よろしいですか？')) return;
    lockCard(btn, '却下中…');
    postAction(teamUrl(), { action: 'rejectTeam', ts: ts, token: token });
    setStatus('却下しました。反映を確認しています…', true);
    setTimeout(loadList, 1200);
  };

  // ── 承認/却下（POST: fire-and-forget） ─────────
  function postAction(url, payload) {
    if (!url) return;
    fetch(url, {
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
