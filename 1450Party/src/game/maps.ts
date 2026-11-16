import { MapId } from './types';

export const ARENA_W = 1280;
export const ARENA_H = 720;

export interface MovingPlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  speed: number;
  phase?: number;
}

export interface PortalDef {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  color: string;
}

export interface LaserGateDef {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  period: number;
  offset: number;
  activeLen: number;
  warnLen: number;
}

export interface PendulumDef {
  px: number;
  py: number;
  len: number;
  amp: number;
  speed: number;
  phase: number;
  radius: number;
}

export interface BumperDef {
  x: number;
  y: number;
  r: number;
  power: number;
  color: string;
}

export interface LiftZoneDef {
  x: number;
  y: number;
  w: number;
  h: number;
  force?: number;
  color?: string;
}

export interface ArenaMapDef {
  id: Exclude<MapId, 'random'>;
  name: string;
  style:
    | 'minecraft'
    | 'pirate'
    | 'pyramid'
    | 'snow'
    | 'foundry'
    | 'neon'
    | 'lava'
    | 'citadel'
    | 'space'
    | 'forest'
    | 'vault';
  pl: [number, number, number, number][];
  sp: [number, number][];
  g?: number;
  js?: number;
  fr?: number;
  walls?: boolean;
  bounceWalls?: boolean;
  lava?: boolean;
  belts?: [number, number][];
  pads?: [number, number, number][];
  moving?: MovingPlatformDef[];
  portals?: PortalDef[];
  lasers?: LaserGateDef[];
  pendulums?: PendulumDef[];
  bumpers?: BumperDef[];
  lifts?: LiftZoneDef[];
}

