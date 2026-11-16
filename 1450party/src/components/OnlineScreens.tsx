import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
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
import { MAP_LIST, MapId, MINIGAME_LIST, MinigameId, PLAYER_COLORS, ScreenId, WEAPON_LIST, WeaponChoice } from '../game/types';

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

  useEffect(() => {
    if (screen !== 'roomJoin') return;
    onlineManager.refreshRooms();
    const id = setInterval(() => onlineManager.refreshRooms(), 5000);
    return () => clearInterval(id);
  }, [screen]);

  const updateCfg = (patch: Partial<LobbyConfig>) => {
    onlineManager.updateConfig(patch);
  };

  if (screen === 'onlineChoice') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b] overflow-hidden">
        <div className="shrink-0 px-4 py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onBackHome();
            }}
            className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <span className="font-display text-xl font-bold text-white tracking-wide">ONLAYN REJİM</span>
          <div className="w-16" />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('roomCreate');
            }}
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white text-left p-6 sm:p-8 flex flex-col justify-end transition active:scale-[0.99]"
          >
            <img
              src="/src/assets/images/icon_online_globe_1794826058975.jpg"
              alt="Otaq Yarat"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="w-11 h-11 rounded-xl bg-white text-zinc-950 flex items-center justify-center mb-1">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">OTAQ YARAT</h2>
              <p className="text-sm text-zinc-300">
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
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white text-left p-6 sm:p-8 flex flex-col justify-end transition active:scale-[0.99]"
          >
            <img
              src="/src/assets/images/icon_online_globe_1794826058975.jpg"
              alt="Otağa Qoşul"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/60 text-white flex items-center justify-center mb-1">
                <DoorOpen className="w-6 h-6" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">OTAĞA QOŞUL</h2>
              <p className="text-sm text-zinc-300">
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
      <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b]">
        <div className="shrink-0 px-4 py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('onlineChoice');
            }}
            className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <span className="font-display text-xl font-bold text-white">OTAQ YARAT</span>
          <div className="w-16" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onlineManager.createRoom(roomName, roomPass);
          }}
          className="flex-1 min-h-0 p-5 sm:p-8 flex flex-col justify-between gap-6 max-w-xl w-full"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                Otaq Adı
              </label>
              <input
                type="text"
                maxLength={20}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Məs: BakiArena"
                className="w-full h-12 px-4 rounded-xl bg-[#131418] border border-zinc-700 focus:border-white outline-none text-white font-semibold"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                Şifrə (istəyə bağlı)
              </label>
              <input
                type="password"
                maxLength={20}
                value={roomPass}
                onChange={(e) => setRoomPass(e.target.value)}
                placeholder="Boş buraxsanız hamı qoşula bilər"
                className="w-full h-12 px-4 rounded-xl bg-[#131418] border border-zinc-700 focus:border-white outline-none text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={snap.creating}
            className="h-13 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-display text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>{snap.creating ? 'Yaradılır...' : 'Otağı Aç'}</span>
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'roomJoin') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b] overflow-hidden">
        <div className="shrink-0 px-4 py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onNavigate('onlineChoice');
            }}
            className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <span className="font-display text-xl font-bold text-white">AKTİV OTAQLAR</span>
          <button
            type="button"
            onClick={() => onlineManager.refreshRooms()}
            className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
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
          className="shrink-0 p-3.5 sm:px-5 bg-[#0d0e11] border-b border-zinc-800 flex items-center gap-2"
        >
          <input
            type="text"
            maxLength={20}
            value={directName}
            onChange={(e) => setDirectName(e.target.value)}
            placeholder="Otaq adını yazaraq qoşul..."
            className="flex-1 h-10 px-3.5 rounded-lg bg-[#131418] border border-zinc-700 focus:border-white outline-none text-sm text-white"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-white text-zinc-950 text-xs font-bold shrink-0"
          >
            Qoşul
          </button>
        </form>

        {/* Room List */}
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3.5 sm:p-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className="rounded-xl bg-[#131418] hover:bg-[#191b22] border border-zinc-800 hover:border-white/70 p-4 flex items-center justify-between gap-3 text-left transition"
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
                  {joinTarget.lock ? 'Bu otaq şifrə ilə qorunur' : 'Şifrə varsa daxil edin, yoxdursa boş buraxın'}
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

  // ROOM LOBBY
  const activeCount = snap.lobbySlots.filter(Boolean).length;
  const readyGuests = snap.lobbyReady.slice(1).filter((r, idx) => snap.lobbySlots[idx + 1] && r).length;
  const mySlot = snap.isHost ? 0 : snap.guestIndex;

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row bg-[#09090b] overflow-hidden">
      {/* Left: 4 Player Slots */}
      <section className="flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800/90">
        <div className="shrink-0 px-4 py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onlineManager.cleanup();
              onNavigate('onlineChoice');
            }}
            className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Çıx</span>
          </button>
          <div className="text-center">
            <div className="font-display text-xl font-extrabold text-white leading-none">
              Otaq: {snap.roomName}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">{activeCount}/4 Oyunçu</div>
          </div>
          <div className="w-16" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-4 grid grid-cols-2 gap-3 content-start">
          {[0, 1, 2, 3].map((i) => {
            const name = snap.lobbySlots[i];
            const filled = !!name;
            const col = PLAYER_COLORS[i] || '#3b82f6';
            const isReady = i === 0 || !!snap.lobbyReady[i];
            const isMe = i === mySlot;

            return (
              <div
                key={i}
                className={`rounded-2xl border p-4 flex flex-col items-center text-center gap-2.5 ${
                  filled ? 'bg-[#131418] border-zinc-700' : 'bg-[#0c0d10] border-zinc-800/70 opacity-60'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center bg-zinc-950"
                  style={{ borderColor: filled ? col : '#3f3f46' }}
                >
                  {filled ? (
                    <User className="w-5 h-5" style={{ color: col }} />
                  ) : (
                    <span className="font-mono text-sm text-zinc-600">?</span>
                  )}
                </div>

                <div className="min-w-0 w-full">
                  <div className="text-sm font-bold text-white truncate">
                    {filled ? `${name}${isMe ? ' (Siz)' : ''}` : 'Gözlənilir...'}
                  </div>
                </div>

                {filled && (
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
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: Host Config or Guest Ready */}
      <aside className="w-full lg:w-[390px] shrink-0 bg-[#0d0e11] flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-4 flex flex-col gap-3.5">
          {snap.isHost ? (
            <>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                  Oyun Rejimi
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateCfg({ mode: 'vs' })}
                    className={`h-10 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      snap.cfg.mode === 'vs'
                        ? 'bg-white text-zinc-950 border-white'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <Swords className="w-4 h-4" />
                    <span>VS Döyüş</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCfg({ mode: 'minigames' })}
                    className={`h-10 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      snap.cfg.mode === 'minigames'
                        ? 'bg-white text-zinc-950 border-white'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Mini Oyun</span>
                  </button>
                </div>
              </div>

              {snap.cfg.mode === 'vs' ? (
                <>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                      Xəritə
                    </span>
                    <select
                      value={snap.cfg.map}
                      onChange={(e) => updateCfg({ map: e.target.value as MapId })}
                      className="w-full h-10 px-3 rounded-lg bg-[#131418] border border-zinc-700 text-sm text-white"
                    >
                      {MAP_LIST.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.mechanic})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                        Raund
                      </span>
                      <select
                        value={snap.cfg.rounds}
                        onChange={(e) => updateCfg({ rounds: Number(e.target.value) || 3 })}
                        className="w-full h-10 px-3 rounded-lg bg-[#131418] border border-zinc-700 text-sm text-white"
                      >
                        {[1, 3, 5, 7].map((r) => (
                          <option key={r} value={r}>
                            {r} Raund
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                        Silah Rejimi
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCfg({ loot: !snap.cfg.loot })}
                        className="w-full h-10 rounded-lg bg-[#131418] border border-zinc-700 text-xs font-bold text-white"
                      >
                        {snap.cfg.loot ? 'Loot Drop' : 'Seçilmiş Silah'}
                      </button>
                    </div>
                  </div>

                  {!snap.cfg.loot && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                        Silahlar
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].slice(0, Math.max(2, activeCount)).map((idx) => (
                          <select
                            key={idx}
                            value={snap.cfg.weapons[idx] || 'sword'}
                            onChange={(e) => {
                              const next = [...snap.cfg.weapons];
                              next[idx] = e.target.value as WeaponChoice;
                              updateCfg({ weapons: next });
                            }}
                            className="h-9 px-2.5 rounded-lg bg-[#131418] border border-zinc-700 text-xs text-white"
                          >
                            {WEAPON_LIST.map((w) => (
                              <option key={w.id} value={w.id}>
                                P{idx + 1}: {w.name}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                      Mini Oyun
                    </span>
                    <select
                      value={snap.cfg.mini}
                      onChange={(e) => updateCfg({ mini: e.target.value as MinigameId })}
                      className="w-full h-10 px-3 rounded-lg bg-[#131418] border border-zinc-700 text-sm text-white"
                    >
                      {MINIGAME_LIST.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2">
                      Raund
                    </span>
                    <select
                      value={snap.cfg.rounds}
                      onChange={(e) => updateCfg({ rounds: Number(e.target.value) || 3 })}
                      className="w-full h-10 px-3 rounded-lg bg-[#131418] border border-zinc-700 text-sm text-white"
                    >
                      {[1, 3, 5, 7].map((r) => (
                        <option key={r} value={r}>
                          {r} Raund
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-[#131418] border border-zinc-800 p-4 flex flex-col gap-2">
              <div className="text-sm font-bold text-white">Host Ayarları</div>
              <div className="text-xs text-zinc-400">
                Rejim: <span className="text-white font-semibold">{snap.cfg.mode === 'vs' ? 'VS Döyüş' : 'Mini Oyun'}</span>
              </div>
              <div className="text-xs text-zinc-400">
                {snap.cfg.mode === 'vs'
                  ? `Xəritə: ${MAP_LIST.find((m) => m.id === snap.cfg.map)?.name || snap.cfg.map}`
                  : `Oyun: ${MINIGAME_LIST.find((m) => m.id === snap.cfg.mini)?.name || snap.cfg.mini}`}
              </div>
              <div className="text-xs text-zinc-400">Raund: {snap.cfg.rounds}</div>
            </div>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-zinc-800 bg-[#09090b]">
          {snap.isHost ? (
            <button
              type="button"
              disabled={activeCount < 2}
              onClick={() => onlineManager.startLobbyMatch()}
              className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-display text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 transition"
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
              className={`w-full h-12 rounded-xl font-display text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 transition ${
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
