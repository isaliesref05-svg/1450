/**
 * ============================================================
 *  STICKMAN PARTY - Complete Game Engine
 *  Supports 2-4 local players + 2 player online (PeerJS)
 * ============================================================
 */

// ─────────────────────────────────────────────
//  GLOBAL STATE
// ─────────────────────────────────────────────
let gameState = 'menu'; // 'menu','playing','roundEnd','matchEnd'
let currentMode = 'vs'; // 'vs' or 'minigame'
let currentMap = 'arena';
let currentMinigame = 'sumo';
let playerCount = 2;
let maxRounds = 3;
let currentRound = 1;
let players = [];
let gameTimer = 0;
let gameTimerMax = 0;
let countdownTimer = 0;
let countdownActive = false;
let paused = false;
let animFrameId = null;
let roundTimeout = null;
let lastTime = 0;
let deltaTime = 0;

// Canvas & context
let canvas, ctx, cw, ch;

// Screen shake
let shakeX = 0, shakeY = 0, shakeMagnitude = 0, shakeDuration = 0;

// Particles
let particles = [];

// Projectiles (bullets, bombs)
let projectiles = [];

// Minigame-specific objects
let ball = null;           // Futbol ball
let coins = [];            // Coin Grab coins
let fallingObjects = [];   // Dodge objects
let raceOffset = 0;        // Race scroll offset
let raceObstacles = [];    // Race obstacles
let raceFinishX = 0;       // Race finish line position
let coinSpawnTimer = 0;
let dodgeSpawnTimer = 0;
let dodgeSpeed = 2;
let lavaRadius = 0;        // Lava safe zone radius
let lavaTimer = 0;

// Castle walls
let castleWalls = [];

// Platform map platforms
let platforms = [];

// Player colors
const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const PLAYER_NAMES = ['P1', 'P2', 'P3', 'P4'];

const PARTY_SAVE_KEY = 'stickparty.profile.v1';
const MATCH_BASE_REWARD = 120;
const MATCH_WIN_BONUS = 80;
const SHOP_ITEMS = [
  { id: 'classic', name: 'Klassik', desc: 'Təmiz başlanğıc dəsti', category: 'outfit', price: 0, body: '#e2e8f0', accent: '#94a3b8', pattern: 'plain' },
  { id: 'neon', name: 'Neon jilet', desc: 'Parlaq siberpunk kəsim', category: 'outfit', price: 300, body: '#22d3ee', accent: '#ff4fd8', pattern: 'vest', glow: '#22d3ee' },
  { id: 'stripe', name: 'Zolaqlı forma', desc: 'Sürətli xətlər, canlı rəng', category: 'outfit', price: 450, body: '#b6f34a', accent: '#0b1220', pattern: 'stripes' },
  { id: 'royal', name: 'Kral libası', desc: 'Qızıl haşiyəli parça', category: 'outfit', price: 550, body: '#8b5cf6', accent: '#ffc83d', pattern: 'vest', glow: '#8b5cf6' },
  { id: 'frost', name: 'Buz zirehi', desc: 'Soyuq parıltılı qat', category: 'outfit', price: 500, body: '#9df', accent: '#e8fbff', pattern: 'stripes', glow: '#9df' },
  { id: 'lava', name: 'Lava zirehi', desc: 'İsti maqma naxışı', category: 'outfit', price: 650, body: '#ff5a1f', accent: '#ffd54a', pattern: 'vest', glow: '#ff5a1f' },
  { id: 'crown', name: 'Qızıl tac', desc: 'Liderin simvolu', category: 'accessory', price: 250, kind: 'crown', accent: '#ffd54a' },
  { id: 'cap', name: 'Neon papaq', desc: 'Küncə stil', category: 'accessory', price: 180, kind: 'cap', accent: '#ff4fd8' },
  { id: 'shades', name: 'Gecə eynəyi', desc: 'Sərin baxış', category: 'accessory', price: 220, kind: 'shades', accent: '#22d3ee' },
  { id: 'halo', name: 'Mələk halqası', desc: 'Baş üstündə işıq', category: 'accessory', price: 400, kind: 'halo', accent: '#ffe9a8' },
  { id: 'horns', name: 'İblis buynuzu', desc: 'Kəskin siluet', category: 'accessory', price: 350, kind: 'horns', accent: '#ef4444' },
  { id: 'phones', name: 'DJ qulaqlığı', desc: 'Döyüşə ritm qat', category: 'accessory', price: 300, kind: 'phones', accent: '#2dd4ff' },
  { id: 'beanie', name: 'Toxuma papaq', desc: 'İsti küçə stili', category: 'accessory', price: 200, kind: 'beanie', accent: '#10b981' },
  { id: 'cowboy', name: 'Kovboy şlyapası', desc: 'Vəhşi qərb havası', category: 'accessory', price: 320, kind: 'cowboy', accent: '#c98a3d' },
  { id: 'wizard', name: 'Sehrbaz papağı', desc: 'Ulduzlu maqma', category: 'accessory', price: 420, kind: 'wizard', accent: '#8b5cf6' },
  { id: 'viking', name: 'Viking dəbilqəsi', desc: 'Buynuzlu döyüşçü', category: 'accessory', price: 460, kind: 'viking', accent: '#cbd5e1' },
  { id: 'pirate', name: 'Quldur papağı', desc: 'Kəllə nişanlı üçkünclü', category: 'accessory', price: 380, kind: 'pirate', accent: '#1f2937' },
  { id: 'helmet', name: 'Döyüş dəbilqəsi', desc: 'Zirehli qoruma', category: 'accessory', price: 340, kind: 'helmet', accent: '#22d3ee' },
  { id: 'tophat', name: 'Silindr', desc: 'Klassik centlmen', category: 'accessory', price: 280, kind: 'tophat', accent: '#0b1220' },
  { id: 'mask', name: 'Ninja maskası', desc: 'Gizli döyüşçü', category: 'accessory', price: 300, kind: 'mask', accent: '#ef4444' },
  { id: 'scarf', name: 'Qəhrəman şərfi', desc: 'Küləkdə dalğalanır', category: 'accessory', price: 260, kind: 'scarf', accent: '#ff4fd8' },
  { id: 'wings', name: 'Mələk qanadları', desc: 'Arxanda parıltı', category: 'accessory', price: 600, kind: 'wings', accent: '#e8fbff' },
  { id: 'bowtie', name: 'Kəpənək qalstuk', desc: 'Zərif detal', category: 'accessory', price: 180, kind: 'bowtie', accent: '#ffc83d' },
  { id: 'eyepatch', name: 'Göz bağı', desc: 'Sərt quldur baxışı', category: 'accessory', price: 220, kind: 'eyepatch', accent: '#0b1220' },
  { id: 'gold', name: 'Qızıl zireh', desc: 'Çempionun parıltısı', category: 'outfit', price: 800, body: '#ffc83d', accent: '#fff3c4', pattern: 'vest', glow: '#ffc83d' },
  { id: 'cyber', name: 'Kiber kostyum', desc: 'Rəqəmsal döyüş xətləri', category: 'outfit', price: 700, body: '#0b1220', accent: '#2dd4ff', pattern: 'stripes', glow: '#2dd4ff' },
  { id: 'knight', name: 'Cəngavər zirehi', desc: 'Polad qatlı müdafiə', category: 'outfit', price: 620, body: '#94a3b8', accent: '#e2e8f0', pattern: 'vest', glow: '#cbd5e1' },
  { id: 'rainbow', name: 'Göy qurşağı', desc: 'Yeddi rəngli enerji', category: 'outfit', price: 750, body: '#ff4fd8', accent: '#2dd4ff', pattern: 'rainbow', glow: '#ff4fd8' },
  { id: 'shadow', name: 'Kölgə libası', desc: 'Qaranlıq suiqəstçi', category: 'outfit', price: 580, body: '#1e1b4b', accent: '#8b5cf6', pattern: 'plain', glow: '#8b5cf6' }
];

