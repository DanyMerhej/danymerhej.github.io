import { AnimatePresence, LayoutGroup, motion, animate } from 'framer-motion';
import { RotateCcw, ScanLine, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { id: 'a', name: 'Manakish', price: 6 },
  { id: 'b', name: 'Fattoush', price: 7.5 },
  { id: 'c', name: 'Shawarma ×2', price: 14 },
  { id: 'd', name: 'Lemonade ×3', price: 9 },
  { id: 'e', name: 'Knefeh', price: 5.5 },
];

const PEOPLE = [
  { name: 'You', colour: '#C6F94E' },
  { name: 'Rami', colour: '#39D0A5' },
  { name: 'Maya', colour: '#F0A6E0' },
];

type Phase = 'idle' | 'scanning' | 'scanned' | 'split';

function shuffle(): number[] {
  return ITEMS.map(() => Math.floor(Math.random() * PEOPLE.length));
}

function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = Number(el.dataset.v ?? 0);
    const c = animate(from, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `$${v.toFixed(2)}`;
        el.dataset.v = String(v);
      },
    });
    return () => c.stop();
  }, [value]);
  return <span ref={ref}>$0.00</span>;
}

/** Splittyy in miniature: scan a receipt, let the "AI" read it, split it three ways. */
export function SplitDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [owner, setOwner] = useState<number[]>(shuffle);
  const [read, setRead] = useState(0);

  useEffect(() => {
    if (phase !== 'scanning') return;
    setRead(0);
    const ids = ITEMS.map((_, i) => setTimeout(() => setRead(i + 1), 280 + i * 260));
    const done = setTimeout(() => setPhase('scanned'), 280 + ITEMS.length * 260 + 200);
    return () => {
      ids.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase]);

  const total = ITEMS.reduce((s, i) => s + i.price, 0);
  const split = phase === 'split';

  return (
    <div className="flex h-full flex-col bg-[#F4FBEA] px-3.5 pb-4 pt-10 font-sans text-[#0E1A10]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] font-bold tracking-tight">Split a bill</p>
        <span className="rounded-full bg-[#0E1A10] px-2.5 py-1 text-[10px] font-semibold text-[#C6F94E]">USD</span>
      </div>

      <LayoutGroup>
        {/* The receipt */}
        <div className="relative mt-3 overflow-hidden rounded-xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
          <p className="text-center font-mono text-[10px] font-medium tracking-widest text-black/60">CAFÉ BEIRUT</p>
          <ul className="mt-2 min-h-[118px] space-y-1">
            {ITEMS.map((it, i) =>
              split ? null : (
                <motion.li
                  layoutId={`item-${it.id}`}
                  key={it.id}
                  className="flex justify-between rounded-md px-1.5 py-[3px] font-mono text-[11px]"
                  animate={{ backgroundColor: read > i ? 'rgba(198,249,78,0.55)' : 'rgba(198,249,78,0)' }}
                >
                  <span>{it.name}</span>
                  <span>{it.price.toFixed(2)}</span>
                </motion.li>
              ),
            )}
            {split && <li className="py-9 text-center text-[11px] text-black/40">All split.</li>}
          </ul>
          <div className="mt-2 flex justify-between border-t border-dashed border-black/20 pt-2 font-mono text-[11px] font-semibold">
            <span>TOTAL</span>
            <span>{total.toFixed(2)}</span>
          </div>

          <AnimatePresence>
            {phase === 'scanning' && (
              // A full-height layer carrying a narrow band, moved by transform
              // (handed to the compositor) rather than by top.
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ transform: 'translateY(-30%)' }}
                animate={{ transform: 'translateY(100%)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <div
                  className="h-10 w-full"
                  style={{ background: 'linear-gradient(to bottom, transparent, rgba(57,208,165,0.45), transparent)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-2 flex h-5 items-center gap-1.5 text-[11px] font-medium text-black/60">
          {phase === 'scanning' && (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[#0B7A5C]" /> Reading the receipt… {read}/{ITEMS.length}
            </>
          )}
          {phase === 'scanned' && (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[#0B7A5C]" /> {ITEMS.length} items, ${total.toFixed(2)}. Who had what?
            </>
          )}
          {phase === 'idle' && 'Point the camera at a receipt.'}
          {split && 'Tap again to reshuffle.'}
        </p>

        {/* The people */}
        <div className="mt-1 grid flex-1 grid-cols-3 gap-1.5">
          {PEOPLE.map((p, pi) => {
            const mine = ITEMS.filter((_, i) => owner[i] === pi);
            const sum = split ? mine.reduce((s, i) => s + i.price, 0) : 0;
            return (
              <div key={p.name} className="flex flex-col rounded-xl bg-white/80 p-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: p.colour }}
                  >
                    {p.name[0]}
                  </span>
                  <span className="text-[11px] font-semibold">{p.name}</span>
                </div>
                <div className="mt-1 flex-1 space-y-1">
                  {split &&
                    mine.map((it) => (
                      <motion.div
                        layoutId={`item-${it.id}`}
                        key={it.id}
                        className="truncate rounded-md px-1 py-0.5 text-[9.5px] font-medium"
                        style={{ background: `${p.colour}66` }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                      >
                        {it.name}
                      </motion.div>
                    ))}
                </div>
                <p className="mt-1 font-mono text-[11px] font-semibold">
                  <Count value={sum} />
                </p>
              </div>
            );
          })}
        </div>
      </LayoutGroup>

      <button
        type="button"
        onClick={() => {
          if (phase === 'idle') setPhase('scanning');
          else if (phase === 'scanned') setPhase('split');
          else setOwner(shuffle());
        }}
        disabled={phase === 'scanning'}
        className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#0E1A10] text-[13px] font-semibold text-[#C6F94E] transition-transform active:scale-95 disabled:opacity-60"
      >
        {phase === 'idle' && (
          <>
            <ScanLine className="h-4 w-4" /> Scan receipt
          </>
        )}
        {phase === 'scanning' && 'Scanning…'}
        {phase === 'scanned' && 'Split it'}
        {split && (
          <>
            <RotateCcw className="h-4 w-4" /> Split differently
          </>
        )}
      </button>
    </div>
  );
}
