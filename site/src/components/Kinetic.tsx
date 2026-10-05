import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A word set to the full width of its container whose letters keep breathing
 * through the typeface's weight and width axes. Letters swell toward a finger
 * or cursor, and scatter as the page scrolls away.
 *
 * The size is measured with every letter at its widest and heaviest, which is
 * the most room the word can ever take, so the animation only ever pulls the
 * letters in and the line can never run off the edge of a phone.
 */
export function KineticWord({
  text,
  className,
  delay = 0,
  max = 240,
  scatter = true,
  still = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  max?: number;
  scatter?: boolean;
  /** Measure and lay out only: a placeholder the same size as the live word. */
  still?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const [size, setSize] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const chars = text.split('');

  const fit = useCallback(() => {
    const b = box.current;
    const p = probe.current;
    if (!b || !p) return;
    const natural = p.getBoundingClientRect().width;
    if (!natural || !b.clientWidth) return;
    setSize(Math.min((b.clientWidth / natural) * 100, max));
  }, [max]);

  useLayoutEffect(fit, [fit, text]);

  useEffect(() => {
    const b = box.current;
    if (!b) return;
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [fit]);

  useEffect(() => {
    if (reduced || still || size === null) return;
    const b = box.current;
    if (!b) return;

    const pointer = { x: -9999, y: -9999, live: 0 };
    const onMove = (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
      pointer.live = 1;
    };
    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(b);

    const state = chars.map(() => ({ w: 800, s: 100 }));
    let frame = 0;
    const t0 = performance.now();

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      const t = (now - t0) / 1000;
      pointer.live *= 0.985;
      const sigma = size * 0.9;
      const boxRect = b.getBoundingClientRect();
      const lift = scatter ? Math.min(Math.max(-boxRect.top / window.innerHeight, 0), 1.2) : 0;

      // Read every position first, then write, so the frame lays out once.
      const rects = letters.current.map((el) => el?.getBoundingClientRect());

      letters.current.forEach((el, i) => {
        const r = rects[i];
        if (!el || !r) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d2 = (cx - pointer.x) ** 2 + (cy - pointer.y) ** 2;
        const near = Math.exp(-d2 / (2 * sigma * sigma)) * pointer.live;

        // Settle in from the entrance before the wave takes over.
        const warm = Math.min(Math.max((t - delay - 0.6) / 1.2, 0), 1);
        const waveW = 560 + 230 * Math.sin(t * 1.5 + i * 0.75);
        const waveS = 86 + 14 * Math.sin(t * 1.1 + i * 0.9 + 1.3);
        const goalW = 800 + (waveW + (800 - waveW) * near - 800) * warm;
        const goalS = 100 + (waveS + (100 - waveS) * near - 100) * warm;

        const st = state[i];
        st.w += (goalW - st.w) * 0.12;
        st.s += (goalS - st.s) * 0.12;
        el.style.fontWeight = st.w.toFixed(0);
        el.style.fontStretch = `${st.s.toFixed(1)}%`;

        if (lift > 0) {
          const dir = i % 2 === 0 ? -1 : 1;
          const y = -lift * (80 + ((i * 53) % 110));
          const rot = lift * dir * (8 + ((i * 29) % 26));
          el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
        } else if (el.style.transform) {
          el.style.transform = '';
        }
      });
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [reduced, still, size, text, delay, scatter]);

  return (
    <div ref={box} className={`relative ${className ?? ''}`}>
      {/* Measuring copy: widest, heaviest setting of every letter. */}
      <span
        ref={probe}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap"
        style={{ fontSize: 100, fontWeight: 800, fontStretch: '100%' }}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className="block whitespace-nowrap"
        style={{ fontSize: size ?? undefined, visibility: size === null || still ? 'hidden' : 'visible' }}
      >
        {chars.map((c, i) => (
          <span key={i} className="inline-block align-bottom">
            <motion.span
              className="inline-block"
              initial={still ? false : reduced ? { opacity: 0 } : { y: '115%', rotate: i % 2 ? 14 : -14, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: delay + i * 0.05, ease: EASE }}
            >
              <span
                ref={(el) => (letters.current[i] = el)}
                className="inline-block will-change-transform"
                style={{ fontWeight: 800, fontStretch: '100%' }}
              >
                {c === ' ' ? ' ' : c}
              </span>
            </motion.span>
          </span>
        ))}
      </span>
    </div>
  );
}

/** A word that keeps being replaced, each arriving in its own colour. */
export function RotatingWord({
  words,
  colours,
  interval = 2200,
  className,
}: {
  words: string[];
  colours: string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduced]);

  return (
    <span className={`relative inline-grid overflow-hidden align-baseline ${className ?? ''}`} style={{ perspective: 400 }}>
      {/* Reserve the width of the longest word so the line does not jump. */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
        {words.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>
      <span className="sr-only">{words.join(', ')}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={words[i]}
          aria-hidden="true"
          className="col-start-1 row-start-1 whitespace-nowrap"
          style={{ color: colours[i % colours.length] }}
          initial={{ y: '100%', rotateX: -80, opacity: 0 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          exit={{ y: '-100%', rotateX: 80, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
