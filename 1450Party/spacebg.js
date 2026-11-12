/* 1450 Party — kosmik canlı fon (menyu + oyun) */
(() => {
  'use strict';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // Dünya vahid kvadratdır (0..1), hər ölçüdə eyni görünür
  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random(), y: Math.random(), z: rnd(0.2, 1), p: rnd(0, TAU), s: rnd(0.6, 1.8)
  }));
  const clouds = [
    { x: .18, y: .25, r: .42, c: '139,92,246', a: .22, v: .004 },
    { x: .82, y: .70, r: .46, c: '255,79,216', a: .16, v: -.003 },
    { x: .55, y: .12, r: .30, c: '45,212,255', a: .16, v: .005 },
    { x: .30, y: .85, r: .34, c: '59,130,246', a: .16, v: -.004 }
  ];
  const buddies = [
    { x: .12, y: .70, r: .034, body: '#ef4444', eyes: true,  sp: .010, ph: 0 },
    { x: .90, y: .22, r: .028, body: '#fb923c', eyes: false, sp: .013, ph: 2 }
  ];
  let shooters = [], nextShoot = 2;

  function planet(c, x, y, r, t) {
    const g = c.createRadialGradient(x - r * .4, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, '#f4f1ff'); g.addColorStop(.55, '#a9a6d6'); g.addColorStop(1, '#2b2a5a');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(40,40,90,.28)';
    [[-.3, .25, .18], [.25, -.2, .12], [.1, .45, .09]].forEach(([dx, dy, k]) => {
      c.beginPath(); c.arc(x + dx * r, y + dy * r, k * r, 0, TAU); c.fill();
    });
    // halqa
    c.save(); c.translate(x, y); c.rotate(-.35); c.scale(1, .28);
    c.strokeStyle = 'rgba(190,170,255,.65)'; c.lineWidth = r * .16;
    c.beginPath(); c.arc(0, 0, r * 1.7, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(45,212,255,.35)'; c.lineWidth = r * .06;
    c.beginPath(); c.arc(0, 0, r * 1.95, 0, TAU); c.stroke();
    c.restore();
    // ringin ön tərəfi planetin üstündən keçsin
    c.save(); c.translate(x, y); c.rotate(-.35); c.scale(1, .28);
    c.beginPath(); c.rect(-r * 2.2, 0, r * 4.4, r * 3);
    c.clip(); c.strokeStyle = 'rgba(190,170,255,.65)'; c.lineWidth = r * .16;
    c.beginPath(); c.arc(0, 0, r * 1.7, 0, TAU); c.stroke(); c.restore();
  }

  function buddy(c, b, W, H, t) {
    const m = Math.min(W, H);
    const x = ((b.x + t * b.sp * .5) % 1.2 - .1) * W;
    const y = (b.y + Math.sin(t * .6 + b.ph) * .03) * H;
    const r = b.r * m * 1.6;
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * .5 + b.ph) * .3);
    c.fillStyle = b.body;
    c.beginPath(); c.ellipse(0, r * 1.6, r * .9, r * 1.2, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.beginPath(); c.arc(0, 0, r * 1.25, 0, TAU); c.fill();
    c.fillStyle = b.body;
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
    if (b.eyes) {
      c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = r * .6;
      c.beginPath(); c.ellipse(-r * .38, -r * .1, r * .28, r * .13, .35, 0, TAU);
      c.ellipse(r * .38, -r * .1, r * .28, r * .13, -.35, 0, TAU); c.fill();
    } else {
      c.fillStyle = 'rgba(255,255,255,.85)';
      c.beginPath(); c.arc(-r * .3, -r * .15, r * .16, 0, TAU); c.arc(r * .3, -r * .15, r * .16, 0, TAU); c.fill();
    }
    c.restore();
  }

  function draw(c, W, H, t, dt) {
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#050816'); bg.addColorStop(.55, '#0b1030'); bg.addColorStop(1, '#1a0f3a');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const m = Math.min(W, H), big = Math.max(W, H);

    for (const n of clouds) {
      const cx = (n.x + Math.sin(t * n.v * 8) * .05) * W, cy = (n.y + Math.cos(t * n.v * 6) * .04) * H, r = n.r * big;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${n.c},${n.a})`); g.addColorStop(1, `rgba(${n.c},0)`);
      c.fillStyle = g; c.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    for (const s of stars) {
      const x = ((s.x - t * .004 * s.z) % 1 + 1) % 1 * W, y = s.y * H;
      const a = (.35 + .65 * (.5 + .5 * Math.sin(t * 1.6 * s.z + s.p))) * s.z;
      c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      c.beginPath(); c.arc(x, y, s.s * s.z * (big > 900 ? 1.1 : .8), 0, TAU); c.fill();
    }

    // böyük halqalı planet
    planet(c, (.80 + Math.sin(t * .05) * .01) * W, (.74 + Math.cos(t * .07) * .01) * H, m * .12, t);
    // kiçik rəngli planet
    const px = .14 * W, py = .22 * H, pr = m * .05;
    const pg = c.createRadialGradient(px - pr * .4, py - pr * .4, pr * .1, px, py, pr);
    pg.addColorStop(0, '#ffd89a'); pg.addColorStop(.6, '#f4743b'); pg.addColorStop(1, '#5a1f4a');
    c.fillStyle = pg; c.beginPath(); c.arc(px, py + Math.sin(t * .4) * 6, pr, 0, TAU); c.fill();

    buddies.forEach(b => buddy(c, b, W, H, t));

    // ulduz yağışı
    nextShoot -= dt;
    if (nextShoot <= 0 && !reduce) {
      shooters.push({ x: rnd(.2, 1), y: rnd(0, .4), l: 0, life: 1 });
      nextShoot = rnd(2.5, 6);
    }
    shooters = shooters.filter(s => s.l < 1);
    for (const s of shooters) {
      s.l += dt * 1.1;
      const x = (s.x - s.l * .35) * W, y = (s.y + s.l * .25) * H, len = m * .18;
      const g = c.createLinearGradient(x, y, x + len, y - len * .7);
      g.addColorStop(0, `rgba(255,255,255,${1 - s.l})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.strokeStyle = g; c.lineWidth = 2; c.beginPath();
      c.moveTo(x, y); c.lineTo(x + len, y - len * .7); c.stroke();
    }

    // yüngül vinyetka
    const v = c.createRadialGradient(W / 2, H / 2, m * .3, W / 2, H / 2, big * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }

  // ── Menyu fonu (səhifə canvas-ı) ──
  let cv, cx2, W = 0, H = 0, last = 0, t = 0;
  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cv.width = Math.ceil(innerWidth * d * .75); H = cv.height = Math.ceil(innerHeight * d * .75);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const gs = document.getElementById('gameScreen');
    if (document.hidden || (gs && gs.classList.contains('active'))) { last = now; return; }
    const dt = Math.min((now - (last || now)) / 1000, .05); last = now; t += dt;
    draw(cx2, W, H, t, dt);
  }
  window.addEventListener('DOMContentLoaded', () => {
    cv = document.getElementById('spaceBg'); if (!cv) return;
    cx2 = cv.getContext('2d'); resize(); addEventListener('resize', resize);
    draw(cx2, W, H, 0, 0);
    if (!reduce) requestAnimationFrame(frame);
  });

  // ── Oyun içi: canvas-ı kosmik fonla doldur ──
  let gl = 0, gt = 0;
  window.SpaceBG = {
    paint(ctx, w, h) {
      const now = performance.now();
      const dt = Math.min((now - (gl || now)) / 1000, .05); gl = now; gt += dt;
      draw(ctx, w, h, gt, dt);
    }
  };
})();