const PartyEconomy = (() => {
  const byId = id => SHOP_ITEMS.find(i => i.id === id);
  const defaultEquipped = () => ({ 0: { outfit: 'classic', accessory: null }, 1: { outfit: 'classic', accessory: null }, 2: { outfit: 'classic', accessory: null }, 3: { outfit: 'classic', accessory: null } });
  function normalize(p) {
    const prof = { coins: 0, name: '', owned: ['classic'], equipped: defaultEquipped(), muted: false, matches: 0 };
    if (p && typeof p === 'object') {
      if (Number.isFinite(p.coins)) prof.coins = Math.max(0, Math.floor(p.coins));
      if (typeof p.name === 'string') prof.name = p.name.trim().slice(0, 14);
      if (Array.isArray(p.owned)) prof.owned = [...new Set(p.owned.filter(id => byId(id)))];
      if (!prof.owned.includes('classic')) prof.owned.push('classic');
      if (p.equipped && typeof p.equipped === 'object') {
        for (let i = 0; i < 4; i++) {
          const e = p.equipped[i];
          if (!e) continue;
          const outfit = byId(e.outfit);
          const accessory = byId(e.accessory);
          prof.equipped[i].outfit = outfit && outfit.category === 'outfit' && prof.owned.includes(outfit.id) ? outfit.id : 'classic';
          prof.equipped[i].accessory = accessory && accessory.category === 'accessory' && prof.owned.includes(accessory.id) ? accessory.id : null;
        }
      }
      prof.muted = !!p.muted;
      prof.matches = Number.isFinite(p.matches) ? p.matches : 0;
    }
    return prof;
  }
  let profile = normalize(null);
  try {
    const raw = localStorage.getItem(PARTY_SAVE_KEY);
    if (raw) profile = normalize(JSON.parse(raw));
  } catch (e) {}
  PLAYER_NAMES[0] = profile.name || 'P1';
  let matchActive = false;
  function save() { try { localStorage.setItem(PARTY_SAVE_KEY, JSON.stringify(profile)); } catch (e) {} }
  return {
    coins: () => profile.coins,
    name: () => profile.name,
    setName(n) {
      const v = String(n || '').trim().slice(0, 14);
      if (!v) return false;
      profile.name = v; save();
      PLAYER_NAMES[0] = v;
      if (window.refreshNameUI) window.refreshNameUI();
      return true;
    },
    matches: () => profile.matches,
    isMuted: () => profile.muted,
    setMuted(v) { profile.muted = !!v; save(); },
    owned: id => profile.owned.includes(id),
    equippedId: (i, cat) => profile.equipped[i] ? profile.equipped[i][cat] : (cat === 'outfit' ? 'classic' : null),
    look(i) {
      const e = profile.equipped[i] || profile.equipped[0];
      return { outfit: byId(e.outfit) || byId('classic'), accessory: e.accessory ? byId(e.accessory) : null };
    },
    beginMatch() { matchActive = true; },
    awardMatch(bonus) {
      if (!matchActive) return null;
      matchActive = false;
      const total = MATCH_BASE_REWARD + (bonus || 0);
      profile.coins += total;
      profile.matches++;
      save();
      refreshWalletUI(true);
      toast('+' + total + ' coin qazandın!', 'coin');
      PartyAudio.play('coin');
      return { base: MATCH_BASE_REWARD, bonus: bonus || 0, total, coins: profile.coins };
    },
    buy(id) {
      const item = byId(id);
      if (!item || profile.owned.includes(id)) return false;
      if (profile.coins < item.price) return false;
      profile.coins -= item.price;
      profile.owned.push(id);
      save();
      refreshWalletUI(true);
      return true;
    },
    equip(id, i) {
      const item = byId(id);
      if (!item || !profile.owned.includes(id) || !profile.equipped[i]) return false;
      profile.equipped[i][item.category] = id;
      save();
      return true;
    },
    unequip(cat, i) {
      if (!profile.equipped[i]) return;
      profile.equipped[i][cat] = cat === 'outfit' ? 'classic' : null;
      save();
    },
    drawAccessory(g, kind, x, y, s, d) {
      g.save();
      g.translate(x, y);
      g.scale(s, s);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      if (kind === 'crown') {
        g.fillStyle = '#ffd54a';
        g.beginPath();
        g.moveTo(-7, -9); g.lineTo(-7, -17); g.lineTo(-3, -12); g.lineTo(0, -18); g.lineTo(3, -12); g.lineTo(7, -17); g.lineTo(7, -9);
        g.closePath(); g.fill();
        g.fillStyle = '#ff4fd8'; g.beginPath(); g.arc(0, -12, 1.6, 0, 6.3); g.fill();
      } else if (kind === 'cap') {
        g.fillStyle = '#ff4fd8';
        g.beginPath(); g.arc(0, -8, 9, Math.PI, 0); g.closePath(); g.fill();
        g.fillStyle = '#22d3ee';
        g.fillRect(d > 0 ? 0 : -14, -9, 14, 3);
      } else if (kind === 'shades') {
        g.fillStyle = '#0b1220';
        g.fillRect(-8, -4, 16, 5);
        g.fillStyle = '#22d3ee';
        g.fillRect(-6.5, -3, 5, 3);
        g.fillRect(1.5, -3, 5, 3);
      } else if (kind === 'halo') {
        g.strokeStyle = '#ffe9a8';
        g.lineWidth = 2.4;
        g.shadowColor = '#ffc83d';
        g.shadowBlur = 10;
        g.beginPath(); g.ellipse(0, -17, 10, 3, 0, 0, 6.3); g.stroke();
      } else if (kind === 'horns') {
        g.fillStyle = '#ef4444';
        g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(-11, -14, -8, -19); g.lineTo(-3, -10); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(6, -8); g.quadraticCurveTo(11, -14, 8, -19); g.lineTo(3, -10); g.closePath(); g.fill();
      } else if (kind === 'phones') {
        g.strokeStyle = '#2dd4ff';
        g.lineWidth = 2.6;
        g.beginPath(); g.arc(0, -6, 10, Math.PI, 0); g.stroke();
        g.fillStyle = '#2dd4ff';
        g.fillRect(-11, -6, 4, 8);
        g.fillRect(7, -6, 4, 8);
      } else if (kind === 'beanie') {
        g.fillStyle = '#10b981';
        g.beginPath(); g.arc(0, -8, 9.5, Math.PI, 0); g.closePath(); g.fill();
        g.fillStyle = '#0b1220'; g.fillRect(-9.5, -9, 19, 3.4);
        g.fillStyle = '#b6f34a'; g.beginPath(); g.arc(0, -18, 2.6, 0, 6.3); g.fill();
      } else if (kind === 'cowboy') {
        g.fillStyle = '#c98a3d';
        g.beginPath(); g.ellipse(0, -9, 15, 4, 0, 0, 6.3); g.fill();
        g.beginPath(); g.moveTo(-7, -9); g.quadraticCurveTo(-6, -20, 0, -19); g.quadraticCurveTo(6, -20, 7, -9); g.closePath(); g.fill();
        g.fillStyle = '#7c4a12'; g.fillRect(-7, -11, 14, 2.6);
      } else if (kind === 'wizard') {
        g.fillStyle = '#8b5cf6';
        g.beginPath(); g.moveTo(-9, -8); g.lineTo(0, -26); g.lineTo(9, -8); g.closePath(); g.fill();
        g.fillStyle = '#6d28d9'; g.beginPath(); g.ellipse(0, -8, 12, 3, 0, 0, 6.3); g.fill();
        g.fillStyle = '#ffd54a'; g.beginPath(); g.arc(1, -16, 1.5, 0, 6.3); g.fill();
        g.beginPath(); g.arc(-3, -11, 1.1, 0, 6.3); g.fill();
      } else if (kind === 'viking') {
        g.fillStyle = '#cbd5e1';
        g.beginPath(); g.arc(0, -8, 9.5, Math.PI, 0); g.closePath(); g.fill();
        g.fillStyle = '#94a3b8'; g.fillRect(-9.5, -9, 19, 3);
        g.fillStyle = '#f8fafc';
        g.beginPath(); g.moveTo(-8, -10); g.quadraticCurveTo(-15, -16, -12, -22); g.quadraticCurveTo(-9, -16, -5, -12); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(8, -10); g.quadraticCurveTo(15, -16, 12, -22); g.quadraticCurveTo(9, -16, 5, -12); g.closePath(); g.fill();
      } else if (kind === 'pirate') {
        g.fillStyle = '#1f2937';
        g.beginPath(); g.moveTo(-13, -8); g.quadraticCurveTo(0, -22, 13, -8); g.quadraticCurveTo(0, -13, -13, -8); g.closePath(); g.fill();
        g.fillStyle = '#f8fafc'; g.beginPath(); g.arc(0, -13, 2.4, 0, 6.3); g.fill();
        g.fillStyle = '#1f2937'; g.fillRect(-1.6, -12, 1, 1); g.fillRect(0.7, -12, 1, 1);
      } else if (kind === 'helmet') {
        g.fillStyle = '#22d3ee';
        g.beginPath(); g.arc(0, -7, 10, Math.PI, 0); g.closePath(); g.fill();
        g.fillStyle = '#0b1220'; g.fillRect(-10, -8, 20, 3);
        g.fillStyle = '#67e8f9'; g.fillRect(-1.6, -17, 3.2, 9);
      } else if (kind === 'tophat') {
        g.fillStyle = '#0b1220';
        g.beginPath(); g.ellipse(0, -9, 12, 3, 0, 0, 6.3); g.fill();
        g.fillRect(-7, -25, 14, 16);
        g.fillStyle = '#ff4fd8'; g.fillRect(-7, -13, 14, 3);
      } else if (kind === 'mask') {
        g.fillStyle = '#ef4444';
        g.fillRect(-9, -3, 18, 6);
        g.fillStyle = '#0b1220';
        g.fillRect(-6, -1.5, 4, 2.4); g.fillRect(2, -1.5, 4, 2.4);
        g.fillStyle = '#ef4444';
        g.beginPath(); g.moveTo(d > 0 ? -9 : 9, -1); g.lineTo(d > 0 ? -16 : 16, 3); g.lineTo(d > 0 ? -9 : 9, 4); g.closePath(); g.fill();
      } else if (kind === 'scarf') {
        g.fillStyle = '#ff4fd8';
        g.fillRect(-8, 5, 16, 4);
        g.beginPath(); g.moveTo(d > 0 ? -6 : 6, 7); g.quadraticCurveTo(d > 0 ? -16 : 16, 12, d > 0 ? -12 : 12, 20); g.lineTo(d > 0 ? -7 : 7, 18); g.quadraticCurveTo(d > 0 ? -10 : 10, 11, d > 0 ? -2 : 2, 8); g.closePath(); g.fill();
      } else if (kind === 'wings') {
        g.fillStyle = 'rgba(232,251,255,0.9)';
        g.shadowColor = '#9df'; g.shadowBlur = 10;
        g.beginPath(); g.moveTo(-4, 2); g.quadraticCurveTo(-20, -6, -16, 12); g.quadraticCurveTo(-10, 8, -4, 8); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(4, 2); g.quadraticCurveTo(20, -6, 16, 12); g.quadraticCurveTo(10, 8, 4, 8); g.closePath(); g.fill();
        g.shadowBlur = 0;
      } else if (kind === 'bowtie') {
        g.fillStyle = '#ffc83d';
        g.beginPath(); g.moveTo(0, 7); g.lineTo(-7, 3); g.lineTo(-7, 11); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(0, 7); g.lineTo(7, 3); g.lineTo(7, 11); g.closePath(); g.fill();
        g.fillStyle = '#ff4fd8'; g.beginPath(); g.arc(0, 7, 1.8, 0, 6.3); g.fill();
      } else if (kind === 'eyepatch') {
        g.strokeStyle = '#0b1220'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(-9, -5); g.lineTo(9, -3); g.stroke();
        g.fillStyle = '#0b1220';
        g.beginPath(); g.ellipse(d > 0 ? 4 : -4, -2, 3.4, 3, 0, 0, 6.3); g.fill();
      }
      g.restore();
    },
    drawOutfit(g, item, x0, y0, x1, y1, width) {
      if (!item || item.id === 'classic') return;
      g.save();
      g.lineCap = 'round';
      g.strokeStyle = item.body;
      g.lineWidth = width;
      if (item.glow) { g.shadowColor = item.glow; g.shadowBlur = 12; }
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.shadowBlur = 0;
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      if (item.pattern === 'stripes') {
        g.strokeStyle = item.accent;
        g.lineWidth = Math.max(1.6, width * .28);
        for (let k = -1; k <= 1; k++) {
          const yy = my + k * width * .9;
          g.beginPath(); g.moveTo(mx - width * .55, yy); g.lineTo(mx + width * .55, yy - 1); g.stroke();
        }
      } else if (item.pattern === 'rainbow') {
        const cols = ['#ef4444', '#f59e0b', '#b6f34a', '#2dd4ff', '#8b5cf6', '#ff4fd8'];
        g.lineWidth = Math.max(1.4, width * .2);
        cols.forEach((c, k) => {
          const yy = my + (k - 2.5) * width * .42;
          g.strokeStyle = c;
          g.beginPath(); g.moveTo(mx - width * .55, yy); g.lineTo(mx + width * .55, yy); g.stroke();
        });
      } else if (item.pattern === 'vest') {
        g.fillStyle = item.accent;
        g.beginPath();
        g.moveTo(x1 - width * .5, y1 + 2);
        g.lineTo(x1 + width * .5, y1 + 2);
        g.lineTo(x0 + width * .35, y0 - 2);
        g.lineTo(x0 - width * .35, y0 - 2);
        g.closePath(); g.fill();
      }
      g.restore();
    }
  };
})();
window.PartyEconomy = PartyEconomy;

const PartyAudio = (() => {
  let ac = null, noiseBuf = null, lastShot = 0, lastHit = 0;
  function ensure() {
    if (!ac) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        noiseBuf = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  }
  document.addEventListener('pointerdown', ensure);
  document.addEventListener('keydown', ensure);
  document.addEventListener('touchstart', ensure, { passive: true });
  function env(g, t0, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  function tone(freq, dur, type, peak, slide) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, ac.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, ac.currentTime + dur);
    env(g, ac.currentTime, .008, peak, dur);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + dur + .02);
  }
  function noise(dur, peak, freq) {
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, ac.currentTime);
    f.frequency.exponentialRampToValueAtTime(120, ac.currentTime + dur);
    env(g, ac.currentTime, .005, peak, dur);
    s.connect(f).connect(g).connect(ac.destination);
    s.start(); s.stop(ac.currentTime + dur + .02);
  }
  return {
    ensure,
    play(name) {
      if (PartyEconomy.isMuted()) return;
      ensure();
      if (!ac || ac.state !== 'running') return;
      const now = performance.now();
      if (name === 'shot') {
        if (now - lastShot < 70) return;
        lastShot = now;
        noise(.09, .12, 2400);
        tone(320, .07, 'square', .05, 120);
      } else if (name === 'boom') {
        noise(.45, .35, 900);
        tone(90, .4, 'sine', .25, 40);
      } else if (name === 'hit') {
        if (now - lastHit < 90) return;
        lastHit = now;
        tone(180, .08, 'triangle', .1, 90);
      } else if (name === 'coin') {
        tone(880, .12, 'sine', .14);
        setTimeout(() => { if (!PartyEconomy.isMuted() && ac && ac.state === 'running') tone(1320, .18, 'sine', .14); }, 90);
      } else if (name === 'buy') {
        tone(520, .1, 'triangle', .12);
        setTimeout(() => { if (!PartyEconomy.isMuted() && ac && ac.state === 'running') tone(780, .16, 'triangle', .12); }, 80);
      } else if (name === 'error') {
        tone(140, .16, 'sawtooth', .08, 90);
      }
    },
    toggle() {
      const muted = !PartyEconomy.isMuted();
      PartyEconomy.setMuted(muted);
      refreshSoundUI();
      if (!muted) { ensure(); this.play('buy'); }
      toast(muted ? 'Səs bağlandı' : 'Səs açıldı');
    }
  };
})();
window.PartyAudio = PartyAudio;

function toast(msg, type) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3100);
}

function refreshWalletUI(bump) {
  const coins = PartyEconomy.coins();
  document.querySelectorAll('[data-coin-balance]').forEach(el => { el.textContent = coins; });
  if (bump) {
    document.querySelectorAll('.coin-pill').forEach(el => {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    });
  }
}

function refreshSoundUI() {
  const muted = PartyEconomy.isMuted();
  document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
    btn.classList.toggle('muted', muted);
    btn.setAttribute('aria-pressed', String(muted));
    btn.title = muted ? 'Səsi aç' : 'Səsi bağla';
  });
}

function refreshNameUI() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('labelP' + (i + 1));
    if (el) el.textContent = PLAYER_NAMES[i] || ('P' + (i + 1));
    const tag = document.getElementById('nameTagP' + (i + 1));
    if (tag) tag.textContent = PLAYER_NAMES[i] || ('P' + (i + 1));
  }
  const greet = document.getElementById('menuPlayerName');
  if (greet) greet.textContent = PartyEconomy.name() || 'Oyunçu';
  const shopName = document.getElementById('shopPreviewName');
  if (shopName && shopPlayer === 1) shopName.textContent = PLAYER_NAMES[0];
}

function openNameModal() {
  const ov = document.getElementById('nameOverlay');
  const inp = document.getElementById('nameInput');
  if (!ov || !inp) return;
  inp.value = PartyEconomy.name() || '';
  ov.classList.add('visible');
  setTimeout(() => { inp.focus(); inp.select(); }, 60);
}
function closeNameModal() {
  const ov = document.getElementById('nameOverlay');
  if (ov) ov.classList.remove('visible');
}
function confirmName() {
  const inp = document.getElementById('nameInput');
  const v = inp ? inp.value.trim() : '';
  if (!v) {
    if (inp) { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); inp.focus(); }
    toast('Adını yaz — sonra dəyişə bilərsən', 'error');
    return;
  }
  PartyEconomy.setName(v);
  closeNameModal();
  refreshNameUI();
  PartyAudio.play('buy');
  toast('Xoş gəldin, ' + PartyEconomy.name() + '!', 'coin');
}
function initNameGate() {
  const inp = document.getElementById('nameInput');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); confirmName(); } });
  if (!PartyEconomy.name()) openNameModal();
  refreshNameUI();
}

let shopPlayer = 1, shopCategory = 'outfit', shopPreviewRaf = 0;
const HAT_KINDS = ['cap', 'beanie', 'cowboy', 'wizard', 'viking', 'pirate', 'helmet', 'tophat', 'crown'];

