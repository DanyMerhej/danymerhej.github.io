import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Mail, X } from 'lucide-react';
import { useEffect } from 'react';
import { chapters, profile, projects } from '../data/site';
import { useOverlayHistory, useScrollLock } from '../lib/hooks';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The index, as a takeover. Big targets, no scrolling needed to reach anything,
 * which is what a phone actually wants from navigation.
 */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useScrollLock(open);
  useOverlayHistory(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (id: string) => () => {
    onClose();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 260);
  };

  const openProject = (id: string) => () => {
    onClose();
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-project', { detail: id })), 260);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Index"
          className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-paper"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="gutter flex h-16 shrink-0 items-center justify-between">
            <span className="label">Index</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-rule
                         text-ink-2 transition-colors duration-500 hover:border-hue hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="gutter grid flex-1 gap-10 pb-16 pt-6 md:grid-cols-12 md:gap-12 md:pt-10">
            {/* Chapters */}
            <nav className="md:col-span-7">
              <ul>
                {chapters.map((c, i) => (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.16 + i * 0.05, ease: EASE }}
                    className="border-t border-rule last:border-b"
                  >
                    <button
                      type="button"
                      onClick={go(c.id)}
                      className="group flex w-full items-baseline gap-5 py-4 text-left md:py-5"
                    >
                      <span className="font-mono text-[10px] text-ink-3">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="display min-w-0 text-[1.8rem] leading-tight transition-colors duration-500 group-hover:text-hue md:text-[3rem]">
                        {c.label}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Products */}
            <div className="md:col-span-4 md:col-start-9">
              <p className="label mb-4">The work</p>
              <ul>
                {projects.map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.04 }}
                    className="border-t border-rule last:border-b"
                  >
                    <button
                      type="button"
                      onClick={openProject(p.id)}
                      className="group flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                        style={{
                          background: 'linear-gradient(150deg, #16181C, #08090B)',
                          borderColor: `${p.hues[0]}33`,
                        }}
                      >
                        <img
                          src={p.logo}
                          alt=""
                          width={64}
                          height={64}
                          className="h-full w-full object-contain p-1"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm transition-colors duration-500 group-hover:text-hue">
                          {p.name}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-ink-3">
                          {p.tagline}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </motion.li>
                ))}
              </ul>

              <motion.a
                href={`mailto:${profile.email}`}
                className="action-solid mt-8 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <Mail className="h-4 w-4" />
                Get in touch
              </motion.a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
