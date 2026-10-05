import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import type { Project } from '../data/site';
import { statusLabel } from '../data/site';
import { useWorld } from '../lib/hooks';
import { FlipPhone } from './FlipPhone';
import { LinkIcon } from './LinkIcon';
import { Letters, Rise, Words } from './Motion';

/**
 * One of my own products, given the whole screen and its own colour. The page
 * turns the product's colour as it arrives, the phone tilts up out of the page
 * as you scroll to it, and the phone turns over into a toy.
 */
export function ProductWorld({
  project,
  index,
  total,
  onOpen,
}: {
  project: Project;
  index: number;
  total: number;
  onOpen: (p: Project, x: number, y: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorld(ref, project.id, project.world);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotateX = useTransform(scrollYProgress, [0.05, 0.4, 0.95], [28, 0, -14]);
  const rotateZ = useTransform(scrollYProgress, [0.05, 0.4, 0.95], [-8, 0, 5]);
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const numberX = useTransform(scrollYProgress, [0, 1], ['10%', '-30%']);

  const live = project.status === 'live';
  const site = project.links.find((l) => l.kind === 'site');

  return (
    <article
      ref={ref}
      id={`work-${project.id}`}
      className="relative overflow-hidden py-20 md:py-32"
      aria-labelledby={`title-${project.id}`}
    >
      {/* The product number, huge and outlined, drifting across behind. */}
      <motion.p
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -top-4 right-0 select-none font-display text-[46vw] font-extrabold leading-none opacity-20 md:text-[28vw]"
        style={reduced ? undefined : { x: numberX }}
      >
        {String(index + 1).padStart(2, '0')}
      </motion.p>

      <div className="gutter relative grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow border-fg/30">
              {live && <span className="h-2 w-2 animate-pulse rounded-full bg-fg" />}
              {statusLabel[project.status]}
            </span>
            <span className="eyebrow border-fg/30">{project.category}</span>
            <span className="eyebrow border-transparent bg-fg/10">
              {index + 1} of {total}
            </span>
          </div>

          <h3 id={`title-${project.id}`} className="display h-project mt-6">
            <Letters text={project.name} />
          </h3>

          <p className="serif-i mt-4 text-[clamp(1.5rem,6vw,2.6rem)] leading-[1.1]">{project.tagline}</p>

          <p className="lede pretty mt-6 max-w-xl">
            <Words text={project.blurb} />
          </p>

          {/* Three highlights as cards: on a phone, a row you swipe through. */}
          <Rise className="mt-10">
            <ul className="no-bar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
              {project.highlights.slice(0, 3).map((h, i) => (
                <li
                  key={h}
                  className="card w-[78%] shrink-0 snap-start bg-fg/[0.09] p-5 sm:w-auto"
                >
                  <span className="font-display text-[2rem] font-extrabold leading-none text-fg/40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="pretty mt-3 text-[15px] leading-snug text-fg/90">{h}</p>
                </li>
              ))}
            </ul>
          </Rise>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 7).map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
            {project.stack.length > 7 && <span className="chip bg-transparent">+{project.stack.length - 7} more</span>}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={(e) => onOpen(project, e.clientX, e.clientY)}
              className="btn-solid group"
              data-cursor="Open"
            >
              The full story
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            {site && (
              <a href={site.href} target="_blank" rel="noreferrer noopener" className="btn-ghost group">
                <LinkIcon kind={site.kind} className="h-4 w-4" />
                {site.label}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </div>

        <motion.div
          className="md:col-span-5"
          style={reduced ? undefined : { rotateX, rotateZ, y, transformPerspective: 1200 }}
        >
          <FlipPhone project={project} />
        </motion.div>
      </div>
    </article>
  );
}