function itemArtSVG(item) {
  if (item.category === 'outfit') {
    const stripes = item.pattern === 'stripes'
      ? '<path d="M22 30h20M22 36h20M22 42h20" stroke="' + item.accent + '" stroke-width="3" stroke-linecap="round"/>'
      : item.pattern === 'rainbow'
        ? '<path d="M22 28h20" stroke="#ef4444" stroke-width="2.6"/><path d="M22 32h20" stroke="#f59e0b" stroke-width="2.6"/><path d="M22 36h20" stroke="#b6f34a" stroke-width="2.6"/><path d="M22 40h20" stroke="#2dd4ff" stroke-width="2.6"/><path d="M22 44h20" stroke="#8b5cf6" stroke-width="2.6"/>'
        : item.pattern === 'vest'
          ? '<path d="M28 22h8l-2 26h-4z" fill="' + item.accent + '"/>'
          : '';
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 14l-12 8 6 10 6-4v22h20V28l6 4 6-10-12-8-6 4h-8z" fill="' + item.body + '" stroke="' + item.accent + '" stroke-width="2" stroke-linejoin="round"/>' + stripes + '</svg>';
  }
  const a = item.accent;
  if (item.kind === 'crown') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 46V22l10 12 8-18 8 18 10-12v24z" fill="' + a + '" stroke="#9a5b00" stroke-width="2"/><circle cx="32" cy="38" r="3" fill="#ff4fd8"/></svg>';
  if (item.kind === 'cap') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 36a18 18 0 0 1 36 0z" fill="' + a + '"/><path d="M32 36h24v6H32z" fill="#22d3ee"/></svg>';
  if (item.kind === 'shades') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 26h48v10H8z" fill="#0b1220"/><rect x="12" y="28" width="16" height="8" rx="2" fill="' + a + '"/><rect x="36" y="28" width="16" height="8" rx="2" fill="' + a + '"/></svg>';
  if (item.kind === 'halo') return '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="30" rx="22" ry="8" fill="none" stroke="' + a + '" stroke-width="5"/></svg>';
  if (item.kind === 'horns') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 46Q6 28 14 12l12 22zM46 46Q58 28 50 12L38 34z" fill="' + a + '"/></svg>';
  if (item.kind === 'beanie') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 40a20 20 0 0 1 40 0z" fill="' + a + '"/><rect x="12" y="38" width="40" height="8" rx="3" fill="#0b1220"/><circle cx="32" cy="16" r="5" fill="#b6f34a"/></svg>';
  if (item.kind === 'cowboy') return '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="42" rx="28" ry="8" fill="' + a + '"/><path d="M18 42Q20 16 32 18Q44 16 46 42z" fill="' + a + '"/><rect x="18" y="36" width="28" height="6" fill="#7c4a12"/></svg>';
  if (item.kind === 'wizard') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 46L32 6l18 40z" fill="' + a + '"/><ellipse cx="32" cy="46" rx="24" ry="6" fill="#6d28d9"/><circle cx="34" cy="28" r="3" fill="#ffd54a"/><circle cx="27" cy="38" r="2.2" fill="#ffd54a"/></svg>';
  if (item.kind === 'viking') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 40a18 18 0 0 1 36 0z" fill="' + a + '"/><rect x="14" y="38" width="36" height="6" fill="#94a3b8"/><path d="M16 36Q4 24 10 10q6 14 12 22zM48 36Q60 24 54 10q-6 14-12 22z" fill="#f8fafc"/></svg>';
  if (item.kind === 'pirate') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 42Q32 8 58 42Q32 30 6 42z" fill="' + a + '"/><circle cx="32" cy="30" r="5" fill="#f8fafc"/><rect x="29" y="28" width="2.4" height="2.4" fill="#1f2937"/><rect x="33" y="28" width="2.4" height="2.4" fill="#1f2937"/></svg>';
  if (item.kind === 'helmet') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 40a20 20 0 0 1 40 0z" fill="' + a + '"/><rect x="12" y="38" width="40" height="7" fill="#0b1220"/><rect x="29" y="14" width="6" height="26" fill="#67e8f9"/></svg>';
  if (item.kind === 'tophat') return '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="24" ry="6" fill="' + a + '"/><rect x="18" y="10" width="28" height="36" fill="' + a + '"/><rect x="18" y="36" width="28" height="7" fill="#ff4fd8"/></svg>';
  if (item.kind === 'mask') return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="26" width="44" height="16" rx="4" fill="' + a + '"/><rect x="16" y="31" width="12" height="6" rx="2" fill="#0b1220"/><rect x="36" y="31" width="12" height="6" rx="2" fill="#0b1220"/><path d="M10 30L2 40l8 4z" fill="' + a + '"/></svg>';
  if (item.kind === 'scarf') return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="24" width="36" height="10" rx="4" fill="' + a + '"/><path d="M22 32Q12 44 18 58l10-4Q24 42 30 34z" fill="' + a + '"/></svg>';
  if (item.kind === 'wings') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M30 20Q4 12 10 44q12-8 20-10z" fill="' + a + '"/><path d="M34 20Q60 12 54 44q-12-8-20-10z" fill="' + a + '"/><circle cx="32" cy="30" r="5" fill="#9df"/></svg>';
  if (item.kind === 'bowtie') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 32L10 20v24zM32 32l22-12v24z" fill="' + a + '"/><circle cx="32" cy="32" r="5" fill="#ff4fd8"/></svg>';
  if (item.kind === 'eyepatch') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 24l52 8" stroke="' + a + '" stroke-width="4"/><ellipse cx="40" cy="34" rx="11" ry="10" fill="' + a + '"/></svg>';
  return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 36a20 20 0 0 1 40 0" fill="none" stroke="' + a + '" stroke-width="5"/><rect x="8" y="34" width="10" height="18" rx="3" fill="' + a + '"/><rect x="46" y="34" width="10" height="18" rx="3" fill="' + a + '"/></svg>';
}

function renderShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  document.querySelectorAll('[data-shop-player]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.shopPlayer === shopPlayer)));
  document.querySelectorAll('[data-shop-category]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.shopCategory === shopCategory)));
  const i = shopPlayer - 1;
  const look = PartyEconomy.look(i);
  const nameEl = document.getElementById('shopPreviewName');
  const subEl = document.getElementById('shopPreviewSub');
  if (nameEl) nameEl.textContent = (PLAYER_NAMES[i] || ('O' + shopPlayer)) + ' · ' + look.outfit.name;
  if (subEl) subEl.textContent = look.accessory ? look.accessory.name : 'Aksesuar yoxdur';
  grid.innerHTML = SHOP_ITEMS.filter(item => shopCategory === 'hat' ? (item.category === 'accessory' && HAT_KINDS.includes(item.kind)) : item.category === shopCategory).map(item => {
    const owned = PartyEconomy.owned(item.id);
    const equipped = PartyEconomy.equippedId(i, item.category) === item.id;
    const affordable = PartyEconomy.coins() >= item.price;
    const state = equipped ? '<span class="shop-state equipped">Geyinilib</span>'
      : owned ? '<span class="shop-state owned">Geyin</span>'
        : affordable ? '<span class="shop-price"><svg class="coin-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffc83d" stroke="#9a5b00" stroke-width="2"/></svg>' + item.price + '</span>'
          : '<span class="shop-state locked">Çatmır</span>';
    return '<button type="button" class="shop-item' + (equipped ? ' equipped' : '') + (!owned && !affordable ? ' locked' : '') + '" data-item="' + item.id + '" onclick="handleShopItem(\'' + item.id + '\')">'
      + '<span class="shop-item-art">' + itemArtSVG(item) + '</span>'
      + '<span class="shop-item-name">' + item.name + '</span>'
      + '<span class="shop-item-desc">' + item.desc + '</span>'
      + '<span class="shop-item-foot">' + state + '</span>'
      + '</button>';
  }).join('');
}

function selectShopPlayer(n) {
  shopPlayer = Math.max(1, Math.min(4, n));
  renderShop();
}

function selectShopCategory(cat) {
  shopCategory = (cat === 'accessory' || cat === 'hat') ? cat : 'outfit';
  renderShop();
}

function handleShopItem(id) {
  const item = SHOP_ITEMS.find(x => x.id === id);
  if (!item) return;
  const i = shopPlayer - 1;
  if (!PartyEconomy.owned(id)) {
    if (PartyEconomy.coins() < item.price) {
      toast('Coin çatmır — bir oyun da oyna!', 'error');
      PartyAudio.play('error');
      return;
    }
    PartyEconomy.buy(id);
    PartyEconomy.equip(id, i);
    PartyAudio.play('buy');
    toast(item.name + ' alındı və geyinildi');
  } else if (PartyEconomy.equippedId(i, item.category) === id) {
    PartyEconomy.unequip(item.category, i);
    PartyAudio.play('hit');
    toast(item.name + ' çıxarıldı');
  } else {
    PartyEconomy.equip(id, i);
    PartyAudio.play('buy');
    toast(item.name + ' geyinildi');
  }
  renderShop();
}

function resetShopLook() {
  const i = shopPlayer - 1;
  PartyEconomy.unequip('outfit', i);
  PartyEconomy.unequip('accessory', i);
  renderShop();
  toast('Geyim sıfırlandı');
}

function startShopPreview() {
  stopShopPreview();
  const cv = document.getElementById('shopPreview');
  if (!cv) return;
  const g = cv.getContext('2d');
  let phase = 0;
  const frame = () => {
    const screen = document.getElementById('shopScreen');
    if (!screen || !screen.classList.contains('active')) { shopPreviewRaf = 0; return; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cv.width, cv.height);
    g.fillStyle = 'rgba(45,212,255,.14)';
    g.beginPath(); g.ellipse(cv.width / 2, cv.height - 26, 66, 11, 0, 0, 6.3); g.fill();
    if (window.FightPreview) window.FightPreview(cv, shopPlayer - 1, phase);
    phase += .06;
    shopPreviewRaf = requestAnimationFrame(frame);
  };
  frame();
}

function stopShopPreview() {
  if (shopPreviewRaf) cancelAnimationFrame(shopPreviewRaf);
  shopPreviewRaf = 0;
}

function initShopUI() {
  refreshWalletUI();
  refreshSoundUI();
  renderShop();
  document.querySelectorAll('[data-sound-toggle]').forEach(btn => btn.addEventListener('click', () => PartyAudio.toggle()));
}

// Weapon definitions
const WEAPONS = {
  sword:  { name: 'Qılınc',  type: 'melee',  cooldown: 300,  range: 50,  damage: 15, knockback: 6,  color: '#CCCCCC' },
  gun:    { name: 'Silah',    type: 'ranged', cooldown: 500,  range: 400, damage: 12, knockback: 4,  color: '#FFD700' },
  bomb:   { name: 'Bomba',    type: 'throw',  cooldown: 1200, range: 80,  damage: 25, knockback: 10, color: '#FF6600' },
  hammer: { name: 'Çəkic',   type: 'melee',  cooldown: 800,  range: 40,  damage: 20, knockback: 18, color: '#8B4513' }
};

// ─────────────────────────────────────────────
//  INPUT SYSTEM
// ─────────────────────────────────────────────
const inputPlayers = [
  { x: 0, y: 0, action: false, jump: false },
  { x: 0, y: 0, action: false, jump: false },
  { x: 0, y: 0, action: false, jump: false },
  { x: 0, y: 0, action: false, jump: false }
];

// Keyboard state
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

/** Read keyboard into inputPlayers each frame */
const KB_MAP = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', d: 'KeyS', a: 'Space', j: 'KeyW' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', a: 'Enter', j: 'ArrowUp' },
  { l: 'KeyJ', r: 'KeyL', u: 'KeyI', d: 'KeyK', a: 'KeyO', j: 'KeyI' },
  { l: 'Numpad4', r: 'Numpad6', u: 'Numpad8', d: 'Numpad5', a: 'Numpad0', j: 'Numpad8' }
];
const kbPrev = [false, false, false, false];
function pollKeyboard() {
  KB_MAP.forEach((m, i) => {
    if (onlineMode && isHost && i === 1) return; // remote player's input
    const x = (keys[m.r] ? 1 : 0) - (keys[m.l] ? 1 : 0);
    const y = (keys[m.d] ? 1 : 0) - (keys[m.u] ? 1 : 0);
    const a = !!keys[m.a], j = !!keys[m.j];
    const act = !!(x || y || a || j);
    if (act || kbPrev[i]) {
      const inp = inputPlayers[i];
      inp.x = x; inp.y = y; inp.action = a; inp.jump = j;
    }
    kbPrev[i] = act;
  });
}

// ─────────────────────────────────────────────
//  TOUCH JOYSTICK SYSTEM
// ─────────────────────────────────────────────
let joysticks = []; // { el, baseEl, knobEl, actionEl, touchId, actionTouchId, cx, cy, playerIndex }

function setupAllJoysticks(pCount) {
  // Remove old joysticks
  joysticks.forEach(j => { if (j.el && j.el.parentNode) j.el.parentNode.removeChild(j.el); });
  joysticks = [];

  const touchContainer = document.getElementById('touchControls');
  if (!touchContainer) return;
  touchContainer.innerHTML = '';

  // Position configs
  const positions = {
    2: [
      { left: '10px', bottom: '10px', top: 'auto', right: 'auto' },
      { right: '10px', bottom: '10px', top: 'auto', left: 'auto' }
    ],
    3: [
      { left: '10px', bottom: '10px', top: 'auto', right: 'auto' },
      { right: '10px', bottom: '10px', top: 'auto', left: 'auto' },
      { left: '50%', top: '10px', bottom: 'auto', right: 'auto', transform: 'translateX(-50%)' }
    ],
    4: [
      { left: '10px', bottom: '10px', top: 'auto', right: 'auto' },
      { right: '10px', bottom: '10px', top: 'auto', left: 'auto' },
      { left: '10px', top: '10px', bottom: 'auto', right: 'auto' },
      { right: '10px', top: '10px', bottom: 'auto', left: 'auto' }
    ]
  };

  const posArr = positions[pCount] || positions[2];

  for (let i = 0; i < pCount; i++) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.width = '150px';
    wrapper.style.height = '150px';
    wrapper.style.zIndex = '100';
    Object.assign(wrapper.style, posArr[i]);

    // Joystick base
    const base = document.createElement('div');
    base.style.cssText = `position:absolute;left:0;top:25px;width:100px;height:100px;
      border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);`;

    // Joystick knob
    const knob = document.createElement('div');
    knob.style.cssText = `position:absolute;left:30px;top:55px;width:40px;height:40px;
      border-radius:50%;background:rgba(255,255,255,0.5);pointer-events:none;`;

    // Action button
    const actionBtn = document.createElement('div');
    actionBtn.style.cssText = `position:absolute;right:0;top:50px;width:50px;height:50px;
      border-radius:50%;background:${PLAYER_COLORS[i]};opacity:0.6;
      display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;font-weight:bold;`;
    actionBtn.textContent = '⚡';

    wrapper.appendChild(base);
    wrapper.appendChild(knob);
    wrapper.appendChild(actionBtn);
    touchContainer.appendChild(wrapper);

    joysticks.push({
      el: wrapper, baseEl: base, knobEl: knob, actionEl: actionBtn,
      touchId: null, actionTouchId: null,
      cx: 0, cy: 0, playerIndex: i
    });
  }

  // Calculate center positions after DOM layout
  requestAnimationFrame(() => {
    joysticks.forEach(j => {
      const rect = j.baseEl.getBoundingClientRect();
      j.cx = rect.left + rect.width / 2;
      j.cy = rect.top + rect.height / 2;
    });
  });
}

// Touch event handlers
function touchActive(e) {
  const gs = document.getElementById('gameScreen');
  return gs && gs.classList.contains('active') && !(e.target.closest && e.target.closest('.pause-btn,.pause-overlay,.modal-overlay,.icon-btn,.coin-pill,.hud-actions,.party-topbar,.shop-shell'));
}
function guardTouch(e) {
  if (touchActive(e)) { e.preventDefault(); return true; }
  return e.type === 'touchend' || e.type === 'touchcancel';
}

function handleTouchStart(e) {
  if (!guardTouch(e)) return;
  for (let t = 0; t < e.changedTouches.length; t++) {
    const touch = e.changedTouches[t];
    for (const j of joysticks) {
      // Check action button
      const aRect = j.actionEl.getBoundingClientRect();
      if (touch.clientX >= aRect.left && touch.clientX <= aRect.right &&
          touch.clientY >= aRect.top && touch.clientY <= aRect.bottom) {
        j.actionTouchId = touch.identifier;
        inputPlayers[j.playerIndex].action = true;
        continue;
      }
      // Check joystick base
      const bRect = j.baseEl.getBoundingClientRect();
      if (j.touchId === null &&
          touch.clientX >= bRect.left - 20 && touch.clientX <= bRect.right + 20 &&
          touch.clientY >= bRect.top - 20 && touch.clientY <= bRect.bottom + 20) {
        j.touchId = touch.identifier;
        j.cx = bRect.left + bRect.width / 2; j.cy = bRect.top + bRect.height / 2;
      }
    }
  }
}

