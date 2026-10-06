import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { NavOpts } from '../lib/router';
import { registerTransition } from '../lib/router';
import { finishWorldFade } from '../lib/world';

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

const FADE_IN_MS = 280;
const FADE_OUT_MS = 480;

/**
 * The page change.
 *
 * Where the browser can morph between two states of the page (the View
 * Transitions API), a project slides up over the home page like a sheet while
 * the home page sinks back under it, and the mark that was tapped flies into
 * its place on the new page. Going back reverses it. The browser animates
 * pictures of the two pages on the compositor, so none of it depends on how
 * busy the page is (index.css, "Page changes").
 *
 * Elsewhere, a wash of the destination's colour fades in, the page swaps
 * underneath, and the wash fades away once the new page has painted.
 */
export function Curtain() {
  const [colour, setColour] = useState<string | null>(null);
  const layer = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const swapRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    registerTransition((swap, opts) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || busy.current) {
        swap();
        return;
      }
      busy.current = true;
      const doc = document as ViewTransitionDoc;
      if (typeof doc.startViewTransition === 'function') {
        morph(doc, swap, opts).finally(() => {
          busy.current = false;
        });
        return;
      }
      swapRef.current = swap;
      setColour(opts.colour);
    });
    return () => registerTransition(null);
  }, []);

  // The fallback wash, once its layer is in the DOM.
  useEffect(() => {
    if (!colour) return;
    const l = layer.current;
    if (!l) return;
    let cancelled = false;

    const settle = () =>
      new Promise<void>((resolve) => {
        // Two frames for the new page to render and paint, then the first
        // quiet moment (or 300ms, whichever comes first) for its effects.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
              .requestIdleCallback;
            if (idle) idle(() => resolve(), { timeout: 300 });
            else window.setTimeout(resolve, 120);
          }),
        );
      });

    l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_IN_MS, easing: 'ease-out', fill: 'forwards' })
      .finished.then(async () => {
        if (cancelled) return;
        swapRef.current?.();
        swapRef.current = null;
        await settle();
        if (cancelled) return;
        await l.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FADE_OUT_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        }).finished;
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        busy.current = false;
        setColour(null);
      });

    return () => {
      cancelled = true;
    };
  }, [colour]);

  if (!colour) return null;
  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="fixed inset-0 z-[650]"
      style={{ background: colour, opacity: 0 }}
    />
  );
}

/**
 * One page change through the View Transitions API. The update runs inside
 * flushSync, so React has rendered the new page, scrolled it and painted it in
 * its colours (the pages do that in layout effects) before the browser takes
 * its picture of it.
 */
function morph(doc: ViewTransitionDoc, swap: () => void, opts: NavOpts): Promise<void> {
  const root = document.documentElement;
  const direction = opts.direction ?? 'forward';

  // The mark that was tapped, if it was one, flies to the new page's mark.
  let from: HTMLElement | null = null;
  let to: HTMLElement | null = null;
  if (direction === 'forward' && opts.morph && opts.x !== undefined && opts.y !== undefined) {
    const hit = document.elementFromPoint(opts.x, opts.y)?.closest<HTMLElement>('[data-vt-logo]');
    if (hit?.dataset.vtLogo === opts.morph) {
      from = hit;
      from.style.setProperty('view-transition-name', 'project-mark');
    }
  }

  root.dataset.vt = direction;
  const transition = doc.startViewTransition!(() => {
    flushSync(swap);
    finishWorldFade();
    if (!from) return;
    to = document.querySelector<HTMLElement>('[data-vt-target]');
    if (!to) return;
    to.style.setProperty('view-transition-name', 'project-mark');
    // The flight is its entrance; its own pop-in would play on top of it.
    to.getAnimations().forEach((a) => {
      try {
        a.finish();
      } catch {
        /* an endless animation cannot be finished; leave it */
      }
    });
  });

  return transition.finished
    .catch(() => {})
    .finally(() => {
      delete root.dataset.vt;
      from?.style.removeProperty('view-transition-name');
      to?.style.removeProperty('view-transition-name');
    });
}
