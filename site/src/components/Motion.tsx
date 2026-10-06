import { Fragment, createElement, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Reveals. Each component flips a data-shown flag the first time it scrolls
 * into view, and CSS in index.css does the moving with transform and opacity
 * transitions, which the compositor runs. Scrolling past a paragraph never
 * costs the main thread a frame.
 *
 * One IntersectionObserver per margin is shared by every reveal on the page.
 */
type Done = () => void;
const observers = new Map<string, { io: IntersectionObserver; cbs: Map<Element, Done> }>();

function observeOnce(el: Element, margin: string, cb: Done): () => void {
  let entry = observers.get(margin);
  if (!entry) {
    const cbs = new Map<Element, Done>();
    const io = new IntersectionObserver(
      (records) => {
        records.forEach((r) => {
          if (!r.isIntersecting) return;
          const done = cbs.get(r.target);
          cbs.delete(r.target);
          io.unobserve(r.target);
          done?.();
        });
      },
      { rootMargin: margin },
    );
    entry = { io, cbs };
    observers.set(margin, entry);
  }
  entry.cbs.set(el, cb);
  entry.io.observe(el);
  const e = entry;
  return () => {
    e.cbs.delete(el);
    e.io.unobserve(el);
  };
}

/** True from the first moment the element is on screen. */
export function useShown<T extends Element>(margin = '0px 0px -8% 0px', immediate = false) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      // Let the hidden state paint first, so the entrance actually plays.
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;
    return observeOnce(el, margin, () => setShown(true));
  }, [margin, immediate]);

  return [ref, shown] as const;
}

const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

/** Text that rises out from behind a mask. */
export function Mask({
  children,
  delay: d = 0,
  className,
  as = 'div',
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'p';
  /** Play on mount rather than on scroll, for anything above the fold. */
  immediate?: boolean;
}) {
  const [ref, shown] = useShown<HTMLElement>('0px 0px -8% 0px', immediate);
  return createElement(
    as,
    { ref, className: `rv-mask ${className ?? ''}`, 'data-shown': shown },
    <span className="rv-in" style={delay(d)}>
      {children}
    </span>,
  );
}

/**
 * A paragraph that fades up as it arrives. One element, not one per word:
 * every element on the page is restyled when the colour world changes, and a
 * span per word doubled the cost of that for no visible gain.
 */
export function Words({
  text,
  className,
  delay: d = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const [ref, shown] = useShown<HTMLSpanElement>('0px 0px -10% 0px');
  return (
    <span ref={ref} className={`rv-rise block ${className ?? ''}`} data-shown={shown} style={delay(d)}>
      {text}
    </span>
  );
}

/** A word whose letters tumble up into place, one after another. */
export function Letters({ text, className, delay: d = 0 }: { text: string; className?: string; delay?: number }) {
  const [ref, shown] = useShown<HTMLSpanElement>('0px 0px -12% 0px');
  let n = 0;

  return (
    <span ref={ref} className={`inline-block ${className ?? ''}`} data-shown={shown}>
      <span className="sr-only">{text}</span>
      {/* Grouped by word, so a long name wraps between words, never inside one. */}
      {text.split(' ').map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {word.split('').map((c, i) => (
              <span key={i} className="rv-word rv-letter">
                <span className="rv-in" style={delay(d + n++ * 0.035)}>
                  {c}
                </span>
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** Plain fade and lift, for anything that is not type. */
export function Rise({
  children,
  delay: d = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li';
}) {
  const [ref, shown] = useShown<HTMLElement>('0px 0px -8% 0px');
  return createElement(as, { ref, className: `rv-rise ${className ?? ''}`, 'data-shown': shown, style: delay(d) }, children);
}
