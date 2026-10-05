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
  /** Shown on the curtain while the page changes. */
  label?: string;
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

export function navigate(path: string, opts: NavOpts = { colour: '#110E1C' }): void {
  const next = parse(path);
  rememberHomeScroll();

  const swap = () => {
    window.history.pushState({ dm: true }, '', path + (opts.hash ? `#${opts.hash}` : ''));
    pendingHash = opts.hash ?? null;
    set(next);
  };

  if (runner) runner(swap, opts);
  else swap();
}

/** Where the home page should land after a page change, if anywhere specific. */
let pendingHash: string | null = null;
export function takePendingHash(): string | null {
  const h = pendingHash;
  pendingHash = null;
  return h;
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const next = parse(window.location.pathname);
    if (next.name === route.name && (next.name === 'home' || (route.name === 'work' && next.id === route.id))) return;
    rememberHomeScroll();
    const colour = next.name === 'work' ? (projects.find((p) => p.id === next.id)?.world.bg ?? '#110E1C') : '#FFF4E4';
    if (runner) runner(() => set(next), { colour });
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
