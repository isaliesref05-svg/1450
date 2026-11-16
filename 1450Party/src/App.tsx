import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Gamepad2,
  Maximize2,
  Music,
  ShieldCheck,
  Swords,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { ActiveMatchConfig, GameScreen } from './components/GameScreen';
import { HomeScreen } from './components/HomeScreen';
import { MinigamesScreen } from './components/MinigamesScreen';
import { OnlineScreens } from './components/OnlineScreens';
import { ShopScreen } from './components/ShopScreen';
import { TopBar } from './components/TopBar';
import { VsSetupScreen } from './components/VsSetupScreen';
import { PartyAudio } from './game/audio';
import { PARTY_SAVE_KEY, PartyEconomy } from './game/economy';
import { fightEngine } from './game/fightEngine';
import { minigameEngine } from './game/minigameEngine';
import { LobbyConfig, onlineManager } from './game/online';
import {
  bindKeyboardListeners,
  MapId,
  MinigameId,
  ScreenId,
  WeaponChoice,
} from './game/types';

interface ToastItem {
  id: number;
  msg: string;
  tone: 'info' | 'error' | 'success';
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [playerCount, setPlayerCount] = useState(2);
  const [selectedMap, setSelectedMap] = useState<MapId>('snow_peaks');
  const [selectedMini, setSelectedMini] = useState<MinigameId>('sumo');
  const [rounds, setRounds] = useState(3);
  const [lootMode, setLootMode] = useState(false);
  const [weapons, setWeapons] = useState<WeaponChoice[]>(['sword', 'sword', 'sword', 'sword']);
  const [activeMatch, setActiveMatch] = useState<ActiveMatchConfig | null>(null);
  const [rematchSignal, setRematchSignal] = useState(0);

  const [, setEcoTick] = useState(0);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(() => PartyEconomy.name());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((msg: string, tone: 'info' | 'error' | 'success' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, msg, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const unsub = PartyEconomy.subscribe(() => setEcoTick((t) => t + 1));
    PartyAudio.init();
    bindKeyboardListeners();
    onlineManager.claimRegistry();
    const regInterval = setInterval(() => onlineManager.claimRegistry(), 10000);
    return () => {
      unsub();
      clearInterval(regInterval);
    };
  }, []);

  useEffect(() => {
    PartyAudio.setInGame(screen === 'game');
  }, [screen]);

  useEffect(() => {
    onlineManager.setHandlers(
      {
        onToast: pushToast,
        onLobbyJoined: () => setScreen('roomLobby'),
        onStartGame: (cfg: LobbyConfig, count: number) => {
          setActiveMatch({
            mode: cfg.mode,
            map: cfg.map,
            mini: cfg.mini,
            playerCount: count,
            rounds: cfg.rounds,
            weapons: cfg.weapons,
            loot: cfg.loot,
            onlineMode: true,
            netRole: onlineManager.isHost() ? 'host' : 'guest',
          });
          setScreen('game');
        },
        onFightState: (s) => {
          if (fightEngine.gameState === 'matchEnd' && s.gs === 'playing') {
            setRematchSignal((n) => n + 1);
          }
          fightEngine.apply(s);
        },
        onMiniState: (s) => {
          if (minigameEngine.gameState === 'matchEnd' && s.gs === 'playing') {
            setRematchSignal((n) => n + 1);
          }
          minigameEngine.apply(s);
        },
        onRematch: () => {
          if (fightEngine.on) fightEngine.restart();
          else if (minigameEngine.on) minigameEngine.restart();
        },
        onDisconnectToHome: () => {
          fightEngine.stop();
          minigameEngine.stop();
          setActiveMatch(null);
          setScreen('home');
        },
      },
      () => screen === 'game'
    );
  }, [pushToast, screen]);

  const playerColors = [0, 1, 2, 3].map((i) => PartyEconomy.color(i));
  const coins = PartyEconomy.coins();
  const playerName = PartyEconomy.name();
  const muted = PartyEconomy.isMuted();

  const handlePickColor = (idx: number, col: string) => {
    if (PartyEconomy.swapOrSetColor(idx, col)) {
      PartyAudio.play('buy');
    }
  };

  const handleToggleSound = () => {
    PartyAudio.toggleSfx();
  };

