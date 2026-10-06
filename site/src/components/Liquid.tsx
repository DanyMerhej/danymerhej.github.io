import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { onScrollFrame } from '../lib/scroll';
import { hexToRgb } from '../lib/world';

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/*
 * Domain-warped noise, three levels deep, mixed through the product colours.
 * The pointer adds a swirl that decays when it stops moving, so a finger
 * dragged across a phone stirs the colour like paint.
 */
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_stir;
uniform float u_scroll;
uniform vec3 u_bg;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = r * p * 2.02 + 3.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = uv;
  p.x *= aspect;
  p.y += u_scroll * 0.6;

  vec2 m = u_mouse;
  m.x *= aspect;
  m.y += u_scroll * 0.6;
  vec2 d = p - m;
  float r = length(d);
  float a = u_stir * 2.4 * exp(-r * r * 7.0);
  float s = sin(a);
  float c = cos(a);
  p = m + mat2(c, -s, s, c) * d;

  float t = u_time * 0.06;
  p *= 2.1;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
  vec2 w = vec2(fbm(p * 1.15 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p * 1.15 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 0.85 + 2.6 * w);

  vec3 col = mix(u_c0, u_c1, smoothstep(0.35, 0.65, f));
  col = mix(col, u_c2, smoothstep(0.45, 0.7, q.x));
  col = mix(col, u_c3, smoothstep(0.5, 0.72, w.y));

  // A soft sheen where the warp folds, for the wet look.
  col += 0.18 * smoothstep(0.62, 0.95, length(w)) ;

  // Let a little night through in the deepest troughs.
  col = mix(u_bg, col, 0.7 + 0.3 * smoothstep(0.2, 0.6, f));

  // Dither, so the gradient never bands on an 8-bit screen.
  col += (hash(gl_FragCoord.xy + u_time) - 0.5) / 96.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

const rgb = (hex: string) => hexToRgb(hex).map((v) => v / 255) as [number, number, number];

/**
 * A full-bleed canvas of moving colour. Rendered at a fraction of the screen's
 * resolution, since it is soft by nature and the GPU on a mid-range phone has
 * better things to do. Stops drawing when off screen or in a background tab,
 * and draws a single still frame for reduced motion.
 */
export function Liquid({
  colours,
  background,
  className,
  paused = false,
}: {
  colours: [string, string, string, string];
  background: string;
  className?: string;
  /** Draw one frame and hold, e.g. while something opaque covers the canvas. */
  paused?: boolean;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const pausedRef = useRef(paused);
  const resume = useRef<() => void>(() => {});
  // A lost GL context (phones drop them under memory pressure) is rebuilt by
  // running the effect again.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) resume.current();
  }, [paused]);

  useEffect(() => {
    const host = holder.current;
    if (!host) return;
    // The effect owns its canvas outright. A context that has been released can
    // never be revived on the same element, so each run starts with a new one.
    const el = document.createElement('canvas');
    el.className = 'absolute inset-0 h-full w-full';
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    host.appendChild(el);

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      el.remove();
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      el.remove();
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u('u_res');
    const uTime = u('u_time');
    const uMouse = u('u_mouse');
    const uStir = u('u_stir');
    const uScroll = u('u_scroll');
    gl.uniform3fv(u('u_bg'), rgb(background));
    gl.uniform3fv(u('u_c0'), rgb(colours[0]));
    gl.uniform3fv(u('u_c1'), rgb(colours[1]));
    gl.uniform3fv(u('u_c2'), rgb(colours[2]));
    gl.uniform3fv(u('u_c3'), rgb(colours[3]));

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const scale = coarse ? 0.33 : 0.5;
    // The canvas's place on the page, kept up to date on resize, so neither a
    // frame nor a touch ever has to ask the browser for layout.
    const box = { top: 0, left: 0, width: 1, height: 1 };
    // The page's scroll position, from the shared once-a-frame reader.
    let pageY = 0;
    const unsubscribe = onScrollFrame((y) => (pageY = y));

    const resize = () => {
      const r = el.getBoundingClientRect();
      box.top = r.top + window.scrollY;
      box.left = r.left;
      box.width = Math.max(r.width, 1);
      box.height = Math.max(r.height, 1);
      const w = Math.max(1, Math.round(box.width * scale));
      const h = Math.max(1, Math.round(box.height * scale));
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
      // Resizing a canvas clears it; with no animation running, paint it again.
      if (reduced || pausedRef.current) redraw();
    };
    let redraw = () => {};
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Pointer, eased so the swirl trails the finger rather than snapping to it.
    const target = { x: 0.7, y: 0.65 };
    const mouse = { x: 0.7, y: 0.65 };
    let stir = 0.35;
    const move = (cx: number, cy: number) => {
      const nx = (cx - box.left) / box.width;
      const ny = 1 - (cy + pageY - box.top) / box.height;
      if (nx < -0.2 || nx > 1.2 || ny < -0.2 || ny > 1.2) return;
      target.x = nx;
      target.y = ny;
      stir = Math.min(stir + 0.12, 1.4);
    };
    const onPointer = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduced && !pausedRef.current) start();
    });
    io.observe(el);

    let frame = 0;
    let running = false;
    const t0 = performance.now() - 40000 * Math.random();

    let prevDraw = performance.now();
    const draw = (now: number) => {
      // Easing scaled by elapsed time, so the swirl settles at the same speed
      // at 30, 60 or 120 frames a second.
      const steps = Math.min((now - prevDraw) / (1000 / 60), 4);
      prevDraw = now;
      const k = 1 - Math.pow(1 - 0.06, steps);
      mouse.x += (target.x - mouse.x) * k;
      mouse.y += (target.y - mouse.y) * k;
      stir += (0.3 - stir) * (1 - Math.pow(1 - 0.02, steps));
      const scrolled = Math.max(0, (pageY - box.top) / box.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uStir, stir);
      gl.uniform1f(uScroll, scrolled);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // A phone draws at 30 frames a second: the colour drifts slowly enough
    // that nobody sees the difference, and the GPU gets half its time back.
    const interval = coarse ? 1000 / 30 - 2 : 0;
    let last = 0;
    const loop = (now: number) => {
      if (!visible || document.hidden || pausedRef.current) {
        running = false;
        return;
      }
      if (now - last >= interval) {
        last = now;
        draw(now);
      }
      frame = requestAnimationFrame(loop);
    };

    function start() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }

    const onVis = () => !document.hidden && visible && !reduced && start();
    document.addEventListener('visibilitychange', onVis);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frame);
      running = false;
      // The still gradient underneath shows until the context comes back.
      el.style.visibility = 'hidden';
    };
    const onRestored = () => setGeneration((g) => g + 1);
    el.addEventListener('webglcontextlost', onLost);
    el.addEventListener('webglcontextrestored', onRestored);

    redraw = () => draw(performance.now());
    resume.current = () => !reduced && visible && start();
    // Always paint one frame, so the colour is there the moment it is uncovered.
    redraw();
    if (!reduced && !pausedRef.current) start();

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onTouch);
      document.removeEventListener('visibilitychange', onVis);
      el.removeEventListener('webglcontextlost', onLost);
      el.removeEventListener('webglcontextrestored', onRestored);
      resume.current = () => {};
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      el.remove();
    };
  }, [colours, background, reduced, generation]);

  return (
    <div className={className} aria-hidden="true">
      {/* Shown when WebGL is unavailable: the same colours, standing still. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 75% 20%, ${colours[0]}aa, transparent 70%),
                       radial-gradient(50% 45% at 15% 35%, ${colours[1]}99, transparent 70%),
                       radial-gradient(55% 45% at 60% 60%, ${colours[2]}88, transparent 70%),
                       ${background}`,
        }}
      />
      <div ref={holder} className="absolute inset-0" />
    </div>
  );
}
