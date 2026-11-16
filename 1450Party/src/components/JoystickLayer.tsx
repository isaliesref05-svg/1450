import { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { inputPlayers, PLAYER_COLORS, PLAYER_NAMES } from '../game/types';

interface JoystickLayerProps {
  playerCount: number;
  onlineMode: boolean;
  playerColors: string[];
}

interface StickState {
  id: number | string | null;
  x: number;
  y: number;
  cx: number;
  cy: number;
}

const MAX_DIST = 34;

export function JoystickLayer({ playerCount, onlineMode, playerColors }: JoystickLayerProps) {
  const visibleIndices = onlineMode
    ? [0]
    : playerCount === 2
      ? [0, 1]
      : playerCount === 3
        ? [0, 1, 2]
        : [0, 1, 2, 3];

  const baseRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const knobRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const jumpIndRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const statesRef = useRef<StickState[]>([
    { id: null, x: 0, y: 0, cx: 0, cy: 0 },
    { id: null, x: 0, y: 0, cx: 0, cy: 0 },
    { id: null, x: 0, y: 0, cx: 0, cy: 0 },
    { id: null, x: 0, y: 0, cx: 0, cy: 0 },
  ]);

  useEffect(() => {
    const updateStick = (idx: number, clientX: number, clientY: number) => {
      const s = statesRef.current[idx];
      let dx = clientX - s.cx;
      let dy = clientY - s.cy;
      const dist = Math.hypot(dx, dy);
      if (dist > MAX_DIST) {
        dx = (dx / dist) * MAX_DIST;
        dy = (dy / dist) * MAX_DIST;
      }
      s.x = dx / MAX_DIST;
      s.y = dy / MAX_DIST;

      const knob = knobRefs.current[idx];
      if (knob) {
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      const inp = inputPlayers[idx];
      const mag = Math.hypot(s.x, s.y);
      const isJumpUp = s.y < -0.42;
      if (mag > 0.12) {
        inp.x = s.x;
        inp.y = s.y;
        inp.action = true;
        inp.jump = isJumpUp;
        inp.auto = false;
        inp.releaseX = s.x;
        inp.releaseY = s.y;
      } else {
        inp.x = 0;
        inp.y = 0;
        inp.action = false;
        inp.jump = false;
      }

      const jumpInd = jumpIndRefs.current[idx];
      if (jumpInd) {
        jumpInd.style.opacity = isJumpUp ? '1' : '0.32';
        jumpInd.style.transform = isJumpUp ? 'translateY(-3px) scale(1.15)' : 'translateY(0) scale(1)';
      }
    };

    const releaseStick = (idx: number) => {
      const s = statesRef.current[idx];
      if (s.id === null) return;
      s.id = null;

      const inp = inputPlayers[idx];
      const hadPull = Math.hypot(s.x, s.y) > 0.24;
      if (hadPull) {
        inp.releaseAction = true;
        inp.releaseX = s.x;
        inp.releaseY = s.y;
      }
      s.x = 0;
      s.y = 0;
      inp.x = 0;
      inp.y = 0;
      inp.action = false;
      inp.jump = false;

      const knob = knobRefs.current[idx];
      if (knob) knob.style.transform = 'translate(0px, 0px)';
      const base = baseRefs.current[idx];
      if (base) base.style.borderColor = '';
      const jumpInd = jumpIndRefs.current[idx];
      if (jumpInd) {
        jumpInd.style.opacity = '0.32';
        jumpInd.style.transform = 'translateY(0) scale(1)';
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button')) return;
      for (let tIdx = 0; tIdx < e.changedTouches.length; tIdx++) {
        const touch = e.changedTouches[tIdx];
        const el = (touch.target as HTMLElement | null)?.closest('[data-stick-idx]') as HTMLElement | null;
        if (!el) continue;
        const idx = Number(el.dataset.stickIdx);
        if (!Number.isInteger(idx) || statesRef.current[idx].id !== null) continue;
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        statesRef.current[idx].id = touch.identifier;
        statesRef.current[idx].cx = rect.left + rect.width / 2;
        statesRef.current[idx].cy = rect.top + rect.height / 2;
        el.style.borderColor = '#ffffff';
        updateStick(idx, touch.clientX, touch.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      let moved = false;
      for (let tIdx = 0; tIdx < e.changedTouches.length; tIdx++) {
        const touch = e.changedTouches[tIdx];
        for (let idx = 0; idx < 4; idx++) {
          if (statesRef.current[idx].id === touch.identifier) {
            moved = true;
            updateStick(idx, touch.clientX, touch.clientY);
          }
        }
      }
      if (moved) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let tIdx = 0; tIdx < e.changedTouches.length; tIdx++) {
        const touch = e.changedTouches[tIdx];
        for (let idx = 0; idx < 4; idx++) {
          if (statesRef.current[idx].id === touch.identifier) {
            releaseStick(idx);
          }
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('[data-stick-idx]') as HTMLElement | null;
      if (!el) return;
      const idx = Number(el.dataset.stickIdx);
      if (!Number.isInteger(idx) || statesRef.current[idx].id !== null) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      statesRef.current[idx].id = 'mouse';
      statesRef.current[idx].cx = rect.left + rect.width / 2;
      statesRef.current[idx].cy = rect.top + rect.height / 2;
      el.style.borderColor = '#ffffff';
      updateStick(idx, e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      for (let idx = 0; idx < 4; idx++) {
        if (statesRef.current[idx].id === 'mouse') {
          updateStick(idx, e.clientX, e.clientY);
        }
      }
    };

    const onMouseUp = () => {
      for (let idx = 0; idx < 4; idx++) {
        if (statesRef.current[idx].id === 'mouse') {
          releaseStick(idx);
        }
      }
    };

    const clearAll = () => {
      for (let idx = 0; idx < 4; idx++) releaseStick(idx);
    };

    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    document.addEventListener('touchcancel', onTouchEnd, { passive: false });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', clearAll);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', clearAll);
      clearAll();
    };
  }, [playerCount, onlineMode]);

  const cornerClass = (idx: number) => {
    if (onlineMode) return 'bottom-3 left-3 sm:bottom-5 sm:left-5';
    if (idx === 0) return 'bottom-2.5 left-2.5 sm:bottom-5 sm:left-5';
    if (idx === 1) return 'bottom-2.5 right-2.5 sm:bottom-5 sm:right-5';
    if (idx === 2) return 'top-12 left-2.5 sm:top-16 sm:left-5';
    return 'top-12 right-2.5 sm:top-16 sm:right-5';
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none">
      {visibleIndices.map((idx) => {
        const col = playerColors[idx] || PLAYER_COLORS[idx] || '#3b82f6';
        return (
          <div
            key={idx}
            className={`pointer-events-auto fixed ${cornerClass(idx)} flex flex-col items-center gap-1 touch-none`}
          >
            <div
              ref={(el) => {
                baseRefs.current[idx] = el;
              }}
              data-stick-idx={idx}
              className="relative w-[84px] h-[84px] sm:w-[98px] sm:h-[98px] lg:w-[112px] lg:h-[112px] rounded-full bg-zinc-950/65 backdrop-blur-md border-2 border-zinc-500/45 shadow-[0_8px_28px_rgba(0,0,0,0.65)] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing transition-colors"
            >
              {/* Upward jump indicator */}
              <div
                ref={(el) => {
                  jumpIndRefs.current[idx] = el;
                }}
                className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 text-white/80 transition-all duration-100"
                style={{ opacity: 0.32 }}
              >
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>

              {/* Subtle crosshairs */}
              <div className="pointer-events-none absolute inset-3.5 rounded-full border border-white/10" />

              {/* Inner Knob */}
              <div
                ref={(el) => {
                  knobRefs.current[idx] = el;
                }}
                className="pointer-events-none w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-white/90 shadow-lg flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #ffffff, ${col} 70%)`,
                  boxShadow: `0 0 18px ${col}66, inset 0 1px 2px rgba(255,255,255,0.6)`,
                }}
              >
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white drop-shadow">
                  {onlineMode ? 'SİZ' : `P${idx + 1}`}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-950/75 border border-zinc-800 text-[9px] sm:text-[10px] font-semibold text-zinc-300 tracking-wide">
              {onlineMode ? 'Yuxarı = Hoppan · Burax = Zərbə' : PLAYER_NAMES[idx] || `P${idx + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
