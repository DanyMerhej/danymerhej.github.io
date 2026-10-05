import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { Project } from '../data/site';
import { projects, statusLabel } from '../data/site';
import { useInCentre } from '../lib/hooks';
import { useWorldClaim } from '../lib/world';
import { Browser, Shot } from './Frames';
import { Mask } from './Motion';

const builds = projects.filter((p) => p.kind === 'build');

/**
 * Storefronts and sites built for brands. The section pins, and scrolling down
 * walks sideways along the row instead; whichever card is in the middle paints
 * the page in that brand's colours.
 */
export function Builds({ onOpen }: { onOpen: (p: Project, x: number, y: number) => void }) {
  const reduced = useReducedMotion();
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [vw, setVw] = useState(390);
  const [idx, setIdx] = useState(0);

  const centred = useInCentre(pin, '-30% 0px -30% 0px');
  useWorldClaim('builds', builds[idx].world, centred);

  useLayoutEffect(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      setVw(window.innerWidth);
      setDist(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: pin, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.max(0, Math.min(builds.length - 1, Math.round(v * (builds.length - 1))));
    setIdx(i);
  });

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
        {!reduced && (
          <p className="hidden items-center gap-2 text-[14px] text-fg/70 sm:flex">
            Keep scrolling, it goes sideways <ArrowRight className="h-4 w-4" />
          </p>
        )}
      </div>
    </div>
  );

  if (reduced) {
    return (
      <section id="builds" ref={pin} className="py-10">
        {header}
        <div className="gutter mt-10 grid gap-6 md:grid-cols-2">
          {builds.map((p) => (
            <BuildCard key={p.id} project={p} onOpen={onOpen} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="builds" className="relative">
      <div ref={pin} style={{ height: `calc(100svh + ${dist}px)` }}>
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
          {header}

          <div className="flex min-h-0 flex-1 items-center pb-24 pt-6 md:pb-16">
            <motion.div
              ref={track}
              className="flex h-full max-h-[620px] gap-4 px-5 sm:px-8 md:gap-8 lg:px-12"
              style={{ x }}
            >
              {builds.map((p, i) => (
                <Tilted key={p.id} x={x} index={i} vw={vw}>
                  <BuildCard project={p} onOpen={onOpen} />
                </Tilted>
              ))}
              <div className="flex w-[40vw] shrink-0 items-center md:w-[24vw]">
                <p className="serif-i text-[clamp(1.6rem,5vw,2.6rem)] leading-tight text-fg/80">
                  More on the way.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Where you are along the row. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] flex justify-center gap-1.5 md:bottom-8">
            {builds.map((p, i) => (
              <span
                key={p.id}
                className={`h-1.5 rounded-full bg-fg transition-all duration-500 ${i === idx ? 'w-8' : 'w-1.5 opacity-40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Leans each card away as it moves off centre, so the row reads as a curve. */
function Tilted({
  x,
  index,
  vw,
  children,
}: {
  x: MotionValue<number>;
  index: number;
  vw: number;
  children: React.ReactNode;
}) {
  const card = Math.min(vw * 0.84, 560) + 32;
  const rotateY = useTransform(x, (v) => {
    const centre = index * card + card / 2 + v - vw / 2;
    return Math.max(-18, Math.min(18, (-centre / vw) * 22));
  });
  const scale = useTransform(x, (v) => {
    const centre = Math.abs(index * card + card / 2 + v - vw / 2);
    return 1 - Math.min(centre / vw, 1) * 0.08;
  });

  return (
    <motion.div className="h-full shrink-0" style={{ rotateY, scale, transformPerspective: 1100 }}>
      {children}
    </motion.div>
  );
}

function BuildCard({ project, onOpen }: { project: Project; onOpen: (p: Project, x: number, y: number) => void }) {
  const site = project.links.find((l) => l.kind === 'site');
  const host = site?.label ?? project.name;

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
              <Shot src={project.shots.desktop} alt={`${project.name} on a desktop`} />
            </div>
          </Browser>
        )}
        {project.shots?.mobile && (
          <div className="h-full overflow-hidden rounded-t-[1.25rem] sm:hidden">
            <Shot src={project.shots.mobile} alt={`${project.name} on a phone`} />
          </div>
        )}
      </button>

      <div className="shrink-0 p-5 pt-4">
        <div className="flex items-center gap-2 text-[12.5px] font-medium opacity-80">
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