function handleTouchMove(e) {
  if (!guardTouch(e)) return;
  for (let t = 0; t < e.changedTouches.length; t++) {
    const touch = e.changedTouches[t];
    for (const j of joysticks) {
      if (j.touchId === touch.identifier) {
        const dx = touch.clientX - j.cx;
        const dy = touch.clientY - j.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = 40;
        const clamped = Math.min(dist, maxR);
        const angle = Math.atan2(dy, dx);
        const nx = Math.cos(angle) * clamped;
        const ny = Math.sin(angle) * clamped;

        j.knobEl.style.left = (30 + nx) + 'px';
        j.knobEl.style.top  = (55 + ny) + 'px';

        inputPlayers[j.playerIndex].x = nx / maxR;
        inputPlayers[j.playerIndex].y = ny / maxR;
        if (ny / maxR < -0.5) inputPlayers[j.playerIndex].jump = true;
        else inputPlayers[j.playerIndex].jump = false;
      }
    }
  }
}

function handleTouchEnd(e) {
  if (!guardTouch(e)) return;
  for (let t = 0; t < e.changedTouches.length; t++) {
    const touch = e.changedTouches[t];
    for (const j of joysticks) {
      if (j.touchId === touch.identifier) {
        j.touchId = null;
        j.knobEl.style.left = '30px';
        j.knobEl.style.top  = '55px';
        inputPlayers[j.playerIndex].x = 0;
        inputPlayers[j.playerIndex].y = 0;
        inputPlayers[j.playerIndex].jump = false;
      }
      if (j.actionTouchId === touch.identifier) {
        j.actionTouchId = null;
        inputPlayers[j.playerIndex].action = false;
      }
    }
  }
}

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove',  handleTouchMove,  { passive: false });
document.addEventListener('touchend',   handleTouchEnd,   { passive: false });
document.addEventListener('touchcancel', handleTouchEnd,  { passive: false });

// ─────────────────────────────────────────────
//  ONLINE / PEERJS
// ─────────────────────────────────────────────
let peer = null;
let conn = null;
let isHost = false;
let onlineMode = false;
let roomInfo = { name: '', password: '' };
let lobbyCfg = { mode: 'vs', map: 'arena', rounds: 1 };
let pendingRoom = '';
let netFrame = 0;

function roomPeerId(name) {
  return 'stickparty-' + [...name.trim().toLowerCase()].map(c => /[a-z0-9]/.test(c) ? c : '_' + c.charCodeAt(0).toString(16)).join('') + 'x';
}

function netCleanup() {
  Reg.announceStop();
  const c = conn, p = peer;
  conn = null; peer = null; onlineMode = false; isHost = false;
  PLAYER_NAMES[0] = PartyEconomy.name() || 'P1';
  PLAYER_NAMES[1] = 'P2'; PLAYER_NAMES[2] = 'P3'; PLAYER_NAMES[3] = 'P4';
  if (window.refreshNameUI) window.refreshNameUI();
  try { if (c) c.close(); } catch (e) {}
  try { if (p) p.destroy(); } catch (e) {}
}

function setLobbyGuest(joined) {
  const el = document.getElementById('lobbyPlayer2');
  if (!el) return;
  const oppName = (typeof PLAYER_NAMES !== 'undefined' && PLAYER_NAMES[1] && PLAYER_NAMES[1] !== 'P2') ? PLAYER_NAMES[1] : 'Rəqib';
  el.innerHTML = joined
    ? '<div class="player-avatar" style="border-color:var(--p2-color);background:rgba(239,68,68,.12)">🏃</div><span class="player-name" style="color:var(--p2-color)">' + oppName.replace(/[<>&]/g, '') + '</span><span class="lobby-tag" style="color:var(--p2-color);background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3)">QONAQ</span>'
    : '<div class="player-avatar empty" style="border-color:var(--p2-color)">?</div><span class="player-name">Gözlənilir...</span>';
}

function prepLobby(host, name) {
  document.getElementById('lobbyRoomName').textContent = 'Otaq: ' + name;
  const hn = document.getElementById('lobbyHostName');
  if (hn) hn.textContent = host ? ((PartyEconomy.name() || 'Siz') + ' (Host)') : 'Host';
  document.getElementById('hostSettings').classList.toggle('hidden', !host);
  document.getElementById('btnStartLobby').classList.toggle('hidden', !host);
  document.getElementById('guestWaiting').classList.toggle('hidden', host);
  if (host) setLobbyGuest(false);
}

function createRoom() {
  const name = document.getElementById('roomNameInput').value.trim();
  const pass = document.getElementById('roomPassInput').value;
  if (!name) return alert('Otaq adı daxil edin');
  if (typeof Peer === 'undefined') return alert('Onlayn rejim üçün internet lazımdır');
  netCleanup();
  isHost = true; onlineMode = true;
  roomInfo = { name, password: pass };
  peer = new Peer(roomPeerId(name));
  peer.on('open', () => { prepLobby(true, name); showScreen('roomLobby'); Reg.announceStart(); });
  peer.on('error', e => {
    if (e.type === 'peer-unavailable') return; // registry not reachable right now
    alert(e.type === 'unavailable-id' ? 'Bu otaq adı artıq istifadədədir' : 'Xəta: ' + e.type);
    netCleanup(); showScreen('roomCreate');
  });
  peer.on('connection', c => {
    c.on('data', d => {
      if (d.type === 'auth') {
        if (conn && conn.open) { c.send({ type: 'full' }); setTimeout(() => c.close(), 200); return; }
        if (d.password !== roomInfo.password) { c.send({ type: 'authFail' }); setTimeout(() => c.close(), 200); return; }
        conn = c; c.send({ type: 'authOk', name: PartyEconomy.name() });
        if (d.name) { PLAYER_NAMES[1] = String(d.name).slice(0, 14); if (window.refreshNameUI) window.refreshNameUI(); }
        setLobbyGuest(true);
      } else if (c === conn) handleNet(d);
    });
    c.on('close', () => {
      if (c !== conn) return;
      conn = null; setLobbyGuest(false);
      if (['playing', 'roundEnd', 'matchEnd'].includes(gameState)) { alert('Rəqib ayrıldı'); quitGame(); }
    });
  });
}

function joinRoom() {
  const pass = document.getElementById('joinPassInput').value;
  const name = pendingRoom;
  if (typeof Peer === 'undefined') return alert('Onlayn rejim üçün internet lazımdır');
  netCleanup();
  onlineMode = true; isHost = false;
  peer = new Peer();
  peer.on('error', e => {
    alert(e.type === 'peer-unavailable' ? 'Otaq tapılmadı' : 'Xəta: ' + e.type);
    netCleanup(); closePasswordPrompt(); showScreen('roomJoin');
  });
  peer.on('open', () => {
    conn = peer.connect(roomPeerId(name), { reliable: true });
    conn.on('open', () => conn.send({ type: 'auth', password: pass, name: PartyEconomy.name() }));
    conn.on('data', handleNet);
    conn.on('close', () => { if (onlineMode) { alert('Bağlantı kəsildi'); quitGame(); } });
  });
}

function handleNet(d) {
  switch (d.type) {
    case 'authFail': alert('Şifrə yanlışdır!'); netCleanup(); break;
    case 'full': alert('Otaq doludur'); netCleanup(); closePasswordPrompt(); break;
    case 'authOk': closePasswordPrompt(); prepLobby(false, pendingRoom); showScreen('roomLobby');
      if (d.name) { PLAYER_NAMES[0] = String(d.name).slice(0, 14); PLAYER_NAMES[1] = PartyEconomy.name() || 'P2'; if (window.refreshNameUI) window.refreshNameUI(); }
      break;
    case 'start': startGame(d.cfg.mode, d.cfg.map, 2, d.cfg.rounds, d.cfg.weapons); break;
    case 'state': applyOnlineState(d); break;
    case 'input': // host receives guest input
      if (isHost) { const i = inputPlayers[1]; i.x = d.x; i.y = d.y; i.action = d.action; i.jump = d.jump; }
      break;
    case 'rematch': if (isHost) restartMatch(); break;
  }
}

function sendOnlineState() {
  if (!conn || !conn.open) return;
  if (!isHost) {
    const i = inputPlayers[0];
    conn.send({ type: 'input', x: i.x, y: i.y, action: i.action, jump: i.jump });
    return;
  }
  if (++netFrame % 2) return;
  conn.send({
    type: 'state', gs: gameState, cr: currentRound, gt: gameTimer,
    cd: countdownActive ? countdownTimer : null,
    pl: players.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, hp: p.hp, alive: p.alive, angle: p.angle,
      score: p.score, coins: p.coins, raceX: p.raceX, isAttacking: p.isAttacking, invincible: p.invincible, weapon: p.weapon })),
    pr: projectiles, ball, coins, fo: fallingObjects, walls: castleWalls, plats: platforms,
    lava: lavaRadius, ro: raceOffset, ob: raceObstacles, rf: raceFinishX
  });
}

function applyOnlineState(d) {
  if (!players.length) return;
  d.pl.forEach((st, i) => { if (players[i]) Object.assign(players[i], st); });
  projectiles = d.pr; ball = d.ball; coins = d.coins; fallingObjects = d.fo; castleWalls = d.walls;
  platforms = d.plats; lavaRadius = d.lava; raceOffset = d.ro; raceObstacles = d.ob; raceFinishX = d.rf;
  gameTimer = d.gt; currentRound = d.cr;
  countdownActive = d.cd !== null;
  if (countdownActive) countdownTimer = d.cd;
  if (d.gs === 'matchEnd') {
    if (gameState !== 'matchEnd') { gameState = 'matchEnd'; showWinner(); }
  } else {
    if (gameState === 'matchEnd') hideWinner();
    gameState = d.gs;
  }
}

// ─────────────────────────────────────────────
//  PARTICLE SYSTEM
// ─────────────────────────────────────────────
function spawnParticle(x, y, color, count, speed, life) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = (Math.random() * 0.7 + 0.3) * speed;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: life || 40,
      maxLife: life || 40,
      color,
      radius: Math.random() * 4 + 2
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity on particles
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────
//  SCREEN SHAKE
// ─────────────────────────────────────────────
function triggerShake(magnitude, duration) {
  shakeMagnitude = magnitude;
  shakeDuration = duration;
}

function updateShake() {
  if (shakeDuration > 0) {
    shakeX = (Math.random() - 0.5) * shakeMagnitude * 2;
    shakeY = (Math.random() - 0.5) * shakeMagnitude * 2;
    shakeDuration--;
    shakeMagnitude *= 0.92;
  } else {
    shakeX = 0;
    shakeY = 0;
  }
}

// ─────────────────────────────────────────────
//  PLAYER CREATION
// ─────────────────────────────────────────────
function createPlayer(index, weaponKey) {
  return {
    index,
    x: 0, y: 0,
    vx: 0, vy: 0,
    hp: 100,
    radius: 18,
    angle: 0,
    color: PLAYER_COLORS[index],
    alive: true,
    weapon: weaponKey || 'sword',
    score: 0,
    isAttacking: false,
    attackTimer: 0,
    cooldownTimer: 0,
    onGround: false,
    jumpsLeft: 2,
    dashCooldown: 0,
    coins: 0,
    raceX: 0,
    invincible: 0, // invincibility frames
    trail: []
  };
}

function spawnPlayers(weaponChoices) {
  players = [];
  const cx = cw / 2, cy = ch / 2;
  const spawnDist = Math.min(cw, ch) * 0.25;

  for (let i = 0; i < playerCount; i++) {
    const angle = (Math.PI * 2 * i) / playerCount - Math.PI / 2;
    const p = createPlayer(i, weaponChoices ? weaponChoices[i] : 'sword');
    p.x = cx + Math.cos(angle) * spawnDist;
    p.y = cy + Math.sin(angle) * spawnDist;
    p.angle = Math.atan2(cy - p.y, cx - p.x);
    players.push(p);
  }
}

// ─────────────────────────────────────────────
//  MAP INITIALIZATION
// ─────────────────────────────────────────────
function initMap() {
  castleWalls = [];
  platforms = [];
  projectiles = [];
  lavaRadius = 0;
  lavaTimer = 0;

  if (currentMode === 'vs') {
    switch (currentMap) {
      case 'arena':
        // No special init needed, just circular boundary
        break;

      case 'castle':
        // 4 wall blocks as cover
        const wallW = 60, wallH = 20;
        castleWalls = [
          { x: cw * 0.3, y: ch * 0.35, w: wallW, h: wallH, hp: 60 },
          { x: cw * 0.7, y: ch * 0.35, w: wallW, h: wallH, hp: 60 },
          { x: cw * 0.3, y: ch * 0.65, w: wallW, h: wallH, hp: 60 },
          { x: cw * 0.7, y: ch * 0.65, w: wallW, h: wallH, hp: 60 }
        ];
        break;

      case 'platforms':
        // 6 floating platforms at different heights
        platforms = [
          { x: cw * 0.1, y: ch * 0.8, w: cw * 0.2, h: 14 },
          { x: cw * 0.7, y: ch * 0.8, w: cw * 0.2, h: 14 },
          { x: cw * 0.35, y: ch * 0.6, w: cw * 0.3, h: 14 },
          { x: cw * 0.05, y: ch * 0.45, w: cw * 0.18, h: 14 },
          { x: cw * 0.77, y: ch * 0.45, w: cw * 0.18, h: 14 },
          { x: cw * 0.4, y: ch * 0.3, w: cw * 0.2, h: 14 }
        ];
        { const spots = [platforms[0], platforms[1], platforms[3], platforms[4]];
          players.forEach((p, i) => { const sp = spots[i % 4]; p.x = sp.x + sp.w / 2; p.y = sp.y - p.radius; p.vx = p.vy = 0; p.onGround = true; p.jumpsLeft = 2; }); }
        break;

      case 'lava':
        // Safe zone starts large
        lavaRadius = Math.min(cw, ch) * 0.45;
        lavaTimer = 0;
        break;
    }
  }
}

// ─────────────────────────────────────────────
//  MINIGAME INITIALIZATION
// ─────────────────────────────────────────────
function initMinigame() {
  projectiles = [];
  coins = [];
  fallingObjects = [];
  raceObstacles = [];
  ball = null;
  coinSpawnTimer = 0;
  dodgeSpawnTimer = 0;
  dodgeSpeed = 2;
  raceOffset = 0;

  switch (currentMinigame) {
    case 'sumo':
      // Circular ring, no weapons
      players.forEach(p => { p.weapon = 'none'; p.hp = 999; });
      break;

    case 'futbol':
      // Ball in center, goals on left/right
      ball = {
        x: cw / 2, y: ch / 2,
        vx: 0, vy: 0,
        radius: 12,
        lastKicker: -1
      };
      gameTimer = 0;
      // Position players for football
      if (playerCount >= 2) {
        players[0].x = cw * 0.2; players[0].y = ch / 2;
        players[1].x = cw * 0.8; players[1].y = ch / 2;
      }
      if (playerCount >= 3) {
        players[2].x = cw * 0.3; players[2].y = ch * 0.3;
      }
      if (playerCount >= 4) {
        players[3].x = cw * 0.7; players[3].y = ch * 0.3;
      }
      break;

    case 'coins':
      gameTimer = 30 * 60; // 30 seconds at 60fps
      gameTimerMax = gameTimer;
      players.forEach(p => { p.coins = 0; });
      break;

    case 'dodge':
      players.forEach(p => {
        p.x = cw / 2 + (p.index - (playerCount - 1) / 2) * 60;
        p.y = ch - 40;
        p.hp = 100;
      });
      dodgeSpeed = 2;
      break;

    case 'race':
      raceFinishX = cw * 3;
      raceOffset = 0;
      // Generate obstacles
      raceObstacles = [];
      for (let ox = cw * 0.5; ox < raceFinishX; ox += 150 + Math.random() * 200) {
        raceObstacles.push({
          x: ox,
          y: ch - 30 - Math.random() * 40,
          w: 20 + Math.random() * 30,
          h: 20 + Math.random() * 50,
          type: Math.random() < 0.5 ? 'block' : 'gap'
        });
      }
      players.forEach((p, i) => {
        p.raceX = 50;
        p.x = 50;
        p.y = ch - 60;
        p.onGround = true;
        p.jumpsLeft = 2;
      });
      break;
  }
}

