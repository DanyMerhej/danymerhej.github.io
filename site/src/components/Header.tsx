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
        <div className="gutter flex h-16 items-center justify-between gap-4">
          <a
            href="#cover"
            className="flex min-h-[2.75rem] min-w-0 items-center gap-3"
            aria-label="Back to top"
          >
            <img
              src={profile.portrait}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover grayscale"
            />
            <span className="display min-w-0 truncate text-[0.8rem] tracking-tight sm:text-sm">
              {profile.name}
            </span>
          </a>

          {/* Where you are. Present at every width, because it is the one thing
              the bar can say that the page cannot say for itself. */}
          <p
            aria-live="polite"
            className="label hidden min-w-0 flex-1 justify-center truncate text-center sm:flex"
          >
            {label}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-rule
                         text-ink-2 transition-colors duration-500 hover:border-hue hover:text-ink"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenMenu}
              className="flex h-11 items-center gap-2 rounded-full border border-rule px-3.5 text-[0.8rem]
                         transition-colors duration-500 hover:border-hue sm:gap-2.5 sm:px-4 sm:text-sm"
              aria-label="Open the index"
            >
              <span className="flex flex-col gap-[3px]" aria-hidden="true">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
              </span>
              Index
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
