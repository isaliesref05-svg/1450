import Peer, { DataConnection } from 'peerjs';
import { PartyAudio } from './audio';
import { PartyEconomy } from './economy';
import { FightSerializedState } from './fightEngine';
import { MiniSerializedState } from './minigameEngine';
import { inputPlayers, MapId, MinigameId, PLAYER_NAMES, WeaponChoice } from './types';

export const MAX_ONLINE_SLOTS = 4;
const REG_ID = 'stickparty-registry-v1x';

export interface LobbyConfig {
  mode: 'vs' | 'minigames';
  map: MapId;
  rounds: number;
  weapons: WeaponChoice[];
  loot: boolean;
  mini: MinigameId;
}

export interface DiscoveredRoom {
  id: string;
  name: string;
  lock: boolean;
  n: number;
  t: number;
}

export interface OnlineSnapshot {
  onlineMode: boolean;
  isHost: boolean;
  guestIndex: number;
  guestReady: boolean;
  roomName: string;
  lobbySlots: (string | null)[];
  lobbyReady: boolean[];
  cfg: LobbyConfig;
  discoveredRooms: DiscoveredRoom[];
  roomsLoading: boolean;
  creating: boolean;
  joining: boolean;
}

export interface OnlineHandlers {
  onToast: (msg: string, tone?: 'info' | 'error' | 'success') => void;
  onLobbyJoined: () => void;
  onStartGame: (cfg: LobbyConfig, playerCount: number) => void;
  onFightState: (s: FightSerializedState) => void;
  onMiniState: (s: MiniSerializedState) => void;
  onRematch: () => void;
  onDisconnectToHome: () => void;
}

type TaggedConn = DataConnection & { slot?: number };

export function roomPeerId(name: string): string {
  return (
    'stickparty-' +
    [...name.trim().toLowerCase()]
      .map((c) => (/[a-z0-9]/.test(c) ? c : '_' + c.charCodeAt(0).toString(16)))
      .join('') +
    'x'
  );
}

class OnlineManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private conns: TaggedConn[] = [];
  private isHostFlag = false;
  private onlineFlag = false;
  private guestIdx = 1;
  private guestReadyFlag = false;
  private roomName = '';
  private roomPassword = '';
  private lobbySlots: (string | null)[] = [null, null, null, null];
  private lobbyReady: boolean[] = [true, false, false, false];
  private cfg: LobbyConfig = {
    mode: 'vs',
    map: 'snow_peaks',
    rounds: 3,
    weapons: ['sword', 'sword', 'sword', 'sword'],
    loot: false,
    mini: 'sumo',
  };
  private netFrame = 0;

  private regPeer: Peer | null = null;
  private regPending = false;
  private regRooms = new Map<string, DiscoveredRoom>();
  private annConn: DataConnection | null = null;
  private annTimer: ReturnType<typeof setInterval> | null = null;
  private discoveredRooms: DiscoveredRoom[] = [];
  private roomsLoading = false;
  private creating = false;
  private joining = false;

  private listeners = new Set<() => void>();
  private handlers: OnlineHandlers | null = null;
  private isGameActive: () => boolean = () => false;

  private snapshotCache: OnlineSnapshot = {
    onlineMode: false,
    isHost: false,
    guestIndex: 1,
    guestReady: false,
    roomName: '',
    lobbySlots: [null, null, null, null],
    lobbyReady: [true, false, false, false],
    cfg: { ...this.cfg, weapons: [...this.cfg.weapons] },
    discoveredRooms: [],
    roomsLoading: false,
    creating: false,
    joining: false,
  };

  setHandlers(handlers: OnlineHandlers, isGameActive: () => boolean) {
    this.handlers = handlers;
    this.isGameActive = isGameActive;
  }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  getSnapshot = (): OnlineSnapshot => this.snapshotCache;

  private emit() {
    this.snapshotCache = {
      onlineMode: this.onlineFlag,
      isHost: this.isHostFlag,
      guestIndex: this.guestIdx,
      guestReady: this.guestReadyFlag,
      roomName: this.roomName,
      lobbySlots: [...this.lobbySlots],
      lobbyReady: [...this.lobbyReady],
      cfg: { ...this.cfg, weapons: [...this.cfg.weapons] },
      discoveredRooms: [...this.discoveredRooms],
      roomsLoading: this.roomsLoading,
      creating: this.creating,
      joining: this.joining,
    };
    this.listeners.forEach((cb) => cb());
  }

  isOnline = () => this.onlineFlag;
  isHost = () => this.isHostFlag;
  guestIndex = () => this.guestIdx;
  connectedCount = () =>
    this.isHostFlag
      ? Math.max(1, 1 + this.conns.filter((c) => c.open).length)
      : Math.max(2, this.lobbySlots.filter(Boolean).length || 2);

  claimRegistry() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (this.regPeer || this.regPending) return;
    this.regPending = true;
    try {
      const p = new Peer(REG_ID);
      p.on('open', () => {
        this.regPending = false;
        this.regPeer = p;
      });
      p.on('error', () => {
        this.regPending = false;
        try {
          p.destroy();
        } catch {
          // ignore
        }
        if (this.regPeer === p) this.regPeer = null;
      });
      p.on('close', () => {
        if (this.regPeer === p) this.regPeer = null;
      });
      p.on('disconnected', () => {
        try {
          p.reconnect();
        } catch {
          // ignore
        }
      });
      p.on('connection', (c) => {
        c.on('data', (raw) => {
          const d = raw as Record<string, unknown> | null;
          if (!d) return;
          if (d.type === 'reg' && typeof d.id === 'string') {
            this.regRooms.set(d.id, {
              id: d.id,
              name: String(d.name || '').slice(0, 20),
              lock: !!d.lock,
              n: Number(d.n) || 1,
              t: Date.now(),
            });
          } else if (d.type === 'unreg' && typeof d.id === 'string') {
            this.regRooms.delete(d.id);
          } else if (d.type === 'list') {
            const now = Date.now();
            for (const [k, v] of this.regRooms) {
              if (now - v.t > 12000) this.regRooms.delete(k);
            }
            try {
              c.send({ type: 'rooms', rooms: [...this.regRooms.values()] });
            } catch {
              // ignore
            }
          }
        });
      });
    } catch {
      this.regPending = false;
    }
  }

  refreshRooms() {
    this.roomsLoading = true;
    this.emit();
    let done = false;
    let lp: Peer | null = null;
    const finish = (rooms: DiscoveredRoom[] | null) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      try {
        lp?.destroy();
      } catch {
        // ignore
      }
      this.roomsLoading = false;
      if (rooms) this.discoveredRooms = rooms;
      else this.claimRegistry();
      this.emit();
    };
    const timeout = setTimeout(() => finish(null), 5000);
    try {
      lp = new Peer();
      lp.on('error', () => finish(null));
      lp.on('open', () => {
        if (!lp) return;
        const c = lp.connect(REG_ID);
        c.on('open', () => c.send({ type: 'list' }));
        c.on('data', (raw) => {
          const d = raw as { type?: string; rooms?: DiscoveredRoom[] } | null;
          if (d && d.type === 'rooms') finish(d.rooms || []);
        });
        c.on('error', () => finish(null));
      });
    } catch {
      finish(null);
    }
  }

  private announceStart() {
    this.announceStop();
    const send = () => {
      if (!this.peer || !this.isHostFlag || !this.roomName) return;
      try {
        if (!this.annConn || !this.annConn.open) {
          if (this.annConn) return;
          const c = this.peer.connect(REG_ID);
          this.annConn = c;
          c.on('open', send);
          c.on('error', () => {
            this.annConn = null;
          });
          c.on('close', () => {
            this.annConn = null;
          });
          setTimeout(() => {
            if (this.annConn === c && !c.open) this.annConn = null;
          }, 5000);
          return;
        }
        this.annConn.send({
          type: 'reg',
          id: this.peer.id,
          name: this.roomName,
          lock: !!this.roomPassword,
          n: this.connectedCount(),
        });
      } catch {
        // ignore
      }
    };
    send();
    this.annTimer = setInterval(send, 4000);
  }

  private announceStop() {
    if (this.annTimer) {
      clearInterval(this.annTimer);
      this.annTimer = null;
    }
    try {
      if (this.annConn && this.annConn.open && this.peer) {
        this.annConn.send({ type: 'unreg', id: this.peer.id });
      }
    } catch {
      // ignore
    }
    try {
      this.annConn?.close();
    } catch {
      // ignore
    }
    this.annConn = null;
  }

  cleanup() {
    this.announceStop();
    const cs = this.conns.slice();
    const c = this.conn;
    const p = this.peer;
    this.conns = [];
    this.conn = null;
    this.peer = null;
    this.onlineFlag = false;
    this.isHostFlag = false;
    this.guestIdx = 1;
    this.guestReadyFlag = false;
    this.creating = false;
    this.joining = false;
    this.roomName = '';
    this.roomPassword = '';
    this.lobbySlots = [null, null, null, null];
    this.lobbyReady = [true, false, false, false];
    PLAYER_NAMES[0] = PartyEconomy.name() || 'P1';
    PLAYER_NAMES[1] = 'P2';
    PLAYER_NAMES[2] = 'P3';
    PLAYER_NAMES[3] = 'P4';
    cs.forEach((x) => {
      try {
        x.close();
      } catch {
        // ignore
      }
    });
    try {
      c?.close();
    } catch {
      // ignore
    }
    try {
      p?.destroy();
    } catch {
      // ignore
    }
    this.emit();
  }

  createRoom(name: string, password: string) {
    const cleanName = name.trim();
    if (!cleanName) {
      this.handlers?.onToast('Otaq adı daxil edin', 'error');
      return;
    }
    this.cleanup();
    this.isHostFlag = true;
    this.onlineFlag = true;
    this.creating = true;
    this.roomName = cleanName;
    this.roomPassword = password;
    this.emit();

    try {
      const p = new Peer(roomPeerId(cleanName));
      this.peer = p;

      p.on('open', () => {
        this.creating = false;
        this.lobbySlots = [PartyEconomy.name() || 'Host', null, null, null];
        this.lobbyReady = [true, false, false, false];
        PLAYER_NAMES[0] = this.lobbySlots[0] || 'Host';
        this.emit();
        this.announceStart();
        this.handlers?.onLobbyJoined();
      });

      p.on('error', (err) => {
        if (err.type === 'peer-unavailable') return;
        this.creating = false;
        this.handlers?.onToast(
          err.type === 'unavailable-id' ? 'Bu otaq adı artıq istifadədədir' : `Bağlantı xətası: ${err.type}`,
          'error'
        );
        this.cleanup();
      });

      p.on('connection', (rawConn) => {
        const c = rawConn as TaggedConn;
        c.on('data', (raw) => {
          const d = raw as Record<string, unknown>;
          if (!d || typeof d !== 'object') return;
          if (d.type === 'auth') {
            if (this.conns.filter((x) => x.open).length >= MAX_ONLINE_SLOTS - 1) {
              c.send({ type: 'full' });
              setTimeout(() => c.close(), 200);
              return;
            }
            if ((d.password || '') !== this.roomPassword) {
              c.send({ type: 'authFail' });
              setTimeout(() => c.close(), 200);
              return;
            }
            let freeSlot = -1;
            for (let s = 1; s < MAX_ONLINE_SLOTS; s++) {
              if (!this.lobbySlots[s]) {
                freeSlot = s;
                break;
              }
            }
            if (freeSlot < 0) freeSlot = this.conns.length + 1;
            const gName = String(d.name || '').trim().slice(0, 14) || `P${freeSlot + 1}`;
            const normIncoming = gName.toLowerCase();
            const hasDup = this.lobbySlots.some(
              (existing) => existing !== null && existing.trim().toLowerCase() === normIncoming
            );
            if (hasDup) {
              c.send({ type: 'dupName' });
              setTimeout(() => c.close(), 200);
              return;
            }
            c.slot = freeSlot;
            this.conns.push(c);
            this.lobbySlots[freeSlot] = gName;
            this.lobbyReady[freeSlot] = false;
            PLAYER_NAMES[freeSlot] = gName;
            c.send({
              type: 'authOk',
              slot: freeSlot,
              name: PartyEconomy.name() || 'Host',
              slots: this.lobbySlots,
              ready: this.lobbyReady,
              cfg: this.cfg,
            });
            this.broadcastLobby();
            this.announceStart();
          } else if (c.slot) {
            this.handleNetData(d, c.slot);
          }
        });

        c.on('close', () => {
          const idx = this.conns.indexOf(c);
          if (idx < 0) return;
          this.conns.splice(idx, 1);
          const slot = c.slot;
          if (slot && slot >= 1 && slot < MAX_ONLINE_SLOTS) {
            this.lobbySlots[slot] = null;
            this.lobbyReady[slot] = false;
            PLAYER_NAMES[slot] = `P${slot + 1}`;
          }
          this.broadcastLobby();
          this.announceStart();
          if (this.isGameActive() && this.conns.length === 0) {
            this.handlers?.onToast('Rəqib oyundan ayrıldı', 'error');
            this.cleanup();
            this.handlers?.onDisconnectToHome();
          }
        });
      });
    } catch {
      this.creating = false;
      this.cleanup();
      this.handlers?.onToast('Onlayn serverə qoşulmaq mümkün olmadı', 'error');
    }
  }

  joinRoom(name: string, password: string) {
    const cleanName = name.trim();
    if (!cleanName) {
      this.handlers?.onToast('Otaq adı daxil edin', 'error');
      return;
    }
    this.cleanup();
    this.onlineFlag = true;
    this.isHostFlag = false;
    this.joining = true;
    this.roomName = cleanName;
    this.emit();

    try {
      const p = new Peer();
      this.peer = p;

      p.on('error', (err) => {
        this.joining = false;
        this.handlers?.onToast(
          err.type === 'peer-unavailable' ? 'Otaq tapılmadı' : `Bağlantı xətası: ${err.type}`,
          'error'
        );
        this.cleanup();
      });

      p.on('open', () => {
        const c = p.connect(roomPeerId(cleanName), { reliable: true });
        this.conn = c;
        c.on('open', () => {
          c.send({ type: 'auth', password, name: PartyEconomy.name() || '' });
        });
        c.on('data', (raw) => {
          const d = raw as Record<string, unknown>;
          if (d && typeof d === 'object') this.handleNetData(d, 0);
        });
        c.on('close', () => {
          if (this.onlineFlag) {
            this.handlers?.onToast('Host ilə bağlantı kəsildi', 'error');
            this.cleanup();
            if (this.isGameActive()) this.handlers?.onDisconnectToHome();
          }
        });
      });
    } catch {
      this.joining = false;
      this.cleanup();
      this.handlers?.onToast('Qoşulma xətası', 'error');
    }
  }

  updateConfig(partial: Partial<LobbyConfig>) {
    if (!this.isHostFlag) return;
    this.cfg = {
      ...this.cfg,
      ...partial,
      weapons: partial.weapons ? [...partial.weapons] : [...this.cfg.weapons],
    };
    this.broadcastLobby();
  }

  toggleGuestReady() {
    if (this.isHostFlag || !this.conn || !this.conn.open) return;
    this.guestReadyFlag = !this.guestReadyFlag;
    this.lobbyReady[this.guestIdx] = this.guestReadyFlag;
    this.conn.send({ type: 'ready_toggle', slot: this.guestIdx, ready: this.guestReadyFlag });
    PartyAudio.play(this.guestReadyFlag ? 'buy' : 'hit');
    this.emit();
  }

  startLobbyMatch() {
    if (!this.isHostFlag) return;
    const count = Math.max(2, this.connectedCount());
    const payload = {
      type: 'start',
      cfg: { ...this.cfg, players: count },
    };
    this.conns.forEach((c) => {
      if (c.open) {
        try {
          c.send(payload);
        } catch {
          // ignore
        }
      }
    });
    this.handlers?.onStartGame({ ...this.cfg }, count);
  }

  sendRematch() {
    if (this.isHostFlag) {
      this.handlers?.onRematch();
    } else if (this.conn && this.conn.open) {
      this.conn.send({ type: 'rematch' });
    }
  }

  sendNetTick(
    mode: 'vs' | 'minigames',
    paused: boolean,
    isPlaying: boolean,
    serializeFight: () => FightSerializedState,
    serializeMini: () => MiniSerializedState
  ) {
    if (!this.onlineFlag) return;
    if (!this.isHostFlag) {
      if (!this.conn || !this.conn.open) return;
      const i = inputPlayers[0];
      this.conn.send({
        type: 'input',
        x: i.x,
        y: i.y,
        action: i.action,
        jump: i.jump,
        auto: !!i.auto,
        releaseAction: i.releaseAction,
        releaseX: i.releaseX,
        releaseY: i.releaseY,
      });
      i.releaseAction = false;
      return;
    }
    const live = this.conns.filter((c) => c.open);
    if (!live.length) return;
    if (++this.netFrame % 2) return;
    const msg =
      mode === 'vs'
        ? { type: 'fstate', s: serializeFight() }
        : { type: 'state', s: serializeMini() };
    void paused;
    void isPlaying;
    live.forEach((c) => {
      try {
        c.send(msg);
      } catch {
        // ignore
      }
    });
  }

  private broadcastLobby() {
    if (!this.isHostFlag) return;
    const msg = {
      type: 'lobby',
      slots: this.lobbySlots,
      ready: this.lobbyReady,
      cfg: this.cfg,
    };
    this.conns.forEach((c) => {
      if (c.open) {
        try {
          c.send(msg);
        } catch {
          // ignore
        }
      }
    });
    this.emit();
  }

  private handleNetData(d: Record<string, unknown>, slot: number) {
    switch (d.type) {
      case 'authFail':
        this.joining = false;
        this.handlers?.onToast('Şifrə yanlışdır!', 'error');
        this.cleanup();
        break;
      case 'full':
        this.joining = false;
        this.handlers?.onToast('Otaq doludur (maksimum 4 oyunçu)', 'error');
        this.cleanup();
        break;
      case 'dupName':
        this.joining = false;
        this.handlers?.onToast('Bu otaqda eyni adda oyunçu artıq var — yuxarıdan adınızı dəyişin!', 'error');
        this.cleanup();
        break;
      case 'authOk': {
        this.joining = false;
        this.guestIdx = Number(d.slot) || 1;
        this.guestReadyFlag = false;
        const incomingSlots = Array.isArray(d.slots) ? (d.slots as (string | null)[]) : [null, null, null, null];
        this.lobbySlots = incomingSlots.slice(0, 4);
        this.lobbyReady = Array.isArray(d.ready) ? (d.ready as boolean[]).slice(0, 4) : [true, false, false, false];
        this.lobbySlots[this.guestIdx] = PartyEconomy.name() || `P${this.guestIdx + 1}`;
        this.lobbySlots[0] = String(d.name || 'Host').slice(0, 14);
        for (let i = 0; i < MAX_ONLINE_SLOTS; i++) {
          PLAYER_NAMES[i] = this.lobbySlots[i] || (i === 0 ? 'Host' : `P${i + 1}`);
        }
        if (d.cfg && typeof d.cfg === 'object') {
          this.cfg = { ...this.cfg, ...(d.cfg as Partial<LobbyConfig>) };
        }
        this.emit();
        this.handlers?.onLobbyJoined();
        break;
      }
      case 'lobby': {
        if (Array.isArray(d.slots)) this.lobbySlots = (d.slots as (string | null)[]).slice(0, 4);
        if (Array.isArray(d.ready)) this.lobbyReady = (d.ready as boolean[]).slice(0, 4);
        if (d.cfg && typeof d.cfg === 'object') {
          this.cfg = { ...this.cfg, ...(d.cfg as Partial<LobbyConfig>) };
        }
        for (let i = 0; i < MAX_ONLINE_SLOTS; i++) {
          PLAYER_NAMES[i] = this.lobbySlots[i] || (i === 0 ? 'Host' : `P${i + 1}`);
        }
        this.emit();
        break;
      }
      case 'ready_toggle':
        if (this.isHostFlag && slot >= 1 && slot < MAX_ONLINE_SLOTS) {
          this.lobbyReady[slot] = !!d.ready;
          this.broadcastLobby();
        }
        break;
      case 'start': {
        const sc = d.cfg as LobbyConfig & { players?: number };
        if (sc) {
          this.cfg = { ...this.cfg, ...sc };
          this.emit();
          this.handlers?.onStartGame(this.cfg, sc.players || this.connectedCount());
        }
        break;
      }
      case 'fstate':
        if (d.s) this.handlers?.onFightState(d.s as FightSerializedState);
        break;
      case 'state':
        if (d.s) this.handlers?.onMiniState(d.s as MiniSerializedState);
        break;
      case 'input':
        if (this.isHostFlag && slot >= 1 && slot < MAX_ONLINE_SLOTS) {
          const i = inputPlayers[slot];
          const axis = (v: unknown) => {
            const num = Number(v);
            return Number.isFinite(num) ? Math.max(-1, Math.min(1, num)) : 0;
          };
          i.x = axis(d.x);
          i.y = axis(d.y);
          i.action = !!d.action;
          i.jump = !!d.jump;
          i.auto = !!d.auto;
          if (d.releaseAction && !this.isGameActive()) {
            // ignored outside play
          } else if (d.releaseAction) {
            i.releaseAction = true;
            i.releaseX = axis(d.releaseX);
            i.releaseY = axis(d.releaseY);
          }
        }
        break;
      case 'rematch':
        if (this.isHostFlag) this.handlers?.onRematch();
        break;
    }
  }
}

export const onlineManager = new OnlineManager();
