import { useEffect, useState } from 'react';
import { projects } from '../data/site';
import { ProjectCard } from './ProjectCard';
import { ProjectDialog } from './ProjectDialog';
import { Reveal, SectionHeading } from './Reveal';

export function Projects() {
  const [openId, setOpenId] = useState<string | null>(null);

  // The command palette can open a project directly.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => setOpenId(id), 450);
    };
    window.addEventListener('open-project', handler);
    return () => window.removeEventListener('open-project', handler);
  }, []);

  const active = projects.find((p) => p.id === openId) ?? null;
  const [first, second, ...rest] = projects;

  return (
    <section id="projects" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeading
        index="02 / Projects"
        title="Six products, built end to end."
        lead="Everything below I designed and built myself: schema, security model, API, interface, deployment and store listing. Two are trading today, the rest are in active development."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {[first, second].map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="flex">
            <div className="flex w-full">
              <ProjectCard project={p} featured onOpen={() => setOpenId(p.id)} />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {rest.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06} className="flex">
            <div className="flex w-full">
              <ProjectCard project={p} onOpen={() => setOpenId(p.id)} />
            </div>
          </Reveal>
        ))}
      </div>

      <ProjectDialog project={active} onClose={() => setOpenId(null)} />
    </section>
  );
}