export const ARENA_MAPS: Record<Exclude<MapId, 'random'>, ArenaMapDef> = {
  minecraft: {
    id: 'minecraft',
    name: 'Minecraft Dünyası',
    style: 'minecraft',
    walls: true,
    pl: [
      [0, 620, 520, 100],
      [520, 636, 240, 84],
      [760, 596, 520, 124],
      [50, 450, 230, 32],
      [475, 265, 250, 34],
      [880, 395, 350, 36],
      [180, 195, 160, 30],
    ],
    sp: [
      [0, 0.35],
      [2, 0.68],
      [3, 0.5],
      [5, 0.5],
    ],
    pads: [
      [640, 636, 96],
      [165, 450, 72],
    ],
    moving: [
      { x: 315, y: 400, w: 150, h: 28, dx: 0, dy: 95, speed: 0.025, phase: 0 },
    ],
    portals: [
      { ax: 82, ay: 562, bx: 1125, by: 336, color: '#a855f7' },
    ],
  },

  pirate_ship: {
    id: 'pirate_ship',
    name: 'Korsan Gəmisi',
    style: 'pirate',
    walls: true,
    pl: [
      [0, 632, 1280, 88],
      [260, 515, 760, 44],
      [36, 360, 210, 32],
      [1034, 330, 210, 32],
      [555, 200, 170, 28],
    ],
    sp: [
      [1, 0.2],
      [1, 0.8],
      [2, 0.5],
      [3, 0.5],
    ],
    pads: [
      [125, 632, 86],
      [1155, 632, 86],
    ],
    pendulums: [
      { px: 640, py: -35, len: 315, amp: 0.54, speed: 0.026, phase: 0, radius: 30 },
    ],
    bumpers: [
      { x: 390, y: 370, r: 24, power: 13, color: '#f59e0b' },
      { x: 890, y: 370, r: 24, power: 13, color: '#f59e0b' },
    ],
  },

  desert_pyramid: {
    id: 'desert_pyramid',
    name: 'Səhra Piramidası',
    style: 'pyramid',
    walls: true,
    pl: [
      [0, 630, 1280, 90],
      [200, 535, 880, 38],
      [325, 440, 630, 36],
      [445, 345, 390, 34],
      [545, 250, 190, 32],
      [38, 295, 130, 30],
      [1112, 295, 130, 30],
    ],
    sp: [
      [0, 0.14],
      [0, 0.86],
      [5, 0.5],
      [6, 0.5],
    ],
    lifts: [
      { x: 75, y: 325, w: 60, h: 300, force: 0.9, color: '#fbbf24' },
      { x: 1145, y: 325, w: 60, h: 300, force: 0.9, color: '#fbbf24' },
    ],
    portals: [
      { ax: 245, ay: 575, bx: 640, by: 192, color: '#facc15' },
    ],
  },

  snow_peaks: {
    id: 'snow_peaks',
    name: 'Qarlı Zirvə',
    style: 'snow',
    walls: true,
    fr: 0.968,
    pl: [
      [0, 625, 1280, 95],
      [40, 470, 350, 36],
      [880, 495, 360, 36],
      [460, 380, 340, 34],
      [65, 275, 220, 32],
      [690, 215, 260, 32],
    ],
    sp: [
      [0, 0.25],
      [0, 0.75],
      [1, 0.5],
      [2, 0.5],
    ],
    pads: [
      [640, 625, 92],
    ],
    lifts: [
      { x: 1090, y: 185, w: 72, h: 310, force: 0.92, color: '#7dd3fc' },
    ],
  },

  steel_foundry: {
    id: 'steel_foundry',
    name: 'Polad Zavod',
    style: 'foundry',
    walls: true,
    pl: [
      [0, 620, 1280, 100],
      [380, 470, 520, 34],
      [45, 340, 220, 32],
      [1015, 340, 220, 32],
      [490, 200, 300, 30],
    ],
    sp: [
      [0, 0.14],
      [0, 0.86],
      [2, 0.5],
      [3, 0.5],
    ],
    belts: [
      [1, 1],
      [4, -1],
    ],
    pads: [
      [145, 620, 84],
      [1135, 620, 84],
    ],
    moving: [
      { x: 310, y: 315, w: 155, h: 26, dx: 115, dy: 0, speed: 0.024, phase: 0 },
      { x: 815, y: 315, w: 155, h: 26, dx: 115, dy: 0, speed: 0.024, phase: Math.PI },
    ],
    bumpers: [
      { x: 640, y: 335, r: 26, power: 13.5, color: '#fb923c' },
    ],
  },

  neon_city: {
    id: 'neon_city',
    name: 'Neon Metropol',
    style: 'neon',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [50, 480, 310, 34],
      [920, 480, 310, 34],
      [460, 390, 360, 32],
      [220, 235, 230, 28],
      [830, 235, 230, 28],
    ],
    sp: [
      [0, 0.25],
      [0, 0.75],
      [1, 0.45],
      [2, 0.55],
    ],
    pads: [
      [640, 625, 96],
    ],
    portals: [
      { ax: 75, ay: 565, bx: 1140, by: 420, color: '#22d3ee' },
      { ax: 1205, ay: 565, bx: 140, by: 420, color: '#f472b6' },
    ],
    bumpers: [
      { x: 640, y: 245, r: 26, power: 14, color: '#22d3ee' },
      { x: 405, y: 515, r: 20, power: 12, color: '#f472b6' },
      { x: 875, y: 515, r: 20, power: 12, color: '#f472b6' },
    ],
  },

  lava_core: {
    id: 'lava_core',
    name: 'Vulkan Krateri',
    style: 'lava',
    lava: true,
    pl: [
      [90, 525, 260, 36],
      [930, 525, 260, 36],
      [485, 425, 310, 36],
      [220, 305, 220, 34],
      [840, 305, 220, 34],
      [515, 185, 250, 34],
    ],
    sp: [
      [0, 0.5],
      [1, 0.5],
      [3, 0.5],
      [4, 0.5],
    ],
    moving: [
      { x: 545, y: 550, w: 190, h: 28, dx: 0, dy: 55, speed: 0.032, phase: 0 },
    ],
  },

  sky_citadel: {
    id: 'sky_citadel',
    name: 'Qala Körpüsü',
    style: 'citadel',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [240, 495, 800, 38],
      [40, 345, 200, 32],
      [1040, 345, 200, 32],
      [505, 315, 270, 30],
      [270, 195, 190, 28],
      [820, 195, 190, 28],
    ],
    sp: [
      [0, 0.16],
      [0, 0.84],
      [2, 0.5],
      [3, 0.5],
    ],
    pads: [
      [140, 625, 80],
      [1140, 625, 80],
    ],
    pendulums: [
      { px: 430, py: -40, len: 300, amp: 0.5, speed: 0.028, phase: 0, radius: 32 },
      { px: 850, py: -40, len: 300, amp: 0.5, speed: 0.028, phase: Math.PI, radius: 32 },
    ],
  },

  space_station: {
    id: 'space_station',
    name: 'Orbital Stansiya',
    style: 'space',
    g: 0.3,
    js: 0.78,
    bounceWalls: true,
    pl: [
      [0, 630, 1280, 90],
      [70, 465, 250, 34],
      [960, 465, 250, 34],
      [240, 290, 220, 32],
      [820, 290, 220, 32],
      [525, 175, 230, 30],
    ],
    sp: [
      [0, 0.18],
      [0, 0.82],
      [1, 0.5],
      [2, 0.5],
    ],
    lifts: [
      { x: 585, y: 205, w: 110, h: 425, force: 0.62, color: '#38bdf8' },
    ],
    bumpers: [
      { x: 425, y: 455, r: 25, power: 13, color: '#818cf8' },
      { x: 855, y: 455, r: 25, power: 13, color: '#818cf8' },
    ],
  },

  ancient_forest: {
    id: 'ancient_forest',
    name: 'Meşə Məbədi',
    style: 'forest',
    walls: true,
    pl: [
      [0, 620, 1280, 100],
      [75, 470, 260, 32],
      [945, 425, 260, 32],
      [445, 360, 300, 32],
      [205, 225, 220, 30],
      [795, 200, 230, 30],
    ],
    sp: [
      [0, 0.16],
      [0, 0.84],
      [1, 0.5],
      [2, 0.5],
    ],
    pads: [
      [340, 620, 80],
      [920, 620, 80],
    ],
    lifts: [
      { x: 600, y: 245, w: 80, h: 375, force: 0.88, color: '#4ade80' },
    ],
  },

  laser_vault: {
    id: 'laser_vault',
    name: 'Lazer Anbarı',
    style: 'vault',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [430, 480, 420, 34],
      [260, 240, 240, 30],
      [780, 240, 240, 30],
      [530, 145, 220, 28],
    ],
    sp: [
      [0, 0.15],
      [0, 0.85],
      [2, 0.5],
      [3, 0.5],
    ],
    moving: [
      { x: 65, y: 365, w: 165, h: 28, dx: 0, dy: 95, speed: 0.025, phase: 0 },
      { x: 1050, y: 365, w: 165, h: 28, dx: 0, dy: 95, speed: 0.025, phase: Math.PI },
    ],
    lasers: [
      { x1: 640, y1: 175, x2: 640, y2: 480, period: 260, offset: 0, warnLen: 55, activeLen: 65 },
      { x1: 350, y1: 360, x2: 930, y2: 360, period: 300, offset: 150, warnLen: 55, activeLen: 65 },
    ],
  },
};

