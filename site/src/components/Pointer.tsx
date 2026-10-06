import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useFinePointer } from '../lib/hooks';

/**
 * A cursor for mouse and trackpad: a dot that follows exactly and a ring that
 * trails it, swelling over anything clickable and carrying a word when the
 * thing under it says what it does (data-cursor="Open"). Drawn in difference
 * mode, so it reads on every colour world.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 300, damping: 28, mass: 0.6 });
  const [hover, setHover] = useState<'none' | 'link' | 'label'>('none');
  const [label, setLabel] = useState('');
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return;
    document.documentElement.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      const tagged = t?.closest?.('[data-cursor]') as HTMLElement | null;
      if (tagged) {
        setHover('label');
        setLabel(tagged.dataset.cursor ?? '');
      } else if (t?.closest?.('a, button, [role="tab"], input, label')) {
        setHover('link');
      } else {
        setHover('none');
      }
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
    };
  }, [fine, reduced, x, y]);

  if (!fine || reduced) return null;

  const size = hover === 'label' ? 92 : hover === 'link' ? 56 : 34;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[600] mix-blend-difference">
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border-2 border-white"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: size,
          height: size,
          backgroundColor: hover === 'label' ? '#ffffff' : 'rgba(255,255,255,0)',
          scale: down ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <AnimatePresence>
          {hover === 'label' && (
            <motion.span
              key={label}
              className="text-[13px] font-bold text-black"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: hover === 'label' ? 0 : 1 }}
      />
    </div>
  );
}

/**
 * On a touchscreen there is no cursor to play with, so every tap leaves a ring
 * that spreads and fades, in the current accent. Made with the Web Animations
 * API and thrown away when it finishes: nothing for React to track.
 */
export function TapRipples() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (fine || reduced) return;
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:600;overflow:hidden';
    document.body.appendChild(layer);

    // A ring only for a real tap: a touch that starts a scroll moves, or is
    // cancelled by the browser, and gets nothing.
    let start: { id: number; x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      start = { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const onCancel = () => (start = null);
    const onUp = (e: PointerEvent) => {
      const s = start;
      start = null;
      if (!s || s.id !== e.pointerId || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) return;
      const ring = document.createElement('span');
      ring.style.cssText = `position:absolute;left:${e.clientX - 30}px;top:${e.clientY - 30}px;width:60px;height:60px;border-radius:50%;border:3px solid var(--accent);`;
      layer.appendChild(ring);
      const a = ring.animate(
        [
          { transform: 'scale(0.2)', opacity: 0.9 },
          { transform: 'scale(1.6)', opacity: 0 },
        ],
        { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      a.onfinish = () => ring.remove();
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointercancel', onCancel, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('pointerup', onUp);
      layer.remove();
    };
  }, [fine, reduced]);

  return null;
}
