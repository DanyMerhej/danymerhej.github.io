import Lenis from 'lenis';
import { holdWorld } from './world';

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

/**
 * A programmatic smooth scroll holds the colour world until it lands, so a
 * jump across the page is one change of colour rather than one per section.
 */
function holdUntilLanded(): () => void {
  holdWorld(true);
  let done = false;
  const release = () => {
    if (done) return;
    done = true;
    window.removeEventListener('scrollend', release);
    window.clearTimeout(timer);
    holdWorld(false);
  };
  // Lenis reports its own landing; a native smooth scroll fires scrollend.
  if (!lenis) window.addEventListener('scrollend', release, { once: true });
  // Browsers without scrollend, or a scroll that never moves.
  const timer = window.setTimeout(release, lenis ? 3000 : 1600);
  return release;
}

export function scrollToY(y: number, immediate = false): void {
  if (immediate) {
    // The page may just have changed length (a page swap); let Lenis re-measure first.
    lenis?.resize();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'auto' });
    return;
  }
  const release = holdUntilLanded();
  if (lenis) lenis.scrollTo(y, { force: true, onComplete: release });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

export function scrollToId(id: string, immediate = false): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (immediate) {
    lenis?.resize();
    if (lenis) lenis.scrollTo(el, { immediate: true, force: true, offset: 0 });
    else el.scrollIntoView({ behavior: 'auto', block: 'start' });
    return;
  }
  const release = holdUntilLanded();
  if (lenis) lenis.scrollTo(el, { force: true, offset: 0, onComplete: release });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
