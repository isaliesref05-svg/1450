import { COLOR_CHOICES, DEFAULT_PLAYER_COLORS, PLAYER_COLORS, PLAYER_NAMES } from './types';

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  category: 'outfit' | 'accessory';
  price: number;
  body?: string;
  accent: string;
  pattern?: 'plain' | 'vest' | 'stripes' | 'rainbow' | 'jv' | 'jh' | 'jc' | 'jp';
  glow?: string;
  kind?: string;
  club?: boolean;
}

export const HAT_KINDS = [
  'cap', 'beanie', 'cowboy', 'wizard', 'viking', 'pirate', 'helmet', 'tophat', 'crown',
];

export const slotOf = (item: ShopItem): 'outfit' | 'hat' | 'accessory' =>
  item.category === 'accessory' && item.kind && HAT_KINDS.includes(item.kind)
    ? 'hat'
    : item.category;

export const PARTY_SAVE_KEY = 'stickparty.profile.v1';
export const MATCH_BASE_REWARD = 120;
export const MATCH_WIN_BONUS = 80;

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'classic', name: 'Klassik', desc: 'Təmiz başlanğıc dəsti', category: 'outfit', price: 0, body: '#e2e8f0', accent: '#94a3b8', pattern: 'plain' },
  { id: 'neon', name: 'Neon jilet', desc: 'Parlaq siberpunk kəsim', category: 'outfit', price: 300, body: '#22d3ee', accent: '#ff4fd8', pattern: 'vest', glow: '#22d3ee' },
  { id: 'stripe', name: 'Zolaqlı forma', desc: 'Sürətli xətlər, canlı rəng', category: 'outfit', price: 450, body: '#b6f34a', accent: '#0b1220', pattern: 'stripes' },
  { id: 'royal', name: 'Kral libası', desc: 'Qızıl haşiyəli parça', category: 'outfit', price: 550, body: '#8b5cf6', accent: '#ffc83d', pattern: 'vest', glow: '#8b5cf6' },
  { id: 'frost', name: 'Buz zirehi', desc: 'Soyuq parıltılı qat', category: 'outfit', price: 500, body: '#9df', accent: '#e8fbff', pattern: 'stripes', glow: '#9df' },
  { id: 'lava', name: 'Lava zirehi', desc: 'İsti maqma naxışı', category: 'outfit', price: 650, body: '#ff5a1f', accent: '#ffd54a', pattern: 'vest', glow: '#ff5a1f' },
  { id: 'gold', name: 'Qızıl zireh', desc: 'Çempionun parıltısı', category: 'outfit', price: 800, body: '#ffc83d', accent: '#fff3c4', pattern: 'vest', glow: '#ffc83d' },
  { id: 'cyber', name: 'Kiber kostyum', desc: 'Rəqəmsal döyüş xətləri', category: 'outfit', price: 700, body: '#0b1220', accent: '#2dd4ff', pattern: 'stripes', glow: '#2dd4ff' },
  { id: 'knight', name: 'Cəngavər zirehi', desc: 'Polad qatlı müdafiə', category: 'outfit', price: 620, body: '#94a3b8', accent: '#e2e8f0', pattern: 'vest', glow: '#cbd5e1' },
  { id: 'rainbow', name: 'Göy qurşağı', desc: 'Yeddi rəngli enerji', category: 'outfit', price: 750, body: '#ff4fd8', accent: '#2dd4ff', pattern: 'rainbow', glow: '#ff4fd8' },
  { id: 'shadow', name: 'Kölgə libası', desc: 'Qaranlıq suiqəstçi', category: 'outfit', price: 580, body: '#1e1b4b', accent: '#8b5cf6', pattern: 'plain', glow: '#8b5cf6' },
  { id: 'crown', name: 'Qızıl tac', desc: 'Liderin simvolu', category: 'accessory', price: 250, kind: 'crown', accent: '#ffd54a' },
  { id: 'cap', name: 'Neon papaq', desc: 'Küncə stil', category: 'accessory', price: 180, kind: 'cap', accent: '#ff4fd8' },
  { id: 'shades', name: 'Gecə eynəyi', desc: 'Sərin baxış', category: 'accessory', price: 220, kind: 'shades', accent: '#22d3ee' },
  { id: 'halo', name: 'Mələk halqası', desc: 'Baş üstündə işıq', category: 'accessory', price: 400, kind: 'halo', accent: '#ffe9a8' },
  { id: 'horns', name: 'İblis buynuzu', desc: 'Kəskin siluet', category: 'accessory', price: 350, kind: 'horns', accent: '#ef4444' },
  { id: 'phones', name: 'DJ qulaqlığı', desc: 'Döyüşə ritm qat', category: 'accessory', price: 300, kind: 'phones', accent: '#2dd4ff' },
  { id: 'beanie', name: 'Toxuma papaq', desc: 'İsti küçə stili', category: 'accessory', price: 200, kind: 'beanie', accent: '#10b981' },
  { id: 'cowboy', name: 'Kovboy şlyapası', desc: 'Vəhşi qərb havası', category: 'accessory', price: 320, kind: 'cowboy', accent: '#c98a3d' },
  { id: 'wizard', name: 'Sehrbaz papağı', desc: 'Ulduzlu sehr', category: 'accessory', price: 420, kind: 'wizard', accent: '#8b5cf6' },
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
  { id: 'necklace', name: 'Boyunbağı', desc: 'Zərif qızıl zəncir', category: 'accessory', price: 240, kind: 'necklace', accent: '#ffd54a' },
  { id: 'club_qarabag', name: 'Qarabağ forması', desc: 'Atlı süvarilərin qara-ağ rəngləri', category: 'outfit', club: true, price: 600, body: '#111418', accent: '#f8fafc', pattern: 'jp', glow: '#f8fafc' },
  { id: 'club_neftci', name: 'Neftçi forması', desc: 'Qırmızı-qara şaquli zolaqlar', category: 'outfit', club: true, price: 600, body: '#dc2626', accent: '#111418', pattern: 'jv', glow: '#dc2626' },
  { id: 'club_bjk', name: 'Beşiktaş forması', desc: 'Qara-ağ qartal ruhu', category: 'outfit', club: true, price: 650, body: '#111418', accent: '#f8fafc', pattern: 'jv', glow: '#f8fafc' },
  { id: 'club_gs', name: 'Galatasaray forması', desc: 'Sarı-qırmızı aslan rəngləri', category: 'outfit', club: true, price: 650, body: '#d71920', accent: '#ffc928', pattern: 'jh', glow: '#ffc928' },
  { id: 'club_fb', name: 'Fənərbaxça forması', desc: 'Sarı-lacivərd zolaqlar', category: 'outfit', club: true, price: 650, body: '#ffd100', accent: '#0b2a6f', pattern: 'jv', glow: '#ffd100' },
  { id: 'club_ts', name: 'Trabzonspor forması', desc: 'Bordo-mavi fırtına', category: 'outfit', club: true, price: 600, body: '#8b1d3a', accent: '#38a8f0', pattern: 'jh', glow: '#38a8f0' },
  { id: 'club_real', name: 'Real Madrid forması', desc: 'Ağ kral kostyumu, qızıl yaxalıq', category: 'outfit', club: true, price: 750, body: '#f8fafc', accent: '#d4a72c', pattern: 'jp', glow: '#e2e8f0' },
  { id: 'club_barca', name: 'Barselona forması', desc: 'Göy-qırmızı zolaqlar', category: 'outfit', club: true, price: 750, body: '#1d4ed8', accent: '#a50044', pattern: 'jv', glow: '#a50044' },
  { id: 'club_atm', name: 'Atletiko forması', desc: 'Qırmızı-ağ zolaqlı döyüşçü', category: 'outfit', club: true, price: 650, body: '#e11d2e', accent: '#f8fafc', pattern: 'jv', glow: '#e11d2e' },
  { id: 'club_city', name: 'Mançester Siti forması', desc: 'Səma mavisi şəhər forması', category: 'outfit', club: true, price: 700, body: '#6cc6f0', accent: '#0b2a6f', pattern: 'jp', glow: '#6cc6f0' },
  { id: 'club_lfc', name: 'Liverpul forması', desc: 'Qırmızı Anfield enerjisi', category: 'outfit', club: true, price: 700, body: '#c8102e', accent: '#f8fafc', pattern: 'jp', glow: '#c8102e' },
  { id: 'club_psg', name: 'PSJ forması', desc: 'Lacivərd, qırmızı mərkəz zolağı', category: 'outfit', club: true, price: 700, body: '#0b1f4d', accent: '#e11d2e', pattern: 'jc', glow: '#4a73d9' },
];

