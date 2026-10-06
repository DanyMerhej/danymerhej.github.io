import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { profile, worlds } from '../data/site';
import { useWorld } from '../lib/hooks';
import { Rise } from './Motion';

const QUOTE =
  'Enterprise work taught me what it costs when software breaks. Building my own products taught me how fast it can move when nothing is in the way.';

/**
 * About: the one line that sums it up, lit word by word as you read down the
 * page, then the longer story in four short pieces rather than one long wall.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);
  useWorld(ref, 'about', worlds.cream);

  return (
    <section id="about" ref={ref} className="py-24 md:py-36">
      <div className="gutter">
        <p className="eyebrow">About</p>
        <ScrubQuote text={QUOTE} />

        <div className="mt-20 grid grid-cols-1 gap-12 md:mt-28 md:grid-cols-12">
          <div className="md:col-span-4">
            <Portrait />
            <dl className="mt-10 space-y-5">
              <Fact label="Based in" value={profile.location} />
              <Fact label="Education" value={profile.education.degree} sub={profile.education.school} />
              <div>
                <dt className="text-[13px] font-semibold text-fg/60">Languages</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {profile.languages.map((l) => (
                    <span key={l.name} className="chip">
                      {l.name} <span className="font-normal opacity-60">· {l.level}</span>
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:col-span-8">
            {profile.summary.map((p, i) => (
              <Rise key={i} delay={i * 0.06} className="card bg-fg/[0.05] p-6 sm:p-7">
                <p className="font-display text-[1.35rem] font-bold leading-tight text-accent">
                  {profile.summaryHeads[i]}
                </p>
                <p className="prose-body pretty mt-3 text-[1rem]">{p}</p>
              </Rise>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Each word fades up over its own slice of the paragraph's passage through
 * the screen. The slices are CSS animation ranges on a scroll timeline
 * (index.css, .sd-word), so it is all done off the main thread; without
 * scroll timelines the words are simply there.
 */
function ScrubQuote({ text }: { text: string }) {
  const words = text.split(' ');
  // The paragraph lights between 10% and 62% of its cover range: from just
  // after it enters to a little above the middle of the screen.
  const from = 10;
  const to = 62;
  const step = (to - from) / words.length;

  return (
    <p
      className="serif-i mt-8 max-w-5xl text-[clamp(2rem,8.4vw,4.4rem)] leading-[1.08]"
      style={{ viewTimelineName: '--quote' } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span
            className="sd-word inline-block"
            style={{ '--a': `${(from + i * step).toFixed(2)}%`, '--b': `${(from + (i + 1) * step).toFixed(2)}%` } as CSSProperties}
          >
            {w}
          </span>{' '}
        </span>
      ))}
    </p>
  );
}

/** The portrait on a blob of the accent colour, with a badge turning round it. */
function Portrait() {
  const badge = `${profile.name} · builds things · ${profile.location} · `;

  return (
    <div className="relative mx-auto w-[min(78vw,340px)] md:mx-0">
      <div className="wobble absolute inset-[-4%] rounded-[46%] bg-accent" aria-hidden="true" />
      <img
        src={profile.portrait}
        alt={profile.name}
        width={640}
        height={640}
        loading="lazy"
        decoding="async"
        className="relative aspect-square w-full rounded-[42%] object-cover"
      />

      <svg
        viewBox="0 0 200 200"
        className="spin-badge absolute -bottom-8 -right-6 h-32 w-32 rounded-full bg-fg text-bg"
        aria-hidden="true"
      >
        <defs>
          <path id="badge-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <text fontSize="16" fontWeight="600" letterSpacing="1.5" fill="currentColor" fontFamily="DM Sans, sans-serif">
          <textPath href="#badge-circle">{badge.toUpperCase()}</textPath>
        </text>
        <text x="100" y="114" textAnchor="middle" fontSize="40" fill="currentColor">
          ✦
        </text>
      </svg>
    </div>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-[13px] font-semibold text-fg/60">{label}</dt>
      <dd className="mt-1 text-[17px] font-medium">
        {value}
        {sub && <span className="block text-[15px] font-normal text-fg/70">{sub}</span>}
      </dd>
    </div>
  );
}
