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
const DEFAULT_PLAYER_COLORS = PLAYER_COLORS.slice();
const COLOR_CHOICES = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ff4fd8', '#8b5cf6', '#2dd4ff', '#b6f34a', '#f97316', '#14b8a6'];
const HAT_KINDS = ['cap', 'beanie', 'cowboy', 'wizard', 'viking', 'pirate', 'helmet', 'tophat', 'crown'];
// papaqlar ayrı slotdadır: papaq + aksesuar eyni anda geyilə bilər
const slotOf = item => item.category === 'accessory' && HAT_KINDS.includes(item.kind) ? 'hat' : item.category;

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
  { id: 'headband', name: 'Döyüş lenti', desc: 'Klassik döyüşçü lenti', category: 'accessory', price: 150, kind: 'headband', accent: '#ffffff' },
  { id: 'bracelet', name: 'Qızıl qolbaq', desc: 'Biləkdə parıltı', category: 'accessory', price: 200, kind: 'bracelet', accent: '#ffc83d' },
  { id: 'necklace', name: 'Boyunbaq', desc: 'Zərif qızıl zəncir', category: 'accessory', price: 240, kind: 'necklace', accent: '#ffd54a' },
  { id: 'gold', name: 'Qızıl zireh', desc: 'Çempionun parıltısı', category: 'outfit', price: 800, body: '#ffc83d', accent: '#fff3c4', pattern: 'vest', glow: '#ffc83d' },
  { id: 'cyber', name: 'Kiber kostyum', desc: 'Rəqəmsal döyüş xətləri', category: 'outfit', price: 700, body: '#0b1220', accent: '#2dd4ff', pattern: 'stripes', glow: '#2dd4ff' },
  { id: 'knight', name: 'Cəngavər zirehi', desc: 'Polad qatlı müdafiə', category: 'outfit', price: 620, body: '#94a3b8', accent: '#e2e8f0', pattern: 'vest', glow: '#cbd5e1' },
  { id: 'rainbow', name: 'Göy qurşağı', desc: 'Yeddi rəngli enerji', category: 'outfit', price: 750, body: '#ff4fd8', accent: '#2dd4ff', pattern: 'rainbow', glow: '#ff4fd8' },
  { id: 'shadow', name: 'Kölgə libası', desc: 'Qaranlıq suiqəstçi', category: 'outfit', price: 580, body: '#1e1b4b', accent: '#8b5cf6', pattern: 'plain', glow: '#8b5cf6' },
  { id: 'club_qarabag', name: 'Qarabağ forması', desc: 'Atlı süvarilərin qara-ağ rəngləri', category: 'outfit', club: true, price: 600, body: '#111418', accent: '#f8fafc', pattern: 'jp', glow: '#f8fafc' },
  { id: 'club_neftci', name: 'Neftçi forması', desc: 'Qırmızı-qara şaquli zolaqlar', category: 'outfit', club: true, price: 600, body: '#dc2626', accent: '#111418', pattern: 'jv', glow: '#dc2626' },
  { id: 'club_bjk', name: 'Beşiktaş forması', desc: 'Qara-ağ qartal ruhu', category: 'outfit', club: true, price: 650, body: '#111418', accent: '#f8fafc', pattern: 'jv', glow: '#f8fafc' },
  { id: 'club_gs', name: 'Galatasaray forması', desc: 'Sarı-qırmızı aslan rəngləri', category: 'outfit', club: true, price: 650, body: '#d71920', accent: '#ffc928', pattern: 'jh', glow: '#ffc928' },
  { id: 'club_fb', name: 'Fənərbaxça forması', desc: 'Sarı-lacivərd kanareyka zolaqları', category: 'outfit', club: true, price: 650, body: '#ffd100', accent: '#0b2a6f', pattern: 'jv', glow: '#ffd100' },
  { id: 'club_ts', name: 'Trabzonspor forması', desc: 'Bordo-mavi fırtına', category: 'outfit', club: true, price: 600, body: '#8b1d3a', accent: '#38a8f0', pattern: 'jh', glow: '#38a8f0' },
  { id: 'club_real', name: 'Real Madrid forması', desc: 'Ağ kral kostyumu, qızıl yaxalıq', category: 'outfit', club: true, price: 750, body: '#f8fafc', accent: '#d4a72c', pattern: 'jp', glow: '#e2e8f0' },
  { id: 'club_barca', name: 'Barselona forması', desc: 'Göy-qırmızı (blaugrana) zolaqlar', category: 'outfit', club: true, price: 750, body: '#1d4ed8', accent: '#a50044', pattern: 'jv', glow: '#a50044' },
  { id: 'club_atm', name: 'Atletiko forması', desc: 'Qırmızı-ağ zolaqlı döyüşçü', category: 'outfit', club: true, price: 650, body: '#e11d2e', accent: '#f8fafc', pattern: 'jv', glow: '#e11d2e' },
  { id: 'club_city', name: 'Mançester Siti forması', desc: 'Səma mavisi şəhər forması', category: 'outfit', club: true, price: 700, body: '#6cc6f0', accent: '#0b2a6f', pattern: 'jp', glow: '#6cc6f0' },
  { id: 'club_lfc', name: 'Liverpul forması', desc: 'Qırmızı Anfield enerjisi', category: 'outfit', club: true, price: 700, body: '#c8102e', accent: '#f8fafc', pattern: 'jp', glow: '#c8102e' },
  { id: 'club_psg', name: 'PSJ forması', desc: 'Lacivərd, qırmızı mərkəz zolağı', category: 'outfit', club: true, price: 700, body: '#0b1f4d', accent: '#e11d2e', pattern: 'jc', glow: '#4a73d9' }
];

const PartyEconomy = (() => {
  const byId = id => SHOP_ITEMS.find(i => i.id === id);
  const defaultEquipped = () => ({ 0: { outfit: 'classic', hat: null, accessory: null }, 1: { outfit: 'classic', hat: null, accessory: null }, 2: { outfit: 'classic', hat: null, accessory: null }, 3: { outfit: 'classic', hat: null, accessory: null } });
  function normalize(p) {
    const prof = { coins: 0, name: '', owned: ['classic'], equipped: defaultEquipped(), colors: DEFAULT_PLAYER_COLORS.slice(), muted: false, matches: 0, volume: 0.8, musicVolume: 0.4, musicMuted: false, battleVolume: 0.4, battleMuted: false };
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
          const accessory = byId(e.accessory), hatItem = byId(e.hat);
          prof.equipped[i].outfit = outfit && outfit.category === 'outfit' && prof.owned.includes(outfit.id) ? outfit.id : 'classic';
          let hat = hatItem && slotOf(hatItem) === 'hat' && prof.owned.includes(hatItem.id) ? hatItem.id : null;
          let acc = null;
          if (accessory && accessory.category === 'accessory' && prof.owned.includes(accessory.id)) {
            if (slotOf(accessory) === 'hat') { if (!hat) hat = accessory.id; } else acc = accessory.id;
          }
          prof.equipped[i].hat = hat;
          prof.equipped[i].accessory = acc;
        }
      }
      if (Array.isArray(p.colors)) for (let i = 0; i < 4; i++) if (COLOR_CHOICES.includes(p.colors[i])) prof.colors[i] = p.colors[i];
      prof.muted = !!p.muted;
      prof.volume = Number.isFinite(p.volume) ? Math.max(0, Math.min(1, p.volume)) : 0.8;
      prof.musicVolume = Number.isFinite(p.musicVolume) ? Math.max(0, Math.min(1, p.musicVolume)) : 0.4;
      prof.musicMuted = !!p.musicMuted;
      prof.battleVolume = Number.isFinite(p.battleVolume) ? Math.max(0, Math.min(1, p.battleVolume)) : 0.4;
      prof.battleMuted = !!p.battleMuted;
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
  function applyColors() {
    for (let i = 0; i < 4; i++) {
      PLAYER_COLORS[i] = profile.colors[i];
      document.documentElement.style.setProperty('--p' + (i + 1) + '-color', profile.colors[i]);
    }
  }
  applyColors();
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
    volume: () => profile.volume,
    setVolume(v) { profile.volume = Math.max(0, Math.min(1, +v || 0)); save(); },
    musicVolume: () => profile.musicVolume,
    isMusicMuted: () => profile.musicMuted,
    battleVolume: () => profile.battleVolume,
    isBattleMuted: () => profile.battleMuted,
    setBattleVolume(v) { profile.battleVolume = Math.max(0, Math.min(1, +v || 0)); save(); },
    setBattleMuted(v) { profile.battleMuted = !!v; save(); },
    setMusicVolume(v) { profile.musicVolume = Math.max(0, Math.min(1, +v || 0)); save(); },
    setMusicMuted(v) { profile.musicMuted = !!v; save(); },
    owned: id => profile.owned.includes(id),
    equippedId: (i, cat) => profile.equipped[i] ? profile.equipped[i][cat] : (cat === 'outfit' ? 'classic' : null),
    look(i) {
      const e = profile.equipped[i] || profile.equipped[0];
      return { outfit: byId(e.outfit) || byId('classic'), hat: e.hat ? byId(e.hat) : null, accessory: e.accessory ? byId(e.accessory) : null };
    },
    color: i => profile.colors[i] || DEFAULT_PLAYER_COLORS[i],
    setColor(i, c) {
      if (!COLOR_CHOICES.includes(c) || i < 0 || i > 3) return false;
      if (profile.colors.some((x, k) => k !== i && x === c)) return false;
      profile.colors[i] = c; applyColors(); save();
      return true;
    },
    resetColor(i) { return this.setColor(i, DEFAULT_PLAYER_COLORS[i]) || (profile.colors[i] = DEFAULT_PLAYER_COLORS[i], applyColors(), save(), true); },
    drawHeadgear(g, look, x, y, s, d) {
      if (look.accessory && look.accessory.kind !== 'bracelet') this.drawAccessory(g, look.accessory.kind, x, y, s, d);
      if (look.hat) this.drawAccessory(g, look.hat.kind, x, y, s, d);
    },
    headTop(look, def) {
      const ks = [look.hat, look.accessory].filter(Boolean).map(a => this.hatTop(a.kind));
      return ks.length ? Math.max(...ks) : def;
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
      profile.equipped[i][slotOf(item)] = id;
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
      } else if (kind === 'headband') {
        g.strokeStyle = '#ffffff'; g.lineWidth = 2.8; g.shadowColor = '#fff'; g.shadowBlur = 4;
        g.beginPath(); g.moveTo(-6.7, -6); g.lineTo(6.7, -6); g.stroke();
        g.shadowBlur = 0; g.lineWidth = 2.2;
        const wv = Math.sin(Date.now() * .004);
        g.beginPath(); g.moveTo(-d * 6.7, -6); g.quadraticCurveTo(-d * 12, -3 + wv * 2, -d * 18, -1 + wv * 3); g.stroke();
        g.beginPath(); g.moveTo(-d * 6.7, -5); g.quadraticCurveTo(-d * 11, -wv * 2, -d * 16, 3 - wv * 3); g.stroke();
      } else if (kind === 'bracelet') {
        g.strokeStyle = '#ffc83d'; g.lineWidth = 2.4; g.shadowColor = '#ffc83d'; g.shadowBlur = 6;
        g.beginPath(); g.ellipse(0, 0, 4.2, 2.6, 0, 0, 6.3); g.stroke();
        g.shadowBlur = 0;
        g.fillStyle = '#ff4fd8'; g.beginPath(); g.arc(0, -2.6, 1.2, 0, 6.3); g.fill();
      } else if (kind === 'necklace') {
        g.strokeStyle = '#ffd54a'; g.lineWidth = 1.8;
        g.beginPath(); g.arc(0, 5, 6.5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
        g.fillStyle = '#ff4fd8'; g.shadowColor = '#ff4fd8'; g.shadowBlur = 6;
        g.beginPath(); g.arc(0, 11.5, 2.2, 0, 6.3); g.fill();
        g.shadowBlur = 0;
      }
      g.restore();
    },
    hatTop(kind) {
      const T = { crown: 18, cap: 17, shades: 5, halo: 20, horns: 19, phones: 16, beanie: 21, cowboy: 20, wizard: 26, viking: 22, pirate: 16, helmet: 17, tophat: 25, mask: 6, scarf: 0, wings: 8, bowtie: 0, eyepatch: 5, headband: 8, bracelet: 0, necklace: 0 };
      return Math.max(12, T[kind] || 0);
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
      } else if (item.pattern === 'jv' || item.pattern === 'jh' || item.pattern === 'jc' || item.pattern === 'jp') {
        // futbol forması: bədən xəttinə paralel zolaqlar (nx, ny — bədənə perpendikulyar vektor)
        const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
        const stripe = (o, w) => {
          g.lineWidth = w;
          g.beginPath(); g.moveTo(x0 + nx * o, y0 + ny * o); g.lineTo(x1 + nx * o, y1 + ny * o); g.stroke();
        };
        g.lineCap = 'butt';
        g.strokeStyle = item.accent;
        if (item.pattern === 'jv') { stripe(-width * .4, width * .2); stripe(0, width * .2); stripe(width * .4, width * .2); }
        else if (item.pattern === 'jh') stripe(width * .25, width * .5);
        else if (item.pattern === 'jc') stripe(0, width * .32);
        else {
          // sadə forma: yaxalıq + ətək haşiyəsi
          const tw = Math.max(1.3, width * .24);
          g.lineWidth = tw;
          g.beginPath(); g.moveTo(x1 - nx * width * .5, y1 - ny * width * .5); g.lineTo(x1 + nx * width * .5, y1 + ny * width * .5); g.stroke();
          g.beginPath(); g.moveTo(x0 - nx * width * .5, y0 - ny * width * .5); g.lineTo(x0 + nx * width * .5, y0 + ny * width * .5); g.stroke();
        }
      }
      g.restore();
    }
  };
})();
window.PartyEconomy = PartyEconomy;

