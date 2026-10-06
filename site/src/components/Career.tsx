import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Role } from '../data/site';
import { experience, impactStats, irisModules, metrics, worlds } from '../data/site';
import { useWorld } from '../lib/hooks';
import { Mask, Rise, Words, useShown } from './Motion';
import { Odometer } from './Odometer';

const TILE = ['#C6F94E', '#F0A6E0', '#FFB86B', '#8FB8FF'];

/**
 * The day job, on warm paper because it is the part people read closely:
 * what IRIS is, the numbers, the roles as a timeline read top to bottom, and
 * what changed because of the work.
 */
export function Career() {
  const ref = useRef<HTMLElement>(null);
  useWorld(ref, 'career', worlds.cream);

  return (
    <section id="career" ref={ref} className="relative py-24 md:py-36">
      <div className="gutter">
        <p className="eyebrow">The day job</p>
        <Mask as="h2" className="display h-section mt-6 max-w-5xl">
          <span className="block">Seven years.</span>
        </Mask>
        <Mask as="p" delay={0.06} className="display h-section max-w-5xl">
          <span className="block">One company.</span>
        </Mask>
        <Mask as="p" delay={0.12} className="serif-i h-section max-w-5xl text-accent">
          <span className="block">Intern to team lead.</span>
        </Mask>
        <p className="lede pretty mt-8 max-w-2xl">
          <Words text="At Pixel Software Solutions I lead the team behind IRIS, an enterprise insurance ERP that more than 30 companies across the Middle East, Africa and Europe run their operations on." />
        </p>
      </div>

      <div className="gutter mt-14 grid grid-cols-1 items-center gap-12 md:mt-20 md:grid-cols-2">
        <Orbit />
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <Rise
              key={m.label}
              delay={i * 0.06}
              className="relative isolate flex aspect-square flex-col justify-between rounded-[1.75rem] p-4 text-[#16121F] sm:p-6"
            >
              <div className="absolute inset-0 -z-10 rounded-[1.75rem]" style={{ background: TILE[i] }} />
              <p className="display text-[clamp(2.2rem,10vw,3.6rem)] leading-none">
                <Odometer value={m.value} suffix={m.suffix} />
              </p>
              <div>
                <p className="text-[14px] font-semibold leading-snug sm:text-[15px]">{m.label}</p>
                <p className="mt-1 text-[12px] leading-snug opacity-70">{m.sub}</p>
              </div>
            </Rise>
          ))}
        </div>
      </div>

      {/* Roles, as a timeline: newest first, every one in its own place. */}
      <div className="gutter mt-24 md:mt-32">
        <h3 className="display text-[clamp(2rem,7vw,3.6rem)]">The roles</h3>
        <p className="mt-2 text-fg/70">Tap a card to read the whole of it.</p>
        <ol className="relative mt-8 space-y-5 pl-7 before:absolute before:bottom-6 before:left-[7px] before:top-6 before:w-[2px] before:bg-fg/15 sm:pl-10 sm:before:left-[11px]">
          {experience.map((role, i) => (
            <RoleCard key={`${role.company}-${role.title}`} role={role} index={i} />
          ))}
        </ol>
      </div>

      {/* Impact */}
      <div className="gutter mt-20 md:mt-28">
        <h3 className="display text-[clamp(2rem,7vw,3.6rem)]">What changed because of it</h3>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {impactStats.map((s, i) => (
            <Impact key={s.label} stat={s} delay={i * 0.08} colour={TILE[i]} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * IRIS in the middle, its modules circling it. The ring turns with a CSS
 * animation and each label turns back the other way to stay upright, all on
 * the compositor; no script runs while it spins.
 */
function Orbit() {
  const n = irisModules.length;
  const [ref, shown] = useShown<HTMLDivElement>();

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-[84%] max-w-[440px] sm:w-full">
      <div className="absolute inset-[8%] rounded-full border-2 border-dashed border-fg/15" />
      <div className="absolute inset-[19%] rounded-full border-2 border-fg/10" />
      <div
        className={`absolute inset-[37%] flex flex-col items-center justify-center rounded-full bg-fg text-bg transition-[transform,opacity] duration-700 ease-out ${
          shown ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <span className="display text-[clamp(1.5rem,7vw,2.6rem)]">IRIS</span>
        <span className="text-[10px] font-medium opacity-70 sm:text-[11px]">30+ insurers</span>
      </div>

      <ul className="spin-slow absolute inset-0">
        {irisModules.map((m, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          // Two rings, alternating, so long names never sit shoulder to shoulder,
          // and the inner one clear of the centre.
          const r = i % 2 ? 31 : 46;
          return (
            <li key={m} className="absolute" style={{ left: `${50 + r * Math.cos(a)}%`, top: `${50 + r * Math.sin(a)}%` }}>
              <span className="block -translate-x-1/2 -translate-y-1/2">
                <span className="spin-slow-rev block">
                  <span
                    className="block whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-[#16121F] shadow-sm sm:text-[12.5px]"
                    style={{ background: TILE[i % TILE.length] }}
                  >
                    {m}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RoleCard({ role, index }: { role: Role; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const id = `role-${index}`;
  const lead = role.points.slice(0, 1);
  const rest = role.points.slice(1);

  return (
    <Rise as="li" className="relative">
      {/* The dot on the timeline. */}
      <span
        aria-hidden="true"
        className={`absolute -left-7 top-7 h-4 w-4 rounded-full border-[3px] border-bg sm:-left-10 sm:h-6 sm:w-6 ${
          role.current ? 'bg-accent' : 'bg-fg/40'
        }`}
      />
      <div className="rounded-[1.75rem] border-2 border-fg/10 bg-fg/[0.04] p-5 sm:p-8">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-start gap-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="chip">{role.period}</span>
              {role.current && <span className="chip bg-accent text-bg">Now</span>}
            </span>
            <span className="display mt-3 block text-[clamp(1.6rem,6.5vw,2.5rem)] leading-[1.02]">{role.title}</span>
            <span className="mt-1.5 block text-[15px] text-fg/70">
              {role.company} · {role.place}
            </span>
          </span>
          {rest.length > 0 && (
            <ChevronDown
              className={`mt-1 h-6 w-6 shrink-0 transition-transform duration-500 ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          )}
        </button>

        <ul className="mt-5 space-y-3">
          {lead.map((p) => (
            <Point key={p} text={p} />
          ))}
        </ul>
        <motion.div
          id={id}
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <ul className="space-y-3 pt-3">
            {rest.map((p) => (
              <Point key={p} text={p} />
            ))}
          </ul>
          {role.tags && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {role.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
        {!open && rest.length > 0 && (
          <button type="button" onClick={() => setOpen(true)} className="mt-3 text-[14px] font-semibold text-accent">
            + {rest.length} more
          </button>
        )}
      </div>
    </Rise>
  );
}

function Point({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-[15.5px] leading-relaxed text-fg/85">
      <span aria-hidden="true" className="mt-[0.6rem] h-2 w-2 shrink-0 rounded-full bg-accent" />
      <span className="pretty">{text}</span>
    </li>
  );
}

function Impact({
  stat,
  delay,
  colour,
}: {
  stat: (typeof impactStats)[number];
  delay: number;
  colour: string;
}) {
  const pct = parseInt(stat.value, 10);
  const [ref, shown] = useShown<HTMLDivElement>();
  return (
    <Rise as="li" delay={delay} className="rounded-[1.75rem] border-2 border-fg/10 p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="display text-[clamp(2.6rem,11vw,4rem)] leading-none">{stat.value}</p>
        <p className="text-right text-[16px] font-semibold">{stat.label}</p>
      </div>
      {/* The bar grows with scaleX rather than width, so it never triggers layout. */}
      <div ref={ref} className="mt-4 h-3 overflow-hidden rounded-full bg-fg/10">
        <div
          className="h-full w-full origin-left rounded-full transition-transform duration-[1400ms] ease-out"
          style={
            {
              background: colour,
              transform: `scaleX(${shown ? pct / 100 : 0})`,
              transitionDelay: `${delay + 0.2}s`,
            } as CSSProperties
          }
        />
      </div>
      <p className="pretty mt-3 text-[15px] text-fg/75">{stat.detail}</p>
    </Rise>
  );
}
