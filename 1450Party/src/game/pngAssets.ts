import { ARENA_H, ARENA_MAPS, ARENA_W, buildMapBackground, drawArenaPlatform, getPendulumBob, roundRectPath } from './maps';
import { MapId, MinigameId, WeaponChoice } from './types';

function line(ctx: CanvasRenderingContext2D, a: number, b: number, c: number, d: number) {
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}

function lg(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, cols: string[]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  cols.forEach((c, i) => g.addColorStop(i / Math.max(1, cols.length - 1), c));
  return g;
}

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][], fill: string | CanvasGradient) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawShuriken(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  rot: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const an = (k * Math.PI) / 4;
    const r = k % 2 ? R * 0.35 : R;
    if (k) ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r);
    else ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r);
  }
  ctx.closePath();
  ctx.fillStyle = lg(ctx, -R, -R, R, R, ['#f4f7fa', '#8f9ba8', '#47525e']);
  ctx.fill();
  ctx.strokeStyle = '#2b323b';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#0b0f1a';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.2, 0, 6.3);
  ctx.fill();
  ctx.restore();
}

export function drawWeaponSprite(ctx: CanvasRenderingContext2D, w: WeaponChoice, T = Date.now()) {
  if (w === 'fist') return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (w === 'sword') {
    ctx.strokeStyle = '#4a2c12';
    ctx.lineWidth = 5;
    line(ctx, -6, 0, 6, 0);
    ctx.fillStyle = lg(ctx, 0, -4, 0, 4, ['#ffffff', '#b8c4d2', '#6c7889']);
    ctx.beginPath();
    ctx.moveTo(9, -3.4);
    ctx.lineTo(44, -2.4);
    ctx.lineTo(54, 0);
    ctx.lineTo(44, 2.4);
    ctx.lineTo(9, 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,95,130,.7)';
    ctx.lineWidth = 1;
    line(ctx, 12, 0, 46, 0);
    ctx.shadowColor = '#9cf';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(200,230,255,.9)';
    line(ctx, 10, -3.2, 44, -2.3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = lg(ctx, 0, -10, 0, 10, ['#ffe38a', '#c8922a', '#8a5f16']);
    roundRectPath(ctx, 6, -10, 5, 20, 2);
    ctx.fill();
    ctx.fillStyle = '#e8b43c';
    ctx.beginPath();
    ctx.arc(-8, 0, 3.2, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(-8, 0, 1.3, 0, 6.3);
    ctx.fill();
  } else if (w === 'hammer') {
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 5.5;
    line(ctx, -6, 0, 36, 0);
    ctx.strokeStyle = '#3a2410';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) line(ctx, 2 + k * 5, -3, 5 + k * 5, 3);
    poly(ctx, [[38, -9], [44, -18], [50, -9]], '#aeb7c1');
    poly(ctx, [[38, 9], [44, 18], [50, 9]], '#aeb7c1');
    ctx.fillStyle = lg(ctx, 0, -13, 0, 13, ['#eef2f6', '#9aa5b1', '#4d5763']);
    roundRectPath(ctx, 28, -13, 22, 26, 3);
    ctx.fill();
    ctx.fillStyle = '#2f3944';
    ctx.fillRect(31, -13, 2.5, 26);
    ctx.fillRect(44.5, -13, 2.5, 26);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillRect(34, -11, 9, 2);
  } else if (w === 'axe') {
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 5;
    line(ctx, -8, 0, 42, 0);
    ctx.strokeStyle = '#2d1c0d';
    ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++) line(ctx, -4 + k * 4, -3, -2 + k * 4, 3);
    poly(ctx, [[30, 2], [25, 15], [41, 4]], '#7a8693');
    ctx.fillStyle = lg(ctx, 28, -26, 56, 0, ['#f4f7fa', '#8f9ba8', '#47525e']);
    ctx.beginPath();
    ctx.moveTo(30, -4);
    ctx.bezierCurveTo(28, -18, 38, -28, 54, -26);
    ctx.bezierCurveTo(60, -14, 55, -3, 44, 1);
    ctx.lineTo(30, 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = '#9ef';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(180,240,255,.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(54, -26);
    ctx.bezierCurveTo(60, -14, 55, -3, 44, 1);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#caa23a';
    ctx.fillRect(27, -4, 5, 8);
  } else if (w === 'gun') {
    poly(ctx, [[3, 2], [13, 2], [11, 16], [1, 16]], '#3a2a1e');
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) line(ctx, 3 + k * 0.8, 6 + k * 3, 11 - k * 0.4, 6 + k * 3);
    ctx.strokeStyle = '#1c2128';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(16, 4, 4, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = lg(ctx, 0, -7, 0, 3, ['#69747f', '#2b323b', '#171b21']);
    roundRectPath(ctx, 0, -7, 30, 10, 2.5);
    ctx.fill();
    ctx.fillStyle = '#0e1116';
    ctx.fillRect(30, -5, 5, 5);
    ctx.fillStyle = '#ff9a2e';
    ctx.fillRect(4, -5, 8, 2);
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(27, -9, 3, 2.2);
  } else if (w === 'shotgun') {
    poly(ctx, [[-16, -2], [-4, -3], [-1, 7], [-14, 10]], '#6b4423');
    ctx.fillStyle = lg(ctx, 0, -6, 0, 0, ['#9aa5b1', '#2b323b']);
    roundRectPath(ctx, 0, -6, 44, 5, 2);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, 0, 0, 5, ['#7d8995', '#1d232a']);
    roundRectPath(ctx, 0, 0, 44, 5, 2);
    ctx.fill();
    ctx.fillStyle = '#3b434d';
    roundRectPath(ctx, -2, -7, 14, 14, 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(2, -5, 6, 2);
    ctx.fillStyle = lg(ctx, 0, 2, 0, 9, ['#8a5a2e', '#4a2e14']);
    roundRectPath(ctx, 20, 3, 14, 6, 2);
    ctx.fill();
  } else if (w === 'smg') {
    ctx.fillStyle = lg(ctx, 0, 12, 0, 20, ['#6b7480', '#2b323b']);
    ctx.beginPath();
    ctx.arc(12, 12, 8, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -6, 0, 5, ['#69747f', '#2b323b', '#171b21']);
    roundRectPath(ctx, 0, -6, 26, 11, 3);
    ctx.fill();
    ctx.fillStyle = '#20262d';
    roundRectPath(ctx, 26, -4, 11, 7, 2);
    ctx.fill();
    poly(ctx, [[17, 4], [23, 4], [22, 12], [16, 12]], '#3a2a1e');
    ctx.fillStyle = '#ff3b3b';
    ctx.fillRect(9, -9, 5, 3);
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(1, -4, 6, 2);
    ctx.fillStyle = '#20262d';
    ctx.fillRect(-10, -3, 10, 5);
  } else if (w === 'sniper') {
    poly(ctx, [[-14, -4], [2, -4], [4, 6], [-10, 8], [-14, 2]], '#6b4423');
    ctx.fillStyle = lg(ctx, 0, -4, 0, 4, ['#566170', '#1b2027']);
    roundRectPath(ctx, 2, -4, 38, 8, 2);
    ctx.fill();
    ctx.fillStyle = '#14181d';
    ctx.fillRect(40, -2.2, 20, 4.4);
    ctx.fillStyle = '#2d343d';
    ctx.fillRect(58, -3.2, 5, 6.4);
    ctx.fillStyle = '#2b323b';
    ctx.fillRect(12, -6, 3, 3);
    ctx.fillRect(25, -6, 3, 3);
    ctx.fillStyle = lg(ctx, 0, -14, 0, -6, ['#6a7584', '#1f252d']);
    roundRectPath(ctx, 8, -13, 24, 7, 3.5);
    ctx.fill();
    ctx.shadowColor = '#6df';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#8ff';
    ctx.fillRect(31, -12, 2.5, 5);
    ctx.fillRect(7, -12, 2.5, 5);
    ctx.shadowBlur = 0;
  } else if (w === 'rocket') {
    poly(ctx, [[-16, -9], [-8, -7], [-8, 7], [-16, 9]], '#2c3329');
    ctx.fillStyle = lg(ctx, 0, -9, 0, 9, ['#8a9a7a', '#4a5640', '#2b3326']);
    roundRectPath(ctx, -10, -8, 46, 16, 5);
    ctx.fill();
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(6, -8, 4, 16);
    ctx.fillStyle = '#1a1f17';
    ctx.fillRect(10, -8, 2, 16);
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(16, -8, 4, 16);
    ctx.fillStyle = '#1a1f17';
    roundRectPath(ctx, 34, -9, 5, 18, 2);
    ctx.fill();
    poly(ctx, [[38, -6], [53, 0], [38, 6]], '#d83a2a');
    poly(ctx, [[38, -6], [47, -3], [38, 0]], '#ff8a6a');
  } else if (w === 'flame') {
    ctx.fillStyle = lg(ctx, -20, 0, -2, 0, ['#e74c3c', '#8c1d18']);
    roundRectPath(ctx, -20, -2, 18, 15, 6);
    ctx.fill();
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(-14, -2, 3, 15);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.quadraticCurveTo(0, 15, 8, 4);
    ctx.stroke();
    ctx.fillStyle = lg(ctx, 0, -5, 0, 4, ['#7d8995', '#2b323b']);
    roundRectPath(ctx, 2, -5, 24, 9, 3);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 26, -8, 36, 4, ['#ffb347', '#c4541a']);
    ctx.beginPath();
    ctx.moveTo(26, -5);
    ctx.lineTo(36, -8);
    ctx.lineTo(36, 4);
    ctx.lineTo(26, 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = '#ff9a2e';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffd54a';
    ctx.beginPath();
    ctx.ellipse(39, -2, 4, 2.5, 0, 0, 6.3);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (w === 'bow') {
    ctx.strokeStyle = lg(ctx, 0, -20, 0, 20, ['#c58a4a', '#7a4a1f', '#c58a4a']);
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(6, 0, 20, -1.25, 1.25);
    ctx.stroke();
    const tx = 6 + 20 * Math.cos(1.25);
    const ty = 20 * Math.sin(1.25);
    ctx.fillStyle = '#e8b43c';
    ctx.beginPath();
    ctx.arc(tx, -ty, 2.6, 0, 6.3);
    ctx.arc(tx, ty, 2.6, 0, 6.3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx, -ty);
    ctx.lineTo(-3, 0);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.strokeStyle = '#d9b27a';
    ctx.lineWidth = 2;
    line(ctx, -3, 0, 30, 0);
    poly(ctx, [[30, -3.5], [39, 0], [30, 3.5]], '#e6edf3');
  } else if (w === 'spear') {
    ctx.strokeStyle = lg(ctx, 0, -3, 0, 3, ['#c99a60', '#6b4423']);
    ctx.lineWidth = 4;
    line(ctx, -10, 0, 66, 0);
    ctx.fillStyle = '#d83a2a';
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(70, -6);
    ctx.lineTo(67, 0);
    ctx.lineTo(70, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c9a43a';
    ctx.fillRect(63, -3.5, 5, 7);
    ctx.fillStyle = lg(ctx, 0, -8, 0, 8, ['#ffffff', '#b8c4d2', '#6c7889']);
    ctx.beginPath();
    ctx.moveTo(68, 0);
    ctx.quadraticCurveTo(74, -9, 94, 0);
    ctx.quadraticCurveTo(74, 9, 68, 0);
    ctx.fill();
  } else if (w === 'mine') {
    ctx.fillStyle = lg(ctx, 0, -3, 0, 10, ['#59626d', '#22272e']);
    ctx.beginPath();
    ctx.ellipse(8, 3, 11, 6, 0, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = '#39414b';
    ctx.beginPath();
    ctx.ellipse(8, 1, 7, 5, 0, Math.PI, 6.283);
    ctx.fill();
    ctx.strokeStyle = '#9aa4ae';
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) line(ctx, 8 + (k - 2) * 4, -2, 8 + (k - 2) * 5, -6);
    ctx.shadowColor = '#f33';
    ctx.shadowBlur = 8;
    ctx.fillStyle = T % 600 < 300 ? '#ff3b3b' : '#7a1515';
    ctx.beginPath();
    ctx.arc(8, -1, 2.2, 0, 6.3);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (w === 'laser') {
    poly(ctx, [[3, 5], [12, 5], [10, 16], [2, 16]], '#2b3440');
    ctx.fillStyle = 'rgba(80,255,255,.85)';
    ctx.fillRect(3.5, 8, 2, 5);
    poly(ctx, [[4, -7], [10, -13], [17, -7]], '#aab6c2');
    ctx.fillStyle = lg(ctx, 0, -7, 0, 5, ['#ffffff', '#c9d3dd', '#7d8995']);
    roundRectPath(ctx, 0, -7, 28, 12, 5);
    ctx.fill();
    ctx.shadowColor = '#4ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#4ff';
    roundRectPath(ctx, 6, -3, 16, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = '#2b3440';
    roundRectPath(ctx, 28, -5, 6, 8, 2);
    ctx.fill();
    ctx.fillStyle = '#bff';
    ctx.beginPath();
    ctx.arc(35, -1, 2.4, 0, 6.3);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (w === 'shuriken') {
    drawShuriken(ctx, 5, 7, 10, 0.3);
    drawShuriken(ctx, 12, -2, 13, T * 0.004);
  } else if (w === 'staff') {
    ctx.strokeStyle = lg(ctx, 0, -3, 0, 3, ['#a06a36', '#4a2e14']);
    ctx.lineWidth = 5;
    line(ctx, -12, 0, 50, 0);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2;
    line(ctx, 8, -3.5, 8, 3.5);
    line(ctx, 30, -3.5, 30, 3.5);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.quadraticCurveTo(54, -12, 64, -10);
    ctx.moveTo(50, 0);
    ctx.quadraticCurveTo(54, 12, 64, 10);
    ctx.stroke();
    const pu = 1 + Math.sin(T * 0.008) * 0.15;
    ctx.shadowColor = '#c6f';
    ctx.shadowBlur = 14;
    const g = ctx.createRadialGradient(59, 0, 1, 60, 0, 9 * pu);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.5, '#d58bff');
    g.addColorStop(1, '#6a1fb0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(60, 0, 7.5 * pu, 0, 6.3);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (w === 'frost') {
    poly(ctx, [[3, 5], [11, 5], [9, 16], [1, 16]], '#2c5d8a');
    ctx.fillStyle = lg(ctx, 0, -7, 0, 6, ['#e8f9ff', '#8fd0f2', '#3a86c4']);
    roundRectPath(ctx, 0, -7, 24, 13, 5);
    ctx.fill();
    ctx.shadowColor = '#9df';
    ctx.shadowBlur = 10;
    poly(ctx, [[24, -6], [41, -2], [24, 0]], '#dff6ff');
    poly(ctx, [[24, 0], [43, 2], [24, 6]], '#b7e6ff');
    poly(ctx, [[20, -7], [29, -17], [30, -6]], '#e8fbff');
    ctx.shadowBlur = 0;
  } else if (w === 'tesla') {
    poly(ctx, [[3, 5], [11, 5], [9, 16], [1, 16]], '#2b323b');
    ctx.fillStyle = lg(ctx, 0, -6, 0, 6, ['#6b7480', '#2b323b', '#14181d']);
    roundRectPath(ctx, -2, -6, 18, 12, 3);
    ctx.fill();
    ctx.strokeStyle = '#d98a3a';
    ctx.lineWidth = 2.5;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(19 + k * 5, 0, 2.5, 7, 0, 0, 6.3);
      ctx.stroke();
    }
    ctx.strokeStyle = '#cfd6de';
    ctx.lineWidth = 2.5;
    line(ctx, 36, -4, 44, -9);
    line(ctx, 36, 4, 44, 9);
    ctx.shadowColor = '#8ff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#dff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(44, -9);
    ctx.lineTo(41, -4);
    ctx.lineTo(46, -1);
    ctx.lineTo(42, 3);
    ctx.lineTo(44, 9);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (w === 'rifle') {
    poly(ctx, [[-14, -4], [0, -5], [2, 5], [-10, 8], [-15, 2]], '#3a2a1e');
    ctx.fillStyle = lg(ctx, 0, -7, 0, 4, ['#6b7480', '#2b323b', '#14181d']);
    roundRectPath(ctx, 0, -7, 30, 11, 2);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -5, 0, 3, ['#9a7a44', '#4a3418']);
    roundRectPath(ctx, 28, -5, 16, 8, 2);
    ctx.fill();
    ctx.fillStyle = '#14181d';
    ctx.fillRect(44, -3, 12, 4);
    ctx.fillStyle = '#2b323b';
    ctx.fillRect(54, -4.5, 4, 7);
    ctx.fillStyle = lg(ctx, 0, 4, 0, 18, ['#59626d', '#22272e']);
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(30, 4);
    ctx.quadraticCurveTo(33, 12, 29, 18);
    ctx.lineTo(23, 18);
    ctx.quadraticCurveTo(26, 11, 24, 4);
    ctx.fill();
  } else if (w === 'minigun') {
    const sp = T * 0.03;
    ctx.fillStyle = '#4a5640';
    roundRectPath(ctx, 8, -17, 16, 9, 2);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -9, 0, 8, ['#7d8995', '#3b434d', '#1b2027']);
    roundRectPath(ctx, 6, -9, 24, 17, 4);
    ctx.fill();
    for (let k = 0; k < 6; k++) {
      const a = sp + k * 1.047;
      const yy = Math.sin(a) * 5;
      ctx.fillStyle = Math.cos(a) > 0 ? '#9aa5b1' : '#4d5763';
      ctx.fillRect(30, yy - 1.7, 28, 3.4);
    }
    ctx.fillStyle = '#2b323b';
    ctx.fillRect(34, -8, 3, 16);
    ctx.fillRect(52, -8, 3, 16);
  } else if (w === 'grenade') {
    ctx.fillStyle = lg(ctx, 0, -8, 0, 6, ['#8a9a7a', '#4a5640', '#2b3326']);
    roundRectPath(ctx, 0, -8, 36, 14, 4);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -6, 0, 5, ['#7d8995', '#2b323b']);
    roundRectPath(ctx, 34, -6, 22, 11, 3);
    ctx.fill();
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(40, -10, 4, 3);
  } else if (w === 'chainsaw') {
    ctx.fillStyle = lg(ctx, 0, -8, 0, 7, ['#ffb04a', '#e8731a', '#a8430a']);
    roundRectPath(ctx, -8, -8, 26, 15, 4);
    ctx.fill();
    ctx.fillStyle = '#8f9ba8';
    roundRectPath(ctx, 18, -4.5, 32, 9, 4.5);
    ctx.fill();
    ctx.fillStyle = '#2b323b';
    roundRectPath(ctx, 20, -3, 28, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#e8eef5';
    const off = (T * 0.05) % 5;
    for (let x = 18 + off; x < 47; x += 5) {
      ctx.fillRect(x, -6.4, 2.2, 2.2);
      ctx.fillRect(x, 4.2, 2.2, 2.2);
    }
  } else if (w === 'boomerang') {
    ctx.strokeStyle = lg(ctx, 0, -16, 16, 16, ['#ffd27a', '#d8862a', '#8a4a12']);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(4, -16);
    ctx.lineTo(14, 0);
    ctx.lineTo(4, 16);
    ctx.stroke();
    ctx.strokeStyle = '#d83a2a';
    ctx.lineWidth = 2;
    line(ctx, 6, -9, 12, -6);
    line(ctx, 6, 9, 12, 6);
  } else if (w === 'katana') {
    ctx.strokeStyle = '#14181d';
    ctx.lineWidth = 4.5;
    line(ctx, -9, 0, 4, 0);
    ctx.fillStyle = '#c9a43a';
    ctx.beginPath();
    ctx.arc(-10, 0, 2.6, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -6, 0, 6, ['#ffe38a', '#c8922a']);
    ctx.beginPath();
    ctx.ellipse(6, 0, 2.6, 6.5, 0, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -4, 0, 3, ['#ffffff', '#b8c4d2', '#6c7889']);
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.quadraticCurveTo(38, -3, 64, -8);
    ctx.quadraticCurveTo(40, 2.2, 8, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = '#9cf';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(210,235,255,.95)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9, -2);
    ctx.quadraticCurveTo(38, -3, 64, -8);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    // bomb
    const g = ctx.createRadialGradient(5, -3, 1, 8, 0, 11);
    g.addColorStop(0, '#6a727c');
    g.addColorStop(1, '#101216');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(8, 0, 9.5, 0, 6.3);
    ctx.fill();
    ctx.save();
    ctx.translate(8, 0);
    ctx.rotate(-0.8);
    ctx.fillStyle = '#9aa4ae';
    ctx.fillRect(-3, -12.5, 6, 4);
    ctx.restore();
    ctx.strokeStyle = '#d9b27a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(13, -7);
    ctx.quadraticCurveTo(18, -10, 17, -15);
    ctx.stroke();
    ctx.shadowColor = '#ffb02e';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(17, -16, 3.5, 0, 6.3);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const weaponPngCache = new Map<string, string>();
export function getWeaponPng(w: WeaponChoice): string {
  const cached = weaponPngCache.get(w);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';

  const c = document.createElement('canvas');
  c.width = 112;
  c.height = 112;
  const g = c.getContext('2d')!;

  if (w === 'random') {
    g.save();
    g.translate(56, 56);
    g.rotate(-0.12);
    g.fillStyle = '#f4f4f5';
    roundRectPath(g, -28, -28, 56, 56, 12);
    g.fill();
    g.strokeStyle = '#a1a1aa';
    g.lineWidth = 2;
    g.stroke();
    const dots: [number, number, string][] = [
      [-13, -13, '#18181b'],
      [13, -13, '#ef4444'],
      [0, 0, '#18181b'],
      [-13, 13, '#18181b'],
      [13, 13, '#18181b'],
    ];
    for (const [dx, dy, col] of dots) {
      g.fillStyle = col;
      g.beginPath();
      g.arc(dx, dy, 5, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    const url = c.toDataURL('image/png');
    weaponPngCache.set(w, url);
    return url;
  }

  if (w === 'fist') {
    g.save();
    g.translate(56, 56);
    g.fillStyle = '#e4e4e7';
    roundRectPath(g, -22, -20, 44, 34, 11);
    g.fill();
    g.strokeStyle = '#71717a';
    g.lineWidth = 2.5;
    line(g, -10, -10, -10, 2);
    line(g, 0, -12, 0, 4);
    line(g, 10, -10, 10, 2);
    g.fillStyle = '#18181b';
    roundRectPath(g, -16, 14, 32, 10, 4);
    g.fill();
    g.restore();
    const url = c.toDataURL('image/png');
    weaponPngCache.set(w, url);
    return url;
  }

  // Render sprite onto temp large canvas, crop tight bounds, then center in 112x112
  const tmp = document.createElement('canvas');
  tmp.width = 320;
  tmp.height = 220;
  const tg = tmp.getContext('2d')!;
  tg.setTransform(2, 0, 0, 2, 70, 110);
  tg.rotate(-0.22);
  drawWeaponSprite(tg, w, 120);

  const px = tg.getImageData(0, 0, tmp.width, tmp.height).data;
  let minX = tmp.width, minY = tmp.height, maxX = 0, maxY = 0;
  for (let y = 0; y < tmp.height; y++) {
    for (let x = 0; x < tmp.width; x++) {
      if (px[(y * tmp.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bw = Math.max(1, maxX - minX + 1);
  const bh = Math.max(1, maxY - minY + 1);
  const fit = Math.min(84 / bw, 84 / bh);
  const dw = bw * fit;
  const dh = bh * fit;
  g.drawImage(tmp, minX, minY, bw, bh, (112 - dw) / 2, (112 - dh) / 2, dw, dh);

  const url = c.toDataURL('image/png');
  weaponPngCache.set(w, url);
  return url;
}

const mapPngCache = new Map<string, string>();
export function getMapPng(mapId: MapId): string {
  const cached = mapPngCache.get(mapId);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';

  const w = 320;
  const h = 180;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;

  if (mapId === 'random') {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#18181b');
    gr.addColorStop(1, '#09090b');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.08)';
    for (let x = 0; x < w; x += 24) line(g, x, 0, x, h);
    for (let y = 0; y < h; y += 24) line(g, 0, y, w, y);
    g.save();
    g.translate(w / 2, h / 2);
    g.rotate(-0.14);
    g.fillStyle = '#f4f4f5';
    roundRectPath(g, -34, -34, 68, 68, 14);
    g.fill();
    g.fillStyle = '#09090b';
    for (const [dx, dy] of [[-15, -15], [15, -15], [0, 0], [-15, 15], [15, 15]]) {
      g.beginPath();
      g.arc(dx, dy, 6, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    const url = c.toDataURL('image/png');
    mapPngCache.set(mapId, url);
    return url;
  }

  const def = ARENA_MAPS[mapId];
  const bg = buildMapBackground(def.style);
  g.drawImage(bg, 0, 0, w, h);
  g.save();
  g.scale(w / ARENA_W, h / ARENA_H);
  def.pl.forEach((p) => drawArenaPlatform(g, p, def.style));
  if (def.moving) {
    def.moving.forEach((m) => drawArenaPlatform(g, [m.x, m.y, m.w, m.h], def.style));
  }
  if (def.pads) {
    def.pads.forEach(([px, py, pw]) => {
      g.fillStyle = '#4ade80';
      roundRectPath(g, px - pw / 2, py - 8, pw, 8, 4);
      g.fill();
    });
  }
  if (def.portals) {
    def.portals.forEach((pt) => {
      g.strokeStyle = pt.color;
      g.lineWidth = 6;
      g.beginPath();
      g.ellipse(pt.ax, pt.ay, 20, 34, 0, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.ellipse(pt.bx, pt.by, 20, 34, 0, 0, Math.PI * 2);
      g.stroke();
    });
  }
  if (def.pendulums) {
    def.pendulums.forEach((p) => {
      const [bx, by] = getPendulumBob(p, 20);
      g.strokeStyle = '#71717a';
      g.lineWidth = 5;
      line(g, p.px, p.py, bx, by);
      g.fillStyle = '#e4e4e7';
      g.beginPath();
      g.arc(bx, by, p.radius, 0, Math.PI * 2);
      g.fill();
    });
  }
  if (def.lasers) {
    def.lasers.forEach((ls) => {
      g.strokeStyle = '#ef4444';
      g.lineWidth = 8;
      line(g, ls.x1, ls.y1, ls.x2, ls.y2);
    });
  }
  if (def.lava) {
    const lg2 = g.createLinearGradient(0, 610, 0, ARENA_H);
    lg2.addColorStop(0, '#fde047');
    lg2.addColorStop(0.35, '#f97316');
    lg2.addColorStop(1, '#7c2d12');
    g.fillStyle = lg2;
    g.fillRect(0, 610, ARENA_W, 110);
  }
  g.restore();

  const url = c.toDataURL('image/png');
  mapPngCache.set(mapId, url);
  return url;
}

const miniPngCache = new Map<string, string>();
export function getMinigamePng(id: MinigameId): string {
  const cached = miniPngCache.get(id);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';

  const w = 320;
  const h = 180;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;

  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#18181b');
  bg.addColorStop(1, '#09090b');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  if (id === 'sumo') {
    const rg = g.createRadialGradient(160, 96, 14, 160, 96, 102);
    rg.addColorStop(0, '#6a4b29');
    rg.addColorStop(1, '#26180c');
    g.fillStyle = rg;
    g.beginPath(); g.ellipse(160, 96, 98, 62, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fbbf24'; g.lineWidth = 4; g.setLineDash([12, 6]); g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(160, 96, 52, 33, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#3b82f6'; g.beginPath(); g.arc(130, 92, 13, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ef4444'; g.beginPath(); g.arc(190, 96, 13, 0, Math.PI * 2); g.fill();
  } else if (id === 'futbol') {
    const fg = g.createLinearGradient(0, 22, 0, 158);
    fg.addColorStop(0, '#166534'); fg.addColorStop(1, '#0c4321');
    g.fillStyle = fg; g.fillRect(20, 22, 280, 136);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let x = 20; x < 300; x += 56) g.fillRect(x, 22, 28, 136);
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2;
    g.strokeRect(20, 22, 280, 136);
    line(g, 160, 22, 160, 158);
    g.beginPath(); g.arc(160, 90, 28, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(160, 90, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#18181b'; g.beginPath(); g.arc(160, 90, 4.5, 0, Math.PI * 2); g.fill();
  } else if (id === 'laser') {
    g.strokeStyle = 'rgba(56,189,248,0.12)';
    for (let x = 0; x < w; x += 28) line(g, x, 0, x, h);
    for (let y = 0; y < h; y += 28) line(g, 0, y, w, y);
    for (const [x1, y1, x2, y2, col] of [
      [0, 52, 320, 128, '#ef4444'],
      [45, 0, 260, 180, '#38bdf8'],
      [0, 132, 320, 38, '#a855f7'],
    ] as [number, number, number, number, string][]) {
      g.save();
      g.shadowColor = col; g.shadowBlur = 16;
      g.strokeStyle = col; g.lineWidth = 8; line(g, x1, y1, x2, y2);
      g.strokeStyle = '#ffffff'; g.lineWidth = 2.5; line(g, x1, y1, x2, y2);
      g.restore();
    }
    g.fillStyle = '#38bdf8'; g.beginPath(); g.arc(160, 90, 10, 0, Math.PI * 2); g.fill();
  } else if (id === 'lava') {
    const lv = g.createLinearGradient(0, 0, 0, h);
    lv.addColorStop(0, '#09090b'); lv.addColorStop(0.6, '#2b0d0d'); lv.addColorStop(1, '#7c2d12');
    g.fillStyle = lv; g.fillRect(0, 0, w, h);
    for (const [px, py, pw] of [[38, 114, 90], [176, 90, 100], [92, 56, 95]]) {
      g.fillStyle = '#27272a'; roundRectPath(g, px, py, pw, 12, 4); g.fill();
      g.fillStyle = '#f59e0b'; g.fillRect(px + 2, py, pw - 4, 3);
    }
    const mg = g.createLinearGradient(0, 136, 0, h);
    mg.addColorStop(0, '#fde047'); mg.addColorStop(0.3, '#f97316'); mg.addColorStop(1, '#7c2d12');
    g.fillStyle = mg; g.fillRect(0, 138, w, 42);
  } else if (id === 'tiles') {
    const cols = 6, rows = 4, cw = 42, ch = 30, ox = 34, oy = 30;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        if ((r === 1 && col === 2) || (r === 2 && col === 4)) continue;
        const warn = (r + col) % 4 === 0;
        const crit = r === 1 && col === 3;
        g.fillStyle = crit ? '#7f1d1d' : warn ? '#78350f' : '#27272a';
        roundRectPath(g, ox + col * cw, oy + r * ch, cw - 4, ch - 4, 4); g.fill();
        g.strokeStyle = crit ? '#ef4444' : warn ? '#f59e0b' : '#52525b';
        g.lineWidth = 1.6; g.stroke();
      }
    }
  } else if (id === 'paint') {
    const pCols = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const cols = 6, rows = 4, cw = 42, ch = 30, ox = 34, oy = 30;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const idx = (r * 3 + col) % 5;
        g.fillStyle = idx < 4 ? pCols[idx] : '#27272a';
        roundRectPath(g, ox + col * cw, oy + r * ch, cw - 4, ch - 4, 4); g.fill();
      }
    }
  } else if (id === 'coins') {
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < w; x += 28) line(g, x, 0, x, h);
    for (let y = 0; y < h; y += 28) line(g, 0, y, w, y);
    for (const [cx, cy, r, col] of [[95, 70, 16, '#fbbf24'], [160, 92, 20, '#38bdf8'], [225, 65, 16, '#fbbf24'], [130, 130, 14, '#fbbf24']] as [number, number, number, string][]) {
      g.shadowColor = col; g.shadowBlur = 14;
      g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      g.shadowBlur = 0; g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke();
    }
  } else if (id === 'dodge') {
    g.fillStyle = '#27272a'; g.fillRect(0, 150, w, 30);
    g.fillStyle = '#f59e0b'; g.fillRect(0, 148, w, 4);
    for (const [mx, my, mr] of [[80, 56, 15], [175, 86, 19], [248, 44, 13]]) {
      g.fillStyle = 'rgba(249,115,22,0.38)';
      g.beginPath(); g.moveTo(mx - mr, my); g.lineTo(mx, my - mr * 2.5); g.lineTo(mx + mr, my); g.fill();
      g.fillStyle = '#ef4444'; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
    }
  } else if (id === 'race') {
    g.fillStyle = '#27272a'; g.fillRect(0, 144, w, 36);
    for (let y = 28; y < 144; y += 14) {
      g.fillStyle = (y / 14) % 2 === 0 ? '#ffffff' : '#18181b'; g.fillRect(250, y, 7, 14);
      g.fillStyle = (y / 14) % 2 === 0 ? '#18181b' : '#ffffff'; g.fillRect(257, y, 7, 14);
    }
    g.fillStyle = '#3f3f46'; g.fillRect(140, 110, 28, 34);
    g.fillStyle = '#f59e0b'; g.fillRect(142, 112, 24, 5);
    g.strokeStyle = '#e4e4e7'; g.lineWidth = 1.5; g.strokeRect(140, 110, 28, 34);
  } else if (id === 'king') {
    g.strokeStyle = '#fbbf24'; g.lineWidth = 4; g.setLineDash([10, 6]);
    g.beginPath(); g.arc(160, 90, 54, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#fbbf24';
    g.beginPath();
    g.moveTo(132, 110); g.lineTo(128, 70); g.lineTo(146, 88); g.lineTo(160, 62);
    g.lineTo(174, 88); g.lineTo(192, 70); g.lineTo(188, 110);
    g.closePath(); g.fill();
  } else if (id === 'bomb') {
    g.fillStyle = 'rgba(239,68,68,0.18)';
    g.beginPath(); g.arc(160, 96, 62, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#09090b'; g.strokeStyle = '#e4e4e7'; g.lineWidth = 3;
    g.beginPath(); g.arc(160, 98, 28, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = '#f59e0b'; g.lineWidth = 4; line(g, 174, 74, 190, 54);
    g.fillStyle = '#fde047'; g.beginPath(); g.arc(192, 52, 7, 0, Math.PI * 2); g.fill();
  } else if (id === 'snow') {
    const sg = g.createLinearGradient(0, 0, 0, h);
    sg.addColorStop(0, '#0f172a'); sg.addColorStop(1, '#1e3a5f');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e2e8f0'; g.fillRect(0, 152, w, 28);
    for (const [sx, sy, sr] of [[85, 72, 14], [175, 58, 18], [240, 102, 12]]) {
      g.shadowColor = '#bae6fd'; g.shadowBlur = 12;
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
      g.shadowBlur = 0;
    }
  }

  const url = c.toDataURL('image/png');
  miniPngCache.set(id, url);
  return url;
}