const PartyAudio = (() => {
  let ac = null, master = null, noiseBuf = null, lastShot = 0, lastHit = 0;
  let musicGain = null, battleGain = null, musicStarted = false;
  const music = document.getElementById('backgroundMusic');
  const battle = document.getElementById('battleMusic');
  let syncTimer = 0, syncTries = 0;
  // Oyuna girib tez çıxanda play()/pause() yarışı və ya dayanmış AudioContext səbəbindən
  // menyu musiqisi səssiz qala bilirdi: indi lazım olan trek yoxlanılır və lazım olsa təkrar başladılır.
  function syncMusic(isRetry) {
    if (!isRetry) syncTries = 0;
    clearTimeout(syncTimer);
    const inGame = document.getElementById('gameScreen').classList.contains('active');
    const tracks = [
      [music, musicGain, PartyEconomy.isMusicMuted() ? 0 : PartyEconomy.musicVolume(), !inGame],
      [battle, battleGain, PartyEconomy.isBattleMuted() ? 0 : PartyEconomy.battleVolume(), inGame]
    ];
    let needCheck = false;
    for (const [track, gain, volume, active] of tracks) {
      if (gain) gain.gain.value = volume;
      else track.volume = volume;
      if (!musicStarted || document.hidden || !active || volume === 0) { if (!track.paused) track.pause(); continue; }
      needCheck = true;
      if (ac && ac.state !== 'running') ac.resume().catch(() => {});
      if (track.error) track.load();
      if (track.paused) {
        const pr = track.play();
        if (pr && pr.catch) pr.catch(() => {});
      }
    }
    if (needCheck && syncTries < 8) {
      syncTries++;
      syncTimer = setTimeout(() => {
        const gs = document.getElementById('gameScreen');
        const wantMenu = !(gs && gs.classList.contains('active'));
        const tr = wantMenu ? music : battle;
        const vol = wantMenu ? (PartyEconomy.isMusicMuted() ? 0 : PartyEconomy.musicVolume()) : (PartyEconomy.isBattleMuted() ? 0 : PartyEconomy.battleVolume());
        if (document.hidden || vol === 0) return;
        if (tr.paused || (ac && ac.state !== 'running')) syncMusic(true);
        else syncTries = 8;
      }, 350);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { music.pause(); battle.pause(); }
    else if (musicStarted) ensure();
  });
  window.addEventListener('pagehide', () => { music.pause(); battle.pause(); });
  window.addEventListener('pageshow', () => { if (musicStarted) ensure(); });
  function ensure() {
    if (!ac) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        master = ac.createGain();
        master.gain.value = PartyEconomy.isMuted() ? 0 : PartyEconomy.volume();
        master.connect(ac.destination);
        if (music) {
          musicGain = ac.createGain();
          ac.createMediaElementSource(music).connect(musicGain).connect(ac.destination);
          battleGain = ac.createGain();
          ac.createMediaElementSource(battle).connect(battleGain).connect(ac.destination);
        }
        noiseBuf = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    syncMusic();
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
    o.connect(g).connect(master);
    o.start(); o.stop(ac.currentTime + dur + .02);
  }
  function noise(dur, peak, freq) {
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, ac.currentTime);
    f.frequency.exponentialRampToValueAtTime(120, ac.currentTime + dur);
    env(g, ac.currentTime, .005, peak, dur);
    s.connect(f).connect(g).connect(master);
    s.start(); s.stop(ac.currentTime + dur + .02);
  }
  return {
    ensure,
    startMusic() { musicStarted = true; ensure(); },
    refreshMusic: () => syncMusic(),
    setBattleVolume(v) { PartyEconomy.setBattleVolume(v); ensure(); refreshMusicUI(); },
    toggleBattleMusic() { PartyEconomy.setBattleMuted(!PartyEconomy.isBattleMuted()); ensure(); refreshMusicUI(); },
    setMusicVolume(v) { PartyEconomy.setMusicVolume(v); ensure(); refreshMusicUI(); },
    toggleMusic() { PartyEconomy.setMusicMuted(!PartyEconomy.isMusicMuted()); ensure(); refreshMusicUI(); },
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
    volume: () => PartyEconomy.volume(),
    setVolume(v) {
      PartyEconomy.setVolume(v);
      if (master) master.gain.value = PartyEconomy.isMuted() ? 0 : PartyEconomy.volume();
    },
    toggle() {
      const muted = !PartyEconomy.isMuted();
      PartyEconomy.setMuted(muted);
      if (master) master.gain.value = muted ? 0 : PartyEconomy.volume();
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
  const sb = document.getElementById('settingsSoundBtn');
  if (sb) sb.textContent = muted ? 'Bağlı' : 'Açıq';
}

function refreshMusicUI() {
  for (const [kind, volume, muted] of [
    ['Music', PartyEconomy.musicVolume(), PartyEconomy.isMusicMuted()],
    ['Battle', PartyEconomy.battleVolume(), PartyEconomy.isBattleMuted()]
  ]) {
    const percent = Math.round(volume * 100);
    const slider = document.getElementById('settings' + kind + 'Volume');
    const value = document.getElementById('settings' + kind + 'Value');
    const button = document.getElementById('settings' + kind + 'Btn');
    if (slider) slider.value = percent;
    if (value) value.textContent = percent + '%';
    if (button) {
      button.textContent = muted ? 'Bağlı' : 'Açıq';
      button.setAttribute('aria-pressed', String(muted));
    }
  }
}

function launchParty() {
  if (window.partyLaunched) return;
  window.partyLaunched = true;
  PartyAudio.startMusic();
  const auth = document.getElementById('auth-screen');
  auth.removeAttribute('inert');
  routeHome();
  if (!navigator.onLine || auth.style.display === 'none') dismissAuth();
}

let resumeAfterSettings = false;
function openSettings() {
  resetInputs();
  if (!document.getElementById('settingsOverlay').classList.contains('visible')) {
    resumeAfterSettings = !onlineMode && !paused && gameState === 'playing';
    if (resumeAfterSettings) pauseGame();
  }
  refreshMusicUI();
  const vol = document.getElementById('settingsVolume');
  if (vol) vol.value = Math.round(PartyEconomy.volume() * 100);
  refreshSoundUI();
  document.getElementById('settingsOverlay').classList.add('visible');
}
function closeSettings() {
  document.getElementById('settingsOverlay').classList.remove('visible');
  resetInputs();
  if (resumeAfterSettings) resumeGame();
  resumeAfterSettings = false;
}
function toggleSettingsInfo() { document.getElementById('settingsInfo').classList.toggle('show'); }
function settingsLogout() {
  if (window.partySignOut) return window.partySignOut();
  else toast('Google hesabı bağlı deyil');
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
  refreshNameUI();
}

let shopPlayer = 1, shopCategory = 'outfit', shopPreviewRaf = 0;
const WEP_SVG = {
  fist: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="16" y="18" width="32" height="26" rx="10" fill="#e2e8f0"/><path d="M24 26v8M32 24v10M40 26v8" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><rect x="20" y="44" width="24" height="8" rx="4" fill="#ff4fd8"/></svg>',
  sword: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 44L46 18" stroke="#dfe6ee" stroke-width="6" stroke-linecap="round"/><path d="M46 18l6-6" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/><path d="M14 38l12 12" stroke="#ffc83d" stroke-width="5" stroke-linecap="round"/><path d="M12 52l6-6" stroke="#8a5f16" stroke-width="6" stroke-linecap="round"/></svg>',
  gun: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 24h40v10H26l-4 16H12z" fill="#4a5640"/><path d="M52 26h4v6h-4z" fill="#2dd4ff"/><path d="M28 34v8h8v-8z" fill="#3a4356"/><path d="M14 27h34" stroke="#6b7a63" stroke-width="2"/></svg>',
  bomb: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="28" cy="38" r="14" fill="#1f2937"/><path d="M22 30q-5 4-5 9" stroke="#55607a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 26q2-8 10-8" stroke="#8a5f16" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="48" cy="18" r="4" fill="#ffd54a"/><path d="M48 12v-4M54 18h4M52 12l3-3" stroke="#ff5a1f" stroke-width="2" stroke-linecap="round"/></svg>',
  hammer: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="30" y="10" width="22" height="16" rx="4" fill="#9aa5b1"/><path d="M33 13h16" stroke="#eef2f6" stroke-width="3"/><path d="M16 50L38 28" stroke="#8a5f16" stroke-width="6" stroke-linecap="round"/></svg>',
  shotgun: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 26h44v6H10z" fill="#55607a"/><path d="M10 34h44v4H10z" fill="#3a4356"/><path d="M14 38l-4 14h9l4-14z" fill="#8a5f16"/><path d="M54 26h4v12h-4z" fill="#ff5a1f"/></svg>',
  sniper: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 34h52v5H6z" fill="#55607a"/><circle cx="28" cy="26" r="6" fill="none" stroke="#2dd4ff" stroke-width="3"/><path d="M28 32v2" stroke="#2dd4ff" stroke-width="3"/><path d="M14 39l-4 12h8l3-12z" fill="#3a4356"/><path d="M58 34h3v5h-3z" fill="#ef4444"/></svg>',
  rocket: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 40L36 20q10-8 14-6t-6 14L24 48z" fill="#dfe6ee"/><circle cx="40" cy="24" r="4" fill="#2dd4ff"/><path d="M16 40l-6 12 12-6z" fill="#ef4444"/><path d="M24 48l-4 8 8-4z" fill="#ff5a1f"/></svg>',
  flame: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8q16 18 9 32-5 12-9 12t-9-12q-7-14 9-32z" fill="#ff5a1f"/><path d="M32 26q7 9 4 16-2 6-4 6t-4-6q-3-7 4-16z" fill="#ffd54a"/></svg>',
  spear: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 54L38 26" stroke="#8a5f16" stroke-width="5" stroke-linecap="round"/><path d="M38 26l16-16-5 17-11 6z" fill="#dfe6ee"/><path d="M34 30l6 6" stroke="#ffc83d" stroke-width="4"/></svg>',
  bow: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 10q26 22 0 44" fill="none" stroke="#8a5f16" stroke-width="5" stroke-linecap="round"/><path d="M18 10v44" stroke="#e8eef5" stroke-width="2"/><path d="M12 32h34m0 0l-8-6m8 6l-8 6" stroke="#2dd4ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  smg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 24h32v10H26l-3 12h-8z" fill="#3a4356"/><path d="M44 26h10v6H44z" fill="#2dd4ff"/><path d="M28 34v10h7V34z" fill="#55607a"/></svg>',
  mine: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="12" fill="#3a4356"/><path d="M32 24v-7M21 27l-5-5M43 27l5-5M20 36h-7M44 36h7" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="36" r="4" fill="#ef4444"/></svg>',
  axe: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 52L38 28" stroke="#8a5f16" stroke-width="6" stroke-linecap="round"/><path d="M34 10q18 0 20 18-9-7-18-4z" fill="#dfe6ee"/><path d="M54 28q-2-14-20-18" stroke="#9df" stroke-width="3" fill="none"/></svg>',
  laser: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 28h30v12H10z" fill="#3a4356"/><circle cx="18" cy="24" r="5" fill="#c6f"/><path d="M40 34h16" stroke="#4ff" stroke-width="5" stroke-linecap="round"/><path d="M44 30l8 8M52 30l-8 8" stroke="#4ff" stroke-width="2"/></svg>',
  shuriken: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" fill="#dfe6ee"/><circle cx="32" cy="32" r="5" fill="#0b1220"/></svg>',
  staff: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 56L36 24" stroke="#8a5f16" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="16" r="10" fill="#8b5cf6"/><circle cx="40" cy="16" r="4" fill="#fff"/><path d="M40 2v4M54 16h-4M50 6l-3 3" stroke="#c6f" stroke-width="2" stroke-linecap="round"/></svg>',
  frost: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 28h30v12H10z" fill="#3a4356"/><path d="M40 34h16" stroke="#9df" stroke-width="5" stroke-linecap="round"/><path d="M48 26v16M42 29l12 10M54 29l-12 10" stroke="#dff6ff" stroke-width="2" stroke-linecap="round"/></svg>',
  tesla: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 28h28v12H10z" fill="#3a4356"/><path d="M46 20l-8 14h9l-8 14" stroke="#ffe27a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  rifle: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 28h46v8H8z" fill="#55607a"/><path d="M16 36l-4 14h8l3-14z" fill="#8a5f16"/><path d="M28 36v10h8V36z" fill="#3a4356"/><path d="M54 28h4v8h-4z" fill="#b6f34a"/><path d="M24 24h10v4H24z" fill="#3a4356"/></svg>',
  minigun: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 24h26v18H10z" fill="#3a4356"/><path d="M36 27h18M36 33h18M36 39h18" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><circle cx="19" cy="33" r="6" fill="#55607a"/><path d="M14 42l-3 10h8l2-10z" fill="#8a5f16"/></svg>',
  grenade: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="38" r="13" fill="#4a5640"/><path d="M26 25h12v6H26z" fill="#94a3b8"/><path d="M38 25q6-7 11-3" stroke="#ffd54a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 34h20M22 42h20M32 27v22" stroke="#2f3a2a" stroke-width="2"/></svg>',
  chainsaw: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 28h22v16H8z" fill="#ff5a1f"/><path d="M12 24h10v4H12z" fill="#3a4356"/><path d="M30 30h20q8 6 0 12H30z" fill="#94a3b8"/><path d="M33 28v-3M40 28v-3M47 28v-3M33 44v3M40 44v3M47 44v3" stroke="#dfe6ee" stroke-width="2" stroke-linecap="round"/></svg>',
  boomerang: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 44L32 22l22 22" fill="none" stroke="#ffc83d" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 28l6-6 6 6" fill="none" stroke="#ef4444" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  katana: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 52Q32 36 48 12" stroke="#dfe6ee" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M12 44l10 10" stroke="#ff4fd8" stroke-width="5" stroke-linecap="round"/><path d="M8 56l6-6" stroke="#0b1220" stroke-width="6" stroke-linecap="round"/></svg>',
  random: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="12" width="40" height="40" rx="10" fill="#e8eef5"/><circle cx="24" cy="24" r="4.5" fill="#0b1220"/><circle cx="40" cy="40" r="4.5" fill="#0b1220"/><circle cx="40" cy="24" r="4.5" fill="#ef4444"/><circle cx="24" cy="40" r="4.5" fill="#0b1220"/><circle cx="32" cy="32" r="4.5" fill="#0b1220"/></svg>'
};

// Trusted, shared UI artwork. Names select fixed paths; never interpolate user input.
const UI_ICON_PATHS = Object.freeze({
  pause: '<rect class="ui-icon-tone" x="5" y="4" width="5" height="16" rx="1.5"/><rect class="ui-icon-tone" x="14" y="4" width="5" height="16" rx="1.5"/>',
  play: '<path class="ui-icon-tone" d="M7 4.5a1 1 0 0 1 1.5-.85l12 7.5a1 1 0 0 1 0 1.7l-12 7.5A1 1 0 0 1 7 19.5z"/>',
  restart: '<path d="M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6"/><path d="M12 7v5l3 2"/>',
  exit: '<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M9 12h12m-4-4 4 4-4 4"/>',
  settings: '<path class="ui-icon-tone" d="m9 3-.5 2.3-2 .9-2.2-.7-2 3.5L4 10.5v3L2.3 15l2 3.5 2.2-.7 2 .9L9 21h6l.5-2.3 2-.9 2.2.7 2-3.5-1.7-1.5v-3L21.7 9l-2-3.5-2.2.7-2-.9L15 3z"/><circle cx="12" cy="12" r="3.2"/>',
  back: '<path d="m10 5-7 7 7 7M3 12h18"/>',
  forward: '<path d="m14 5 7 7-7 7M3 12h18"/>',
  users: '<circle class="ui-icon-tone" cx="9" cy="7" r="3"/><path class="ui-icon-tone" d="M2 20v-2a7 7 0 0 1 14 0v2z"/><path d="M16 4a3 3 0 0 1 0 6m3 3a6 6 0 0 1 3 5v2"/>',
  user: '<circle class="ui-icon-tone" cx="12" cy="7" r="4"/><path class="ui-icon-tone" d="M4 21v-2a8 8 0 0 1 16 0v2z"/>',
  waiting: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  target: '<circle class="ui-icon-tone" cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="m11 13 9-9m-4 0h4v4"/>',
  swords: '<path class="ui-icon-tone" d="m4 3 4 1 12 13-3 3L4 7zM20 3l-4 1-4 5 3 3 5-5z"/><path d="m9 12-5 5 3 3 5-5M3 16l5 5m8-18 5 5M16 21l5-5M3 21l2-2m14 0 2 2"/>',
  gamepad: '<path class="ui-icon-tone" d="M7 6h10c3 0 4 4 5 11 .3 3-2 4-4 1l-2-2H8l-2 2c-2 3-4.3 2-4-1C3 10 4 6 7 6z"/><path d="M6 11h4m-2-2v4m7-2h.01m3 2h.01"/>',
  map: '<path class="ui-icon-tone" d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2z"/><path d="M9 3v16M15 5v16"/>',
  arena: '<path class="ui-icon-tone" d="m2 20 8-16 5 10 3-5 4 11z"/><path d="m6 12 4 2 3-4m2 4 3 2 2-2"/>',
  castle: '<path class="ui-icon-tone" d="M3 21V5h3v3h3V5h6v3h3V5h3v16z"/><path d="M9 21v-5a3 3 0 0 1 6 0v5M6 12h1m10 0h1M12 5V2"/>',
  platforms: '<path class="ui-icon-tone" d="M3 21V10h6v11m0 0V3h7v18m0 0V8h5v13"/><path d="M2 21h20M5 13h1m6-6h1m-1 4h1m-1 4h1m5-3h1m-1 4h1"/>',
  lava: '<path class="ui-icon-tone" d="m2 21 6-13 4 2 4-2 6 13z"/><path d="m8 8 2 7 3-2 3 5M12 6V2M7 5 5 3m12 2 2-2"/>',
  space: '<path class="ui-icon-tone" d="M9 15c-2-5 3-11 11-12 0 8-6 13-11 12z"/><circle cx="15" cy="8" r="2"/><path d="m8 9-4 1-2 5 7-1m6 1-1 5-5 2 1-7M6 17l-3 4m5-2-1 2"/>',
  forest: '<path class="ui-icon-tone" d="m9 2-6 8h3l-4 6h5v5h4v-5h5l-4-6h3z"/><path d="m17 6 5 7h-3l3 5h-5v3"/>',
  desert: '<circle class="ui-icon-tone" cx="18" cy="5" r="3"/><path class="ui-icon-tone" d="M2 18q6-7 12-2 4 3 8 0v5H2z"/><path d="M8 15V5a2 2 0 0 0-4 0v2m4 4h3a2 2 0 0 0 2-2V7M8 9H4a2 2 0 0 1-2-2V6"/>',
  ocean: '<path class="ui-icon-tone" d="M2 13q5-1 7-7c3-5 8-2 7 2-5-2-5 5-1 5 3 0 4-2 7 0v7H2z"/><path d="M2 17q3-3 6 0t6 0 8 0"/>',
  sakura: '<path class="ui-icon-tone" d="M12 8c-7-10-12 1-5 3-11 3-3 12 3 6 0 10 11 6 7-1 10 0 7-11 0-8 0-9-9-7-5 0z"/><circle cx="12" cy="12" r="2"/>',
  sky: '<path class="ui-icon-tone" d="M6 14a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 1 1 2 9z"/><path d="M6 18h12l-6 4z"/>',
  factory: '<path class="ui-icon-tone" d="M3 21V10l6 3V8l6 4V3h4l2 18z"/><path d="M7 17h1m4 0h1m4 0h1M16 3h3"/>',
  graveyard: '<path class="ui-icon-tone" d="M5 21V9a7 7 0 0 1 14 0v12z"/><path d="M2 21h20M12 7v8M9 10h6"/>',
  rooftop: '<path class="ui-icon-tone" d="M3 21v-7l7-4 7 4v7z"/><path d="M1 15 10 9l9 6M7 21v-5h6v5m4-19-3 5h5l-2 4m4 4v3"/>',
  candy: '<circle class="ui-icon-tone" cx="14" cy="9" r="7"/><path d="m9 14-7 7M11 5c7-2 9 8 2 8-4 0-5-5-1-6 3-1 4 3 1 3"/>',
  icecave: '<path class="ui-icon-tone" d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10M8 5l9 5m-11 4 3 2"/>',
  retro: '<path class="ui-icon-tone" d="M3 14a9 9 0 0 1 18 0z"/><path d="M4 10h16M7 6h10M2 18h20M1 22h22M9 15l-3 7m9-7 3 7"/>',
  mars: '<circle class="ui-icon-tone" cx="12" cy="12" r="7"/><path d="M6 7C-4 13 3 21 16 15S26 3 18 6M9 9h.01m6 0h.01"/>',
  random: '<rect class="ui-icon-tone" x="3" y="3" width="18" height="18" rx="4"/><path d="M7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01" stroke-width="3"/>',
  sumo: '<ellipse class="ui-icon-tone" cx="12" cy="18" rx="10" ry="4"/><circle cx="7" cy="5" r="2"/><circle cx="17" cy="5" r="2"/><path d="m5 18 2-7 5 2 5-2 2 7M3 10l4-2 5 3 5-3 4 2M7 11l3 7m7-7-3 7"/>',
  football: '<circle class="ui-icon-tone" cx="12" cy="12" r="10"/><path d="m12 7 5 4-2 6H9l-2-6zM12 7V2m5 9 5-2m-7 8 3 3m-9-3-3 3m1-9L2 9"/>',
  coins: '<ellipse class="ui-icon-tone" cx="9" cy="6" rx="7" ry="3"/><path class="ui-icon-tone" d="M2 6v8c0 4 14 4 14 0V6"/><path d="M2 10c0 4 14 4 14 0m4 0c4 0 4 6-1 6m3-3v6c0 3-10 4-13 1"/>',
  meteor: '<path class="ui-icon-tone" d="m19 3-4 10a6 6 0 1 1-4-4z"/><path d="m15 3-3 3m9 1-3 3m3 3-3 3"/><circle cx="8" cy="16" r="2"/>',
  race: '<path d="M4 22V3m0 1c6-5 10 4 16-1v12c-6 5-10-4-16 1"/><path class="ui-icon-tone" d="M4 4c3-2 5-1 8 0v6c-3-1-5-2-8 0zm8 6c3 1 5 2 8-1v6c-3 3-5 2-8 1z"/>',
  crown: '<path class="ui-icon-tone" d="M4 17 2 6l6 5 4-8 4 8 6-5-2 11z"/><path d="M4 21h16M8 15h.01m4-1h.01m4 1h.01"/>',
  bomb: '<circle class="ui-icon-tone" cx="10" cy="15" r="7"/><path d="m14 9 2-3c2-3 4-1 4-1M7 12l-1 2m13-13 1 1m3 4h-1m-7-3V2"/>',
  snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M3.5 10.5 7 9.2l-.5-3.7m11 13L17 14.8l3.5-1.3m-17 0L7 14.8l-.5 3.7m11-13L17 9.2l3.5 1.3"/>',
  phone: '<rect class="ui-icon-tone" x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/>',
  network: '<path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0"/><circle class="ui-icon-tone" cx="12" cy="20" r="1"/>',
  plus: '<rect class="ui-icon-tone" x="3" y="3" width="18" height="18" rx="5"/><path d="M7 12h10M12 7v10"/>',
  search: '<circle class="ui-icon-tone" cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  tag: '<path class="ui-icon-tone" d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1"/>',
  lock: '<rect class="ui-icon-tone" x="4" y="10" width="16" height="12" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
  globe: '<circle class="ui-icon-tone" cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
  bulb: '<path class="ui-icon-tone" d="M8 17v-2a7 7 0 1 1 8 0v2z"/><path d="M8 20h8m-6 3h4m-2-6v-6m-2-2 2 2 2-2"/>',
  link: '<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m4 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(0 1)"/>',
  home: '<path class="ui-icon-tone" d="m3 10 9-8 9 8v11h-7v-7h-4v7H3z"/><path d="m1 12 11-10 11 10"/>',
  loot: '<path class="ui-icon-tone" d="m12 2 10 5v10l-10 5-10-5V7z"/><path d="m2 7 10 5 10-5M12 12v10M7 4.5l10 5V14"/>',
  trophy: '<path class="ui-icon-tone" d="M6 3h12v6a6 6 0 0 1-12 0z"/><path d="M6 5H2v3a4 4 0 0 0 4 4m12-7h4v3a4 4 0 0 1-4 4M12 15v6m-5 0h10"/>',
  handshake: '<path class="ui-icon-tone" d="m2 8 4-4 6 2 6-2 4 4-3 8-5 5-8-5z"/><path d="m12 6-5 5 3 2 4-3 5 6m-9 0 5 4m-7-1 4 3M2 8l4 3m16-3-4 3"/>'
});
function uiIcon(name) {
  if (!Object.prototype.hasOwnProperty.call(UI_ICON_PATHS, name)) return '';
  return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + UI_ICON_PATHS[name] + '</svg>';
}

function itemArtSVG(item) {
  if (item.category === 'outfit') {
    const stripes = item.pattern === 'stripes'
      ? '<path d="M22 30h20M22 36h20M22 42h20" stroke="' + item.accent + '" stroke-width="3" stroke-linecap="round"/>'
      : item.pattern === 'rainbow'
        ? '<path d="M22 28h20" stroke="#ef4444" stroke-width="2.6"/><path d="M22 32h20" stroke="#f59e0b" stroke-width="2.6"/><path d="M22 36h20" stroke="#b6f34a" stroke-width="2.6"/><path d="M22 40h20" stroke="#2dd4ff" stroke-width="2.6"/><path d="M22 44h20" stroke="#8b5cf6" stroke-width="2.6"/>'
        : item.pattern === 'vest'
          ? '<path d="M28 22h8l-2 26h-4z" fill="' + item.accent + '"/>'
          : '';
    if (item.club) {
      const shirt = 'M22 14l-12 8 6 10 6-4v22h20V28l6 4 6-10-12-8-6 4h-8z';
      const cid = 'kit-' + item.id, a = item.accent;
      let deco = '';
      if (item.pattern === 'jv') deco = [16, 24, 32, 40, 48].map(cx => '<rect x="' + (cx - 2) + '" y="8" width="4" height="54" fill="' + a + '"/>').join('');
      else if (item.pattern === 'jh') deco = '<rect x="32" y="8" width="26" height="54" fill="' + a + '"/>';
      else if (item.pattern === 'jc') deco = '<rect x="29" y="8" width="6" height="54" fill="' + a + '"/>';
      else deco = '<path d="M26 14q6 8 12 0" fill="none" stroke="' + a + '" stroke-width="3"/><rect x="22" y="52" width="20" height="3" fill="' + a + '"/><path d="M10 22l6 10M54 22l-6 10" stroke="' + a + '" stroke-width="2.4"/>';
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="' + cid + '"><path d="' + shirt + '"/></clipPath></defs><path d="' + shirt + '" fill="' + item.body + '"/><g clip-path="url(#' + cid + ')">' + deco + '</g><path d="' + shirt + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    }
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
  if (item.kind === 'headband') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 26h44" stroke="' + a + '" stroke-width="6" stroke-linecap="round"/><path d="M12 28Q4 38 8 50M16 30Q10 44 18 52" stroke="' + a + '" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  if (item.kind === 'bracelet') return '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="36" rx="20" ry="12" fill="none" stroke="' + a + '" stroke-width="6"/><circle cx="32" cy="24" r="4" fill="#ff4fd8"/></svg>';
  if (item.kind === 'necklace') return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 14q20 26 40 0" fill="none" stroke="' + a + '" stroke-width="4" stroke-linecap="round"/><path d="M32 33l6 8-6 8-6-8z" fill="#ff4fd8"/></svg>';
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
  if (subEl) subEl.textContent = [look.hat, look.accessory].filter(Boolean).map(a => a.name).join(' + ') || 'Aksesuar yoxdur';
  renderShopColors();
  grid.innerHTML = SHOP_ITEMS.filter(item => shopCategory === 'kit' ? (item.category === 'outfit' && item.club) : shopCategory === 'outfit' ? (item.category === 'outfit' && !item.club) : shopCategory === 'hat' ? (item.category === 'accessory' && HAT_KINDS.includes(item.kind)) : shopCategory === 'accessory' ? (item.category === 'accessory' && !HAT_KINDS.includes(item.kind)) : item.category === shopCategory).map(item => {
    const owned = PartyEconomy.owned(item.id);
    const equipped = PartyEconomy.equippedId(i, slotOf(item)) === item.id;
    const affordable = PartyEconomy.coins() >= item.price;
    const state = equipped ? '<span class="shop-state equipped">Geyinilib</span>'
      : owned ? '<span class="shop-state owned">Geyin</span>'
        : affordable ? '<span class="shop-price"><svg class="coin-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffc83d" stroke="#9a5b00" stroke-width="2"/></svg>' + item.price + '</span>'
          : '<span class="shop-state locked">Çatmır</span><span class="shop-price"><svg class="coin-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffc83d" stroke="#9a5b00" stroke-width="2"/></svg>' + item.price + '</span>';
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
  shopCategory = (cat === 'accessory' || cat === 'hat' || cat === 'kit') ? cat : 'outfit';
  renderShop();
}

function renderShopColors() {
  const box = document.getElementById('shopColors');
  if (!box) return;
  const i = shopPlayer - 1, cur = PartyEconomy.color(i);
  box.innerHTML = COLOR_CHOICES.map(c => {
    const taken = PLAYER_COLORS.some((x, k) => k !== i && x === c);
    return '<button type="button" class="color-swatch' + (c === cur ? ' selected' : '') + (taken ? ' taken' : '') + '" style="--sw:' + c + '" aria-label="Rəng ' + c + '" aria-pressed="' + (c === cur) + '" onclick="pickShopColor(\'' + c + '\')"></button>';
  }).join('');
  document.querySelectorAll('[data-shop-player]').forEach(b => b.style.setProperty('--tab-color', PLAYER_COLORS[+b.dataset.shopPlayer - 1]));
}

function pickShopColor(c) {
  const i = shopPlayer - 1;
  if (PartyEconomy.color(i) === c) return;
  if (!PartyEconomy.setColor(i, c)) { toast('Bu rəng başqa oyunçudadır', 'error'); PartyAudio.play('error'); return; }
  PartyAudio.play('buy');
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
  } else if (PartyEconomy.equippedId(i, slotOf(item)) === id) {
    PartyEconomy.unequip(slotOf(item), i);
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
  PartyEconomy.unequip('hat', i);
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
  document.querySelectorAll('[data-ui-icon]').forEach(el => { el.innerHTML = uiIcon(el.dataset.uiIcon); });
  refreshWalletUI();
  refreshSoundUI();
  renderShop();
  document.querySelectorAll('[data-sound-toggle]').forEach(btn => btn.addEventListener('click', () => PartyAudio.toggle()));
  const vol = document.getElementById('settingsVolume');
  if (vol) {
    vol.value = Math.round(PartyEconomy.volume() * 100);
    vol.addEventListener('input', () => PartyAudio.setVolume(vol.value / 100));
  }
  document.querySelectorAll('.weapon-chip').forEach(ch => {
    const ic = ch.querySelector('.weapon-icon');
    if (ic && WEP_SVG[ch.dataset.weapon]) ic.innerHTML = WEP_SVG[ch.dataset.weapon];
  });
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
  { x: 0, y: 0, action: false, jump: false, releaseAction: false, releaseX: 0, releaseY: 0 },
  { x: 0, y: 0, action: false, jump: false, releaseAction: false, releaseX: 0, releaseY: 0 },
  { x: 0, y: 0, action: false, jump: false, releaseAction: false, releaseX: 0, releaseY: 0 },
  { x: 0, y: 0, action: false, jump: false, releaseAction: false, releaseX: 0, releaseY: 0 }
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
    if (onlineMode && i !== 0) return; // remote players' input (host) / local only (guest)
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
let joysticks = [];

function clearReleasedActions() {
  for (const inp of inputPlayers) inp.releaseAction = false;
}

function resetInputs() {
  for (const key of Object.keys(keys)) delete keys[key];
  kbPrev.fill(false);
  for (const inp of inputPlayers) {
    inp.x = inp.y = inp.releaseX = inp.releaseY = 0;
    inp.action = inp.jump = inp.releaseAction = false;
  }
  for (const j of joysticks) {
    j.touchId = null;
    j.knobEl.style.transform = '';
    j.el.classList.remove('held');
  }
}

function setupAllJoysticks(pCount) {
  resetInputs();
  joysticks = [];
  const touchContainer = document.getElementById('touchControls');
  if (!touchContainer) return;
  touchContainer.replaceChildren();
  const positions = [
    { left: 'max(14px, env(safe-area-inset-left))', bottom: 'max(28px, env(safe-area-inset-bottom))' },
    { right: 'max(14px, env(safe-area-inset-right))', bottom: 'max(28px, env(safe-area-inset-bottom))' },
    { left: 'max(14px, env(safe-area-inset-left))', top: 'max(72px, env(safe-area-inset-top))' },
    { right: 'max(14px, env(safe-area-inset-right))', top: 'max(72px, env(safe-area-inset-top))' }
  ];
  for (let i = 0; i < pCount; i++) {
    const slot = onlineMode && !isHost ? guestIndex : i;
    const wrapper = document.createElement('div');
    wrapper.className = 'touch-joystick';
    wrapper.dataset.player = slot + 1;
    wrapper.style.setProperty('--joystick-color', PLAYER_COLORS[slot]);
    wrapper.setAttribute('aria-label', 'P' + (slot + 1) + ': hərəkət et, buraxanda atəş aç');
    Object.assign(wrapper.style, positions[i]);
    const base = document.createElement('div');
    base.className = 'joystick-base';
    const knob = document.createElement('div');
    knob.className = 'joystick-knob';
    const label = document.createElement('span');
    label.className = 'joystick-label';
    label.textContent = 'P' + (slot + 1) + ' · burax: atəş';
    wrapper.append(base, knob, label);
    touchContainer.appendChild(wrapper);
    joysticks.push({ el: wrapper, baseEl: base, knobEl: knob, touchId: null, cx: 0, cy: 0, playerIndex: i });
  }
}

function touchActive(e) {
  const gs = document.getElementById('gameScreen');
  return gs && gs.classList.contains('active') && !paused && gameState === 'playing' &&
    !document.querySelector('.modal-overlay.visible,.pause-overlay.visible') &&
    !(e.target.closest && e.target.closest('button,input,.party-topbar,.shop-shell'));
}

function moveJoystick(j, touch) {
  const dx = touch.clientX - j.cx, dy = touch.clientY - j.cy;
  const scale = Math.max(40, Math.hypot(dx, dy));
  const inp = inputPlayers[j.playerIndex];
  inp.x = dx / scale; inp.y = dy / scale;
  inp.jump = inp.y < -0.5;
  j.knobEl.style.transform = `translate(${inp.x * 32}px, ${inp.y * 32}px)`;
}

function handleTouchStart(e) {
  if (!touchActive(e)) return;
  for (const touch of e.changedTouches) {
    for (const j of joysticks) {
      const rect = j.baseEl.getBoundingClientRect();
      if (j.touchId === null && touch.clientX >= rect.left - 10 && touch.clientX <= rect.right + 10 &&
          touch.clientY >= rect.top - 10 && touch.clientY <= rect.bottom + 10) {
        e.preventDefault();
        j.touchId = touch.identifier;
        j.cx = rect.left + rect.width / 2; j.cy = rect.top + rect.height / 2;
        j.el.classList.add('held');
        moveJoystick(j, touch);
        break;
      }
    }
  }
}

function handleTouchMove(e) {
  if (!touchActive(e)) return;
  for (const touch of e.changedTouches) {
    const j = joysticks.find(j => j.touchId === touch.identifier);
    if (j) { e.preventDefault(); moveJoystick(j, touch); }
  }
}

function handleTouchEnd(e) {
  const fire = e.type === 'touchend' && touchActive(e);
  for (const touch of e.changedTouches) {
    const j = joysticks.find(j => j.touchId === touch.identifier);
    if (!j) continue;
    e.preventDefault();
    const inp = inputPlayers[j.playerIndex];
    if (fire) {
      inp.releaseX = inp.x; inp.releaseY = inp.y;
      inp.releaseAction = true;
    }
    inp.x = inp.y = 0; inp.jump = false;
    j.touchId = null;
    j.knobEl.style.transform = '';
    j.el.classList.remove('held');
  }
}

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove',  handleTouchMove,  { passive: false });
document.addEventListener('touchend',   handleTouchEnd,   { passive: false });
document.addEventListener('touchcancel', handleTouchEnd,  { passive: false });
window.addEventListener('blur', resetInputs);
window.addEventListener('resize', resetInputs);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetInputs(); });

// ─────────────────────────────────────────────
//  ONLINE / PEERJS
// ─────────────────────────────────────────────
let peer = null;
let conn = null;          // guest -> host connection
let conns = [];           // host -> guest connections (slot = index+1)
let isHost = false;
let onlineMode = false;
let guestIndex = 1;
let roomInfo = { name: '', password: '' };
let lobbyCfg = { mode: 'vs', map: 'arena', rounds: 3, weapons: ['sword', 'sword', 'sword', 'sword'], loot: false, mini: 'sumo' };
let lobbySlots = [null, null, null, null];
let pendingRoom = '';
let netFrame = 0;
const MAX_SLOTS = 4;

function roomPeerId(name) {
  return 'stickparty-' + [...name.trim().toLowerCase()].map(c => /[a-z0-9]/.test(c) ? c : '_' + c.charCodeAt(0).toString(16)).join('') + 'x';
}

function netCleanup() {
  Reg.announceStop();
  const cs = conns.slice(), c = conn, p = peer;
  conns = []; conn = null; peer = null; onlineMode = false; isHost = false; guestIndex = 1;
  lobbySlots = [null, null, null, null];
  PLAYER_NAMES[0] = PartyEconomy.name() || 'P1';
  PLAYER_NAMES[1] = 'P2'; PLAYER_NAMES[2] = 'P3'; PLAYER_NAMES[3] = 'P4';
  if (window.refreshNameUI) window.refreshNameUI();
  cs.forEach(x => { try { x.close(); } catch (e) {} });
  try { if (c) c.close(); } catch (e) {}
  try { if (p) p.destroy(); } catch (e) {}
}

function connectedCount() { return isHost ? 1 + conns.filter(c => c.open).length : (lobbySlots.filter(Boolean).length || 2); }

function renderLobbyPlayers() {
  const wrap = document.getElementById('lobbyPlayers');
  if (!wrap) return;
  const mySlot = isHost ? 0 : guestIndex;
  let html = '';
  for (let i = 0; i < MAX_SLOTS; i++) {
    const name = lobbySlots[i];
    const filled = !!name;
    const isMe = i === mySlot;
    const col = 'var(--p' + (i + 1) + '-color)';
    if (i > 0) html += '<div class="lobby-vs">VS</div>';
    html += '<div class="lobby-player' + (filled ? '' : ' empty-slot') + '">'
      + '<div class="player-avatar' + (filled ? (i === 0 ? ' host' : '') : ' empty') + '" style="border-color:' + col + ';' + (filled ? 'background:rgba(255,255,255,.06)' : '') + '">' + (filled ? (i === 0 ? '🤺' : '🏃') : '?') + '</div>'
      + '<span class="player-name" style="' + (filled ? 'color:' + col : '') + '">' + (filled ? String(name).replace(/[<>&]/g, '') + (isMe ? ' (Siz)' : '') : 'Gözlənilir...') + '</span>'
      + (filled ? '<span class="lobby-tag" style="color:' + col + ';background:rgba(255,255,255,.06);border-color:' + col + '">' + (i === 0 ? 'HOST' : 'QONAQ') + '</span>' : '')
      + '</div>';
  }
  wrap.innerHTML = html;
  const cnt = document.getElementById('lobbyCount');
  if (cnt) cnt.textContent = lobbySlots.filter(Boolean).length + '/' + MAX_SLOTS;
}

function broadcastLobby() {
  if (!isHost) return;
  const msg = { type: 'lobby', slots: lobbySlots, cfg: lobbyCfg };
  conns.forEach(c => { if (c.open) try { c.send(msg); } catch (e) {} });
}

function prepLobby(host, name) {
  document.getElementById('lobbyRoomName').textContent = 'Otaq: ' + name;
  document.getElementById('hostSettings').classList.toggle('hidden', !host);
  document.getElementById('btnStartLobby').classList.toggle('hidden', !host);
  document.getElementById('guestWaiting').classList.toggle('hidden', host);
  if (host) { lobbySlots = [PartyEconomy.name() || 'Host', null, null, null]; buildLobbySettings(); }
  renderLobbyPlayers();
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
    if (e.type === 'peer-unavailable') return;
    alert(e.type === 'unavailable-id' ? 'Bu otaq adı artıq istifadədədir' : 'Xəta: ' + e.type);
    netCleanup(); showScreen('roomCreate');
  });
  peer.on('connection', c => {
    c.on('data', d => {
      if (d.type === 'auth') {
        if (conns.filter(x => x.open).length >= MAX_SLOTS - 1) { c.send({ type: 'full' }); setTimeout(() => c.close(), 200); return; }
        if (d.password !== roomInfo.password) { c.send({ type: 'authFail' }); setTimeout(() => c.close(), 200); return; }
        const slot = conns.length + 1;
        c.slot = slot; conns.push(c);
        lobbySlots[slot] = String(d.name || ('P' + (slot + 1))).slice(0, 14);
        PLAYER_NAMES[slot] = lobbySlots[slot];
        c.send({ type: 'authOk', slot, name: PartyEconomy.name(), slots: lobbySlots, cfg: lobbyCfg });
        if (window.refreshNameUI) window.refreshNameUI();
        renderLobbyPlayers(); broadcastLobby(); Reg.announceStart();
      } else if (c.slot) handleNet(d, c.slot);
    });
    c.on('close', () => {
      const idx = conns.indexOf(c);
      if (idx < 0) return;
      conns.splice(idx, 1);
      const slot = c.slot;
      lobbySlots[slot] = null; PLAYER_NAMES[slot] = 'P' + (slot + 1);
      if (window.refreshNameUI) window.refreshNameUI();
      renderLobbyPlayers(); broadcastLobby(); Reg.announceStart();
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
    conn.on('data', d => handleNet(d, 0));
    conn.on('close', () => { if (onlineMode) { alert('Bağlantı kəsildi'); quitGame(); } });
  });
}

function handleNet(d, slot) {
  switch (d.type) {
    case 'authFail': alert('Şifrə yanlışdır!'); netCleanup(); break;
    case 'full': alert('Otaq doludur'); netCleanup(); closePasswordPrompt(); break;
    case 'authOk':
      closePasswordPrompt();
      guestIndex = d.slot || 1;
      lobbySlots = (d.slots || [null, null, null, null]).slice();
      lobbySlots[guestIndex] = PartyEconomy.name() || ('P' + (guestIndex + 1));
      lobbySlots[0] = String(d.name || 'Host').slice(0, 14);
      for (let i = 0; i < MAX_SLOTS; i++) PLAYER_NAMES[i] = lobbySlots[i] || (i === 0 ? 'Host' : 'P' + (i + 1));
      if (d.cfg) lobbyCfg = Object.assign(lobbyCfg, d.cfg);
      if (window.refreshNameUI) window.refreshNameUI();
      prepLobby(false, pendingRoom); showScreen('roomLobby');
      break;
    case 'lobby':
      lobbySlots = (d.slots || []).slice();
      if (d.cfg) lobbyCfg = Object.assign(lobbyCfg, d.cfg);
      for (let i = 0; i < MAX_SLOTS; i++) PLAYER_NAMES[i] = lobbySlots[i] || (i === 0 ? 'Host' : 'P' + (i + 1));
      if (window.refreshNameUI) window.refreshNameUI();
      renderLobbyPlayers();
      break;
    case 'start':
      window.lootMode = !!d.cfg.loot;
      startGame(d.cfg.mode, d.cfg.map, d.cfg.players, d.cfg.rounds, d.cfg.weapons);
      break;
    case 'fstate': if (window.Fight) Fight.apply(d.s); break;
    case 'state': applyOnlineState(d); break;
    case 'input':
      if (isHost && slot >= 1 && slot < MAX_SLOTS) {
        const i = inputPlayers[slot];
        const axis = v => Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0;
        i.x = axis(d.x); i.y = axis(d.y); i.action = !!d.action; i.jump = !!d.jump;
        if (d.releaseAction && !paused && gameState === 'playing') {
          i.releaseAction = true; i.releaseX = axis(d.releaseX); i.releaseY = axis(d.releaseY);
        }
      }
      break;
    case 'rematch': if (isHost) restartMatch(); break;
  }
}

function sendOnlineState() {
  if (!isHost) {
    if (!conn || !conn.open) return;
    const i = inputPlayers[0];
    conn.send({ type: 'input', x: i.x, y: i.y, action: i.action, jump: i.jump,
      releaseAction: i.releaseAction, releaseX: i.releaseX, releaseY: i.releaseY });
    i.releaseAction = false;
    return;
  }
  const live = conns.filter(c => c.open);
  if (!live.length) return;
  if (++netFrame % 2) return;
  let msg;
  if (currentMode === 'vs' && window.Fight && Fight.on) {
    msg = { type: 'fstate', s: Fight.serialize() };
  } else {
    msg = {
      type: 'state', gs: gameState, cr: currentRound, gt: gameTimer,
      cd: countdownActive ? countdownTimer : null,
      pl: players.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, hp: p.hp, alive: p.alive, angle: p.angle,
        score: p.score, coins: p.coins, raceX: p.raceX, isAttacking: p.isAttacking, invincible: p.invincible, weapon: p.weapon })),
      pr: projectiles, ball, coins, fo: fallingObjects, walls: castleWalls, plats: platforms,
      lava: lavaRadius, ro: raceOffset, ob: raceObstacles, rf: raceFinishX
    };
  }
  live.forEach(c => { try { c.send(msg); } catch (e) {} });
}
window.__fightSend = sendOnlineState;
window.__sendRematch = function () { if (conn && conn.open) conn.send({ type: 'rematch' }); };

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

    case 'king':
      gameTimer = 45 * 60;
      gameTimerMax = gameTimer;
      players.forEach(p => { p.weapon = 'none'; p.hp = 999; p.score = p.roundStart || 0; });
      break;

    case 'bomb':
      players.forEach(p => { p.weapon = 'none'; p.hp = 100; });
      ball = { x: cw / 2, y: ch / 2, vx: 0, vy: 0, radius: 13, lastKicker: -1, holder: -1, fuse: 6 * 60 };
      break;

    case 'snow':
      gameTimer = 40 * 60;
      gameTimerMax = gameTimer;
      players.forEach(p => { p.weapon = 'none'; p.hp = 100; p.snowCd = 0; p.score = p.roundStart || 0; });
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
    const aimX = inp.releaseAction ? inp.releaseX : inp.x;
    const aimY = inp.releaseAction ? inp.releaseY : inp.y;
    if (Math.abs(aimX) > 0.1 || Math.abs(aimY) > 0.1) {
      p.angle = Math.atan2(aimY, aimX);
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
      case 'king':
      case 'bomb':
      case 'snow':
        p.x = Math.max(p.radius, Math.min(cw - p.radius, p.x));
        p.y = Math.max(p.radius, Math.min(ch - p.radius, p.y));
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
  if (currentMode === 'minigame' && !['sumo', 'king', 'bomb'].includes(currentMinigame)) return;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.alive) continue;

    const inp = inputPlayers[i];
    if (['sumo', 'king', 'bomb'].includes(currentMinigame)) {
      // Dash ability in sumo
      if ((inp.action || inp.releaseAction) && p.dashCooldown <= 0) {
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

    if ((inp.action || inp.releaseAction) && p.cooldownTimer <= 0) {
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
          if (proj.snow) {
            const ow = players[proj.owner];
            if (ow) ow.score++;
            spawnParticle(proj.x, proj.y, '#FFFFFF', 8, 3, 14);
            PartyAudio.play('hit');
          } else {
            spawnParticle(proj.x, proj.y, '#FFD700', 5, 3, 12);
          }
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

    case 'king':
      updateKing();
      break;

    case 'bomb':
      updateHotBomb();
      break;

    case 'snow':
      updateSnow();
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
      const kickForce = (inputPlayers[p.index].action || inputPlayers[p.index].releaseAction) ? 10 : 4;
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

// ── King of the Hill ──
function updateKing() {
  gameTimer--;
  const cx = cw / 2, cy = ch / 2;
  const zoneR = Math.min(cw, ch) * 0.18;
  let inside = -1, count = 0;
  for (const p of players) {
    if (!p.alive) continue;
    if (Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) < zoneR) { count++; inside = p.index; }
  }
  if (count === 1) {
    const p = players[inside];
    p.kingTicks = (p.kingTicks || 0) + 1;
    if (p.kingTicks % 30 === 0) {
      p.score++;
      spawnParticle(p.x, p.y - 34, '#ffd54a', 4, 2, 18);
    }
  }
  if (gameTimer <= 0) endRound();
}

// ── Hot Bomb (hot potato) ──
function updateHotBomb() {
  if (!ball) return;
  ball.noPick = Math.max(0, (ball.noPick || 0) - 1);

  if (ball.holder >= 0 && players[ball.holder] && players[ball.holder].alive) {
    const h = players[ball.holder];
    ball.x = h.x; ball.y = h.y - h.radius - 12;
    ball.fuse--;
    const inp = inputPlayers[h.index];
    h.throwCd = Math.max(0, (h.throwCd || 0) - 1);
    if ((inp.action || inp.releaseAction) && h.throwCd <= 0) {
      h.throwCd = 25;
      ball.holder = -1;
      ball.lastKicker = h.index;
      ball.noPick = 25;
      ball.vx = Math.cos(h.angle) * 9;
      ball.vy = Math.sin(h.angle) * 9;
      PartyAudio.play('shot');
    } else if (ball.fuse <= 0) {
      explodeBomb({ x: ball.x, y: ball.y, radius: 70, damage: 200, knockback: 8 });
      ball.holder = -1; ball.lastKicker = -1;
      ball.fuse = 6 * 60;
      ball.x = cw / 2; ball.y = ch / 2; ball.vx = 0; ball.vy = 0;
    }
  } else {
    ball.holder = -1;
    ball.vx *= 0.94; ball.vy *= 0.94;
    ball.x += ball.vx; ball.y += ball.vy;
    if (ball.x < 20 || ball.x > cw - 20) { ball.vx *= -0.7; ball.x = Math.max(20, Math.min(cw - 20, ball.x)); }
    if (ball.y < 20 || ball.y > ch - 20) { ball.vy *= -0.7; ball.y = Math.max(20, Math.min(ch - 20, ball.y)); }
    ball.fuse--;
    if (ball.fuse <= 0) {
      explodeBomb({ x: ball.x, y: ball.y, radius: 70, damage: 200, knockback: 8 });
      ball.fuse = 6 * 60; ball.x = cw / 2; ball.y = ch / 2; ball.vx = 0; ball.vy = 0;
    }
    for (const p of players) {
      if (!p.alive) continue;
      if (p.index === ball.lastKicker && ball.noPick > 0) continue;
      if (Math.sqrt((p.x - ball.x) ** 2 + (p.y - ball.y) ** 2) < p.radius + ball.radius) {
        ball.holder = p.index;
        ball.lastKicker = p.index;
        ball.vx = 0; ball.vy = 0;
        spawnParticle(p.x, p.y - 20, '#ff6600', 6, 3, 12);
        PartyAudio.play('hit');
        break;
      }
    }
  }
}

// ── Snowball fight ──
function updateSnow() {
  gameTimer--;
  for (const p of players) {
    if (!p.alive) continue;
    p.snowCd = Math.max(0, (p.snowCd || 0) - 1);
    const inp = inputPlayers[p.index];
    if ((inp.action || inp.releaseAction) && p.snowCd <= 0) {
      p.snowCd = 22;
      projectiles.push({
        x: p.x + Math.cos(p.angle) * 18,
        y: p.y - 12 + Math.sin(p.angle) * 18,
        vx: Math.cos(p.angle) * 7.5,
        vy: Math.sin(p.angle) * 7.5,
        type: 'bullet',
        snow: true,
        owner: p.index,
        damage: 0,
        knockback: 5,
        life: 90,
        bounces: 0
      });
      PartyAudio.play('shot');
    }
  }
  if (gameTimer <= 0) endRound();
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

  if (currentMode === 'vs' || currentMinigame === 'sumo' || currentMinigame === 'dodge' || currentMinigame === 'bomb') {
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
  if (look) PartyEconomy.drawHeadgear(ctx, look, 0, -20, 1, faceDir);

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
  if (look && look.accessory && look.accessory.kind === 'bracelet') {
    const wa = isAttacking ? angle + Math.sin(Date.now() * 0.02) * 0.5 : angle;
    PartyEconomy.drawAccessory(ctx, 'bracelet', wepDef ? Math.cos(wa) * 14 : faceDir * 8, wepDef ? -5 + Math.sin(wa) * 14 : 5, 1, faceDir);
  }

  ctx.shadowBlur = 0;

  // HP bar + name tag stacked above the hat so nothing overlaps
  const ext = look ? PartyEconomy.headTop(look, 9) : 9;
  const barY = -20 - ext - 10;
  const barW = 34, barH = 5;
  const hpRatio = Math.max(0, Math.min(1, hp / 100));
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(-barW / 2, barY, barW, barH);
  ctx.fillStyle = hpRatio > 0.4 ? '#4ade80' : '#f87171';
  ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);
  ctx.strokeStyle = 'rgba(255,255,255,.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-barW / 2, barY, barW, barH);

  // Player label
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(PLAYER_NAMES[playerIdx], 0, barY - 5);

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
      case 'king':    drawKingMap(); break;
      case 'bomb':    drawBombMap(); break;
      case 'snow':    drawSnowMap(); break;
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
  const t = Date.now() * 0.002;

  const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, Math.max(cw, ch) * 0.75);
  g.addColorStop(0, '#2b1d10');
  g.addColorStop(1, '#0c0704');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  // flickering lanterns around the ring
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + 0.3;
    const lx = cx + Math.cos(a) * (r + 55), ly = cy + Math.sin(a) * (r + 55);
    const fl = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
    ctx.fillStyle = `rgba(255,170,60,${0.2 + fl * 0.35})`;
    ctx.beginPath(); ctx.arc(lx, ly, 3.5 + fl * 2, 0, Math.PI * 2); ctx.fill();
  }

  // raised clay ring with warm glow
  ctx.save();
  ctx.shadowColor = '#ff9a3d';
  ctx.shadowBlur = 34;
  const rg = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
  rg.addColorStop(0, '#4a3520');
  rg.addColorStop(1, '#332414');
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, r * i / 4, 0, Math.PI * 2); ctx.stroke(); }

  // animated rope border
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 5;
  ctx.setLineDash([16, 9]);
  ctx.lineDashOffset = -t * 12;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,213,74,0.2)';
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
}

