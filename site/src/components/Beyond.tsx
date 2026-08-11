import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { ventures } from '../data/site';
import type { Venture } from '../data/site';
import { useHueClaim, useInCentre } from '../lib/hooks';
import { Mask, Words } from './Motion';

/** The two things outside software, each given its own colour and half spread. */
export function Beyond() {
  return (
    <section id="beyond" className="scroll-mt-16 py-24 md:py-36">
      <div className="gutter">
        <p className="label">04 / Beyond code</p>
        <Mask as="h2" className="display section-type mt-6 max-w-4xl">
          <span className="block">Not everything</span>
        </Mask>
        <Mask as="div" delay={0.08} className="display section-type max-w-4xl">
          <span className="block hue">I make is software.</span>
        </Mask>
        <p className="lede pretty mt-8 max-w-2xl">
          <Words text="Two things I run outside the terminal. They keep the other half of the job honest: taste, audience, and knowing why something works." />
        </p>
      </div>

      {ventures.map((v, i) => (
        <Spread key={v.id} venture={v} index={i} />
      ))}
    </section>
  );
}

function Spread({ venture, index }: { venture: Venture; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const centred = useInCentre(ref);
  useHueClaim(venture.id, venture.hues[0], centred);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const markY = useTransform(scrollYProgress, [0, 1], ['16%', '-16%']);

  const flipped = index % 2 === 1;

  return (
    <div ref={ref} className="gutter mt-20 md:mt-32">
      <a
        href={venture.href}
        target="_blank"
        rel="noreferrer noopener"
        className="group grid items-center gap-8 border-t border-rule pt-10 md:grid-cols-12 md:gap-12"
      >
        <motion.div
          className={`md:col-span-4 ${flipped ? 'md:order-2 md:col-start-9' : ''}`}
          style={reduced ? undefined : { y: markY }}
        >
          <span
            className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.5rem] border
                       transition-transform duration-700 group-hover:scale-105 sm:h-36 sm:w-36
                       md:h-48 md:w-48 md:rounded-[2rem]"
            style={{
              background: 'linear-gradient(150deg, #16181C, #08090B)',
              borderColor: `${venture.hues[0]}33`,
              boxShadow: `0 24px 60px -20px ${venture.hues[0]}55`,
            }}
          >
            <img
              src={venture.logo}
              alt=""
              width={320}
              height={320}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-4 md:p-6"
            />
          </span>
        </motion.div>

        <div className={`md:col-span-7 ${flipped ? 'md:order-1 md:col-start-1' : 'md:col-start-6'}`}>
          <p className="label">{venture.kind}</p>
          <h3 className="display mt-3 text-[2.1rem] leading-none transition-colors duration-500 group-hover:text-hue md:text-[3.4rem]">
            {venture.name}
          </h3>
          <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-ink-2 pretty md:text-lg">
            {venture.body}
          </p>
          <span className="mt-7 inline-flex items-center gap-2 text-sm text-ink">
            <Instagram className="h-4 w-4 hue" aria-hidden="true" />
            <span className="ul-draw">{venture.handle}</span>
            <ArrowUpRight className="h-4 w-4 text-ink-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </a>
    </div>
  );
}
