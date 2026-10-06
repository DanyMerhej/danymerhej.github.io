import { animate, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { profile, projects, worlds } from '../data/site';

/**
 * The opening: a counter runs to 100 while every product's mark pops into a
 * ring around it, then the whole sheet lifts away on a curved edge to reveal
 * the page. Plays once per session, ends itself, and never traps anyone.
 */
export function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) {
      const id = setTimeout(onDone, 50);
      return () => clearTimeout(id);
    }
    const c = animate(0, 100, {
      duration: 1.6,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, '0');
      },
    });
    const id = setTimeout(onDone, 2000);
    return () => {
      c.stop();
      clearTimeout(id);
    };
  }, [onDone, reduced]);

  if (reduced) return null;

  const n = projects.length;

  return (
    <motion.div
      className="fixed inset-0 z-[700] flex items-center justify-center"
      aria-hidden="true"
      initial={{ transform: 'translateY(0%)' }}
      exit={{ transform: 'translateY(-100%)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      style={{ background: worlds.night.bg, color: worlds.night.fg }}
    >
      {/* The curved trailing edge, so the sheet lifts like a page rather than a blind. */}
      <motion.svg
        className="absolute left-0 top-full h-[18vh] w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={{ scaleY: 0 }}
        exit={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        style={{ originY: 0 }}
      >
        <path d="M0 0 Q50 100 100 0 Z" fill={worlds.night.bg} />
      </motion.svg>

      <div className="relative flex h-[min(80vw,420px)] w-[min(80vw,420px)] items-center justify-center">
        {projects.map((p, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={p.id}
              className="enter-pop absolute flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl sm:h-14 sm:w-14"
              style={
                {
                  left: `calc(50% + ${Math.cos(a) * 42}% - 1.5rem)`,
                  top: `calc(50% + ${Math.sin(a) * 42}% - 1.5rem)`,
                  background: 'linear-gradient(150deg, #1D1B24, #0B0A10)',
                  boxShadow: `0 0 0 2px ${p.hues[0]}66, 0 10px 30px -8px ${p.hues[0]}`,
                  '--d': `${0.1 + i * 0.12}s`,
                } as CSSProperties
              }
            >
              <img src={p.logo} alt="" width={64} height={64} className="h-full w-full object-contain p-1.5" />
            </span>
          );
        })}

        <div className="text-center">
          <span ref={counter} className="display block text-[clamp(4.5rem,24vw,9rem)] tabular-nums leading-none">
            000
          </span>
          <motion.span
            className="mt-2 block text-[15px] font-medium opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.3 }}
          >
            {profile.name} · warming up
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
