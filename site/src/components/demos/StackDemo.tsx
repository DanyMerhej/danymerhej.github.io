import { AnimatePresence, motion } from 'framer-motion';
import { Citrus, Coffee, Cpu, Moon, Rocket, Truck, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const BUSINESSES = [
  { name: 'Lemonade stand', icon: Citrus, cost: 0, rate: 1, colour: '#FFE066' },
  { name: 'Food truck', icon: Truck, cost: 40, rate: 6, colour: '#FFB86B' },
  { name: 'Coffee chain', icon: Coffee, cost: 450, rate: 55, colour: '#D4A373' },
  { name: 'Tech startup', icon: Cpu, cost: 6000, rate: 700, colour: '#8FB8FF' },
  { name: 'Space agency', icon: Rocket, cost: 90000, rate: 9000, colour: '#C6A8FF' },
  { name: 'Moon base', icon: Moon, cost: 1500000, rate: 140000, colour: '#E9ECEF' },
];

function money(n: number): string {
  const units = ['', 'K', 'M', 'B', 'T', 'Qa'];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return `$${n < 10 && i > 0 ? n.toFixed(2) : n < 100 && i > 0 ? n.toFixed(1) : Math.floor(n)}${units[i]}`;
}

/** StackUp in miniature: tap to earn, buy the next business, IPO when you reach the moon. */
export function StackDemo() {
  const [cash, setCash] = useState(0);
  const [owned, setOwned] = useState(1);
  const [prestige, setPrestige] = useState(1);
  const [pops, setPops] = useState<{ id: number; x: number; v: number }[]>([]);
  const box = useRef<HTMLDivElement>(null);

  const top = BUSINESSES[owned - 1];
  const next = BUSINESSES[owned];
  const perSec = BUSINESSES.slice(0, owned).reduce((s, b) => s + b.rate, 0) * 0.5 * prestige;
  const perTap = top.rate * prestige;

  // Idle income, only while the toy is actually on screen.
  useEffect(() => {
    let on = true;
    const el = box.current;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    if (el) io.observe(el);
    const id = setInterval(() => on && setCash((c) => c + perSec / 10), 100);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [perSec]);

  const tap = (e: React.PointerEvent) => {
    setCash((c) => c + perTap);
    const r = e.currentTarget.getBoundingClientRect();
    const id = performance.now() + Math.random();
    setPops((p) => [...p.slice(-10), { id, x: e.clientX - r.left, v: perTap }]);
    setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 900);
  };

  const buy = () => {
    if (!next || cash < next.cost) return;
    setCash((c) => c - next.cost);
    setOwned((o) => o + 1);
  };

  const ipo = () => {
    setPrestige((p) => p * 2);
    setCash(0);
    setOwned(1);
  };

  const progress = next ? Math.min(cash / next.cost, 1) : 1;
  const Icon = top.icon;

  return (
    <div ref={box} className="flex h-full flex-col bg-gradient-to-b from-[#FFF3C9] to-[#FFD8B8] px-3.5 pb-4 pt-10 font-sans text-[#2A1500]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] font-bold tracking-tight">StackUp</p>
        {prestige > 1 && (
          <span className="rounded-full bg-[#2A1500] px-2.5 py-1 text-[10px] font-semibold text-[#FFD166]">
            IPO ×{prestige}
          </span>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-white/70 p-3 text-center">
        <p className="text-[10.5px] font-semibold text-black/50">Net worth</p>
        <p className="font-display text-[30px] font-extrabold leading-none tracking-tight">{money(cash)}</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[10.5px] font-semibold text-[#D9480F]">
          <TrendingUp className="h-3 w-3" /> {money(perSec)}/s while you are away
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <motion.button
          type="button"
          onPointerDown={tap}
          whileTap={{ scale: 0.88, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 600, damping: 15 }}
          className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full shadow-[0_14px_0_#2A150022,0_24px_40px_-14px_#D9480F]"
          style={{ background: top.colour, touchAction: 'manipulation' }}
          aria-label={`Tap the ${top.name} to earn ${money(perTap)}`}
        >
          <Icon className="h-11 w-11" strokeWidth={1.75} />
          <span className="mt-1 text-[11px] font-bold">{top.name}</span>
          <AnimatePresence>
            {pops.map((p) => (
              <motion.span
                key={p.id}
                className="pointer-events-none absolute top-2 font-display text-[15px] font-extrabold text-[#D9480F]"
                style={{ left: p.x }}
                initial={{ y: 0, opacity: 1, scale: 0.8 }}
                animate={{ y: -80, opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                +{money(p.v)}
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.button>
      </div>

      {next ? (
        <button
          type="button"
          onClick={buy}
          disabled={cash < next.cost}
          className="relative h-12 overflow-hidden rounded-full bg-[#2A1500] text-[12px] font-semibold text-white transition-transform active:scale-95"
        >
          <motion.span
            className="absolute inset-y-0 left-0 bg-[#D9480F]"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.2 }}
          />
          <span className="relative">
            {cash >= next.cost ? `Buy a ${next.name}!` : `${next.name} at ${money(next.cost)}`}
          </span>
        </button>
      ) : (
        <motion.button
          type="button"
          onClick={ipo}
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="h-12 rounded-full bg-[#D9480F] text-[12px] font-bold text-white"
        >
          You own the moon. Go public (IPO ×2)
        </motion.button>
      )}
      <p className="mt-2 text-center text-[10px] text-black/45">
        {owned}/{BUSINESSES.length} businesses · tap fast, it adds up
      </p>
    </div>
  );
}
