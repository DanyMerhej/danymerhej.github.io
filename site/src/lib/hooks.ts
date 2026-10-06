import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { World } from '../data/site';
import { pauseScroll } from './smooth';
import { observeWorld } from './world';

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

/**
 * Locks page scroll while an overlay is open. Counted, so two overlays at once
 * (the index over a project page, say) unlock only when the last one closes.
 */
let locks = 0;
let savedOverflow = '';

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    if (locks++ === 0) {
      savedOverflow = document.body.style.overflow;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
      pauseScroll(true);
    }
    return () => {
      if (--locks === 0) {
        document.body.style.overflow = savedOverflow;
        document.body.style.paddingRight = '';
        pauseScroll(false);
      }
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

/**
 * Paints the page in `world` while the element holds the middle of the screen.
 *
 * Stateless on purpose: the observer claims and releases the world directly,
 * so crossing a section boundary never re-renders the section.
 */
export function useWorld<T extends HTMLElement>(ref: React.RefObject<T>, id: string, world: World): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeWorld(el, id, world);
  }, [ref, id, world]);
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
const intro = {
  playing: (() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
      return true;
    }
  })(),
  listeners: new Set<() => void>(),
};

function finishIntro() {
  if (!intro.playing) return;
  intro.playing = false;
  try {
    sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    /* nothing to remember, it simply replays next time */
  }
  intro.listeners.forEach((l) => l());
}

/**
 * Whether the opening is on screen. A tiny shared store rather than a prop,
 * so its ending re-renders only what asks about it, not the whole page.
 */
export function useIntroPlaying(): boolean {
  return useSyncExternalStore(
    (l) => {
      intro.listeners.add(l);
      return () => intro.listeners.delete(l);
    },
    () => intro.playing,
    () => intro.playing,
  );
}

/** Read once, at mount: was the intro still running when this appeared? */
export function introIsPlaying(): boolean {
  return intro.playing;
}

export function useIntro(): [boolean, () => void] {
  const playing = useIntroPlaying();
  useScrollLock(playing);
  return [playing, finishIntro];
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
export function useOverlayHistory(open: boolean, close: () => void, layer?: React.RefObject<HTMLElement>): void {
  const closeRef = useRef(close);
  closeRef.current = close;
  const pushed = useRef(false);

  useEffect(() => {
    if (!open) return;
    layer?.current?.style.removeProperty('visibility');

    window.history.pushState({ dmOverlay: true }, '');
    pushed.current = true;

    const onPop = (e: PopStateEvent) => {
      pushed.current = false;
      // A back swipe the browser animated itself (from the left edge on a
      // phone) has already shown the page without the overlay. Its own
      // closing animation would then show it a second time, so it is hidden
      // this instant and closes out of sight.
      if ((e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition) {
        layer?.current?.style.setProperty('visibility', 'hidden');
      }
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
  }, [open, layer]);
}
