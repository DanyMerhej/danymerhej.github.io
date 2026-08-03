import { capabilities, toolkit } from '../data/site';
import { Reveal, SectionHeading } from './Reveal';

export function Capabilities() {
  return (
    <section id="capabilities" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeading
        index="03 / Capabilities"
        title="What I actually do."
        lead="Two disciplines that keep sharpening each other: enterprise systems that must not break, and independent products that must ship."
      />

      <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 0.06}>
            <div className="group relative h-full bg-surface p-7 transition-colors duration-300 hover:bg-raised md:p-8">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-lg text-accent
                           transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                {c.glyph}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{c.body}</p>
              <ul className="mt-6 space-y-2">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 font-mono text-[11px] text-faint">
                    <span aria-hidden="true" className="h-px w-3 bg-signal" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Toolkit */}
      <div className="mt-20 md:mt-28">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="eyebrow">The toolkit</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </Reveal>

        <dl className="mt-10 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
          {toolkit.map((group, i) => (
            <Reveal key={group.group} delay={Math.min(i * 0.04, 0.3)}>
              <div className="flex flex-col gap-3 bg-surface px-5 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-7">
                <dt className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                  {group.group}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
