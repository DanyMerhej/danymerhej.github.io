import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Project } from '../data/site';
import { projects, statusLabel, worlds } from '../data/site';
import { hexToRgb, luminance } from '../lib/world';
import { useMediaQuery, useOnScreen, useWorld } from '../lib/hooks';
import { Browser, Shot } from './Frames';
import { Mask } from './Motion';

const builds = projects.filter((p) => p.kind === 'build');

/**
 * The backdrop behind each card: the brand's own background, darkened where it
 * is light so the section's light type stays readable on it.
 */
const STAGE = builds.map((p) => (luminance(p.world.bg) > 0.3 ? mixHex(p.world.bg, '#15121D', 0.78) : p.world.bg));

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}

/** Scroll-driven animations run on the compositor; without them the row is a plain list. */
function canPin(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    CSS.supports?.('animation-timeline: view()') === true &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Storefronts and sites built for brands. The section pins, and scrolling down
 * walks sideways along the row instead; whichever card is in the middle paints
 * the page in that brand's colours.
 *
 * The sideways movement is a CSS scroll-driven animation (index.css,
 * .sd-track), so it is glued to the finger rather than chasing it a frame
 * late. Script only measures the row on resize and lets an
 * IntersectionObserver say which card is current.
 */
export function Builds({ onOpen }: { onOpen: (p: Project, x: number, y: number) => void }) {
  const [pinned] = useState(canPin);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [idx, setIdx] = useState(0);

  // One world for the whole section: changing the page's world restyles every
  // element, which mid-swipe is a stutter. Each brand's colour arrives instead
  // on a single backdrop layer behind the cards (STAGE, below).
  useWorld(pin, 'builds', worlds.ink);
  // A screen ahead of the section, every card's screenshot starts loading and
  // decoding, so none of it happens mid-swipe.
  const near = useOnScreen(pin, '100% 0px 100% 0px');

  // The row's length, measured whenever the cards or the window change size.
  useLayoutEffect(() => {
    if (!pinned) return;
    const t = track.current;
    if (!t) return;
    const measure = () => {
      // Hidden behind a project page, the row measures nothing; keep the last
      // length so the page does not change height while it is away.
      if (!t.scrollWidth) return;
      setDist(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned]);

  // Which card is current: the one crossing a thin vertical line down the
  // middle of the screen. The observer sees the cards where the scroll-driven
  // transform has actually put them, and costs no work per frame.
  useEffect(() => {
    if (!pinned) return;
    const t = track.current;
    if (!t) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.index);
          if (!Number.isNaN(i)) setIdx(i);
        });
      },
      { rootMargin: '0px -49% 0px -49%' },
    );
    t.querySelectorAll('[data-index]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pinned]);

  const header = (
    <div className="gutter shrink-0 pt-20 md:pt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Client builds</p>
          <Mask as="h2" className="display mt-4 text-[clamp(2.2rem,9vw,5.4rem)]">
            <span className="block">Storefronts &amp; sites</span>
          </Mask>
          <Mask as="p" delay={0.06} className="serif-i text-[clamp(2.2rem,9vw,5.4rem)] leading-[0.95] text-accent">
            <span className="block">for brands that sell.</span>
          </Mask>
        </div>
        {pinned && (
          <p className="flex items-center gap-2 text-[14px] text-fg/70">
            Keep scrolling, it goes sideways <ArrowRight className="h-4 w-4" />
          </p>
        )}
      </div>
    </div>
  );

  if (!pinned) {
    return (
      <section id="builds" ref={pin} className="py-10">
        {header}
        <div className="gutter mt-10 grid gap-6 md:grid-cols-2">
          {builds.map((p) => (
            <div key={p.id} className="h-[min(620px,82svh)]">
              <BuildCard project={p} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="builds"
      // The section paints its own dark stage, so it carries its own colours
      // too (text-fg resolves them here rather than inheriting the page's).
      // Left to the page's, the heading was the previous section's dark ink
      // on this dark stage, barely visible until the page arrived here.
      className="relative text-fg"
      style={{ '--bg': worlds.ink.bg, '--fg': worlds.ink.fg, '--accent': worlds.ink.accent } as CSSProperties}
    >
      <div ref={pin} style={{ height: `calc(100svh + ${dist}px)`, viewTimelineName: '--builds' } as CSSProperties}>
        <div className="sticky top-0 isolate flex h-[100svh] flex-col overflow-hidden">
          {/* The brand's colour, cross-faded on one layer: a single repaint. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 transition-[background-color] duration-700 ease-out"
            style={{ background: STAGE[idx] }}
          />
          {header}

          <div className="flex min-h-0 flex-1 items-center pb-24 pt-6 md:pb-16">
            <div
              ref={track}
              className="sd-track flex h-full max-h-[620px] gap-4 px-5 will-change-transform sm:px-8 md:gap-8 lg:px-12"
              style={{ '--dist': `${dist}px` } as CSSProperties}
            >
              {builds.map((p, i) => (
                <div key={p.id} data-index={i} className="h-full shrink-0">
                  <BuildCard project={p} onOpen={onOpen} eager={near} />
                </div>
              ))}
              <div className="flex w-[40vw] shrink-0 items-center md:w-[24vw]">
                <p className="serif-i text-[clamp(1.6rem,5vw,2.6rem)] leading-tight text-fg/80">More on the way.</p>
              </div>
            </div>
          </div>

          {/* Where you are along the row. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] flex justify-center gap-1.5 md:bottom-8">
            {builds.map((p, i) => (
              <span
                key={p.id}
                className={`h-1.5 w-8 origin-center rounded-full bg-fg transition-[transform,opacity] duration-500 ${
                  i === idx ? 'scale-x-100' : 'scale-x-[0.19] opacity-40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildCard({
  project,
  onOpen,
  eager = false,
}: {
  project: Project;
  onOpen: (p: Project, x: number, y: number) => void;
  eager?: boolean;
}) {
  const site = project.links.find((l) => l.kind === 'site');
  const host = site?.label ?? project.name;
  // Only the variant on screen is fetched early; a hidden one stays lazy.
  const wide = useMediaQuery('(min-width: 640px)');

  return (
    <article
      className="flex h-full w-[84vw] max-w-[560px] flex-col overflow-hidden rounded-[1.75rem]"
      style={{ background: project.world.bg, color: project.world.fg, boxShadow: `0 30px 70px -30px ${project.hues[0]}` }}
    >
      <button
        type="button"
        onClick={(e) => onOpen(project, e.clientX, e.clientY)}
        className="relative min-h-0 flex-1 overflow-hidden p-3 pb-0 text-left"
        aria-label={`${project.name}: the full story`}
        data-cursor="Open"
      >
        {project.shots?.desktop && (
          <Browser url={host} className="hidden h-full sm:block">
            <div className="aspect-[16/10]">
              <Shot src={project.shots.desktop} alt={`${project.name} on a desktop`} eager={eager && wide} />
            </div>
          </Browser>
        )}
        {project.shots?.mobile && (
          <div className="h-full overflow-hidden rounded-t-[1.25rem] sm:hidden">
            <Shot src={project.shots.mobile} alt={`${project.name} on a phone`} eager={eager && !wide} />
          </div>
        )}
      </button>

      <div className="shrink-0 p-5 pt-4">
        {/* Each item keeps to one line and the row wraps between them, rather
            than every item folding onto two lines of its own. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 whitespace-nowrap text-[12.5px] font-medium opacity-80">
          <span>{project.category}</span>
          <span aria-hidden="true">·</span>
          <span>{statusLabel[project.status]}</span>
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
        </div>
        <h3 className="display mt-2 text-[clamp(1.7rem,7vw,2.4rem)] leading-none">{project.name}</h3>
        <p className="mt-1.5 text-[15px] opacity-85">{project.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => onOpen(project, e.clientX, e.clientY)}
            className="btn min-h-[2.6rem] px-4 text-[14px]"
            style={{ background: project.world.fg, color: project.world.bg }}
          >
            The full story <ArrowRight className="h-4 w-4" />
          </button>
          {site && (
            <a
              href={site.href}
              target="_blank"
              rel="noreferrer noopener"
              className="btn min-h-[2.6rem] border-2 px-4 text-[14px]"
              style={{ borderColor: `${project.world.fg}44` }}
            >
              Visit <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
