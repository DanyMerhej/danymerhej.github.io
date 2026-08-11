import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Project } from '../data/site';
import { useScrollLock } from '../lib/hooks';
import { LinkIcon, Status } from './WorkChapter';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The full write-up, as a takeover rather than a modal card. It arrives from
 * the bottom, fills the screen and carries the product's colour on its own
 * surface, so opening one feels like stepping into the project.
 */
export function WorkDetail({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(Boolean(project));

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name}, the build`}
          className="fixed inset-0 z-[150] overflow-y-auto bg-paper outline-none"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[26rem]"
            style={{
              background: `linear-gradient(180deg, ${project.hues[0]}26, ${project.hues[1]}0d 45%, transparent)`,
            }}
          />

          {/* Close stays reachable with a thumb on a phone. */}
          <div className="sticky top-0 z-10 border-b border-rule bg-paper/80 backdrop-blur-md">
            <div className="gutter flex items-center justify-between gap-4 py-3">
              <span className="label truncate">{project.name}</span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule
                           text-ink-2 transition-colors duration-500 hover:border-hue hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="gutter relative pb-24 pt-10 md:pb-32 md:pt-16">
            <div className="flex flex-wrap items-center gap-5">
              <span
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border"
                style={{
                  background: 'linear-gradient(150deg, #16181C, #08090B)',
                  borderColor: `${project.hues[0]}33`,
                }}
              >
                <img
                  src={project.logo}
                  alt=""
                  width={320}
                  height={320}
                  className="h-full w-full object-contain p-2"
                />
              </span>
              <Status status={project.status} />
            </div>

            <h2 className="display section-type mt-6">{project.name}</h2>

            <p className="mt-4 text-sm text-ink-2">
              {project.tagline} · {project.role} ·{' '}
              <span className="font-mono text-xs text-ink-3">{project.year}</span>
            </p>

            <p className="lede pretty mt-8 max-w-3xl text-ink">{project.blurb}</p>

            <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-14">
              <section className="md:col-span-6">
                <h3 className="label border-b border-rule pb-3">What it does</h3>
                <ul className="mt-6 space-y-4">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex gap-4 text-[0.95rem] leading-relaxed text-ink-2">
                      <span
                        aria-hidden="true"
                        className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: project.hues[0] }}
                      />
                      <span className="pretty">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="md:col-span-6">
                <h3 className="label border-b border-rule pb-3">The engineering</h3>
                <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-2 pretty md:text-base">
                  {project.engineering}
                </p>

                <h3 className="label mt-12 border-b border-rule pb-3">Built with</h3>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {project.links.length > 0 && (
              <div className="mt-16 flex flex-wrap gap-3 border-t border-rule pt-10">
                {project.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="action-line"
                  >
                    <LinkIcon kind={l.kind} className="h-4 w-4" />
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
