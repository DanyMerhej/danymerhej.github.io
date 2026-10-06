import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { capabilities, toolkit, worlds } from '../data/site';
import { useWorld } from '../lib/hooks';
import { Mask, Rise, Words } from './Motion';

const CARD = ['#FFFFFF', '#C6F94E', '#F0A6E0', '#FFB86B', '#8FB8FF', '#FFD166', '#C6A8FF'];

/**
 * What I do, as cards you swipe through rather than a list you scroll past,
 * and the toolkit as tabs, so it reads one group at a time.
 */
export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  useWorld(ref, 'skills', worlds.mint);
  const [tab, setTab] = useState(0);

  const nudge = (dir: number) => {
    const r = rail.current;
    if (!r) return;
    r.scrollBy({ left: dir * Math.min(r.clientWidth * 0.8, 420), behavior: 'smooth' });
  };

  return (
    <section id="skills" ref={ref} className="py-24 md:py-36">
      <div className="gutter">
        <p className="eyebrow">What I do</p>
        <Mask as="h2" className="display h-section mt-6 max-w-5xl">
          <span className="block">Two disciplines,</span>
        </Mask>
        <Mask as="p" delay={0.06} className="serif-i h-section max-w-5xl text-accent">
          <span className="block">sharpening each other.</span>
        </Mask>
        <p className="lede pretty mt-8 max-w-2xl">
          <Words text="Enterprise systems that must not break, and independent products that must ship. And, off the screen entirely, houses wired to do what they are told." />
        </p>

        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="text-[15px] text-fg/70">
            {capabilities.length} things I am good at. Swipe through.
          </p>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => nudge(-1)} aria-label="Previous" className="btn-ghost h-12 w-12 px-0">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => nudge(1)} aria-label="Next" className="btn-ghost h-12 w-12 px-0">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* A row that only scrolls sideways: overflow-y is pinned to hidden, the
          cards carry no offset that could poke out of it, and the padding gives
          the hover lift room. */}
      <Rise>
      <ul
        ref={rail}
        className="no-bar mt-6 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth px-5 py-3 sm:px-8 lg:px-12"
      >
        {capabilities.map((c, i) => (
          <li
            key={c.title}
            className="flex w-[82vw] max-w-[380px] shrink-0 snap-center flex-col rounded-[2rem] p-6 text-[#13101C] transition-transform duration-300 ease-out sm:snap-start [@media(hover:hover)]:hover:-translate-y-1.5"
            style={{ background: CARD[i % CARD.length] }}
          >
            <div className="flex items-start justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#13101C] text-[26px] text-white">
                {c.glyph}
              </span>
              <span className="font-display text-[15px] font-bold opacity-50">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="display mt-6 text-[1.75rem] leading-[1.02]">{c.title}</h3>
            <p className="pretty mt-3 text-[15.5px] leading-relaxed opacity-80">{c.body}</p>
            <ul className="mt-auto space-y-1.5 pt-6">
              {c.points.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[14px] font-medium">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#13101C]" />
                  {p}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      </Rise>

      {/* The toolkit, one group at a time */}
      <div className="gutter mt-20 md:mt-28">
        <h3 className="display text-[clamp(2rem,7vw,3.6rem)]">The toolkit</h3>
        <LayoutGroup>
          <div
            role="tablist"
            aria-label="Toolkit groups"
            className="no-bar -mx-5 mt-6 flex gap-1.5 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {toolkit.map((g, i) => (
              <button
                key={g.group}
                role="tab"
                type="button"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
                className="relative shrink-0 rounded-full px-4 py-2.5 text-[14.5px] font-semibold"
              >
                {tab === i && (
                  <motion.span
                    layoutId="tool-tab"
                    className="absolute inset-0 rounded-full bg-fg"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative transition-colors ${tab === i ? 'text-bg' : 'text-fg/75'}`}>{g.group}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        <div role="tabpanel" className="mt-6 min-h-[8rem]">
          <AnimatePresence mode="wait">
            <motion.ul
              key={tab}
              className="flex flex-wrap gap-2.5"
              initial="hidden"
              animate="shown"
              exit="hidden"
              transition={{ staggerChildren: 0.035 }}
            >
              {toolkit[tab].items.map((item, i) => (
                <motion.li
                  key={item}
                  variants={{
                    hidden: { opacity: 0, scale: 0.6, y: 14 },
                    shown: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  className="rounded-2xl px-4 py-3 text-[16px] font-semibold text-[#13101C]"
                  style={{ background: CARD[(i + tab + 1) % CARD.length] }}
                >
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
