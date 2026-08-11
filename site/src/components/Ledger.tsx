import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { experience, impactStats, metrics } from '../data/site';
import { Mask, Rise, Words } from './Motion';
import { Odometer } from './Odometer';

/**
 * The day job. Numbers first, because they are the part a stranger can weigh,
 * then the roles as an editorial list that opens in place.
 */
export function Ledger() {
  return (
    <section id="ledger" className="scroll-mt-16 py-24 md:py-36">
      <div className="gutter">
        <p className="label">01 / The day job</p>
        <Mask as="h2" className="display section-type mt-6 max-w-5xl">
          <span className="block">Seven years.</span>
        </Mask>
        <Mask as="div" delay={0.08} className="display section-type max-w-5xl">
          <span className="block">One company.</span>
        </Mask>
        <Mask as="div" delay={0.16} className="display section-type max-w-5xl">
          <span className="block hue">Intern to team lead.</span>
        </Mask>

        <p className="lede pretty mt-8 max-w-2xl">
          <Words text="I build IRIS, an enterprise insurance ERP that more than 30 companies across the Middle East, Africa and Europe run their operations on." />
        </p>
      </div>

      {/* Numbers, on their own rules, no boxes */}
      <div className="gutter mt-16 md:mt-24">
        <div className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <Rise key={m.label} delay={i * 0.07} className="border-t border-rule pt-5 sm:pr-8">
              <p className="display text-[2.4rem] leading-none md:text-[3.2rem]">
                <Odometer value={m.value} suffix={m.suffix} />
              </p>
              <p className="mt-4 text-sm font-medium">{m.label}</p>
              <p className="mt-1 text-xs text-ink-3">{m.sub}</p>
            </Rise>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="gutter mt-20 md:mt-28">
        <p className="label mb-6">The roles</p>
        <ol>
          {experience.map((role, i) => (
            <Row key={`${role.company}-${role.title}`} role={role} defaultOpen={i === 0} />
          ))}
        </ol>
      </div>

      {/* Impact */}
      <div className="gutter mt-20 md:mt-28">
        <p className="label mb-8">What changed because of it</p>
        <div className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((s, i) => (
            <Rise key={s.label} delay={i * 0.06} className="border-t border-rule pt-5 sm:pr-8">
              <p className="display text-[2.2rem] leading-none md:text-[2.8rem]">{s.value}</p>
              <p className="mt-3 text-sm font-medium hue">{s.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2 pretty">{s.detail}</p>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ role, defaultOpen }: { role: (typeof experience)[number]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `${role.company}-${role.title}`.replace(/\W+/g, '-').toLowerCase();

  return (
    <li className="border-t border-rule last:border-b">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-start gap-5 py-6 text-left md:gap-10 md:py-8"
      >
        <span className="mt-2 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3 md:block md:w-44 md:shrink-0">
          {role.period}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="display text-2xl leading-tight transition-colors duration-500 group-hover:text-hue md:text-[2.1rem]">
              {role.title}
            </span>
            {role.current && <span className="label hue">Now</span>}
          </span>
          <span className="mt-2 block text-sm text-ink-2">
            {role.company} · <span className="text-ink-3">{role.place}</span>
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3 md:hidden">
            {role.period}
          </span>
        </span>

        <Plus
          className={`mt-1.5 h-5 w-5 shrink-0 text-ink-3 transition-transform duration-500 ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <motion.div
        id={id}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="pb-8 md:pb-10">
          <ul className="max-w-3xl space-y-4 md:ml-[13.5rem]">
            {role.points.map((p) => (
              <li key={p} className="flex gap-4 text-[0.95rem] leading-relaxed text-ink-2">
                <span aria-hidden="true" className="mt-[0.62rem] h-1 w-1 shrink-0 rounded-full bg-hue" />
                <span className="pretty">{p}</span>
              </li>
            ))}
          </ul>

          {role.tags && (
            <div className="mt-6 flex flex-wrap gap-1.5 md:ml-[13.5rem]">
              {role.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </li>
  );
}
