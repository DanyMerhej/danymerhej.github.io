import { useRef } from 'react';
import type { Project } from '../data/site';
import { projects, worlds } from '../data/site';
import { useWorld } from '../lib/hooks';
import { CrossedBands } from './Marquee';
import { Mask, Words } from './Motion';
import { ProductWorld } from './ProductWorld';
import { ToyBox } from './ToyBox';

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const spell = (n: number) => NUMBER_WORDS[n] ?? String(n);

/**
 * The products I own come first, and get the most room: the toy box with
 * every mark in it, then one full-colour world per product.
 */
export function Products({ onOpen }: { onOpen: (p: Project, x: number, y: number) => void }) {
  const intro = useRef<HTMLDivElement>(null);
  useWorld(intro, 'products-intro', worlds.lilac);

  const mine = projects.filter((p) => p.kind === 'product');
  const names = mine.map((p) => p.name.split(':')[0]);

  return (
    <section id="products" className="relative scroll-mt-0">
      <div ref={intro} className="pb-10 pt-24 md:pt-36">
        <div className="gutter">
          <p className="eyebrow">My products</p>
          <Mask as="h2" className="display h-section mt-6 max-w-5xl">
            <span className="block">{spell(projects.length)} things I built.</span>
          </Mask>
          <Mask as="p" delay={0.08} className="serif-i h-section max-w-5xl text-accent">
            <span className="block">Go on, throw them around.</span>
          </Mask>
          <p className="lede pretty mt-8 max-w-2xl">
            <Words
              text={`${spell(mine.length)} of them are my own products, start to finish: schema, security model, API, interface, deployment, store listing. The rest are storefronts and sites for brands that sell.`}
            />
          </p>

          <div className="mt-10 md:mt-14">
            <ToyBox onOpen={onOpen} />
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <CrossedBands
            top={names.map((n) => (
              <span key={n} className="flex items-center gap-6 px-3 font-display text-[clamp(1.6rem,6vw,3.4rem)] font-extrabold tracking-tight">
                {n} <span aria-hidden="true">✦</span>
              </span>
            ))}
            bottom={['Designed', 'Built', 'Shipped', 'Run by me'].map((n) => (
              <span key={n} className="flex items-center gap-6 px-3 font-serif text-[clamp(1.6rem,6vw,3.4rem)] italic">
                {n} <span aria-hidden="true">●</span>
              </span>
            ))}
          />
        </div>
      </div>

      {mine.map((p, i) => (
        <ProductWorld key={p.id} project={p} index={i} total={mine.length} onOpen={onOpen} />
      ))}
    </section>
  );
}
