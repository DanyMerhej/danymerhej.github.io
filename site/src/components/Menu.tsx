import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Mail, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '../data/site';
import { chapters, profile, projects } from '../data/site';
import { useOverlayHistory, useScrollLock } from '../lib/hooks';
import { WhatsAppIcon } from './Icons';
import { scrollToId, scrollToY } from '../lib/smooth';

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The index, as a takeover that pours down from the top. Every chapter and
 * every project in reach without scrolling, in the colours of wherever you
 * opened it from (inverted, so it reads as a different layer).
 */
export function Menu({
  open,
  onClose,
  onOpenProject,
  onHome,
}: {
  open: boolean;
  onClose: () => void;
  onOpenProject: (p: Project, x: number, y: number) => void;
  /** Leave a project page for a chapter of the home page. */
  onHome?: (id: string) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useOverlayHistory(open, onClose, panel);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Closing pops the history entry the menu pushed; wait for that before
  // moving anywhere, or the move would be undone by it. When the move is to
  // another page, the index just fades, quickly, so the page transition that
  // follows starts from a clean picture of the page rather than from a
  // half-closed index.
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) setLeaving(false);
  }, [open]);
  const after = (fn: () => void, toPage = false) => {
    if (toPage) setLeaving(true);
    onClose();
    setTimeout(fn, toPage ? 220 : 320);
  };

  const products = projects.filter((p) => p.kind === 'product');
  const builds = projects.filter((p) => p.kind === 'build');

  return (
    <AnimatePresence custom={leaving}>
      {open && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Index"
          // Its own scrolling, not the smooth scroller's.
          data-lenis-prevent
          className="fixed inset-0 z-[300] overflow-y-auto overscroll-contain bg-fg text-bg"
          // A whole transform string, so framer hands it to the compositor.
          custom={leaving}
          variants={{
            hidden: { transform: 'translateY(-100%)' },
            shown: { transform: 'translateY(0%)', transition: { duration: 0.6, ease: EASE } },
            gone: (toPage: boolean) =>
              toPage
                ? { opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }
                : { transform: 'translateY(-100%)', transition: { duration: 0.6, ease: EASE } },
          }}
          initial="hidden"
          animate="shown"
          exit="gone"
        >
          <div className="gutter flex h-16 items-center justify-between">
            <span className="font-display text-[16px] font-bold">Index</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-bg/25 transition-transform hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="gutter grid grid-cols-1 gap-12 pb-20 pt-4 md:grid-cols-12">
            <nav className="md:col-span-6">
              <ul>
                {chapters.map((c, i) => (
                  <li key={c.id} className="overflow-hidden">
                    <motion.button
                      type="button"
                      onClick={() =>
                        after(() => {
                          if (onHome) onHome(c.id);
                          else if (c.id === 'top') scrollToY(0);
                          else scrollToId(c.id);
                        }, Boolean(onHome))
                      }
                      className="group flex w-full items-baseline gap-4 py-1.5 text-left"
                      initial={{ transform: 'translateY(100%)' }}
                      animate={{ transform: 'translateY(0%)' }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="w-6 font-mono text-[12px] opacity-50">{String(i + 1).padStart(2, '0')}</span>
                      <span className="display text-[clamp(2.2rem,10vw,4.2rem)] leading-[1.02] transition-[font-stretch,transform] duration-500 group-hover:translate-x-2 [font-stretch:92%] group-hover:[font-stretch:75%]">
                        {c.label}
                      </span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-10 md:col-span-5 md:col-start-8">
              <ProjectList title="My products" list={products} onPick={(p, x, y) => after(() => onOpenProject(p, x, y), true)} />
              <ProjectList title="Client builds" list={builds} onPick={(p, x, y) => after(() => onOpenProject(p, x, y), true)} />
              <div className="grid gap-2">
                <a href={profile.whatsapp} target="_blank" rel="noreferrer noopener" className="btn-whatsapp w-full">
                  <WhatsAppIcon className="h-5 w-5" /> Message me on WhatsApp
                </a>
                <a href={`mailto:${profile.email}`} className="btn w-full bg-bg text-fg">
                  <Mail className="h-4 w-4" /> Or send an email
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectList({
  title,
  list,
  onPick,
}: {
  title: string;
  list: Project[];
  onPick: (p: Project, x: number, y: number) => void;
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold opacity-60">{title}</p>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-1">
        {list.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, transform: 'translateX(20px)' }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.04 }}
          >
            <button
              type="button"
              onClick={(e) => onPick(p, e.clientX, e.clientY)}
              className="group flex w-full items-center gap-3 rounded-2xl p-1.5 text-left transition-colors hover:bg-bg/10"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                style={{ background: 'linear-gradient(150deg, #1D1B24, #0B0A10)' }}
              >
                <img src={p.logo} alt="" width={64} height={64} className="h-full w-full object-contain p-1.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                <span className="block truncate text-[13px] opacity-60">{p.tagline}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
