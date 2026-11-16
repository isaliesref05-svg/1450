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
    <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row bg-[#09090b] overflow-y-auto lg:overflow-hidden mono-scroll">
      {/* Left Control Rail */}
      <aside className="w-full lg:w-[370px] xl:w-[410px] shrink-0 bg-[#0d0e11] border-b lg:border-b-0 lg:border-r border-zinc-800/90 p-4 sm:p-5 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-4">
          {/* Player Count Selector */}
          <section className="rounded-xl bg-[#131418] border border-zinc-800 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
                  Oyunçu Sayı (1 Cihaz)
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500">{playerCount} Nəfər</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
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
                    className={`h-12 rounded-lg font-display text-2xl font-extrabold tracking-wide border transition active:scale-95 ${
                      active
                        ? 'bg-white text-zinc-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
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
          <section className="rounded-xl bg-[#131418] border border-zinc-800 p-3.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 block mb-2.5">
              Qoşulma Rejimi
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg bg-zinc-900 border border-white/60 p-2.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-white text-zinc-950 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">1 Cihaz</div>
                  <div className="text-[11px] text-zinc-400 truncate">Eyni ekran</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  PartyAudio.play('hit');
                  onOpenOnline();
                }}
                className="rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 p-2.5 flex items-center gap-2.5 text-left transition active:scale-[0.98]"
              >
                <img
                  src="/src/assets/images/icon_online_globe_1794826058975.jpg"
                  alt="Onlayn"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-md object-cover border border-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Onlayn</span>
                    <Globe className="w-3 h-3 text-zinc-400" />
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">Otaq yarat/qoşul</div>
                </div>
              </button>
            </div>
          </section>

          {/* Quick Shop / Fighter Look Card */}
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onOpenShop();
            }}
            className="w-full rounded-xl bg-[#131418] hover:bg-[#181a20] border border-zinc-800 hover:border-zinc-600 p-3 flex items-center gap-3.5 text-left transition active:scale-[0.99] group"
          >
            <div className="w-[74px] h-[74px] rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
              <canvas ref={previewCanvasRef} width={148} height={148} className="w-full h-full block" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <img
                  src="/src/assets/images/icon_shop_armor_1794826057693.jpg"
                  alt="Qarderob"
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded object-cover border border-zinc-700"
                />
                <span className="font-display text-xl font-bold tracking-wide text-white">
                  QARDEROB &amp; MAĞAZA
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-snug">
                Geyim, papaq, klub forması və oyunçu rənglərini fərdiləşdir
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>

        {/* Analog Joystick Tip */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-zinc-400">
          <Sparkles className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>Joystiki yuxarı çəkib saxlayaraq hoppan, zərbə üçün burax.</span>
        </div>
      </aside>

      {/* Right Main Stage: Full-bleed Mode Selection */}
      <main className="flex-1 min-h-0 p-4 sm:p-6 flex flex-col gap-4 justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[340px] max-h-[680px]">
          {/* VS BATTLE CARD */}
          <button
            type="button"
            onClick={() => {
              PartyAudio.play('hit');
              onStartLocalVs();
            }}
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white/70 text-left flex flex-col justify-end p-5 sm:p-7 transition-all active:scale-[0.99] min-h-[220px]"
          >
            <img
              src="/src/assets/images/icon_vs_battle_1794826056916.jpg"
              alt="VS Döyüş"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Swords className="w-5 h-5 text-white" />
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-300">
                  25 Silah · 8 Yeni Xəritə
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
                VS DÖYÜŞ
              </h1>
              <p className="text-sm text-zinc-300 max-w-sm">
                Portallar, lazer qapıları, qalxan maqma və tikanlı mişarlı arenalarda tək və ya komanda qarşılaşması.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-white text-zinc-950 font-bold text-sm group-hover:px-5 transition-all">
                <span>Arena Seç</span>
                <ArrowRight className="w-4 h-4" />
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
            className="group relative rounded-2xl overflow-hidden bg-[#121317] border border-zinc-800 hover:border-white/70 text-left flex flex-col justify-end p-5 sm:p-7 transition-all active:scale-[0.99] min-h-[220px]"
          >
            <img
              src="/src/assets/images/icon_minigames_1794826057304.jpg"
              alt="Mini Oyunlar"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-300">
                  8 Təkmilləşdirilmiş Rejim
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
                MİNİ OYUNLAR
              </h2>
              <p className="text-sm text-zinc-300 max-w-sm">
                Sumo, Mini Futbol, Meteor Yağışı, İsti Bomba, Sürət Yarışı, Kral Taxtı, Sikkə və Qar Döyüşü.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-zinc-900/95 border border-white/60 text-white font-bold text-sm group-hover:bg-white group-hover:text-zinc-950 transition-all">
                <span>Oyunları Gör</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
