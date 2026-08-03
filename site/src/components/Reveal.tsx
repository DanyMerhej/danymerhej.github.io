import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Standard entrance for anything that scrolls into view. */
export function Reveal({ children, delay = 0, y = 24, className, once = true }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface SectionHeadingProps {
  index: string;
  title: string;
  lead?: string;
  id?: string;
}

export function SectionHeading({ index, title, lead }: SectionHeadingProps) {
  return (
    <div className="mb-14 md:mb-20">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="eyebrow">{index}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-6 font-display text-section font-semibold text-balance">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted text-pretty md:text-lg">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
