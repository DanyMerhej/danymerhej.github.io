import { ArrowUpRight, Instagram } from 'lucide-react';
import { ventures } from '../data/site';
import { Reveal, SectionHeading } from './Reveal';

export function Beyond() {
  return (
    <section id="beyond" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeading
        index="05 / Beyond code"
        title="Not everything I make is software."
        lead="Two things I run outside the terminal. They keep the other half of the job honest: taste, audience, and knowing why something works."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {ventures.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.08} className="flex">
            <a
              href={v.href}
              target="_blank"
              rel="noreferrer noopener"
              className="card group relative flex w-full flex-col p-7 transition-colors duration-300 hover:border-faint md:p-10"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${v.hues[0]}, ${v.hues[1]}, transparent)` }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${v.hues[0]}33, transparent 70%)` }}
              />

              <div className="relative flex items-start justify-between gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                  style={{
                    background: 'linear-gradient(140deg, #14161A, #0A0B0D)',
                    borderColor: `${v.hues[0]}40`,
                  }}
                >
                  <img
                    src={v.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-1.5"
                  />
                </span>
                <span className="chip">{v.kind}</span>
              </div>

              <h3 className="relative mt-6 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {v.name}
              </h3>

              <p className="relative mt-4 flex-1 leading-relaxed text-muted text-pretty md:text-lg">{v.body}</p>

              <div className="relative mt-7 flex items-center gap-2 border-t border-line pt-5 text-sm text-ink">
                <Instagram className="h-4 w-4 text-accent" aria-hidden="true" />
                <span className="link-underline">{v.handle}</span>
                <ArrowUpRight className="h-4 w-4 text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
