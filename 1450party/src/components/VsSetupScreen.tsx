import { useMemo } from 'react';
import { ArrowLeft, Box, Play, Shuffle, Swords } from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { PartyEconomy } from '../game/economy';
import { getMapPng, getWeaponPng } from '../game/pngAssets';
import {
  COLOR_CHOICES,
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
  onPickColor: (idx: number, col: string) => void;
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
  onPickColor,
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
    <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row bg-[#09090b] overflow-hidden">
      {/* Left Pane: Map Grid + Mode & Rounds */}
      <section className="flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800/90">
        {/* Sticky Sub-header */}
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
                VS ARENA QURULUMU
              </h2>
              <p className="text-[11px] text-zinc-400">
                {playerCount} Oyunçu · İnteraktiv Arenalar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Weapon vs Loot Drop Toggle */}
            <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setLootMode(false);
                }}
                className={`h-8 px-2.5 rounded-md text-xs font-bold flex items-center gap-1 transition ${
                  !lootMode ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Silahlı</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setLootMode(true);
                }}
                className={`h-8 px-2.5 rounded-md text-xs font-bold flex items-center gap-1 transition ${
                  lootMode ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Loot Drop</span>
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

        {/* Scrollable 9-Map Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
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
                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-700/80 text-[10px] font-mono text-zinc-200">
                        {m.mechanic}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display text-lg font-bold text-white leading-tight truncate">
                        {m.name}
                      </span>
                      {m.id === 'random' && <Shuffle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right Pane: Player Weapons, Colors & Launch CTA */}
      <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0 bg-[#0d0e11] flex flex-col min-h-0 max-h-[48vh] lg:max-h-none">
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3.5 sm:p-4 flex flex-col gap-3">
          {/* Selected Map Banner */}
          <div className="rounded-xl bg-[#131418] border border-zinc-800 p-2.5 flex items-center gap-3">
            <img
              src={mapThumbs[activeMap.id]}
              alt={activeMap.name}
              referrerPolicy="no-referrer"
              className="w-20 h-12 rounded-lg object-cover border border-zinc-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
                Seçilmiş Arena · {rounds} Raund
              </div>
              <div className="font-display text-lg font-bold text-white truncate">{activeMap.name}</div>
              <div className="text-[11px] text-zinc-400 truncate">{activeMap.desc}</div>
            </div>
          </div>

          {/* Per-Player Weapon + Color Rows */}
          {Array.from({ length: playerCount }).map((_, idx) => {
            const pCol = playerColors[idx] || PartyEconomy.color(idx);
            const curWep = weapons[idx] || 'sword';
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#131418] border border-zinc-800 p-3 flex flex-col gap-2.5"
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

                  {/* Compact Color Swatches */}
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {COLOR_CHOICES.slice(0, 8).map((c) => {
                      const isSel = c === pCol;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => onPickColor(idx, c)}
                          aria-label={`P${idx + 1} rəngi`}
                          className={`w-4 h-4 rounded-full border transition ${
                            isSel ? 'border-white scale-125' : 'border-black/60 opacity-75 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Horizontal PNG Weapon Strip */}
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
                          className={`shrink-0 w-[68px] rounded-lg p-1.5 border flex flex-col items-center gap-1 transition active:scale-95 ${
                            sel
                              ? 'bg-white text-zinc-950 border-white'
                              : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <img
                            src={weaponThumbs[w.id]}
                            alt={w.name}
                            referrerPolicy="no-referrer"
                            className={`w-8 h-8 object-contain ${sel ? 'brightness-90 contrast-125' : ''}`}
                          />
                          <span className="text-[10px] font-bold leading-none truncate w-full text-center">
                            {w.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                    Loot Drop aktivdir: döyüş zamanı sandıqlardan təsadüfi silah düşəcək.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Sticky CTA */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-zinc-800 bg-[#09090b]">
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('buy');
              onStartMatch();
            }}
            className="w-full h-12 sm:h-13 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-display text-2xl font-extrabold tracking-wide flex items-center justify-center gap-2.5 shadow-[0_8px_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition"
          >
            <Play className="w-5 h-5 fill-zinc-950" />
            <span>DÖYÜŞÜ BAŞLAT</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
