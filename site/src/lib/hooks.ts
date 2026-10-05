import { useCallback, useEffect, useRef, useState } from 'react';
import type { World } from '../data/site';
import { pauseScroll } from './smooth';
import { useWorldClaim } from './world';

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
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/** Locks page scroll while an overlay is open. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    pauseScroll(true);
    return () => {
      document.body.style.overflow = previous;
      document.body.style.paddingRight = '';
      pauseScroll(false);
    };
  }, [locked]);
}

/* ------------------------------------------------------------------ */
/* Viewport observation                                                */
/* ------------------------------------------------------------------ */

/** True while the element crosses the band in the middle of the viewport. */
export function useInCentre<T extends HTMLElement>(
  ref: React.RefObject<T>,
  margin = '-49% 0px -49% 0px',
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

/** True while any part of the element is on screen (plus a margin), for pausing loops. */
export function useOnScreen<T extends Element>(ref: React.RefObject<T>, margin = '120px'): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), {
      rootMargin: margin,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);

  return on;
}

/** Paints the page in `world` while the element holds the middle of the screen. */
export function useWorld<T extends HTMLElement>(ref: React.RefObject<T>, id: string, world: World): boolean {
  const centred = useInCentre(ref);
  useWorldClaim(id, world, centred);
  return centred;
}

/** Tracks which registered section is currently in view. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-49% 0px -49% 0px' },
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
 * The opening loader plays once per browser session. Coming back from a
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

/**
 * Makes an overlay behave like a page for the device back button.
 *
 * Without this, opening the index changes React state only. The browser has no
 * idea anything happened, so Android's back gesture leaves the site altogether
 * while the overlay is still on screen. Pushing a history entry on open, and
 * closing on popstate, makes back mean "close this" the way a visitor expects.
 *
 * `close` is held in a ref so an inline arrow function in the parent cannot
 * retrigger the effect and stack up duplicate history entries.
 */
export function useOverlayHistory(open: boolean, close: () => void): void {
  const closeRef = useRef(close);
  closeRef.current = close;
  const pushed = useRef(false);

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ dmOverlay: true }, '');
    pushed.current = true;

    const onPop = () => {
      pushed.current = false;
      closeRef.current();
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (pushed.current) {
        pushed.current = false;
        window.history.back();
      }
    };
  }, [open]);
}
