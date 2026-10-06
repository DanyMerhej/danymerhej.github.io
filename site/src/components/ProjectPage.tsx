import { ArrowLeft, ArrowRight, ArrowUpRight, LayoutGrid } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { Project } from '../data/site';
import { projects, statusLabel } from '../data/site';
import { useWorld } from '../lib/hooks';
import { setBaseWorld } from '../lib/world';
import { FlipPhone } from './FlipPhone';
import { Browser, Phone, Shot } from './Frames';
import { LinkIcon } from './LinkIcon';
import { Letters, Rise } from './Motion';

/** Splits a paragraph at sentence ends, so the long write-ups can be set in shorter pieces. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z"'‘“])/);
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/**
 * A project's own page, in its own colours from top to bottom: what it is, the
 * real thing on a phone and a screen, what it does, how it was engineered,
 * what it is built with, and the next project waiting at the bottom.
 */
export function ProjectPage({
  project,
  onOpen,
  onBack,
  onOpenMenu,
}: {
  project: Project;
  onOpen: (p: Project, x: number, y: number) => void;
  onBack: (p: Project, x: number, y: number) => void;
  onOpenMenu: () => void;
}) {
  const hero = useRef<HTMLDivElement>(null);

  const i = projects.findIndex((p) => p.id === project.id);
  const next = projects[(i + 1) % projects.length];
  const prev = projects[(i - 1 + projects.length) % projects.length];

  useEffect(() => {
    setBaseWorld(project.world);
    const before = document.title;
    document.title = `${project.name} | Danny Merhej`;
    return () => {
      document.title = before;
    };
  }, [project]);

  const [lead, ...rest] = sentences(project.engineering);
  const paragraphs = chunk(rest, 3).map((s) => s.join(' '));
  const desktop = project.shots?.desktop;
  const site = project.links.find((l) => l.kind === 'site');

  return (
    <main className="relative">
      {/* Bar */}
      <div className="fixed inset-x-0 top-0 z-[120]">
        <div className="gutter flex h-16 items-center justify-between gap-2" style={{ maxWidth: 'none' }}>
          <button
            type="button"
            onClick={(e) => onBack(project, e.clientX, e.clientY)}
            className="glass flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> All work
          </button>
          <div className="glass flex shrink-0 items-center rounded-full p-1">
            <button
              type="button"
              onClick={(e) => onOpen(prev, e.clientX, e.clientY)}
              aria-label={`Previous: ${prev.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="whitespace-nowrap px-1 text-[13px] font-semibold tabular-nums">
              {i + 1} / {projects.length}
            </span>
            <button
              type="button"
              onClick={(e) => onOpen(next, e.clientX, e.clientY)}
              aria-label={`Next: ${next.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open the index"
              className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full border-l border-fg/15"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        ref={hero}
        className="gutter relative pb-16 pt-28 md:pb-24 md:pt-36"
        style={{ viewTimelineName: '--project-hero' } as CSSProperties}
      >
        {/* Two layers, so the two motions never fight over one transform: the
            outer rolls away with the scroll (index.css, .sd-roll), the inner
            pops in once when the page opens. */}
        <span className="sd-roll absolute right-5 top-24 sm:right-8 md:right-12 md:top-32">
          <span
            className="enter-pop flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.8rem] sm:h-32 sm:w-32 md:h-44 md:w-44 md:rounded-[2.4rem]"
            style={{
              background: 'linear-gradient(150deg, #1D1B24, #0B0A10)',
              boxShadow: `0 30px 60px -20px ${project.hues[0]}, inset 0 0 0 2px ${project.hues[0]}55`,
            }}
          >
            <img src={project.logo} alt="" width={320} height={320} className="h-full w-full object-contain p-3 md:p-5" />
          </span>
        </span>

        <div className="flex flex-wrap gap-2 pr-28 sm:pr-40">
          <span className="eyebrow border-fg/30">{project.kind === 'product' ? 'My product' : 'Client build'}</span>
          <span className="eyebrow border-fg/30">{project.category}</span>
        </div>

        <h1 className="display h-project mt-8 max-w-[14ch]">
          <Letters text={project.name} delay={0.2} />
        </h1>
        <p
          className="enter-rise serif-i mt-5 text-[clamp(1.6rem,6.5vw,3rem)] leading-[1.08]"
          style={{ '--d': '0.45s' } as CSSProperties}
        >
          {project.tagline}
        </p>
        <p className="enter-rise lede pretty mt-6 max-w-2xl" style={{ '--d': '0.55s' } as CSSProperties}>
          {project.blurb}
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Role', project.role],
            ['When', project.year],
            ['Status', statusLabel[project.status]],
            ['Built with', `${project.stack.length} tools`],
          ].map(([k, v], n) => (
            <div key={k} className="enter-rise card bg-fg/[0.08] p-4" style={{ '--d': `${0.65 + n * 0.06}s` } as CSSProperties}>
              <dt className="text-[12.5px] font-semibold opacity-60">{k}</dt>
              <dd className="mt-1 text-[15.5px] font-semibold leading-snug">{v}</dd>
            </div>
          ))}
        </dl>

        {project.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {project.links.map((l, n) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className={n === 0 ? 'btn-solid' : 'btn-ghost'}
              >
                <LinkIcon kind={l.kind} className="h-4 w-4" />
                {l.label}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Screens */}
      {(project.shots || project.demo) && (
        <div className="gutter grid grid-cols-1 items-center gap-12 py-10 md:grid-cols-12 md:py-16">
          <Rise className="flex justify-center md:col-span-4">
            {project.demo ? (
              <FlipPhone project={project} />
            ) : project.shots?.mobile ? (
              <Phone glow={project.hues[0]}>
                <Shot src={project.shots.mobile} alt={`${project.name} on a phone`} />
              </Phone>
            ) : null}
          </Rise>
          {desktop && (
            <Rise delay={0.1} className="md:col-span-8">
              <Browser url={site?.label ?? project.name}>
                <div className="aspect-[16/10]">
                  <Shot src={desktop} alt={`${project.name} on a desktop`} />
                </div>
              </Browser>
            </Rise>
          )}
        </div>
      )}

      {/* What it does */}
      <section className="gutter py-16 md:py-24">
        <h2 className="display text-[clamp(2.4rem,9vw,4.8rem)]">What it does</h2>
        <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {project.highlights.map((h, n) => (
            <Rise key={h} delay={Math.min(n, 4) * 0.05} className="card flex gap-4 bg-fg/[0.08] p-5 sm:p-6">
              <span className="font-display text-[2.2rem] font-extrabold leading-none text-fg/35">
                {String(n + 1).padStart(2, '0')}
              </span>
              <p className="pretty text-[16px] leading-snug">{h}</p>
            </Rise>
          ))}
        </ol>
      </section>

      {/* The engineering */}
      <section className="gutter py-16 md:py-24">
        <h2 className="display text-[clamp(2.4rem,9vw,4.8rem)]">How it was built</h2>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
          <Rise className="md:col-span-5">
            <blockquote className="serif-i border-l-4 border-fg pl-5 text-[clamp(1.7rem,6vw,2.6rem)] leading-[1.15]">
              {lead}
            </blockquote>
          </Rise>
          <div className="space-y-5 md:col-span-7">
            {paragraphs.map((p, n) => (
              <Rise key={n} delay={n * 0.05}>
                <p className="prose-body pretty text-fg/85">{p}</p>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* Built with */}
      <section className="gutter py-16 md:py-24">
        <h2 className="display text-[clamp(2.4rem,9vw,4.8rem)]">Built with</h2>
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {project.stack.map((s, n) => (
            <Rise
              key={s}
              as="li"
              delay={Math.min(n, 12) * 0.04}
              className="rounded-2xl bg-fg px-4 py-3 text-[16px] font-semibold text-bg"
            >
              {s}
            </Rise>
          ))}
        </ul>
      </section>

      <NextBand next={next} onOpen={onOpen} />
    </main>
  );
}

/** The next project, already in its own colour, waiting at the bottom of the page. */
function NextBand({ next, onOpen }: { next: Project; onOpen: (p: Project, x: number, y: number) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useWorld(ref, `next-${next.id}`, next.world);

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => onOpen(next, e.clientX, e.clientY)}
      className="group block w-full pb-36 pt-24 text-left md:pb-28"
      data-cursor="Next"
    >
      <div className="gutter">
        <p className="text-[15px] font-semibold opacity-70">Next up</p>
        <div className="mt-4 flex items-end justify-between gap-6">
          <p className="display h-project transition-[font-stretch] duration-700 group-hover:[font-stretch:78%]">{next.name}</p>
          <span className="mb-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-500 group-hover:translate-x-2 md:h-24 md:w-24">
            <ArrowRight className="h-7 w-7" />
          </span>
        </div>
        <p className="serif-i mt-3 text-[clamp(1.4rem,5vw,2.2rem)]">{next.tagline}</p>
      </div>
    </button>
  );
}
