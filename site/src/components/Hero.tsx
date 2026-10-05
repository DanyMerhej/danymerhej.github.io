import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';
import { profile, projects, worlds } from '../data/site';
import { useWorld } from '../lib/hooks';
import { scrollToId } from '../lib/smooth';
import { KineticWord, RotatingWord } from './Kinetic';
import { Liquid } from './Liquid';

const EASE = [0.22, 1, 0.36, 1] as const;

// The products' own colours, so the first thing on the page is the work.
const LIQUID: [string, string, string, string] = ['#C6F94E', '#FF5FB4', '#FF7A2F', '#5B6CFF'];
const WORD_COLOURS = ['#C6F94E', '#F0A6E0', '#FFB86B', '#8FB8FF', '#FFD166', '#FF8A5B'];

/**
 * The opening screen. Moving colour runs underneath, but the page lays a dark
 * sheet over it in multiply mode, with the name cut out of that sheet in white.
 * So the colour shows at full strength only inside the letters of the name,
 * and faintly everywhere else, and a finger dragged across the screen stirs
 * the paint inside the type.
 *
 * Two layers share one grid cell: the sheet with the name, and the readable
 * copy on top with a same-sized gap where the name sits.
 */
export function Hero({ intro }: { intro: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorld(ref, 'top', worlds.night);

  const begin = intro ? 2.3 : 0.2;
  const liveCount = projects.filter((p) => p.status === 'live').length;
  const products = projects.filter((p) => p.kind === 'product').length;

  const rise = (d: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay: begin + d, ease: EASE },
  });

  const name = (live: boolean) => (
    <h1 className={`display ${live ? '' : 'invisible'}`} aria-hidden={live ? undefined : true}>
      {live && <span className="sr-only">{profile.name}</span>}
      <KineticWord text={profile.first} delay={begin} max={260} still={!live} />
      <KineticWord text={profile.last} delay={begin + 0.12} max={260} still={!live} className="-mt-[0.08em]" />
    </h1>
  );

  const copy = (live: boolean) => (
    <div className={live ? '' : 'invisible'} aria-hidden={live ? undefined : true}>
      <motion.p
        {...(live ? rise(0.35) : {})}
        className="display mt-6 text-[clamp(1.6rem,7vw,3.2rem)] font-semibold leading-[1.05]"
      >
        I build <RotatingWord words={profile.builds} colours={WORD_COLOURS} />
      </motion.p>

      <motion.p {...(live ? rise(0.45) : {})} className="lede pretty mt-5 max-w-2xl text-fg/85">
        {profile.hero} {profile.heroSub}
      </motion.p>

      <motion.div {...(live ? rise(0.55) : {})} className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => scrollToId('products')} className="btn-accent" data-cursor="Go" tabIndex={live ? 0 : -1}>
          See my products
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollToId('contact')}
          className="btn-ghost bg-bg/30 backdrop-blur-md"
          tabIndex={live ? 0 : -1}
        >
          Say hello
        </button>
      </motion.div>

      <motion.ul {...(live ? rise(0.65) : {})} className="mt-9 flex flex-wrap gap-2">
        {[
          `${projects.length} things built`,
          `${products} products of my own`,
          `${liveCount} live right now`,
          '30+ insurers on IRIS',
        ].map((s) => (
          <li key={s} className="chip bg-fg/10 backdrop-blur-md">
            {s}
          </li>
        ))}
      </motion.ul>
    </div>
  );

  const pill = (live: boolean) => (
    <motion.p
      {...(live ? rise(0) : {})}
      className={`eyebrow mb-6 self-start border-fg/25 bg-bg/40 backdrop-blur-md ${live ? '' : 'invisible'}`}
      aria-hidden={live ? undefined : true}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-pulse2 rounded-full bg-accent" />
        <span className="relative h-2 w-2 rounded-full bg-accent" />
      </span>
      {profile.location} · open to the right conversation
    </motion.p>
  );

  const frame = 'col-start-1 row-start-1 flex min-h-[100svh] flex-col justify-end pb-28 pt-28 md:pb-24';

  return (
    <section id="top" ref={ref} className="relative isolate grid grid-cols-1 overflow-hidden">
      <Liquid colours={LIQUID} background={worlds.night.bg} className="absolute inset-0" />

      {/* The sheet: dark everywhere, clear through the letters. */}
      <div className={`${frame} relative`} style={{ background: '#3B3550', mixBlendMode: 'multiply' }}>
        <div className="gutter flex flex-col text-white">
          {pill(false)}
          {name(true)}
          {copy(false)}
        </div>
      </div>

      {/* The words you read, above the sheet. */}
      <div className={`${frame} relative`}>
        <div className="gutter flex flex-col">
          {pill(true)}
          {name(false)}
          {copy(true)}
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-6 right-5 hidden items-center gap-3 text-[13px] text-fg/70 sm:flex md:right-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: begin + 1.2 }}
      >
        <span>Scroll, or stir the colour</span>
        <span className="flex h-10 w-6 justify-center rounded-full border-2 border-fg/40 pt-1.5">
          <motion.span
            className="h-2 w-1 rounded-full bg-fg"
            animate={reduced ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  );
}