function drawFutbolMap() {
  // stadium backdrop + pitch gradient
  ctx.fillStyle = '#08130c';
  ctx.fillRect(0, 0, cw, ch);
  const g = ctx.createLinearGradient(0, 40, 0, ch);
  g.addColorStop(0, '#17692c');
  g.addColorStop(1, '#0d4a1c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 40, cw, ch - 40);

  // mowed stripes
  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  for (let x = 0; x < cw; x += 80) ctx.fillRect(x, 40, 40, ch - 40);

  // field lines
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 48, cw - 16, ch - 56);
  ctx.beginPath(); ctx.moveTo(cw / 2, 48); ctx.lineTo(cw / 2, ch - 8); ctx.stroke();
  ctx.beginPath(); ctx.arc(cw / 2, (ch + 40) / 2, 60, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(cw / 2, (ch + 40) / 2, 3, 0, Math.PI * 2); ctx.fill();

  // goals with nets
  const goalH = ch * 0.3;
  const goalTop = ch / 2 - goalH / 2;
  for (const side of [0, 1]) {
    const gx = side ? cw - 15 : 0;
    const col = side ? '#5b8cff' : '#ff5b5b';
    ctx.fillStyle = side ? 'rgba(90,140,255,0.25)' : 'rgba(255,90,90,0.25)';
    ctx.fillRect(gx, goalTop, 15, goalH);
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.strokeRect(gx, goalTop, 15, goalH);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    for (let y = goalTop + 6; y < goalTop + goalH; y += 8) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + 15, y); ctx.stroke();
    }
  }

  // scoreboard pill
  const team1Score = players[0] ? players[0].score : 0;
  const team2Score = players[1] ? players[1].score : 0;
  ctx.fillStyle = 'rgba(5,10,20,0.72)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cw / 2 - 70, 8, 140, 26, 13); else ctx.rect(cw / 2 - 70, 8, 140, 26);
  ctx.fill();
  ctx.fillStyle = '#ff5b5b'; ctx.beginPath(); ctx.arc(cw / 2 - 52, 21, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5b8cff'; ctx.beginPath(); ctx.arc(cw / 2 + 52, 21, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${team1Score} - ${team2Score}`, cw / 2, 26);

  // ball with shadow + rotating pattern
  if (ball) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(ball.x, ball.y + ball.radius + 3, ball.radius * 0.9, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.translate(ball.x, ball.y);
    ctx.rotate((ball.x + ball.y) * 0.05);
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(0, 0, ball.radius * 0.42, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * ball.radius * 0.78, Math.sin(a) * ball.radius * 0.78, ball.radius * 0.22, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

function drawMiniHeader(text, ratio) {
  ctx.save();
  ctx.fillStyle = 'rgba(5,10,20,0.72)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cw / 2 - 60, 8, 120, 24, 12); else ctx.rect(cw / 2 - 60, 8, 120, 24);
  ctx.fill();
  ctx.fillStyle = '#ffd54a';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cw / 2, 20);
  if (ratio !== undefined) {
    const bw = cw * 0.4;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(cw / 2 - bw / 2, 36, bw, 4);
    ctx.fillStyle = ratio > 0.25 ? '#ffd54a' : '#ff5050';
    ctx.fillRect(cw / 2 - bw / 2, 36, bw * Math.max(0, Math.min(1, ratio)), 4);
  }
  ctx.restore();
}

function drawCoinsMap() {
  const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, Math.max(cw, ch) * 0.7);
  g.addColorStop(0, '#232038');
  g.addColorStop(1, '#0d0b18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  // grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < cw; gx += 50) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke();
  }
  for (let gy = 0; gy < ch; gy += 50) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke();
  }

  drawMiniHeader('⏱ ' + Math.max(0, Math.ceil(gameTimer / 60)) + 's', gameTimer / (gameTimerMax || 1));

  // glowing 1450 coins
  for (const c of coins) {
    const flash = Math.sin(Date.now() * 0.01 + c.x) * 0.2 + 0.8;
    ctx.save();
    ctx.shadowColor = '#ffc83d';
    ctx.shadowBlur = 14;
    ctx.fillStyle = `rgba(255,200,61,${flash})`;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#9a5b00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffdd66';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.radius * 0.68, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9a5b00';
    ctx.font = 'bold 6px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1450', c.x, c.y);
    ctx.restore();
  }
}

