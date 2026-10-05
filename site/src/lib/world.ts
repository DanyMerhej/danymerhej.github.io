import { useEffect, useSyncExternalStore } from 'react';
import type { World } from '../data/site';
import { worlds } from '../data/site';

/**
 * The page's colour world.
 *
 * Every section claims a world (background, ink, accent) while it holds the
 * middle of the screen, and the whole page repaints to it: background, text,
 * buttons, the browser's own toolbar colour on a phone. The three values are
 * registered custom properties (see index.css), so the change is a cross-fade
 * rather than a snap.
 *
 * Claims are stacked rather than toggled. Two neighbouring sections both touch
 * the centre line for a moment at their boundary; the one that arrived last
 * wins, and when it leaves the other is still there underneath.
 */
const stack: { id: string; world: World }[] = [];
let base: World = worlds.night;
let current: World = base;
const listeners = new Set<() => void>();

function apply() {
  const next = stack[stack.length - 1]?.world ?? base;
  if (next === current && document.documentElement.style.getPropertyValue('--bg')) return;
  current = next;

  const root = document.documentElement.style;
  root.setProperty('--bg', next.bg);
  root.setProperty('--fg', next.fg);
  root.setProperty('--accent', next.accent);

  // The phone's toolbar follows along, which is half the fun on mobile.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', next.bg));

  listeners.forEach((l) => l());
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
    () => current,
    () => current,
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
