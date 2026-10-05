import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { registerTransition } from '../lib/router';
import { inkOn } from '../lib/world';

type State = { colour: string; x: number; y: number; label?: string; key: number } | null;

/**
 * The page change. A disc of the destination's colour grows out of the point
 * you tapped until it fills the screen, the page swaps underneath it, and the
 * colour lifts away upward. Reduced motion swaps instantly.
 */
export function Curtain() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<State>(null);
  const [lifting, setLifting] = useState(false);
  const pending = useRef<(() => void) | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    registerTransition((swap, opts) => {
      if (reduced || busy.current) {
        swap();
        return;
      }
      busy.current = true;
      pending.current = swap;
      setLifting(false);
      setState({
        colour: opts.colour,
        x: opts.x ?? window.innerWidth / 2,
        y: opts.y ?? window.innerHeight / 2,
        label: opts.label,
        key: Date.now(),
      });
    });
    return () => registerTransition(null);
  }, [reduced]);

  const covered = () => {
    pending.current?.();
    pending.current = null;
    // Give the new page a frame to lay out before lifting.
    requestAnimationFrame(() => requestAnimationFrame(() => setLifting(true)));
  };

  const lifted = () => {
    setState(null);
    setLifting(false);
    busy.current = false;
  };

  const r = state ? Math.hypot(Math.max(state.x, window.innerWidth - state.x), Math.max(state.y, window.innerHeight - state.y)) : 0;

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key={state.key}
          aria-hidden="true"
          className="pointer-events-auto fixed inset-0 z-[650] flex items-center justify-center"
          style={{ background: state.colour, color: inkOn(state.colour) }}
          initial={{ clipPath: `circle(0px at ${state.x}px ${state.y}px)`, y: '0%' }}
          animate={
            lifting
              ? { clipPath: `circle(${r + 40}px at ${state.x}px ${state.y}px)`, y: '-100%' }
              : { clipPath: `circle(${r + 40}px at ${state.x}px ${state.y}px)`, y: '0%' }
          }
          transition={
            lifting
              ? { y: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }
              : { clipPath: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } }
          }
          onAnimationComplete={() => (lifting ? lifted() : covered())}
        >
          {state.label && (
            <motion.span
              className="display px-6 text-center text-[clamp(2.6rem,13vw,7rem)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {state.label}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
