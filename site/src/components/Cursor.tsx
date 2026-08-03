import { useEffect, useRef } from 'react';
import { useFinePointer } from '../lib/hooks';

const INTERACTIVE = 'a, button, [role="button"], input, kbd, summary';

/**
 * A ring that trails the pointer and swells over anything clickable.
 * The native cursor is deliberately left visible — this is decoration, not a
 * replacement for it. Desktop only; touch devices render nothing.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  useEffect(() => {
    if (!fine) return;
    const ring = ringRef.current;
    if (!ring) return;

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = e.target as Element | null;
      targetScale = el?.closest(INTERACTIVE) ? 2.1 : 1;
      ring.style.opacity = '1';
    };

    const onDown = () => (targetScale *= 0.8);
    const onUp = () => (targetScale = targetScale / 0.8);
    const onLeave = () => {
      ring.style.opacity = '0';
    };
    const onEnter = () => {
      ring.style.opacity = '1';
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      scale += (targetScale - scale) * 0.14;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] h-8 w-8 rounded-full border border-accent/50
                 opacity-0 transition-opacity duration-200"
    />
  );
}
