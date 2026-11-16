import { Coins, Settings, User, Volume2, VolumeX } from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { PartyEconomy } from '../game/economy';

interface TopBarProps {
  coins: number;
  playerName: string;
  muted: boolean;
  onOpenName: () => void;
  onOpenShop: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export function TopBar({
  coins,
  playerName,
  muted,
  onOpenName,
  onOpenShop,
  onToggleSound,
  onOpenSettings,
  onGoHome,
}: TopBarProps) {
  return (
    <header className="h-13 shrink-0 w-full bg-[#09090b]/95 border-b border-zinc-800/90 px-3 sm:px-5 flex items-center justify-between gap-2 select-none z-20">
      <button
        type="button"
        onClick={() => {
          PartyAudio.play('hit');
          onGoHome();
        }}
        className="flex items-center gap-2.5 text-left group active:scale-[0.98] transition-transform"
      >
        <img
          src="/assets/aistudio/icon-192_f69a2fab.png"
          alt="1450 Party"
          referrerPolicy="no-referrer"
          className="w-8 h-8 rounded-lg object-cover border border-zinc-700 grayscale contrast-125 shrink-0"
        />
        <div className="leading-none">
          <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white block">
            1450 PARTY
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 hidden sm:block">
            ARENA &amp; MİNİ OYUNLAR
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenName}
          title="Oyunçu adını dəyiş"
          className="h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 active:scale-95 transition"
        >
          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="max-w-[78px] sm:max-w-[120px] truncate">
            {playerName || 'Ad seç'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenShop}
          title="Qarderob və Mağaza"
          className="h-9 px-2.5 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 active:scale-95 transition"
        >
          <Coins className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          <span>{coins.toLocaleString('en-US')}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label="Səs"
          className="h-9 w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center justify-center active:scale-95 transition"
        >
          {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Parametrlər"
          className="h-9 w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center justify-center active:scale-95 transition"
        >
          <Settings className="w-4 h-4 text-zinc-300" />
        </button>
      </div>
    </header>
  );
}

export function useEconomySnapshot() {
  return {
    coins: PartyEconomy.coins(),
    name: PartyEconomy.name(),
    muted: PartyEconomy.isMuted(),
  };
}