export interface PlayerLook {
  outfit: ShopItem;
  hat: ShopItem | null;
  accessory: ShopItem | null;
}

interface EquippedSlots {
  outfit: string;
  hat: string | null;
  accessory: string | null;
}

interface ProfileData {
  coins: number;
  name: string;
  owned: string[];
  equipped: Record<number, EquippedSlots>;
  colors: string[];
  muted: boolean;
  matches: number;
  volume: number;
  musicVolume: number;
  musicMuted: boolean;
  battleVolume: number;
  battleMuted: boolean;
}

const byId = (id: string) => SHOP_ITEMS.find((i) => i.id === id);

const defaultEquipped = (): Record<number, EquippedSlots> => ({
  0: { outfit: 'classic', hat: null, accessory: null },
  1: { outfit: 'classic', hat: null, accessory: null },
  2: { outfit: 'classic', hat: null, accessory: null },
  3: { outfit: 'classic', hat: null, accessory: null },
});

function normalize(p: unknown): ProfileData {
  const prof: ProfileData = {
    coins: 0,
    name: '',
    owned: ['classic'],
    equipped: defaultEquipped(),
    colors: [...DEFAULT_PLAYER_COLORS],
    muted: false,
    matches: 0,
    volume: 0.8,
    musicVolume: 0.4,
    musicMuted: false,
    battleVolume: 0.4,
    battleMuted: false,
  };
  if (p && typeof p === 'object') {
    const obj = p as Record<string, unknown>;
    if (typeof obj.coins === 'number' && Number.isFinite(obj.coins)) {
      prof.coins = Math.max(0, Math.floor(obj.coins));
    }
    if (typeof obj.name === 'string') {
      prof.name = obj.name.trim().slice(0, 14);
    }
    if (Array.isArray(obj.owned)) {
      prof.owned = [...new Set(obj.owned.filter((id): id is string => typeof id === 'string' && !!byId(id)))];
    }
    if (!prof.owned.includes('classic')) prof.owned.push('classic');
    if (obj.equipped && typeof obj.equipped === 'object') {
      const eq = obj.equipped as Record<string, Record<string, string | null> | undefined>;
      for (let i = 0; i < 4; i++) {
        const e = eq[i];
        if (!e) continue;
        const outfit = e.outfit ? byId(e.outfit) : undefined;
        const accessory = e.accessory ? byId(e.accessory) : undefined;
        const hatItem = e.hat ? byId(e.hat) : undefined;
        prof.equipped[i].outfit =
          outfit && outfit.category === 'outfit' && prof.owned.includes(outfit.id)
            ? outfit.id
            : 'classic';
        let hat =
          hatItem && slotOf(hatItem) === 'hat' && prof.owned.includes(hatItem.id)
            ? hatItem.id
            : null;
        let acc: string | null = null;
        if (accessory && accessory.category === 'accessory' && prof.owned.includes(accessory.id)) {
          if (slotOf(accessory) === 'hat') {
            if (!hat) hat = accessory.id;
          } else {
            acc = accessory.id;
          }
        }
        prof.equipped[i].hat = hat;
        prof.equipped[i].accessory = acc;
      }
    }
    if (Array.isArray(obj.colors)) {
      for (let i = 0; i < 4; i++) {
        const col = obj.colors[i];
        if (typeof col === 'string' && COLOR_CHOICES.includes(col)) {
          prof.colors[i] = col;
        }
      }
    }
    prof.muted = !!obj.muted;
    prof.volume = typeof obj.volume === 'number' && Number.isFinite(obj.volume) ? Math.max(0, Math.min(1, obj.volume)) : 0.8;
    prof.musicVolume = typeof obj.musicVolume === 'number' && Number.isFinite(obj.musicVolume) ? Math.max(0, Math.min(1, obj.musicVolume)) : 0.4;
    prof.musicMuted = !!obj.musicMuted;
    prof.battleVolume = typeof obj.battleVolume === 'number' && Number.isFinite(obj.battleVolume) ? Math.max(0, Math.min(1, obj.battleVolume)) : 0.4;
    prof.battleMuted = !!obj.battleMuted;
    prof.matches = typeof obj.matches === 'number' && Number.isFinite(obj.matches) ? obj.matches : 0;
  }
  return prof;
}

