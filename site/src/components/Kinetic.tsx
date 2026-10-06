import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { onScrollFrame } from '../lib/scroll';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A word set to the full width of its container whose letters move through
 * the typeface's weight and width axes: they breathe on their own where there
 * is a mouse, swell under a finger on a phone, and scatter as the page
 * scrolls away.
 *
 * The size is measured with every letter at its widest and heaviest, which is
 * the most room the word can ever take, so the animation only ever pulls the
 * letters in and the line can never run off the edge of a phone.
 *
 * Built to be cheap: letter positions are measured once (and on resize), never
 * per frame; the entrance and the scroll scatter are CSS animations on the
 * compositor; and on a touchscreen the loop only runs while a finger is on
 * the glass, then stops.
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
    const natural = p.offsetWidth;
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
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Letter centres in page coordinates, from layout (offsets ignore the
    // entrance transforms), refreshed only when the box changes size.
    let centres: { x: number; y: number }[] = [];
    const measure = () => {
      const r = b.getBoundingClientRect();
      const ox = r.left;
      const oy = r.top + window.scrollY;
      centres = letters.current.map((el) =>
        el ? { x: ox + el.offsetLeft + el.offsetWidth / 2, y: oy + el.offsetTop + el.offsetHeight / 2 } : { x: 0, y: 0 },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(b);

    const pointer = { x: -9999, y: -9999, live: 0 };
    const state = chars.map(() => ({ w: 800, s: 100 }));
    const t0 = performance.now();
    // On a touchscreen, one slow wave plays after the entrance, then the
    // letters rest until touched.
    const waveUntil = fine ? Infinity : (delay + 1.2 + 2.6) * 1000;
    let frame = 0;
    let running = false;
    let visible = true;
    let skip = false;

    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const waving = now - t0 < waveUntil;
      pointer.live *= 0.95;

      // A phone draws the axes at half rate; the eye cannot tell, the GPU can.
      skip = !fine && !skip;
      let moving = waving || pointer.live > 0.01;
      const sigma = size * 0.9;
      const warm = Math.min(Math.max((t - delay - 0.9) / 1.2, 0), 1);
      const cool = fine ? 1 : Math.min(Math.max((waveUntil / 1000 - t) / 0.8, 0), 1);

      letters.current.forEach((el, i) => {
        if (!el) return;
        const c = centres[i];
        const d2 = c ? (c.x - pointer.x) ** 2 + (c.y - pointer.y) ** 2 : Infinity;
        const near = Math.exp(-d2 / (2 * sigma * sigma)) * pointer.live;
        const amp = waving ? warm * cool : 0;
        const waveW = 800 - 240 * amp * (0.5 + 0.5 * Math.sin(t * 1.5 + i * 0.75));
        const waveS = 100 - 16 * amp * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 0.9 + 1.3));
        // Under the finger the letter thins and narrows, so it reads as being pressed.
        const goalW = waveW - (waveW - 380) * near;
        const goalS = waveS - (waveS - 78) * near;

        const st = state[i];
        st.w += (goalW - st.w) * 0.14;
        st.s += (goalS - st.s) * 0.14;
        if (Math.abs(goalW - st.w) > 0.5 || Math.abs(goalS - st.s) > 0.05) moving = true;
        if (skip) return;
        // Quantised: each distinct weight and width is a new font instance to
        // shape and rasterise, so the letters move through a set of cached
        // steps rather than an endless run of new ones.
        const w = String(Math.round(st.w / 20) * 20);
        const sv = `${Math.round(st.s / 2) * 2}%`;
        if (el.style.fontWeight !== w) el.style.fontWeight = w;
        if (el.style.fontStretch !== sv) el.style.fontStretch = sv;
      });

      if (moving && visible) frame = requestAnimationFrame(loop);
      else running = false;
    };

    const start = () => {
      if (running || !visible) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    let pageY = 0;
    const unsubscribe = onScrollFrame((y) => (pageY = y));
    const onMove = (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y + pageY;
      pointer.live = 1;
      start();
    };
    const onPointer = (e: PointerEvent) => e.pointerType === 'mouse' && onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(b);
    start();

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
    };
    // chars is derived from text
  }, [reduced, still, size, text, delay]);

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
          <span
            key={i}
            className={still ? 'inline-block' : 'enter-letter'}
            style={{ '--d': `${delay + i * 0.05}s`, '--r': `${i % 2 ? 14 : -14}deg` } as CSSProperties}
          >
            <span
              ref={(el) => (letters.current[i] = el)}
              className={`inline-block ${scatter && !still ? 'sd-scatter' : ''}`}
              style={
                {
                  fontWeight: 800,
                  fontStretch: '100%',
                  '--sy': `${-(80 + ((i * 53) % 110))}px`,
                  '--sr': `${(i % 2 === 0 ? -1 : 1) * (8 + ((i * 29) % 26))}deg`,
                } as CSSProperties
              }
            >
              {c === ' ' ? '\u00A0' : c}
            </span>
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
  const box = useRef<HTMLSpanElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Only turns while someone can see it.
  useEffect(() => {
    if (reduced || !onScreen) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduced, onScreen]);

  return (
    <span
      ref={box}
      className={`relative inline-grid overflow-hidden align-baseline ${className ?? ''}`}
      style={{ perspective: 400 }}
    >
      {/* Reserve the width of the longest word so the line does not jump. */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
        {words.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>
      <span className="sr-only">{words.join(', ')}</span>
      {/* Both words share one grid cell, so the plain mode overlaps them
          without the layout measuring popLayout does. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          aria-hidden="true"
          className="col-start-1 row-start-1 whitespace-nowrap"
          style={{ color: colours[i % colours.length] }}
          initial={{ transform: 'translateY(100%) rotateX(-80deg)', opacity: 0 }}
          animate={{ transform: 'translateY(0%) rotateX(0deg)', opacity: 1 }}
          exit={{ transform: 'translateY(-100%) rotateX(80deg)', opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