// ─────────────────────────────────────────────
//  PHYSICS & MOVEMENT
// ─────────────────────────────────────────────
function updatePlayers() {
  const speed = 4;
  const isPlatformMap = (currentMode === 'vs' && currentMap === 'platforms');
  const isRace = (currentMode === 'minigame' && currentMinigame === 'race');
  const isDodge = (currentMode === 'minigame' && currentMinigame === 'dodge');
  const friction = isPlatformMap || isRace ? 0.88 : 0.88;
  const airFriction = 0.95;
  const gravity = 0.4;
  const jumpVel = -8;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.alive) continue;

    // In online mode, client doesn't simulate (host is authoritative)
    if (onlineMode && !isHost && i !== 0) continue;
    // Online client player index is remapped on host side
    const inp = inputPlayers[i];
    if (isRace) continue; // race handled fully in updateRace

    // Movement
    if (isDodge) {
      // Dodge: only horizontal movement
      p.vx += inp.x * speed * 0.5;
    } else if (isRace) {
      // Race: horizontal + jump
      p.vx += inp.x * speed * 0.3;
      if (inp.jump && p.onGround) {
        p.vy = jumpVel;
        p.onGround = false;
      }
    } else if (isPlatformMap) {
      // Platform map: full movement with gravity
      p.vx += inp.x * speed * 0.3;
      if (inp.jump && p.jumpsLeft > 0) {
        if (!p._jumpHeld) {
          p.vy = jumpVel;
          p.jumpsLeft--;
          p._jumpHeld = true;
        }
      }
      if (!inp.jump) p._jumpHeld = false;
    } else {
      // Standard top-down movement
      p.vx += inp.x * speed * 0.3;
      p.vy += inp.y * speed * 0.3;
    }

    // Apply gravity for platform/race/dodge modes
    if (isPlatformMap || isRace || isDodge) {
      p.vy += gravity;
    }

    // Apply friction
    if (isPlatformMap || isRace) {
      p.vx *= p.onGround ? friction : airFriction;
      p.vy *= airFriction;
    } else if (isDodge) {
      p.vx *= friction;
    } else {
      p.vx *= friction;
      p.vy *= friction;
    }

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Update angle (facing direction)
    if (Math.abs(inp.x) > 0.1 || Math.abs(inp.y) > 0.1) {
      p.angle = Math.atan2(inp.y, inp.x);
    }

    // Trail effect
    if (Math.abs(p.vx) > 2 || Math.abs(p.vy) > 2) {
      p.trail.push({ x: p.x, y: p.y, life: 10 });
      if (p.trail.length > 8) p.trail.shift();
    }
    p.trail = p.trail.filter(t => { t.life--; return t.life > 0; });

    // Platform collision
    if (isPlatformMap || isRace) {
      p.onGround = false;
      const floorY = ch + 50;
      const plats = isRace ? generateRaceFloor() : platforms;
      for (const pl of plats) {
        const plX = isRace ? pl.x - raceOffset : pl.x;
        if (p.x >= plX && p.x <= plX + pl.w &&
            p.y + p.radius >= pl.y && p.y + p.radius <= pl.y + pl.h + 8 && p.vy >= 0) {
          p.y = pl.y - p.radius;
          p.vy = 0;
          p.onGround = true;
          p.jumpsLeft = 2;
        }
      }
      // Ground floor for race & dodge
      if (isRace || isDodge) {
        if (p.y + p.radius >= ch - 20) {
          p.y = ch - 20 - p.radius;
          p.vy = 0;
          p.onGround = true;
          p.jumpsLeft = 2;
        }
      }
      // Fall off screen for platforms
      if (isPlatformMap && p.y > ch + 50) {
        killPlayer(p);
      }
    }

    // Dodge ground
    if (isDodge) {
      if (p.y + p.radius >= ch - 20) {
        p.y = ch - 20 - p.radius;
        p.vy = 0;
      }
      // Keep in bounds
      p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
    }

    // Invincibility countdown
    if (p.invincible > 0) p.invincible--;

    // Cooldown
    if (p.cooldownTimer > 0) p.cooldownTimer--;
    if (p.attackTimer > 0) {
      p.attackTimer--;
      if (p.attackTimer <= 0) p.isAttacking = false;
    }
    if (p.dashCooldown > 0) p.dashCooldown--;

    // Boundary checks per mode
    applyBoundary(p);
  }
}

function generateRaceFloor() {
  // The ground for the race
  return [{ x: -100, y: ch - 20, w: raceFinishX + 500, h: 30 }];
}

function applyBoundary(p) {
  if (currentMode === 'vs') {
    switch (currentMap) {
      case 'arena': {
        const cx = cw / 2, cy = ch / 2;
        const arenaR = Math.min(cw, ch) * 0.4;
        const dx = p.x - cx, dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > arenaR) {
          killPlayer(p);
        }
        break;
      }
      case 'castle':
        // Rectangular boundary with some padding
        p.x = Math.max(p.radius + 10, Math.min(cw - p.radius - 10, p.x));
        p.y = Math.max(p.radius + 10, Math.min(ch - p.radius - 10, p.y));
        // Wall collision
        for (const w of castleWalls) {
          if (w.hp <= 0) continue;
          if (p.x + p.radius > w.x && p.x - p.radius < w.x + w.w &&
              p.y + p.radius > w.y && p.y - p.radius < w.y + w.h) {
            // Push out
            const overlapX = Math.min(p.x + p.radius - w.x, w.x + w.w - (p.x - p.radius));
            const overlapY = Math.min(p.y + p.radius - w.y, w.y + w.h - (p.y - p.radius));
            if (overlapX < overlapY) {
              p.x += (p.x < w.x + w.w / 2 ? -overlapX : overlapX);
              p.vx *= -0.3;
            } else {
              p.y += (p.y < w.y + w.h / 2 ? -overlapY : overlapY);
              p.vy *= -0.3;
            }
          }
        }
        break;
      case 'platforms':
        // Horizontal bounds only
        p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
        break;
      case 'lava':
        // Keep in screen
        p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
        p.y = Math.max(p.radius, Math.min(ch - p.radius, p.y));
        // Lava damage outside safe zone
        const cx2 = cw / 2, cy2 = ch / 2;
        const d = Math.sqrt((p.x - cx2) ** 2 + (p.y - cy2) ** 2);
        if (d > lavaRadius) {
          p.hp -= 0.5; // continuous damage
          if (Math.random() < 0.3) {
            spawnParticle(p.x, p.y, '#FF4400', 1, 2, 15);
          }
          if (p.hp <= 0) killPlayer(p);
        }
        break;
    }
  } else if (currentMode === 'minigame') {
    switch (currentMinigame) {
      case 'sumo': {
        const cx = cw / 2, cy = ch / 2;
        const ringR = Math.min(cw, ch) * 0.35;
        const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        if (d > ringR) killPlayer(p);
        break;
      }
      case 'futbol':
        p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
        p.y = Math.max(p.radius + 40, Math.min(ch - p.radius, p.y));
        break;
      case 'coins':
        p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
        p.y = Math.max(p.radius, Math.min(ch - p.radius, p.y));
        break;
      case 'dodge':
        p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
        break;
      case 'race':
        // stays within visible area
        break;
    }
  }
}

function killPlayer(p) {
  if (!p.alive) return;
  p.alive = false;
  spawnParticle(p.x, p.y, p.color, 20, 5, 40);
  triggerShake(6, 15);
}

// ─────────────────────────────────────────────
//  WEAPON / COMBAT SYSTEM
// ─────────────────────────────────────────────
function updateCombat() {
  if (currentMode === 'minigame' && currentMinigame !== 'sumo') return;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.alive) continue;

    const inp = inputPlayers[i];
    if (currentMinigame === 'sumo') {
      // Dash ability in sumo
      if (inp.action && p.dashCooldown <= 0) {
        p.vx += Math.cos(p.angle) * 12;
        p.vy += Math.sin(p.angle) * 12;
        p.dashCooldown = 40;
        p.isAttacking = true;
        p.attackTimer = 10;
        spawnParticle(p.x, p.y, p.color, 5, 3, 15);
      }
      // Sumo bump: push others on contact
      for (let j = 0; j < players.length; j++) {
        if (i === j || !players[j].alive) continue;
        const dx = players[j].x - p.x;
        const dy = players[j].y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < p.radius + players[j].radius) {
          const angle = Math.atan2(dy, dx);
          const force = p.isAttacking ? 8 : 3;
          players[j].vx += Math.cos(angle) * force;
          players[j].vy += Math.sin(angle) * force;
          p.vx -= Math.cos(angle) * force * 0.3;
          p.vy -= Math.sin(angle) * force * 0.3;
        }
      }
      continue;
    }

    // VS combat
    if (p.weapon === 'none') continue;
    const wep = WEAPONS[p.weapon];
    if (!wep) continue;

    if (inp.action && p.cooldownTimer <= 0) {
      p.cooldownTimer = Math.round(wep.cooldown / 16.67); // convert ms to frames
      p.isAttacking = true;
      p.attackTimer = 8;

      switch (wep.type) {
        case 'melee':
          // Arc attack in facing direction
          for (let j = 0; j < players.length; j++) {
            if (i === j || !players[j].alive || players[j].invincible > 0) continue;
            const dx = players[j].x - p.x;
            const dy = players[j].y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < wep.range + players[j].radius) {
              const hitAngle = Math.atan2(dy, dx);
              let angleDiff = Math.abs(hitAngle - p.angle);
              if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
              if (angleDiff < Math.PI * 0.6) { // ~108 degree arc
                players[j].hp -= wep.damage;
                players[j].vx += Math.cos(hitAngle) * wep.knockback;
                players[j].vy += Math.sin(hitAngle) * wep.knockback;
                players[j].invincible = 10;
                spawnParticle(players[j].x, players[j].y, '#FFFFFF', 6, 3, 15);
                triggerShake(wep.knockback > 10 ? 8 : 3, 8);
                if (players[j].hp <= 0) killPlayer(players[j]);
              }
            }
          }
          break;

        case 'ranged':
          // Shoot bullet
          PartyAudio.play('shot');
          projectiles.push({
            x: p.x + Math.cos(p.angle) * 20,
            y: p.y + Math.sin(p.angle) * 20,
            vx: Math.cos(p.angle) * 8,
            vy: Math.sin(p.angle) * 8,
            type: 'bullet',
            owner: i,
            damage: wep.damage,
            knockback: wep.knockback,
            life: 120,
            bounces: 1
          });
          break;

        case 'throw':
          // Throw bomb
          projectiles.push({
            x: p.x + Math.cos(p.angle) * 20,
            y: p.y + Math.sin(p.angle) * 20,
            vx: Math.cos(p.angle) * 5,
            vy: Math.sin(p.angle) * 5,
            type: 'bomb',
            owner: i,
            damage: wep.damage,
            knockback: wep.knockback,
            life: 120, // 2 seconds
            radius: 80
          });
          break;
      }
    }
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;

    if (proj.type === 'bomb') {
      // Bombs are affected by gravity slightly and bounce
      proj.vy += 0.15;
      // Bounce off walls
      if (proj.x < 0 || proj.x > cw) { proj.vx *= -0.6; proj.x = Math.max(0, Math.min(cw, proj.x)); }
      if (proj.y < 0 || proj.y > ch) { proj.vy *= -0.6; proj.y = Math.max(0, Math.min(ch, proj.y)); }

      proj.arm = (proj.arm === undefined ? 12 : proj.arm) - 1;
      let contact = false;
      for (let j = 0; j < players.length; j++) {
        const o = players[j];
        if (!o.alive || (j === proj.owner && proj.arm > 0)) continue;
        if (Math.abs(o.x - proj.x) < o.radius + 9 && Math.abs(o.y - proj.y) < o.radius + 12) { contact = true; break; }
      }
      if (contact || proj.life <= 0) {
        // EXPLODE
        explodeBomb(proj);
        projectiles.splice(i, 1);
        continue;
      }
    }

    if (proj.type === 'bullet') {
      // Bounce off walls once
      if (proj.x < 0 || proj.x > cw) {
        if (proj.bounces > 0) { proj.vx *= -1; proj.bounces--; proj.x = Math.max(0, Math.min(cw, proj.x)); }
        else { projectiles.splice(i, 1); continue; }
      }
      if (proj.y < 0 || proj.y > ch) {
        if (proj.bounces > 0) { proj.vy *= -1; proj.bounces--; proj.y = Math.max(0, Math.min(ch, proj.y)); }
        else { projectiles.splice(i, 1); continue; }
      }

      // Bounce off castle walls
      for (const w of castleWalls) {
        if (w.hp <= 0) continue;
        if (proj.x > w.x && proj.x < w.x + w.w && proj.y > w.y && proj.y < w.y + w.h) {
          if (proj.bounces > 0) {
            proj.vx *= -1; proj.vy *= -1;
            proj.bounces--;
          } else {
            projectiles.splice(i, 1);
            break;
          }
        }
      }

      // Hit players
      for (let j = 0; j < players.length; j++) {
        if (j === proj.owner || !players[j].alive || players[j].invincible > 0) continue;
        const dx = players[j].x - proj.x;
        const dy = players[j].y - proj.y;
        if (Math.sqrt(dx * dx + dy * dy) < players[j].radius + 4) {
          players[j].hp -= proj.damage;
          const hitAngle = Math.atan2(dy, dx);
          players[j].vx += Math.cos(hitAngle) * proj.knockback;
          players[j].vy += Math.sin(hitAngle) * proj.knockback;
          players[j].invincible = 10;
          spawnParticle(proj.x, proj.y, '#FFD700', 5, 3, 12);
          if (players[j].hp <= 0) killPlayer(players[j]);
          projectiles.splice(i, 1);
          break;
        }
      }
    }

    if (proj.life <= 0) {
      projectiles.splice(i, 1);
    }
  }
}

