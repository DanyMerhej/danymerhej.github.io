import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'dm-theme';

/**
 * One theme value shared by every consumer, so the header and the menu can
 * never drift apart.
 */
const themeStore = {
  listeners: new Set<() => void>(),

  get(): Theme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },

  subscribe(listener: () => void) {
    themeStore.listeners.add(listener);
    return () => themeStore.listeners.delete(listener);
  },

  toggle() {
    const next: Theme = themeStore.get() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.classList.toggle('light', next === 'light');
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode; the class is still applied */
    }
    themeStore.listeners.forEach((l) => l());
  },
};

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.get, () => 'light' as Theme);
  return [theme, themeStore.toggle];
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True on devices with a real pointer, used to gate hover-only flourishes. */
export function useFinePointer(): boolean {
  return useMediaQuery('(pointer: fine)');
}

/** Locks body scroll while an overlay is open. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = previous;
      document.body.style.paddingRight = '';
    };
  }, [locked]);
}

/* ------------------------------------------------------------------ */
/* Chapter colour                                                      */
/* ------------------------------------------------------------------ */

const INK_LIGHT = '18 17 15';
const INK_DARK = '243 240 233';

/** '#C6F94E' -> '198 249 78', the form CSS custom properties want. */
export function hexToTriple(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Drives the page's `--hue`. Each chapter claims the colour while it owns the
 * viewport; when none does, the page falls back to ink.
 *
 * Claims are stacked rather than toggled, so two chapters overlapping mid
 * scroll cannot leave the page stuck on the colour of the one that left last.
 */
const hueStack: { id: string; triple: string }[] = [];

function applyHue() {
  const top = hueStack[hueStack.length - 1];
  const fallback = document.documentElement.classList.contains('dark') ? INK_DARK : INK_LIGHT;
  document.documentElement.style.setProperty('--hue', top ? top.triple : fallback);
}

export function useHueClaim(id: string, hex: string, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const triple = hexToTriple(hex);
    hueStack.push({ id, triple });
    applyHue();
    return () => {
      const i = hueStack.findIndex((c) => c.id === id);
      if (i !== -1) hueStack.splice(i, 1);
      applyHue();
    };
  }, [id, hex, active]);
}

/** Re-applies the ink fallback when the theme flips with no chapter in view. */
export function useHueThemeSync(theme: Theme): void {
  useEffect(() => {
    applyHue();
  }, [theme]);
}

/* ------------------------------------------------------------------ */
/* Viewport observation                                                */
/* ------------------------------------------------------------------ */

/** True while the element covers the middle band of the viewport. */
export function useInCentre<T extends HTMLElement>(
  ref: React.RefObject<T>,
  margin = '-45% 0px -45% 0px',
): boolean {
  const [inside, setInside] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInside(entry.isIntersecting), {
      rootMargin: margin,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);

  return inside;
}

/** Tracks which registered section is currently in view. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.2, 0.5, 1] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* ------------------------------------------------------------------ */
/* Intro                                                               */
/* ------------------------------------------------------------------ */

const INTRO_KEY = 'dm-intro-seen';

/**
 * The opening curtain plays once per browser session. Coming back from a
 * project link should not replay it.
 */
export function useIntro(): [boolean, () => void] {
  const [playing, setPlaying] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const finish = useCallback(() => {
    setPlaying(false);
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* nothing to remember, it simply replays next time */
    }
  }, []);

  useScrollLock(playing);
  return [playing, finish];
}

/** Value that lags behind the source, for readouts that should feel mechanical. */
export function useDebounced<T>(value: T, ms: number): T {
  const [held, setHeld] = useState(value);
  const timer = useRef<number>();

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHeld(value), ms);
    return () => window.clearTimeout(timer.current);
  }, [value, ms]);

  return held;
}
