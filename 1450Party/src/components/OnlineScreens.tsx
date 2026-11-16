import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  Box,
  Check,
  Clock,
  Copy,
  Crown,
  DoorOpen,
  Gamepad2,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Swords,
  Unlock,
  User,
} from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { LobbyConfig, onlineManager } from '../game/online';
import { getMapPng, getMinigamePng, getWeaponPng } from '../game/pngAssets';
import {
  MAP_LIST,
  MINIGAME_LIST,
  PLAYER_COLORS,
  ScreenId,
  WEAPON_LIST,
  WeaponChoice,
} from '../game/types';

interface OnlineScreensProps {
  screen: Extract<ScreenId, 'onlineChoice' | 'roomCreate' | 'roomJoin' | 'roomLobby'>;
  onNavigate: (s: ScreenId) => void;
  onBackHome: () => void;
}

export function OnlineScreens({ screen, onNavigate, onBackHome }: OnlineScreensProps) {
  const snap = useSyncExternalStore(onlineManager.subscribe, onlineManager.getSnapshot);

  const [roomName, setRoomName] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const [directName, setDirectName] = useState('');
  const [joinTarget, setJoinTarget] = useState<{ name: string; lock: boolean } | null>(null);
  const [joinPass, setJoinPass] = useState('');
  const [copied, setCopied] = useState(false);

  const mapThumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const m of MAP_LIST) out[m.id] = getMapPng(m.id);
    return out;
  }, []);

  const miniThumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const m of MINIGAME_LIST) out[m.id] = getMinigamePng(m.id);
    return out;
  }, []);

  const weaponThumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const w of WEAPON_LIST) out[w.id] = getWeaponPng(w.id);
    return out;
  }, []);

  useEffect(() => {
    if (screen !== 'roomJoin') return;
    onlineManager.refreshRooms();
    const id = setInterval(() => onlineManager.refreshRooms(), 5000);
    return () => clearInterval(id);
  }, [screen]);

  const updateCfg = (patch: Partial<LobbyConfig>) => {
    onlineManager.updateConfig(patch);
  };

  const copyRoomName = () => {
    if (!snap.roomName) return;
    try {
      navigator.clipboard?.writeText(snap.roomName);
      setCopied(true);
      PartyAudio.play('buy');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  if (screen === 'onlineChoice') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b] overflow-hidden">
        <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onBackHome();
            }}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <span className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
            ONLAYN REJİM
          </span>
          <div className="w-16" />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 sm:gap-5 p-3 sm:p-6">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('roomCreate');
            }}
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white text-left p-4 sm:p-8 flex flex-col justify-end transition active:scale-[0.99]"
          >
            <img
              src="/src/assets/images/icon_online_globe_1794826058975.jpg"
              alt="Otaq Yarat"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white text-zinc-950 flex items-center justify-center mb-0.5">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-none">
                OTAQ YARAT
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2">
                Host ol, 4 oyunçuya qədər otaq aç, xəritə və silahları özün seç.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('roomJoin');
            }}
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white text-left p-4 sm:p-8 flex flex-col justify-end transition active:scale-[0.99]"
          >
            <img
              src="/src/assets/images/icon_online_globe_1794826058975.jpg"
              alt="Otağa Qoşul"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-28 grayscale group-hover:opacity-48 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-900 border border-white/60 text-white flex items-center justify-center mb-0.5">
                <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-none">
                OTAĞA QOŞUL
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2">
                Aktiv otaqlara bax və ya otaq adını yazaraq birbaşa qoşul.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'roomCreate') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b] overflow-y-auto mono-scroll">
        <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('onlineChoice');
            }}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <span className="font-display text-lg sm:text-xl font-bold text-white">OTAQ YARAT</span>
          <div className="w-16" />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onlineManager.createRoom(roomName, roomPass);
            }}
            className="p-4 sm:p-7 flex flex-col justify-between gap-4 border-b sm:border-b-0 sm:border-r border-zinc-800/90"
          >
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-1.5">
                  Otaq Adı
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Məs: BakiArena"
                  className="w-full h-11 px-4 rounded-xl bg-[#131418] border border-zinc-700 focus:border-white outline-none text-white font-semibold text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-1.5">
                  Şifrə (istəyə bağlı)
                </label>
                <input
                  type="password"
                  maxLength={20}
                  value={roomPass}
                  onChange={(e) => setRoomPass(e.target.value)}
                  placeholder="Boş buraxsanız hamı qoşula bilər"
                  className="w-full h-11 px-4 rounded-xl bg-[#131418] border border-zinc-700 focus:border-white outline-none text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={snap.creating}
              className="h-11 sm:h-12 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-display text-xl sm:text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              <span>{snap.creating ? 'Yaradılır...' : 'Otağı Aç'}</span>
            </button>
          </form>

          <div className="hidden sm:flex relative overflow-hidden bg-[#0c0d10] p-7 flex-col justify-end">
            <img
              src="/src/assets/images/icon_online_globe_1794826058975.jpg"
              alt="Online"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400">
                P2P CANLI OTAQ
              </span>
              <h3 className="font-display text-3xl font-extrabold text-white leading-tight">
                DOSTLARINLA EYNİ ARENADA
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Otaq yaradıldıqdan sonra lobbi açılacaq. Dostların otaq adını yazaraq və ya siyahıdan seçərək 4 nəfərə qədər qoşula bilər.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'roomJoin') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b] overflow-hidden">
        <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('onlineChoice');
            }}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <span className="font-display text-lg sm:text-xl font-bold text-white">AKTİV OTAQLAR</span>
          <button
            type="button"
            onClick={() => onlineManager.refreshRooms()}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${snap.roomsLoading ? 'animate-spin' : ''}`} />
            <span>Yenilə</span>
          </button>
        </div>

        {/* Direct Join Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!directName.trim()) return;
            setJoinPass('');
            setJoinTarget({ name: directName.trim(), lock: false });
          }}
          className="shrink-0 p-2.5 sm:px-5 bg-[#0d0e11] border-b border-zinc-800 flex items-center gap-2"
        >
          <input
            type="text"
            maxLength={20}
            value={directName}
            onChange={(e) => setDirectName(e.target.value)}
            placeholder="Otaq adını yazaraq birbaşa qoşul..."
            className="flex-1 h-9 sm:h-10 px-3.5 rounded-lg bg-[#131418] border border-zinc-700 focus:border-white outline-none text-xs sm:text-sm text-white"
          />
          <button
            type="submit"
            className="h-9 sm:h-10 px-4 rounded-lg bg-white text-zinc-950 text-xs font-bold shrink-0"
          >
            Qoşul
          </button>
        </form>

        {/* Room List */}
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3 sm:p-5">
          {snap.discoveredRooms.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-zinc-500">
              <DoorOpen className="w-10 h-10 text-zinc-600" />
              <div className="text-sm font-semibold text-zinc-300">
                {snap.roomsLoading ? 'Otaqlar axtarılır...' : 'Hazırda görünən açıq otaq yoxdur'}
              </div>
              <div className="text-xs text-zinc-500">
                Yuxarıdan otaq adını yazıb birbaşa qoşula bilərsiniz.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {snap.discoveredRooms.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (r.lock) {
                      setJoinPass('');
                      setJoinTarget({ name: r.name, lock: true });
                    } else {
                      onlineManager.joinRoom(r.name, '');
                    }
                  }}
                  className="rounded-xl bg-[#131418] hover:bg-[#191b22] border border-zinc-800 hover:border-white/70 p-3.5 flex items-center justify-between gap-3 text-left transition"
                >
                  <div className="min-w-0">
                    <div className="font-display text-xl font-bold text-white truncate">{r.name}</div>
                    <div className="text-xs font-mono text-zinc-400">{r.n}/4 Oyunçu</div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                    {r.lock ? <Lock className="w-4 h-4 text-zinc-300" /> : <Unlock className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Password / Join Confirmation Modal */}
        {joinTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = joinTarget.name;
                setJoinTarget(null);
                onlineManager.joinRoom(name, joinPass);
              }}
              className="w-full max-w-sm rounded-2xl bg-[#121317] border border-zinc-700 p-5 flex flex-col gap-4"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Otaq: {joinTarget.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {joinTarget.lock
                    ? 'Bu otaq şifrə ilə qorunur'
                    : 'Şifrə varsa daxil edin, yoxdursa boş buraxın'}
                </p>
              </div>
              <input
                type="password"
                value={joinPass}
                onChange={(e) => setJoinPass(e.target.value)}
                placeholder="Otaq şifrəsi..."
                className="h-11 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-white outline-none text-sm text-white"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setJoinTarget(null)}
                  className="flex-1 h-10 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-bold"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-white text-zinc-950 text-sm font-bold"
                >
                  Qoşul
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ROOM LOBBY (Sleek Visual Monochrome Design — Zero native <select> elements)
  const activeCount = snap.lobbySlots.filter(Boolean).length;
  const readyGuests = snap.lobbyReady.slice(1).filter((r, idx) => snap.lobbySlots[idx + 1] && r).length;
  const mySlot = snap.isHost ? 0 : snap.guestIndex;
  const activeMap = MAP_LIST.find((m) => m.id === snap.cfg.map) || MAP_LIST[0];
  const activeMini = MINIGAME_LIST.find((m) => m.id === snap.cfg.mini) || MINIGAME_LIST[0];

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row bg-[#09090b] overflow-hidden">
      {/* Left: 4 Player Slots */}
      <section className="flex-1 min-h-0 flex flex-col border-b sm:border-b-0 sm:border-r border-zinc-800/90">
        <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onlineManager.cleanup();
              onNavigate('onlineChoice');
            }}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Çıx</span>
          </button>

          <button
            type="button"
            onClick={copyRoomName}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center gap-2 transition active:scale-95"
            title="Otaq adını kopyala"
          >
            <div className="text-left">
              <div className="font-display text-base sm:text-lg font-extrabold text-white leading-none">
                {snap.roomName}
              </div>
              <div className="text-[10px] font-mono text-zinc-400">{activeCount}/4 Oyunçu</div>
            </div>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-white shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
          </button>

          <div className="w-12 hidden sm:block" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3 sm:p-4 grid grid-cols-2 gap-2.5 sm:gap-3 content-start">
          {[0, 1, 2, 3].map((i) => {
            const name = snap.lobbySlots[i];
            const filled = !!name;
            const col = PLAYER_COLORS[i] || '#3b82f6';
            const isReady = i === 0 || !!snap.lobbyReady[i];
            const isMe = i === mySlot;

            return (
              <div
                key={i}
                className={`rounded-2xl border p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 transition ${
                  filled
                    ? 'bg-gradient-to-b from-[#16171d] to-[#111216] border-zinc-700 shadow-lg'
                    : 'bg-[#0b0c0f] border-zinc-800/60 opacity-55'
                }`}
              >
                <div
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex items-center justify-center bg-zinc-950 shadow-inner"
                  style={{
                    borderColor: filled ? col : '#3f3f46',
                    boxShadow: filled ? `0 0 18px ${col}33` : undefined,
                  }}
                >
                  {filled ? (
                    <User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: col }} />
                  ) : (
                    <span className="font-mono text-sm text-zinc-600">P{i + 1}</span>
                  )}
                </div>

                <div className="min-w-0 w-full">
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    {filled ? `${name}${isMe ? ' (Siz)' : ''}` : 'Gözlənilir...'}
                  </div>
                </div>

                {filled ? (
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border ${
                      i === 0
                        ? 'bg-zinc-900 border-zinc-600 text-white'
                        : isReady
                          ? 'bg-white text-zinc-950 border-white'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {i === 0 ? (
                      <>
                        <Crown className="w-3 h-3" />
                        <span>HOST</span>
                      </>
                    ) : isReady ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>HAZIR</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>GÖZLƏNİR</span>
                      </>
                    )}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-600">Boş yer</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: Visual Monochrome Host Config or Guest Overview */}
      <aside className="w-full sm:w-[300px] md:w-[350px] lg:w-[410px] shrink-0 bg-[#0d0e11] flex flex-col min-h-0 max-h-[48vh] sm:max-h-none">
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3 sm:p-4 flex flex-col gap-3">
          {snap.isHost ? (
            <>
              {/* Mode Toggle */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-1.5">
                  Oyun Rejimi
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      PartyAudio.play('hit');
                      updateCfg({ mode: 'vs' });
                    }}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      snap.cfg.mode === 'vs'
                        ? 'bg-white text-zinc-950 border-white'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>VS Döyüş</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      PartyAudio.play('hit');
                      updateCfg({ mode: 'minigames' });
                    }}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      snap.cfg.mode === 'minigames'
                        ? 'bg-white text-zinc-950 border-white'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Mini Oyun</span>
                  </button>
                </div>
              </div>

              {/* Rounds & Weapon Mode Pills */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-1.5">
                    Raund
                  </span>
                  <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
                    {[1, 3, 5, 7].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          PartyAudio.play('hit');
                          updateCfg({ rounds: r });
                        }}
                        className={`h-7 w-7 rounded-md text-xs font-mono font-bold transition ${
                          snap.cfg.rounds === r ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {snap.cfg.mode === 'vs' && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-1.5">
                      Silah Rejimi
                    </span>
                    <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          PartyAudio.play('hit');
                          updateCfg({ loot: false });
                        }}
                        className={`h-7 px-2 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                          !snap.cfg.loot ? 'bg-white text-zinc-950' : 'text-zinc-400'
                        }`}
                      >
                        <Swords className="w-3 h-3" />
                        <span>Silah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          PartyAudio.play('hit');
                          updateCfg({ loot: true });
                        }}
                        className={`h-7 px-2 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                          snap.cfg.loot ? 'bg-white text-zinc-950' : 'text-zinc-400'
                        }`}
                      >
                        <Box className="w-3 h-3" />
                        <span>Loot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual PNG Picker Strip for Map or Minigame */}
              {snap.cfg.mode === 'vs' ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                        Xəritə
                      </span>
                      <span className="text-[10px] font-semibold text-white">{activeMap.name}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto mono-scroll pb-1">
                      {MAP_LIST.map((m) => {
                        const sel = snap.cfg.map === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              PartyAudio.play('hit');
                              updateCfg({ map: m.id });
                            }}
                            className={`shrink-0 w-[106px] rounded-xl overflow-hidden border text-left transition active:scale-95 bg-[#131418] ${
                              sel ? 'border-white ring-1 ring-white/80' : 'border-zinc-800 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={mapThumbs[m.id]}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-13 object-cover"
                            />
                            <div className="px-2 py-1 text-[10px] font-bold text-white truncate">
                              {m.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-player Visual PNG Weapon Strips */}
                  {!snap.cfg.loot && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                        Oyunçu Silahları
                      </span>
                      {Array.from({ length: Math.max(2, activeCount) }).map((_, idx) => {
                        const curWep = snap.cfg.weapons[idx] || 'sword';
                        const pCol = PLAYER_COLORS[idx] || '#3b82f6';
                        return (
                          <div key={idx} className="rounded-xl bg-[#131418] border border-zinc-800 p-2">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-4 h-4 rounded text-[9px] font-mono font-bold text-white flex items-center justify-center"
                                  style={{ backgroundColor: pCol }}
                                >
                                  {idx + 1}
                                </span>
                                <span className="text-[11px] font-bold text-white">
                                  {snap.lobbySlots[idx] || `P${idx + 1}`}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {WEAPON_LIST.find((w) => w.id === curWep)?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto mono-scroll pb-0.5">
                              {WEAPON_LIST.map((w) => {
                                const sel = curWep === w.id;
                                return (
                                  <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => {
                                      PartyAudio.play('hit');
                                      const next = [...snap.cfg.weapons];
                                      next[idx] = w.id as WeaponChoice;
                                      updateCfg({ weapons: next });
                                    }}
                                    className={`shrink-0 w-12 rounded-lg p-1 border flex flex-col items-center gap-0.5 transition ${
                                      sel
                                        ? 'bg-white text-zinc-950 border-white'
                                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                                    }`}
                                  >
                                    <img
                                      src={weaponThumbs[w.id]}
                                      alt={w.name}
                                      referrerPolicy="no-referrer"
                                      className={`w-6 h-6 object-contain ${sel ? 'brightness-90 contrast-125' : ''}`}
                                    />
                                    <span className="text-[8px] font-bold truncate w-full text-center">
                                      {w.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                      Mini Oyun
                    </span>
                    <span className="text-[10px] font-semibold text-white">{activeMini.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {MINIGAME_LIST.map((m) => {
                      const sel = snap.cfg.mini === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            PartyAudio.play('hit');
                            updateCfg({ mini: m.id });
                          }}
                          className={`rounded-xl overflow-hidden border text-left transition active:scale-95 bg-[#131418] ${
                            sel ? 'border-white ring-1 ring-white/80' : 'border-zinc-800 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={miniThumbs[m.id]}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-14 object-cover"
                          />
                          <div className="px-2 py-1 text-[11px] font-bold text-white truncate">
                            {m.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-[#131418] border border-zinc-800 overflow-hidden flex flex-col">
              <img
                src={snap.cfg.mode === 'vs' ? mapThumbs[activeMap.id] : miniThumbs[activeMini.id]}
                alt="Seçilmiş Arena"
                referrerPolicy="no-referrer"
                className="w-full h-28 object-cover border-b border-zinc-800"
              />
              <div className="p-3.5 flex flex-col gap-1.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                  Host Ayarları · {snap.cfg.rounds} Raund
                </div>
                <div className="font-display text-2xl font-extrabold text-white leading-none">
                  {snap.cfg.mode === 'vs' ? activeMap.name : activeMini.name}
                </div>
                <p className="text-xs text-zinc-400">
                  {snap.cfg.mode === 'vs'
                    ? `${activeMap.desc} · ${snap.cfg.loot ? 'Loot Drop' : 'Seçilmiş Silahlar'}`
                    : activeMini.desc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Start / Ready CTA */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-zinc-800 bg-[#09090b] apk-safe-bottom">
          {snap.isHost ? (
            <button
              type="button"
              disabled={activeCount < 2}
              onClick={() => onlineManager.startLobbyMatch()}
              className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-display text-xl sm:text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 transition"
            >
              <Play className="w-5 h-5 fill-zinc-950" />
              <span>
                {activeCount < 2
                  ? 'Oyunçu Gözlənilir...'
                  : `OYUNU BAŞLAT (${readyGuests + 1}/${activeCount})`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onlineManager.toggleGuestReady()}
              className={`w-full h-11 sm:h-12 rounded-xl font-display text-xl sm:text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 transition ${
                snap.guestReady
                  ? 'bg-white text-zinc-950'
                  : 'bg-zinc-900 border border-white/70 text-white hover:bg-zinc-800'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{snap.guestReady ? 'HAZIRAM (Ləğv et)' : 'HAZIR OL'}</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
