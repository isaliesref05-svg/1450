import { useMemo } from 'react';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { getMinigamePng } from '../game/pngAssets';
import { MINIGAME_LIST, MinigameId } from '../game/types';

interface MinigamesScreenProps {
  playerCount: number;
  selectedMini: MinigameId;
  setSelectedMini: (id: MinigameId) => void;
  rounds: number;
  setRounds: (r: number) => void;
  onStartMinigame: (id: MinigameId) => void;
  onBack: () => void;
}

export function MinigamesScreen({
  playerCount,
  selectedMini,
  setSelectedMini,
  rounds,
  setRounds,
  onStartMinigame,
  onBack,
}: MinigamesScreenProps) {
  const thumbs = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of MINIGAME_LIST) {
      map[m.id] = getMinigamePng(m.id);
    }
    return map;
  }, []);

  const startRandom = () => {
    const pick = MINIGAME_LIST[Math.floor(Math.random() * MINIGAME_LIST.length)].id;
    setSelectedMini(pick);
    PartyAudio.play('buy');
    onStartMinigame(pick);
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#09090b] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onBack();
            }}
            className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-none">
              MİNİ OYUNLAR
            </h2>
            <p className="text-[11px] text-zinc-400">
              {playerCount} Oyunçu · 8 Təkmilləşdirilmiş Parti Rejimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">Raund:</span>
          <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
            {[1, 3, 5, 7].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setRounds(r);
                }}
                className={`h-8 w-8 rounded-md text-xs font-mono font-bold transition ${
                  rounds === r ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8-card Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3.5 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {MINIGAME_LIST.map((m) => {
            const active = selectedMini === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setSelectedMini(m.id);
                }}
                onDoubleClick={() => onStartMinigame(m.id)}
                className={`group rounded-2xl overflow-hidden border text-left flex flex-col bg-[#121317] transition active:scale-[0.98] ${
                  active
                    ? 'border-white ring-1 ring-white/80 shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={thumbs[m.id]}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-zinc-950/85 border border-zinc-700 text-[10px] font-mono text-zinc-200">
                    {m.tag}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white leading-tight">
                      {m.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug">{m.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="shrink-0 px-4 py-3 bg-[#0d0e11] border-t border-zinc-800/90 flex items-center gap-3">
        <button
          type="button"
          onClick={startRandom}
          className="h-12 px-4 sm:px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition shrink-0"
        >
          <Shuffle className="w-4 h-4" />
          <span>Təsadüfi Başlat</span>
        </button>

        <button
          type="button"
          onClick={() => {
            PartyAudio.play('buy');
            onStartMinigame(selectedMini);
          }}
          className="flex-1 h-12 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <Play className="w-5 h-5 fill-zinc-950" />
          <span>OYUNA BAŞLA</span>
        </button>
      </div>
    </div>
  );
}