function drawDodgeMap() {
  // stormy night sky
  const g = ctx.createLinearGradient(0, 0, 0, ch);
  g.addColorStop(0, '#141034');
  g.addColorStop(0.6, '#0a0a2a');
  g.addColorStop(1, '#1a0f22');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  // stars
  for (let i = 0; i < 40; i++) {
    const x = (i * 137) % cw, y = (i * 89) % Math.max(1, ch * 0.5);
    ctx.fillStyle = `rgba(255,255,255,${0.15 + ((i * 29) % 10) / 30})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // ground with animated hazard stripe
  ctx.fillStyle = '#20242c';
  ctx.fillRect(0, ch - 20, cw, 20);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, ch - 20, cw, 6); ctx.clip();
  ctx.fillStyle = '#ffcf33';
  for (let x = -24 + (Date.now() * 0.02 % 24); x < cw; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, ch - 14); ctx.lineTo(x + 8, ch - 20); ctx.lineTo(x + 14, ch - 20); ctx.lineTo(x + 6, ch - 14);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // meteors with fiery trails + impact shadows
  for (const f of fallingObjects) {
    ctx.fillStyle = 'rgba(255,60,60,0.2)';
    ctx.beginPath(); ctx.ellipse(f.x, ch - 20, f.radius * 0.9, 3.5, 0, 0, Math.PI * 2); ctx.fill();

    const tg = ctx.createLinearGradient(f.x, f.y - f.radius * 4, f.x, f.y);
    tg.addColorStop(0, 'rgba(255,120,40,0)');
    tg.addColorStop(1, 'rgba(255,160,60,0.5)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(f.x - f.radius * 0.5, f.y);
    ctx.lineTo(f.x, f.y - f.radius * 4);
    ctx.lineTo(f.x + f.radius * 0.5, f.y);
    ctx.closePath(); ctx.fill();

    ctx.save();
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(f.x - f.radius * 0.3, f.y - f.radius * 0.3, f.radius * 0.3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawRaceMap() {
  // sunset sky
  const g = ctx.createLinearGradient(0, 0, 0, ch);
  g.addColorStop(0, '#2b1a4e');
  g.addColorStop(0.5, '#7a2a5a');
  g.addColorStop(0.85, '#ff7a4a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  // sun
  ctx.save();
  ctx.shadowColor = '#ffd54a';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath(); ctx.arc(cw * 0.75, ch * 0.28, 30, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // parallax hills
  for (const [par, col, base] of [[0.25, 'rgba(30,16,56,0.7)', 70], [0.55, 'rgba(14,9,32,0.9)', 42]]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, ch);
    for (let x = 0; x <= cw; x += 16) {
      ctx.lineTo(x, ch - base - Math.sin((x + raceOffset * par) * 0.012) * 26 - Math.sin((x + raceOffset * par) * 0.031) * 9);
    }
    ctx.lineTo(cw, ch);
    ctx.closePath(); ctx.fill();
  }

  // ground + moving lane dash
  ctx.fillStyle = '#242030';
  ctx.fillRect(0, ch - 20, cw, 20);
  ctx.fillStyle = '#3a3348';
  ctx.fillRect(0, ch - 22, cw, 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 14]);
  ctx.lineDashOffset = raceOffset;
  ctx.beginPath(); ctx.moveTo(0, ch - 10); ctx.lineTo(cw, ch - 10); ctx.stroke();
  ctx.setLineDash([]);

  // crate obstacles
  for (const obs of raceObstacles) {
    const sx = obs.x - raceOffset;
    if (sx < -50 || sx > cw + 50) continue;
    const h = ch - 20 - obs.y;
    const og = ctx.createLinearGradient(sx, obs.y, sx + obs.w, obs.y);
    og.addColorStop(0, '#6b4423');
    og.addColorStop(1, '#4a2d15');
    ctx.fillStyle = og;
    ctx.fillRect(sx, obs.y, obs.w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(sx, obs.y, obs.w, 3);
    ctx.strokeStyle = '#ffcf33';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(sx, obs.y, obs.w, h);
    ctx.beginPath(); ctx.moveTo(sx, obs.y); ctx.lineTo(sx + obs.w, obs.y + h); ctx.moveTo(sx + obs.w, obs.y); ctx.lineTo(sx, obs.y + h); ctx.stroke();
  }

  // checkered finish line
  const finishSX = raceFinishX - raceOffset;
  if (finishSX > -20 && finishSX < cw + 20) {
    for (let y = 0; y < ch - 20; y += 12) {
      ctx.fillStyle = (y / 12) % 2 === 0 ? '#fff' : '#111';
      ctx.fillRect(finishSX, y, 5, 12);
      ctx.fillStyle = (y / 12) % 2 === 0 ? '#111' : '#fff';
      ctx.fillRect(finishSX + 5, y, 5, 12);
    }
    ctx.save();
    ctx.shadowColor = '#ffd54a';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffd54a';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 FİNİŞ', finishSX, 24);
    ctx.restore();
  }

  // progress bars with player tags
  for (const p of players) {
    if (!p.alive) continue;
    const progress = Math.max(0, Math.min(1, p.raceX / raceFinishX));
    const y = 10 + p.index * 14;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(10, y, cw - 20, 8);
    ctx.fillStyle = p.color;
    ctx.fillRect(10, y, (cw - 20) * progress, 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, y, cw - 20, 8);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(PLAYER_NAMES[p.index] || ('P' + (p.index + 1)), 14, y + 7);
  }
}

// ── King of the Hill arena ──
function drawKingMap() {
  const cx = cw / 2, cy = ch / 2;
  const zoneR = Math.min(cw, ch) * 0.18;
  const t = Date.now() * 0.002;

  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(cw, ch) * 0.75);
  g.addColorStop(0, '#2a2410');
  g.addColorStop(1, '#0e0b04');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  // slow rotating light rays
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.12);
  ctx.fillStyle = 'rgba(255,213,74,0.05)';
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(420, -46); ctx.lineTo(420, 46); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // control zone tinted by whoever holds it
  const holder = players.find(p => p.alive && Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) < zoneR);
  const zc = holder ? holder.color : '#ffd54a';
  ctx.save();
  ctx.shadowColor = zc;
  ctx.shadowBlur = 26;
  ctx.fillStyle = 'rgba(255,213,74,0.12)';
  ctx.beginPath(); ctx.arc(cx, cy, zoneR, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = zc;
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.lineDashOffset = -t * 12;
  ctx.beginPath(); ctx.arc(cx, cy, zoneR, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  ctx.font = '26px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👑', cx, cy);
  ctx.restore();

  drawMiniHeader('👑 ' + Math.max(0, Math.ceil(gameTimer / 60)) + 's', gameTimer / (gameTimerMax || 1));
}

// ── Hot Bomb arena ──
function drawBombMap() {
  const t = Date.now() * 0.003;
  const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
  g.addColorStop(0, '#2a1214');
  g.addColorStop(1, '#0d0507');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  const fuse = ball ? ball.fuse : 360;
  if (fuse < 120) {
    ctx.fillStyle = `rgba(255,40,40,${0.06 + 0.05 * Math.sin(t * 6)})`;
    ctx.fillRect(0, 0, cw, ch);
  }

  // center spawn mark
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cw / 2, ch / 2, 26, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cw / 2 - 34, ch / 2); ctx.lineTo(cw / 2 - 20, ch / 2); ctx.moveTo(cw / 2 + 20, ch / 2); ctx.lineTo(cw / 2 + 34, ch / 2); ctx.stroke();

  if (ball) {
    const bx = ball.x, by = ball.y;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(bx, by + 16, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.shadowColor = fuse < 120 ? '#ff4040' : '#ff9a3d';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#1c1f26';
    ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(bx - 4, by - 4, 4, 0, Math.PI * 2); ctx.fill();
    // fuse + spark
    ctx.strokeStyle = '#c98a3d';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx, by - 13); ctx.lineTo(bx + 4, by - 19); ctx.stroke();
    const sp = 0.5 + 0.5 * Math.sin(t * 8);
    ctx.fillStyle = `rgba(255,${150 + Math.round(sp * 100)},40,1)`;
    ctx.beginPath(); ctx.arc(bx + 4, by - 19, 2.5 + sp * 2, 0, Math.PI * 2); ctx.fill();
    // remaining fuse ring
    ctx.strokeStyle = fuse < 120 ? '#ff5050' : '#ffd54a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bx, by, 19, -Math.PI / 2, -Math.PI / 2 + Math.max(0, fuse / (6 * 60)) * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.max(0, Math.ceil(fuse / 60)) + 's', bx, by - 26);
  }
}

// ── Snowball arena ──
function drawSnowMap() {
  const t = Date.now() * 0.001;
  const g = ctx.createLinearGradient(0, 0, 0, ch);
  g.addColorStop(0, '#12233c');
  g.addColorStop(1, '#1d3a56');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  // aurora bands
  ctx.fillStyle = 'rgba(120,220,255,0.06)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cw * (0.25 + i * 0.25) + Math.sin(t * 0.4 + i) * 30, 60 + i * 26, 150, 22, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // rink circle
  ctx.strokeStyle = 'rgba(140,200,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, 0, Math.PI * 2); ctx.stroke();

  // snow ground + drifts
  ctx.fillStyle = '#e8f4ff';
  ctx.fillRect(0, ch - 14, cw, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(0, ch - 16, cw, 2);
  ctx.fillStyle = '#dceeff';
  ctx.beginPath(); ctx.arc(30, ch - 14, 26, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(cw - 44, ch - 14, 32, Math.PI, 0); ctx.fill();

  // falling flakes
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 50; i++) {
    const x = ((i * 173 + Math.sin(t + i) * 20) % cw + cw) % cw;
    const y = (i * 97 + t * 40 * (1 + (i % 3) * 0.4)) % ch;
    ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }

  drawMiniHeader('❄ ' + Math.max(0, Math.ceil(gameTimer / 60)) + 's', gameTimer / (gameTimerMax || 1));
}

// ─────────────────────────────────────────────
//  RENDERING - PROJECTILES
// ─────────────────────────────────────────────
function drawProjectiles() {
  for (const proj of projectiles) {
    if (proj.snow) {
      ctx.save();
      ctx.shadowColor = '#bfe6ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(proj.x, proj.y);
      ctx.lineTo(proj.x - proj.vx * 3, proj.y - proj.vy * 3);
      ctx.stroke();
      ctx.restore();
    } else if (proj.type === 'bullet') {
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
  resetInputs();
  document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  PartyAudio.refreshMusic();
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
  if (!(onlineMode && !isHost)) clearReleasedActions();
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
  if (window.SpaceBG) SpaceBG.paint(ctx, cw, ch);
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
  resetInputs();
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
  resetInputs();
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
const MINI_LIST = ['sumo', 'futbol', 'coins', 'dodge', 'race', 'king', 'bomb', 'snow'];
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
const LOBBY_MAP_ICON = { arena:'🏔️', castle:'🏰', platforms:'🌆', lava:'🌋', space:'🚀', forest:'🌲', desert:'🏜️', ocean:'🌊', sakura:'🌸', sky:'☁️', factory:'🏭', graveyard:'🪦', rooftop:'🌃', candy:'🍭', icecave:'🧊', retro:'🌴', mars:'🪐', random:'🎲' };
const LOBBY_WEP_NAME = { fist:'Yumruq', sword:'Qılınc', gun:'Tapança', bomb:'Bomba', hammer:'Çəkic', shotgun:'Shotgun', sniper:'Snayper', rocket:'Raket', flame:'Alov', spear:'Nizə', bow:'Ox', smg:'SMG', mine:'Mina', axe:'Balta', laser:'Lazer', shuriken:'Şüriken', staff:'Əsa', frost:'Buz', tesla:'Tesla', rifle:'Avtomat', minigun:'Pulemyot', grenade:'Qranat', chainsaw:'Mişar', boomerang:'Bumeranq', katana:'Katana', random:'Təsadüfi' };
const MINI_META = { sumo:['🌀','Sumo','Ringdən çıxarma'], futbol:['⚽','Futbol','Qol vur'], coins:['🪙','Coin ovu','Çox coin yığ'], dodge:['☄️','Dodge','Yağan təhlükə'], race:['🏁','Race','Birinci çat'], king:['👑','Təpə kralı','Zonanı saxla'], bomb:['💣','Qaynar bomba','Bombanı ötür'], snow:['❄️','Qar döyüşü','Qar topu at'] };

function buildLobbySettings() {
  const host = document.getElementById('hostSettings');
  if (!host) return;
  const meta = window.FightMeta || { ICON: {}, MAPNAMES: {}, MAPS: Object.keys(LOBBY_MAP_ICON), WEAPONS: Object.keys(LOBBY_WEP_NAME) };
  const mapKeys = [...meta.MAPS, 'random'];
  const wepKeys = [...meta.WEAPONS.filter(w => w !== 'fist'), 'random'];
  const modeRow = '<div class="lobby-setting"><span class="setting-label">Rejim</span><div class="setting-value">'
    + '<button class="round-btn lb-wide' + (lobbyCfg.mode === 'vs' ? ' selected' : '') + '" data-mode="vs" onclick="selectLobbyMode(\'vs\')">⚔️ VS</button>'
    + '<button class="round-btn lb-wide' + (lobbyCfg.mode === 'mini' ? ' selected' : '') + '" data-mode="mini" onclick="selectLobbyMode(\'mini\')">🎮 Mini</button></div></div>';
  let body = '';
  if (lobbyCfg.mode === 'vs') {
    body += '<div class="lobby-setting"><span class="setting-label">Silah rejimi</span><div class="setting-value">'
      + '<button class="round-btn lb-wide' + (!lobbyCfg.loot ? ' selected' : '') + '" id="lbArmed" onclick="selectLobbyLoot(false)">⚔️ Silahlı</button>'
      + '<button class="round-btn lb-wide' + (lobbyCfg.loot ? ' selected' : '') + '" id="lbLoot" onclick="selectLobbyLoot(true)">📦 Loot</button></div></div>';
    body += '<div class="lb-block"><span class="setting-label">Xəritə</span><div class="lb-mapgrid">'
      + mapKeys.map(k => '<button class="lb-map' + (lobbyCfg.map === k ? ' selected' : '') + '" data-lmap="' + k + '" onclick="selectLobbyMap(this)" title="' + (meta.MAPNAMES[k] || k) + '"><span>' + (LOBBY_MAP_ICON[k] || '🗺️') + '</span><em>' + (meta.MAPNAMES[k] || 'Təsadüfi') + '</em></button>').join('')
      + '</div></div>';
    body += '<div class="lb-block" id="lbWeapons"' + (lobbyCfg.loot ? ' style="display:none"' : '') + '><span class="setting-label">Silahlar (hər oyunçu)</span>'
      + [0, 1, 2, 3].map(s => '<div class="lb-weprow"><span class="lb-slot" style="color:var(--p' + (s + 1) + '-color)">O' + (s + 1) + '</span><div class="lb-wepchoices">'
        + wepKeys.map(w => '<button class="lb-wep' + ((lobbyCfg.weapons[s] || 'sword') === w ? ' selected' : '') + '" data-lwep="' + w + '" onclick="selectLobbyWeapon(this,' + s + ')" title="' + (LOBBY_WEP_NAME[w] || w) + '">' + (WEP_SVG[w] || WEP_SVG.sword) + '<em>' + (LOBBY_WEP_NAME[w] || w) + '</em></button>').join('')
        + '</div></div>').join('')
      + '</div>';
  } else {
    body += '<div class="lb-block"><span class="setting-label">Mini oyun</span><div class="lb-minigrid">'
      + MINI_LIST.map(k => '<button class="lb-mini' + (lobbyCfg.mini === k ? ' selected' : '') + '" data-lmini="' + k + '" onclick="selectLobbyMini(this)"><span>' + (MINI_META[k] || ['🎮', k])[0] + '</span><em>' + (MINI_META[k] || [, k])[1] + '</em></button>').join('')
      + '</div></div>';
  }
  body += '<div class="lobby-setting"><span class="setting-label">Raundlar</span><div class="setting-value">'
    + [1, 3, 5, 7].map(r => '<button class="round-btn' + (lobbyCfg.rounds === r ? ' selected' : '') + '" data-rounds="' + r + '" onclick="selectRounds(this)">' + r + '</button>').join('')
    + '</div></div>';
  host.innerHTML = modeRow + body;
}

function selectLobbyMode(m) {
  lobbyCfg.mode = m;
  buildLobbySettings(); broadcastLobby();
}
function selectLobbyMap(el) { lobbyCfg.map = el.dataset.lmap; markSelected([...el.parentElement.children], el); broadcastLobby(); }
function selectLobbyWeapon(el, slot) { lobbyCfg.weapons[slot] = el.dataset.lwep; markSelected([...el.parentElement.children], el); broadcastLobby(); }
function selectLobbyLoot(l) {
  lobbyCfg.loot = l;
  const a = document.getElementById('lbArmed'), b = document.getElementById('lbLoot'), w = document.getElementById('lbWeapons');
  if (a) a.classList.toggle('selected', !l);
  if (b) b.classList.toggle('selected', l);
  if (w) w.style.display = l ? 'none' : '';
  broadcastLobby();
}
function selectLobbyMini(el) { lobbyCfg.mini = el.dataset.lmini; markSelected([...el.parentElement.children], el); broadcastLobby(); }
function selectRounds(el) { lobbyCfg.rounds = +el.dataset.rounds; markSelected([...el.parentElement.children], el); broadcastLobby(); }
function startLobbyGame() {
  if (!isHost) return;
  const live = conns.filter(c => c.open);
  if (!live.length) return alert('Rəqib hələ qoşulmayıb');
  const players = 1 + live.length;
  const cfg = {
    mode: lobbyCfg.mode,
    map: lobbyCfg.mode === 'vs' ? lobbyCfg.map : lobbyCfg.mini,
    rounds: lobbyCfg.rounds,
    weapons: lobbyCfg.weapons.slice(),
    loot: lobbyCfg.loot,
    players
  };
  live.forEach(c => { try { c.send({ type: 'start', cfg }); } catch (e) {} });
  window.lootMode = cfg.loot;
  startGame(cfg.mode, cfg.map, players, cfg.rounds, cfg.weapons);
}

// Pause / end-of-match
function togglePause() {
  if (onlineMode && !isHost) return;
  if (!paused && gameState !== 'playing' && gameState !== 'roundEnd') return;
  resetInputs();
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
  document.getElementById('settingsMusicVolume').addEventListener('input', e => PartyAudio.setMusicVolume(+e.target.value / 100));
  document.getElementById('settingsBattleVolume').addEventListener('input', e => PartyAudio.setBattleVolume(+e.target.value / 100));
  refreshMusicUI();
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
      Reg.annConn.send({ type: 'reg', id: peer.id, name: roomInfo.name, lock: !!roomInfo.password, n: connectedCount() });
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