class EconomyStore {
  private profile: ProfileData;
  private matchActive = false;
  private listeners = new Set<() => void>();

  constructor() {
    let loaded: unknown = null;
    try {
      const raw = localStorage.getItem(PARTY_SAVE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      loaded = null;
    }
    this.profile = normalize(loaded);
    PLAYER_NAMES[0] = this.profile.name || 'P1';
    this.applyColors();
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit() {
    this.listeners.forEach((cb) => cb());
  }

  private save() {
    try {
      localStorage.setItem(PARTY_SAVE_KEY, JSON.stringify(this.profile));
    } catch {
      // ignore storage quota errors
    }
    this.emit();
  }

  private applyColors() {
    for (let i = 0; i < 4; i++) {
      PLAYER_COLORS[i] = this.profile.colors[i];
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty(`--p${i + 1}-color`, this.profile.colors[i]);
      }
    }
  }

  coins = () => this.profile.coins;
  name = () => this.profile.name;
  matches = () => this.profile.matches;
  isMuted = () => this.profile.muted;
  volume = () => this.profile.volume;
  musicVolume = () => this.profile.musicVolume;
  isMusicMuted = () => this.profile.musicMuted;
  battleVolume = () => this.profile.battleVolume;
  isBattleMuted = () => this.profile.battleMuted;

  setName(n: string): boolean {
    const v = String(n || '').trim().slice(0, 14);
    if (!v) return false;
    this.profile.name = v;
    PLAYER_NAMES[0] = v;
    this.save();
    return true;
  }

  setMuted(v: boolean) {
    this.profile.muted = !!v;
    this.save();
  }
  setVolume(v: number) {
    this.profile.volume = Math.max(0, Math.min(1, +v || 0));
    this.save();
  }
  setMusicVolume(v: number) {
    this.profile.musicVolume = Math.max(0, Math.min(1, +v || 0));
    this.save();
  }
  setMusicMuted(v: boolean) {
    this.profile.musicMuted = !!v;
    this.save();
  }
  setBattleVolume(v: number) {
    this.profile.battleVolume = Math.max(0, Math.min(1, +v || 0));
    this.save();
  }
  setBattleMuted(v: boolean) {
    this.profile.battleMuted = !!v;
    this.save();
  }

  owned = (id: string) => this.profile.owned.includes(id);

  equippedId = (i: number, cat: 'outfit' | 'hat' | 'accessory') =>
    this.profile.equipped[i] ? this.profile.equipped[i][cat] : cat === 'outfit' ? 'classic' : null;

  look(i: number): PlayerLook {
    const e = this.profile.equipped[i] || this.profile.equipped[0];
    return {
      outfit: byId(e.outfit) || byId('classic')!,
      hat: e.hat ? byId(e.hat) || null : null,
      accessory: e.accessory ? byId(e.accessory) || null : null,
    };
  }

  color = (i: number) => this.profile.colors[i] || DEFAULT_PLAYER_COLORS[i];

  setColor(i: number, c: string): boolean {
    if (!COLOR_CHOICES.includes(c) || i < 0 || i > 3) return false;
    if (this.profile.colors.some((x, k) => k !== i && x === c)) return false;
    this.profile.colors[i] = c;
    this.applyColors();
    this.save();
    return true;
  }

  swapOrSetColor(playerIdx: number, color: string): boolean {
    if (playerIdx < 0 || playerIdx > 3 || !COLOR_CHOICES.includes(color)) return false;
    const oldCol = this.color(playerIdx);
    if (oldCol === color) return false;
    const otherIdx = [0, 1, 2, 3].find((k) => k !== playerIdx && this.color(k) === color);
    if (otherIdx !== undefined) {
      this.profile.colors[otherIdx] = oldCol;
    }
    this.profile.colors[playerIdx] = color;
    this.applyColors();
    this.save();
    return true;
  }

  beginMatch() {
    this.matchActive = true;
  }

  awardMatch(bonus = 0) {
    if (!this.matchActive) return null;
    this.matchActive = false;
    const total = MATCH_BASE_REWARD + bonus;
    this.profile.coins += total;
    this.profile.matches++;
    this.save();
    return { base: MATCH_BASE_REWARD, bonus, total, coins: this.profile.coins };
  }

  buy(id: string): boolean {
    const item = byId(id);
    if (!item || this.profile.owned.includes(id)) return false;
    if (this.profile.coins < item.price) return false;
    this.profile.coins -= item.price;
    this.profile.owned.push(id);
    this.save();
    return true;
  }

  equip(id: string, i: number): boolean {
    const item = byId(id);
    if (!item || !this.profile.owned.includes(id) || !this.profile.equipped[i]) return false;
    this.profile.equipped[i][slotOf(item)] = id;
    this.save();
    return true;
  }

  unequip(cat: 'outfit' | 'hat' | 'accessory', i: number) {
    const slot = this.profile.equipped[i];
    if (!slot) return;
    if (cat === 'outfit') slot.outfit = 'classic';
    else slot[cat] = null;
    this.save();
  }

  hatTop(kind: string): number {
    const T: Record<string, number> = {
      crown: 20, cap: 17, shades: 6, halo: 22, horns: 21, phones: 16, beanie: 21,
      cowboy: 20, wizard: 28, viking: 22, pirate: 18, helmet: 18, tophat: 25,
      mask: 7, scarf: 0, wings: 9, bowtie: 0, eyepatch: 5, headband: 8,
      bracelet: 0, necklace: 0,
    };
    return Math.max(12, T[kind] || 0);
  }

  headTop(look: PlayerLook, def: number): number {
    const ks = [look.hat, look.accessory]
      .filter((a): a is ShopItem => !!a)
      .map((a) => this.hatTop(a.kind || ''));
    return ks.length ? Math.max(...ks) : def;
  }

  drawHeadgear(g: CanvasRenderingContext2D, look: PlayerLook, x: number, y: number, s: number, d: number) {
    if (look.accessory && look.accessory.kind && look.accessory.kind !== 'bracelet') {
      this.drawAccessory(g, look.accessory.kind, x, y, s, d);
    }
    if (look.hat && look.hat.kind) {
      this.drawAccessory(g, look.hat.kind, x, y, s, d);
    }
  }

  drawAccessory(g: CanvasRenderingContext2D, kind: string, x: number, y: number, s: number, d: number) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.lineCap = 'round';
    g.lineJoin = 'round';

    if (kind === 'crown') {
      const gr = g.createLinearGradient(0, -19, 0, -8);
      gr.addColorStop(0, '#ffe866');
      gr.addColorStop(0.5, '#eab308');
      gr.addColorStop(1, '#a16207');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-7.5, -9);
      g.lineTo(-8, -17.5);
      g.lineTo(-3.5, -12);
      g.lineTo(0, -19.5);
      g.lineTo(3.5, -12);
      g.lineTo(8, -17.5);
      g.lineTo(7.5, -9);
      g.closePath();
      g.fill();
      g.fillStyle = '#fef08a';
      g.fillRect(-8, -9.5, 16, 2.4);
      g.strokeStyle = '#854d0e';
      g.lineWidth = 0.8;
      g.strokeRect(-8, -9.5, 16, 2.4);
      g.fillStyle = '#ef4444';
      g.shadowColor = '#ef4444';
      g.shadowBlur = 6;
      g.beginPath();
      g.arc(0, -13, 1.8, 0, 6.3);
      g.fill();
      g.fillStyle = '#3b82f6';
      g.shadowColor = '#3b82f6';
      g.shadowBlur = 4;
      g.beginPath();
      g.arc(-4.5, -11.5, 1.3, 0, 6.3);
      g.fill();
      g.beginPath();
      g.arc(4.5, -11.5, 1.3, 0, 6.3);
      g.fill();
      g.shadowBlur = 0;
    } else if (kind === 'cap') {
      g.fillStyle = '#ff0077';
      g.beginPath();
      g.arc(0, -8, 9, Math.PI, 0);
      g.closePath();
      g.fill();
      g.fillStyle = '#ffffff';
      g.fillRect(-2, -14, 4, 3);
      g.fillStyle = '#06b6d4';
      g.beginPath();
      if (d > 0) {
        g.moveTo(-1, -8); g.lineTo(15, -6.5); g.lineTo(13, -4.5); g.lineTo(-1, -7);
      } else {
        g.moveTo(1, -8); g.lineTo(-15, -6.5); g.lineTo(-13, -4.5); g.lineTo(1, -7);
      }
      g.closePath();
      g.fill();
    } else if (kind === 'shades') {
      g.shadowColor = '#00f0ff';
      g.shadowBlur = 6;
      g.fillStyle = '#050811';
      g.beginPath();
      if (g.roundRect) g.roundRect(-8.5, -4.5, 17, 5.2, 2);
      else g.rect(-8.5, -4.5, 17, 5.2);
      g.fill();
      const lg = g.createLinearGradient(-8, -4, 8, 1);
      lg.addColorStop(0, '#0284c7');
      lg.addColorStop(0.5, '#0ea5e9');
      lg.addColorStop(1, '#0284c7');
      g.fillStyle = lg;
      g.fillRect(-7.2, -3.8, 6.2, 3.8);
      g.fillRect(1.0, -3.8, 6.2, 3.8);
      g.strokeStyle = 'rgba(255,255,255,0.85)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-5.5, -3.5); g.lineTo(-2.5, -0.5);
      g.moveTo(2.5, -3.5); g.lineTo(5.5, -0.5);
      g.stroke();
      g.shadowBlur = 0;
    } else if (kind === 'halo') {
      g.strokeStyle = '#fef08a';
      g.lineWidth = 2.6;
      g.shadowColor = '#fbbf24';
      g.shadowBlur = 12;
      g.beginPath();
      g.ellipse(0, -17.5, 10.5, 3.2, 0, 0, 6.3);
      g.stroke();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(7, -18.5, 1.2, 0, 6.3);
      g.fill();
      g.shadowBlur = 0;
    } else if (kind === 'horns') {
      const hr = g.createLinearGradient(0, -20, 0, -8);
      hr.addColorStop(0, '#ff4500');
      hr.addColorStop(0.6, '#b91c1c');
      hr.addColorStop(1, '#450a0a');
      g.fillStyle = hr;
      g.shadowColor = '#ff4500';
      g.shadowBlur = 8;
      g.beginPath(); g.moveTo(-5.5, -8); g.quadraticCurveTo(-12, -15, -8.5, -21); g.lineTo(-2.8, -9.5); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(5.5, -8); g.quadraticCurveTo(12, -15, 8.5, -21); g.lineTo(2.8, -9.5); g.closePath(); g.fill();
      g.shadowBlur = 0;
    } else if (kind === 'phones') {
      g.strokeStyle = '#0284c7';
      g.lineWidth = 3;
      g.beginPath(); g.arc(0, -6.5, 10.2, Math.PI, 0); g.stroke();
      g.strokeStyle = '#0f172a';
      g.lineWidth = 4.5;
      g.beginPath(); g.arc(0, -6.5, 10.2, Math.PI * 0.7, Math.PI * 0.3); g.stroke();
      g.fillStyle = '#0f172a';
      g.fillRect(-11.5, -7, 4.5, 9);
      g.fillRect(7, -7, 4.5, 9);
      g.fillStyle = '#38bdf8';
      g.fillRect(-10.5, -4, 2.5, 3);
      g.fillRect(8, -4, 2.5, 3);
    } else if (kind === 'beanie') {
      g.fillStyle = '#10b981';
      g.beginPath(); g.arc(0, -8.5, 9.8, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#065f46';
      g.fillRect(-9.8, -9.5, 19.6, 4);
      g.fillStyle = '#6ee7b7';
      g.beginPath(); g.arc(0, -18.5, 3, 0, 6.3); g.fill();
    } else if (kind === 'cowboy') {
      g.fillStyle = '#92400e';
      g.beginPath(); g.ellipse(0, -9, 16, 4.2, 0, 0, 6.3); g.fill();
      g.beginPath();
      g.moveTo(-7.5, -9);
      g.quadraticCurveTo(-6.5, -21, -2, -20);
      g.lineTo(0, -18.5);
      g.lineTo(2, -20);
      g.quadraticCurveTo(6.5, -21, 7.5, -9);
      g.closePath();
      g.fill();
      g.fillStyle = '#451a03';
      g.fillRect(-7.5, -11.5, 15, 2.8);
      g.fillStyle = '#f8fafc';
      g.beginPath(); g.arc(0, -10.2, 1.4, 0, 6.3); g.fill();
    } else if (kind === 'wizard') {
      const wz = g.createLinearGradient(0, -28, 0, -8);
      wz.addColorStop(0, '#4c1d95');
      wz.addColorStop(1, '#7c3aed');
      g.fillStyle = wz;
      g.beginPath();
      g.moveTo(-9.5, -8);
      g.quadraticCurveTo(-3, -20, 4 * d, -28);
      g.quadraticCurveTo(3, -18, 9.5, -8);
      g.closePath();
      g.fill();
      g.fillStyle = '#5b21b6';
      g.beginPath(); g.ellipse(0, -8, 13, 3.5, 0, 0, 6.3); g.fill();
      g.fillStyle = '#fbbf24';
      g.shadowColor = '#fbbf24'; g.shadowBlur = 5;
      g.beginPath(); g.arc(1, -17, 1.6, 0, 6.3); g.fill();
      g.beginPath(); g.arc(-3, -12, 1.2, 0, 6.3); g.fill();
      g.shadowBlur = 0;
    } else if (kind === 'viking') {
      const st = g.createLinearGradient(-9, -12, 9, -5);
      st.addColorStop(0, '#94a3b8');
      st.addColorStop(0.5, '#f1f5f9');
      st.addColorStop(1, '#64748b');
      g.fillStyle = st;
      g.beginPath(); g.arc(0, -8, 9.5, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#334155';
      g.fillRect(-9.5, -9, 19, 3.4);
      g.fillStyle = '#f8fafc';
      for (let r = -7; r <= 7; r += 3.5) {
        g.beginPath(); g.arc(r, -7.3, 0.7, 0, 6.3); g.fill();
      }
      g.fillStyle = '#475569';
      g.fillRect(-1.2, -6, 2.4, 4);
      const drawHorn = (hx: number, dir: number) => {
        const hg = g.createLinearGradient(hx, -10, hx + dir * 8, -22);
        hg.addColorStop(0, '#f8fafc');
        hg.addColorStop(0.7, '#fde68a');
        hg.addColorStop(1, '#1e293b');
        g.fillStyle = hg;
        g.beginPath();
        g.moveTo(hx, -9);
        g.quadraticCurveTo(hx + dir * 14, -15, hx + dir * 11, -22);
        g.quadraticCurveTo(hx + dir * 8, -15, hx - dir * 3.5, -11.5);
        g.closePath();
        g.fill();
        g.fillStyle = '#78350f';
        g.beginPath(); g.ellipse(hx - dir * 1.5, -10, 3, 1.2, dir * 0.4, 0, 6.3); g.fill();
      };
      drawHorn(-7.5, -1);
      drawHorn(7.5, 1);
    } else if (kind === 'pirate') {
      g.fillStyle = '#0f172a';
      g.beginPath();
      g.moveTo(-13.5, -8);
      g.quadraticCurveTo(0, -22, 13.5, -8);
      g.quadraticCurveTo(0, -12.5, -13.5, -8);
      g.closePath();
      g.fill();
      g.strokeStyle = '#eab308';
      g.lineWidth = 1.2;
      g.stroke();
      g.fillStyle = '#f8fafc';
      g.beginPath(); g.arc(0, -13.5, 2.4, 0, 6.3); g.fill();
      g.fillStyle = '#0f172a';
      g.fillRect(-1.4, -13, 0.9, 0.9);
      g.fillRect(0.5, -13, 0.9, 0.9);
      g.strokeStyle = '#f8fafc'; g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(-2.5, -10.5); g.lineTo(2.5, -9.5);
      g.moveTo(-2.5, -9.5); g.lineTo(2.5, -10.5);
      g.stroke();
    } else if (kind === 'helmet') {
      g.fillStyle = '#1e293b';
      g.beginPath(); g.arc(0, -7.5, 10, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#334155';
      g.fillRect(-10, -8, 20, 3.2);
      g.fillStyle = '#06b6d4';
      g.shadowColor = '#06b6d4'; g.shadowBlur = 8;
      g.fillRect(-7.5, -6.5, 15, 3);
      g.shadowBlur = 0;
    } else if (kind === 'tophat') {
      g.fillStyle = '#0b0f19';
      g.beginPath(); g.ellipse(0, -9, 12, 3, 0, 0, 6.3); g.fill();
      g.fillRect(-7, -25, 14, 16);
      g.fillStyle = '#e11d48';
      g.fillRect(-7, -13, 14, 3.2);
    } else if (kind === 'mask') {
      g.fillStyle = '#0f172a';
      g.beginPath();
      g.moveTo(-9, -5); g.lineTo(9, -5); g.lineTo(7, 3); g.lineTo(0, 5); g.lineTo(-7, 3);
      g.closePath();
      g.fill();
      g.fillStyle = '#e11d48';
      const wv = Math.sin(Date.now() * 0.005);
      g.beginPath();
      g.moveTo(-d * 8, -5);
      g.quadraticCurveTo(-d * 14, -2 + wv * 3, -d * 20, 2 + wv * 4);
      g.lineTo(-d * 18, 5 + wv * 4);
      g.quadraticCurveTo(-d * 13, 0 + wv * 2, -d * 8, -3);
      g.closePath();
      g.fill();
    } else if (kind === 'scarf') {
      g.fillStyle = '#ec4899';
      g.fillRect(-8.5, 4.5, 17, 4.5);
      const wv = Math.sin(Date.now() * 0.005);
      g.beginPath();
      g.moveTo(d > 0 ? -6 : 6, 7);
      g.quadraticCurveTo(d > 0 ? -16 : 16, 12 + wv * 2, d > 0 ? -13 : 13, 22 + wv * 3);
      g.lineTo(d > 0 ? -8 : 8, 20 + wv * 3);
      g.quadraticCurveTo(d > 0 ? -10 : 10, 11 + wv * 1.5, d > 0 ? -2 : 2, 8);
      g.closePath();
      g.fill();
    } else if (kind === 'wings') {
      g.fillStyle = 'rgba(240, 249, 255, 0.95)';
      g.shadowColor = '#38bdf8'; g.shadowBlur = 10;
      g.beginPath(); g.moveTo(-4, 2); g.quadraticCurveTo(-22, -8, -18, 14); g.quadraticCurveTo(-11, 9, -4, 8); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(4, 2); g.quadraticCurveTo(22, -8, 18, 14); g.quadraticCurveTo(11, 9, 4, 8); g.closePath(); g.fill();
      g.shadowBlur = 0;
    } else if (kind === 'bowtie') {
      g.fillStyle = '#f59e0b';
      g.beginPath(); g.moveTo(0, 7); g.lineTo(-7, 3); g.lineTo(-7, 11); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, 7); g.lineTo(7, 3); g.lineTo(7, 11); g.closePath(); g.fill();
      g.fillStyle = '#e11d48'; g.beginPath(); g.arc(0, 7, 2, 0, 6.3); g.fill();
    } else if (kind === 'eyepatch') {
      g.strokeStyle = '#0f172a'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(-9, -5); g.lineTo(9, -3); g.stroke();
      g.fillStyle = '#0f172a';
      g.beginPath(); g.ellipse(d > 0 ? 4 : -4, -2, 3.5, 3, 0, 0, 6.3); g.fill();
    } else if (kind === 'headband') {
      g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.shadowColor = '#fff'; g.shadowBlur = 4;
      g.beginPath(); g.moveTo(-7.5, -6); g.lineTo(7.5, -6); g.stroke();
      g.shadowBlur = 0;
      g.fillStyle = '#94a3b8';
      g.fillRect(-3, -7.5, 6, 3);
      const wv = Math.sin(Date.now() * 0.005);
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(-d * 7.5, -6);
      g.quadraticCurveTo(-d * 13, -3 + wv * 2, -d * 19, -1 + wv * 3);
      g.lineTo(-d * 18, 2 + wv * 3);
      g.quadraticCurveTo(-d * 12, 0 + wv * 1.5, -d * 7.5, -4.5);
      g.closePath();
      g.fill();
    } else if (kind === 'bracelet') {
      g.strokeStyle = '#f59e0b'; g.lineWidth = 2.4; g.shadowColor = '#f59e0b'; g.shadowBlur = 6;
      g.beginPath(); g.ellipse(0, 0, 4.2, 2.6, 0, 0, 6.3); g.stroke();
      g.shadowBlur = 0;
    } else if (kind === 'necklace') {
      g.strokeStyle = '#fbbf24'; g.lineWidth = 1.8;
      g.beginPath(); g.arc(0, 5, 6.5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      g.fillStyle = '#ef4444'; g.shadowColor = '#ef4444'; g.shadowBlur = 6;
      g.beginPath(); g.arc(0, 11.5, 2.4, 0, 6.3); g.fill();
      g.shadowBlur = 0;
    }
    g.restore();
  }

  drawOutfit(
    g: CanvasRenderingContext2D,
    item: ShopItem,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    width: number
  ) {
    if (!item || item.id === 'classic') return;
    g.save();
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / L;
    const ny = (x1 - x0) / L;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;

    if (item.glow) {
      g.shadowColor = item.glow;
      g.shadowBlur = 10;
    }

    const topW = width * 0.65;
    const botW = width * 0.42;

    g.fillStyle = item.body || '#e2e8f0';
    g.beginPath();
    g.moveTo(x1 - nx * topW, y1 - ny * topW);
    g.lineTo(x1 + nx * topW, y1 + ny * topW);
    g.lineTo(x0 + nx * botW, y0 + ny * botW);
    g.lineTo(x0 - nx * botW, y0 - ny * botW);
    g.closePath();
    g.fill();
    g.shadowBlur = 0;

    if (item.pattern === 'jv') {
      const stripe = (offsetRatio: number, wRatio: number, col: string) => {
        g.strokeStyle = col;
        g.lineWidth = width * wRatio;
        g.beginPath();
        g.moveTo(x1 + nx * (topW * offsetRatio), y1 + ny * (topW * offsetRatio));
        g.lineTo(x0 + nx * (botW * offsetRatio), y0 + ny * (botW * offsetRatio));
        g.stroke();
      };
      stripe(-0.5, 0.28, item.accent);
      stripe(0, 0.28, item.accent);
      stripe(0.5, 0.28, item.accent);
      g.fillStyle = item.accent === '#111418' ? '#ffffff' : item.accent;
      g.beginPath();
      g.arc(mx - nx * (topW * 0.28), my - ny * (topW * 0.28) - 1, 1.8, 0, 6.3);
      g.fill();
    } else if (item.pattern === 'jh') {
      g.fillStyle = item.accent;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 + nx * topW, y1 + ny * topW);
      g.lineTo(x0 + nx * botW, y0 + ny * botW);
      g.lineTo(x0, y0);
      g.closePath();
      g.fill();
      g.fillStyle = '#fbbf24';
      g.beginPath();
      g.arc(mx - nx * (topW * 0.28), my - 2, 1.6, 0, 6.3);
      g.fill();
    } else if (item.pattern === 'jc') {
      g.strokeStyle = item.accent;
      g.lineWidth = width * 0.36;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x0, y0);
      g.stroke();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x1 - nx * (width * 0.2), y1 - ny * (width * 0.2));
      g.lineTo(x0 - nx * (width * 0.14), y0 - ny * (width * 0.14));
      g.moveTo(x1 + nx * (width * 0.2), y1 + ny * (width * 0.2));
      g.lineTo(x0 + nx * (width * 0.14), y0 + ny * (width * 0.14));
      g.stroke();
    } else if (item.pattern === 'jp') {
      g.strokeStyle = item.accent;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(x1 - nx * topW, y1 - ny * topW);
      g.lineTo(x1, y1 + 2);
      g.lineTo(x1 + nx * topW, y1 + ny * topW);
      g.stroke();
      g.fillStyle = item.accent;
      g.beginPath();
      g.arc(mx - nx * (topW * 0.26), my - 2, 1.8, 0, 6.3);
      g.fill();
    } else if (item.pattern === 'vest') {
      g.fillStyle = item.accent;
      g.beginPath();
      g.moveTo(x1 - nx * (topW * 0.8), y1 + 1);
      g.lineTo(x1 + nx * (topW * 0.8), y1 + 1);
      g.lineTo(x0 + nx * (botW * 0.7), y0 - 1);
      g.lineTo(x0 - nx * (botW * 0.7), y0 - 1);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.4)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(mx - nx * (topW * 0.6), my - 2);
      g.lineTo(mx + nx * (topW * 0.6), my - 2);
      g.moveTo(mx - nx * (topW * 0.5), my + 2);
      g.lineTo(mx + nx * (topW * 0.5), my + 2);
      g.stroke();
      g.fillStyle = '#0f172a';
      g.fillRect(x1 - nx * topW - 1, y1 - 1, 2.5, 3);
      g.fillRect(x1 + nx * topW - 1.5, y1 - 1, 2.5, 3);
    } else if (item.pattern === 'stripes' || item.pattern === 'rainbow') {
      const cols =
        item.pattern === 'rainbow'
          ? ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899']
          : [item.accent, item.accent, item.accent];
      cols.forEach((c, k) => {
        const tPos = (k + 0.5) / cols.length;
        const px = x1 + (x0 - x1) * tPos;
        const py = y1 + (y0 - y1) * tPos;
        const curW = topW + (botW - topW) * tPos;
        g.strokeStyle = c;
        g.lineWidth = item.pattern === 'rainbow' ? 1.5 : 2;
        g.beginPath();
        g.moveTo(px - nx * curW, py - ny * curW);
        g.lineTo(px + nx * curW, py + ny * curW);
        g.stroke();
      });
    }

    const shortsColor = item.club
      ? item.id === 'club_neftci' || item.id === 'club_qarabag'
        ? '#0f172a'
        : item.body || '#0f172a'
      : '#0f172a';
    g.fillStyle = shortsColor;
    g.beginPath();
    g.moveTo(x0 - nx * (botW * 1.05), y0 - 1);
    g.lineTo(x0 + nx * (botW * 1.05), y0 - 1);
    g.lineTo(x0 + nx * (botW * 0.85), y0 + 3.5);
    g.lineTo(x0 - nx * (botW * 0.85), y0 + 3.5);
    g.closePath();
    g.fill();
    g.restore();
  }
}

