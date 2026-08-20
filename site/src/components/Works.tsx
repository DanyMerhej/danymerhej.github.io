import { useEffect, useState } from 'react';
import { projects } from '../data/site';
import { Mask, Words } from './Motion';
import { WorkChapter } from './WorkChapter';
import { WorkDetail } from './WorkDetail';

/** Spelled out, because the heading is display type and "7 products." reads cheap. */
const NUMBER_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
  'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
];

export function Works() {
  const [openId, setOpenId] = useState<string | null>(null);

  // The menu can open a project directly.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      document.getElementById(`work-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => setOpenId(id), 700);
    };
    window.addEventListener('open-project', handler);
    return () => window.removeEventListener('open-project', handler);
  }, []);

  const active = projects.find((p) => p.id === openId) ?? null;
  const live = projects.filter((p) => p.status === 'live').length;
  // Counted from the data: this heading said "Six" for a while after the seventh
  // shipped, which is the kind of thing a visitor notices before you do.
  const built = NUMBER_WORDS[projects.length] ?? String(projects.length);

  return (
    <section id="works" className="relative scroll-mt-16">
      <div className="gutter pb-4 pt-24 md:pt-36">
        <p className="label">02 / The work</p>
        <Mask as="h2" className="display section-type mt-6 max-w-4xl">
          <span className="block">{built} products.</span>
        </Mask>
        <Mask as="div" delay={0.08} className="display section-type max-w-4xl">
          <span className="block hue">Built end to end.</span>
        </Mask>
        <p className="lede pretty mt-8 max-w-2xl">
          <Words
            text={`Schema, security model, API, interface, deployment, store listing. ${live} are live today, the rest are in active development.`}
          />
        </p>
      </div>

      {projects.map((p, i) => (
        <WorkChapter key={p.id} project={p} index={i} onOpen={() => setOpenId(p.id)} />
      ))}

      <WorkDetail project={active} onClose={() => setOpenId(null)} />
    </section>
  );
}
