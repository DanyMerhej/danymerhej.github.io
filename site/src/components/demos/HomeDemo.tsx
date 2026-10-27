import { AnimatePresence, motion } from 'framer-motion';
import { Fan, Flame, Lamp, Lightbulb, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Tile {
  id: string;
  name: string;
  room: string;
  icon: LucideIcon;
  /** The colour the tile glows in when it is on: the device's real light. */
  colour: string;
}

const TILES: Tile[] = [
  { id: 'lamp', name: 'Floor lamp', room: 'Living room', icon: Lamp, colour: '#FFC27A' },
  { id: 'ceiling', name: 'Ceiling', room: 'Kitchen', icon: Lightbulb, colour: '#FFF1D6' },
  { id: 'bedside', name: 'Bedside', room: 'Bedroom', icon: Lightbulb, colour: '#FF9F8A' },
  { id: 'heater', name: 'Water heater', room: 'Bathroom', icon: Flame, colour: '#FFB547' },
];

const ASKS: { say: string; on: string[] | null; reply: string; ac?: boolean }[] = [
  { say: 'Movie night', on: ['lamp'], reply: 'Movie night: the floor lamp stays, the rest is off.' },
  { say: 'AC 22', on: null, reply: 'The living room AC is cooling to 22°.', ac: true },
  { say: 'All off', on: [], reply: 'Done. Everything in the house is off.' },
];

/** The orb, Beityy's own face: lavender and cyan, two eyes that blink. */
function Orb({ busy }: { busy: boolean }) {
  return (
    <motion.span
      className="relative flex h-11 w-11 shrink-0 items-center justify-center gap-[7px] rounded-full"
      style={{
        background: 'radial-gradient(circle at 35% 28%, #FFFFFF 0%, #C9C2FF 30%, #8F82F5 62%, #5ED8EE 100%)',
        boxShadow: '0 0 24px 4px rgba(143,130,245,0.45)',
      }}
      animate={busy ? { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] } : { scale: [1, 1.05, 1] }}
      transition={busy ? { duration: 0.6 } : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="h-[9px] w-[5px] rounded-full bg-[#0B1324]"
          animate={{ scaleY: busy ? 0.35 : [1, 1, 0.1, 1] }}
          transition={busy ? { duration: 0.2 } : { duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
        />
      ))}
    </motion.span>
  );
}

/** Beityy in miniature: switch the lamps, set the AC, then ask Beityy to do it for you. */
export function HomeDemo() {
  const [on, setOn] = useState<Set<string>>(new Set(['lamp']));
  const [ac, setAc] = useState<{ on: boolean; target: number }>({ on: false, target: 24 });
  const [reply, setReply] = useState<{ id: number; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const lit = TILES.filter((t) => on.has(t.id));
  // The light at the top of the screen is the mix of whatever is really on.
  const aura = lit.length
    ? lit.map((t, i) => `radial-gradient(circle at ${20 + (i * 60) / Math.max(1, lit.length - 1)}% 0%, ${t.colour}66, transparent 62%)`).join(',')
    : 'none';

  const toggle = (id: string) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const ask = (a: (typeof ASKS)[number]) => {
    setBusy(true);
    setReply(null);
    setTimeout(() => {
      if (a.on) setOn(new Set(a.on));
      if (a.ac) setAc({ on: true, target: 22 });
      if (a.on && !a.on.length) setAc((c) => ({ ...c, on: false }));
      setBusy(false);
      setReply({ id: Date.now(), text: a.reply });
    }, 650);
  };

  return (
    <div className="relative flex h-full flex-col bg-[#060A13] px-3.5 pb-4 pt-10 font-sans text-[#EEF4FF]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 transition-[background] duration-1000" style={{ background: aura }} />
      {ac.on && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_50%_100%,rgba(130,170,255,0.22),transparent_70%)]" />}

      <div className="relative">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
          <span className="h-1.5 w-1.5 rounded-full bg-[#72E4F7]" /> Our house · {lit.length} of {TILES.length} on
        </p>
        <p className="mt-1 font-display text-[26px] font-light tracking-tight">Good evening</p>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2">
        {TILES.map((t) => {
          const isOn = on.has(t.id);
          const Icon = t.icon;
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              aria-pressed={isOn}
              className="flex h-[74px] flex-col justify-between rounded-[18px] border p-2.5 text-left"
              animate={{
                backgroundColor: isOn ? t.colour : 'rgba(255,255,255,0.05)',
                borderColor: isOn ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.09)',
                boxShadow: isOn ? `0 0 26px 2px ${t.colour}55` : '0 0 0 0 rgba(0,0,0,0)',
                color: isOn ? '#1A1206' : '#EEF4FF',
              }}
              transition={{ duration: 0.45 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="h-4 w-4" />
              <span>
                <span className="block text-[11.5px] font-semibold leading-tight">{t.name}</span>
                <span className="block text-[9.5px] opacity-60">
                  {t.room} · {isOn ? 'On' : 'Off'}
                </span>
              </span>
            </motion.button>
          );
        })}

        <motion.div
          className="col-span-2 flex items-center gap-2.5 rounded-[18px] border p-2.5"
          animate={{
            backgroundColor: ac.on ? '#BFD4FF' : 'rgba(255,255,255,0.05)',
            borderColor: ac.on ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.09)',
            color: ac.on ? '#0B1630' : '#EEF4FF',
          }}
          transition={{ duration: 0.45 }}
        >
          <button
            type="button"
            onClick={() => setAc((c) => ({ ...c, on: !c.on }))}
            aria-pressed={ac.on}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <motion.span animate={ac.on ? { rotate: 360 } : { rotate: 0 }} transition={ac.on ? { duration: 2.4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}>
              <Fan className="h-4 w-4" />
            </motion.span>
            <span>
              <span className="block text-[11.5px] font-semibold leading-tight">Living room AC</span>
              <span className="block text-[9.5px] opacity-60">{ac.on ? `Cooling to ${ac.target}°` : 'Off · 27° inside'}</span>
            </span>
          </button>
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? 'Cooler' : 'Warmer'}
              onClick={() => setAc((c) => ({ on: true, target: Math.min(30, Math.max(16, c.target + d)) }))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10"
            >
              {d < 0 ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          ))}
          <span className="w-8 text-right font-display text-[20px] font-light tabular-nums">{ac.target}°</span>
        </motion.div>
      </div>

      <div className="relative mt-auto">
        <div className="min-h-[34px]">
          <AnimatePresence mode="wait">
            {reply && (
              <motion.p
                key={reply.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] leading-snug text-white/80"
              >
                {reply.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pr-2">
          <Orb busy={busy} />
          <div className="flex flex-wrap gap-1">
            {ASKS.map((a) => (
              <button
                key={a.say}
                type="button"
                onClick={() => ask(a)}
                disabled={busy}
                className="rounded-full border border-[#72E4F7]/40 px-2 py-1 text-[10.5px] font-semibold text-[#72E4F7]"
              >
                {a.say}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
