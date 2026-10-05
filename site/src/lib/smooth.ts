import Lenis from 'lenis';

/**
 * Inertial scrolling for mouse and trackpad.
 *
 * Touch keeps the phone's own scrolling: it is already smooth, and anything
 * that second-guesses a thumb feels wrong within one flick. Reduced motion
 * keeps native scrolling everywhere.
 */
let lenis: Lenis | null = null;

export function startSmoothScroll(): () => void {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return () => {};

  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
  let frame = 0;
  const loop = (t: number) => {
    lenis?.raf(t);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

export function pauseScroll(paused: boolean): void {
  if (!lenis) return;
  if (paused) lenis.stop();
  else lenis.start();
}

export function scrollToY(y: number, immediate = false): void {
  if (lenis) lenis.scrollTo(y, { immediate, force: true });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

export function scrollToId(id: string, immediate = false): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { immediate, force: true, offset: 0 });
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' });
}
