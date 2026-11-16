import { PartyAudio } from './audio';
import { PartyEconomy } from './economy';
import { roundRectPath } from './maps';
import {
  clearReleasedActions,
  inputPlayers,
  MinigameId,
  PLAYER_COLORS,
  PLAYER_NAMES,
  pollKeyboard,
  resetInputs,
} from './types';

export interface MiniPlayer {
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  radius: number;
  angle: number;
  color: string;
  alive: boolean;
  score: number;
  roundStart: number;
  isAttacking: boolean;
  attackTimer: number;
  dashCooldown: number;
  coins: number;
  raceX: number;
  invincible: number;
  onGround: boolean;
  jumpsLeft: number;
  jh: boolean;
  highJ: boolean;
  kingTicks: number;
  throwCd: number;
  snowCd: number;
  trail: { x: number; y: number; life: number }[];
}

interface MiniParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
}

interface MiniProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: number;
  life: number;
  snow: boolean;
}

interface CoinItem {
  x: number;
  y: number;
  radius: number;
  life: number;
  diamond: boolean;
}

interface FallingMeteor {
  x: number;
  y: number;
  vy: number;
  radius: number;
  color: string;
}

interface RaceObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  warn: number;
  active: number;
  width: number;
  color: string;
}

interface LavaPlat {
  x: number;
  y: number;
  w: number;
  dx: number;
  minX: number;
  maxX: number;
}

interface MiniBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lastKicker: number;
  holder: number;
  fuse: number;
  noPick: number;
}

export interface MiniSerializedState {
  mini: MinigameId;
  gs: 'playing' | 'roundEnd' | 'matchEnd';
  cr: number;
  gt: number;
  gtm: number;
  cd: number | null;
  pl: Partial<MiniPlayer>[];
  pr: MiniProjectile[];
  ball: MiniBall | null;
  coins: CoinItem[];
  fo: FallingMeteor[];
  ro: number;
  ob: RaceObstacle[];
  rf: number;
  beams?: LaserBeam[];
  plats?: LavaPlat[];
  lavaY?: number;
  tiles?: number[];
  tc?: number;
  tr?: number;
}

export interface MiniCallbacks {
  onHudUpdate: (values: (number | string)[], count: number, round: number, maxRounds: number) => void;
  onMatchEnd: (scores: number[], winnerIndices: number[]) => void;
  onSendNet?: () => void;
}

function pointSegDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export class MinigameEngine {
  on = false;
  paused = false;
  netRole: 'host' | 'guest' | null = null;
  gameState: 'playing' | 'roundEnd' | 'matchEnd' = 'playing';
  currentMinigame: MinigameId = 'sumo';
  currentRound = 1;
  maxRounds = 3;
  playerCount = 2;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private callbacks: MiniCallbacks | null = null;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private roundTimerHandle: ReturnType<typeof setTimeout> | null = null;
  private cw = 960;
  private ch = 540;

  private players: MiniPlayer[] = [];
  private particles: MiniParticle[] = [];
  private popups: FloatingPopup[] = [];
  private projectiles: MiniProjectile[] = [];
  private ball: MiniBall | null = null;
  private coins: CoinItem[] = [];
  private fallingObjects: FallingMeteor[] = [];
  private raceOffset = 0;
  private raceObstacles: RaceObstacle[] = [];
  private raceFinishX = 0;
  private beams: LaserBeam[] = [];
  private laserSpawnTimer = 0;
  private plats: LavaPlat[] = [];
  private lavaY = 520;
  private lavaTick = 0;
  private tiles: number[] = [];
  private tileCols = 10;
  private tileRows = 6;
  private coinSpawnTimer = 0;
  private dodgeSpawnTimer = 0;
  private dodgeSpeed = 2.6;
  private gameTimer = 0;
  private gameTimerMax = 0;
  private countdownTimer = 0;
  private countdownActive = false;
  private shakeMag = 0;
  private shakeDur = 0;
  private shakeX = 0;
  private shakeY = 0;
  private hudTick = 0;
  private snowFlakes: { x: number; y: number; r: number; sp: number }[] = [];

  start(
    canvas: HTMLCanvasElement,
    minigame: MinigameId,
    pCount: number,
    rounds: number,
    netRole: 'host' | 'guest' | null,
    callbacks: MiniCallbacks
  ) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cssW = Math.max(1, canvas.clientWidth || canvas.width || 960);
    const cssH = Math.max(1, canvas.clientHeight || canvas.height || 540);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    this.cw = cssW;
    this.ch = cssH;
    this.currentMinigame = minigame;
    this.playerCount = pCount || 2;
    this.maxRounds = rounds || 3;
    this.currentRound = 1;
    this.netRole = netRole;
    this.callbacks = callbacks;
    this.paused = false;

    this.snowFlakes = Array.from({ length: 46 }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      r: 1.2 + Math.random() * 2.4,
      sp: 0.7 + Math.random() * 1.4,
    }));

    PartyEconomy.beginMatch();
    this.spawnPlayers();
    this.initMinigame();
    this.gameState = 'playing';
    this.countdownActive = true;
    this.countdownTimer = 150;
    this.emitHud();

    this.on = true;
    this.last = 0;
    this.acc = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.on = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.roundTimerHandle) {
      clearTimeout(this.roundTimerHandle);
      this.roundTimerHandle = null;
    }
  }

  restart() {
    if (this.roundTimerHandle) {
      clearTimeout(this.roundTimerHandle);
      this.roundTimerHandle = null;
    }
    PartyEconomy.beginMatch();
    this.currentRound = 1;
    this.players.forEach((p) => {
      p.score = 0;
      p.roundStart = 0;
    });
    this.startRound();
  }

  setPaused(p: boolean) {
    this.paused = p;
    if (p) resetInputs();
  }

  serialize(): MiniSerializedState {
    return {
      mini: this.currentMinigame,
      gs: this.gameState,
      cr: this.currentRound,
      gt: this.gameTimer,
      gtm: this.gameTimerMax,
      cd: this.countdownActive ? this.countdownTimer : null,
      pl: this.players.map((p) => ({
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        hp: p.hp,
        alive: p.alive,
        angle: p.angle,
        score: p.score,
        coins: p.coins,
        raceX: p.raceX,
        isAttacking: p.isAttacking,
        invincible: p.invincible,
      })),
      pr: this.projectiles,
      ball: this.ball,
      coins: this.coins,
      fo: this.fallingObjects,
      ro: this.raceOffset,
      ob: this.raceObstacles,
      rf: this.raceFinishX,
      beams: this.beams,
      plats: this.plats,
      lavaY: this.lavaY,
      tiles: this.tiles,
      tc: this.tileCols,
      tr: this.tileRows,
    };
  }

  apply(d: MiniSerializedState) {
    if (!d || !this.players.length) return;
    this.currentMinigame = d.mini;
    d.pl.forEach((st, i) => {
      if (this.players[i]) Object.assign(this.players[i], st);
    });
    this.projectiles = d.pr;
    this.ball = d.ball;
    this.coins = d.coins;
    this.fallingObjects = d.fo;
    this.raceOffset = d.ro;
    this.raceObstacles = d.ob;
    this.raceFinishX = d.rf;
    if (d.beams) this.beams = d.beams;
    if (d.plats) this.plats = d.plats;
    if (typeof d.lavaY === 'number') this.lavaY = d.lavaY;
    if (d.tiles) this.tiles = d.tiles;
    if (d.tc) this.tileCols = d.tc;
    if (d.tr) this.tileRows = d.tr;
    this.gameTimer = d.gt;
    this.gameTimerMax = d.gtm;
    this.currentRound = d.cr;
    this.countdownActive = d.cd !== null;
    if (d.cd !== null) this.countdownTimer = d.cd;
    this.emitHud();
    if (d.gs === 'matchEnd' && this.gameState !== 'matchEnd') {
      this.gameState = 'matchEnd';
      this.triggerMatchEnd();
    } else if (d.gs !== 'matchEnd') {
      this.gameState = d.gs;
    }
  }

  private emitHud() {
    const useCoins = this.currentMinigame === 'coins' || this.currentMinigame === 'paint';
    const vals = this.players.map((p) => (useCoins ? p.coins : p.score));
    this.callbacks?.onHudUpdate(vals, this.playerCount, this.currentRound, this.maxRounds);
  }

  private triggerMatchEnd() {
    const scores = this.players.map((p) => p.score);
    const maxS = Math.max(...scores, 0);
    const winners = this.players.filter((p) => p.score === maxS).map((p) => p.index);
    this.callbacks?.onMatchEnd(scores, winners);
  }

  private spawnPlayers() {
    const prevScores = this.players.map((p) => p.score);
    this.players = [];
    const cx = this.cw / 2;
    const cy = this.ch / 2;
    const spawnDist = Math.min(this.cw, this.ch) * 0.22;

    for (let i = 0; i < this.playerCount; i++) {
      const angle = (Math.PI * 2 * i) / this.playerCount - Math.PI / 2;
      const sc = prevScores[i] || 0;
      this.players.push({
        index: i,
        x: cx + Math.cos(angle) * spawnDist,
        y: cy + Math.sin(angle) * spawnDist,
        vx: 0,
        vy: 0,
        hp: 100,
        radius: 17,
        angle: Math.atan2(cy - (cy + Math.sin(angle) * spawnDist), cx - (cx + Math.cos(angle) * spawnDist)),
        color: PLAYER_COLORS[i],
        alive: true,
        score: sc,
        roundStart: sc,
        isAttacking: false,
        attackTimer: 0,
        dashCooldown: 0,
        coins: 0,
        raceX: 0,
        invincible: 0,
        onGround: true,
        jumpsLeft: 2,
        jh: false,
        highJ: false,
        kingTicks: 0,
        throwCd: 0,
        snowCd: 0,
        trail: [],
      });
    }
  }

  private initMinigame() {
    this.projectiles = [];
    this.particles = [];
    this.popups = [];
    this.coins = [];
    this.fallingObjects = [];
    this.raceObstacles = [];
    this.beams = [];
    this.plats = [];
    this.tiles = [];
    this.ball = null;
    this.coinSpawnTimer = 0;
    this.dodgeSpawnTimer = 0;
    this.laserSpawnTimer = 40;
    this.dodgeSpeed = 2.6;
    this.raceOffset = 0;
    this.lavaTick = 0;

    switch (this.currentMinigame) {
      case 'sumo':
        this.players.forEach((p) => { p.hp = 999; });
        break;
      case 'futbol':
        this.ball = { x: this.cw / 2, y: (this.ch + 44) / 2, vx: 0, vy: 0, radius: 13, lastKicker: -1, holder: -1, fuse: 0, noPick: 0 };
        this.gameTimer = 0;
        if (this.playerCount >= 2) {
          this.players[0].x = this.cw * 0.22; this.players[0].y = (this.ch + 44) / 2;
          this.players[1].x = this.cw * 0.78; this.players[1].y = (this.ch + 44) / 2;
        }
        if (this.playerCount >= 3) {
          this.players[2].x = this.cw * 0.28; this.players[2].y = this.ch * 0.34;
        }
        if (this.playerCount >= 4) {
          this.players[3].x = this.cw * 0.72; this.players[3].y = this.ch * 0.34;
        }
        break;
      case 'coins':
        this.gameTimer = 30 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p) => { p.hp = 999; p.coins = 0; });
        break;
      case 'dodge':
        this.players.forEach((p) => {
          p.x = this.cw / 2 + (p.index - (this.playerCount - 1) / 2) * 70;
          p.y = this.ch - 38;
          p.hp = 100;
          p.onGround = true;
        });
        break;
      case 'race':
        this.raceFinishX = Math.max(2400, this.cw * 2.8);
        this.raceOffset = 0;
        for (let ox = this.cw * 0.48; ox < this.raceFinishX - 180; ox += 170 + Math.random() * 190) {
          const oh = 44 + Math.random() * 44;
          this.raceObstacles.push({
            x: ox,
            y: this.ch - 22 - oh,
            w: 28 + Math.random() * 24,
            h: oh,
          });
        }
        this.players.forEach((p) => {
          p.hp = 999;
          p.raceX = 60;
          p.x = 60;
          p.y = this.ch - 48;
          p.onGround = true;
          p.jumpsLeft = 2;
        });
        break;
      case 'king':
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p) => { p.hp = 999; p.kingTicks = 0; });
        break;
      case 'bomb':
        this.players.forEach((p) => { p.hp = 100; p.throwCd = 0; });
        this.ball = { x: this.cw / 2, y: this.ch / 2, vx: 0, vy: 0, radius: 13, lastKicker: -1, holder: -1, fuse: 6 * 60, noPick: 0 };
        break;
      case 'snow':
        this.gameTimer = 40 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p) => { p.hp = 999; p.snowCd = 0; });
        break;
      case 'laser':
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p) => { p.hp = 100; });
        break;
      case 'lava': {
        this.lavaY = this.ch + 20;
        this.lavaTick = 0;
        const cw = this.cw;
        const ch = this.ch;
        // Bottom starter ledge + staggered ascending platforms
        this.plats = [
          { x: cw * 0.14, y: ch - 46, w: cw * 0.72, dx: 0, minX: 0, maxX: cw },
          { x: cw * 0.12, y: ch - 122, w: 145, dx: 0.9, minX: 28, maxX: cw * 0.48 },
          { x: cw * 0.62, y: ch - 134, w: 145, dx: -0.9, minX: cw * 0.52, maxX: cw - 28 },
          { x: cw * 0.36, y: ch - 208, w: 160, dx: 1.1, minX: cw * 0.18, maxX: cw * 0.82 },
          { x: cw * 0.14, y: ch - 285, w: 135, dx: 0, minX: 0, maxX: cw },
          { x: cw * 0.68, y: ch - 295, w: 135, dx: 0, minX: 0, maxX: cw },
          { x: cw * 0.38, y: ch - 372, w: 155, dx: -1.25, minX: cw * 0.2, maxX: cw * 0.8 },
          { x: cw * 0.18, y: ch - 442, w: 130, dx: 0.8, minX: 30, maxX: cw * 0.48 },
          { x: cw * 0.60, y: ch - 448, w: 130, dx: -0.8, minX: cw * 0.52, maxX: cw - 30 },
        ];
        this.players.forEach((p, idx) => {
          p.hp = 999;
          p.x = cw * (0.28 + (idx / Math.max(1, this.playerCount - 1)) * 0.44);
          p.y = ch - 70;
          p.onGround = true;
          p.jumpsLeft = 2;
        });
        break;
      }
      case 'tiles': {
        this.tileCols = 10;
        this.tileRows = 6;
        // 0 = intact, 1..54 = cracking progress, >=55 = collapsed
        this.tiles = new Array(this.tileCols * this.tileRows).fill(0);
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        const deck = this.getGridBounds();
        const spawns: [number, number][] = [
          [2, 1], [7, 4], [7, 1], [2, 4],
        ];
        this.players.forEach((p, i) => {
          const [sc, sr] = spawns[i % spawns.length];
          p.hp = 999;
          p.x = deck.x + (sc + 0.5) * deck.cw;
          p.y = deck.y + (sr + 0.5) * deck.ch;
        });
        break;
      }
      case 'paint': {
        this.tileCols = 11;
        this.tileRows = 7;
        // -1 = neutral, 0..3 = player index
        this.tiles = new Array(this.tileCols * this.tileRows).fill(-1);
        this.gameTimer = 35 * 60;
        this.gameTimerMax = this.gameTimer;
        const deck = this.getGridBounds();
        const spawns: [number, number][] = [
          [1, 1], [9, 5], [9, 1], [1, 5],
        ];
        this.players.forEach((p, i) => {
          const [sc, sr] = spawns[i % spawns.length];
          p.hp = 999;
          p.coins = 1;
          p.x = deck.x + (sc + 0.5) * deck.cw;
          p.y = deck.y + (sr + 0.5) * deck.ch;
          this.tiles[sr * this.tileCols + sc] = p.index;
        });
        break;
      }
    }
  }

  private getGridBounds() {
    const padX = Math.max(38, this.cw * 0.08);
    const topY = 58;
    const botPad = 24;
    const w = this.cw - padX * 2;
    const h = this.ch - topY - botPad;
    return {
      x: padX,
      y: topY,
      w,
      h,
      cw: w / this.tileCols,
      ch: h / this.tileRows,
    };
  }

  private startRound() {
    resetInputs();
    this.gameState = 'playing';
    this.countdownActive = true;
    this.countdownTimer = 150;
    this.spawnPlayers();
    this.initMinigame();
    this.emitHud();
  }

  private endRound() {
    if (this.gameState !== 'playing') return;
    this.gameState = 'roundEnd';
    this.emitHud();
    this.roundTimerHandle = setTimeout(() => {
      if (!this.on) return;
      if (this.currentRound >= this.maxRounds) {
        this.gameState = 'matchEnd';
        this.triggerMatchEnd();
      } else {
        this.currentRound++;
        this.startRound();
      }
    }, 1850);
  }

  private spawnParticle(x: number, y: number, color: string, count: number, speed: number, life = 35) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life,
        maxLife: life,
        color,
        radius: 2 + Math.random() * 3.5,
      });
    }
  }

  private addPopup(x: number, y: number, text: string, color: string) {
    this.popups.push({ x, y, vy: -1.1, text, color, life: 45 });
  }

  private triggerShake(mag: number, dur: number) {
    if (!PartyEconomy.shakeEnabled()) return;
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeDur = Math.max(this.shakeDur, dur);
  }

  private killPlayer(p: MiniPlayer) {
    if (!p.alive) return;
    p.alive = false;
    this.spawnParticle(p.x, p.y, p.color, 24, 5.5, 42);
    this.triggerShake(7, 14);
  }

  private step() {
    if (this.countdownActive) {
      this.countdownTimer--;
      if (this.countdownTimer <= -25) this.countdownActive = false;
    }

    if (this.shakeDur > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeMag * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeMag * 2;
      this.shakeDur--;
      this.shakeMag *= 0.9;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    for (const sf of this.snowFlakes) {
      sf.y += sf.sp;
      sf.x += Math.sin(sf.y * 0.03) * 0.4;
      if (sf.y > this.ch) { sf.y = -4; sf.x = Math.random() * this.cw; }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      if (--p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pp = this.popups[i];
      pp.y += pp.vy;
      if (--pp.life <= 0) this.popups.splice(i, 1);
    }

    if (this.gameState !== 'playing' || (this.countdownActive && this.countdownTimer >= 0)) {
      return;
    }

    const isRace = this.currentMinigame === 'race';
    const isDodge = this.currentMinigame === 'dodge';
    const isLava = this.currentMinigame === 'lava';

    // Update moving lava platforms before player physics
    if (isLava) {
      for (const pl of this.plats) {
        if (pl.dx !== 0) {
          pl.x += pl.dx;
          if (pl.x < pl.minX) { pl.x = pl.minX; pl.dx = Math.abs(pl.dx); }
          if (pl.x + pl.w > pl.maxX) { pl.x = pl.maxX - pl.w; pl.dx = -Math.abs(pl.dx); }
        }
      }
    }

    if (!isRace) {
      for (const p of this.players) {
        if (!p.alive) continue;
        const inp = inputPlayers[p.index];

        if (isDodge || isLava) {
          p.vx += inp.x * (isLava ? 1.8 : 2.2);
          const wantJ = inp.jump || inp.y < -0.42;
          if (p.onGround && wantJ) {
            p.vy = isLava ? -9.8 : -8.9;
            p.onGround = false;
            p.jumpsLeft = 1;
            p.jh = true;
            p.highJ = inp.y < -0.8;
            PartyAudio.play('jump');
          } else if (isLava && !p.onGround && wantJ && p.jumpsLeft > 0 && (!p.jh || (inp.y < -0.8 && !p.highJ && p.vy > -2.5))) {
            p.vy = -8.8;
            p.jumpsLeft--;
            p.jh = true;
            if (inp.y < -0.8) p.highJ = true;
            this.spawnParticle(p.x, p.y + 18, '#ffffff', 5, 2.2, 12);
            PartyAudio.play('jump');
          }
          if (!wantJ) p.jh = false;
          if (inp.y >= -0.72) p.highJ = false;

          const prevBottom = p.y + p.radius;
          p.vy = Math.min(11, p.vy + (isLava ? 0.42 : 0.44));
          p.vx *= 0.86;
          p.x += p.vx;
          p.y += p.vy;

          if (isDodge) {
            if (p.y + p.radius >= this.ch - 20) {
              p.y = this.ch - 20 - p.radius;
              p.vy = 0;
              p.onGround = true;
              p.jumpsLeft = 2;
            }
          } else {
            p.onGround = false;
            for (const pl of this.plats) {
              if (p.x + p.radius * 0.6 > pl.x && p.x - p.radius * 0.6 < pl.x + pl.w && p.vy >= 0) {
                if (prevBottom <= pl.y + 10 && p.y + p.radius >= pl.y) {
                  p.y = pl.y - p.radius;
                  p.vy = 0;
                  p.x += pl.dx;
                  p.onGround = true;
                  p.jumpsLeft = 2;
                }
              }
            }
            if (p.y < 36) { p.y = 36; p.vy = Math.max(0, p.vy); }
          }
          p.x = Math.max(p.radius, Math.min(this.cw - p.radius, p.x));
        } else {
          p.vx += inp.x * 1.38;
          p.vy += inp.y * 1.38;
          p.vx *= 0.88;
          p.vy *= 0.88;
          p.x += p.vx;
          p.y += p.vy;
        }

        const aimX = inp.releaseAction ? inp.releaseX : inp.x;
        const aimY = inp.releaseAction ? inp.releaseY : inp.y;
        if (Math.abs(aimX) > 0.1 || Math.abs(aimY) > 0.1) {
          p.angle = Math.atan2(aimY, aimX);
        }

        if (Math.hypot(p.vx, p.vy) > 2.2) {
          p.trail.push({ x: p.x, y: p.y, life: 10 });
          if (p.trail.length > 8) p.trail.shift();
        }
        p.trail = p.trail.filter((tr) => --tr.life > 0);

        if (p.invincible > 0) p.invincible--;
        if (p.attackTimer > 0 && --p.attackTimer <= 0) p.isAttacking = false;
        if (p.dashCooldown > 0) p.dashCooldown--;

        // Boundary rules
        if (this.currentMinigame === 'sumo') {
          const cx = this.cw / 2;
          const cy = this.ch / 2;
          const ringR = Math.min(this.cw, this.ch) * 0.36;
          if (Math.hypot(p.x - cx, p.y - cy) > ringR) this.killPlayer(p);
        } else if (this.currentMinigame === 'futbol') {
          p.x = Math.max(10 + p.radius, Math.min(this.cw - 10 - p.radius, p.x));
          p.y = Math.max(52 + p.radius, Math.min(this.ch - 8 - p.radius, p.y));
        } else if (!isDodge && !isLava) {
          p.x = Math.max(p.radius, Math.min(this.cw - p.radius, p.x));
          p.y = Math.max(p.radius + 42, Math.min(this.ch - p.radius, p.y));
        }
      }
    }

    // Dash / shove mechanics
    if (['sumo', 'king', 'bomb', 'laser', 'lava', 'tiles', 'paint'].includes(this.currentMinigame)) {
      for (let i = 0; i < this.players.length; i++) {
        const p = this.players[i];
        if (!p.alive) continue;
        const inp = inputPlayers[i];
        if ((inp.action || inp.releaseAction) && p.dashCooldown <= 0) {
          const dashPow = this.currentMinigame === 'laser' ? 14.5 : this.currentMinigame === 'tiles' ? 13 : 12.2;
          p.vx += Math.cos(p.angle) * dashPow;
          if (!isLava) p.vy += Math.sin(p.angle) * dashPow;
          else p.vy -= 4.2;
          p.dashCooldown = 34;
          p.isAttacking = true;
          p.attackTimer = 12;
          if (this.currentMinigame === 'laser') p.invincible = Math.max(p.invincible, 14);
          if (this.currentMinigame === 'paint') {
            this.paintSplash(p.x, p.y, p.index);
            this.triggerShake(4, 7);
          }
          this.spawnParticle(p.x, p.y, p.color, 8, 3.6, 16);
          PartyAudio.play('jump');
        }
        for (let j = i + 1; j < this.players.length; j++) {
          const o = this.players[j];
          if (!o.alive) continue;
          const dx = o.x - p.x;
          const dy = o.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < p.radius + o.radius) {
            const ang = Math.atan2(dy, dx);
            const f1 = p.isAttacking ? 8.8 : 3.2;
            const f2 = o.isAttacking ? 8.8 : 3.2;
            o.vx += Math.cos(ang) * f1;
            o.vy += Math.sin(ang) * f1;
            p.vx -= Math.cos(ang) * f2;
            p.vy -= Math.sin(ang) * f2;
            PartyAudio.play('hit');
          }
        }
      }
    }

    // Projectiles (snow)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.x += pr.vx;
      pr.y += pr.vy;
      pr.life--;
      if (pr.x < 0 || pr.x > this.cw || pr.y < 0 || pr.y > this.ch || pr.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }
      for (const pl of this.players) {
        if (!pl.alive || pl.index === pr.owner || pl.invincible > 0) continue;
        if (Math.hypot(pl.x - pr.x, pl.y - pr.y) < pl.radius + 6) {
          const ang = Math.atan2(pl.y - pr.y, pl.x - pr.x);
          pl.vx += Math.cos(ang) * 7.8;
          pl.vy += Math.sin(ang) * 7.8;
          pl.invincible = 12;
          const ow = this.players[pr.owner];
          if (ow) {
            ow.score++;
            this.addPopup(pl.x, pl.y - 26, '+1', ow.color);
          }
          this.spawnParticle(pr.x, pr.y, '#e0f2fe', 9, 3.5, 16);
          PartyAudio.play('hit');
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }

    // Mode-specific simulation
    switch (this.currentMinigame) {
      case 'futbol': this.updateFutbol(); break;
      case 'coins': this.updateCoins(); break;
      case 'dodge': this.updateDodge(); break;
      case 'race': this.updateRace(); break;
      case 'king': this.updateKing(); break;
      case 'bomb': this.updateBomb(); break;
      case 'snow': this.updateSnow(); break;
      case 'laser': this.updateLaser(); break;
      case 'lava': this.updateLava(); break;
      case 'tiles': this.updateTiles(); break;
      case 'paint': this.updatePaint(); break;
    }

    if (['sumo', 'dodge', 'bomb', 'laser', 'lava', 'tiles'].includes(this.currentMinigame)) {
      const alive = this.players.filter((p) => p.alive);
      if (alive.length <= 1) {
        if (alive.length === 1) alive[0].score++;
        this.endRound();
      }
    }

    clearReleasedActions();
    if (++this.hudTick % 6 === 0) this.emitHud();
  }

  private updateFutbol() {
    const b = this.ball;
    if (!b) return;
    b.vx *= 0.98;
    b.vy *= 0.98;
    b.x += b.vx;
    b.y += b.vy;
    if (b.y - b.radius < 48) { b.y = 48 + b.radius; b.vy *= -0.82; }
    if (b.y + b.radius > this.ch - 6) { b.y = this.ch - 6 - b.radius; b.vy *= -0.82; }

    const goalW = 20;
    const goalH = this.ch * 0.34;
    const goalTop = (this.ch + 44) / 2 - goalH / 2;
    const goalBot = (this.ch + 44) / 2 + goalH / 2;

    if (b.x - b.radius < goalW && b.y > goalTop && b.y < goalBot) {
      this.players[1].score++;
      if (this.players[3]) this.players[3].score++;
      this.spawnParticle(b.x, b.y, '#ef4444', 28, 6, 36);
      this.addPopup(this.cw / 2, this.ch / 2 - 40, 'GOL!', '#ef4444');
      this.triggerShake(7, 12);
      PartyAudio.play('coin');
      b.x = this.cw / 2; b.y = (this.ch + 44) / 2; b.vx = 0; b.vy = 0;
      if (this.players.some((p) => p.score - p.roundStart >= 3)) this.endRound();
      return;
    }
    if (b.x + b.radius > this.cw - goalW && b.y > goalTop && b.y < goalBot) {
      this.players[0].score++;
      if (this.players[2]) this.players[2].score++;
      this.spawnParticle(b.x, b.y, '#3b82f6', 28, 6, 36);
      this.addPopup(this.cw / 2, this.ch / 2 - 40, 'GOL!', '#3b82f6');
      this.triggerShake(7, 12);
      PartyAudio.play('coin');
      b.x = this.cw / 2; b.y = (this.ch + 44) / 2; b.vx = 0; b.vy = 0;
      if (this.players.some((p) => p.score - p.roundStart >= 3)) this.endRound();
      return;
    }

    if (b.x - b.radius < goalW && (b.y < goalTop || b.y > goalBot)) { b.x = goalW + b.radius; b.vx *= -0.82; }
    if (b.x + b.radius > this.cw - goalW && (b.y < goalTop || b.y > goalBot)) { b.x = this.cw - goalW - b.radius; b.vx *= -0.82; }

    for (const p of this.players) {
      if (!p.alive) continue;
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < p.radius + b.radius) {
        const ang = Math.atan2(dy, dx);
        const inp = inputPlayers[p.index];
        const kick = inp.action || inp.releaseAction ? 11.8 : 4.8;
        b.vx = Math.cos(ang) * kick;
        b.vy = Math.sin(ang) * kick;
        b.lastKicker = p.index;
        b.x = p.x + Math.cos(ang) * (p.radius + b.radius + 1);
        b.y = p.y + Math.sin(ang) * (p.radius + b.radius + 1);
        this.spawnParticle(b.x, b.y, '#ffffff', 5, 2.5, 12);
        PartyAudio.play('hit');
      }
    }
  }

  private updateCoins() {
    this.gameTimer--;
    if (++this.coinSpawnTimer >= 50 && this.coins.length < 11) {
      this.coinSpawnTimer = 0;
      const diamond = Math.random() < 0.22;
      this.coins.push({
        x: 48 + Math.random() * (this.cw - 96),
        y: 68 + Math.random() * (this.ch - 110),
        radius: diamond ? 13 : 11,
        life: 540,
        diamond,
      });
    }
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (--c.life <= 0) {
        this.coins.splice(i, 1);
        continue;
      }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
          const val = c.diamond ? 3 : 1;
          p.coins += val;
          p.score = p.roundStart + p.coins;
          this.spawnParticle(c.x, c.y, c.diamond ? '#38bdf8' : '#fbbf24', 12, 3.8, 20);
          this.addPopup(c.x, c.y - 14, `+${val}`, c.diamond ? '#38bdf8' : '#fbbf24');
          PartyAudio.play('coin');
          this.coins.splice(i, 1);
          break;
        }
      }
    }
    if (this.gameTimer <= 0) this.endRound();
  }

  private updateDodge() {
    this.dodgeSpawnTimer++;
    this.dodgeSpeed += 0.0014;
    if (this.dodgeSpawnTimer >= Math.max(9, 36 - Math.floor(this.dodgeSpeed * 2.8))) {
      this.dodgeSpawnTimer = 0;
      this.fallingObjects.push({
        x: 26 + Math.random() * (this.cw - 52),
        y: -22,
        vy: this.dodgeSpeed + Math.random() * 1.4,
        radius: 11 + Math.random() * 11,
        color: `hsl(${Math.random() * 44}, 92%, 56%)`,
      });
    }
    for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
      const f = this.fallingObjects[i];
      f.y += f.vy;
      if (f.y > this.ch + 28) {
        this.fallingObjects.splice(i, 1);
        continue;
      }
      for (const p of this.players) {
        if (!p.alive || p.invincible > 0) continue;
        if (Math.hypot(p.x - f.x, p.y - f.y) < p.radius + f.radius) {
          p.hp -= 35;
          p.invincible = 32;
          this.spawnParticle(f.x, f.y, f.color, 12, 4.5, 20);
          this.triggerShake(5, 9);
          PartyAudio.play('hit');
          this.fallingObjects.splice(i, 1);
          if (p.hp <= 0) this.killPlayer(p);
          break;
        }
      }
    }
  }

  private updateRace() {
    let maxX = 0;
    for (const p of this.players) {
      if (!p.alive) continue;
      const inp = inputPlayers[p.index];
      const spd = Math.abs(inp.x) > 0.1 ? inp.x * (Math.abs(inp.x) > 0.55 ? 5.8 : 3.6) : 0;
      p.raceX = Math.max(0, p.raceX + spd);

      const wantJ = inp.jump || inp.y < -0.42;
      if (p.onGround && wantJ) {
        p.vy = -10.5;
        p.onGround = false;
        p.jumpsLeft = 1;
        p.jh = true;
        p.highJ = inp.y < -0.8;
        PartyAudio.play('jump');
      } else if (!p.onGround && wantJ && p.jumpsLeft > 0 && (!p.jh || (inp.y < -0.8 && !p.highJ && p.vy > -2.5))) {
        p.vy = -9.2;
        p.jumpsLeft--;
        p.jh = true;
        if (inp.y < -0.8) p.highJ = true;
        this.spawnParticle(p.x, p.y + 20, '#ffffff', 4, 2, 12);
        PartyAudio.play('jump');
      }
      if (!wantJ) p.jh = false;
      if (inp.y >= -0.72) p.highJ = false;

      const prevBottom = p.y + p.radius;
      p.vy += 0.45;
      p.y += p.vy;
      p.onGround = false;
      if (p.y + p.radius >= this.ch - 22) {
        p.y = this.ch - 22 - p.radius;
        p.vy = 0;
        p.onGround = true;
        p.jumpsLeft = 2;
      }

      for (const obs of this.raceObstacles) {
        if (p.raceX + p.radius > obs.x && p.raceX - p.radius < obs.x + obs.w && p.y + p.radius > obs.y) {
          if (p.vy >= 0 && prevBottom <= obs.y + 10) {
            p.y = obs.y - p.radius;
            p.vy = 0;
            p.onGround = true;
            p.jumpsLeft = 2;
          } else {
            p.raceX = p.raceX < obs.x + obs.w / 2 ? obs.x - p.radius : obs.x + obs.w + p.radius;
          }
        }
      }

      if (p.raceX > maxX) maxX = p.raceX;
      if (p.raceX >= this.raceFinishX) {
        p.score++;
        this.addPopup(p.x, p.y - 30, 'FİNİŞ!', '#4ade80');
        PartyAudio.play('coin');
        this.endRound();
        return;
      }
    }
    this.raceOffset = Math.max(0, maxX - this.cw * 0.34);
    for (const p of this.players) p.x = p.raceX - this.raceOffset + 60;
  }

  private updateKing() {
    this.gameTimer--;
    const cx = this.cw / 2;
    const cy = this.ch / 2;
    const zoneR = Math.min(this.cw, this.ch) * 0.2;
    let inside = -1;
    let count = 0;
    for (const p of this.players) {
      if (p.alive && Math.hypot(p.x - cx, p.y - cy) < zoneR) {
        count++;
        inside = p.index;
      }
    }
    if (count === 1) {
      const p = this.players[inside];
      if (++p.kingTicks % 24 === 0) {
        p.score++;
        this.spawnParticle(p.x, p.y - 34, '#fbbf24', 5, 2.2, 18);
        this.addPopup(p.x, p.y - 38, '+1', '#fbbf24');
        PartyAudio.play('coin');
      }
    }
    if (this.gameTimer <= 0) this.endRound();
  }

  private updateBomb() {
    const b = this.ball;
    if (!b) return;
    if (b.noPick > 0) b.noPick--;

    if (b.holder >= 0 && this.players[b.holder]?.alive) {
      const h = this.players[b.holder];
      b.x = h.x;
      b.y = h.y - h.radius - 13;
      b.fuse--;
      if (h.throwCd > 0) h.throwCd--;
      const inp = inputPlayers[h.index];
      if ((inp.action || inp.releaseAction) && h.throwCd <= 0) {
        h.throwCd = 24;
        b.holder = -1;
        b.lastKicker = h.index;
        b.noPick = 24;
        b.vx = Math.cos(h.angle) * 10;
        b.vy = Math.sin(h.angle) * 10;
        PartyAudio.play('shot');
      } else if (b.fuse <= 0) {
        this.explodeHotBomb(b.x, b.y);
      }
    } else {
      b.holder = -1;
      b.vx *= 0.94;
      b.vy *= 0.94;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 20 || b.x > this.cw - 20) { b.vx *= -0.75; b.x = Math.max(20, Math.min(this.cw - 20, b.x)); }
      if (b.y < 52 || b.y > this.ch - 20) { b.vy *= -0.75; b.y = Math.max(52, Math.min(this.ch - 20, b.y)); }
      b.fuse--;
      if (b.fuse <= 0) {
        this.explodeHotBomb(b.x, b.y);
        return;
      }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (p.index === b.lastKicker && b.noPick > 0) continue;
        if (Math.hypot(p.x - b.x, p.y - b.y) < p.radius + b.radius) {
          b.holder = p.index;
          b.lastKicker = p.index;
          b.vx = 0;
          b.vy = 0;
          this.spawnParticle(p.x, p.y - 20, '#f97316', 7, 3, 14);
          PartyAudio.play('hit');
          break;
        }
      }
    }
  }

  private explodeHotBomb(bx: number, by: number) {
    PartyAudio.play('boom');
    this.spawnParticle(bx, by, '#f97316', 32, 6.5, 32);
    this.spawnParticle(bx, by, '#fbbf24', 18, 4.5, 26);
    this.triggerShake(11, 16);
    for (const p of this.players) {
      if (!p.alive) continue;
      if (Math.hypot(p.x - bx, p.y - by) < 88) {
        p.hp = 0;
        this.killPlayer(p);
      }
    }
    if (this.ball) {
      this.ball.holder = -1;
      this.ball.lastKicker = -1;
      this.ball.fuse = 6 * 60;
      this.ball.x = this.cw / 2;
      this.ball.y = this.ch / 2;
      this.ball.vx = 0;
      this.ball.vy = 0;
    }
  }

  private updateSnow() {
    this.gameTimer--;
    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.snowCd > 0) p.snowCd--;
      const inp = inputPlayers[p.index];
      if ((inp.action || inp.releaseAction) && p.snowCd <= 0) {
        p.snowCd = 20;
        this.projectiles.push({
          x: p.x + Math.cos(p.angle) * 20,
          y: p.y - 10 + Math.sin(p.angle) * 20,
          vx: Math.cos(p.angle) * 8.8,
          vy: Math.sin(p.angle) * 8.8,
          owner: p.index,
          life: 90,
          snow: true,
        });
        PartyAudio.play('shot');
      }
    }
    if (this.gameTimer <= 0) this.endRound();
  }

  private updateLaser() {
    this.gameTimer--;
    const elapsed = (this.gameTimerMax - this.gameTimer) / 60;
    if (--this.laserSpawnTimer <= 0) {
      const interval = Math.max(38, Math.round(92 - elapsed * 1.4));
      this.laserSpawnTimer = interval;
      const mode = Math.floor(Math.random() * 3);
      let x1 = 0, y1 = 0, x2 = this.cw, y2 = this.ch;
      if (mode === 0) {
        // Horizontal laser across random Y
        const yy = 66 + Math.random() * (this.ch - 96);
        x1 = 0; y1 = yy; x2 = this.cw; y2 = yy;
      } else if (mode === 1) {
        // Vertical laser across random X
        const xx = 42 + Math.random() * (this.cw - 84);
        x1 = xx; y1 = 44; x2 = xx; y2 = this.ch;
      } else {
        // Diagonal laser through arena
        const flip = Math.random() < 0.5;
        const off = (Math.random() - 0.5) * this.cw * 0.45;
        x1 = flip ? this.cw + off : off;
        y1 = 44;
        x2 = flip ? off : this.cw + off;
        y2 = this.ch;
      }
      const cols = ['#ef4444', '#f43f5e', '#38bdf8', '#a855f7'];
      this.beams.push({
        x1, y1, x2, y2,
        warn: Math.max(36, 56 - Math.floor(elapsed * 0.6)),
        active: 22,
        width: 11,
        color: cols[Math.floor(Math.random() * cols.length)],
      });
    }

    // Bonus orb spawns
    if (++this.coinSpawnTimer >= 160 && this.coins.length < 2) {
      this.coinSpawnTimer = 0;
      this.coins.push({
        x: 60 + Math.random() * (this.cw - 120),
        y: 78 + Math.random() * (this.ch - 120),
        radius: 12,
        life: 320,
        diamond: true,
      });
    }
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (--c.life <= 0) { this.coins.splice(i, 1); continue; }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
          p.hp = Math.min(100, p.hp + 25);
          p.score++;
          this.addPopup(p.x, p.y - 24, '+25 HP', '#38bdf8');
          this.spawnParticle(c.x, c.y, '#38bdf8', 12, 3.6, 18);
          PartyAudio.play('coin');
          this.coins.splice(i, 1);
          break;
        }
      }
    }

    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      if (b.warn > 0) {
        b.warn--;
        if (b.warn === 0) {
          this.triggerShake(4, 6);
          PartyAudio.play('shot');
        }
        continue;
      }
      b.active--;
      for (const p of this.players) {
        if (!p.alive || p.invincible > 0) continue;
        if (pointSegDist(p.x, p.y, b.x1, b.y1, b.x2, b.y2) < p.radius + b.width * 0.75) {
          p.hp -= 38;
          p.invincible = 34;
          this.spawnParticle(p.x, p.y, b.color, 16, 4.5, 20);
          this.triggerShake(6, 10);
          PartyAudio.play('hit');
          if (p.hp <= 0) this.killPlayer(p);
        }
      }
      if (b.active <= 0) this.beams.splice(i, 1);
    }

    if (this.gameTimer <= 0) {
      for (const p of this.players) if (p.alive) p.score++;
      this.endRound();
    }
  }

  private updateLava() {
    this.lavaTick++;
    const rise = Math.max(0, this.lavaTick - 70);
    this.lavaY = Math.max(92, this.ch + 16 - rise * 0.23);

    if (this.lavaTick % 5 === 0) {
      this.particles.push({
        x: Math.random() * this.cw,
        y: this.lavaY + 4,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -1.8 - Math.random() * 2.2,
        life: 24,
        maxLife: 24,
        color: Math.random() < 0.5 ? '#fde047' : '#f97316',
        radius: 2 + Math.random() * 2.5,
      });
    }

    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.y + p.radius * 0.6 > this.lavaY) {
        this.spawnParticle(p.x, this.lavaY, '#f97316', 18, 5, 26);
        PartyAudio.play('boom');
        this.killPlayer(p);
      }
    }
  }

  private updateTiles() {
    this.gameTimer--;
    const deck = this.getGridBounds();
    const decaySpeed = this.gameTimer < 15 * 60 ? 2 : 1;

    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i] > 0 && this.tiles[i] < 55) {
        this.tiles[i] = Math.min(55, this.tiles[i] + decaySpeed);
        if (this.tiles[i] === 55) {
          const c = i % this.tileCols;
          const r = Math.floor(i / this.tileCols);
          this.spawnParticle(deck.x + (c + 0.5) * deck.cw, deck.y + (r + 0.5) * deck.ch, '#ef4444', 6, 2.5, 16);
        }
      }
    }

    for (const p of this.players) {
      if (!p.alive) continue;
      const col = Math.floor((p.x - deck.x) / deck.cw);
      const row = Math.floor((p.y - deck.y) / deck.ch);
      if (col < 0 || col >= this.tileCols || row < 0 || row >= this.tileRows) {
        if (!p.isAttacking) this.killPlayer(p);
        continue;
      }
      const idx = row * this.tileCols + col;
      if (this.tiles[idx] >= 55) {
        if (!p.isAttacking) this.killPlayer(p);
      } else if (this.tiles[idx] === 0) {
        this.tiles[idx] = 1;
      }
    }

    if (this.gameTimer <= 0) {
      for (const p of this.players) if (p.alive) p.score++;
      this.endRound();
    }
  }

  private paintTile(col: number, row: number, owner: number) {
    if (col < 0 || col >= this.tileCols || row < 0 || row >= this.tileRows) return;
    const idx = row * this.tileCols + col;
    if (this.tiles[idx] !== owner) {
      this.tiles[idx] = owner;
    }
  }

  private paintSplash(px: number, py: number, owner: number) {
    const deck = this.getGridBounds();
    const col = Math.floor((px - deck.x) / deck.cw);
    const row = Math.floor((py - deck.y) / deck.ch);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        this.paintTile(col + dc, row + dr, owner);
      }
    }
  }

  private updatePaint() {
    this.gameTimer--;
    const deck = this.getGridBounds();
    for (const p of this.players) {
      if (!p.alive) continue;
      p.x = Math.max(deck.x + p.radius * 0.5, Math.min(deck.x + deck.w - p.radius * 0.5, p.x));
      p.y = Math.max(deck.y + p.radius * 0.5, Math.min(deck.y + deck.h - p.radius * 0.5, p.y));
      const col = Math.floor((p.x - deck.x) / deck.cw);
      const row = Math.floor((p.y - deck.y) / deck.ch);
      this.paintTile(col, row, p.index);
    }

    const counts = [0, 0, 0, 0];
    for (const owner of this.tiles) {
      if (owner >= 0 && owner < 4) counts[owner]++;
    }
    for (const p of this.players) p.coins = counts[p.index] || 0;

    if (this.gameTimer <= 0) {
      const top = Math.max(...this.players.map((p) => p.coins), 0);
      for (const p of this.players) {
        if (p.coins === top && top > 0) p.score++;
      }
      this.endRound();
    }
  }

  private drawVectorCrown(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-size, size * 0.6);
    ctx.lineTo(-size * 1.1, -size * 0.5);
    ctx.lineTo(-size * 0.45, size * 0.05);
    ctx.lineTo(0, -size * 0.85);
    ctx.lineTo(size * 0.45, size * 0.05);
    ctx.lineTo(size * 1.1, -size * 0.5);
    ctx.lineTo(size, size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawMiniHeader(ctx: CanvasRenderingContext2D, text: string, ratio?: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(9,9,11,0.86)';
    roundRectPath(ctx, this.cw / 2 - 62, 10, 124, 26, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#f4f4f5';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.cw / 2, 23);
    if (ratio !== undefined) {
      const bw = Math.min(280, this.cw * 0.36);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(this.cw / 2 - bw / 2, 40, bw, 4);
      ctx.fillStyle = ratio > 0.25 ? '#f4f4f5' : '#ef4444';
      ctx.fillRect(this.cw / 2 - bw / 2, 40, bw * Math.max(0, Math.min(1, ratio)), 4);
    }
    ctx.restore();
  }

  private drawMap(ctx: CanvasRenderingContext2D) {
    const cw = this.cw;
    const ch = this.ch;
    const nowT = Date.now() * 0.002;

    if (this.currentMinigame === 'sumo') {
      const cx = cw / 2;
      const cy = ch / 2;
      const r = Math.min(cw, ch) * 0.36;
      const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, Math.max(cw, ch) * 0.78);
      g.addColorStop(0, '#2a1d12');
      g.addColorStop(0.55, '#130f12');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Ambient dojo lantern corners
      for (const [lx, ly] of [[42, 48], [cw - 42, 48], [42, ch - 36], [cw - 42, ch - 36]]) {
        const lg = ctx.createRadialGradient(lx, ly, 2, lx, ly, 65);
        lg.addColorStop(0, 'rgba(251,146,60,0.28)');
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(lx, ly, 65, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
      }

      // Outer wooden step
      ctx.fillStyle = '#1c1510';
      ctx.beginPath(); ctx.arc(cx, cy + 8, r + 14, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 30;
      const rg = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r);
      rg.addColorStop(0, '#6a4b29');
      rg.addColorStop(0.75, '#422c17');
      rg.addColorStop(1, '#26180c');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Sand floor rings & cross markings
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.25, cy); ctx.lineTo(cx + r * 0.25, cy);
      ctx.moveTo(cx, cy - r * 0.25); ctx.lineTo(cx, cy + r * 0.25);
      ctx.stroke();

      // Rope boundary
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 9]);
      ctx.lineDashOffset = -nowT * 14;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    } else if (this.currentMinigame === 'futbol') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, cw, ch);
      const g = ctx.createLinearGradient(0, 44, 0, ch);
      g.addColorStop(0, '#166534');
      g.addColorStop(0.5, '#15803d');
      g.addColorStop(1, '#0c4321');
      ctx.fillStyle = g;
      ctx.fillRect(0, 44, cw, ch - 44);
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      for (let x = 0; x < cw; x += 80) ctx.fillRect(x, 44, 40, ch - 44);

      // Floodlight vignette
      const vig = ctx.createRadialGradient(cw / 2, (ch + 44) / 2, cw * 0.15, cw / 2, (ch + 44) / 2, cw * 0.65);
      vig.addColorStop(0, 'rgba(255,255,255,0.06)');
      vig.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 44, cw, ch - 44);

      const top = 52;
      const bot = ch - 8;
      const midY = (top + bot) / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.48)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, top, cw - 24, bot - top);
      ctx.beginPath(); ctx.moveTo(cw / 2, top); ctx.lineTo(cw / 2, bot); ctx.stroke();
      ctx.beginPath(); ctx.arc(cw / 2, midY, 58, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(cw / 2, midY, 4, 0, Math.PI * 2); ctx.fill();

      // Penalty boxes
      ctx.strokeRect(12, midY - (bot - top) * 0.28, 72, (bot - top) * 0.56);
      ctx.strokeRect(cw - 84, midY - (bot - top) * 0.28, 72, (bot - top) * 0.56);

      const goalH = ch * 0.34;
      const goalTop = (ch + 44) / 2 - goalH / 2;
      for (const side of [0, 1]) {
        const gx = side ? cw - 20 : 0;
        const col = side ? '#ef4444' : '#3b82f6';
        ctx.fillStyle = side ? 'rgba(239,68,68,0.28)' : 'rgba(59,130,246,0.28)';
        ctx.fillRect(gx, goalTop, 20, goalH);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        for (let ny = goalTop + 10; ny < goalTop + goalH; ny += 12) {
          ctx.beginPath(); ctx.moveTo(gx, ny); ctx.lineTo(gx + 20, ny); ctx.stroke();
        }
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(gx, goalTop, 20, goalH);
      }

      const s1 = this.players[0]?.score || 0;
      const s2 = this.players[1]?.score || 0;
      this.drawMiniHeader(ctx, `${s1}  :  ${s2}`);

      if (this.ball) {
        const b = this.ball;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(b.x, b.y + b.radius + 3, b.radius * 0.95, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#18181b'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.translate(b.x, b.y);
        ctx.rotate((b.x + b.y) * 0.05);
        ctx.fillStyle = '#18181b';
        ctx.beginPath(); ctx.arc(0, 0, b.radius * 0.36, 0, Math.PI * 2); ctx.fill();
        for (let k = 0; k < 5; k++) {
          const a = (k * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * b.radius * 0.72, Math.sin(a) * b.radius * 0.72, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    } else if (this.currentMinigame === 'coins') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
      g.addColorStop(0, '#1e1b2e');
      g.addColorStop(0.6, '#111218');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 52) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke(); }
      for (let gy = 0; gy < ch; gy += 52) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke(); }

      // Rotating spotlight ring
      ctx.strokeStyle = 'rgba(251,191,36,0.16)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 14]);
      ctx.lineDashOffset = -nowT * 10;
      ctx.beginPath(); ctx.arc(cw / 2, ch / 2, Math.min(cw, ch) * 0.28, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));

      for (const c of this.coins) {
        const pulse = 1 + Math.sin(Date.now() * 0.008 + c.x) * 0.08;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = c.diamond ? '#38bdf8' : '#fbbf24';
        ctx.shadowBlur = 16;
        if (c.diamond) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -c.radius);
          ctx.lineTo(c.radius * 0.9, 0);
          ctx.lineTo(0, c.radius);
          ctx.lineTo(-c.radius * 0.9, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(0, 0, c.radius, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#09090b';
        ctx.font = '800 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.diamond ? '+3' : '+1', 0, 0.5);
        ctx.restore();
      }
    } else if (this.currentMinigame === 'dodge') {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#07080d');
      g.addColorStop(0.6, '#1a1019');
      g.addColorStop(1, '#2b1215');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Silhouette volcano ridges
      ctx.fillStyle = '#140c10';
      ctx.beginPath();
      ctx.moveTo(0, ch - 20);
      ctx.lineTo(cw * 0.18, ch - 95);
      ctx.lineTo(cw * 0.38, ch - 45);
      ctx.lineTo(cw * 0.65, ch - 125);
      ctx.lineTo(cw * 0.85, ch - 55);
      ctx.lineTo(cw, ch - 90);
      ctx.lineTo(cw, ch - 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, ch - 20, cw, 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, ch - 20, cw, 4);

      for (const f of this.fallingObjects) {
        ctx.strokeStyle = 'rgba(239,68,68,0.14)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, ch - 20); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(239,68,68,0.28)';
        ctx.beginPath(); ctx.ellipse(f.x, ch - 19, f.radius * 1.1, 4, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(249,115,22,0.5)';
        ctx.beginPath();
        ctx.moveTo(f.x - f.radius * 0.7, f.y);
        ctx.lineTo(f.x, f.y - f.radius * 3.8);
        ctx.lineTo(f.x + f.radius * 0.7, f.y);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = f.color;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath(); ctx.arc(f.x - f.radius * 0.3, f.y - f.radius * 0.3, f.radius * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    } else if (this.currentMinigame === 'race') {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#09090b');
      g.addColorStop(0.55, '#19192b');
      g.addColorStop(1, '#271e36');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Parallax cyber skyline
      const bgShift = (this.raceOffset * 0.25) % 160;
      ctx.fillStyle = '#12131f';
      for (let bx = -bgShift; bx < cw + 160; bx += 80) {
        const bh = 60 + ((Math.abs(Math.round((bx + this.raceOffset * 0.25) / 80)) * 37) % 90);
        ctx.fillRect(bx, ch - 22 - bh, 58, bh);
      }

      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, ch - 22, cw, 22);
      ctx.fillStyle = '#52525b';
      ctx.fillRect(0, ch - 22, cw, 3);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 14]);
      ctx.lineDashOffset = this.raceOffset;
      ctx.beginPath(); ctx.moveTo(0, ch - 11); ctx.lineTo(cw, ch - 11); ctx.stroke();
      ctx.setLineDash([]);

      for (const obs of this.raceObstacles) {
        const sx = obs.x - this.raceOffset;
        if (sx < -60 || sx > cw + 60) continue;
        const h = ch - 22 - obs.y;
        ctx.fillStyle = '#27272a';
        roundRectPath(ctx, sx, obs.y, obs.w, h, 3);
        ctx.fill();
        // Hazard top bar
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(sx + 2, obs.y + 2, obs.w - 4, 6);
        ctx.strokeStyle = '#e4e4e7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx, obs.y, obs.w, h);
      }

      const fsx = this.raceFinishX - this.raceOffset;
      if (fsx > -30 && fsx < cw + 30) {
        for (let y = 32; y < ch - 22; y += 12) {
          ctx.fillStyle = ((y - 32) / 12) % 2 === 0 ? '#fff' : '#111';
          ctx.fillRect(fsx, y, 7, 12);
          ctx.fillStyle = ((y - 32) / 12) % 2 === 0 ? '#111' : '#fff';
          ctx.fillRect(fsx + 7, y, 7, 12);
        }
        ctx.fillStyle = '#4ade80';
        ctx.font = '800 18px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FİNİŞ', fsx + 7, 24);
      }

      for (const p of this.players) {
        if (!p.alive) continue;
        const prog = Math.max(0, Math.min(1, p.raceX / (this.raceFinishX || 1)));
        const y = 12 + p.index * 13;
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        roundRectPath(ctx, 16, y, cw - 32, 7, 3);
        ctx.fill();
        ctx.fillStyle = p.color;
        roundRectPath(ctx, 16, y, Math.max(8, (cw - 32) * prog), 7, 3);
        ctx.fill();
      }
    } else if (this.currentMinigame === 'king') {
      const cx = cw / 2;
      const cy = ch / 2;
      const zoneR = Math.min(cw, ch) * 0.2;
      const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(cw, ch) * 0.75);
      g.addColorStop(0, '#2a2310');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Decorative arena floor pattern
      ctx.strokeStyle = 'rgba(251,191,36,0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, zoneR * 1.9, 0, Math.PI * 2); ctx.stroke();

      const holder = this.players.find((p) => p.alive && Math.hypot(p.x - cx, p.y - cy) < zoneR);
      const zc = holder ? holder.color : '#fbbf24';
      ctx.save();
      ctx.shadowColor = zc;
      ctx.shadowBlur = 28;
      ctx.fillStyle = holder ? `${holder.color}26` : 'rgba(251,191,36,0.14)';
      ctx.beginPath(); ctx.arc(cx, cy, zoneR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = zc;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.lineDashOffset = -nowT * 14;
      ctx.stroke();
      ctx.restore();

      this.drawVectorCrown(ctx, cx, cy, 20);
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'bomb') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
      g.addColorStop(0, '#261215');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Hazard border stripes
      ctx.strokeStyle = 'rgba(249,115,22,0.16)';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 48, cw - 24, ch - 60);

      if (this.ball) {
        const b = this.ball;
        if (b.fuse < 120) {
          ctx.fillStyle = `rgba(239,68,68,${0.1 + 0.06 * Math.sin(nowT * 12)})`;
          ctx.fillRect(0, 0, cw, ch);
        }
        // Blast preview circle
        ctx.strokeStyle = 'rgba(239,68,68,0.18)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(b.x, b.y, 88, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        ctx.save();
        ctx.shadowColor = b.fuse < 120 ? '#ef4444' : '#f97316';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#18181b';
        ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        ctx.strokeStyle = b.fuse < 120 ? '#ef4444' : '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 19, -Math.PI / 2, -Math.PI / 2 + Math.max(0, b.fuse / 360) * Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.max(0, Math.ceil(b.fuse / 60))}s`, b.x, b.y - 26);
      }
    } else if (this.currentMinigame === 'snow') {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#091526');
      g.addColorStop(1, '#18375a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Ambient ice ring & falling snowflakes
      ctx.strokeStyle = 'rgba(186,230,253,0.28)';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cw / 2, ch / 2, Math.min(cw, ch) * 0.32, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      for (const sf of this.snowFlakes) {
        ctx.beginPath(); ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, ch - 14, cw, 14);
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'laser') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 30, cw / 2, ch / 2, cw * 0.65);
      g.addColorStop(0, '#111827');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Cyber grid lines
      ctx.strokeStyle = 'rgba(56,189,248,0.07)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke(); }
      for (let gy = 0; gy < ch; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke(); }

      // Bonus orbs
      for (const c of this.coins) {
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radius * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Laser beams (warning & firing)
      for (const b of this.beams) {
        ctx.save();
        if (b.warn > 0) {
          const blink = b.warn < 18 ? (Math.floor(b.warn / 3) % 2 === 0 ? 0.85 : 0.25) : 0.45;
          ctx.strokeStyle = `rgba(251,191,36,${blink})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([10, 8]);
          ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 22;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.width * 1.45;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = b.width * 0.5;
          ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
        }
        ctx.restore();
      }
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'lava') {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#09090b');
      g.addColorStop(0.55, '#1d0d0d');
      g.addColorStop(1, '#45120c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Stone platforms
      for (const pl of this.plats) {
        ctx.fillStyle = '#27272a';
        roundRectPath(ctx, pl.x, pl.y, pl.w, 12, 4);
        ctx.fill();
        ctx.fillStyle = pl.dx !== 0 ? '#f59e0b' : '#71717a';
        roundRectPath(ctx, pl.x + 2, pl.y, pl.w - 4, 3.5, 2);
        ctx.fill();
      }

      // Glowing rising magma
      if (this.lavaY < ch + 10) {
        const lg = ctx.createLinearGradient(0, this.lavaY - 6, 0, ch);
        lg.addColorStop(0, '#fde047');
        lg.addColorStop(0.2, '#f97316');
        lg.addColorStop(1, '#7c2d12');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(0, ch);
        ctx.lineTo(0, this.lavaY);
        for (let lx = 0; lx <= cw; lx += 24) {
          ctx.lineTo(lx, this.lavaY + Math.sin(lx * 0.04 + nowT * 3) * 4);
        }
        ctx.lineTo(cw, ch);
        ctx.closePath();
        ctx.fill();
      }
    } else if (this.currentMinigame === 'tiles') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, cw * 0.7);
      g.addColorStop(0, '#141724');
      g.addColorStop(1, '#070709');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      const deck = this.getGridBounds();
      for (let r = 0; r < this.tileRows; r++) {
        for (let c = 0; c < this.tileCols; c++) {
          const st = this.tiles[r * this.tileCols + c] ?? 0;
          if (st >= 55) continue;
          const tx = deck.x + c * deck.cw + 3;
          const ty = deck.y + r * deck.ch + 3;
          const tw = deck.cw - 6;
          const th = deck.ch - 6;
          let fill = '#27272a';
          let stroke = '#52525b';
          if (st > 34) {
            fill = '#7f1d1d';
            stroke = '#ef4444';
          } else if (st > 0) {
            fill = '#78350f';
            stroke = '#f59e0b';
          }
          ctx.fillStyle = fill;
          roundRectPath(ctx, tx, ty, tw, th, 6);
          ctx.fill();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 2;
          ctx.stroke();

          if (st > 0) {
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(tx + tw * 0.25, ty + th * 0.25);
            ctx.lineTo(tx + tw * 0.55, ty + th * 0.52);
            ctx.lineTo(tx + tw * 0.75, ty + th * 0.78);
            ctx.stroke();
          }
        }
      }
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'paint') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, cw, ch);
      const deck = this.getGridBounds();
      ctx.fillStyle = '#18181b';
      roundRectPath(ctx, deck.x - 4, deck.y - 4, deck.w + 8, deck.h + 8, 8);
      ctx.fill();

      for (let r = 0; r < this.tileRows; r++) {
        for (let c = 0; c < this.tileCols; c++) {
          const owner = this.tiles[r * this.tileCols + c] ?? -1;
          const tx = deck.x + c * deck.cw + 2;
          const ty = deck.y + r * deck.ch + 2;
          const tw = deck.cw - 4;
          const th = deck.ch - 4;
          ctx.fillStyle = owner >= 0 ? (PLAYER_COLORS[owner] || '#3b82f6') : '#27272a';
          roundRectPath(ctx, tx, ty, tw, th, 5);
          ctx.fill();
          if (owner >= 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.16)';
            roundRectPath(ctx, tx + 2, ty + 2, tw - 4, 4, 2);
            ctx.fill();
          }
        }
      }
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    }
  }

  private drawStickman(ctx: CanvasRenderingContext2D, p: MiniPlayer) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Subtle ground drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (p.isAttacking) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 20;
    }
    if (p.trail.length > 0) {
      ctx.globalAlpha = 0.18;
      for (const tr of p.trail) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(tr.x - p.x, tr.y - p.y, 9.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const faceDir = Math.cos(p.angle) >= 0 ? 1 : -1;
    const look = PartyEconomy.look(p.index);

    // Aim direction indicator dot
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(Math.cos(p.angle) * 24, Math.sin(p.angle) * 24, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const walkPhase = Date.now() * 0.008;
    const legSwing = Math.abs(p.vx) > 0.5 || Math.abs(p.vy) > 0.5 ? Math.sin(walkPhase) * 6 : 0;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 4.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-1.5, 8); ctx.lineTo(-5 + legSwing, 22);
    ctx.moveTo(1.5, 8); ctx.lineTo(5 - legSwing, 22);
    ctx.stroke();

    // Torso
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(-4, -11); ctx.lineTo(4, -11); ctx.lineTo(2.5, 8); ctx.lineTo(-2.5, 8);
    ctx.closePath();
    ctx.fill();
    PartyEconomy.drawOutfit(ctx, look.outfit, 0, 8, 0, -11, 8);

    // Helmet
    const headGlow = ctx.createLinearGradient(-8, -29, 8, -12);
    headGlow.addColorStop(0, '#ffffff');
    headGlow.addColorStop(0.24, p.color);
    headGlow.addColorStop(1, '#091326');
    ctx.beginPath();
    ctx.ellipse(0, -20, 9.2, 9.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = headGlow;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(3,9,23,0.92)';
    ctx.beginPath();
    ctx.ellipse(faceDir * 0.7, -20.2, 7.4, 4.6, faceDir * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c5f7ff';
    for (const ex of [-2.6, 2.1]) {
      ctx.fillRect(ex - 0.8, -21, 2.2, 1.5);
    }

    PartyEconomy.drawHeadgear(ctx, look, 0, -20, 1, faceDir);

    // Name tag + HP
    const ext = PartyEconomy.headTop(look, 10);
    const barY = -22 - ext - 10;
    if (p.hp <= 100) {
      const ratio = Math.max(0, Math.min(1, p.hp / 100));
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(-16, barY, 32, 4);
      ctx.fillStyle = ratio > 0.4 ? '#4ade80' : '#f87171';
      ctx.fillRect(-16, barY, 32 * ratio, 4);
    }
    ctx.fillStyle = '#f4f4f5';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(PLAYER_NAMES[p.index] || `P${p.index + 1}`, 0, barY - 5);

    ctx.restore();
  }

  private draw() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const cw = this.cw;
    const ch = this.ch;
    const dpr = this.canvas.width / (cw || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);
    this.drawMap(ctx);

    for (const pr of this.projectiles) {
      ctx.save();
      ctx.shadowColor = '#bae6fd';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.invincible > 0 && Math.floor(p.invincible / 3) % 2 === 0) continue;
      this.drawStickman(ctx, p);
    }

    for (const pt of this.particles) {
      const a = pt.life / pt.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const pp of this.popups) {
      ctx.globalAlpha = Math.min(1, pp.life / 18);
      ctx.fillStyle = pp.color;
      ctx.font = '800 15px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.fillStyle = 'rgba(244,244,245,0.55)';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Raund ${this.currentRound}/${this.maxRounds}`, cw / 2, ch - 8);

    if (this.countdownActive) {
      const sec = Math.ceil(this.countdownTimer / 60);
      const text = sec > 0 ? String(sec) : 'BAŞLA!';
      ctx.fillStyle = 'rgba(9,9,11,0.38)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = sec > 0 ? '#ffffff' : '#4ade80';
      ctx.font = '800 78px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cw / 2, ch / 2);
      ctx.textBaseline = 'alphabetic';
    }

    if (this.gameState === 'roundEnd') {
      ctx.fillStyle = 'rgba(9,9,11,0.55)';
      ctx.fillRect(0, 0, cw, ch);
      const alive = this.players.filter((p) => p.alive);
      ctx.font = '800 48px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (alive.length === 1 && !['coins', 'paint', 'king', 'snow'].includes(this.currentMinigame)) {
        ctx.fillStyle = alive[0].color;
        ctx.fillText(`${PLAYER_NAMES[alive[0].index] || `P${alive[0].index + 1}`} Qazandı!`, cw / 2, ch / 2);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Raund Bitdi!', cw / 2, ch / 2);
      }
      ctx.textBaseline = 'alphabetic';
    }
  }

  private loop = (now: number) => {
    if (!this.on || !this.canvas) return;
    this.raf = requestAnimationFrame(this.loop);

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cssW = Math.max(1, this.canvas.clientWidth || 960);
    const cssH = Math.max(1, this.canvas.clientHeight || 540);
    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetH || this.cw !== cssW || this.ch !== cssH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
      this.cw = cssW;
      this.ch = cssH;
    }

    pollKeyboard(this.netRole !== null);
    if (this.paused) {
      this.acc = 0;
      return;
    }

    if (!this.last) this.last = now;
    this.acc += now - this.last;
    this.last = now;
    const STEP = 1000 / 60;
    let n = 0;
    if (this.netRole !== 'guest') {
      while (this.acc >= STEP && n < 4) {
        this.step();
        this.acc -= STEP;
        n++;
      }
    } else {
      this.acc = 0;
    }
    if (this.acc > STEP * 4) this.acc = 0;

    this.draw();
    if (this.netRole && this.callbacks?.onSendNet) {
      this.callbacks.onSendNet();
    }
  };
}

export const minigameEngine = new MinigameEngine();