  const startLocalVs = () => {
    onlineManager.cleanup();
    setActiveMatch({
      mode: 'vs',
      map: selectedMap,
      mini: selectedMini,
      playerCount,
      rounds,
      weapons: [...weapons],
      loot: lootMode,
      onlineMode: false,
      netRole: null,
    });
    setScreen('game');
  };

  const startLocalMinigame = (miniId: MinigameId) => {
    onlineManager.cleanup();
    setSelectedMini(miniId);
    setActiveMatch({
      mode: 'minigames',
      map: selectedMap,
      mini: miniId,
      playerCount,
      rounds,
      weapons: [...weapons],
      loot: false,
      onlineMode: false,
      netRole: null,
    });
    setScreen('game');
  };

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (PartyEconomy.setName(nameDraft)) {
      PartyAudio.play('buy');
      setNameModalOpen(false);
      pushToast(`Oyunçu adı yeniləndi: ${PartyEconomy.name()}`, 'success');
    } else {
      PartyAudio.play('error');
      pushToast('Ad boş ola bilməz', 'error');
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-[#09090b] text-[#f4f4f5]">
      {screen !== 'game' && (
        <TopBar
          coins={coins}
          playerName={playerName}
          muted={muted}
          onOpenName={() => {
            setNameDraft(PartyEconomy.name());
            setNameModalOpen(true);
          }}
          onOpenShop={() => setScreen('shop')}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => {
            setConfirmReset(false);
            setSettingsOpen(true);
          }}
          onGoHome={() => {
            if (onlineManager.isOnline()) onlineManager.cleanup();
            setScreen('home');
          }}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          onStartLocalVs={() => setScreen('vsSetup')}
          onStartLocalMinigames={() => setScreen('minigames')}
          onOpenOnline={() => setScreen('onlineChoice')}
          onOpenShop={() => setScreen('shop')}
        />
      )}

      {screen === 'vsSetup' && (
        <VsSetupScreen
          playerCount={playerCount}
          selectedMap={selectedMap}
          setSelectedMap={setSelectedMap}
          rounds={rounds}
          setRounds={setRounds}
          lootMode={lootMode}
          setLootMode={setLootMode}
          weapons={weapons}
          setWeaponForPlayer={(idx, w) => {
            setWeapons((prev) => {
              const next = [...prev];
              next[idx] = w;
              return next;
            });
          }}
          playerColors={playerColors}
          onStartMatch={startLocalVs}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'minigames' && (
        <MinigamesScreen
          playerCount={playerCount}
          selectedMini={selectedMini}
          setSelectedMini={setSelectedMini}
          rounds={rounds}
          setRounds={setRounds}
          onStartMinigame={startLocalMinigame}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'shop' && (
        <ShopScreen
          coins={coins}
          playerColors={playerColors}
          onPickColor={handlePickColor}
          onToast={pushToast}
          onBack={() => setScreen('home')}
        />
      )}

      {(screen === 'onlineChoice' ||
        screen === 'roomCreate' ||
        screen === 'roomJoin' ||
        screen === 'roomLobby') && (
        <OnlineScreens
          screen={screen}
          onNavigate={setScreen}
          onBackHome={() => {
            onlineManager.cleanup();
            setScreen('home');
          }}
        />
      )}

      {screen === 'game' && activeMatch && (
        <GameScreen
          config={activeMatch}
          playerColors={playerColors}
          muted={muted}
          rematchSignal={rematchSignal}
          onToggleSound={handleToggleSound}
          onExitToMenu={() => {
            setActiveMatch(null);
            setScreen('home');
          }}
        />
      )}

      {/* Name Modal */}
      {nameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={saveName}
            className="w-full max-w-sm max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-[#111216] border border-zinc-700 p-4 sm:p-5 flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white" />
                <h3 className="font-display text-2xl font-extrabold text-white">OYUNÇU ADI</h3>
              </div>
              <button
                type="button"
                onClick={() => setNameModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              maxLength={14}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Adınızı daxil edin..."
              className="h-11 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-white outline-none text-white text-sm font-semibold"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNameModalOpen(false)}
                className="flex-1 h-10 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-bold"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-white text-zinc-950 text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Yadda saxla</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings Modal (Responsive & Scrollable for Mobile/APK) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-lg max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] rounded-2xl bg-[#111216] border border-zinc-700 flex flex-col overflow-hidden shadow-2xl">
            {/* Pinned Header */}
            <div className="shrink-0 px-4 py-2.5 sm:py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0d0e11]">
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                PARAMETRLƏR
              </h3>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Bağla"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Settings Body */}
            <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* SFX Volume */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                  <span className="flex items-center gap-2">
                    {PartyEconomy.isMuted() ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4" />}
                    <span>Effekt Səsləri (SFX)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[11px]"
                  >
                    {PartyEconomy.isMuted() ? 'Bağlı' : 'Açıq'}
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={PartyEconomy.volume()}
                  onChange={(e) => PartyAudio.setSfxVolume(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              {/* Menu Music */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>Menyu Musiqisi</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => PartyAudio.toggleMusic()}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[11px]"
                  >
                    {PartyEconomy.isMusicMuted() ? 'Bağlı' : 'Açıq'}
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={PartyEconomy.musicVolume()}
                  onChange={(e) => PartyAudio.setMusicVolume(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              {/* Battle Music */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                  <span className="flex items-center gap-2">
                    <Swords className="w-4 h-4" />
                    <span>Döyüş Musiqisi</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => PartyAudio.toggleBattleMusic()}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[11px]"
                  >
                    {PartyEconomy.isBattleMuted() ? 'Bağlı' : 'Açıq'}
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={PartyEconomy.battleVolume()}
                  onChange={(e) => PartyAudio.setBattleVolume(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              {/* Joystick Size Selector */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Gamepad2 className="w-4 h-4 text-zinc-300" />
                  <span>Joystick Ölçüsü</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'small', label: 'Kiçik' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'large', label: 'Böyük' },
                  ] as const).map((opt) => {
                    const active = PartyEconomy.joystickSize() === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          PartyEconomy.setJoystickSize(opt.id);
                          PartyAudio.play('hit');
                        }}
                        className={`h-7 rounded-lg border text-[11px] font-bold transition ${
                          active
                            ? 'bg-white text-zinc-950 border-white'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Screen Shake Toggle */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Zap className="w-4 h-4 text-zinc-300" />
                  <span>Ekran Sarsıntısı</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    PartyEconomy.setShakeEnabled(!PartyEconomy.shakeEnabled());
                    PartyAudio.play('hit');
                  }}
                  className={`px-3 h-7 rounded-lg border text-[11px] font-bold transition ${
                    PartyEconomy.shakeEnabled()
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {PartyEconomy.shakeEnabled() ? 'Açıq' : 'Bağlı'}
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Maximize2 className="w-4 h-4 text-zinc-300" />
                  <span>Tam Ekran Rejimi</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen?.().catch(() => {});
                      } else {
                        document.exitFullscreen?.().catch(() => {});
                      }
                    } catch {
                      // ignore unsupported fullscreen in some webviews
                    }
                  }}
                  className="px-3 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-bold transition"
                >
                  Dəyiş
                </button>
              </div>

              {/* Creator & Game Info Card */}
              <div className="sm:col-span-2 rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
                      Yaradıcı
                    </div>
                    <div className="text-sm font-extrabold text-white tracking-wide">
                      Esref Isayev
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                    Matçlar: <strong className="text-white">{PartyEconomy.matches()}</strong>
                  </span>
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    1450 Party
                  </span>
                </div>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="shrink-0 px-4 py-2.5 border-t border-zinc-800 bg-[#0d0e11] flex items-center justify-between gap-2">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Profili Sıfırla</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(PARTY_SAVE_KEY);
                      window.location.reload();
                    }}
                    className="h-9 px-3 rounded-lg bg-white text-zinc-950 text-xs font-bold"
                  >
                    Təsdiqlə
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold"
                  >
                    Ləğv et
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="h-9 px-5 rounded-lg bg-white text-zinc-950 text-xs font-bold"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-xl px-3.5 py-2.5 border text-xs font-semibold shadow-2xl flex items-center justify-between gap-2 ${
                t.tone === 'error'
                  ? 'bg-zinc-950 border-red-500/70 text-red-200'
                  : t.tone === 'success'
                    ? 'bg-zinc-950 border-white/70 text-white'
                    : 'bg-zinc-950 border-zinc-700 text-zinc-200'
              }`}
            >
              <span>{t.msg}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-zinc-500 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
