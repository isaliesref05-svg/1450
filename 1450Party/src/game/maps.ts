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

export interface ArenaMapDef {
  id: Exclude<MapId, 'random'>;
  name: string;
  style:
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
}

export const ARENA_MAPS: Record<Exclude<MapId, 'random'>, ArenaMapDef> = {
  snow_peaks: {
    id: 'snow_peaks',
    name: 'Qarlı Zirvə',
    style: 'snow',
    fr: 0.968,
    pl: [
      [410, 565, 460, 44],
      [90, 445, 240, 36],
      [950, 445, 240, 36],
      [280, 315, 220, 34],
      [780, 315, 220, 34],
      [525, 195, 230, 34],
      [30, 260, 150, 32],
      [1100, 260, 150, 32],
    ],
    sp: [
      [1, 0.5],
      [2, 0.5],
      [3, 0.5],
      [4, 0.5],
    ],
    pads: [[640, 565, 96]],
  },

  steel_foundry: {
    id: 'steel_foundry',
    name: 'Polad Zavod',
    style: 'foundry',
    walls: true,
    pl: [
      [0, 620, 1280, 100],
      [410, 465, 460, 34],
      [60, 330, 240, 32],
      [980, 330, 240, 32],
      [510, 215, 260, 30],
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
      [160, 620, 84],
      [1120, 620, 84],
    ],
    moving: [
      { x: 540, y: 340, w: 200, h: 28, dx: 200, dy: 0, speed: 0.022, phase: 0 },
    ],
  },

  neon_city: {
    id: 'neon_city',
    name: 'Neon Metropol',
    style: 'neon',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [430, 485, 420, 34],
      [90, 355, 230, 30],
      [960, 355, 230, 30],
      [270, 225, 220, 28],
      [790, 225, 220, 28],
    ],
    sp: [
      [0, 0.16],
      [0, 0.84],
      [2, 0.5],
      [3, 0.5],
    ],
    pads: [
      [260, 625, 86],
      [1020, 625, 86],
    ],
    portals: [
      { ax: 85, ay: 565, bx: 1140, by: 295, color: '#22d3ee' },
      { ax: 1195, ay: 565, bx: 140, by: 295, color: '#f472b6' },
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
      [220, 535, 840, 44],
      [40, 375, 210, 34],
      [1030, 375, 210, 34],
      [505, 330, 270, 32],
      [250, 210, 200, 30],
      [830, 210, 200, 30],
    ],
    sp: [
      [1, 0.5],
      [2, 0.5],
      [0, 0.25],
      [0, 0.75],
    ],
    pendulums: [
      { px: 430, py: -40, len: 310, amp: 0.52, speed: 0.028, phase: 0, radius: 34 },
      { px: 850, py: -40, len: 310, amp: 0.52, speed: 0.028, phase: Math.PI, radius: 34 },
    ],
  },

  space_station: {
    id: 'space_station',
    name: 'Orbital Stansiya',
    style: 'space',
    g: 0.3,
    js: 0.76,
    bounceWalls: true,
    pl: [
      [90, 540, 240, 38],
      [950, 540, 240, 38],
      [500, 440, 280, 38],
      [220, 310, 210, 34],
      [850, 310, 210, 34],
      [530, 175, 220, 34],
      [40, 205, 150, 30],
      [1090, 205, 150, 30],
    ],
    sp: [
      [0, 0.5],
      [1, 0.5],
      [3, 0.5],
      [4, 0.5],
    ],
    pads: [[640, 440, 92]],
  },

  ancient_forest: {
    id: 'ancient_forest',
    name: 'Meşə Məbədi',
    style: 'forest',
    walls: true,
    pl: [
      [0, 615, 1280, 105],
      [130, 455, 230, 32],
      [920, 455, 230, 32],
      [510, 345, 260, 32],
      [270, 215, 210, 30],
      [800, 215, 210, 30],
    ],
    sp: [
      [0, 0.16],
      [0, 0.84],
      [1, 0.5],
      [2, 0.5],
    ],
    pads: [
      [320, 615, 80],
      [640, 615, 86],
      [960, 615, 80],
    ],
  },

  laser_vault: {
    id: 'laser_vault',
    name: 'Lazer Anbarı',
    style: 'vault',
    walls: true,
    pl: [
      [0, 620, 1280, 100],
      [440, 480, 400, 34],
      [260, 235, 240, 30],
      [780, 235, 240, 30],
      [530, 145, 220, 28],
    ],
    sp: [
      [0, 0.15],
      [0, 0.85],
      [2, 0.5],
      [3, 0.5],
    ],
    moving: [
      { x: 60, y: 365, w: 175, h: 28, dx: 0, dy: 95, speed: 0.025, phase: 0 },
      { x: 1045, y: 365, w: 175, h: 28, dx: 0, dy: 95, speed: 0.025, phase: Math.PI },
    ],
    lasers: [
      { x1: 640, y1: 175, x2: 640, y2: 480, period: 260, offset: 0, warnLen: 55, activeLen: 65 },
      { x1: 350, y1: 355, x2: 930, y2: 355, period: 300, offset: 150, warnLen: 55, activeLen: 65 },
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

  if (style === 'snow') {
    for (let i = 0; i < 150; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.7})`;
      g.fillRect(r() * ARENA_W, r() * ARENA_H * 0.7, 1.5, 1.5);
    }
    // Aurora ribbons
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

    // Moon glow
    const mg = g.createRadialGradient(960, 130, 8, 960, 130, 180);
    mg.addColorStop(0, 'rgba(226,242,255,0.9)');
    mg.addColorStop(0.25, 'rgba(180,220,255,0.3)');
    mg.addColorStop(1, 'rgba(180,220,255,0)');
    g.fillStyle = mg;
    g.fillRect(720, 0, 500, 340);

    // 3 layers of jagged snow peaks
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
      // Snow cap ridges
      g.strokeStyle = L.snowCol;
      g.lineWidth = 3;
      g.beginPath();
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
    });
  } else if (style === 'foundry') {
    // Molten glow from floor
    const vg = g.createLinearGradient(0, 480, 0, ARENA_H);
    vg.addColorStop(0, 'rgba(255,100,20,0)');
    vg.addColorStop(1, 'rgba(255,95,20,0.34)');
    g.fillStyle = vg;
    g.fillRect(0, 480, ARENA_W, 240);

    // Steel structural pillars
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
    // Overhead crane rail + pipes
    for (const y of [75, 195]) {
      const pg = g.createLinearGradient(0, y, 0, y + 24);
      pg.addColorStop(0, '#4b505c');
      pg.addColorStop(0.5, '#2b2f38');
      pg.addColorStop(1, '#14161b');
      g.fillStyle = pg;
      g.fillRect(0, y, ARENA_W, 22);
    }
    // Giant gears silhouettes
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
    // Cyber sun
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

    // Skyline 2 depth layers
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

    // Craggy cavern columns + glowing magma veins
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
    // Stalactites
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
    // Twilight moon & fortress arches
    const mg = g.createRadialGradient(640, 150, 8, 640, 150, 210);
    mg.addColorStop(0, 'rgba(255,235,195,0.45)');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mg;
    g.fillRect(400, 0, 480, 380);

    // Battlements silhouette
    g.fillStyle = '#151822';
    g.fillRect(0, 430, ARENA_W, 290);
    for (let x = 0; x < ARENA_W; x += 72) {
      g.fillRect(x, 398, 44, 34);
    }
    // Archways + torch glows
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
    // Ringed planet
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
    // Docking struts
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

    // Misty distant trees & ancient temple arch
    for (let i = 0; i < 16; i++) {
      const tx = i * 92 + r() * 25;
      const tw = 24 + r() * 28;
      g.fillStyle = i % 2 === 0 ? 'rgba(4,24,18,0.85)' : 'rgba(6,36,27,0.65)';
      g.fillRect(tx, 0, tw, ARENA_H);
    }
    // Misty foliage floor
    g.fillStyle = 'rgba(16,185,129,0.08)';
    g.fillRect(0, 480, ARENA_W, 240);
  } else if (style === 'vault') {
    // Monochrome high-security obsidian vault
    for (let x = 80; x < ARENA_W; x += 220) {
      g.fillStyle = 'rgba(255,255,255,0.03)';
      g.fillRect(x, 0, 52, ARENA_H);
      g.strokeStyle = 'rgba(255,255,255,0.08)';
      g.lineWidth = 1;
      g.strokeRect(x, 0, 52, ARENA_H);
    }
    // Tactical ceiling spotlight cones
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
    // Grid markings
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
  if (style === 'snow') {
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
    // vault: crisp monochrome brushed titanium
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
