import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Command, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { sections } from '../data/site';
import { useActiveSection, useTheme } from '../lib/hooks';

const IDS = sections.map((s) => s.id);

export function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [theme, toggleTheme] = useTheme();
  const [lifted, setLifted] = useState(false);
  const active = useActiveSection(IDS);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setLifted(y > 120));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                   focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-sm focus:text-signal-ink"
      >
        Skip to content
      </a>

      <motion.nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="shell">
          <div
            className={`mt-4 flex items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 ${
              lifted ? 'glass border-line shadow-[0_10px_40px_-24px_rgba(0,0,0,0.8)]' : 'border-transparent'
            }`}
          >
            <a
              href="#top"
              className="flex items-center gap-2.5 rounded-full px-2 py-1"
              aria-label="Back to top"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal font-display text-[13px] font-bold text-signal-ink">
                D
              </span>
              <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
                Danny Merhej
              </span>
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="relative block rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-ink"
                  >
                    {active === s.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-raised"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className={`relative ${active === s.id ? 'text-ink' : ''}`}>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenPalette}
                className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5
                           text-muted transition-colors hover:border-faint hover:text-ink sm:flex"
                aria-label="Open command menu"
              >
                <Command className="h-3.5 w-3.5" />
                <span className="font-mono text-[11px]">K</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full
                           border border-line text-muted transition-colors hover:border-faint hover:text-ink"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ y: 14, opacity: 0, rotate: -30 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -14, opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute"
                  >
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <MobileBar active={active} />
    </>
  );
}

/** A compact section switcher that only appears on small screens. */
function MobileBar({ active }: { active: string }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line glass pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto px-3 py-2">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              className={`block rounded-full px-4 py-2 text-sm transition-colors ${
                active === s.id ? 'bg-raised text-ink' : 'text-muted'
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
