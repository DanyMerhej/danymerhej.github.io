import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Project } from '../data/site';
import { LinkIcon, StatusBadge } from './ProjectCard';
import { useScrollLock } from '../lib/hooks';

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useScrollLock(Boolean(project));

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name}, project detail`}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl
                       border border-line bg-surface outline-none sm:max-h-[86vh] sm:rounded-3xl"
            initial={{ y: 40, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header wash uses the project's own two hues. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-40"
              style={{
                background: `linear-gradient(160deg, ${project.hues[0]}1c, ${project.hues[1]}0d 55%, transparent)`,
              }}
            />

            <div className="relative flex items-start justify-between gap-4 border-b border-line p-6 md:p-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                    style={{
                      background: 'linear-gradient(140deg, #14161A, #0A0B0D)',
                      borderColor: `${project.hues[0]}40`,
                    }}
                  >
                    <img src={project.logo} alt="" className="h-full w-full object-contain p-1" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                    {project.name}
                  </h2>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-3 text-sm text-muted">
                  {project.tagline} · <span className="text-faint">{project.role}</span> ·{' '}
                  <span className="font-mono text-xs text-faint">{project.year}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line
                           text-muted transition-colors hover:border-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative overflow-y-auto p-6 md:p-8">
              <p className="text-base leading-relaxed text-ink text-pretty md:text-lg">{project.blurb}</p>

              <section className="mt-9">
                <h3 className="eyebrow">What it does</h3>
                <ul className="mt-4 space-y-3">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: project.hues[0] }}
                        aria-hidden="true"
                      />
                      <span className="text-pretty">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-9">
                <h3 className="eyebrow">The engineering</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted text-pretty md:text-base">
                  {project.engineering}
                </p>
              </section>

              <section className="mt-9">
                <h3 className="eyebrow">Built with</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              {project.links.length > 0 && (
                <section className="mt-9 flex flex-wrap gap-3 border-t border-line pt-7">
                  {project.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-ghost"
                    >
                      <LinkIcon kind={l.kind} className="h-4 w-4" />
                      {l.label}
                    </a>
                  ))}
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
