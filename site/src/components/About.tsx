import { GraduationCap, Languages, MapPin } from 'lucide-react';
import { profile } from '../data/site';
import { Reveal, SectionHeading } from './Reveal';

export function About() {
  return (
    <section id="about" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeading index="04 / About" title="The short version." />

      <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="font-serif text-2xl italic leading-snug text-ink text-balance md:text-[2.1rem]">
              “Enterprise work taught me what it costs when software breaks. Building my own
              products taught me how fast it can move when nothing is in the way.”
            </p>
          </Reveal>

          <div className="mt-10 space-y-6">
            {profile.summary.map((p, i) => (
              <Reveal key={i} delay={0.05 + i * 0.05}>
                <p className="text-base leading-relaxed text-muted text-pretty md:text-lg">{p}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Reveal delay={0.1}>
            <InfoCard icon={<MapPin className="h-4 w-4" />} label="Based in">
              <p className="font-display text-xl font-semibold tracking-tight">{profile.location}</p>
              <p className="mt-1.5 text-sm text-muted">
                Working with teams and clients across the Middle East, Africa and Europe.
              </p>
            </InfoCard>
          </Reveal>

          <Reveal delay={0.16}>
            <InfoCard icon={<GraduationCap className="h-4 w-4" />} label="Education">
              <p className="font-display text-xl font-semibold tracking-tight">{profile.education.degree}</p>
              <p className="mt-1.5 text-sm text-muted">{profile.education.school}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                {profile.education.year}
              </p>
            </InfoCard>
          </Reveal>

          <Reveal delay={0.22}>
            <InfoCard icon={<Languages className="h-4 w-4" />} label="Languages">
              <ul className="space-y-3">
                {profile.languages.map((l) => (
                  <li key={l.name} className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-lg font-medium tracking-tight">{l.name}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                      {l.level}
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 transition-colors duration-300 hover:border-faint md:p-7">
      <div className="flex items-center gap-2.5 text-faint">
        <span className="text-accent">{icon}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
