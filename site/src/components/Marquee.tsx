import { useEffect, useRef } from 'react';
import { onScrollFrame } from '../lib/scroll';
import type { ReactNode } from 'react';

/**
 * A band of type that drifts on its own and is thrown along by the scroll:
 * flick the page and it races, scroll back and it reverses.
 *
 * The drift is a Web Animation, so the compositor runs it. Scrolling only
 * nudges its playback rate, from the page's shared scroll reader, and the band
 * stops altogether when it is off screen.
 */
export function VelocityBand({
  children,
  speed = 3,
  className,
}: {
  children: ReactNode;
  /** Roughly the share of one copy crossed per second; negative runs it backwards. */
  speed?: number;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const base = Math.sign(speed) || 1;
    // One copy is a quarter of the track; speed is in percent of the track per second.
    const duration = (25 / Math.abs(speed)) * 1000;
    const anim = el.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-25%,0,0)' }], {
      duration,
      iterations: Infinity,
      easing: 'linear',
    });
    // Start deep into the loop, so running it backwards never reaches the
    // beginning of time (where an infinite animation simply stops).
    anim.currentTime = duration * 100000;
    anim.playbackRate = base;

    let lastT = performance.now();
    let settle = 0;
    let dir = base;
    const onScroll = (y: number, prev: number) => {
      const now = performance.now();
      const v = (y - prev) / Math.max(now - lastT, 1); // px per ms
      lastT = now;
      if (v !== 0) dir = Math.sign(v) * base;
      if (prev === y) return;
      const boost = 1 + Math.min(Math.abs(v) * 2.5, 5);
      anim.updatePlaybackRate(dir * boost);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => anim.updatePlaybackRate(dir), 140);
    };

    let stop = () => {};
    const io = new IntersectionObserver(([e]) => {
      stop();
      // Idle at rate 0 rather than pause(): play() refuses to restart an
      // infinite animation that is running backwards.
      if (e.isIntersecting) {
        anim.updatePlaybackRate(dir);
        stop = onScrollFrame(onScroll);
      } else {
        window.clearTimeout(settle);
        anim.updatePlaybackRate(0);
        stop = () => {};
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      stop();
      window.clearTimeout(settle);
      anim.cancel();
    };
  }, [speed]);

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ''}`}>
      <div ref={track} className="flex w-max flex-nowrap will-change-transform">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two bands crossing at an angle, like tape across a box. */
export function CrossedBands({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <div className="relative z-10 -my-6 overflow-hidden py-14 md:py-20">
      <div className="-mx-4 rotate-[-4deg] bg-accent py-3 text-bg md:py-4">
        <VelocityBand speed={2.4}>{top}</VelocityBand>
      </div>
      <div className="-mx-4 -mt-3 rotate-[3deg] bg-fg py-3 text-bg md:py-4">
        <VelocityBand speed={-2}>{bottom}</VelocityBand>
      </div>
    </div>
  );
}
