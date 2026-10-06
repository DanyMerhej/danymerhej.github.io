import { useEffect, useRef, useState } from 'react';
import { registerTransition } from '../lib/router';
import { inkOn } from '../lib/world';

type State = { colour: string; x: number; y: number; r: number; label?: string } | null;

const COVER_MS = 620;
const LIFT_MS = 700;

/**
 * The page change. A disc of the destination's colour grows out of the point
 * you tapped until it fills the screen, the page swaps underneath it, and the
 * colour lifts away upward.
 *
 * Both moves are transforms run by the compositor (Web Animations), so they
 * stay smooth while the main thread is busy. And it is busy: swapping pages
 * mounts a whole page. That happens while the screen is fully covered, and
 * the lift waits until the new page has painted and the browser reports a
 * quiet moment, so the heavy part is never on screen.
 */
export function Curtain() {
  const [state, setState] = useState<State>(null);
  const layer = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const swapRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    registerTransition((swap, opts) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || busy.current) {
        swap();
        return;
      }
      busy.current = true;
      swapRef.current = swap;
      const x = opts.x ?? window.innerWidth / 2;
      const y = opts.y ?? window.innerHeight / 2;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 24;
      setState({ colour: opts.colour, x, y, r, label: opts.label });
    });
    return () => registerTransition(null);
  }, []);

  // Runs once the layer for a new transition is in the DOM.
  useEffect(() => {
    if (!state) return;
    const l = layer.current;
    const d = disc.current;
    if (!l || !d) return;
    let cancelled = false;

    const cover = d.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
      duration: COVER_MS,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'forwards',
    });
    label.current?.animate(
      [
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 420, delay: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
    );

    const settle = () =>
      new Promise<void>((resolve) => {
        // Two frames for the new page to render and paint, then the first
        // quiet moment (or 450ms, whichever comes first) for its effects.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
              .requestIdleCallback;
            if (idle) idle(() => resolve(), { timeout: 450 });
            else window.setTimeout(resolve, 160);
          }),
        );
      });

    cover.finished
      .then(async () => {
        if (cancelled) return;
        swapRef.current?.();
        swapRef.current = null;
        await settle();
        if (cancelled) return;
        await l.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], {
          duration: LIFT_MS,
          easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
          fill: 'forwards',
        }).finished;
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        busy.current = false;
        setState(null);
      });

    return () => {
      cancelled = true;
    };
  }, [state]);

  if (!state) return null;

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="fixed inset-0 z-[650] overflow-hidden will-change-transform"
      style={{ color: inkOn(state.colour) }}
    >
      <div
        ref={disc}
        className="absolute rounded-full will-change-transform"
        style={{
          left: state.x - state.r,
          top: state.y - state.r,
          width: state.r * 2,
          height: state.r * 2,
          background: state.colour,
          transform: 'scale(0)',
        }}
      />
      {state.label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span ref={label} className="display px-6 text-center text-[clamp(2.6rem,13vw,7rem)]" style={{ opacity: 0 }}>
            {state.label}
          </span>
        </div>
      )}
    </div>
  );
}
