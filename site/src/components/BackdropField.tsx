import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * A dot field that lights up and leans away from the pointer.
 * Canvas rather than DOM so a few thousand points stay cheap, and it
 * degrades to a static field when the visitor prefers reduced motion.
 */
export function BackdropField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SPACING = 34;
    const RADIUS = 170;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let t = 0;

    // Pointer is tracked in canvas space; parked far away until it moves.
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const readInk = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        base: styles.getPropertyValue('--c-faint').trim() || '108 113 122',
        hot: styles.getPropertyValue('--c-accent').trim() || '198 249 78',
      };
    };
    let colors = readInk();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      colors = readInk();
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.tx = -9999;
      pointer.ty = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Ease the pointer so fast movement still feels fluid.
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * SPACING;
          const y = j * SPACING;

          // Slow diagonal wave keeps the field alive without the pointer.
          const wave = reduced ? 0 : Math.sin((x + y) * 0.006 + t) * 0.5 + 0.5;

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = dist < RADIUS ? 1 - dist / RADIUS : 0;
          const push = influence * influence * 14;

          const px = x + (dist ? (dx / dist) * push : 0);
          const py = y + (dist ? (dy / dist) * push : 0);

          const size = 0.9 + influence * 1.9 + wave * 0.35;
          const alpha = 0.1 + wave * 0.1 + influence * 0.75;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle =
            influence > 0.18
              ? `rgb(${colors.hot} / ${Math.min(alpha, 0.95)})`
              : `rgb(${colors.base} / ${alpha})`;
          ctx.fill();
        }
      }

      t += 0.006;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    // The palette changes on theme toggle; re-read it when the class flips.
    const observer = new MutationObserver(() => {
      colors = readInk();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerleave', onLeave);
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        maskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, #000 25%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, #000 25%, transparent 75%)',
      }}
    />
  );
}
