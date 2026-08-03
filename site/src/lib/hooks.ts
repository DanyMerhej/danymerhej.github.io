import { useEffect, useState, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'dm-theme';

/**
 * One theme value shared by every consumer. The nav and the command palette both
 * toggle it, so component-local state would let the two drift apart.
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
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.get, () => 'dark' as Theme);
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

/** True on devices with a real pointer, used to gate cursor and tilt effects. */
export function useFinePointer(): boolean {
  return useMediaQuery('(pointer: fine)');
}

/** Tracks which section is currently in view, for the nav indicator. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
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
