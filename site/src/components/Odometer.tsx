import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * One digit as a vertical reel.
 *
 * An invisible glyph sets the cell's width, so the reel is exactly as wide as
 * the typeface makes that character rather than a guessed em value. The moving
 * column is absolutely positioned on top of it and offset in whole cells.
 */
function Reel({ value, delay }: { value: number; delay: number }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setIndex(value);
      return;
    }
    // Land on the second pass of 0-9 so the reel spins a full turn first.
    const id = setTimeout(() => setIndex(value + 10), delay);
    return () => clearTimeout(id);
  }, [value, delay, reduced]);

  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-baseline">
      <span aria-hidden="true" className="invisible block leading-[1]">
        0
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[1700ms]"
        style={{
          transform: `translateY(calc(${-index} * 1em))`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {[...DIGITS, ...DIGITS].map((d, i) => (
          <span key={i} className="block h-[1em] leading-[1]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/** A number rendered as reels that spin up when scrolled into view. */
export function Odometer({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const digits = String(value).split('');

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      {digits.map((d, i) => (
        // Left digits settle first, the way a mechanical counter behaves.
        <Reel key={i} value={inView ? Number(d) : 0} delay={i * 120} />
      ))}
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
  );
}
