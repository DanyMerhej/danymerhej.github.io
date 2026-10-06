import { useReducedMotion } from 'framer-motion';
import { Hand, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '../data/site';
import { projects } from '../data/site';
import { useMediaQuery } from '../lib/hooks';

type MatterNS = typeof import('matter-js');

const WORDS = ['AI', 'SaaS', 'Shopify', 'RLS', 'Android', 'iOS', 'Game', 'Edge'];

/**
 * Every project's mark as a physical object in a box. Grab one and throw it,
 * shake the box, and on a phone simply tilt it: gravity follows the phone
 * whenever the box is on screen, with nothing to switch on. A quick tap on a
 * mark opens its project.
 *
 * iPhones only send the tilt sensor to a page after a tap and a yes, so there
 * the first tap on the box (or on Shake, or a throw) asks, once.
 *
 * The marks are ordinary DOM elements moved by Matter.js, not a canvas, so they
 * stay crisp, keep their shadows and remain focusable buttons. Only the marks
 * swallow touch: the empty space in the box still scrolls the page, so a thumb
 * passing through on its way down never gets stuck.
 */
export function ToyBox({ onOpen }: { onOpen: (p: Project, x: number, y: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const api = useRef<{ shake: () => void; reset: () => void } | null>(null);
  const reduced = useReducedMotion();
  const coarse = useMediaQuery('(pointer: coarse)');
  const [started, setStarted] = useState(false);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  // 'ask' until an iPhone has said yes to motion; 'off' if it said no.
  const [motion, setMotion] = useState<'ask' | 'on' | 'off'>(() => (motionNeedsPermission() ? 'ask' : 'on'));
  // Whether real tilt readings are arriving, which is when the box says so.
  const [sensed, setSensed] = useState(false);
  const asking = useRef(false);
  const askMotion = () => {
    if (motion !== 'ask' || asking.current) return;
    asking.current = true;
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> };
    DOE.requestPermission()
      .then((r) => setMotion(r === 'granted' ? 'on' : 'off'))
      .catch(() => {})
      .finally(() => {
        asking.current = false;
      });
  };
  const askRef = useRef(askMotion);
  askRef.current = askMotion;

  const sensedRef = useRef(() => setSensed(true));

  // Start the physics the first time the box comes near the screen.
  useEffect(() => {
    const el = box.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -25% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!started) return;
    const el = box.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    void import('matter-js').then((mod) => {
      if (disposed) return;
      const M = ((mod as unknown as { default?: MatterNS }).default ?? mod) as MatterNS;
      cleanup = run(M, el);
    });

    return () => {
      disposed = true;
      cleanup();
    };

    function run(M: MatterNS, root: HTMLDivElement) {
      const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = M;
      // Bodies fall asleep once the pile settles, and the loop then stops
      // altogether until something touches, shakes or tilts the box.
      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1;

      let W = root.clientWidth;
      let H = root.clientHeight;
      const T = 200;
      const wallOpts = { isStatic: true, restitution: 0.4, friction: 0.2 };
      const floor = Bodies.rectangle(W / 2, H + T / 2, W * 3, T, wallOpts);
      const left = Bodies.rectangle(-T / 2, H / 2 - H, T, H * 4, wallOpts);
      const right = Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 4, wallOpts);
      const ceiling = Bodies.rectangle(W / 2, -H * 2.5, W * 3, T, wallOpts);
      Composite.add(engine.world, [floor, left, right, ceiling]);
      // The marks fall in from above, so the lid starts high and drops to the
      // top of the box once they are all inside. After that a shake, or a
      // phone tipped backwards, can never throw them out of sight.
      let lid = false;
      const placeLid = () => Body.setPosition(ceiling, { x: W / 2, y: lid ? -T / 2 : -H * 2.5 });

      const items = nodes.current
        .map((node, i) => {
          if (!node) return null;
          const w = node.offsetWidth;
          const h = node.offsetHeight;
          const x = w / 2 + Math.random() * Math.max(W - w, 1);
          const y = -h - Math.random() * H * 1.4 - i * 24;
          const body = Bodies.rectangle(x, y, w, h, {
            chamfer: { radius: Math.min(w, h) * (node.dataset.pill ? 0.5 : 0.26) },
            restitution: 0.45,
            friction: 0.08,
            frictionAir: 0.012,
            density: node.dataset.pill ? 0.0012 : 0.002,
            angle: (Math.random() - 0.5) * 1.2,
          });
          Composite.add(engine.world, body);
          return { node, body, w, h };
        })
        .filter(Boolean) as { node: HTMLElement; body: Matter.Body; w: number; h: number }[];

      // Dragging, written against pointer events so the rest of the box scrolls.
      const drags = new Map<number, { c: Matter.Constraint; sx: number; sy: number; t: number; item: (typeof items)[number] }>();
      const local = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        // With the lid on, a finger dragged above the box would pull the mark
        // through it and leave it out of sight, so the pull stops at the edges.
        return lid ? { x: Math.min(Math.max(x, 0), W), y: Math.min(Math.max(y, 0), H) } : { x, y };
      };

      const handlers = items.map((item) => {
        const down = (e: PointerEvent) => {
          e.preventDefault();
          item.node.setPointerCapture(e.pointerId);
          Sleeping.set(item.body, false);
          kick();
          const p = local(e);
          const c = Constraint.create({
            pointA: p,
            bodyB: item.body,
            pointB: { x: p.x - item.body.position.x, y: p.y - item.body.position.y },
            stiffness: 0.18,
            damping: 0.08,
            length: 0,
          });
          (c as unknown as { angleB: number }).angleB = item.body.angle;
          Composite.add(engine.world, c);
          drags.set(e.pointerId, { c, sx: e.clientX, sy: e.clientY, t: performance.now(), item });
          item.node.style.cursor = 'grabbing';
        };
        const move = (e: PointerEvent) => {
          const d = drags.get(e.pointerId);
          if (!d) return;
          d.c.pointA = local(e);
        };
        const up = (e: PointerEvent) => {
          const d = drags.get(e.pointerId);
          if (!d) return;
          Composite.remove(engine.world, d.c);
          drags.delete(e.pointerId);
          item.node.style.cursor = '';
          const moved = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
          const quick = performance.now() - d.t < 320;
          const id = item.node.dataset.project;
          if (moved < 8 && quick && id && e.type === 'pointerup') {
            const p = projects.find((x) => x.id === id);
            if (p) openRef.current(p, e.clientX, e.clientY);
          } else if (e.type === 'pointerup') {
            // A throw is a good moment to ask an iPhone for the tilt sensor; a
            // tap that opens a project is not.
            askRef.current();
          }
        };
        item.node.addEventListener('pointerdown', down);
        item.node.addEventListener('pointermove', move);
        item.node.addEventListener('pointerup', up);
        item.node.addEventListener('pointercancel', up);
        return () => {
          item.node.removeEventListener('pointerdown', down);
          item.node.removeEventListener('pointermove', move);
          item.node.removeEventListener('pointerup', up);
          item.node.removeEventListener('pointercancel', up);
        };
      });

      const resize = () => {
        // Hidden (the home page stays mounted behind a project page): keep the
        // last real size rather than squashing the box to nothing.
        if (!root.clientWidth || !root.clientHeight) return;
        W = root.clientWidth;
        H = root.clientHeight;
        Body.setPosition(floor, { x: W / 2, y: H + T / 2 });
        Body.setPosition(left, { x: -T / 2, y: H / 2 - H });
        Body.setPosition(right, { x: W + T / 2, y: H / 2 - H });
        placeLid();
        items.forEach(({ body, w }) => {
          if (body.position.x > W - w / 2) Body.setPosition(body, { x: W - w / 2, y: body.position.y });
        });
        wakeAll();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(root);

      // Tilt: gravity follows the phone, read only while the box is on screen.
      // Readings are smoothed, and the pile is woken only by a real change of
      // angle, so a hand's tremor never keeps the physics running.
      const tiltable = window.matchMedia('(pointer: coarse)').matches;
      let sensing = false;
      let wokeAt = { x: 0, y: 1 };
      const clamp = (v: number) => Math.max(-1, Math.min(1, v / 40));
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.beta === null || e.gamma === null) return; // no sensor: gravity stays down
        if (!sensing) {
          sensing = true;
          sensedRef.current();
        }
        // Into the screen's own axes, whichever way round the phone is held.
        const angle = window.screen.orientation?.angle ?? 0;
        const [x, y] =
          angle === 90
            ? [e.beta, -e.gamma]
            : angle === 270 || angle === -90
              ? [-e.beta, e.gamma]
              : angle === 180
                ? [-e.gamma, -e.beta]
                : [e.gamma, e.beta];
        engine.gravity.x += (clamp(x) - engine.gravity.x) * 0.25;
        engine.gravity.y += (clamp(y) - engine.gravity.y) * 0.25;
        if (Math.abs(engine.gravity.x - wokeAt.x) + Math.abs(engine.gravity.y - wokeAt.y) > 0.06) {
          wokeAt = { x: engine.gravity.x, y: engine.gravity.y };
          wakeAll();
        }
      };

      const wakeAll = () => {
        items.forEach(({ body }) => Sleeping.set(body, false));
        kick();
      };

      api.current = {
        shake() {
          items.forEach(({ body }) => {
            Sleeping.set(body, false);
            Body.setVelocity(body, { x: (Math.random() - 0.5) * 30, y: -12 - Math.random() * 20 });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.6);
          });
          kick();
        },
        reset() {
          lid = false;
          placeLid();
          items.forEach(({ body, w, h }, i) => {
            Sleeping.set(body, false);
            Body.setPosition(body, { x: w / 2 + Math.random() * Math.max(W - w, 1), y: -h - i * 40 });
            Body.setVelocity(body, { x: 0, y: 0 });
            Body.setAngle(body, (Math.random() - 0.5) * 1.2);
          });
          kick();
        },
      };

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (tiltable) {
          if (visible) window.addEventListener('deviceorientation', onTilt);
          else window.removeEventListener('deviceorientation', onTilt);
        }
        if (visible) kick();
      });
      io.observe(root);

      let frame = 0;
      let last = performance.now();
      let acc = 0;
      const STEP = 1000 / 60;
      let running = false;
      const shown = items.map(() => '');
      const loop = (now: number) => {
        if (!visible) {
          running = false;
          return;
        }
        // Fixed steps at 60 per second, whatever the screen's refresh rate.
        acc += Math.min(now - last, 34);
        last = now;
        let stepped = false;
        while (acc >= STEP) {
          Engine.update(engine, STEP);
          acc -= STEP;
          stepped = true;
        }
        if (stepped && !lid && items.every(({ body }) => body.bounds.min.y > 2)) {
          lid = true;
          placeLid();
        }
        if (stepped) {
          items.forEach(({ node, body, w, h }, i) => {
            const t = `translate3d(${(body.position.x - w / 2).toFixed(1)}px, ${(body.position.y - h / 2).toFixed(1)}px, 0) rotate(${body.angle.toFixed(3)}rad)`;
            if (t !== shown[i]) {
              node.style.transform = t;
              shown[i] = t;
            }
            if (node.style.opacity !== '1') node.style.opacity = '1';
          });
        }
        if (drags.size === 0 && items.every(({ body }) => body.isSleeping)) {
          running = false;
          return;
        }
        frame = requestAnimationFrame(loop);
      };
      function kick() {
        if (running || !visible) return;
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
      kick();

      return () => {
        cancelAnimationFrame(frame);
        io.disconnect();
        ro.disconnect();
        handlers.forEach((h) => h());
        window.removeEventListener('deviceorientation', onTilt);
        Engine.clear(engine);
        api.current = null;
      };
    }
  }, [started]);

  const physics = !reduced;
  const label = !started
    ? 'incoming…'
    : coarse && sensed && motion === 'on'
      ? 'tilt your phone'
      : coarse && motion === 'ask'
        ? 'tap the box to tilt'
        : 'grab one';

  return (
    <div>
      {physics && (
        // One line on any phone, down to 320px: the size follows the width of
        // the screen. Narrower than that (zoomed right in) it may wrap.
        <p className="mb-3 flex items-center gap-1.5 text-[clamp(10px,3.45vw,15px)] text-fg/70 min-[300px]:whitespace-nowrap">
          <Hand className="h-[1.1em] w-[1.1em] shrink-0" /> Grab and throw the logos. Tap one to open it.
        </p>
      )}
      <div
        ref={box}
        className={`relative overflow-hidden rounded-[2rem] border-2 border-fg/10 bg-fg/[0.05] ${
          physics ? 'h-[62svh] max-h-[640px] min-h-[420px]' : 'p-5'
        }`}
        style={{ touchAction: 'pan-y' }}
        onClick={(e) => {
          if (!(e.target as Element).closest('[data-vt-logo], [data-pill]')) askMotion();
        }}
      >
        {physics && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/3 text-center font-display text-[clamp(1.4rem,6vw,2.6rem)] font-bold text-fg/15"
          >
            {label}
          </p>
        )}

        <div className={physics ? '' : 'flex flex-wrap gap-3'}>
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              ref={(n) => (nodes.current[i] = n)}
              data-project={p.id}
              data-vt-logo={p.id}
              data-cursor="Throw me"
              aria-label={`${p.name}: open the project`}
              onClick={(e) => {
                // Pointer taps are handled by the physics; this is for keyboards.
                if (physics && e.detail !== 0) return;
                const r = e.currentTarget.getBoundingClientRect();
                onOpen(p, r.left + r.width / 2, r.top + r.height / 2);
              }}
              className={`${physics ? 'absolute left-0 top-0 opacity-0' : 'relative'} flex h-[74px] w-[74px] cursor-grab items-center justify-center overflow-hidden rounded-[22px] sm:h-[104px] sm:w-[104px] sm:rounded-[30px]`}
              style={{
                // A finger on a mark holds the mark, in every direction; only
                // the empty space in the box (pan-y) scrolls the page.
                touchAction: 'none',
                background: 'linear-gradient(150deg, #1D1B24, #0B0A10)',
                boxShadow: `0 14px 30px -12px ${p.hues[0]}aa, inset 0 0 0 2px ${p.hues[0]}55`,
              }}
            >
              <img
                src={p.logo}
                alt=""
                width={160}
                height={160}
                draggable={false}
                className="pointer-events-none h-full w-full object-contain p-2.5 sm:p-3.5"
              />
            </button>
          ))}
          {WORDS.map((w, i) => (
            <span
              key={w}
              ref={(n) => (nodes.current[projects.length + i] = n)}
              data-pill="1"
              aria-hidden="true"
              className={`${physics ? 'absolute left-0 top-0 opacity-0' : 'relative'} flex h-[42px] cursor-grab select-none items-center rounded-full px-5 font-display text-[17px] font-bold sm:h-[54px] sm:px-7 sm:text-[22px]`}
              style={{
                touchAction: 'none',
                background: projects[i % projects.length].hues[0],
                color: '#14101F',
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {physics && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-md">
          <button
            type="button"
            onClick={() => {
              askMotion();
              api.current?.shake();
            }}
            className="btn-solid min-h-[2.9rem] gap-2 px-2 text-[15px]"
          >
            <Sparkles className="h-4 w-4 shrink-0" /> Shake
          </button>
          <button type="button" onClick={() => api.current?.reset()} className="btn-ghost min-h-[2.9rem] gap-2 px-2 text-[15px]">
            <RotateCcw className="h-4 w-4 shrink-0" /> Reset
          </button>
        </div>
      )}
    </div>
  );
}

/** iPhones and iPads: the tilt sensor needs a tap and a yes before a page may read it. */
function motionNeedsPermission(): boolean {
  if (typeof window === 'undefined') return false;
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined;
  return typeof DOE?.requestPermission === 'function';
}
