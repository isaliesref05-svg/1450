/* 1450 Party — telefon üçün yeni toxunma idarəetməsi (VS döyüş)
 *
 * Hər oyunçu üçün 4 düymə:  ◀  ▶  (hərəkət)   ⤒ TULLAN   ✦ HÜCUM
 *  - Hücum düyməsini basılı saxla: avtomatik təkrar vurur və ən yaxın düşmənə nişan alır.
 *  - Platformaya yaxınlaşanda oyunçu özü sıçrayır (divara söykənəndə avto-tullanma).
 *  - Aşağı düşmək üçün TULLAN düyməsini aşağı sürüşdür.
 *  - 1 yerli oyunçu (onlayn): düymələr iki tərəfə yayılır (sol: hərəkət, sağ: tullan/hücum).
 *  - 2-4 yerli oyunçu: hər kəsin düymələri bir baş barmaqla çatan kiçik blokdadır.
 */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    left:  '<path d="M15 5l-7 7 7 7" />',
    right: '<path d="M9 5l7 7-7 7" />',
    jump:  '<path d="M12 19V6M6 11l6-6 6 6" />',
    atk:   '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4" />'
  };
  const HOLD_MS = 120;           // qısa toxunuşun da oyun tərəfindən görünməsi üçün minimum saxlama
  const state = [];              // hər oyunçu üçün düymə vəziyyəti
  let root = null;

  function icon(name) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICONS[name];
    return svg;
  }

  function apply(st) {
    const inp = inputPlayers[st.index];
    if (!inp) return;
    const now = performance.now();
    const x = (st.right ? 1 : 0) - (st.left ? 1 : 0);
    inp.auto = true;
    inp.x = x;
    inp.y = now < st.dropUntil ? 1 : 0;
    inp.jump = st.jump || now < st.jumpUntil;
    inp.action = st.atk || now < st.atkUntil;
    inp.releaseAction = false;
    inp.releaseX = inp.releaseY = 0;
    st.btn.left.classList.toggle('on', st.left);
    st.btn.right.classList.toggle('on', st.right);
    st.btn.jump.classList.toggle('on', st.jump);
    st.btn.atk.classList.toggle('on', st.atk);
  }

  function makeButton(st, kind, label) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mpad-btn mpad-' + kind;
    b.setAttribute('aria-label', label);
    b.append(icon(kind));
    if (kind === 'jump' || kind === 'atk') {
      const t = document.createElement('span');
      t.textContent = kind === 'jump' ? 'TULLAN' : 'HÜCUM';
      b.append(t);
    }
    let pid = null, y0 = 0;
    const down = e => {
      if (pid !== null) return;
      e.preventDefault();
      pid = e.pointerId; y0 = e.clientY;
      try { b.setPointerCapture(pid); } catch (_) {}
      const now = performance.now();
      if (kind === 'left') st.left = true;
      else if (kind === 'right') st.right = true;
      else if (kind === 'jump') { st.jump = true; st.jumpUntil = now + HOLD_MS; setTimeout(() => apply(st), HOLD_MS + 8); }
      else { st.atk = true; st.atkUntil = now + HOLD_MS; setTimeout(() => apply(st), HOLD_MS + 8); }
      if (navigator.vibrate) { try { navigator.vibrate(8); } catch (_) {} }
      apply(st);
    };
    const move = e => {
      if (e.pointerId !== pid || kind !== 'jump') return;
      if (e.clientY - y0 > 26) { st.jump = false; st.jumpUntil = 0; st.dropUntil = performance.now() + 320; apply(st); setTimeout(() => apply(st), 340); }
    };
    const up = e => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (kind === 'left') st.left = false;
      else if (kind === 'right') st.right = false;
      else if (kind === 'jump') st.jump = false;
      else st.atk = false;
      apply(st);
    };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointermove', move);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', e => e.preventDefault());
    return b;
  }

  function build(pCount, online) {
    const host = document.getElementById('touchControls');
    if (!host) return;
    clear();
    root = host;
    host.classList.add('mpad-host');
    const split = online || pCount <= 1;
    host.classList.toggle('mpad-split', split);
    host.classList.toggle('mpad-many', pCount >= 3 && !split);
    const corners = ['bl', 'br', 'tl', 'tr'];
    for (let i = 0; i < pCount; i++) {
      const slot = online && !isHost ? guestIndex : i;
      const st = { index: i, left: false, right: false, jump: false, atk: false,
        jumpUntil: 0, atkUntil: 0, dropUntil: 0, btn: {} };
      const wrap = document.createElement('div');
      wrap.className = 'mpad ' + (split ? 'mpad-solo' : 'mpad-' + corners[i]);
      wrap.style.setProperty('--pc', PLAYER_COLORS[slot] || '#5ff');
      wrap.dataset.player = slot + 1;
      st.btn.left = makeButton(st, 'left', 'Sola');
      st.btn.right = makeButton(st, 'right', 'Sağa');
      st.btn.jump = makeButton(st, 'jump', 'Tullan');
      st.btn.atk = makeButton(st, 'atk', 'Hücum');
      const tag = document.createElement('span');
      tag.className = 'mpad-tag';
      tag.textContent = 'P' + (slot + 1);
      if (split) {
        const l = document.createElement('div'); l.className = 'mpad-side mpad-side-l'; l.append(st.btn.left, st.btn.right);
        const r = document.createElement('div'); r.className = 'mpad-side mpad-side-r'; r.append(st.btn.jump, st.btn.atk);
        wrap.append(l, r);
      } else {
        wrap.append(tag, st.btn.jump, st.btn.atk, st.btn.left, st.btn.right);
      }
      host.append(wrap);
      state.push(st);
    }
  }

  function release() {
    for (const st of state) {
      st.left = st.right = st.jump = st.atk = false;
      st.jumpUntil = st.atkUntil = st.dropUntil = 0;
      const inp = inputPlayers[st.index];
      if (inp) { inp.x = inp.y = 0; inp.jump = inp.action = false; }
      if (st.btn.left) for (const k of ['left', 'right', 'jump', 'atk']) st.btn[k].classList.remove('on');
    }
  }

  function clear() {
    state.length = 0;
    if (root) { root.classList.remove('mpad-host', 'mpad-split', 'mpad-many'); root.replaceChildren(); }
  }

  window.MobilePad = { build, clear, release };

  /* Seçilmiş xəritə kartını görünən yerə gətir */
  document.addEventListener('click', e => {
    const c = e.target.closest && e.target.closest('#mapGrid .game-card');
    if (c && c.scrollIntoView) c.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  });

  /* Oyun ekranında yanlışlıqla yaxınlaşdırma/seçim olmasın */
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => { if (e.target.closest && e.target.closest('#gameScreen')) e.preventDefault(); });
})();
