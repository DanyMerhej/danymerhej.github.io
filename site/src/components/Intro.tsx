import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { profile } from '../data/site';

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The opening curtain. Counts the six products up, then splits and clears the
 * screen. Plays once per session and self-dismisses, so it can never trap a
 * visitor behind it.
 */
export function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(onDone, reduced ? 200 : 2050);
    return () => clearTimeout(id);
  }, [onDone, reduced]);

  if (reduced) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[300]"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.75 } }}
    >
      {/* Two panels that part like a shutter. */}
      {[0, 1].map((half) => (
        <motion.div
          key={half}
          className="absolute inset-x-0 h-1/2 bg-paper"
          style={half === 0 ? { top: 0 } : { bottom: 0 }}
          initial={{ y: 0 }}
          exit={{ y: half === 0 ? '-100%' : '100%' }}
          transition={{ duration: 0.95, ease: EASE }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          className="text-center"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <div className="overflow-hidden">
            <motion.p
              className="display text-[13vw] leading-none sm:text-[9vw]"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              {profile.name}
            </motion.p>
          </div>

          <motion.div
            className="mx-auto mt-6 h-px bg-ink"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.p
            className="label mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            Portfolio, {new Date().getFullYear()}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
