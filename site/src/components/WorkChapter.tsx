import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Globe, Instagram, Smartphone } from 'lucide-react';
import type { Project, ProjectLink } from '../data/site';
import { statusLabel } from '../data/site';
import { useHueClaim, useInCentre } from '../lib/hooks';
import { Mask, Words } from './Motion';

export function LinkIcon({ kind, className }: { kind: ProjectLink['kind']; className?: string }) {
  if (kind === 'store') return <Smartphone className={className} />;
  if (kind === 'social') return <Instagram className={className} />;
  return <Globe className={className} />;
}

export function Status({ status }: { status: Project['status'] }) {
  const live = status === 'live';
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-hue' : 'bg-ink-3'}`}
        style={live ? { boxShadow: '0 0 12px rgb(var(--hue))' } : undefined}
      />
      <span className="label">{statusLabel[status]}</span>
    </span>
  );
}

/**
 * One product, given the whole screen.
 *
 * While the chapter owns the middle of the viewport it claims the page's
 * `--hue`, so the header, the rules, the selection colour and the buttons all
 * take on the product's colour. Scrolling the page is therefore a walk through
 * six colour worlds rather than a scroll past six identical cards.
 */
export function WorkChapter({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const centred = useInCentre(ref);

  useHueClaim(project.id, project.hues[0], centred);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const markY = useTransform(scrollYProgress, [0, 1], ['14%', '-14%']);
  const washScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.08, 0.85]);

  const no = String(index + 1).padStart(2, '0');

  return (
    <article
      ref={ref}
      id={`work-${project.id}`}
      className="relative flex min-h-[100svh] scroll-mt-16 flex-col justify-center overflow-hidden py-20 md:py-28"
    >
      {/* The product's colour, bled into the page behind it. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-1/4 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full blur-[110px] md:h-[54rem] md:w-[54rem]"
        style={{
          background: `radial-gradient(circle, ${project.hues[0]}2e, ${project.hues[1]}12 45%, transparent 72%)`,
          scale: reduced ? 1 : washScale,
        }}
      />

      <div className="gutter relative">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12">
          {/* Mark */}
          <motion.div
            className="order-1 md:order-2 md:col-span-5 md:col-start-8"
            style={reduced ? undefined : { y: markY }}
          >
            {/* Several marks are drawn for a dark background, so they all get the
                same dark tile rather than some floating and some showing as
                squares against the paper. */}
            <motion.span
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[1.75rem]
                         border sm:h-40 sm:w-40 md:ml-auto md:h-60 md:w-60 md:rounded-[2.5rem]"
              style={{
                background: 'linear-gradient(150deg, #16181C, #08090B)',
                borderColor: `${project.hues[0]}33`,
                boxShadow: `0 30px 80px -24px ${project.hues[0]}55`,
              }}
              initial={{ opacity: 0, scale: 0.86 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={project.logo}
                alt=""
                width={320}
                height={320}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain p-4 md:p-7"
              />
            </motion.span>
          </motion.div>

          {/* Copy */}
          <div className="order-2 md:order-1 md:col-span-7">
            <div className="mb-5 flex items-center gap-5">
              <span className="font-mono text-[11px] text-ink-3">{no}</span>
              <span className="h-px w-8 bg-rule" />
              <Status status={project.status} />
            </div>

            <Mask as="h3" className="display chapter-type">
              <span className="block">{project.name}</span>
            </Mask>

            <p className="label mt-4">{project.tagline}</p>

            <p className="lede pretty mt-6 max-w-xl">
              <Words text={project.blurb} />
            </p>

            <motion.div
              className="mt-8 flex flex-wrap gap-1.5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              {project.stack.slice(0, 8).map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
              {project.stack.length > 8 && (
                <span className="tag border-transparent">+{project.stack.length - 8}</span>
              )}
            </motion.div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button type="button" onClick={onOpen} className="action-solid group">
                Read the build
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-[2.75rem] min-w-0 max-w-full items-center gap-2 text-sm text-ink-2 transition-colors duration-500 hover:text-ink"
                >
                  <LinkIcon kind={l.kind} className="h-3.5 w-3.5 shrink-0" />
                  <span className="ul-draw truncate">{l.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
