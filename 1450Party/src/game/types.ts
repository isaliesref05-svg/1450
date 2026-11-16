export type WeaponId =
  | 'fist'
  | 'sword'
  | 'hammer'
  | 'spear'
  | 'gun'
  | 'smg'
  | 'shotgun'
  | 'bow'
  | 'bomb'
  | 'mine'
  | 'sniper'
  | 'rocket'
  | 'flame'
  | 'axe'
  | 'laser'
  | 'shuriken'
  | 'staff'
  | 'frost'
  | 'tesla'
  | 'rifle'
  | 'minigun'
  | 'grenade'
  | 'chainsaw'
  | 'boomerang'
  | 'katana';

export type WeaponChoice = WeaponId | 'random';

export type MapId =
  | 'snow_peaks'
  | 'steel_foundry'
  | 'neon_city'
  | 'lava_core'
  | 'sky_citadel'
  | 'space_station'
  | 'ancient_forest'
  | 'laser_vault'
  | 'random';

export type MinigameId =
  | 'sumo'
  | 'futbol'
  | 'coins'
  | 'dodge'
  | 'race'
  | 'king'
  | 'bomb'
  | 'snow'
  | 'laser'
  | 'lava'
  | 'tiles'
  | 'paint';

export type ScreenId =
  | 'home'
  | 'vsSetup'
  | 'minigames'
  | 'shop'
  | 'onlineChoice'
  | 'roomCreate'
  | 'roomJoin'
  | 'roomLobby'
  | 'game';

export type ShopCategory = 'outfit' | 'kit' | 'hat' | 'accessory';

export interface WeaponInfo {
  id: WeaponChoice;
  name: string;
  tag: string;
}

export const WEAPON_LIST: WeaponInfo[] = [
  { id: 'sword', name: 'Qılınc', tag: 'Yaxın' },
  { id: 'katana', name: 'Katana', tag: 'Sürətli' },
  { id: 'axe', name: 'Balta', tag: 'Ağır' },
  { id: 'hammer', name: 'Çəkic', tag: 'Zərbə' },
  { id: 'chainsaw', name: 'Mişar', tag: 'Davamlı' },
  { id: 'spear', name: 'Nizə', tag: 'Atılan' },
  { id: 'gun', name: 'Tapanca', tag: 'Dəqiq' },
  { id: 'smg', name: 'SMG', tag: 'Tez' },
  { id: 'rifle', name: 'Avtomat', tag: 'Silah' },
  { id: 'minigun', name: 'Pulemyot', tag: 'Seriya' },
  { id: 'shotgun', name: 'Shotgun', tag: 'Yaylım' },
  { id: 'sniper', name: 'Snayper', tag: 'Lazer' },
  { id: 'rocket', name: 'Raket', tag: 'Partlayış' },
  { id: 'grenade', name: 'Qranat', tag: 'Sıçrayan' },
  { id: 'bomb', name: 'Bomba', tag: 'Atılan' },
  { id: 'mine', name: 'Mina', tag: 'Tələ' },
  { id: 'flame', name: 'Alov', tag: 'Yandırıcı' },
  { id: 'bow', name: 'Ox', tag: 'Səssiz' },
  { id: 'laser', name: 'Lazer', tag: 'Enerji' },
  { id: 'shuriken', name: 'Şüriken', tag: 'Üçlü' },
  { id: 'staff', name: 'Əsa', tag: 'İzləyən' },
  { id: 'frost', name: 'Buz', tag: 'Yavaşladan' },
  { id: 'tesla', name: 'Tesla', tag: 'Zəncir' },
  { id: 'boomerang', name: 'Bumeranq', tag: 'Qayıdan' },
  { id: 'fist', name: 'Yumruq', tag: 'Klassik' },
  { id: 'random', name: 'Təsadüfi', tag: 'Hər raund' },
];

export interface MapInfo {
  id: MapId;
  name: string;
  desc: string;
  mechanic: string;
}

export const MAP_LIST: MapInfo[] = [
  { id: 'snow_peaks', name: 'Qarlı Zirvə', desc: 'Sürüşkən buz körpüsü · Batut şam', mechanic: 'Buz + Şimal İşığı' },
  { id: 'steel_foundry', name: 'Polad Zavod', desc: 'Konveyer lentləri · Hərəkətli kran · Buxar', mechanic: 'Konveyer + Kran' },
  { id: 'neon_city', name: 'Neon Metropol', desc: 'Atlama pedləri · İki tərəfli portallar', mechanic: 'Portal + Ped' },
  { id: 'lava_core', name: 'Vulkan Krateri', desc: 'Qalxan maqma · Üzən bazalt daşları', mechanic: 'Qalxan Lava' },
  { id: 'sky_citadel', name: 'Qala Körpüsü', desc: 'Əkiz sallanan tikanlı mişarlar · Qala divarı', mechanic: 'Mişarlı Tələ' },
  { id: 'space_station', name: 'Orbital Stansiya', desc: 'Aşağı cazibə · Sərhəd enerji sıçrayışı', mechanic: 'Kosmik Cazibə' },
  { id: 'ancient_forest', name: 'Meşə Məbədi', desc: 'Parlaq göbələk batutlar · Atəşböcəkləri', mechanic: 'Göbələk Batut' },
  { id: 'laser_vault', name: 'Lazer Anbarı', desc: 'Dövrələyən lazer qapıları · Lift platformalar', mechanic: 'Lazer + Lift' },
  { id: 'random', name: 'Təsadüfi', desc: 'Hər raundda fərqli seçilmiş arena', mechanic: 'Dinamik' },
];

