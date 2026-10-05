import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { useRef } from 'react';
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

function ScrubQuote({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');

  return (
    <p ref={ref} className="serif-i mt-8 max-w-5xl text-[clamp(2rem,8.4vw,4.4rem)] leading-[1.08]">
      <span className="sr-only">{text}</span>
      {words.map((w, i) =>
        reduced ? (
          <span key={i} aria-hidden="true">
            {w}{' '}
          </span>
        ) : (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ),
      )}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <>
      <motion.span aria-hidden="true" className="inline-block" style={{ opacity, y }}>
        {children}
      </motion.span>{' '}
    </>
  );
}

/** The portrait as a duotone on a blob of the accent colour, with a badge turning round it. */
function Portrait() {
  const reduced = useReducedMotion();
  const badge = `${profile.name} · builds things · ${profile.location} · `;

  return (
    <div className="relative mx-auto w-[min(78vw,340px)] md:mx-0">
      <motion.div
        className="aspect-square overflow-hidden bg-accent"
        animate={reduced ? undefined : { borderRadius: ['42% 58% 52% 48%', '55% 45% 40% 60%', '42% 58% 52% 48%'] }}
        style={{ borderRadius: '42% 58% 52% 48%' }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={profile.portrait}
          alt={profile.name}
          width={512}
          height={512}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover mix-blend-multiply contrast-[1.15] grayscale"
        />
      </motion.div>

      <motion.svg
        viewBox="0 0 200 200"
        className="absolute -bottom-8 -right-6 h-32 w-32 rounded-full bg-fg text-bg"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        <defs>
          <path id="badge-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <text fontSize="17.5" fontWeight="600" letterSpacing="1.5" fill="currentColor" fontFamily="DM Sans, sans-serif">
          <textPath href="#badge-circle">{badge.toUpperCase()}</textPath>
        </text>
        <text x="100" y="114" textAnchor="middle" fontSize="40" fill="currentColor">
          ✦
        </text>
      </motion.svg>
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
