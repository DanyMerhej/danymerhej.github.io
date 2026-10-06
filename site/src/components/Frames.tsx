import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useOnScreen } from '../lib/hooks';

/** A phone, drawn in CSS: a dark bezel, an island, and a screen for anything. */
export function Phone({
  children,
  className,
  glow,
  status,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  /**
   * A screenshot to draw a status bar for. Screenshots start at the very top
   * of the page, which on a real phone sits below the clock and the island;
   * without the bar, the site's own header ran into the island.
   */
  status?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/19] w-[min(72vw,300px)] rounded-[2.6rem] bg-[#0B0A10] p-[10px] ${className ?? ''}`}
      style={{
        boxShadow: `0 0 0 1.5px #2A2833, 0 40px 80px -30px ${glow ?? '#000'}cc, inset 0 0 0 1px #3A3844`,
      }}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.05rem] bg-white">
        {status && <StatusBar shot={status} />}
        <div className="relative min-h-0 flex-1">{children}</div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-2 z-20 h-[22px] w-[34%] -translate-x-1/2 rounded-full bg-[#0B0A10]"
        />
      </div>
    </div>
  );
}

/**
 * The clock and the icons over the colour of the top of the screenshot: the
 * screenshot itself, stretched so tall that only its first row of pixels
 * shows. It matches every site without anyone having to pick a colour, and
 * the type inverts against whatever that colour turns out to be.
 */
function StatusBar({ shot }: { shot: string }) {
  // The image is fetched when the phone comes near the screen, as the
  // screenshot itself is, not with the page.
  const bar = useRef<HTMLDivElement>(null);
  const near = useOnScreen(bar, '1200px');
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (near) setSeen(true);
  }, [near]);

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="relative isolate flex h-[38px] shrink-0 items-center justify-between bg-white px-[22px] pt-0.5 text-white"
      style={seen ? { backgroundImage: `url(${shot})`, backgroundSize: '100% 100000%', backgroundPosition: 'top' } : undefined}
    >
      <span className="text-[11.5px] font-semibold tracking-tight mix-blend-difference">9:41</span>
      <span className="flex items-center gap-[5px] mix-blend-difference">
        <svg viewBox="0 0 17 11" className="h-[9px] w-auto" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg viewBox="0 0 15 11" className="h-[9px] w-auto" fill="currentColor">
          <path d="M7.5 2.2c2.2 0 4.2.8 5.7 2.2l1.1-1.1A9.6 9.6 0 0 0 7.5.6 9.6 9.6 0 0 0 .7 3.3l1.1 1.1a8 8 0 0 1 5.7-2.2Zm0 3.2c1.3 0 2.5.5 3.4 1.3L12 5.6a6.4 6.4 0 0 0-9 0l1.1 1.1c.9-.8 2.1-1.3 3.4-1.3Zm0 3.2c.5 0 .9.2 1.2.5L7.5 10.3 6.3 9.1c.3-.3.7-.5 1.2-.5Z" />
        </svg>
        <svg viewBox="0 0 25 12" className="h-[10px] w-auto" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
          <path d="M23 4v4c.8-.3 1.3-1.1 1.3-2S23.8 4.3 23 4Z" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}

/** A browser window with the site's address in the bar. */
export function Browser({
  children,
  url,
  className,
}: {
  children: ReactNode;
  url: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.1rem] bg-[#16141C] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white/10 px-3 py-1 text-center font-mono text-[11px] text-white/70">
          {url}
        </span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * A screenshot that sits inside a frame. Lazy by default; `eager` switches it
 * to load and decode ahead of time, for frames about to slide into view.
 */
export function Shot({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={`block h-full w-full object-cover object-top ${className ?? ''}`}
    />
  );
}
