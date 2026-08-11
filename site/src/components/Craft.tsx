import { motion } from 'framer-motion';
import { useState } from 'react';
import { capabilities, toolkit } from '../data/site';
import { useFinePointer } from '../lib/hooks';
import { Mask, Rise, Words } from './Motion';

/**
 * Capabilities as a typographic index rather than a grid of cards. Each line is
 * a heading in its own right; the detail expands under it on hover with a
 * pointer, and on tap without one.
 */
export function Craft() {
  const [open, setOpen] = useState<number | null>(0);
  const fine = useFinePointer();

  return (
    <section id="craft" className="scroll-mt-16 py-24 md:py-36">
      <div className="gutter">
        <p className="label">03 / What I do</p>
        <Mask as="h2" className="display section-type mt-6 max-w-4xl">
          <span className="block">Two disciplines,</span>
        </Mask>
        <Mask as="div" delay={0.08} className="display section-type max-w-4xl">
          <span className="block hue">sharpening each other.</span>
        </Mask>
        <p className="lede pretty mt-8 max-w-2xl">
          <Words text="Enterprise systems that must not break, and independent products that must ship." />
        </p>

        <ul className="mt-16 md:mt-24">
          {capabilities.map((c, i) => {
            const shown = open === i;
            return (
              <li
                key={c.title}
                className="border-t border-rule last:border-b"
                onMouseEnter={fine ? () => setOpen(i) : undefined}
              >
                <button
                  type="button"
                  onClick={() => setOpen(shown ? null : i)}
                  aria-expanded={shown}
                  className="group flex w-full items-baseline gap-4 py-6 text-left md:gap-8 md:py-8"
                >
                  <span className="font-mono text-[10px] text-ink-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`display min-w-0 flex-1 text-[1.6rem] leading-tight transition-colors duration-500 md:text-[2.6rem] ${
                      shown ? 'hue' : 'group-hover:text-hue'
                    }`}
                  >
                    {c.title}
                  </span>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: shown ? 'auto' : 0, opacity: shown ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-12 md:gap-10 md:pb-10 md:pl-[3.4rem]">
                    <p className="text-[0.95rem] leading-relaxed text-ink-2 pretty md:col-span-6 md:text-base">
                      {c.body}
                    </p>
                    <ul className="md:col-span-5 md:col-start-8">
                      {c.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-3 border-t border-rule py-2 font-mono text-[11px] text-ink-3"
                        >
                          <span aria-hidden="true" className="h-px w-3 bg-hue" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Toolkit */}
      <div className="gutter mt-20 md:mt-28">
        <p className="label mb-8">The toolkit</p>
        <dl>
          {toolkit.map((group, i) => (
            <Rise key={group.group} delay={Math.min(i * 0.03, 0.24)}>
              <div className="flex flex-col gap-3 border-t border-rule py-5 sm:flex-row sm:items-baseline sm:gap-10">
                <dt className="label w-40 shrink-0">{group.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="tag">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            </Rise>
          ))}
        </dl>
      </div>
    </section>
  );
}
