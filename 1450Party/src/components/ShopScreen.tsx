import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Coins, RotateCcw, Shirt, Shield, Sparkles, Tag } from 'lucide-react';
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
    <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row bg-[#09090b] overflow-hidden">
      {/* Left Wardrobe Preview Rail */}
      <aside className="w-full lg:w-[340px] xl:w-[370px] shrink-0 bg-[#0d0e11] border-b lg:border-b-0 lg:border-r border-zinc-800/90 p-3.5 sm:p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-sm font-bold text-white">
            <Coins className="w-4 h-4 text-zinc-300" />
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
                className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  active
                    ? 'bg-white text-zinc-950 border-white'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c }} />
                <span>P{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Live Stickman Stage + Equipped Details */}
        <div className="flex lg:flex-col items-center gap-3.5 rounded-xl bg-[#131418] border border-zinc-800 p-3">
          <div className="w-[116px] h-[116px] lg:w-full lg:h-[188px] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
            <canvas ref={canvasRef} width={296} height={296} className="w-full h-full block" />
          </div>

          <div className="flex-1 w-full min-w-0 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {PLAYER_NAMES[activePlayer] || `Oyunçu ${activePlayer + 1}`}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {look.outfit.name}
                  {look.hat ? ` · ${look.hat.name}` : ''}
                  {look.accessory ? ` · ${look.accessory.name}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={resetPlayerLook}
                title="Sıfırla"
                className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-800/80">
              {COLOR_CHOICES.map((c) => {
                const isSel = c === pCol;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onPickColor(activePlayer, c)}
                    aria-label={`Rəng ${c}`}
                    className={`w-5 h-5 rounded-full border transition ${
                      isSel ? 'border-white scale-115 ring-2 ring-white/40' : 'border-black/60 opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Right Catalog */}
      <section className="flex-1 min-h-0 flex flex-col">
        {/* Category Tabs */}
        <div className="shrink-0 px-3.5 sm:px-5 py-3 bg-[#0d0e11] border-b border-zinc-800/90 flex items-center gap-2 overflow-x-auto mono-scroll">
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
                className={`shrink-0 h-9 px-3.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition ${
                  active
                    ? 'bg-white text-zinc-950 border-white'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Item Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto mono-scroll p-3.5 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => {
              const owned = PartyEconomy.owned(item.id);
              const equipped = PartyEconomy.equippedId(activePlayer, slotOf(item)) === item.id;
              const canAfford = coins >= item.price;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemAction(item)}
                  className={`rounded-xl border p-3 text-left flex flex-col justify-between gap-2.5 bg-[#121317] transition active:scale-[0.98] ${
                    equipped
                      ? 'border-white ring-1 ring-white/80'
                      : owned
                        ? 'border-zinc-700 hover:border-zinc-500'
                        : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-16 h-16 rounded-lg bg-zinc-950 border border-zinc-800/90 flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={itemThumbs[item.id]}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {equipped ? (
                      <span className="px-2 py-0.5 rounded bg-white text-zinc-950 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Geyinilib</span>
                      </span>
                    ) : owned ? (
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-bold">
                        Geyin
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold flex items-center gap-1 border ${
                          canAfford
                            ? 'bg-zinc-900 border-zinc-600 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <Coins className="w-3 h-3" />
                        <span>{item.price}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-display text-lg font-bold text-white leading-tight truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{item.desc}</div>
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
