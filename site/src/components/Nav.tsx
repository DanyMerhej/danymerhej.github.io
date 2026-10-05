import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Briefcase, House, LayoutGrid, Send, Sparkles, Store } from 'lucide-react';
import { useState } from 'react';
import { chapters, profile } from '../data/site';
import { useActiveSection } from '../lib/hooks';
import { scrollToId, scrollToY } from '../lib/smooth';

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
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const active = useActiveSection(IDS);
  const label = chapters.find((c) => c.id === active)?.label ?? '';

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    if (y > 300 && y > prev + 2) setHidden(true);
    else if (y < prev - 2 || y <= 300) setHidden(false);
  });

  return (
    <>
      <a
        href="#products"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
      >
        Skip to the work
      </a>

      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[130] h-[3px] origin-left bg-accent"
        style={{ scaleX: progress }}
      />

      <motion.header
        className="fixed inset-x-0 top-0 z-[120]"
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={`gutter flex h-16 items-center justify-between gap-3 transition-[background-color,backdrop-filter] duration-500 ${
            solid ? 'bg-bg/70 backdrop-blur-xl' : ''
          }`}
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
            <button type="button" onClick={() => scrollToId('contact')} className="btn-accent hidden min-h-[2.6rem] px-4 text-[14px] sm:inline-flex">
              Say hello
            </button>
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
      </motion.header>
    </>
  );
}

/** A floating dock in reach of a thumb. The current section's button opens out to say its name. */
export function Dock({ onOpenMenu }: { onOpenMenu: () => void }) {
  const active = useActiveSection(IDS);

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-[120] flex justify-center px-3"
    >
      <motion.ul
        className="flex items-center gap-1 rounded-full border border-fg/10 bg-bg/75 p-1.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 160, damping: 20 }}
      >
        {DOCK.map((d) => {
          const on = active === d.id;
          const Icon = d.icon;
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => (d.id === 'top' ? scrollToY(0) : scrollToId(d.id))}
                aria-label={d.label}
                aria-current={on ? 'true' : undefined}
                className="relative flex h-11 items-center justify-center rounded-full px-3"
              >
                {on && (
                  <motion.span
                    layoutId="dock-pill"
                    className="absolute inset-0 rounded-full bg-fg"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={`relative flex items-center gap-1.5 ${on ? 'text-bg' : 'text-fg/80'}`}>
                  <Icon className="h-[18px] w-[18px]" />
                  <motion.span
                    initial={false}
                    animate={{ width: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden whitespace-nowrap text-[13px] font-semibold"
                  >
                    {d.label}
                  </motion.span>
                </span>
              </button>
            </li>
          );
        })}
        <li className="ml-0.5 border-l border-fg/15 pl-1">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open the index"
            className="flex h-11 w-11 items-center justify-center rounded-full text-fg/80"
          >
            <LayoutGrid className="h-[18px] w-[18px]" />
          </button>
        </li>
      </motion.ul>
    </nav>
  );
}
