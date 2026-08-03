import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const GLYPHS = '{}[]()<>/\\|=+*#$%&@!?abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Cycles through phrases, resolving each one character by character.
 * Reads as a single stable string to assistive tech.
 */
export function Scramble({ phrases, interval = 3200 }: { phrases: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(phrases[0] ?? '');
  const reduced = useReducedMotion();
  const frame = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced || phrases.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases, interval, reduced]);

  useEffect(() => {
    const target = phrases[index] ?? '';
    if (reduced) {
      setText(target);
      return;
    }

    frame.current = 0;
    const previous = text;
    const length = Math.max(previous.length, target.length);
    // Each character resolves on its own frame, so longer words settle later.
    const resolveAt = Array.from({ length }, () => Math.floor(Math.random() * 14) + 6);

    const tick = () => {
      let output = '';
      let done = true;

      for (let i = 0; i < length; i++) {
        const char = target[i] ?? '';
        if (frame.current >= resolveAt[i]) {
          output += char;
        } else if (char === ' ') {
          output += ' ';
        } else {
          done = false;
          output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setText(output);
      frame.current += 1;
      if (!done) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // `text` is intentionally excluded; including it would restart the animation on every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phrases, reduced]);

  return (
    <span className="relative inline-block">
      <span aria-hidden="true" className="font-mono">
        {text}
      </span>
      <span className="sr-only">{phrases[index]}</span>
      <span aria-hidden="true" className="ml-0.5 inline-block animate-blink text-accent">
        _
      </span>
    </span>
  );
}
