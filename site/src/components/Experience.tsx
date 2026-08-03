import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { experience, impactStats, metrics } from '../data/site';
import { Counter } from './Counter';
import { Reveal, SectionHeading } from './Reveal';

export function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 65%', 'end 55%'],
  });
  const height = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '100%']), {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <section id="work" className="scroll-mt-24 py-24 md:py-36">
      <div className="shell">
        <SectionHeading
          index="01 / Work"
          title="Seven years, one company, intern to team lead."
          lead="I build IRIS — an enterprise insurance ERP that more than 30 companies across the Middle East, Africa and Europe run their operations on. I lead its development and own the technical conversation with the clients using it."
        />

        {/* Headline numbers */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.07}>
              <div className="h-full bg-surface p-6 md:p-8">
                <p className="font-display text-4xl font-bold tracking-tight text-accent md:text-5xl">
                  <Counter to={m.value} suffix={m.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium text-ink">{m.label}</p>
                <p className="mt-1 text-xs text-faint">{m.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Timeline */}
        <div ref={trackRef} className="relative mt-20 md:mt-28">
          <div aria-hidden="true" className="absolute left-[7px] top-2 h-full w-px bg-line md:left-[9px]">
            <motion.div
              className="w-px origin-top bg-signal"
              style={{ height: reduced ? '100%' : height }}
            />
          </div>

          <ol className="space-y-4">
            {experience.map((role, i) => (
              <RoleRow key={`${role.company}-${role.title}`} role={role} defaultOpen={i === 0} />
            ))}
          </ol>
        </div>
      </div>

      {/* Impact strip */}
      <div className="shell mt-20 md:mt-28">
        <Reveal>
          <p className="eyebrow">What changed because of it</p>
        </Reveal>
        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="border-t border-line pt-5">
                <p className="font-display text-3xl font-bold tracking-tight md:text-4xl">{s.value}</p>
                <p className="mt-1.5 text-sm font-medium text-accent">{s.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{s.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleRow({ role, defaultOpen }: { role: (typeof experience)[number]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `${role.company}-${role.title}`.replace(/\W+/g, '-').toLowerCase();

  return (
    <li className="relative pl-9 md:pl-14">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-[1.35rem] h-[15px] w-[15px] rounded-full border-2 transition-colors md:left-0.5 ${
          role.current ? 'border-signal bg-signal' : 'border-line bg-canvas'
        }`}
        style={role.current ? { boxShadow: '0 0 0 5px rgb(var(--c-signal) / 0.14)' } : undefined}
      />

      <Reveal y={16}>
        <div className="card border-line/80 transition-colors hover:border-faint">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={id}
            className="flex w-full items-start justify-between gap-5 p-5 text-left md:p-7"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {role.title}
                </h3>
                {role.current && (
                  <span className="rounded-full bg-signal px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal-ink">
                    Now
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted">
                {role.company} · <span className="text-faint">{role.place}</span>
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                {role.period}
              </p>

              {role.tags && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {role.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ChevronDown
              className={`mt-1 h-5 w-5 shrink-0 text-faint transition-transform duration-300 ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          <motion.div
            id={id}
            initial={false}
            animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 border-t border-line px-5 py-6 md:px-7">
              {role.points.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-signal" />
                  <span className="text-pretty">{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Reveal>
    </li>
  );
}
