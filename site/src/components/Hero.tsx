import { ArrowDown } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { profile, projects, worlds } from '../data/site';
import { introIsPlaying, useIntroPlaying, useWorld } from '../lib/hooks';
import { scrollToId } from '../lib/smooth';
import { WhatsAppIcon } from './Icons';
import { KineticWord, RotatingWord } from './Kinetic';
import { Liquid } from './Liquid';

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
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useWorld(ref, 'top', worlds.night);

  // Fixed at first render: when the intro ends, the entrances already under way
  // must not have their delays rewritten, or they would jump to the end.
  const [begin] = useState(() => (introIsPlaying() ? 2.3 : 0.2));
  // Nobody can see the colour behind the intro, so it waits.
  const covered = useIntroPlaying();
  const liveCount = projects.filter((p) => p.status === 'live').length;
  const products = projects.filter((p) => p.kind === 'product').length;

  // CSS entrances: they run on the compositor while the page is still busy loading.
  const rise = (live: boolean, d: number) =>
    live ? { className: 'enter-rise', style: { '--d': `${begin + d}s` } as CSSProperties } : {};

  const name = (live: boolean) => (
    <h1 className={`display ${live ? '' : 'invisible'}`} aria-hidden={live ? undefined : true}>
      {live && <span className="sr-only">{profile.name}</span>}
      <KineticWord text={profile.first} delay={begin} max={260} still={!live} />
      <KineticWord text={profile.last} delay={begin + 0.12} max={260} still={!live} className="-mt-[0.08em]" />
    </h1>
  );

  const copy = (live: boolean) => (
    <div className={live ? '' : 'invisible'} aria-hidden={live ? undefined : true}>
      <div {...rise(live, 0.35)}>
        <p className="display mt-6 text-[clamp(1.6rem,7vw,3.2rem)] font-semibold leading-[1.05]">
          I build <RotatingWord words={profile.builds} colours={WORD_COLOURS} />
        </p>
      </div>

      <div {...rise(live, 0.45)}>
        <p className="lede pretty mt-5 max-w-2xl text-fg/85">
          {profile.hero} {profile.heroSub}
        </p>
      </div>

      <div {...rise(live, 0.55)}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => scrollToId('products')}
            className="btn-accent gap-2 px-3 sm:px-6"
            data-cursor="Go"
            tabIndex={live ? 0 : -1}
          >
            My products
            <ArrowDown className="h-4 w-4 shrink-0" />
          </button>
          <a
            href={profile.whatsapp}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-whatsapp gap-2 px-3 sm:px-6"
            tabIndex={live ? 0 : -1}
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0" />
            WhatsApp
          </a>
        </div>
      </div>

      <div {...rise(live, 0.65)}>
        <ul className="mt-9 flex flex-wrap gap-2">
          {[
            `${projects.length} things built`,
            `${products} products of my own`,
            `${liveCount} live right now`,
            '30+ insurers on IRIS',
          ].map((s) => (
            <li key={s} className="chip bg-fg/10">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const frame = 'col-start-1 row-start-1 flex min-h-[100svh] flex-col justify-end pb-28 pt-28 md:pb-24';

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate grid grid-cols-1 overflow-hidden"
      // The letters' scroll scatter follows this timeline (index.css, .sd-scatter).
      style={{ viewTimelineName: '--hero' } as CSSProperties}
    >
      <Liquid colours={LIQUID} background={worlds.night.bg} paused={covered} className="absolute inset-0" />

      {/* The sheet: dark everywhere, clear through the letters. */}
      <div className={`${frame} relative`} style={{ background: '#3B3550', mixBlendMode: 'multiply' }}>
        <div className="gutter flex flex-col text-white">
          {name(true)}
          {copy(false)}
        </div>
      </div>

      {/* The words you read, above the sheet. */}
      <div className={`${frame} relative`}>
        <div className="gutter flex flex-col">
          {name(false)}
          {copy(true)}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="enter-rise absolute bottom-6 right-5 hidden items-center gap-3 text-[13px] text-fg/70 sm:flex md:right-12"
        style={{ '--d': `${begin + 1.2}s` } as CSSProperties}
      >
        <span>Scroll, or stir the colour</span>
        <span className="flex h-10 w-6 justify-center rounded-full border-2 border-fg/40 pt-1.5">
          <span className="float-cue h-2 w-1 rounded-full bg-fg" />
        </span>
      </div>
    </section>
  );
}
