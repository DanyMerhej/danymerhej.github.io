import { Briefcase, House, LayoutGrid, Send, Sparkles, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { chapters, profile } from '../data/site';
import { useActiveSection } from '../lib/hooks';
import { onScrollFrame } from '../lib/scroll';
import { scrollToId, scrollToY } from '../lib/smooth';
import { WhatsAppIcon } from './Icons';

const IDS = chapters.map((c) => c.id);

const DOCK = [
  { id: 'top', label: 'Hello', icon: House },
  { id: 'products', label: 'Products', icon: Sparkles },
  { id: 'builds', label: 'Builds', icon: Store },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'contact', label: 'Contact', icon: Send },
];

/** The top bar: who this is, where you are. Slides away while you read down, back when you scroll up. */
export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const active = useActiveSection(IDS);
  const label = chapters.find((c) => c.id === active)?.label ?? '';

  // Fed by the page's single scroll reader (lib/scroll.ts), and setting state
  // only when the answer changes, so scrolling never re-renders the bar frame
  // by frame.
  useEffect(() => {
    // The bottom of the page, cached, so the scroll handler reads nothing.
    let max = Infinity;
    const measure = () => (max = document.documentElement.scrollHeight - window.innerHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const stop = onScrollFrame((y, prev) => {
      setSolid(y > 40);
      // iOS bounces past either end; that is not the reader changing direction.
      if (y < 0 || y > max) return;
      if (y > 300 && y > prev + 2) setHidden(true);
      else if (y < prev - 2 || y <= 300) setHidden(false);
    });
    return () => {
      stop();
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <a
        href="#products"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
      >
        Skip to the work
      </a>

      {/* Reading progress, driven by the scroll itself (index.css, .sd-progress). */}
      <div
        aria-hidden="true"
        className="sd-progress fixed inset-x-0 top-0 z-[130] h-[3px] origin-left bg-accent"
        style={{ transform: 'scaleX(0)' }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-transform duration-500 ease-out ${
          hidden ? '-translate-y-[110%]' : 'translate-y-0'
        }`}
      >
        <div
          className={`gutter flex h-16 items-center justify-between gap-3 ${solid ? 'glass' : ''}`}
          style={{ maxWidth: 'none' }}
        >
          <button
            type="button"
            onClick={() => scrollToY(0)}
            className="flex h-[44px] shrink-0 items-center gap-2.5"
            aria-label="Back to the top"
          >
            <img
              src={profile.portrait}
              alt=""
              width={36}
              height={36}
              className="h-[36px] w-[36px] rounded-full object-cover ring-2 ring-accent"
            />
            <span className="font-display text-[16px] font-bold tracking-tight">{profile.name}</span>
          </button>

          <p aria-live="polite" className="hidden min-w-0 flex-1 truncate text-center text-[14px] font-medium text-fg/70 md:block">
            {label}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={profile.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-whatsapp min-h-[2.6rem] gap-2 px-3.5 text-[14px]"
              aria-label="Message me on WhatsApp"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex h-[44px] items-center gap-2 rounded-full border-2 border-fg/20 px-3.5 text-[14px] font-semibold transition-colors hover:border-fg/60"
              aria-label="Open the index"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Index</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

/**
 * A floating dock in reach of a thumb. Its width never changes: equal icon
 * buttons, a highlight that slides between them with a CSS transform, and the
 * current section's name in a caption above, so nothing re-lays out as you
 * scroll from one section to the next.
 */
export function Dock({ onOpenMenu }: { onOpenMenu: () => void }) {
  const active = useActiveSection(IDS);
  const at = DOCK.findIndex((d) => d.id === active);
  const caption = chapters.find((c) => c.id === active)?.label ?? '';

  return (
    <nav
      aria-label="Sections"
      className="enter-rise pointer-events-none fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-[120] flex flex-col items-center px-3"
      style={{ '--d': '0.6s' } as CSSProperties}
    >
      <p
        key={caption}
        aria-hidden="true"
        className="dock-caption glass mb-2 rounded-full px-3 py-1 text-[12px] font-semibold"
      >
        {caption}
      </p>
      <ul className="glass pointer-events-auto relative flex items-center rounded-full border border-fg/10 p-1.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.55)]">
        {/* The highlight: one element, moved, never re-laid out. */}
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-1.5 h-11 w-12 rounded-full bg-fg transition-[transform,opacity] duration-500 ease-out"
          style={{ transform: `translateX(${Math.max(at, 0) * 48}px)`, opacity: at < 0 ? 0 : 1 }}
        />
        {DOCK.map((d, i) => {
          const on = i === at;
          const Icon = d.icon;
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => (d.id === 'top' ? scrollToY(0) : scrollToId(d.id))}
                aria-label={d.label}
                aria-current={on ? 'true' : undefined}
                className={`relative flex h-11 w-12 items-center justify-center rounded-full transition-colors duration-300 ${
                  on ? 'text-bg' : 'text-fg/80'
                }`}
              >
                <Icon className="h-[19px] w-[19px]" />
              </button>
            </li>
          );
        })}
        <li className="ml-1 border-l border-fg/15 pl-1">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open the index"
            className="flex h-11 w-11 items-center justify-center rounded-full text-fg/80"
          >
            <LayoutGrid className="h-[19px] w-[19px]" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
