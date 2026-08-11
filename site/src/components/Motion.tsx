import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Text that rises out from behind a mask, line by line.
 *
 * The trigger sits on the clipping wrapper, not on the span that moves: an
 * IntersectionObserver measures against every ancestor's clip rect, so a child
 * parked 110% below an `overflow-hidden` parent never counts as visible and
 * would wait forever to be told to animate. The wrapper is observed and the
 * span follows through a variant.
 */
export function Mask({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'p';
  /** Play on mount rather than on scroll, for anything above the fold. */
  immediate?: boolean;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[Tag];

  const variants = reduced
    ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
    : { hidden: { y: '110%' }, shown: { y: 0 } };

  return (
    <MotionTag
      className={`overflow-hidden ${className ?? ''}`}
      initial="hidden"
      {...(immediate
        ? { animate: 'shown' }
        : { whileInView: 'shown', viewport: { once: true, margin: '-8% 0px -8% 0px' } })}
    >
      <motion.span
        className="block"
        variants={variants}
        transition={{ duration: 1.05, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </MotionTag>
  );
}

/** Splits a sentence and lets the words arrive in sequence. */
export function Words({
  text,
  className,
  delay = 0,
  stagger = 0.028,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            aria-hidden="true"
            variants={{ hidden: { y: '105%' }, shown: { y: 0 } }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Plain fade and lift, for anything that is not type. */
export function Rise({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself across the page. */
export function DrawRule({ delay = 0 }: { delay?: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="h-px w-full origin-left bg-rule"
      initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
      whileInView={reduced ? { opacity: 1 } : { scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, delay, ease: EASE }}
    />
  );
}
