import { useSyncExternalStore } from 'react';
import { projects } from '../data/site';

/**
 * Two kinds of page: the home page, and one page per project at /work/<id>.
 *
 * Small enough that a router library would be most of the code. The publish
 * script writes a real /work/<id>/index.html for every project, so a shared
 * link opens straight onto the project with its own title and preview card,
 * and a 404.html catches anything else.
 */
export type Route = { name: 'home' } | { name: 'work'; id: string };

function parse(path: string): Route {
  const m = path.match(/^\/work\/([a-z0-9-]+)\/?$/);
  if (m && projects.some((p) => p.id === m[1])) return { name: 'work', id: m[1] };
  return { name: 'home' };
}

let route: Route = typeof window === 'undefined' ? { name: 'home' } : parse(window.location.pathname);
const listeners = new Set<() => void>();

function set(next: Route) {
  route = next;
  listeners.forEach((l) => l());
}

/**
 * A page change is covered by a transition: the curtain closes, the route
 * swaps underneath it, then it opens. The layer registers itself here; until it
 * has, changes simply happen.
 */
export interface NavOpts {
  colour: string;
  x?: number;
  y?: number;
  hash?: string;
  /**
   * Which way the change reads: a project opens over the home page
   * ('forward'), and the home page comes back out from under it ('back').
   */
  direction?: 'forward' | 'back';
  /** A project whose mark was tapped, to fly from where it was to its place on the new page. */
  morph?: string;
}

type Runner = (swap: () => void, opts: NavOpts) => void;
let runner: Runner | null = null;

export function registerTransition(r: Runner | null): void {
  runner = r;
}

const HOME_SCROLL = 'dm-home-scroll';

function rememberHomeScroll() {
  if (route.name !== 'home') return;
  try {
    sessionStorage.setItem(HOME_SCROLL, String(window.scrollY));
  } catch {
    /* nothing to restore later, which is fine */
  }
}

export function savedHomeScroll(): number | null {
  try {
    const v = sessionStorage.getItem(HOME_SCROLL);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

/*
 * History bookkeeping. Every entry this app pushes carries its position, so
 * "All work" can go back to the home entry it came from instead of piling a
 * new one on top (which made the phone's back gesture return to the project).
 */
let index = 0;
const pathAt = new Map<number, string>();

if (typeof window !== 'undefined') {
  // The app restores scroll itself, behind the curtain. Left to the browser,
  // the old page would jump to its saved position before being covered.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const state = history.state as { dmIndex?: number } | null;
  index = state?.dmIndex ?? 0;
  history.replaceState({ ...(state ?? {}), dmIndex: index }, '');
  pathAt.set(index, window.location.pathname);
}

export function navigate(path: string, opts: NavOpts = { colour: '#110E1C' }): void {
  const next = parse(path);
  rememberHomeScroll();

  const swap = () => {
    index += 1;
    pathAt.set(index, path);
    window.history.pushState({ dm: true, dmIndex: index }, '', path + (opts.hash ? `#${opts.hash}` : ''));
    pendingHash = opts.hash ?? null;
    set(next);
  };

  if (runner) runner(swap, opts);
  else swap();
}

/**
 * Leaves for `path` by going back when the previous entry is that page, so
 * the history reads the way the visitor moved; otherwise navigates forward.
 */
export function goBackTo(path: string, opts: NavOpts): void {
  const prev = pathAt.get(index - 1);
  if (prev !== undefined && parse(prev).name === parse(path).name && prev.replace(/\/$/, '') === path.replace(/\/$/, '')) {
    pendingPopOpts = opts;
    history.back();
  } else {
    navigate(path, opts);
  }
}

/** Where the home page should land after a page change, if anywhere specific. */
let pendingHash: string | null = null;
export function takePendingHash(): string | null {
  const h = pendingHash;
  pendingHash = null;
  return h;
}

/** The curtain's colour and origin for a back() this app started itself. */
let pendingPopOpts: NavOpts | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (e: PopStateEvent) => {
    const state = e.state as { dmIndex?: number } | null;
    if (typeof state?.dmIndex === 'number') index = state.dmIndex;
    const next = parse(window.location.pathname);
    if (next.name === route.name && (next.name === 'home' || (route.name === 'work' && next.id === route.id))) return;
    rememberHomeScroll();

    const opts: NavOpts = pendingPopOpts ?? {
      colour: next.name === 'work' ? (projects.find((p) => p.id === next.id)?.world.bg ?? '#110E1C') : '#FFF4E4',
      direction: next.name === 'work' ? 'forward' : 'back',
    };
    pendingPopOpts = null;
    // A swipe-back on a phone already animated the page away; a curtain on top
    // of that would be a second transition for the same gesture.
    const native = (e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition === true;
    if (runner && !native) runner(() => set(next), opts);
    else set(next);
  });
}

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => route,
    () => route,
  );
}

export function workPath(id: string): string {
  return `/work/${id}/`;
}