export const PartyEconomy = new EconomyStore();

const itemPngCache = new Map<string, string>();
export function getShopItemPng(item: ShopItem): string {
  const cached = itemPngCache.get(item.id);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  if (!g) return '';

  // Subtle monochrome stage ring
  const bg = g.createRadialGradient(64, 64, 8, 64, 64, 58);
  bg.addColorStop(0, 'rgba(255,255,255,0.08)');
  bg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = bg;
  g.fillRect(0, 0, 128, 128);

  if (item.category === 'outfit') {
    g.save();
    g.translate(64, 92);
    g.scale(2.8, 2.8);
    // Draw silhouette mannequin shoulders
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.beginPath();
    g.arc(0, -23, 5, 0, Math.PI * 2);
    g.fill();
    if (item.id === 'classic') {
      g.fillStyle = '#d4d4d8';
      g.beginPath();
      g.moveTo(-7, -14); g.lineTo(7, -14); g.lineTo(5, 4); g.lineTo(-5, 4);
      g.closePath(); g.fill();
    } else {
      PartyEconomy.drawOutfit(g, item, 0, 2, 0, -16, 12);
    }
    g.restore();
  } else {
    g.save();
    const kind = item.kind || '';
    const isBodyAcc = kind === 'scarf' || kind === 'wings' || kind === 'bowtie' || kind === 'necklace';
    const isWristAcc = kind === 'bracelet';
    g.translate(64, isBodyAcc ? 54 : isWristAcc ? 64 : 84);
    g.scale(3.4, 3.4);
    if (!isBodyAcc && !isWristAcc) {
      // Subtle translucent dummy head outline for hat/mask context
      g.fillStyle = 'rgba(255,255,255,0.07)';
      g.strokeStyle = 'rgba(255,255,255,0.22)';
      g.lineWidth = 0.8;
      g.beginPath();
      g.arc(0, -1, 8.5, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    PartyEconomy.drawAccessory(g, kind, 0, 0, 1, 1);
    g.restore();
  }

  const url = c.toDataURL('image/png');
  itemPngCache.set(item.id, url);
  return url;
}
