import { useEffect, useRef } from 'react';
import { ArrowRight, Globe, Smartphone, Sparkles, Swords, Users } from 'lucide-react';
import { PartyAudio } from '../game/audio';
import { renderFighterPreview } from '../game/fightEngine';

interface HomeScreenProps {
  playerCount: number;
  setPlayerCount: (n: number) => void;
  onStartLocalVs: () => void;
  onStartLocalMinigames: () => void;
  onOpenOnline: () => void;
  onOpenShop: () => void;
}

export function HomeScreen({
  playerCount,
  setPlayerCount,
  onStartLocalVs,
  onStartLocalMinigames,
  onOpenOnline,
  onOpenShop,
}: HomeScreenProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (previewCanvasRef.current) {
        renderFighterPreview(previewCanvasRef.current, 0, ((now - start) / 1000) * 1.6);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col sm:flex-row bg-[#09090b] overflow-y-auto sm:overflow-hidden mono-scroll">
      {/* Left Control Rail: side-by-side even on landscape phones (>=640px) */}
      <aside className="w-full sm:w-[270px] md:w-[320px] lg:w-[385px] shrink-0 bg-[#0d0e11] border-b sm:border-b-0 sm:border-r border-zinc-800/90 p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3.5 sm:overflow-y-auto mono-scroll">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {/* Player Count Selector */}
          <section className="rounded-xl bg-[#131418] border border-zinc-800 p-2.5 sm:p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                  Oyunçu Sayı
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">{playerCount} Nəfər</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[2, 3, 4].map((cnt) => {
                const active = playerCount === cnt;
                return (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      PartyAudio.play('hit');
                      setPlayerCount(cnt);
                    }}
                    className={`h-9 sm:h-11 rounded-lg font-display text-xl sm:text-2xl font-extrabold tracking-wide border transition active:scale-95 ${
                      active
                        ? 'bg-white text-zinc-950 border-white shadow-[0_0_16px_rgba(255,255,255,0.18)]'
                        : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {cnt}P
                  </button>
                );
              })}
            </div>
          </section>

          {/* Connection Mode */}
          <section className="rounded-xl bg-[#131418] border border-zinc-800 p-2.5 sm:p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 block mb-2">
              Qoşulma Rejimi
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-zinc-900 border border-white/60 p-2 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-md bg-white text-zinc-950 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">1 Cihaz</div>
                  <div className="text-[10px] text-zinc-400 truncate">Eyni ekran</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  onOpenOnline();
                }}
                className="rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 p-2 flex items-center gap-2 text-left transition active:scale-[0.98] min-w-0"
              >
                <img
                  src="/src/assets/images/icon_online_globe_1794826058975.jpg"
                  alt="Onlayn"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-md object-cover border border-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="truncate">Onlayn</span>
                    <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">Otaq aç/qoşul</div>
                </div>
              </button>
            </div>
          </section>

          {/* Quick Shop / Front-facing Fighter Card */}
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onOpenShop();
            }}
            className="w-full rounded-xl bg-[#131418] hover:bg-[#181a20] border border-zinc-800 hover:border-zinc-600 p-2.5 flex items-center gap-3 text-left transition active:scale-[0.99] group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
              <canvas ref={previewCanvasRef} width={160} height={160} className="w-full h-full block" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <img
                  src="/src/assets/images/icon_shop_armor_1794826057693.jpg"
                  alt="Qarderob"
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded object-cover border border-zinc-700 shrink-0"
                />
                <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-white truncate">
                  MAĞAZA &amp; GEYİM
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight line-clamp-2">
                Rəng, forma, papaq və aksesuarlar
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>

        {/* Analog Joystick Tip (hidden on ultra-short viewports to keep fit clean) */}
        <div className="hidden lg:flex rounded-xl bg-zinc-950 border border-zinc-800/80 px-3 py-2 items-center gap-2 text-[11px] text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          <span>Joystiki yuxarı saxlayaraq hoppan, zərbə üçün burax.</span>
        </div>
      </aside>

      {/* Right Main Stage: Full-bleed Mode Selection (never clips in landscape APK) */}
      <main className="flex-1 min-h-0 p-3 sm:p-4 lg:p-6 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full max-h-[640px]">
          {/* VS BATTLE CARD */}
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onStartLocalVs();
            }}
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white/70 text-left flex flex-col justify-end p-3.5 sm:p-5 lg:p-7 transition-all active:scale-[0.99] min-h-[180px]"
          >
            <img
              src="/src/assets/images/icon_vs_battle_1794826056916.jpg"
              alt="VS Döyüş"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Swords className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.14em] text-zinc-300 truncate">
                  25 Silah · 8 Xəritə
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-none">
                VS DÖYÜŞ
              </h1>
              <p className="hidden md:block text-xs sm:text-sm text-zinc-300 max-w-sm line-clamp-2">
                Portallar, lazer qapıları, qalxan maqma və tikanlı mişarlı arenalarda qarşılaşma.
              </p>
              <div className="mt-1 inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-xs sm:text-sm">
                <span>Arena Seç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* MINIGAMES CARD */}
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onStartLocalMinigames();
            }}
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white/70 text-left flex flex-col justify-end p-3.5 sm:p-5 lg:p-7 transition-all active:scale-[0.99] min-h-[180px]"
          >
            <img
              src="/src/assets/images/icon_minigames_1794826057304.jpg"
              alt="Mini Oyunlar"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.14em] text-zinc-300 truncate">
                  8 Parti Rejimi
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-none">
                MİNİ OYUNLAR
              </h2>
              <p className="hidden md:block text-xs sm:text-sm text-zinc-300 max-w-sm line-clamp-2">
                Sumo, Mini Futbol, Meteor Yağışı, İsti Bomba, Sürət Yarışı, Kral Taxtı və Qar Döyüşü.
              </p>
              <div className="mt-1 inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg bg-zinc-900/95 border border-white/60 text-white font-bold text-xs sm:text-sm group-hover:bg-white group-hover:text-zinc-950 transition-all">
                <span>Oyunları Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
