import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useRef } from 'react';
import type { ReactNode } from 'react';

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * A band of type that drifts on its own and is thrown along by the scroll:
 * flick the page and it races, scroll back and it reverses.
 */
export function VelocityBand({
  children,
  speed = 3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1000, 0, 1000], [-5, 0, 5], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-50, -25, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = direction.current * speed * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * f;
    base.set(base.get() + move);
  });

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ''}`}>
      <motion.div className="flex w-max flex-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/** Two bands crossing at an angle, like tape across a box. */
export function CrossedBands({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <div className="relative z-10 -my-6 overflow-hidden py-14 md:py-20">
      <div className="-mx-4 rotate-[-4deg] bg-accent py-3 text-bg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] md:py-4">
        <VelocityBand speed={2.4}>{top}</VelocityBand>
      </div>
      <div className="-mx-4 -mt-3 rotate-[3deg] bg-fg py-3 text-bg md:py-4">
        <VelocityBand speed={-2}>{bottom}</VelocityBand>
      </div>
    </div>
  );
}
