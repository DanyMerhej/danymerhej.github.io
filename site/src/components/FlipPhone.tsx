import { motion, useReducedMotion } from 'framer-motion';
import { Gamepad2, Image as ImageIcon } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import type { Project } from '../data/site';
import { demoPrompt } from './demos/prompts';

// The toys load when someone turns a phone over, not with the page.
const Demo = lazy(() => import('./demos').then((m) => ({ default: m.Demo })));
import { Phone, Shot } from './Frames';

/**
 * The product's phone. The front is the real app, screenshotted from the live
 * site; turn it over and the back is a working toy of the same idea.
 *
 * The hidden face also gets pointer-events: none, because Safari will happily
 * deliver taps to the back of a card that is facing away.
 */
export function FlipPhone({ project, className }: { project: Project; className?: string }) {
  const reduced = useReducedMotion();
  const shot = project.shots?.mobile;
  // With no screenshot to show, the toy is the front.
  const [playing, setPlaying] = useState(!shot);
  const demo = project.demo;

  const face = 'absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]';

  return (
    <div className={`flex flex-col items-center ${className ?? ''}`}>
      <div className="relative" style={{ perspective: 1400 }}>
        <motion.div
          className="relative [transform-style:preserve-3d]"
          animate={{ rotateY: playing && shot ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 16 }}
        >
          {/* Front */}
          <div
            className={`[backface-visibility:hidden] [-webkit-backface-visibility:hidden] ${shot ? '' : 'invisible'}`}
            style={{ pointerEvents: playing ? 'none' : 'auto' }}
          >
            <Phone glow={project.hues[0]}>
              {shot ? <Shot src={shot} alt={`${project.name} on a phone`} /> : null}
            </Phone>
          </div>

          {/* Back */}
          {demo && (
            <div
              className={face}
              style={{
                transform: shot ? 'rotateY(180deg)' : undefined,
                pointerEvents: playing ? 'auto' : 'none',
              }}
            >
              <Phone glow={project.hues[1]}>
                {/* Only build the toy once it is wanted. */}
                {(playing || !shot) && (
                  <Suspense fallback={<div className="h-full w-full animate-pulse bg-black/5" />}>
                    <Demo id={demo} />
                  </Suspense>
                )}
              </Phone>
            </div>
          )}
        </motion.div>
      </div>

      {demo && shot && (
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="btn-solid mt-6 min-h-[2.9rem] px-5 text-[15px]"
          aria-pressed={playing}
        >
          {playing ? (
            <>
              <ImageIcon className="h-4 w-4" /> Back to the real app
            </>
          ) : (
            <>
              <Gamepad2 className="h-4 w-4" /> Play: {demoPrompt[demo].toLowerCase()}
            </>
          )}
        </button>
      )}
      {demo && !shot && (
        <p className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold">
          <Gamepad2 className="h-4 w-4" /> {demoPrompt[demo]}
        </p>
      )}
    </div>
  );
}
