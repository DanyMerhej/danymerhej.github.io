import { useEffect, useSyncExternalStore } from 'react';
import type { World } from '../data/site';
import { worlds } from '../data/site';

/**
 * The page's colour world.
 *
 * Every section claims a world (background, ink, accent) while it holds the
 * middle of the screen, and the whole page repaints to it: background, text,
 * buttons, the browser's own toolbar colour on a phone.
 *
 * The change is built to cost one style pass, not one per frame. The three
 * variables switch together in a single step; the background change is
 * softened by a fixed layer behind the content, painted in the old colour and
 * faded out on the compositor.
 *
 * While the page is being scrolled for you (a jump from the dock or the
 * index), worlds are held: passing through six sections would otherwise mean
 * six full repaints on the way. The destination's world is applied on arrival.
 *
 * Claims are stacked rather than toggled. Two neighbouring sections both touch
 * the centre line for a moment at their boundary; the one that arrived last
 * wins, and when it leaves the other is still there underneath.
 */
const stack: { id: string; world: World }[] = [];
let base: World = worlds.night;
let current: World | null = null;
const listeners = new Set<() => void>();

const FADE_MS = 450;
let fade: HTMLDivElement | null = null;
let fading: Animation | null = null;
let held = false;

function fadeLayer(): HTMLDivElement {
  if (fade && fade.isConnected) return fade;
  fade = document.createElement('div');
  fade.setAttribute('aria-hidden', 'true');
  // Behind every in-flow element, above the page background.
  fade.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0;will-change:opacity';
  document.body.prepend(fade);
  return fade;
}

function apply() {
  if (held) return;
  const next = stack[stack.length - 1]?.world ?? base;
  if (next === current) return;
  const prev = current;
  current = next;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prev && !reduced) {
    const layer = fadeLayer();
    // Cancel through the handle: element.getAnimations() would force a style
    // recalculation of the whole page just to find it.
    fading?.cancel();
    layer.style.background = prev.bg;
    fading = layer.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: FADE_MS,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    });
  }

  const root = document.documentElement.style;
  root.setProperty('--bg', next.bg);
  root.setProperty('--fg', next.fg);
  root.setProperty('--accent', next.accent);

  // The phone's toolbar follows along, which is half the fun on mobile.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', next.bg));

  listeners.forEach((l) => l());
}

/**
 * Jumps the background cross-fade to its end. A page transition already
 * animates from one page to the other, so the fade would only play a second
 * colour change inside it.
 */
export function finishWorldFade(): void {
  fading?.finish();
}

/** Holds the current world while the page is scrolled programmatically. */
export function holdWorld(on: boolean): void {
  held = on;
  if (!on) apply();
}

export function claimWorld(id: string, world: World): () => void {
  stack.push({ id, world });
  apply();
  return () => {
    const i = stack.findIndex((c) => c.id === id);
    if (i !== -1) stack.splice(i, 1);
    apply();
  };
}

/*
 * Sections that claim a world while they cross the middle of the screen.
 * Normally an IntersectionObserver keeps each claim up to date; the registry
 * exists so a page change can settle every claim at once, before the browser
 * takes its picture of the new page, rather than a frame later.
 */
const sections = new Map<Element, (inside: boolean) => void>();

/** Claims `world` for as long as `el` crosses the centre line. Returns the cleanup. */
export function observeWorld(el: Element, id: string, world: World): () => void {
  let release: (() => void) | null = null;
  const sync = (inside: boolean) => {
    if (inside && !release) release = claimWorld(id, world);
    else if (!inside && release) {
      release();
      release = null;
    }
  };
  sections.set(el, sync);
  const io = new IntersectionObserver(([e]) => sync(e.isIntersecting), { rootMargin: '-49% 0px -49% 0px' });
  io.observe(el);
  return () => {
    io.disconnect();
    sections.delete(el);
    sync(false);
  };
}

/** Brings every claim up to date now, from layout. Used once per page change. */
export function settleWorlds(): void {
  const mid = window.innerHeight / 2;
  sections.forEach((sync, el) => {
    const r = el.getBoundingClientRect();
    sync(r.height > 0 && r.top <= mid && r.bottom >= mid);
  });
}

/** The world shown when nothing claims the centre, e.g. a page's own colour. */
export function setBaseWorld(world: World): void {
  base = world;
  apply();
}

export function useWorldClaim(id: string, world: World, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return claimWorld(id, world);
  }, [id, world, active]);
}

export function useCurrentWorld(): World {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current ?? base,
    () => current ?? base,
  );
}

/** '#C6F94E' -> [198, 249, 78] */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Relative luminance, for picking ink that stays legible on a hue. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark or light ink, whichever reads better on the given colour. */
export function inkOn(hex: string): string {
  return luminance(hex) > 0.36 ? '#14101F' : '#FFF8EE';
}