export interface MinigameInfo {
  id: MinigameId;
  name: string;
  desc: string;
  tag: string;
}

export const MINIGAME_LIST: MinigameInfo[] = [
  { id: 'sumo', name: 'Sumo Döyüşü', desc: 'Rəqibləri halqadan kənara itələ', tag: '2-4 Oyunçu' },
  { id: 'futbol', name: 'Mini Futbol', desc: '3 qol vuran tərəf raundu qazanır', tag: 'Komanda' },
  { id: 'laser', name: 'Lazer Tələsi', desc: 'Hərəkətli lazerlərdən sıyrıl və enerji topla', tag: 'Sağ qal' },
  { id: 'lava', name: 'Lava Qalxışı', desc: 'Qalxan maqmadan qaçıb platformalara tullan', tag: 'Parkur' },
  { id: 'tiles', name: 'Qırılan Zəmin', desc: 'Üstünə basdığın lövhələr çökür, sıçra!', tag: 'Təhlükə' },
  { id: 'paint', name: 'Rəng Zəbt Et', desc: 'Ərazini öz rənginə boya, zərbə ilə rəqibi itələ', tag: '35 Saniyə' },
  { id: 'coins', name: 'Coin Yarışı', desc: 'Qızıl və almaz sikkələri topla', tag: '30 Saniyə' },
  { id: 'dodge', name: 'Meteor Yağışı', desc: 'Sürətlənən meteorlardan qaç və tullan', tag: 'Sağ qal' },
  { id: 'race', name: 'Sürət Yarışı', desc: 'Maneələr üstündən atlanıb finişə çat', tag: 'Parkur' },
  { id: 'king', name: 'Kral Taxtı', desc: 'Mərkəzi tac dairəsini əlində saxla', tag: '45 Saniyə' },
  { id: 'bomb', name: 'İsti Bomba', desc: 'Taymer bitmədən bombanı rəqibə at', tag: 'Partlayış' },
  { id: 'snow', name: 'Qar Döyüşü', desc: 'Qar topları ilə rəqibləri vur', tag: '40 Saniyə' },
];

export interface PlayerInput {
  x: number;
  y: number;
  action: boolean;
  jump: boolean;
  auto: boolean;
  releaseAction: boolean;
  releaseX: number;
  releaseY: number;
}

export const inputPlayers: PlayerInput[] = [
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0 },
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0 },
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0 },
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0 },
];

export const DEFAULT_PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
export const PLAYER_COLORS = [...DEFAULT_PLAYER_COLORS];
export const PLAYER_NAMES = ['P1', 'P2', 'P3', 'P4'];
export const COLOR_CHOICES = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#ff4fd8',
  '#8b5cf6',
  '#2dd4ff',
  '#b6f34a',
  '#f97316',
  '#14b8a6',
];

const keys: Record<string, boolean> = {};
const kbPrev = [false, false, false, false];
const kbActionPrev = [false, false, false, false];

const KB_MAP = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', d: 'KeyS', a: 'Space', j: 'KeyW' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', a: 'Enter', j: 'ArrowUp' },
  { l: 'KeyJ', r: 'KeyL', u: 'KeyI', d: 'KeyK', a: 'KeyO', j: 'KeyI' },
  { l: 'Numpad4', r: 'Numpad6', u: 'Numpad8', d: 'Numpad5', a: 'Numpad0', j: 'Numpad8' },
];

let kbListenersBound = false;
export function bindKeyboardListeners() {
  if (kbListenersBound || typeof window === 'undefined') return;
  kbListenersBound = true;
  const gameKeys = new Set([
    'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Enter', 'Numpad0', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad8',
  ]);
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    const tag = (e.target as HTMLElement | null)?.tagName || '';
    if (gameKeys.has(e.code) && !/INPUT|TEXTAREA/.test(tag)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}

export function pollKeyboard(onlineMode: boolean) {
  KB_MAP.forEach((m, i) => {
    if (onlineMode && i !== 0) return;
    const x = (keys[m.r] ? 1 : 0) - (keys[m.l] ? 1 : 0);
    const y = (keys[m.d] ? 1 : 0) - (keys[m.u] ? 1 : 0);
    const a = !!keys[m.a];
    const j = !!keys[m.j];
    const act = !!(x || y || a || j);
    const inp = inputPlayers[i];
    if (act || kbPrev[i]) {
      inp.x = x;
      inp.y = y;
      inp.action = a;
      inp.jump = j;
      inp.auto = false;
    }
    if (kbActionPrev[i] && !a) {
      inp.releaseAction = true;
      inp.releaseX = x || inp.releaseX;
      inp.releaseY = y || inp.releaseY;
    }
    kbPrev[i] = act;
    kbActionPrev[i] = a;
  });
}

export function clearReleasedActions() {
  for (const inp of inputPlayers) {
    inp.releaseAction = false;
  }
}

export function resetInputs() {
  for (const k of Object.keys(keys)) delete keys[k];
  kbPrev.fill(false);
  kbActionPrev.fill(false);
  for (const inp of inputPlayers) {
    inp.x = 0;
    inp.y = 0;
    inp.releaseX = 0;
    inp.releaseY = 0;
    inp.action = false;
    inp.jump = false;
    inp.releaseAction = false;
    inp.auto = false;
  }
}
