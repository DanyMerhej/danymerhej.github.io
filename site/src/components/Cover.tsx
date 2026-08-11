import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { chapters, marqueeItems, profile } from '../data/site';
import { FitText } from './FitText';
import { Mask } from './Motion';

/**
 * The cover. Laid out like the front of a magazine: masthead across the top,
 * the name at full bleed, then a three-column foot carrying the portrait, the
 * standfirst and the contents list.
 *
 * MERHEJ is drawn as an outline that fills with ink as you scroll through the
 * cover, so the first scroll of the page does something.
 */
export function Cover({ intro }: { intro: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // The solid copy is revealed left to right over the outlined one.
  const fill = useTransform(scrollYProgress, [0, 0.55], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);

  // Everything drifts up a little slower than the scroll, for depth.
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // Hold the entrance until the curtain has cleared.
  const begin = intro ? 2.0 : 0.15;

  return (
    <header id="cover" ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden pt-20 md:pt-24">
      <motion.div className="flex-1" style={reduced ? undefined : { y: lift, opacity: fade }}>
        {/* Masthead */}
        <div className="gutter">
          <motion.div
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-rule pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: begin }}
          >
            <span className="label">{profile.title}</span>
            <span className="label">{profile.location}</span>
            <span className="label hidden sm:inline">
              Available for the right conversation
            </span>
          </motion.div>
        </div>

        {/* The name, at full bleed */}
        <div className="gutter mt-8 md:mt-12">
          <h1 className="display">
            <Mask delay={begin} immediate className="block">
              <FitText max={250}>DANNY</FitText>
            </Mask>

            <Mask delay={begin + 0.12} immediate className="relative block">
              <span className="relative block">
                {/* Outline sits underneath */}
                <FitText
                  max={250}
                  className="text-transparent"
                  aria-hidden="true"
                  style={{ WebkitTextStroke: '1.5px rgb(var(--ink))' }}
                >
                  MERHEJ
                </FitText>
                {/* Solid copy, wiped in on scroll */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 block text-ink"
                  style={reduced ? undefined : { clipPath: fill }}
                >
                  <FitText max={250}>MERHEJ</FitText>
                </motion.span>
                <span className="sr-only">Merhej</span>
              </span>
            </Mask>
          </h1>
        </div>

        {/* Foot: portrait, standfirst, contents */}
        <div className="gutter mt-10 md:mt-16">
          <div className="grid grid-cols-1 gap-8 border-t border-rule pt-8 md:grid-cols-12 md:gap-10">
            <motion.figure
              className="order-2 md:order-1 md:col-span-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: begin + 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={profile.portrait}
                alt={profile.name}
                width={512}
                height={512}
                className="w-full max-w-[13rem] object-cover contrast-[1.05] grayscale md:max-w-none"
              />
            </motion.figure>

            <motion.div
              className="order-1 md:order-2 md:col-span-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: begin + 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="lede pretty max-w-2xl">{profile.intro}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#works" className="action-solid">
                  See the work
                </a>
                <a href={`mailto:${profile.email}`} className="action-line">
                  Get in touch
                </a>
              </div>
            </motion.div>

            {/* Contents, the way a magazine lists them */}
            <motion.nav
              aria-label="Contents"
              className="order-3 md:col-span-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: begin + 0.6 }}
            >
              <p className="label mb-4">Contents</p>
              <ul>
                {chapters.map((c, i) => (
                  <li key={c.id} className="border-t border-rule">
                    <a
                      href={`#${c.id}`}
                      className="group flex min-h-[2.75rem] items-baseline gap-3 py-3 text-sm text-ink-2 transition-colors duration-500 hover:text-ink"
                    >
                      <span className="font-mono text-[10px] text-ink-3">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="ul-draw">{c.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </div>
        </div>
      </motion.div>

      {/* Foot ticker */}
      <motion.div
        className="mt-12 shrink-0 border-t border-rule py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: begin + 0.8 }}
      >
        <div className="overflow-hidden">
          <ul className="flex w-max animate-ticker items-center gap-8 pr-8">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <li key={`${item}-${i}`} className="label shrink-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </header>
  );
}
