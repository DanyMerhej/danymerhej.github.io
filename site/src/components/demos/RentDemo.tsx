import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Fuel, Gauge } from 'lucide-react';
import { useState } from 'react';

type Mode = 'out' | 'back';
interface Mark {
  id: number;
  x: number;
  y: number;
  at: Mode;
}

/** A car seen from above, drawn on a 100 x 200 grid so marks are stored in normalised coordinates. */
function Car() {
  return (
    <svg viewBox="0 0 100 200" className="h-full w-full" aria-hidden="true">
      <rect x="6" y="34" width="10" height="26" rx="4" fill="#1A0702" />
      <rect x="84" y="34" width="10" height="26" rx="4" fill="#1A0702" />
      <rect x="6" y="140" width="10" height="26" rx="4" fill="#1A0702" />
      <rect x="84" y="140" width="10" height="26" rx="4" fill="#1A0702" />
      <rect x="12" y="8" width="76" height="184" rx="30" fill="#EE6A3F" />
      <rect x="12" y="8" width="76" height="184" rx="30" fill="url(#shine)" />
      <path d="M22 62 Q50 46 78 62 L74 88 Q50 80 26 88 Z" fill="#2B1A14" opacity="0.9" />
      <rect x="25" y="92" width="50" height="46" rx="10" fill="#F58A62" />
      <path d="M26 142 Q50 136 74 142 L77 160 Q50 168 23 160 Z" fill="#2B1A14" opacity="0.9" />
      <rect x="20" y="12" width="14" height="6" rx="3" fill="#FFF3C4" />
      <rect x="66" y="12" width="14" height="6" rx="3" fill="#FFF3C4" />
      <rect x="20" y="183" width="14" height="5" rx="2.5" fill="#B3261E" />
      <rect x="66" y="183" width="14" height="5" rx="2.5" fill="#B3261E" />
      <defs>
        <linearGradient id="shine" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Rentyy in miniature: mark the car at handover, mark it again on return, and see what is new. */
export function RentDemo() {
  const [mode, setMode] = useState<Mode>('out');
  const [marks, setMarks] = useState<Mark[]>([{ id: 1, x: 0.78, y: 0.22, at: 'out' }]);
  const [fuel, setFuel] = useState(62);
  const kmOut = 48210;
  const kmBack = 48622;

  const fresh = marks.filter((m) => m.at === 'back').length;

  return (
    <div className="flex h-full flex-col bg-[#FFF4EC] px-3.5 pb-4 pt-10 font-sans text-[#1A0702]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] font-bold tracking-tight">Kia Picanto</p>
        <span className="rounded-full bg-[#1A0702] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#FFE2C8]">
          B 482 117
        </span>
      </div>

      <LayoutGroup>
        <div className="mt-3 flex rounded-full bg-white p-1 shadow-sm">
          {(['out', 'back'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="relative h-8 flex-1 rounded-full text-[11.5px] font-semibold"
              aria-pressed={mode === m}
            >
              {mode === m && <motion.span layoutId="rent-mode" className="absolute inset-0 rounded-full bg-[#EE6A3F]" />}
              <span className="relative">{m === 'out' ? 'Handover' : 'Return'}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <p className="mt-2 text-center text-[10.5px] text-black/50">
        Tap the car to mark {mode === 'out' ? 'a scratch before it leaves' : 'anything new'}.
      </p>

      <div className="relative mx-auto mt-1 h-[210px] w-[105px]">
        <button
          type="button"
          aria-label="Mark damage on the car"
          className="absolute inset-0 cursor-crosshair"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            setMarks((ms) => [...ms, { id: Date.now(), x, y, at: mode }]);
          }}
        >
          <Car />
        </button>
        <AnimatePresence>
          {marks.map((m) => (
            <span
              key={m.id}
              className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
            >
              <motion.span
                className="flex h-full w-full items-center justify-center"
                initial={{ scale: 0, y: -16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              >
                {m.at === 'back' && <span className="absolute inset-0 animate-ping rounded-full bg-[#D7263D]/50" />}
                <span
                  className="relative h-3.5 w-3.5 rounded-full border-2 border-white shadow"
                  style={{ background: m.at === 'back' ? '#D7263D' : '#7A6A62' }}
                />
              </motion.span>
            </span>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="rounded-xl bg-white p-2">
          <p className="flex items-center gap-1 text-[10px] font-semibold text-black/50">
            <Gauge className="h-3 w-3" /> Odometer
          </p>
          <p className="font-mono text-[12px] font-semibold">{(mode === 'out' ? kmOut : kmBack).toLocaleString('en')} km</p>
        </div>
        <div className="rounded-xl bg-white p-2">
          <p className="flex items-center gap-1 text-[10px] font-semibold text-black/50">
            <Fuel className="h-3 w-3" /> Fuel {mode === 'out' ? 100 : fuel}%
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={mode === 'out' ? 100 : fuel}
            disabled={mode === 'out'}
            onChange={(e) => setFuel(Number(e.target.value))}
            className="mt-1 w-full accent-[#EE6A3F]"
            aria-label="Fuel level on return"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'back' ? (
          <motion.div
            key="diff"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 rounded-xl bg-[#1A0702] p-2.5 text-[11px] leading-snug text-[#FFE2C8]"
          >
            <p className="font-semibold text-white">Return vs handover</p>
            <p>
              {(kmBack - kmOut).toLocaleString('en')} km driven · fuel {fuel - 100}% ·{' '}
              <span className={fresh ? 'font-bold text-[#FF8A80]' : ''}>
                {fresh} new {fresh === 1 ? 'mark' : 'marks'}
              </span>
            </p>
          </motion.div>
        ) : (
          <motion.button
            key="clear"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMarks([])}
            className="mt-2 h-9 rounded-full border border-black/15 text-[11px] font-semibold"
          >
            Clear marks
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
