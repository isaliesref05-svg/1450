import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Coins,
  Palette,
  RotateCcw,
  Shield,
  Shirt,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { getShopItemPng, PartyEconomy, SHOP_ITEMS, ShopItem, slotOf } from '../game/economy';
import { renderFighterPreview } from '../game/fightEngine';
import { COLOR_CHOICES, PLAYER_NAMES, ShopCategory } from '../game/types';

interface ShopScreenProps {
  coins: number;
  playerColors: string[];
  onPickColor: (idx: number, col: string) => void;
  onToast: (msg: string, tone?: 'info' | 'error' | 'success') => void;
  onBack: () => void;
}

const CATEGORIES: { id: ShopCategory; label: string; icon: typeof Shirt }[] = [
  { id: 'outfit', label: 'Geyimlər', icon: Shirt },
  { id: 'kit', label: 'Klub Formaları', icon: Shield },
  { id: 'hat', label: 'Papaqlar', icon: Sparkles },
  { id: 'accessory', label: 'Aksesuarlar', icon: Tag },
];

export function ShopScreen({
  coins,
  playerColors,
  onPickColor,
  onToast,
  onBack,
}: ShopScreenProps) {
  const [activePlayer, setActivePlayer] = useState(0);
  const [category, setCategory] = useState<ShopCategory>('outfit');
  const [, setTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const unsub = PartyEconomy.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (canvasRef.current) {
        renderFighterPreview(canvasRef.current, activePlayer, ((now - start) / 1000) * 1.8);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activePlayer]);

  const itemThumbs = useMemo(() => {
    const map: Record<string, string> = {};
    for (const it of SHOP_ITEMS) {
      map[it.id] = getShopItemPng(it);
    }
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    return SHOP_ITEMS.filter((it) => {
      if (category === 'outfit') return it.category === 'outfit' && !it.club;
      if (category === 'kit') return it.category === 'outfit' && !!it.club;
      if (category === 'hat') return slotOf(it) === 'hat';
      return slotOf(it) === 'accessory';
    });
  }, [category]);

  const ownedInCat = useMemo(
    () => filteredItems.filter((it) => PartyEconomy.owned(it.id)).length,
    [filteredItems]
  );

  const look = PartyEconomy.look(activePlayer);
  const pCol = playerColors[activePlayer] || PartyEconomy.color(activePlayer);

  const handleItemAction = (item: ShopItem) => {
    const slot = slotOf(item);
    const owned = PartyEconomy.owned(item.id);
    const equippedId = PartyEconomy.equippedId(activePlayer, slot);
    if (owned) {
      if (equippedId === item.id) {
        if (slot !== 'outfit') {
          PartyEconomy.unequip(slot, activePlayer);
          PartyAudio.play('hit');
        }
      } else {
        PartyEconomy.equip(item.id, activePlayer);
        PartyAudio.play('buy');
      }
      return;
    }

    if (PartyEconomy.coins() < item.price) {
      PartyAudio.play('error');
      onToast(`${item.name} üçün ${item.price - PartyEconomy.coins()} coin çatışmır`, 'error');
      return;
    }
    if (PartyEconomy.buy(item.id)) {
      PartyEconomy.equip(item.id, activePlayer);
      PartyAudio.play('coin');
      onToast(`${item.name} alındı və geyinildi`, 'success');
    }
  };

  const resetPlayerLook = () => {
    PartyEconomy.unequip('outfit', activePlayer);
    PartyEconomy.unequip('hat', activePlayer);
    PartyEconomy.unequip('accessory', activePlayer);
    PartyAudio.play('hit');
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row bg-[#09090b] overflow-hidden">
      {/* Left Studio Preview Rail (side-by-side even in landscape mobile APK) */}
      <aside className="w-full sm:w-[250px] md:w-[300px] lg:w-[360px] shrink-0 bg-[#0d0e11] border-b sm:border-b-0 sm:border-r border-zinc-800/90 p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-3 sm:overflow-y-auto mono-scroll">
        {/* Top bar controls */}
        <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center gap-1.5 px-2.5 h-8 sm:h-9 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-xs sm:text-sm font-bold text-white">
            <Coins className="w-3.5 h-3.5 text-zinc-300" />
            <span>{coins.toLocaleString('en-US')}</span>
          </div>
        </div>

        {/* P1-P4 Tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((idx) => {
            const active = activePlayer === idx;
            const c = playerColors[idx] || PartyEconomy.color(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  setActivePlayer(idx);
                }}
                className={`h-8 sm:h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                  active
                    ? 'bg-white text-zinc-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30" style={{ backgroundColor: c }} />
                <span>P{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Front-Facing Studio Stage + Equipped Slots + Color Swatches */}
        <div className="flex sm:flex-col items-center gap-3 rounded-xl bg-gradient-to-b from-[#16171d] to-[#0b0c10] border border-zinc-800 p-2.5 sm:p-3">
          <div className="relative w-[108px] h-[108px] sm:w-full sm:h-[175px] md:h-[210px] rounded-xl overflow-hidden border border-zinc-800/90 bg-[#09090b] shrink-0">
            <canvas ref={canvasRef} width={320} height={320} className="w-full h-full block" />
            <div className="pointer-events-none absolute top-2 left-2 px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              P{activePlayer + 1} · {PLAYER_NAMES[activePlayer] || `P${activePlayer + 1}`}
            </div>
            <button
              type="button"
              onClick={resetPlayerLook}
              title="Görünüşü sıfırla"
              className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-zinc-950/85 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 w-full min-w-0 flex flex-col gap-2">
            {/* Equipped Item Chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] font-semibold text-white truncate max-w-full">
                {look.outfit.name}
              </span>
              {look.hat && (
                <button
                  type="button"
                  onClick={() => {
                    PartyEconomy.unequip('hat', activePlayer);
                    PartyAudio.play('hit');
                  }}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-200 flex items-center gap-1"
                >
                  <span className="truncate max-w-[90px]">{look.hat.name}</span>
                  <X className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>
              )}
              {look.accessory && (
                <button
                  type="button"
                  onClick={() => {
                    PartyEconomy.unequip('accessory', activePlayer);
                    PartyAudio.play('hit');
                  }}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-200 flex items-center gap-1"
                >
                  <span className="truncate max-w-[90px]">{look.accessory.name}</span>
                  <X className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>
              )}
            </div>

            {/* Color Swatches (Moved exclusively here from VS Setup) */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                <Palette className="w-3 h-3" />
                <span>Oyunçu Rəngi</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_CHOICES.map((c) => {
                  const isSel = c === pCol;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onPickColor(activePlayer, c)}
                      aria-label={`Rəng ${c}`}
                      className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 transition ${
                        isSel
                          ? 'border-white scale-115 shadow-[0_0_10px_rgba(255,255,255,0.45)]'
                          : 'border-zinc-950 opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Catalog */}
      <section className="flex-1 min-h-0 flex flex-col">
        {/* Category Tabs */}
        <div className="shrink-0 px-3 sm:px-5 py-2 sm:py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto mono-scroll">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    PartyAudio.play('hit');
                    setCategory(cat.id);
                  }}
                  className={`shrink-0 h-8 sm:h-9 px-3 sm:px-3.5 rounded-lg border text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                    active
                      ? 'bg-white text-zinc-950 border-white shadow-[0_0_16px_rgba(255,255,255,0.16)]'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          <span className="hidden md:inline text-xs font-mono text-zinc-500 shrink-0">
            {ownedInCat}/{filteredItems.length} Açıq
          </span>
        </div>

        {/* Rich Tailored Item Cards Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-2.5 sm:p-4 lg:p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredItems.map((item) => {
              const owned = PartyEconomy.owned(item.id);
              const equipped = PartyEconomy.equippedId(activePlayer, slotOf(item)) === item.id;
              const canAfford = coins >= item.price;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemAction(item)}
                  className={`group rounded-2xl border overflow-hidden text-left flex flex-col justify-between bg-[#121318] transition active:scale-[0.98] ${
                    equipped
                      ? 'border-white ring-1 ring-white/85 shadow-[0_0_24px_rgba(255,255,255,0.14)]'
                      : owned
                        ? 'border-zinc-700 hover:border-zinc-500'
                        : 'border-zinc-800/90 hover:border-zinc-600'
                  }`}
                >
                  {/* Visual Studio Pedestal Header */}
                  <div className="relative w-full h-24 sm:h-28 bg-gradient-to-b from-[#1a1c24] to-[#0d0e12] border-b border-zinc-800/80 flex items-center justify-center p-2">
                    <img
                      src={itemThumbs[item.id]}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain group-hover:scale-108 transition-transform duration-300"
                    />
                    {equipped && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Card Info & Action Bar */}
                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <div className="font-display text-base sm:text-lg font-bold text-white leading-tight truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {item.desc}
                      </div>
                    </div>

                    <div
                      className={`h-7 sm:h-8 rounded-lg px-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold transition ${
                        equipped
                          ? 'bg-white text-zinc-950'
                          : owned
                            ? 'bg-zinc-800 text-zinc-100 group-hover:bg-zinc-700'
                            : canAfford
                              ? 'bg-zinc-900 border border-zinc-600 text-white group-hover:bg-zinc-800'
                              : 'bg-zinc-950 border border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {equipped ? (
                        <span>Geyinilib</span>
                      ) : owned ? (
                        <span>Geyin</span>
                      ) : (
                        <>
                          <Coins className="w-3 h-3" />
                          <span className="font-mono">{item.price}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