function explodeBomb(proj) {
  PartyAudio.play('boom');
  spawnParticle(proj.x, proj.y, '#FF6600', 25, 6, 30);
  spawnParticle(proj.x, proj.y, '#FFAA00', 15, 4, 25);
  triggerShake(10, 15);

  // Damage players in radius
  for (let j = 0; j < players.length; j++) {
    if (!players[j].alive || players[j].invincible > 0) continue;
    const dx = players[j].x - proj.x;
    const dy = players[j].y - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < proj.radius) {
      const falloff = 1 - dist / proj.radius;
      players[j].hp -= proj.damage * falloff;
      const hitAngle = Math.atan2(dy, dx);
      players[j].vx += Math.cos(hitAngle) * proj.knockback * falloff;
      players[j].vy += Math.sin(hitAngle) * proj.knockback * falloff;
      players[j].invincible = 15;
      if (players[j].hp <= 0) killPlayer(players[j]);
    }
  }

  // Damage castle walls
  for (const w of castleWalls) {
    if (w.hp <= 0) continue;
    const wcx = w.x + w.w / 2, wcy = w.y + w.h / 2;
    const dist = Math.sqrt((wcx - proj.x) ** 2 + (wcy - proj.y) ** 2);
    if (dist < proj.radius + 30) {
      w.hp -= 30;
      if (w.hp <= 0) {
        spawnParticle(wcx, wcy, '#999999', 12, 4, 20);
      }
    }
  }
}

// ─────────────────────────────────────────────
//  MINIGAME UPDATE LOGIC
// ─────────────────────────────────────────────
function updateMinigame() {
  switch (currentMinigame) {
    case 'sumo':
      // Handled in updateCombat
      break;

    case 'futbol':
      updateFutbol();
      break;

    case 'coins':
      updateCoinGrab();
      break;

    case 'dodge':
      updateDodge();
      break;

    case 'race':
      updateRace();
      break;
  }
}

// ── Futbol ──
function updateFutbol() {
  if (!ball) return;

  // Ball physics
  ball.vx *= 0.98;
  ball.vy *= 0.98;
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Ball boundary (top/bottom)
  if (ball.y - ball.radius < 40) { ball.y = 40 + ball.radius; ball.vy *= -0.8; }
  if (ball.y + ball.radius > ch) { ball.y = ch - ball.radius; ball.vy *= -0.8; }

  // Goal zones
  const goalW = 15, goalH = ch * 0.3;
  const goalTop = ch / 2 - goalH / 2;
  const goalBot = ch / 2 + goalH / 2;

  // Left goal (team 2 scores: P2, P4)
  if (ball.x - ball.radius < goalW && ball.y > goalTop && ball.y < goalBot) {
    // Goal scored on left
    if (playerCount <= 2) {
      players[1].score++;
    } else {
      players[1].score++;
      if (players[3]) players[3].score++;
    }
    spawnParticle(ball.x, ball.y, '#44FF44', 20, 5, 30);
    resetBall();
    checkFutbolWin();
    return;
  }

  // Right goal (team 1 scores: P1, P3)
  if (ball.x + ball.radius > cw - goalW && ball.y > goalTop && ball.y < goalBot) {
    if (playerCount <= 2) {
      players[0].score++;
    } else {
      players[0].score++;
      if (players[2]) players[2].score++;
    }
    spawnParticle(ball.x, ball.y, '#44FF44', 20, 5, 30);
    resetBall();
    checkFutbolWin();
    return;
  }

  // Ball side walls (non-goal areas)
  if (ball.x - ball.radius < goalW) {
    if (ball.y < goalTop || ball.y > goalBot) {
      ball.x = goalW + ball.radius; ball.vx *= -0.8;
    }
  }
  if (ball.x + ball.radius > cw - goalW) {
    if (ball.y < goalTop || ball.y > goalBot) {
      ball.x = cw - goalW - ball.radius; ball.vx *= -0.8;
    }
  }

  // Player-ball interaction
  for (const p of players) {
    if (!p.alive) continue;
    const dx = ball.x - p.x;
    const dy = ball.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < p.radius + ball.radius) {
      const angle = Math.atan2(dy, dx);
      const kickForce = inputPlayers[p.index].action ? 10 : 4;
      ball.vx = Math.cos(angle) * kickForce;
      ball.vy = Math.sin(angle) * kickForce;
      ball.lastKicker = p.index;
      // Separate ball
      ball.x = p.x + Math.cos(angle) * (p.radius + ball.radius + 1);
      ball.y = p.y + Math.sin(angle) * (p.radius + ball.radius + 1);
      spawnParticle(ball.x, ball.y, '#FFFFFF', 3, 2, 10);
    }
  }
}

function resetBall() {
  ball.x = cw / 2;
  ball.y = ch / 2;
  ball.vx = 0;
  ball.vy = 0;
}

function checkFutbolWin() {
  // First to 3 goals
  for (const p of players) {
    if ((p.score - (p.roundStart || 0)) >= 3) {
      endRound();
      return;
    }
  }
}

// ── Coin Grab ──
function updateCoinGrab() {
  gameTimer--;

  // Spawn coins every 1.5s (90 frames)
  coinSpawnTimer++;
  if (coinSpawnTimer >= 90) {
    coinSpawnTimer = 0;
    coins.push({
      x: 40 + Math.random() * (cw - 80),
      y: 40 + Math.random() * (ch - 80),
      radius: 10,
      life: 600 // 10 seconds
    });
  }

  // Collect coins
  for (let ci = coins.length - 1; ci >= 0; ci--) {
    const c = coins[ci];
    c.life--;
    if (c.life <= 0) { coins.splice(ci, 1); continue; }

    for (const p of players) {
      if (!p.alive) continue;
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < p.radius + c.radius) {
        p.coins++;
        p.score = (p.roundStart || 0) + p.coins;
        spawnParticle(c.x, c.y, '#FFD700', 8, 3, 15);
        coins.splice(ci, 1);
        break;
      }
    }
  }

  if (gameTimer <= 0) {
    endRound();
  }
}

// ── Dodge ──
function updateDodge() {
  dodgeSpawnTimer++;
  dodgeSpeed += 0.001; // gets faster

  // Spawn falling objects
  if (dodgeSpawnTimer >= Math.max(10, 40 - Math.floor(dodgeSpeed * 3))) {
    dodgeSpawnTimer = 0;
    fallingObjects.push({
      x: 20 + Math.random() * (cw - 40),
      y: -20,
      vy: dodgeSpeed,
      radius: 10 + Math.random() * 10,
      color: `hsl(${Math.random() * 60}, 80%, 50%)`
    });
  }

  // Update falling objects
  for (let fi = fallingObjects.length - 1; fi >= 0; fi--) {
    const f = fallingObjects[fi];
    f.y += f.vy;
    if (f.y > ch + 30) { fallingObjects.splice(fi, 1); continue; }

    // Hit players
    for (const p of players) {
      if (!p.alive || p.invincible > 0) continue;
      const dx = p.x - f.x;
      const dy = p.y - f.y;
      if (Math.sqrt(dx * dx + dy * dy) < p.radius + f.radius) {
        p.hp -= 35;
        p.invincible = 30;
        spawnParticle(f.x, f.y, f.color, 8, 4, 15);
        triggerShake(4, 8);
        fallingObjects.splice(fi, 1);
        if (p.hp <= 0) killPlayer(p);
        break;
      }
    }
  }

}

// ── Race ──
function updateRace() {
  // Find leading player
  let maxX = 0;
  for (const p of players) {
    if (!p.alive) continue;
    const inp = inputPlayers[p.index];

    // Horizontal movement
    p.raceX += (inp.x > 0.1 ? 3 : 0) + (inp.x > 0.5 ? 2 : 0);
    p.raceX = Math.max(0, p.raceX);

    // Jump
    if (inp.jump && p.onGround) {
      p.vy = -8;
      p.onGround = false;
    }

    // Gravity
    p.vy += 0.4;
    p.y += p.vy;

    // Ground
    p.onGround = false;
    if (p.y + p.radius >= ch - 20) {
      p.y = ch - 20 - p.radius;
      p.vy = 0;
      p.onGround = true;
    }

    // Obstacle collision
    for (const obs of raceObstacles) {
      const relX = obs.x - raceOffset;
      if (p.raceX + p.radius > obs.x && p.raceX - p.radius < obs.x + obs.w) {
        if (p.y + p.radius > obs.y) {
          // Hit obstacle - push back or land on top
          if (p.vy > 0 && p.y + p.radius - p.vy <= obs.y) {
            p.y = obs.y - p.radius;
            p.vy = 0;
            p.onGround = true;
          } else {
            p.raceX = obs.x - p.radius;
          }
        }
      }
    }

    if (p.raceX > maxX) maxX = p.raceX;

    // Win check
    if (p.raceX >= raceFinishX) {
      p.score++;
      endRound();
      return;
    }
  }

  // Camera follows leading player
  raceOffset = Math.max(0, maxX - cw * 0.3);

  // Update screen X for each player
  for (const p of players) {
    p.x = p.raceX - raceOffset + 50;
  }
}

// ─────────────────────────────────────────────
//  LAVA MAP UPDATE
// ─────────────────────────────────────────────
function updateLava() {
  if (currentMode !== 'vs' || currentMap !== 'lava') return;
  lavaTimer++;
  // Shrink safe zone over time
  const minRadius = 40;
  const maxR = Math.min(cw, ch) * 0.45;
  lavaRadius = Math.max(minRadius, maxR - lavaTimer * 0.15);
}

// ─────────────────────────────────────────────
//  ROUND / MATCH MANAGEMENT
// ─────────────────────────────────────────────
function checkRoundEnd() {
  if (gameState !== 'playing') return;

  if (currentMode === 'vs' || currentMinigame === 'sumo' || currentMinigame === 'dodge') {
    const alive = players.filter(p => p.alive);
    if (alive.length <= 1) {
      if (alive.length === 1) {
        alive[0].score++;
      }
      endRound();
    }
  }
}

function endRound() {
  if (gameState !== 'playing') return;
  gameState = 'roundEnd';
  updateHUD();

  // Show round result briefly then next round or match end
  roundTimeout = setTimeout(() => {
    if (currentRound >= maxRounds) {
      endMatch();
    } else {
      currentRound++;
      startRound();
    }
  }, 2000);
}

function endMatch() {
  gameState = 'matchEnd';
  showWinner();
  if (onlineMode && isHost) { netFrame = 1; sendOnlineState(); }
}

function startRound() {
  gameState = 'playing';
  countdownActive = true;
  countdownTimer = 180; // 3 seconds at 60fps
  particles = [];
  projectiles = [];
  fallingObjects = [];
  coins = [];
  dodgeSpeed = 2;
  dodgeSpawnTimer = 0;
  coinSpawnTimer = 0;

  // Re-spawn players (keep scores and weapons)
  const weapons = players.map(p => p.weapon);
  const scores = players.map(p => p.score);
  spawnPlayers(weapons);
  players.forEach((p, i) => { p.score = scores[i]; p.roundStart = scores[i]; });

  initMap();
  if (currentMode === 'minigame') initMinigame();
}

function startCountdown(cb) {
  countdownActive = true;
  countdownTimer = 180;
}

