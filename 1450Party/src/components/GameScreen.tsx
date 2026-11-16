import { useEffect, useRef, useState } from 'react';
import {
  Coins,
  Home,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { MATCH_BASE_REWARD, MATCH_WIN_BONUS, PartyEconomy } from '../game/economy';
import { fightEngine } from '../game/fightEngine';
import { minigameEngine } from '../game/minigameEngine';
import { onlineManager } from '../game/online';
import { MapId, MinigameId, PLAYER_COLORS, PLAYER_NAMES, resetInputs, WeaponChoice } from '../game/types';
import { JoystickLayer } from './JoystickLayer';

export interface ActiveMatchConfig {
  mode: 'vs' | 'minigames';
  map: MapId;
  mini: MinigameId;
  playerCount: number;
  rounds: number;
  weapons: WeaponChoice[];
  loot: boolean;
  onlineMode: boolean;
  netRole: 'host' | 'guest' | null;
}

interface GameScreenProps {
  config: ActiveMatchConfig;
  playerColors: string[];
  muted: boolean;
  rematchSignal: number;
  onToggleSound: () => void;
  onExitToMenu: () => void;
}

export function GameScreen({
  config,
  playerColors,
  muted,
  rematchSignal,
  onToggleSound,
  onExitToMenu,
}: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [hudValues, setHudValues] = useState<(number | string)[]>(
    Array.from({ length: config.playerCount }, () => 0)
  );
  const [roundInfo, setRoundInfo] = useState({ round: 1, maxRounds: config.rounds });
  const [winnerState, setWinnerState] = useState<{
    scores: number[];
    winners: number[];
    earned: { base: number; bonus: number; total: number } | null;
  } | null>(null);
  const [portraitDismissed, setPortraitDismissed] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    resetInputs();
    setPaused(false);
    setWinnerState(null);

    const onEnd = (scores: number[], winners: number[]) => {
      const reward = PartyEconomy.awardMatch(MATCH_WIN_BONUS);
      PartyAudio.play('coin');
      setWinnerState({
        scores,
        winners,
        earned: reward
          ? { base: reward.base, bonus: reward.bonus, total: reward.total }
          : { base: MATCH_BASE_REWARD, bonus: MATCH_WIN_BONUS, total: MATCH_BASE_REWARD + MATCH_WIN_BONUS },
      });
    };

    if (config.mode === 'vs') {
      fightEngine.start(
        cv,
        config.map,
        config.playerCount,
        config.rounds,
        config.weapons,
        config.loot,
        config.netRole,
        {
          onHudUpdate: (scores, count, round, maxRounds) => {
            setHudValues(scores.slice(0, count));
            setRoundInfo({ round, maxRounds });
          },
          onMatchEnd: onEnd,
          onSendNet: () => {
            onlineManager.sendNetTick(
              'vs',
              fightEngine.paused,
              fightEngine.gameState === 'playing',
              () => fightEngine.serialize(),
              () => minigameEngine.serialize()
            );
          },
        }
      );
    } else {
      minigameEngine.start(
        cv,
        config.mini,
        config.playerCount,
        config.rounds,
        config.netRole,
        {
          onHudUpdate: (vals, count, round, maxRounds) => {
            setHudValues(vals.slice(0, count));
            setRoundInfo({ round, maxRounds });
          },
          onMatchEnd: onEnd,
          onSendNet: () => {
            onlineManager.sendNetTick(
              'minigames',
              minigameEngine.paused,
              minigameEngine.gameState === 'playing',
              () => fightEngine.serialize(),
              () => minigameEngine.serialize()
            );
          },
        }
      );
    }

    return () => {
      fightEngine.stop();
      minigameEngine.stop();
      resetInputs();
    };
  }, [config]);

  useEffect(() => {
    if (rematchSignal > 0) {
      setPaused(false);
      setWinnerState(null);
      resetInputs();
    }
  }, [rematchSignal]);

  const togglePause = () => {
    if (winnerState) return;
    const next = !paused;
    setPaused(next);
    if (config.mode === 'vs') fightEngine.setPaused(next);
    else minigameEngine.setPaused(next);
  };

  const restartMatch = () => {
    setPaused(false);
    setWinnerState(null);
    resetInputs();
    if (config.onlineMode) {
      onlineManager.sendRematch();
    }
    if (config.mode === 'vs') fightEngine.restart();
    else minigameEngine.restart();
  };

  const exitMatch = () => {
    fightEngine.stop();
    minigameEngine.stop();
    if (config.onlineMode) onlineManager.cleanup();
    onExitToMenu();
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#09090b] overflow-hidden select-none">
      {/* Full-bleed Game Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* Compact Top Monochrome HUD */}
      <div className="pointer-events-none fixed top-2 left-2 right-2 z-30 flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: config.playerCount }).map((_, idx) => {
            const c = playerColors[idx] || PLAYER_COLORS[idx];
            return (
              <div
                key={idx}
                className="h-8 px-2.5 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-zinc-800 flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c }} />
                <span className="text-[11px] font-semibold text-zinc-300 max-w-[64px] truncate">
                  {PLAYER_NAMES[idx] || `P${idx + 1}`}
                </span>
                <span className="font-mono text-xs font-extrabold text-white ml-0.5">
                  {hudValues[idx] ?? 0}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          <div className="h-8 px-2.5 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-[11px] font-mono font-bold text-zinc-300 hidden sm:flex items-center">
            R{roundInfo.round}/{roundInfo.maxRounds}
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label="Səs"
            className="w-8 h-8 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-zinc-800 hover:border-zinc-600 text-white flex items-center justify-center"
          >
            {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={togglePause}
            aria-label="Fasilə"
            className="w-8 h-8 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-zinc-800 hover:border-zinc-600 text-white flex items-center justify-center"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dismissible Portrait Landscape Suggestion Banner */}
      {!portraitDismissed && (
        <div className="sm:hidden portrait:flex hidden fixed bottom-32 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-700 text-zinc-200 text-[11px] font-medium items-center gap-2 shadow-xl">
          <Smartphone className="w-3.5 h-3.5 text-zinc-400 rotate-90 shrink-0" />
          <span className="whitespace-nowrap">Geniş görünüş üçün telefonu çevirin</span>
          <button
            type="button"
            onClick={() => setPortraitDismissed(true)}
            aria-label="Bağla"
            className="p-0.5 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Analog Joysticks */}
      {!paused && !winnerState && (
        <JoystickLayer
          playerCount={config.playerCount}
          onlineMode={config.onlineMode}
          playerColors={playerColors}
        />
      )}

      {/* Pause Modal */}
      {paused && !winnerState && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl bg-[#111216] border border-zinc-700 p-5 flex flex-col gap-3">
            <h3 className="font-display text-3xl font-extrabold text-white text-center tracking-wide">
              FASİLƏ
            </h3>
            <button
              type="button"
              onClick={togglePause}
              className="h-11 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Davam Et</span>
            </button>
            {!config.onlineMode && (
              <button
                type="button"
                onClick={restartMatch}
                className="h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yenidən Başlat</span>
              </button>
            )}
            <button
              type="button"
              onClick={exitMatch}
              className="h-11 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Menyuya Çıx</span>
            </button>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winnerState && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111216] border border-zinc-700 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center mb-1">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-display text-4xl font-extrabold text-white leading-none">
                {winnerState.winners.length > 1
                  ? 'BƏRABƏRLİK!'
                  : `${PLAYER_NAMES[winnerState.winners[0]] || `P${winnerState.winners[0] + 1}`} QAZANDI!`}
              </h3>
              <p className="text-xs text-zinc-400">Oyun nəticələri</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {winnerState.scores.map((sc, idx) => {
                const c = playerColors[idx] || PLAYER_COLORS[idx];
                const isW = winnerState.winners.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`rounded-xl px-3 py-2.5 border flex items-center justify-between ${
                      isW ? 'bg-zinc-900 border-white/80' : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c }} />
                      <span className="text-xs font-bold text-white truncate">
                        {PLAYER_NAMES[idx] || `P${idx + 1}`}
                      </span>
                    </div>
                    <span className="font-mono text-base font-extrabold text-white">{sc}</span>
                  </div>
                );
              })}
            </div>

            {winnerState.earned && (
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-white" />
                  <span>Qazanılan Mükafat</span>
                </span>
                <span className="font-mono font-bold text-white">+{winnerState.earned.total} Coin</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={exitMatch}
                className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Menyu</span>
              </button>
              <button
                type="button"
                onClick={restartMatch}
                className="flex-1 h-11 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Təkrar Oyna</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
