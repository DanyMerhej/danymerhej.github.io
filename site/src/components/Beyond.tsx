import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Cloud, CloudOff, Lightbulb, Instagram, Radio } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Venture } from '../data/site';
import { capabilities, ventures, worlds } from '../data/site';
import { useWorld } from '../lib/hooks';
import { Mask, Rise, Words } from './Motion';

const home = capabilities.find((c) => c.title.toLowerCase().includes('automation'));

const ROOMS = [
  { id: 'living', name: 'Living room', x: 0, y: 0, w: 58, h: 55 },
  { id: 'kitchen', name: 'Kitchen', x: 58, y: 0, w: 42, h: 55 },
  { id: 'bed', name: 'Bedroom', x: 0, y: 55, w: 46, h: 45 },
  { id: 'office', name: 'Office', x: 46, y: 55, w: 54, h: 45 },
] as const;
type RoomId = (typeof ROOMS)[number]['id'];

const SCENES: { name: string; on: RoomId[] }[] = [
  { name: 'Evening', on: ['living', 'kitchen'] },
  { name: 'Movie night', on: ['living'] },
  { name: 'Working', on: ['office'] },
  { name: 'All off', on: [] },
];

export function Beyond() {
  const ref = useRef<HTMLDivElement>(null);
  useWorld(ref, 'beyond', worlds.midnight);

  return (
    <section id="beyond" className="relative">
      <div ref={ref} className="py-24 md:py-36">
        <div className="gutter">
          <p className="eyebrow">Beyond code</p>
          <Mask as="h2" className="display h-section mt-6 max-w-5xl">
            <span className="block">Not everything</span>
          </Mask>
          <Mask as="p" delay={0.06} className="serif-i h-section max-w-5xl text-accent">
            <span className="block">I make is software.</span>
          </Mask>
          <p className="lede pretty mt-8 max-w-2xl">
            <Words text="Houses that do what they are told, photographs, and a skincare brand. They keep the other half of the job honest: taste, audience, and knowing why something works." />
          </p>
        </div>

        <div className="gutter mt-14 grid grid-cols-1 items-center gap-10 md:mt-20 md:grid-cols-12">
          <div className="md:col-span-5">
            <h3 className="display text-[clamp(2rem,8vw,3.4rem)]">{home?.title ?? 'Home automation'}</h3>
            <p className="prose-body pretty mt-4">{home?.body}</p>
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {home?.points.map((p) => (
                <li key={p} className="chip">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-7">
            <House />
          </div>
        </div>
      </div>

      {ventures.map((v, i) => (
        <VentureSpread key={v.id} venture={v} index={i} />
      ))}
    </section>
  );
}

/** A floor plan you can switch on room by room, on a mesh that keeps working with the internet unplugged. */
function House() {
  const [lit, setLit] = useState<Set<RoomId>>(new Set(['living']));
  const [online, setOnline] = useState(true);
  const [pulse, setPulse] = useState<{ id: number; room: RoomId } | null>(null);
  const reduced = useReducedMotion();

  const toggle = (id: RoomId) => {
    setLit((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setPulse({ id: Date.now(), room: id });
  };

  const scene = (on: RoomId[]) => {
    setLit(new Set(on));
    on.forEach((r, i) => setTimeout(() => setPulse({ id: Date.now() + i, room: r }), i * 120));
  };

  const hub = { x: 50, y: 55 };

  return (
    <div>
      <div className="relative aspect-[10/8] w-full overflow-hidden rounded-[1.75rem] border-2 border-fg/15 bg-[#091024]">
        {ROOMS.map((r) => {
          const on = lit.has(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              aria-pressed={on}
              aria-label={`${r.name} lights`}
              className="absolute border border-white/10 text-left transition-colors duration-700"
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: `${r.w}%`,
                height: `${r.h}%`,
                background: on
                  ? 'radial-gradient(circle at 50% 45%, rgba(255,200,97,0.75), rgba(255,170,60,0.18) 60%, rgba(9,16,36,0.2))'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              <span className={`absolute left-3 top-3 text-[12px] font-semibold ${on ? 'text-[#2A1A00]' : 'text-white/60'}`}>
                {r.name}
              </span>
              <motion.span
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full"
                animate={{
                  backgroundColor: on ? '#FFC861' : 'rgba(255,255,255,0.08)',
                  boxShadow: on ? '0 0 30px 8px rgba(255,200,97,0.6)' : '0 0 0 0 rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.5 }}
              >
                <Lightbulb className={`h-4 w-4 ${on ? 'text-[#2A1A00]' : 'text-white/60'}`} />
              </motion.span>
            </button>
          );
        })}

        {/* The mesh: hub to every room, with a pulse along the line that just changed. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {ROOMS.map((r) => (
            <line
              key={r.id}
              x1={hub.x}
              y1={hub.y}
              x2={r.x + r.w - 8}
              y2={r.y + r.h - 10}
              stroke="#8FB8FF"
              strokeOpacity={0.35}
              strokeWidth={0.4}
              strokeDasharray="1.2 1.2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <AnimatePresence>
            {pulse && !reduced && (() => {
              const r = ROOMS.find((x) => x.id === pulse.room)!;
              return (
                <motion.circle
                  key={pulse.id}
                  r={1.4}
                  fill="#C6F94E"
                  initial={{ cx: hub.x, cy: hub.y, opacity: 1 }}
                  animate={{ cx: r.x + r.w - 8, cy: r.y + r.h - 10, opacity: [1, 1, 0] }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              );
            })()}
          </AnimatePresence>
        </svg>

        <div
          className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#C6F94E] px-2.5 py-1 text-[11px] font-bold text-[#0D1430]"
          style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
        >
          <Radio className="h-3.5 w-3.5" /> Hub
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SCENES.map((s) => (
          <button key={s.name} type="button" onClick={() => scene(s.on)} className="btn-ghost min-h-[2.6rem] px-4 text-[14px]">
            {s.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOnline((o) => !o)}
          aria-pressed={!online}
          className={`btn min-h-[2.6rem] px-4 text-[14px] ${online ? 'bg-fg text-bg' : 'bg-[#FF6B6B] text-[#2A0505]'}`}
        >
          {online ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
          {online ? 'Unplug the internet' : 'Internet is off'}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={String(online)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 text-[15px] text-fg/75"
        >
          {online
            ? 'Tap a room, or pick a scene.'
            : 'No cloud, no problem: the hub runs locally, so the lights still answer. Try a room.'}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function VentureSpread({ venture, index }: { venture: Venture; index: number }) {
  const ref = useRef<HTMLElement>(null);
  useWorld(ref, venture.id, index === 0 ? worlds.sky : worlds.peach);

  return (
    <article
      ref={ref}
      className="py-20 md:py-28"
      // The lens follows this element's passage through the screen (index.css, .sd-aperture).
      style={index === 0 ? ({ viewTimelineName: '--lens' } as CSSProperties) : undefined}
    >
      <div className="gutter grid grid-cols-1 items-center gap-10 md:grid-cols-12">
        <div className={`flex justify-center md:col-span-5 ${index % 2 ? 'md:order-2' : ''}`}>
          {index === 0 ? (
            <Aperture />
          ) : (
            <Sparkle />
          )}
        </div>
        <div className={`md:col-span-7 ${index % 2 ? 'md:order-1' : ''}`}>
          <p className="eyebrow">{venture.kind}</p>
          <h3 className="display mt-5 text-[clamp(2.6rem,12vw,5.4rem)]">{venture.name}</h3>
          <Rise>
            <p className="prose-body pretty mt-5 max-w-xl">{venture.body}</p>
          </Rise>
          <a href={venture.href} target="_blank" rel="noreferrer noopener" className="btn-solid group mt-8">
            <Instagram className="h-4 w-4" />
            {venture.handle}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

/*
 * The lens's opening: a regular octagon, flat edge at the top. Its corners,
 * on a circle of radius 1, for an opening as wide as the lens.
 */
const SIDES = 8;
const corner = (i: number): [number, number] => {
  const a = ((i % SIDES) * 2 * Math.PI) / SIDES + Math.PI / SIDES - Math.PI / 2;
  return [Math.cos(a), Math.sin(a)];
};
const OCTAGON = `polygon(${Array.from({ length: SIDES }, (_, i) => {
  const [x, y] = corner(i);
  return `${(50 + 50 * x).toFixed(3)}% ${(50 + 50 * y).toFixed(3)}%`;
}).join(', ')})`;
/** How wide the opening is, as a share of the lens: shut, and open (index.css, iris-open). */
const SHUT = 0.1;
const OPEN = 0.74;

/**
 * A lens whose iris opens as you scroll to it.
 *
 * Drawn from the geometry rather than from overlapping blades: the opening is
 * a regular octagon of light, and each seam between blades runs from one of
 * its corners straight out to the rim, along the side it ends. Overlapping
 * blades could never all lie on top of the next one round, so one seam always
 * went missing and another showed twice; this is symmetric by construction.
 * The opening scales and the seams slide with its corners, all transforms
 * driven by the scroll on the compositor. Where scroll timelines are missing
 * the lens simply rests open.
 */
function Aperture() {
  return (
    <div className="relative aspect-square w-[min(78vw,380px)] rounded-full bg-[#0D1A3A] p-[6%] shadow-[0_40px_80px_-30px_rgba(13,26,58,0.8)]">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0D1A3A] [container-type:inline-size]">
        <div className="sd-aperture absolute inset-0">
          <div
            className="sd-iris absolute inset-0 bg-gradient-to-br from-[#8FB8FF] via-[#C7D8F5] to-[#FFD9B0]"
            style={{ clipPath: OCTAGON, transform: `scale(${OPEN})` }}
          />
          {Array.from({ length: SIDES }).map((_, i) => {
            // The seam leaves corner i+1 in the direction of the side that ends there.
            const [ax, ay] = corner(i);
            const [bx, by] = corner(i + 1);
            const angle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
            const at = (k: number) => `${(bx * k * 50).toFixed(3)}cqw, ${(by * k * 50).toFixed(3)}cqw`;
            return (
              <span
                key={i}
                aria-hidden="true"
                className="sd-seam absolute left-1/2 top-1/2 -mt-px h-[2px] w-[110cqw] origin-left bg-[#2A3F70]"
                style={
                  {
                    '--shut': `translate(${at(SHUT)}) rotate(${angle.toFixed(3)}deg)`,
                    '--open': `translate(${at(OPEN)}) rotate(${angle.toFixed(3)}deg)`,
                    transform: `translate(${at(OPEN)}) rotate(${angle.toFixed(3)}deg)`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_10px_#0D1A3A]" />
      </div>
      <img
        src={ventures[0].logo}
        alt=""
        width={160}
        height={160}
        loading="lazy"
        className="absolute bottom-[3%] right-[3%] h-[24%] w-[24%] rounded-full bg-[#0B0A10] object-contain p-2 ring-4 ring-bg"
      />
    </div>
  );
}

function Sparkle() {
  return (
    <div className="relative aspect-square w-[min(78vw,380px)]">
      <div className="wobble absolute inset-[6%] rounded-[38%] bg-gradient-to-br from-[#F2B8C6] via-[#F7D9C4] to-[#E8D5B7]" />
      <img
        src={ventures[1].logo}
        alt=""
        width={320}
        height={320}
        loading="lazy"
        className="absolute inset-[24%] h-[52%] w-[52%] rounded-full bg-[#0B0A10] object-contain p-4"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="twinkle absolute text-[28px] text-[#D6336C]"
          style={
            { left: `${[8, 80, 70, 15, 50][i]}%`, top: `${[20, 12, 78, 72, 2][i]}%`, '--d': `${i * 0.45}s` } as CSSProperties
          }
        >
          ✦
        </span>
      ))}
    </div>
  );
}
