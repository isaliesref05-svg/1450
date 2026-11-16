import { Coins, LogIn, Settings, User, Volume2, VolumeX } from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { PartyEconomy } from '../game/economy';

export interface TopBarAuthInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface TopBarProps {
  coins: number;
  playerName: string;
  muted: boolean;
  authUser: TopBarAuthInfo | null;
  authBusy: boolean;
  onGoogleSignIn: () => void;
  onOpenName: () => void;
  onOpenShop: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export function GoogleMark({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path
        fill="#34A853"
        d="M3.3 7.5l3.2 2.3C7.4 7.6 9.5 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 8.2 2.2 4.9 4.4 3.3 7.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.8c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1l-3.2 2.5C4.8 19.5 8.1 21.8 12 21.8z"
      />
      <path
        fill="#4285F4"
        d="M21.4 12.2c0-.6-.1-1.2-.2-1.8H12v3.9h5.4c-.3 1.3-1.1 2.4-2.1 3.1l3 2.5c1.8-1.6 3.1-4.1 3.1-7.7z"
      />
    </svg>
  );
}

export function TopBar({
  coins,
  playerName,
  muted,
  authUser,
  authBusy,
  onGoogleSignIn,
  onOpenName,
  onOpenShop,
  onToggleSound,
  onOpenSettings,
  onGoHome,
}: TopBarProps) {
  return (
    <header className="h-11 sm:h-12 shrink-0 w-full bg-[#09090b]/95 border-b border-zinc-800/90 apk-safe-x flex items-center justify-between gap-2 select-none z-20">
      <button
        type="button"
        onClick={() => {
          PartyAudio.play('hit');
          onGoHome();
        }}
        className="flex items-center gap-2 text-left group active:scale-[0.98] transition-transform min-w-0"
      >
        <img
          src="/assets/aistudio/icon-192_f69a2fab.png"
          alt="1450 Party"
          referrerPolicy="no-referrer"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-zinc-700 shrink-0"
        />
        <div className="leading-none min-w-0">
          <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-white block truncate">
            1450 PARTY
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-500 hidden lg:block">
            ARENA &amp; MİNİ OYUNLAR
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1.5 shrink-0">
        {authUser ? (
          <button
            type="button"
            onClick={onOpenSettings}
            title={authUser.email || 'Gmail hesabı'}
            className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/90 text-zinc-100 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
          >
            {authUser.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={authUser.displayName || 'Gmail'}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-zinc-600 shrink-0"
              />
            ) : (
              <GoogleMark className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="hidden md:inline max-w-[110px] truncate text-[11px] text-zinc-300">
              {authUser.email?.split('@')[0] || authUser.displayName || 'Gmail'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled={authBusy}
            onClick={() => {
              PartyAudio.play('hit');
              onGoogleSignIn();
            }}
            title="Gmail (Google) ilə giriş et"
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-60 text-zinc-950 text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition shrink-0"
          >
            <GoogleMark className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">
              {authBusy ? 'Gözləyin...' : 'Gmail Giriş'}
            </span>
            <LogIn className="w-3.5 h-3.5 sm:hidden" />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenName}
          title="Oyunçu adını dəyiş"
          className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
        >
          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="max-w-[60px] sm:max-w-[110px] truncate">
            {playerName || 'Ad seç'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenShop}
          title="Qarderob və Mağaza"
          className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 active:scale-95 transition"
        >
          <Coins className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          <span>{coins.toLocaleString('en-US')}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label="Səs"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center justify-center active:scale-95 transition"
        >
          {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Parametrlər"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center justify-center active:scale-95 transition"
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