export function randomMapKey(): Exclude<MapId, 'random'> {
  const keys = Object.keys(ARENA_MAPS) as Exclude<MapId, 'random'>[];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getMovingBounds(m: MovingPlatformDef, t: number): [number, number, number, number] {
  const ph = t * m.speed + (m.phase || 0);
  return [
    m.x + Math.sin(ph) * m.dx,
    m.y + Math.sin(ph) * m.dy,
    m.w,
    m.h,
  ];
}

export function getPendulumBob(p: PendulumDef, t: number): [number, number, number] {
  const ang = p.amp * Math.sin(t * p.speed + p.phase);
  return [p.px + Math.sin(ang) * p.len, p.py + Math.cos(ang) * p.len, ang];
}

export function getLaserState(l: LaserGateDef, t: number): 'idle' | 'warn' | 'active' {
  const cyc = (t + l.offset) % l.period;
  if (cyc > l.period - l.activeLen) return 'active';
  if (cyc > l.period - l.activeLen - l.warnLen) return 'warn';
  return 'idle';
}

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function buildMapBackground(style: ArenaMapDef['style']): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = ARENA_W;
  c.height = ARENA_H;
  const g = c.getContext('2d')!;
  const r = seeded(17);

  const skyCols: Record<ArenaMapDef['style'], [string, string, string]> = {
    minecraft: ['#4d9eff', '#7ac0ff', '#bae3ff'],
    pirate: ['#091326', '#10294a', '#18426b'],
    pyramid: ['#261409', '#7c3f12', '#d97724'],
    snow: ['#050b1c', '#0e1f3d', '#1c3b63'],
    foundry: ['#0c0d11', '#1a1618', '#3d1c0f'],
    neon: ['#070516', '#160b32', '#2d1148'],
    lava: ['#0f0304', '#290707', '#5a120a'],
    citadel: ['#0f1119', '#1e2230', '#383028'],
    space: ['#020309', '#09071d', '#161036'],
    forest: ['#030d0b', '#08221b', '#124031'],
    vault: ['#07080b', '#12141a', '#1d2029'],
  };

  const [c0, c1, c2] = skyCols[style];
  const gr = g.createLinearGradient(0, 0, 0, ARENA_H);
  gr.addColorStop(0, c0);
  gr.addColorStop(0.58, c1);
  gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.fillRect(0, 0, ARENA_W, ARENA_H);

  if (style === 'minecraft') {
    // Square pixel sun
    g.fillStyle = 'rgba(254,240,138,0.35)';
    g.fillRect(990, 46, 92, 92);
    g.fillStyle = '#fef08a';
    g.fillRect(1004, 60, 64, 64);

    // Blocky voxel clouds
    g.fillStyle = 'rgba(255,255,255,0.88)';
    for (const [cx, cy, cw] of [[110, 90, 180], [420, 68, 220], [740, 120, 160], [1120, 160, 140]]) {
      g.fillRect(cx, cy, cw, 26);
      g.fillRect(cx + 28, cy - 20, cw - 56, 20);
    }

    // Distant blocky voxel mountains
    const bs = 28;
    for (let bx = 0; bx < ARENA_W; bx += bs) {
      const hBlocks = 3 + Math.floor(Math.sin(bx * 0.008) * 2.5 + Math.cos(bx * 0.02) * 1.5 + 3);
      const topY = ARENA_H - 96 - hBlocks * bs;
      g.fillStyle = '#3b8526';
      g.fillRect(bx, topY, bs, bs);
      g.fillStyle = '#5c4028';
      g.fillRect(bx, topY + bs, bs, hBlocks * bs);
      g.fillStyle = 'rgba(0,0,0,0.08)';
      g.strokeRect(bx, topY, bs, bs);
    }

    // Blocky Oak Trees
    for (const [tx, ty] of [[240, 495], [960, 465]]) {
      g.fillStyle = '#5c3c22';
      g.fillRect(tx - 14, ty, 28, 120);
      g.fillStyle = '#3e2715';
      g.fillRect(tx - 6, ty + 14, 10, 90);
      g.fillStyle = '#2f7a24';
      g.fillRect(tx - 56, ty - 70, 112, 74);
      g.fillStyle = '#449e33';
      g.fillRect(tx - 38, ty - 98, 76, 36);
      g.fillStyle = '#1e5416';
      g.fillRect(tx + 24, ty - 56, 28, 44);
    }
  } else if (style === 'pirate') {
    // Pale stormy full moon
    const mg = g.createRadialGradient(260, 140, 10, 260, 140, 170);
    mg.addColorStop(0, 'rgba(241,245,249,0.95)');
    mg.addColorStop(0.28, 'rgba(186,230,253,0.28)');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mg;
    g.fillRect(80, 0, 360, 320);

    // Tall central ship mast & billowing sails in silhouette
    g.fillStyle = '#1d120c';
    g.fillRect(628, 40, 24, 590);
    g.fillRect(360, 215, 560, 16);
    g.fillRect(420, 105, 440, 14);
    g.fillStyle = 'rgba(226,232,240,0.14)';
    g.beginPath();
    g.moveTo(390, 225);
    g.quadraticCurveTo(640, 265, 890, 225);
    g.lineTo(840, 415);
    g.quadraticCurveTo(640, 375, 440, 415);
    g.closePath();
    g.fill();

    // Rolling ocean backdrop at bottom
    g.fillStyle = '#0c2745';
    g.fillRect(0, 520, ARENA_W, 200);
    g.fillStyle = '#164675';
    g.beginPath();
    g.moveTo(0, 555);
    for (let x = 0; x <= ARENA_W; x += 64) {
      g.quadraticCurveTo(x + 32, 535, x + 64, 555);
    }
    g.lineTo(ARENA_W, ARENA_H);
    g.lineTo(0, ARENA_H);
    g.closePath();
    g.fill();
  } else if (style === 'pyramid') {
    // Blazing desert sun
    const sg = g.createRadialGradient(640, 195, 16, 640, 195, 220);
    sg.addColorStop(0, '#fef08a');
    sg.addColorStop(0.35, 'rgba(251,146,60,0.55)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sg;
    g.fillRect(380, 0, 520, 430);

    // Distant Great Pyramids silhouettes
    const drawPyr = (cx: number, baseW: number, height: number, leftCol: string, rightCol: string) => {
      g.fillStyle = leftCol;
      g.beginPath();
      g.moveTo(cx, 620 - height);
      g.lineTo(cx - baseW / 2, 620);
      g.lineTo(cx, 620);
      g.closePath();
      g.fill();
      g.fillStyle = rightCol;
      g.beginPath();
      g.moveTo(cx, 620 - height);
      g.lineTo(cx + baseW / 2, 620);
      g.lineTo(cx, 620);
      g.closePath();
      g.fill();
    };
    drawPyr(230, 420, 310, '#78350f', '#451a03');
    drawPyr(1040, 460, 340, '#92400e', '#451a03');

    // Rolling sand dunes
    g.fillStyle = '#5c2b0e';
    g.beginPath();
    g.moveTo(0, 540);
    g.bezierCurveTo(320, 470, 880, 595, 1280, 500);
    g.lineTo(ARENA_W, ARENA_H);
    g.lineTo(0, ARENA_H);
    g.closePath();
    g.fill();
  } else if (style === 'snow') {
    for (let i = 0; i < 150; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.7})`;
      g.fillRect(r() * ARENA_W, r() * ARENA_H * 0.7, 1.5, 1.5);
    }
    const aur = g.createLinearGradient(150, 40, 1100, 220);
    aur.addColorStop(0, 'rgba(56,189,248,0)');
    aur.addColorStop(0.35, 'rgba(52,211,153,0.22)');
    aur.addColorStop(0.7, 'rgba(56,189,248,0.2)');
    aur.addColorStop(1, 'rgba(56,189,248,0)');
    g.fillStyle = aur;
    g.beginPath();
    g.moveTo(0, 160);
    g.bezierCurveTo(320, 40, 680, 240, 1280, 80);
    g.lineTo(1280, 220);
    g.bezierCurveTo(680, 320, 320, 140, 0, 240);
    g.closePath();
    g.fill();

    const mg = g.createRadialGradient(960, 130, 8, 960, 130, 180);
    mg.addColorStop(0, 'rgba(226,242,255,0.9)');
    mg.addColorStop(0.25, 'rgba(180,220,255,0.3)');
    mg.addColorStop(1, 'rgba(180,220,255,0)');
    g.fillStyle = mg;
    g.fillRect(720, 0, 500, 340);

    [
      { base: 430, amp: 140, col: '#132445', snowCol: '#3c5f94' },
      { base: 510, amp: 110, col: '#0d1a33', snowCol: '#6994c7' },
      { base: 600, amp: 85, col: '#081122', snowCol: '#a5ccf0' },
    ].forEach((L) => {
      g.fillStyle = L.col;
      g.beginPath();
      g.moveTo(0, ARENA_H);
      const pts: [number, number][] = [];
      for (let x = 0; x <= ARENA_W; x += 80) {
        const y = L.base - r() * L.amp;
        pts.push([x, y]);
        g.lineTo(x, y);
      }
      g.lineTo(ARENA_W, ARENA_H);
      g.closePath();
      g.fill();
      g.strokeStyle = L.snowCol;
      g.lineWidth = 3;
      g.beginPath();
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
    });
  } else if (style === 'foundry') {
    const vg = g.createLinearGradient(0, 480, 0, ARENA_H);
    vg.addColorStop(0, 'rgba(255,100,20,0)');
    vg.addColorStop(1, 'rgba(255,95,20,0.34)');
    g.fillStyle = vg;
    g.fillRect(0, 480, ARENA_W, 240);

    for (let x = 90; x < ARENA_W; x += 260) {
      g.fillStyle = '#181920';
      g.fillRect(x, 0, 38, ARENA_H);
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.fillRect(x + 4, 0, 5, ARENA_H);
      g.strokeStyle = '#0e0f13';
      g.lineWidth = 2;
      for (let y = 20; y < ARENA_H; y += 56) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 38, y + 40);
        g.stroke();
      }
    }
    for (const y of [75, 195]) {
      const pg = g.createLinearGradient(0, y, 0, y + 24);
      pg.addColorStop(0, '#4b505c');
      pg.addColorStop(0.5, '#2b2f38');
      pg.addColorStop(1, '#14161b');
      g.fillStyle = pg;
      g.fillRect(0, y, ARENA_W, 22);
    }
    [
      [210, 320, 95],
      [1060, 240, 82],
      [640, 390, 68],
    ].forEach(([cx, cy, rad]) => {
      g.save();
      g.strokeStyle = 'rgba(0,0,0,0.5)';
      g.lineWidth = 14;
      g.setLineDash([12, 10]);
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.lineWidth = 8;
      g.beginPath();
      g.arc(cx, cy, rad * 0.45, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    });
  } else if (style === 'neon') {
    const sg = g.createLinearGradient(0, 170, 0, 440);
    sg.addColorStop(0, '#fde047');
    sg.addColorStop(0.55, '#fb7185');
    sg.addColorStop(1, '#c026d3');
    g.fillStyle = sg;
    g.beginPath();
    g.arc(640, 330, 138, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#150a2d';
    for (let k = 0; k < 7; k++) g.fillRect(490, 300 + k * 21, 300, 3 + k * 1.4);

    for (let layer = 0; layer < 2; layer++) {
      for (let x = -15; x < ARENA_W; x += layer === 0 ? 74 : 58) {
        const bw = (layer === 0 ? 54 : 44) + r() * 28;
        const bh = (layer === 0 ? 250 : 160) + r() * 230;
        const by = ARENA_H - bh;
        g.fillStyle = layer === 0 ? '#0c0820' : '#080515';
        g.fillRect(x, by, bw, bh);
        g.fillStyle = 'rgba(255,255,255,0.035)';
        g.fillRect(x, by, 3, bh);
        for (let wy = by + 12; wy < ARENA_H - 18; wy += 16) {
          for (let wx = x + 7; wx < x + bw - 9; wx += 11) {
            if (r() < 0.42) {
              g.fillStyle = ['#22d3ee', '#f472b6', '#fde047'][Math.floor(r() * 3)];
              g.globalAlpha = layer === 0 ? 0.32 : 0.68;
              g.fillRect(wx, wy, 5, 7);
              g.globalAlpha = 1;
            }
          }
        }
      }
    }
  } else if (style === 'lava') {
    const glow = g.createRadialGradient(640, 720, 40, 640, 720, 560);
    glow.addColorStop(0, 'rgba(255,100,20,0.48)');
    glow.addColorStop(0.5, 'rgba(180,30,10,0.22)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, ARENA_W, ARENA_H);

    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 220 + r() * 40;
      const w = 36 + r() * 34;
      g.fillStyle = '#180808';
      g.fillRect(x, 0, w, ARENA_H);
      g.strokeStyle = 'rgba(255,110,30,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + w * 0.4, 20);
      g.lineTo(x + w * 0.6, 210);
      g.lineTo(x + w * 0.3, 440);
      g.lineTo(x + w * 0.55, 680);
      g.stroke();
    }
    g.fillStyle = '#140506';
    for (let x = 0; x < ARENA_W; x += 64) {
      const sh = 40 + r() * 90;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 32, sh);
      g.lineTo(x + 64, 0);
      g.closePath();
      g.fill();
    }
  } else if (style === 'citadel') {
    const mg = g.createRadialGradient(640, 150, 8, 640, 150, 210);
    mg.addColorStop(0, 'rgba(255,235,195,0.45)');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mg;
    g.fillRect(400, 0, 480, 380);

    g.fillStyle = '#151822';
    g.fillRect(0, 430, ARENA_W, 290);
    for (let x = 0; x < ARENA_W; x += 72) {
      g.fillRect(x, 398, 44, 34);
    }
    for (const tx of [220, 640, 1060]) {
      const tg = g.createRadialGradient(tx, 340, 4, tx, 340, 90);
      tg.addColorStop(0, 'rgba(251,146,60,0.45)');
      tg.addColorStop(1, 'rgba(251,146,60,0)');
      g.fillStyle = tg;
      g.fillRect(tx - 100, 240, 200, 200);
      g.fillStyle = '#fb923c';
      g.beginPath();
      g.arc(tx, 340, 6, 0, Math.PI * 2);
      g.fill();
    }
  } else if (style === 'space') {
    for (let i = 0; i < 320; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.8})`;
      const z = r() < 0.12 ? 2.4 : 1.2;
      g.fillRect(r() * ARENA_W, r() * ARENA_H, z, z);
    }
    [
      [280, 190, 380, 'rgba(99,102,241,0.22)'],
      [960, 460, 350, 'rgba(236,72,153,0.16)'],
      [680, 120, 280, 'rgba(56,189,248,0.18)'],
    ].forEach(([nx, ny, nr, nc]) => {
      const ng = g.createRadialGradient(nx as number, ny as number, 0, nx as number, ny as number, nr as number);
      ng.addColorStop(0, nc as string);
      ng.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = ng;
      g.fillRect(0, 0, ARENA_W, ARENA_H);
    });
    const pg = g.createRadialGradient(990, 155, 12, 990, 155, 92);
    pg.addColorStop(0, '#fed7aa');
    pg.addColorStop(0.65, '#c2410c');
    pg.addColorStop(1, '#431407');
    g.fillStyle = pg;
    g.beginPath();
    g.arc(990, 155, 88, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(254,215,170,0.45)';
    g.lineWidth = 7;
    g.beginPath();
    g.ellipse(990, 155, 158, 28, -0.26, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = 'rgba(148,163,184,0.16)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(120, 0);
    g.lineTo(120, ARENA_H);
    g.moveTo(1160, 0);
    g.lineTo(1160, ARENA_H);
    g.stroke();
  } else if (style === 'forest') {
    const mg = g.createRadialGradient(420, 145, 6, 420, 145, 220);
    mg.addColorStop(0, 'rgba(230,255,220,0.9)');
    mg.addColorStop(0.25, 'rgba(167,243,208,0.3)');
    mg.addColorStop(1, 'rgba(167,243,208,0)');
    g.fillStyle = mg;
    g.fillRect(140, 0, 560, 380);
    g.fillStyle = '#ecfdf5';
    g.beginPath();
    g.arc(420, 145, 36, 0, Math.PI * 2);
    g.fill();

    for (let i = 0; i < 16; i++) {
      const tx = i * 92 + r() * 25;
      const tw = 24 + r() * 28;
      g.fillStyle = i % 2 === 0 ? 'rgba(4,24,18,0.85)' : 'rgba(6,36,27,0.65)';
      g.fillRect(tx, 0, tw, ARENA_H);
    }
    g.fillStyle = 'rgba(16,185,129,0.08)';
    g.fillRect(0, 480, ARENA_W, 240);
  } else if (style === 'vault') {
    for (let x = 80; x < ARENA_W; x += 220) {
      g.fillStyle = 'rgba(255,255,255,0.03)';
      g.fillRect(x, 0, 52, ARENA_H);
      g.strokeStyle = 'rgba(255,255,255,0.08)';
      g.lineWidth = 1;
      g.strokeRect(x, 0, 52, ARENA_H);
    }
    for (const sx of [320, 640, 960]) {
      const sg = g.createLinearGradient(sx, 0, sx, 620);
      sg.addColorStop(0, 'rgba(255,255,255,0.12)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg;
      g.beginPath();
      g.moveTo(sx - 24, 0);
      g.lineTo(sx + 24, 0);
      g.lineTo(sx + 150, 620);
      g.lineTo(sx - 150, 620);
      g.closePath();
      g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,0.04)';
    g.lineWidth = 1;
    for (let y = 60; y < ARENA_H; y += 60) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(ARENA_W, y);
      g.stroke();
    }
  }

  return c;
}

export function drawArenaPlatform(
  ctx: CanvasRenderingContext2D,
  p: [number, number, number, number],
  style: ArenaMapDef['style']
) {
  const [x, y, w, h] = p;
  ctx.save();
  if (style === 'minecraft') {
    const isStoneMine = y === 596 || y === 395;
    const isPlanks = y === 450 || y === 636;
    const isDiamondSky = y === 265 || y === 195;
    const tile = 20;

    if (isPlanks) {
      ctx.fillStyle = '#9c6b3b';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#5c3c1b';
      ctx.lineWidth = 1.5;
      for (let bx = x; bx < x + w; bx += 24) {
        ctx.fillStyle = (Math.floor(bx / 24) % 2 === 0) ? '#ad7944' : '#8e5f32';
        ctx.fillRect(bx, y, Math.min(24, x + w - bx), Math.min(h, 16));
        ctx.strokeRect(bx, y, Math.min(24, x + w - bx), Math.min(h, 16));
      }
      ctx.strokeStyle = '#3f2810';
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    } else if (isDiamondSky || isStoneMine) {
      ctx.fillStyle = '#575d66';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#272a30';
      ctx.lineWidth = 1;
      for (let bx = x; bx < x + w; bx += tile) {
        const bw = Math.min(tile, x + w - bx);
        ctx.fillStyle = ((bx / tile) | 0) % 2 === 0 ? '#68707a' : '#4f565f';
        ctx.fillRect(bx, y, bw, Math.min(tile, h));
        ctx.strokeRect(bx, y, bw, Math.min(tile, h));
        if (isDiamondSky && ((bx / tile) | 0) % 3 === 1) {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(bx + 4, y + 5, 5, 5);
          ctx.fillRect(bx + 11, y + 10, 4, 4);
        }
      }
      ctx.fillStyle = isDiamondSky ? '#22d3ee' : '#84cc16';
      ctx.fillRect(x, y, w, 3);
    } else {
      // Classic Minecraft Grass + Dirt voxel blocks
      ctx.fillStyle = '#6d4c30';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#4ea832';
      ctx.fillRect(x, y, w, 10);
      ctx.fillStyle = '#6ad444';
      ctx.fillRect(x, y, w, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.26)';
      ctx.lineWidth = 1;
      for (let bx = x; bx < x + w; bx += tile) {
        const bw = Math.min(tile, x + w - bx);
        ctx.strokeRect(bx, y, bw, Math.min(tile, h));
        if (((bx / tile) | 0) % 2 === 0) {
          ctx.fillStyle = '#43942b';
          ctx.fillRect(bx + 3, y + 8, 6, 4);
        }
      }
    }
  } else if (style === 'pirate') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#7c4a24');
    g.addColorStop(1, '#3b210e');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = '#261408';
    ctx.lineWidth = 1.5;
    for (let bx = x + 36; bx < x + w; bx += 36) {
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = '#fbbf24';
    for (let bx = x + 16; bx < x + w - 8; bx += 36) {
      ctx.beginPath();
      ctx.arc(bx, y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y, w, 3);
  } else if (style === 'pyramid') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e6b86a');
    g.addColorStop(1, '#8c5a1e');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(92,51,16,0.55)';
    ctx.lineWidth = 1.5;
    for (let bx = x + 44; bx < x + w; bx += 44) {
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x, y, w, 3);
  } else if (style === 'snow') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#38768f');
    g.addColorStop(1, '#14384a');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.fillStyle = '#f1f8ff';
    roundRectPath(ctx, x - 3, y - 4, w + 6, 10, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(186,230,253,0.75)';
    for (let k = x + 18; k < x + w - 12; k += 42) {
      ctx.beginPath();
      ctx.moveTo(k, y + h);
      ctx.lineTo(k + 6, y + h + Math.min(18, h * 0.48));
      ctx.lineTo(k + 12, y + h);
      ctx.closePath();
      ctx.fill();
    }
  } else if (style === 'foundry') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#525866');
    g.addColorStop(1, '#1c1f26');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (let k = x; k < x + w - 8; k += 18) ctx.fillRect(k, y, 8, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let k = x + 12; k < x + w - 8; k += 36) {
      ctx.beginPath();
      ctx.arc(k, y + h * 0.55, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'neon') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#2a1263');
    g.addColorStop(1, '#090418');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(x, y, w, 3);
    ctx.shadowColor = '#f472b6';
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(x, y + h - 2.5, w, 2.5);
  } else if (style === 'lava') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#362222');
    g.addColorStop(1, '#170a0a');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(x + 2, y, w - 4, 3);
    ctx.strokeStyle = 'rgba(251,146,60,0.45)';
    ctx.lineWidth = 1.5;
    for (let k = x + 28; k < x + w - 20; k += 54) {
      ctx.beginPath();
      ctx.moveTo(k, y + 4);
      ctx.lineTo(k + 8, y + h * 0.55);
      ctx.lineTo(k - 4, y + h - 3);
      ctx.stroke();
    }
  } else if (style === 'citadel') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#645c50');
    g.addColorStop(1, '#292520');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    for (let k = x + 36; k < x + w; k += 36) {
      ctx.beginPath();
      ctx.moveTo(k, y);
      ctx.lineTo(k, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,235,195,0.22)';
    ctx.fillRect(x, y, w, 3);
  } else if (style === 'space') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#7c859e');
    g.addColorStop(1, '#232738');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, Math.min(14, h / 2));
    ctx.fill();
    ctx.shadowColor = '#93c5fd';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(191,219,254,0.85)';
    ctx.fillRect(x + 10, y, w - 20, 2.5);
  } else if (style === 'forest') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#4d3219');
    g.addColorStop(1, '#1a0f07');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 7);
    for (let k = 0; k <= w; k += 14) {
      ctx.lineTo(x + k, y - 3 - Math.abs(Math.sin(k * 0.45 + x)) * 4.5);
    }
    ctx.lineTo(x + w + 3, y + 7);
    ctx.closePath();
    ctx.fill();
  } else {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#3f3f46');
    g.addColorStop(1, '#18181b');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(x, y, w, 2.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  ctx.restore();
}
