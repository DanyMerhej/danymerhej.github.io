import { ArrowUpRight, Globe, Instagram, Smartphone } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRef } from 'react';
import type { Project, ProjectLink } from '../data/site';
import { statusLabel } from '../data/site';
import { useFinePointer } from '../lib/hooks';

/** Picks the glyph for a project link by its kind. */
export function LinkIcon({ kind, className }: { kind: ProjectLink['kind']; className?: string }) {
  if (kind === 'store') return <Smartphone className={className} />;
  if (kind === 'social') return <Instagram className={className} />;
  return <Globe className={className} />;
}

export function StatusBadge({ status }: { status: Project['status'] }) {
  const live = status === 'live';
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas/70 px-3 py-1">
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-signal' : 'bg-faint'}`}
        style={live ? { boxShadow: '0 0 10px rgb(var(--c-signal))' } : undefined}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {statusLabel[status]}
      </span>
    </span>
  );
}

interface Props {
  project: Project;
  featured?: boolean;
  onOpen: () => void;
}

export function ProjectCard({ project, featured = false, onOpen }: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();

  // Spotlight + tilt are driven through CSS variables so React never re-renders on move.
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!fine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--mx', `${x}px`);
    ref.current.style.setProperty('--my', `${y}px`);
    ref.current.style.setProperty('--rx', `${((y / rect.height - 0.5) * -5).toFixed(2)}deg`);
    ref.current.style.setProperty('--ry', `${((x / rect.width - 0.5) * 5).toFixed(2)}deg`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg');
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--spot', '0');
  };

  const onEnter = () => ref.current?.style.setProperty('--spot', '1');

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="card group relative flex flex-col transition-[transform,border-color] duration-300 ease-out hover:border-faint"
      style={{
        transform: 'perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Cursor spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[var(--spot,0)] transition-opacity duration-500"
        style={{
          background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), ${project.hues[0]}1f, transparent 68%)`,
        }}
      />
      {/* Signature gradient wash along the top edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${project.hues[0]}, ${project.hues[1]}, transparent)` }}
      />

      <div className={`relative flex flex-1 flex-col ${featured ? 'p-7 md:p-10' : 'p-6 md:p-7'}`}>
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${
              featured ? 'h-16 w-16' : 'h-12 w-12'
            }`}
            // The tile stays dark in both themes: most of the marks are drawn for dark.
            style={{
              background: 'linear-gradient(140deg, #14161A, #0A0B0D)',
              borderColor: `${project.hues[0]}40`,
            }}
          >
            <img
              src={project.logo}
              alt=""
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-contain ${featured ? 'p-1.5' : 'p-1'}`}
            />
          </span>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-6 flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className={`font-display font-semibold tracking-tight ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
              {project.name}
            </h3>
            <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-faint">
              {project.year}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            {project.tagline}
          </p>
          <p className={`mt-4 leading-relaxed text-muted text-pretty ${featured ? 'md:text-lg' : 'text-sm'}`}>
            {project.blurb}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.slice(0, featured ? 7 : 4).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
          {project.stack.length > (featured ? 7 : 4) && (
            <span className="chip border-transparent">+{project.stack.length - (featured ? 7 : 4)}</span>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={onOpen}
            className="group/btn inline-flex items-center gap-2 text-sm font-medium text-ink"
          >
            <span className="link-underline">Read the build</span>
            <ArrowUpRight className="h-4 w-4 text-accent transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>

          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <LinkIcon kind={l.kind} className="h-3.5 w-3.5 shrink-0" />
              <span className="link-underline truncate">{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
