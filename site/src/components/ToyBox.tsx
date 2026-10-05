import { motion, useReducedMotion } from 'framer-motion';
import { Hand, RotateCcw, Smartphone, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '../data/site';
import { projects } from '../data/site';
import { useMediaQuery } from '../lib/hooks';

type MatterNS = typeof import('matter-js');

const WORDS = ['AI', 'SaaS', 'Shopify', 'RLS', 'Android', 'iOS', 'Game', 'Edge'];

/**
 * Every project's mark as a physical object in a box. Grab one and throw it,
 * shake the box, or on a phone tilt it and let gravity follow. A quick tap on
 * a mark opens its project.
 *
 * The marks are ordinary DOM elements moved by Matter.js, not a canvas, so they
 * stay crisp, keep their shadows and remain focusable buttons. Only the marks
 * swallow touch: the empty space in the box still scrolls the page, so a thumb
 * passing through on its way down never gets stuck.
 */
export function ToyBox({ onOpen }: { onOpen: (p: Project, x: number, y: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const api = useRef<{ shake: () => void; reset: () => void; tilt: (on: boolean) => void } | null>(null);
  const reduced = useReducedMotion();
  const coarse = useMediaQuery('(pointer: coarse)');
  const [started, setStarted] = useState(false);
  const [tilt, setTilt] = useState(false);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

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
      const { Engine, Bodies, Body, Composite, Constraint } = M;
      const engine = Engine.create({ enableSleeping: false });
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
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };

      const handlers = items.map((item) => {
        const down = (e: PointerEvent) => {
          e.preventDefault();
          item.node.setPointerCapture(e.pointerId);
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
        W = root.clientWidth;
        H = root.clientHeight;
        Body.setPosition(floor, { x: W / 2, y: H + T / 2 });
        Body.setPosition(left, { x: -T / 2, y: H / 2 - H });
        Body.setPosition(right, { x: W + T / 2, y: H / 2 - H });
        items.forEach(({ body, w }) => {
          if (body.position.x > W - w / 2) Body.setPosition(body, { x: W - w / 2, y: body.position.y });
        });
      };
      const ro = new ResizeObserver(resize);
      ro.observe(root);

      // Tilt: gravity follows the phone.
      const onTilt = (e: DeviceOrientationEvent) => {
        const g = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 40));
        const b = Math.max(-1, Math.min(1, (e.beta ?? 45) / 40));
        engine.gravity.x = g;
        engine.gravity.y = b;
      };

      api.current = {
        shake() {
          items.forEach(({ body }) => {
            Body.setVelocity(body, { x: (Math.random() - 0.5) * 30, y: -12 - Math.random() * 20 });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.6);
          });
        },
        reset() {
          items.forEach(({ body, w, h }, i) => {
            Body.setPosition(body, { x: w / 2 + Math.random() * Math.max(W - w, 1), y: -h - i * 40 });
            Body.setVelocity(body, { x: 0, y: 0 });
            Body.setAngle(body, (Math.random() - 0.5) * 1.2);
          });
        },
        tilt(on) {
          if (on) window.addEventListener('deviceorientation', onTilt);
          else {
            window.removeEventListener('deviceorientation', onTilt);
            engine.gravity.x = 0;
            engine.gravity.y = 1;
          }
        },
      };

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) kick();
      });
      io.observe(root);

      let frame = 0;
      let last = performance.now();
      let acc = 0;
      const STEP = 1000 / 60;
      let running = false;
      const loop = (now: number) => {
        if (!visible) {
          running = false;
          return;
        }
        // Fixed steps at 60 per second, whatever the screen's refresh rate.
        acc += Math.min(now - last, 50);
        last = now;
        while (acc >= STEP) {
          Engine.update(engine, STEP);
          acc -= STEP;
        }
        for (const { node, body, w, h } of items) {
          node.style.transform = `translate3d(${(body.position.x - w / 2).toFixed(1)}px, ${(body.position.y - h / 2).toFixed(1)}px, 0) rotate(${body.angle.toFixed(3)}rad)`;
          if (node.style.opacity !== '1') node.style.opacity = '1';
        }
        frame = requestAnimationFrame(loop);
      };
      function kick() {
        if (running) return;
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

  const toggleTilt = async () => {
    const next = !tilt;
    if (next) {
      const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DOE?.requestPermission === 'function') {
        try {
          if ((await DOE.requestPermission()) !== 'granted') return;
        } catch {
          return;
        }
      }
    }
    api.current?.tilt(next);
    setTilt(next);
  };

  const physics = !reduced;

  return (
    <div>
      <div
        ref={box}
        className={`relative overflow-hidden rounded-[2rem] border-2 border-fg/10 bg-fg/[0.05] ${
          physics ? 'h-[62svh] max-h-[640px] min-h-[420px]' : 'p-5'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        {physics && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/3 text-center font-display text-[clamp(1.4rem,6vw,2.6rem)] font-bold text-fg/15"
          >
            {started ? 'grab one' : 'incoming…'}
          </p>
        )}

        <div className={physics ? '' : 'flex flex-wrap gap-3'}>
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              ref={(n) => (nodes.current[i] = n)}
              data-project={p.id}
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
        <motion.div
          className="mt-4 flex flex-wrap items-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <button type="button" onClick={() => api.current?.shake()} className="btn-solid min-h-[2.75rem] px-5 text-[15px]">
            <Sparkles className="h-4 w-4" /> Shake the box
          </button>
          {coarse && (
            <button
              type="button"
              onClick={toggleTilt}
              aria-pressed={tilt}
              className={`btn min-h-[2.75rem] border-2 px-5 text-[15px] ${tilt ? 'border-fg bg-fg text-bg' : 'border-fg/20'}`}
            >
              <Smartphone className="h-4 w-4" /> {tilt ? 'Tilt is on' : 'Tilt your phone'}
            </button>
          )}
          <button type="button" onClick={() => api.current?.reset()} className="btn-ghost min-h-[2.75rem] px-5 text-[15px]">
            <RotateCcw className="h-4 w-4" /> Drop again
          </button>
          <span className="ml-1 inline-flex items-center gap-1.5 text-[14px] text-fg/60">
            <Hand className="h-4 w-4" /> Tap a logo to open it
          </span>
        </motion.div>
      )}
    </div>
  );
}
