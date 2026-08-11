import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { chapters, profile } from '../data/site';
import { useActiveSection, useTheme } from '../lib/hooks';

const IDS = chapters.map((c) => c.id);

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [theme, toggleTheme] = useTheme();
  const [lifted, setLifted] = useState(false);
  const active = useActiveSection(IDS);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollY, 'change', (y) => setLifted(y > 80));

  const label = chapters.find((c) => c.id === active)?.label;

  return (
    <>
      <a
        href="#works"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400]
                   focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to the work
      </a>

      {/* Reading progress, hairline across the very top. */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[120] h-[2px] origin-left bg-hue"
        style={{ scaleX: progress }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-[110] transition-colors duration-700 ${
          lifted ? 'border-b border-rule bg-paper/80 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        {/*
          Every fixed part of this bar is sized in px rather than rem. A phone
          set to large system text scales rem, and at that point the wordmark
          plus two controls no longer fit, which is how the bar ended up running
          off the edge. Only the middle label is flexible, and it truncates.
        */}
        <div className="gutter flex h-16 items-center justify-between gap-3">
          <a
            href="#cover"
            className="flex h-[44px] shrink-0 items-center gap-2.5"
            aria-label="Back to top"
          >
            <img
              src={profile.portrait}
              alt=""
              width={32}
              height={32}
              className="h-[32px] w-[32px] shrink-0 rounded-full object-cover grayscale"
            />
            {/* The cover states the name at full size directly below, so on a
                phone the avatar carries identity and the space goes to the
                chapter readout instead. */}
            <span className="display hidden whitespace-nowrap text-[14px] tracking-tight sm:block">
              {profile.name}
            </span>
          </a>

          {/* Where you are. The one thing the bar can say that the page cannot
              say for itself, and now present at every width. */}
          <p
            aria-live="polite"
            className="label min-w-0 flex-1 truncate text-center"
            style={{ fontSize: '10px' }}
          >
            {label}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-rule
                         text-ink-2 transition-colors duration-500 hover:border-hue hover:text-ink"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenMenu}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-rule
                         text-[14px] transition-colors duration-500 hover:border-hue
                         sm:w-auto sm:gap-2.5 sm:px-4"
              aria-label="Open the index"
            >
              <span className="flex flex-col gap-[3px]" aria-hidden="true">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
              </span>
              <span className="hidden sm:inline">Index</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
