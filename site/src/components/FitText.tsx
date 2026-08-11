import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Sets a single line of text to exactly the width of its container.
 *
 * The masthead used to be sized with viewport units and a hand-tuned clamp,
 * which only holds if the typeface metrics and the user's text scaling are
 * exactly what the clamp assumed. They are not: a phone with larger system
 * text, or the fallback face before the webfont lands, pushes the line past the
 * screen edge and it gets cut.
 *
 * Measuring instead of guessing removes the whole class of bug. The line is
 * measured at a reference size, then scaled by the ratio the container needs,
 * and re-measured whenever the container resizes or the webfont finishes
 * loading.
 */
export function FitText({
  children,
  className,
  max = 260,
  style,
  ...rest
}: {
  children: string;
  className?: string;
  /** Ceiling in px, so the line cannot get absurd on an ultrawide display. */
  max?: number;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  const fit = useCallback(() => {
    const b = box.current;
    const l = line.current;
    if (!b || !l) return;

    const available = b.clientWidth;
    if (!available) return;

    const REFERENCE = 100;
    l.style.fontSize = `${REFERENCE}px`;
    const natural = l.scrollWidth;
    if (!natural) return;

    l.style.fontSize = `${Math.min((available / natural) * REFERENCE, max)}px`;
    setReady(true);
  }, [max]);

  useLayoutEffect(() => {
    fit();
  }, [fit, children]);

  useEffect(() => {
    const b = box.current;
    if (!b) return;

    const observer = new ResizeObserver(fit);
    observer.observe(b);

    // The fallback face measures differently from Syne, so measure again once
    // the real one has loaded.
    void document.fonts?.ready.then(fit);

    window.addEventListener('orientationchange', fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', fit);
    };
  }, [fit]);

  return (
    <div ref={box} className={className} style={style} {...rest}>
      <span
        ref={line}
        className="block whitespace-nowrap"
        style={{ visibility: ready ? 'visible' : 'hidden' }}
      >
        {children}
      </span>
    </div>
  );
}
