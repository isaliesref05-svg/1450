import { useCallback, useEffect, useRef, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  AlertTriangle,
  Check,
  Cloud,
  Gamepad2,
  LogOut,
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
import { GoogleMark, TopBar } from './components/TopBar';
import { VsSetupScreen } from './components/VsSetupScreen';
import {
  checkUsernameAvailable,
  claimUniqueUsername,
  createUserProfile,
  ensureUniqueCloudUsername,
  fetchUserProfile,
  isReservedPlayerName,
  saveUserProfile,
  signInWithGoogleAccount,
  signOutGoogleAccount,
  subscribeAuthState,
} from './firebase';
import { PartyAudio } from './game/audio';
import { PARTY_SAVE_KEY, PartyEconomy, ProfileData } from './game/economy';

const PARTY_ENTRY_KEY = 'stickparty.entryChosen.v1';
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
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [entryChosen, setEntryChosen] = useState<boolean>(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(PARTY_ENTRY_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const syncTimerRef = useRef<number | null>(null);
  const interactiveSignInRef = useRef(false);

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
    let active = true;
    const clearSyncTimer = () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };

    const scheduleCloudSave = (user: FirebaseUser, p: ProfileData) => {
      clearSyncTimer();
      setCloudSynced(false);
      syncTimerRef.current = window.setTimeout(async () => {
        try {
          await saveUserProfile(user, p);
          if (active) setCloudSynced(true);
        } catch (err) {
          console.error('Cloud save failed:', err);
        }
      }, 350);
    };

    const unsubAuth = subscribeAuthState(async (user) => {
      if (!active) return;
      clearSyncTimer();
      PartyEconomy.setSyncHandler(null);
      setAuthUser(user);
      setAuthReady(true);

      if (!user) {
        setCloudSynced(false);
        return;
      }

      try {
        try {
          localStorage.setItem(PARTY_ENTRY_KEY, '1');
        } catch {
          // ignore
        }
        setEntryChosen(true);

        const cloudDoc = await fetchUserProfile(user.uid);
        if (!active) return;

        if (cloudDoc) {
          let resolvedName = cloudDoc.name;
          try {
            resolvedName = await ensureUniqueCloudUsername(
              user,
              cloudDoc.name || user.displayName || 'Oyuncu'
            );
          } catch (claimErr) {
            console.error('Username claim sync:', claimErr);
          }
          if (!active) return;
          const mergedCloud = resolvedName !== cloudDoc.name ? { ...cloudDoc, name: resolvedName } : cloudDoc;
          PartyEconomy.importProfile(mergedCloud, false);
          if (resolvedName !== cloudDoc.name) {
            await saveUserProfile(user, PartyEconomy.exportProfile());
          }
        } else {
          const initial = PartyEconomy.exportProfile();
          let resolvedName = initial.name || user.displayName?.trim().slice(0, 14) || 'Oyuncu';
          try {
            resolvedName = await ensureUniqueCloudUsername(user, resolvedName);
          } catch (claimErr) {
            console.error('Initial username claim:', claimErr);
          }
          if (!active) return;
          initial.name = resolvedName;
          await createUserProfile(user, initial);
          if (!active) return;
          PartyEconomy.importProfile(initial, false);
        }

        if (!active) return;
        setCloudSynced(true);
        PartyEconomy.setSyncHandler((nextProfile) => {
          scheduleCloudSave(user, nextProfile);
        });

        if (interactiveSignInRef.current) {
          interactiveSignInRef.current = false;
          pushToast(`Xoş gəldin, ${user.displayName || user.email || 'Oyunçu'}!`, 'success');
        }
      } catch (err) {
        interactiveSignInRef.current = false;
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('Quota exceeded')) {
          pushToast('Firestore gündəlik kvota dolub, lokal yaddaş aktivdir', 'error');
        } else {
          pushToast('Bulud profili yüklənmədi', 'error');
        }
      }
    });

    return () => {
      active = false;
      clearSyncTimer();
      PartyEconomy.setSyncHandler(null);
      unsubAuth();
    };
  }, [pushToast]);

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

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameBusy) return;
    const trimmed = nameDraft.trim().slice(0, 14);
    if (!trimmed) {
      PartyAudio.play('error');
      setNameError('Ad boş ola bilməz');
      pushToast('Ad boş ola bilməz', 'error');
      return;
    }
    if (isReservedPlayerName(trimmed)) {
      PartyAudio.play('error');
      setNameError('P1, P2, P3, P4 və Host adları istifadə edilə bilməz');
      pushToast('Bu ad sistem tərəfindən qorunur', 'error');
      return;
    }

    const currentName = PartyEconomy.name();
    if (trimmed.toLowerCase() === currentName.trim().toLowerCase()) {
      PartyEconomy.setName(trimmed);
      setNameError('');
      setNameModalOpen(false);
      return;
    }

    setNameBusy(true);
    setNameError('');
    try {
      if (authUser) {
        const claimed = await claimUniqueUsername(authUser, trimmed, currentName);
        PartyEconomy.setName(claimed);
      } else {
        const available = await checkUsernameAvailable(trimmed, null);
        if (!available) {
          PartyAudio.play('error');
          setNameError('Bu ad artıq başqa oyunçu tərəfindən istifadə olunur');
          pushToast('Bu ad artıq tutulub!', 'error');
          return;
        }
        PartyEconomy.setName(trimmed);
      }
      PartyAudio.play('buy');
      setNameModalOpen(false);
      pushToast(`Oyunçu adı yeniləndi: ${PartyEconomy.name()}`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'NAME_TAKEN') {
        setNameError('Bu ad artıq başqa oyunçu tərəfindən istifadə olunur');
        pushToast('Bu ad artıq tutulub!', 'error');
      } else {
        setNameError('Ad yoxlanıla bilmədi, yenidən cəhd edin');
        pushToast('Ad yoxlanarkən xəta baş verdi', 'error');
      }
      PartyAudio.play('error');
    } finally {
      setNameBusy(false);
    }
  };

  const handleChooseGuestEntry = () => {
    try {
      localStorage.setItem(PARTY_ENTRY_KEY, '1');
    } catch {
      // ignore
    }
    PartyAudio.play('hit');
    setEntryChosen(true);
  };

  const handleGoogleSignIn = async () => {
    if (authBusy) return;
    setAuthBusy(true);
    interactiveSignInRef.current = true;
    try {
      await signInWithGoogleAccount();
      PartyAudio.play('buy');
    } catch (err) {
      interactiveSignInRef.current = false;
      const code = typeof err === 'object' && err && 'code' in err ? String((err as { code?: unknown }).code) : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        pushToast('Giriş pəncərəsi bağlandı', 'info');
      } else if (code === 'auth/popup-blocked') {
        pushToast('Pop-up bloklandı — brauzer icazəsini açın', 'error');
      } else if (code === 'auth/unauthorized-domain') {
        pushToast('Bu domen Firebase Auth-da icazəli deyil', 'error');
      } else {
        pushToast('Gmail ilə giriş alınmadı', 'error');
      }
      PartyAudio.play('error');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignOut = async () => {
    if (authBusy) return;
    setAuthBusy(true);
    try {
      await signOutGoogleAccount();
      PartyAudio.play('hit');
      pushToast('Gmail hesabından çıxıldı', 'info');
    } catch {
      pushToast('Çıxış zamanı xəta baş verdi', 'error');
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-[#09090b] text-[#f4f4f5]">
      {screen !== 'game' && (
        <TopBar
          coins={coins}
          playerName={playerName}
          muted={muted}
          authUser={
            authUser
              ? {
                  uid: authUser.uid,
                  displayName: authUser.displayName,
                  email: authUser.email,
                  photoURL: authUser.photoURL,
                }
              : null
          }
          authBusy={authBusy}
          onGoogleSignIn={handleGoogleSignIn}
          onOpenName={() => {
            setNameDraft(PartyEconomy.name());
            setNameError('');
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

      {/* First-Time Entry Modal (Gmail vs Guest) */}
      {authReady && !authUser && !entryChosen && (
        <div className="fixed inset-0 z-[55] bg-black/88 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-[#111216] border border-zinc-700 p-5 sm:p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-1">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                1450 PARTY · GİRİŞ SEÇİMİ
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white tracking-wide leading-none">
                XOŞ GƏLDİNİZ
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs">
                Oyun irəliləyişinizi və qarderobunuzu saxlamaq üçün hesab seçin.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={authBusy}
                onClick={handleGoogleSignIn}
                className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_6px_24px_rgba(255,255,255,0.16)] active:scale-[0.98] transition"
              >
                <GoogleMark className="w-4 h-4" />
                <span>{authBusy ? 'Qoşulur...' : 'Gmail ilə Giriş'}</span>
              </button>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={handleChooseGuestEntry}
                  className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Qonaq olaraq gir</span>
                </button>
                <p className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] leading-snug text-amber-300/90">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Məlumatlarınız / irəliləyişləriniz silinə bilər, Google ilə giriş tövsiyə olunur.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
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

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                maxLength={14}
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Adınızı daxil edin..."
                className="h-11 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-white outline-none text-white text-sm font-semibold"
                autoFocus
              />
              {nameError && (
                <p className="text-[11px] font-semibold text-red-400 px-1">{nameError}</p>
              )}
              <p className="text-[10px] text-zinc-500 px-1">
                Hər oyunçunun adı unikal olmalıdır (eyni adla 2 oyunçu ola bilməz).
              </p>
            </div>

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
                disabled={nameBusy}
                className="flex-1 h-10 rounded-xl bg-white disabled:opacity-60 text-zinc-950 text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{nameBusy ? 'Yoxlanır...' : 'Yadda saxla'}</span>
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
              {/* Google / Gmail Account & Cloud Sync Card */}
              <div className="sm:col-span-2 rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-wrap items-center justify-between gap-2.5">
                {authUser ? (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {authUser.photoURL ? (
                        <img
                          src={authUser.photoURL}
                          alt={authUser.displayName || 'Gmail'}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                          <GoogleMark className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {authUser.displayName || 'Google Hesabı'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-emerald-400 shrink-0">
                            <Cloud className="w-2.5 h-2.5" />
                            <span>{cloudSynced ? 'Sinxron' : 'Saxlanır...'}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {authUser.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={handleGoogleSignOut}
                      className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıxış</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <GoogleMark className="w-4 h-4" />
                      </div>
                      <div className="leading-tight min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white">
                          Gmail Hesabı &amp; Bulud Yaddaşı
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          Coin, geyim və tənzimləmələri hesabında saxla
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={handleGoogleSignIn}
                      className="h-9 px-3.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-60 text-zinc-950 text-xs font-extrabold flex items-center gap-2 shrink-0 active:scale-95 transition"
                    >
                      <GoogleMark className="w-3.5 h-3.5" />
                      <span>{authBusy ? 'Gözləyin...' : 'Gmail ilə Giriş'}</span>
                    </button>
                  </>
                )}
              </div>

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
                      if (authUser) {
                        PartyEconomy.importProfile(
                          { name: authUser.displayName?.trim().slice(0, 14) || '' },
                          true
                        );
                        setConfirmReset(false);
                        pushToast('Profil sıfırlandı', 'info');
                      } else {
                        localStorage.removeItem(PARTY_SAVE_KEY);
                        window.location.reload();
                      }
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
