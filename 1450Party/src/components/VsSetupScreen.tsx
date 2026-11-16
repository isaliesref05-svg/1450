import { useMemo } from 'react';
import { ArrowLeft, Box, Play, Shuffle, Swords } from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { PartyEconomy } from '../game/economy';
import { getMapPng, getWeaponPng } from '../game/pngAssets';
import {
  MAP_LIST,
  MapId,
  PLAYER_NAMES,
  WEAPON_LIST,
  WeaponChoice,
} from '../game/types';

interface VsSetupScreenProps {
  playerCount: number;
  selectedMap: MapId;
  setSelectedMap: (m: MapId) => void;
  rounds: number;
  setRounds: (r: number) => void;
  lootMode: boolean;
  setLootMode: (l: boolean) => void;
  weapons: WeaponChoice[];
  setWeaponForPlayer: (idx: number, w: WeaponChoice) => void;
  playerColors: string[];
  onStartMatch: () => void;
  onBack: () => void;
}

export function VsSetupScreen({
  playerCount,
  selectedMap,
  setSelectedMap,
  rounds,
  setRounds,
  lootMode,
  setLootMode,
  weapons,
  setWeaponForPlayer,
  playerColors,
  onStartMatch,
  onBack,
}: VsSetupScreenProps) {
  const mapThumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const m of MAP_LIST) {
      out[m.id] = getMapPng(m.id);
    }
    return out;
  }, []);

  const weaponThumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const w of WEAPON_LIST) {
      out[w.id] = getWeaponPng(w.id);
    }
    return out;
  }, []);

  const activeMap = MAP_LIST.find((m) => m.id === selectedMap) || MAP_LIST[0];

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row bg-[#09090b] overflow-hidden">
      {/* Left Pane: Map Grid + Mode & Rounds */}
      <section className="flex-1 min-h-0 flex flex-col border-b sm:border-b-0 sm:border-r border-zinc-800/90">
        {/* Sticky Sub-header */}
        <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                PartyAudio.play('hit');
                onBack();
              }}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>
            <div>
              <h2 className="font-display text-lg sm:text-2xl font-extrabold text-white leading-none">
                VS ARENA
              </h2>
              <p className="text-[10px] sm:text-[11px] text-zinc-400">
                {playerCount} Oyunçu · Xəritə Seçimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Weapon vs Loot Drop Toggle */}
            <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setLootMode(false);
                }}
                className={`h-7 sm:h-8 px-2 rounded-md text-[11px] sm:text-xs font-bold flex items-center gap-1 transition ${
                  !lootMode ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Swords className="w-3 h-3" />
                <span>Silahlı</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setLootMode(true);
                }}
                className={`h-7 sm:h-8 px-2 rounded-md text-[11px] sm:text-xs font-bold flex items-center gap-1 transition ${
                  lootMode ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>Loot</span>
              </button>
            </div>

            {/* Rounds */}
            <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              {[1, 3, 5, 7].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    PartyAudio.play('hit');
                    setRounds(r);
                  }}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md text-[11px] sm:text-xs font-mono font-bold transition ${
                    rounds === r ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable 9-Map Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-2.5 sm:p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {MAP_LIST.map((m) => {
              const active = selectedMap === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    PartyAudio.play('hit');
                    setSelectedMap(m.id);
                  }}
                  className={`group rounded-xl overflow-hidden border text-left transition active:scale-[0.98] flex flex-col bg-[#121317] ${
                    active
                      ? 'border-white ring-1 ring-white/80 shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={mapThumbs[m.id]}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-700/80 text-[9px] sm:text-[10px] font-mono text-zinc-200 truncate">
                        {m.mechanic}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display text-base sm:text-lg font-bold text-white leading-tight truncate">
                        {m.name}
                      </span>
                      {m.id === 'random' && <Shuffle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right Pane: Player Weapons & Launch CTA (Color swatches moved exclusively to Shop) */}
      <aside className="w-full sm:w-[270px] md:w-[320px] lg:w-[400px] shrink-0 bg-[#0d0e11] flex flex-col min-h-0 max-h-[42vh] sm:max-h-none">
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-2.5 sm:p-4 flex flex-col gap-2.5">
          {/* Selected Map Banner */}
          <div className="rounded-xl bg-[#131418] border border-zinc-800 p-2 flex items-center gap-2.5">
            <img
              src={mapThumbs[activeMap.id]}
              alt={activeMap.name}
              referrerPolicy="no-referrer"
              className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg object-cover border border-zinc-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                Arena · {rounds} Raund
              </div>
              <div className="font-display text-base sm:text-lg font-bold text-white truncate">{activeMap.name}</div>
              <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{activeMap.desc}</div>
            </div>
          </div>

          {/* Per-Player Weapon Rows (NO color picker here; managed in Shop) */}
          {Array.from({ length: playerCount }).map((_, idx) => {
            const pCol = playerColors[idx] || PartyEconomy.color(idx);
            const curWep = weapons[idx] || 'sword';
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#131418] border border-zinc-800 p-2.5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 rounded-md text-[11px] font-mono font-bold text-white flex items-center justify-center shrink-0 border border-white/30"
                      style={{ backgroundColor: pCol }}
                    >
                      P{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {PLAYER_NAMES[idx] || `Oyunçu ${idx + 1}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {lootMode ? 'Sandıq Loot' : WEAPON_LIST.find((w) => w.id === curWep)?.name}
                  </span>
                </div>

                {!lootMode ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto mono-scroll pb-1">
                    {WEAPON_LIST.map((w) => {
                      const sel = curWep === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            PartyAudio.play('hit');
                            setWeaponForPlayer(idx, w.id);
                          }}
                          className={`shrink-0 w-[60px] sm:w-[66px] rounded-lg p-1.5 border flex flex-col items-center gap-1 transition active:scale-95 ${
                            sel
                              ? 'bg-white text-zinc-950 border-white'
                              : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <img
                            src={weaponThumbs[w.id]}
                            alt={w.name}
                            referrerPolicy="no-referrer"
                            className={`w-7 h-7 sm:w-8 sm:h-8 object-contain ${sel ? 'brightness-90 contrast-125' : ''}`}
                          />
                          <span className="text-[9px] sm:text-[10px] font-bold leading-none truncate w-full text-center">
                            {w.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                    Döyüş zamanı sandıqlardan təsadüfi silah düşəcək.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Sticky CTA */}
        <div className="shrink-0 p-2.5 sm:p-4 border-t border-zinc-800 bg-[#09090b]">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('buy');
              onStartMatch();
            }}
            className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display text-xl sm:text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition"
          >
            <Play className="w-5 h-5 fill-zinc-950" />
            <span>DÖYÜŞÜ BAŞLAT</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