// ─────────────────────────────────────────────
//  RENDERING - STICKMAN
// ─────────────────────────────────────────────
function drawStickman(x, y, angle, color, weapon, isAttacking, hp, playerIdx) {
  ctx.save();
  ctx.translate(x, y);

  // Glow effect when attacking
  if (isAttacking) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
  }

  // Trail
  const p = players[playerIdx];
  const look = window.PartyEconomy ? window.PartyEconomy.look(playerIdx) : null;
  if (p && p.trail.length > 0) {
    ctx.globalAlpha = 0.15;
    for (const t of p.trail) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(t.x - x, t.y - y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Determine facing (left or right)
  const facingRight = Math.cos(angle) >= 0;
  const faceDir = facingRight ? 1 : -1;

  // Body color
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(0, -20, 9, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(faceDir * 3, -22, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(faceDir * 3.5, -22, 1.2, 0, Math.PI * 2);
  ctx.fill();
  if (look && look.accessory) PartyEconomy.drawAccessory(ctx, look.accessory.kind, 0, -20, 1, faceDir);

  // Body
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(0, 8);
  ctx.stroke();
  if (look) PartyEconomy.drawOutfit(ctx, look.outfit, 0, 8, 0, -11, 5);

  // Legs
  const walkPhase = Date.now() * 0.008;
  const legSwing = (p && (Math.abs(p.vx) > 0.5 || Math.abs(p.vy) > 0.5))
    ? Math.sin(walkPhase) * 6 : 0;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-5 + legSwing, 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(5 - legSwing, 22);
  ctx.stroke();

  // Arms + weapon
  const armBaseX = 0, armBaseY = -5;
  const weaponAngle = isAttacking ? angle + Math.sin(Date.now() * 0.02) * 0.5 : angle;
  const wepDef = WEAPONS[weapon];

  // Back arm
  ctx.beginPath();
  ctx.moveTo(armBaseX, armBaseY);
  ctx.lineTo(armBaseX - faceDir * 8, armBaseY + 10);
  ctx.stroke();

  // Front arm + weapon
  if (wepDef) {
    const handX = armBaseX + Math.cos(weaponAngle) * 14;
    const handY = armBaseY + Math.sin(weaponAngle) * 14;

    ctx.beginPath();
    ctx.moveTo(armBaseX, armBaseY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Draw weapon
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(weaponAngle);

    switch (weapon) {
      case 'sword':
        ctx.strokeStyle = wepDef.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(22, 0);
        ctx.stroke();
        // Guard
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.stroke();
        break;

      case 'gun':
        ctx.fillStyle = '#555';
        ctx.fillRect(0, -3, 16, 6);
        ctx.fillStyle = wepDef.color;
        ctx.fillRect(14, -4, 6, 3);
        break;

      case 'bomb':
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(8, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        // Fuse
        ctx.strokeStyle = '#FF6600';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(13, -4);
        ctx.lineTo(17, -8);
        ctx.stroke();
        // Spark
        if (Math.random() < 0.5) {
          ctx.fillStyle = '#FFAA00';
          ctx.beginPath();
          ctx.arc(17, -8, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'hammer':
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(18, 0);
        ctx.stroke();
        // Head
        ctx.fillStyle = '#666';
        ctx.fillRect(16, -7, 10, 14);
        break;
    }
    ctx.restore();
  } else {
    // No weapon - simple arm
    ctx.beginPath();
    ctx.moveTo(armBaseX, armBaseY);
    ctx.lineTo(armBaseX + faceDir * 8, armBaseY + 10);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // HP bar above head
  if (hp < 100 && hp > 0) {
    const barW = 30, barH = 4;
    const hpRatio = Math.max(0, hp / 100);
    ctx.fillStyle = '#333';
    ctx.fillRect(-barW / 2, -35, barW, barH);
    // Color gradient: green -> yellow -> red
    const r = Math.round(255 * (1 - hpRatio));
    const g = Math.round(255 * hpRatio);
    ctx.fillStyle = `rgb(${r},${g},0)`;
    ctx.fillRect(-barW / 2, -35, barW * hpRatio, barH);
  }

  // Player label
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(PLAYER_NAMES[playerIdx], 0, -38);

  ctx.restore();
}

// ─────────────────────────────────────────────
//  RENDERING - MAPS
// ─────────────────────────────────────────────
function drawMap() {
  if (currentMode === 'vs') {
    switch (currentMap) {
      case 'arena':   drawArenaMap(); break;
      case 'castle':  drawCastleMap(); break;
      case 'platforms': drawPlatformsMap(); break;
      case 'lava':    drawLavaMap(); break;
    }
  } else {
    switch (currentMinigame) {
      case 'sumo':    drawSumoMap(); break;
      case 'futbol':  drawFutbolMap(); break;
      case 'coins':   drawCoinsMap(); break;
      case 'dodge':   drawDodgeMap(); break;
      case 'race':    drawRaceMap(); break;
    }
  }
}

function drawArenaMap() {
  const cx = cw / 2, cy = ch / 2;
  const r = Math.min(cw, ch) * 0.4;

  // Arena floor
  ctx.fillStyle = '#2a3a2a';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Danger border
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner ring
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // Center mark
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawCastleMap() {
  // Floor
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(10, 10, cw - 20, ch - 20);

  // Border
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, cw - 20, ch - 20);

  // Walls
  for (const w of castleWalls) {
    if (w.hp <= 0) continue;
    const hpRatio = w.hp / 60;
    ctx.fillStyle = `rgb(${Math.round(120 + 80 * (1 - hpRatio))}, ${Math.round(120 * hpRatio)}, ${Math.round(120 * hpRatio)})`;
    ctx.fillRect(w.x, w.y, w.w, w.h);

    // Cracks when damaged
    if (hpRatio < 0.7) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w.x + w.w * 0.3, w.y);
      ctx.lineTo(w.x + w.w * 0.5, w.y + w.h * 0.6);
      ctx.lineTo(w.x + w.w * 0.7, w.y + w.h);
      ctx.stroke();
    }
    if (hpRatio < 0.4) {
      ctx.beginPath();
      ctx.moveTo(w.x + w.w * 0.6, w.y);
      ctx.lineTo(w.x + w.w * 0.4, w.y + w.h);
      ctx.stroke();
    }

    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
}

function drawPlatformsMap() {
  // Background - sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, '#1a1a3a');
  grad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  // Platforms
  const platColors = ['#5577BB', '#44AA66', '#BB6644', '#8855AA', '#AAAA44', '#55AABB'];
  for (let i = 0; i < platforms.length; i++) {
    const pl = platforms[i];
    ctx.fillStyle = platColors[i % platColors.length];
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    // Platform shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(pl.x, pl.y + pl.h, pl.w, 4);
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(pl.x, pl.y, pl.w, 2);
  }

  // Death zone indicator
  ctx.fillStyle = 'rgba(255,0,0,0.1)';
  ctx.fillRect(0, ch - 5, cw, 5);
}

function drawLavaMap() {
  const cx = cw / 2, cy = ch / 2;

  // Lava background (animated)
  const t = Date.now() * 0.003;
  for (let i = 0; i < 5; i++) {
    const pulse = Math.sin(t + i * 1.3) * 10;
    ctx.fillStyle = `rgba(${200 + i * 10}, ${50 + i * 10}, 0, ${0.08 - i * 0.012})`;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(cw, ch) * 0.48 + pulse + i * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Safe zone
  ctx.fillStyle = '#2a3a2a';
  ctx.beginPath();
  ctx.arc(cx, cy, lavaRadius, 0, Math.PI * 2);
  ctx.fill();

  // Safe zone border (pulsing)
  ctx.strokeStyle = `rgba(255, ${Math.round(100 + Math.sin(t * 2) * 50)}, 0, 0.8)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, lavaRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Danger text
  if (lavaRadius < Math.min(cw, ch) * 0.2) {
    ctx.fillStyle = 'rgba(255,100,0,0.5)';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ LAVA CLOSING ⚠', cx, cy + lavaRadius + 20);
  }
}

// ── Minigame Maps ──
function drawSumoMap() {
  const cx = cw / 2, cy = ch / 2;
  const r = Math.min(cw, ch) * 0.35;

  // Ring
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Rope border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFutbolMap() {
  // Pitch
  ctx.fillStyle = '#1a5a1a';
  ctx.fillRect(0, 40, cw, ch - 40);

  // Field lines
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  // Center line
  ctx.beginPath();
  ctx.moveTo(cw / 2, 40);
  ctx.lineTo(cw / 2, ch);
  ctx.stroke();
  // Center circle
  ctx.beginPath();
  ctx.arc(cw / 2, ch / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Goals
  const goalH = ch * 0.3;
  const goalTop = ch / 2 - goalH / 2;
  // Left goal
  ctx.fillStyle = 'rgba(255,100,100,0.3)';
  ctx.fillRect(0, goalTop, 15, goalH);
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, goalTop, 15, goalH);
  // Right goal
  ctx.fillStyle = 'rgba(100,100,255,0.3)';
  ctx.fillRect(cw - 15, goalTop, 15, goalH);
  ctx.strokeStyle = '#4444FF';
  ctx.lineWidth = 3;
  ctx.strokeRect(cw - 15, goalTop, 15, goalH);

  // Score display in header
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  const team1Score = players[0] ? players[0].score : 0;
  const team2Score = players[1] ? players[1].score : 0;
  ctx.fillText(`${team1Score} - ${team2Score}`, cw / 2, 28);

  // Ball
  if (ball) {
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    // Pentagon pattern
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCoinsMap() {
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(0, 0, cw, ch);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < cw; gx += 50) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke();
  }
  for (let gy = 0; gy < ch; gy += 50) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke();
  }

  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('⏱ ' + Math.max(0, Math.ceil(gameTimer / 60)) + 's', cw / 2, 28);
  // Draw coins
  for (const c of coins) {
    const flash = Math.sin(Date.now() * 0.01 + c.x) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(255,215,0,${flash})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();
    // $ symbol
    ctx.fillStyle = '#8B6914';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', c.x, c.y);
  }
}

function drawDodgeMap() {
  // Background
  ctx.fillStyle = '#0a0a2a';
  ctx.fillRect(0, 0, cw, ch);

  // Ground
  ctx.fillStyle = '#333';
  ctx.fillRect(0, ch - 20, cw, 20);

  // Falling objects
  for (const f of fallingObjects) {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
    // Shadow below
    ctx.fillStyle = 'rgba(255,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(f.x, ch - 20, f.radius * 0.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warning lines
  ctx.strokeStyle = 'rgba(255,0,0,0.1)';
  ctx.lineWidth = 1;
  for (const f of fallingObjects) {
    if (f.y < ch * 0.3) {
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + f.radius);
      ctx.lineTo(f.x, ch - 20);
      ctx.stroke();
    }
  }
}

function drawRaceMap() {
  // Sky
  ctx.fillStyle = '#1a2a4a';
  ctx.fillRect(0, 0, cw, ch);

  // Ground
  ctx.fillStyle = '#3a3a2a';
  ctx.fillRect(0, ch - 20, cw, 20);
  ctx.fillStyle = '#555';
  ctx.fillRect(0, ch - 22, cw, 2);

  // Obstacles
  for (const obs of raceObstacles) {
    const sx = obs.x - raceOffset;
    if (sx < -50 || sx > cw + 50) continue;
    ctx.fillStyle = '#884422';
    ctx.fillRect(sx, obs.y, obs.w, ch - 20 - obs.y);
    ctx.strokeStyle = '#AA6633';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, obs.y, obs.w, ch - 20 - obs.y);
  }

  // Finish line
  const finishSX = raceFinishX - raceOffset;
  if (finishSX > -20 && finishSX < cw + 20) {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(finishSX, 0, 4, ch - 20);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FİNİŞ', finishSX, 30);
  }

  // Progress bars at top
  for (const p of players) {
    if (!p.alive) continue;
    const progress = p.raceX / raceFinishX;
    ctx.fillStyle = p.color;
    ctx.fillRect(10, 10 + p.index * 12, (cw - 20) * progress, 8);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10 + p.index * 12, cw - 20, 8);
  }
}

// ─────────────────────────────────────────────
//  RENDERING - PROJECTILES
// ─────────────────────────────────────────────
function drawProjectiles() {
  for (const proj of projectiles) {
    if (proj.type === 'bullet') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      // Bullet trail
      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(proj.x, proj.y);
      ctx.lineTo(proj.x - proj.vx * 3, proj.y - proj.vy * 3);
      ctx.stroke();
    } else if (proj.type === 'bomb') {
      // Bomb body
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // Fuse glow
      const fuse = (proj.life / 120);
      ctx.fillStyle = `rgba(255, ${Math.round(100 * fuse)}, 0, ${1 - fuse * 0.5})`;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      // Timer flash when about to explode
      if (proj.life < 30 && Math.floor(proj.life / 4) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// ─────────────────────────────────────────────
//  HUD
// ─────────────────────────────────────────────
function updateHUD() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('scoreP' + (i + 1));
    if (!el) continue;
    if (i >= 2) {
      const bd = document.getElementById('badgeP' + (i + 1));
      if (bd) bd.classList.toggle('hidden', i >= playerCount);
    }
    const p = players[i];
    el.textContent = !p ? 0 : (currentMinigame === 'coins' ? p.coins + '🪙' : p.score);
  }
}

// ─────────────────────────────────────────────
//  COUNTDOWN OVERLAY
// ─────────────────────────────────────────────
function drawCountdown() {
  if (!countdownActive) return;

  const sec = Math.ceil(countdownTimer / 60);
  const text = sec > 0 ? sec.toString() : 'BAŞLA!';
  const progress = (countdownTimer % 60) / 60;

  // Overlay
  ctx.fillStyle = `rgba(0,0,0,${0.4 * progress})`;
  ctx.fillRect(0, 0, cw, ch);

  // Text
  const scale = 1 + (1 - progress) * 0.5;
  ctx.save();
  ctx.translate(cw / 2, ch / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = sec > 0 ? '#FFF' : '#44FF44';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = sec > 0 ? '#FFF' : '#44FF44';
  ctx.shadowBlur = 20;
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();

  countdownTimer--;
  if (countdownTimer <= -30) {
    countdownActive = false;
  }
}

// ─────────────────────────────────────────────
//  SCREEN MANAGEMENT
// ─────────────────────────────────────────────
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  refreshWalletUI();
  if (screenId === 'shopScreen') { renderShop(); startShopPreview(); } else stopShopPreview();
}

// ─────────────────────────────────────────────
//  MAIN GAME LOOP
// ─────────────────────────────────────────────
function gameLoop(timestamp) {
  animFrameId = requestAnimationFrame(gameLoop);

  // Delta time
  if (!lastTime) lastTime = timestamp;
  deltaTime = Math.min(timestamp - lastTime, 33.33); // cap at ~30fps min
  lastTime = timestamp;

  // Resize canvas
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cw = canvas.width;
    ch = canvas.height;
  }

  // Poll input
  pollKeyboard();

  if (gameState !== 'playing' && gameState !== 'roundEnd') {
    // Draw idle/menu background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, cw, ch);
    return;
  }

  if (paused) return;

  // ── UPDATE ──
  if (gameState === 'playing' && !(onlineMode && !isHost) && (!countdownActive || countdownTimer < 0)) {
    updatePlayers();
    updateCombat();
    updateProjectiles();
    updateParticles();
    updateShake();

    if (currentMode === 'vs') {
      updateLava();
      checkRoundEnd();
    } else {
      updateMinigame();
      if (currentMinigame !== 'futbol' && currentMinigame !== 'coins') {
        checkRoundEnd();
      }
    }

  } else {
    updateParticles();
  }
  if (onlineMode) sendOnlineState();
  window._ht = (window._ht || 0) + 1;
  if (window._ht % 6 === 0) updateHUD();

  // ── DRAW ──
  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Clear
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#111';
  ctx.fillRect(-10, -10, cw + 20, ch + 20);

  // Draw map
  drawMap();

  // Draw projectiles
  drawProjectiles();

  // Draw players
  for (const p of players) {
    if (!p.alive) continue;
    // Invincibility flash
    if (p.invincible > 0 && Math.floor(p.invincible / 3) % 2 === 0) continue;
    drawStickman(p.x, p.y, p.angle, p.color, p.weapon, p.isAttacking, p.hp, p.index);
  }

  // Draw particles
  drawParticles();

  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('Raund ' + currentRound + '/' + maxRounds, cw / 2, ch - 6);
  drawCountdown();

  // Round end text
  if (gameState === 'roundEnd') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const alive = players.filter(p => p.alive);
    if (alive.length === 1) {
      ctx.fillStyle = alive[0].color;
      ctx.fillText(`${PLAYER_NAMES[alive[0].index]} Qazandı!`, cw / 2, ch / 2);
    } else {
      ctx.fillText('Raund Bitdi!', cw / 2, ch / 2);
    }
  }
}

// ─────────────────────────────────────────────
//  PUBLIC API - Called by HTML UI
// ─────────────────────────────────────────────

/**
 * Start a new game
 * @param {string} mode - 'vs' or 'minigame'
 * @param {string} map - map/minigame name
 * @param {number} pCount - player count (2-4)
 * @param {number} rounds - max rounds
 * @param {string[]} weaponChoices - weapon for each player (vs mode)
 */
function startGame(mode, map, pCount, rounds, weaponChoices) {
  // Reset state
  gameState = 'playing';
  PartyEconomy.beginMatch();
  currentMode = mode;
  playerCount = pCount || 2;
  maxRounds = rounds || 3;
  clearTimeout(roundTimeout);
  currentRound = 1;
  particles = [];
  projectiles = [];
  paused = false;
  const po = document.getElementById('pauseOverlay'); if (po) po.classList.remove('visible');

  if (mode === 'vs') {
    currentMap = map || 'arena';
    currentMinigame = '';
  } else {
    currentMinigame = map || 'sumo';
  }

  // Ensure canvas is ready
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  cw = canvas.width;
  ch = canvas.height;

  // Spawn players
  spawnPlayers(weaponChoices || ['sword', 'gun', 'bomb', 'hammer']);

  // Init map
  initMap();
  if (mode === 'minigame') initMinigame();

  // Setup touch controls
  setupAllJoysticks(onlineMode ? 1 : playerCount);

  // Show game screen
  showScreen('gameScreen');
  const hud = document.getElementById('hud');
  if (hud) hud.style.display = 'flex';
  hideWinner();

  // Start countdown
  countdownActive = true;
  countdownTimer = 180;

  // Update HUD
  updateHUD();

  // Start game loop
  lastTime = 0;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  paused = true;
}

function resumeGame() {
  paused = false;
}

function routeHome() {
  showScreen(navigator.onLine ? 'onlineMenu' : 'offlineMenu');
}
function quitToMenu() {
  gameState = 'menu';
  paused = false;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  clearTimeout(roundTimeout);
  netCleanup();

  routeHome();
  const hud = document.getElementById('hud');
  if (hud) hud.style.display = 'none';
  hideWinner();
}

function restartMatch() {
  clearTimeout(roundTimeout);
  hideWinner();
  PartyEconomy.beginMatch();

  currentRound = 1;
  players.forEach(p => { p.score = 0; });
  startRound();
}

// ─────────────────────────────────────────────
//  INITIALIZATION
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cw = canvas.width;
    ch = canvas.height;
  }

  // Prevent scrolling on touch


  // Handle window resize
  window.addEventListener('resize', () => {
    if (canvas) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      cw = canvas.width;
      ch = canvas.height;
    }
    joysticks.forEach(j => {
      if (!j.baseEl) return;
      const r = j.baseEl.getBoundingClientRect();
      j.cx = r.left + r.width / 2;
      j.cy = r.top + r.height / 2;
    });
  });

  // Keyboard prevent default for game keys
  window.addEventListener('keydown', e => {
    const gameKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Enter', 'Numpad0', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad8'];
    if (gameKeys.includes(e.code) && !/INPUT|TEXTAREA/.test(e.target.tagName)) e.preventDefault();
  });

  console.log('🎮 Stickman Party Engine loaded!');
});


// ─────────────────────────────────────────────
//  UI GLUE (connects index.html buttons to the engine)
// ─────────────────────────────────────────────
let uiMap = 'arena', uiGame = null, uiWeapons = ['sword', 'sword', 'sword', 'sword'], uiRounds = 3;
const MINI_LIST = ['sumo', 'futbol', 'coins', 'dodge', 'race'];
const MINI_ALIAS = { football: 'futbol', escape: 'dodge' };
const $ = id => document.getElementById(id);
const markSelected = (els, el) => { els.forEach(x => x.classList.remove('selected')); el.classList.add('selected'); };

function selectPlayerCount(n) {
  playerCount = n;
  document.querySelectorAll('.player-count-btn').forEach(b => b.classList.toggle('selected', +b.dataset.count === n));
  $('weaponRowP3').style.display = n >= 3 ? 'flex' : 'none';
  $('weaponRowP4').style.display = n >= 4 ? 'flex' : 'none';
}
function selectMap(el) { uiMap = el.dataset.map; markSelected([...document.querySelectorAll('#mapGrid .game-card')], el); }
function selectWeapon(el, p) { uiWeapons[p - 1] = el.dataset.weapon; markSelected([...el.parentElement.children], el); }
function startVsGame() { startGame('vs', uiMap, playerCount, uiRounds, uiWeapons.slice()); }
function selectMinigame(el) {
  uiGame = el.dataset.game;
  markSelected([...document.querySelectorAll('#minigameGrid .game-card')], el);
  $('btnStartMinigame').classList.remove('hidden');
}
function launchMini(name) { startGame('minigame', MINI_ALIAS[name] || name, playerCount, uiRounds); }
function startMinigame() { if (uiGame) launchMini(uiGame); }
function startRandomMinigame() { launchMini(MINI_LIST[Math.floor(Math.random() * MINI_LIST.length)]); }

// Online lobby
function joinByName() {
  const n = $('joinNameInput').value.trim();
  if (!n) return alert('Otaq adını daxil edin');
  promptRoomPassword(n);
}
function promptRoomPassword(name) {
  pendingRoom = name;
  $('passwordRoomName').textContent = 'Otaq: ' + name;
  $('joinPassInput').value = '';
  $('passwordPrompt').classList.add('visible');
}
function closePasswordPrompt() { $('passwordPrompt').classList.remove('visible'); }
function refreshRooms() {
  const box = $('roomList'); if (!box) return;
  if (!box.children.length) box.innerHTML = '<div class="no-rooms">Axtarılır...</div>';
  const show = rooms => {
    if (!rooms) { if (!box.querySelector('.room-item')) box.innerHTML = '<div class="no-rooms">Otaq siyahısı alınmadı. 🔄 Yenilə düyməsini sıxın.</div>'; return; }
    box.innerHTML = '';
    if (!rooms.length) { box.innerHTML = '<div class="no-rooms">Hələ otaq yoxdur. Dostun otaq yaratsın 🙂</div>'; return; }
    rooms.forEach(r => {
      const el = document.createElement('div'); el.className = 'room-item';
      const nm = document.createElement('span'); nm.className = 'room-name'; nm.textContent = (r.lock ? '🔒 ' : '🌐 ') + r.name;
      const pl = document.createElement('span'); pl.className = 'room-players'; pl.textContent = r.n + '/2' + (r.n >= 2 ? ' • Dolu' : '');
      el.append(nm, pl);
      if (r.n < 2) el.onclick = () => joinListed(r); else el.style.opacity = '.5';
      box.appendChild(el);
    });
  };
  if (Reg.peer) { const now = Date.now(); show([...Reg.rooms.values()].filter(r => now - r.t < 12000)); } else Reg.list(show);
}
function joinListed(r) {
  pendingRoom = r.name;
  if (r.lock) promptRoomPassword(r.name); else { $('joinPassInput').value = ''; joinRoom(); }
}
function leaveRoom() { netCleanup(); showScreen('onlineLobbyChoice'); }
function selectLobbyMode(m) {
  lobbyCfg.mode = m;
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('selected', b.dataset.mode === m));
}
function selectLobbyMap(el) { lobbyCfg.map = el.dataset.lmap; markSelected([...el.parentElement.children], el); }
function selectRounds(el) { lobbyCfg.rounds = +el.dataset.rounds; markSelected([...el.parentElement.children], el); }
function startLobbyGame() {
  if (!isHost) return;
  if (!conn || !conn.open) return alert('Rəqib hələ qoşulmayıb');
  const cfg = lobbyCfg.mode === 'vs'
    ? { mode: 'vs', map: lobbyCfg.map }
    : { mode: 'minigame', map: MINI_LIST[Math.floor(Math.random() * MINI_LIST.length)] };
  cfg.rounds = lobbyCfg.rounds;
  cfg.weapons = ['sword', 'gun'];
  conn.send({ type: 'start', cfg });
  startGame(cfg.mode, cfg.map, 2, cfg.rounds, cfg.weapons);
}

// Pause / end-of-match
function togglePause() {
  if (onlineMode && !isHost) return;
  if (!paused && gameState !== 'playing' && gameState !== 'roundEnd') return;
  paused = !paused;
  $('pauseOverlay').classList.toggle('visible', paused);
  lastTime = 0;
}
function restartGame() {
  if (onlineMode && !isHost) return;
  paused = false; $('pauseOverlay').classList.remove('visible'); restartMatch();
}
function quitGame() { paused = false; $('pauseOverlay').classList.remove('visible'); quitToMenu(); }
function playAgain() {
  if (onlineMode && !isHost) { if (conn && conn.open) conn.send({ type: 'rematch' }); return; }
  restartMatch();
}
function backToMenu() { quitToMenu(); }

function showWinner() {
  let best = players[0], tie = false;
  for (const p of players) {
    if (p === best) continue;
    if (p.score > best.score) { best = p; tie = false; } else if (p.score === best.score) tie = true;
  }
  const t = $('winnerText'), sc = $('winnerScore');
  t.textContent = tie ? 'Bərabərlik!' : (PLAYER_NAMES[best.index] || 'Oyunçu ' + (best.index + 1));
  t.style.color = tie ? '#fff' : best.color;
  sc.textContent = tie ? '🤝' : best.score + ' xal';
  sc.style.color = best.color;
  const reward = PartyEconomy.awardMatch(tie ? 0 : MATCH_WIN_BONUS);
  const rewardEl = $('matchReward'), amountEl = $('matchRewardAmount'), noteEl = $('matchRewardNote');
  if (rewardEl && amountEl && noteEl) {
    if (reward) {
      rewardEl.style.display = 'flex';
      amountEl.textContent = '+' + reward.total + ' coin';
      noteEl.textContent = reward.bonus ? 'Oyun mükafatı + qələbə bonusu' : 'Oyun mükafatı';
    } else {
      rewardEl.style.display = 'none';
    }
  }
  $('winnerOverlay').classList.add('visible');
  if (!tie) confetti();
}
function hideWinner() {
  const o = $('winnerOverlay'); if (o) o.classList.remove('visible');
  const c = $('confettiContainer'); if (c) { c.classList.remove('active'); c.innerHTML = ''; }
}
function confetti() {
  const c = $('confettiContainer'); c.innerHTML = ''; c.classList.add('active');
  const cols = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  for (let i = 0; i < 70; i++) {
    const d = document.createElement('div');
    d.className = 'confetti-piece';
    d.style.left = Math.random() * 100 + '%';
    d.style.background = cols[i % 5];
    d.style.animationDuration = (2 + Math.random() * 2.5) + 's';
    d.style.animationDelay = Math.random() * 0.8 + 's';
    c.appendChild(d);
  }
  setTimeout(() => { c.classList.remove('active'); c.innerHTML = ''; }, 5000);
}

window.addEventListener('DOMContentLoaded', () => {
  selectPlayerCount(2);
  selectMap(document.querySelector('#mapGrid .game-card'));
  initShopUI();
  initNameGate();
  const pf = $('particleField');
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('div');
    d.className = 'particle';
    d.style.left = Math.random() * 100 + '%';
    d.style.animationDuration = (8 + Math.random() * 12) + 's';
    d.style.animationDelay = (-Math.random() * 15) + 's';
    pf.appendChild(d);
  }
  const upd = () => {
    const on = navigator.onLine;
    const dot = $('statusDot'), txt = $('statusText'), sw = $('switchToOnline');
    if (dot) dot.className = 'status-dot ' + (on ? 'online' : 'offline');
    if (txt) txt.textContent = on ? 'Onlayn' : 'Oflayn';
    if (sw) sw.classList.toggle('hidden', !on);
  };
  window.addEventListener('online', upd); window.addEventListener('offline', upd); upd();
  setTimeout(routeHome, 2800);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
});


// ─────────────────────────────────────────────
//  ROOM REGISTRY
//  PeerJS' free server cannot list peers, so the first open device claims a fixed
//  "registry" peer id and acts as the room directory. Room hosts announce themselves
//  to it every 4s; clients ask it for the list. If the registry device leaves, another
//  device claims the id within ~10s and hosts re-announce automatically.
// ─────────────────────────────────────────────
const REG_ID = 'stickparty-registry-v1x';
const Reg = { peer: null, pending: false, rooms: new Map(), annConn: null, annTimer: null, listT: null };
Reg.claim = function () {
  if (typeof Peer === 'undefined' || Reg.peer || Reg.pending || !navigator.onLine) return;
  Reg.pending = true;
  const p = new Peer(REG_ID);
  p.on('open', () => { Reg.pending = false; Reg.peer = p; });
  p.on('error', () => { Reg.pending = false; try { p.destroy(); } catch (e) {} if (Reg.peer === p) Reg.peer = null; });
  p.on('close', () => { if (Reg.peer === p) Reg.peer = null; });
  p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
  p.on('connection', c => {
    c.on('data', d => {
      if (!d) return;
      if (d.type === 'reg') Reg.rooms.set(d.id, { id: d.id, name: String(d.name).slice(0, 20), lock: !!d.lock, n: d.n | 0, t: Date.now() });
      else if (d.type === 'unreg') Reg.rooms.delete(d.id);
      else if (d.type === 'list') {
        const now = Date.now(); for (const [k, v] of Reg.rooms) if (now - v.t > 12000) Reg.rooms.delete(k);
        c.send({ type: 'rooms', rooms: [...Reg.rooms.values()] });
      }
    });
  });
};
Reg.list = function (cb) {
  if (typeof Peer === 'undefined') return cb(null);
  let done = false, lp = null;
  const fin = r => { if (done) return; done = true; clearTimeout(to); try { lp && lp.destroy(); } catch (e) {} cb(r); };
  const to = setTimeout(() => { fin(null); Reg.claim(); }, 6000);
  lp = new Peer();
  lp.on('error', () => { fin(null); Reg.claim(); });
  lp.on('open', () => {
    const c = lp.connect(REG_ID);
    c.on('open', () => c.send({ type: 'list' }));
    c.on('data', d => { if (d && d.type === 'rooms') fin(d.rooms); });
  });
};
Reg.announceStart = function () {
  Reg.announceStop();
  const send = () => {
    if (!peer || !isHost || !roomInfo.name) return;
    try {
      if (!Reg.annConn || !Reg.annConn.open) {
        if (Reg.annConn) return; // connecting
        const c = peer.connect(REG_ID);
        Reg.annConn = c;
        c.on('open', send); c.on('error', () => { Reg.annConn = null; }); c.on('close', () => { Reg.annConn = null; });
        setTimeout(() => { if (Reg.annConn === c && !c.open) { Reg.annConn = null; } }, 5000);
        return;
      }
      Reg.annConn.send({ type: 'reg', id: peer.id, name: roomInfo.name, lock: !!roomInfo.password, n: (conn && conn.open) ? 2 : 1 });
    } catch (e) {}
  };
  send(); Reg.annTimer = setInterval(send, 4000);
};
Reg.announceStop = function () {
  clearInterval(Reg.annTimer); Reg.annTimer = null;
  try { if (Reg.annConn && Reg.annConn.open) Reg.annConn.send({ type: 'unreg', id: peer && peer.id }); } catch (e) {}
  try { Reg.annConn && Reg.annConn.close(); } catch (e) {}
  Reg.annConn = null;
};
const _showScreenReg = showScreen;
showScreen = function (id) {
  _showScreenReg(id);
  clearInterval(Reg.listT);
  if (id === 'roomJoin') { refreshRooms(); Reg.listT = setInterval(refreshRooms, 5000); }
};
window.addEventListener('DOMContentLoaded', () => { Reg.claim(); setInterval(() => Reg.claim(), 10000); });
