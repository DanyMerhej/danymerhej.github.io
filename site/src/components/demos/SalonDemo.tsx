import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

const STAFF = ['Maya', 'Lea', 'Nour'];
const HOURS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
const STATUSES = [
  { label: 'New', colour: '#E5E7EB' },
  { label: 'Confirmed', colour: '#BFE3FF' },
  { label: 'Checked in', colour: '#FFE08A' },
  { label: 'In service', colour: '#FFB86B' },
  { label: 'Completed', colour: '#B8F0C8' },
];

interface Appt {
  id: string;
  service: string;
  client: string;
  col: number;
  row: number;
  len: number;
  status: number;
  colour: string;
}

const START: Appt[] = [
  { id: 'a', service: 'Laser', client: 'Rita', col: 2, row: 0, len: 2, status: 1, colour: '#FF7AB6' },
  { id: 'b', service: 'Nails', client: 'Joelle', col: 0, row: 1, len: 1, status: 0, colour: '#FFB86B' },
  { id: 'c', service: 'Facial', client: 'Sara', col: 1, row: 2, len: 2, status: 2, colour: '#C6A8FF' },
  { id: 'd', service: 'Brows', client: 'Nadine', col: 0, row: 3, len: 1, status: 1, colour: '#8FD3FF' },
];

const ROW = 46;

function clash(list: Appt[], me: Appt, col: number, row: number) {
  return list.some((o) => o.id !== me.id && o.col === col && row < o.row + o.len && o.row < row + me.len);
}

function Block({
  appt,
  colW,
  onDrop,
  onTap,
}: {
  appt: Appt;
  colW: number;
  onDrop: (a: Appt, col: number, row: number) => boolean;
  onTap: (a: Appt) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const moved = useRef(false);
  const [shake, setShake] = useState(0);
  const status = STATUSES[appt.status];

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      style={{
        x,
        y,
        left: appt.col * colW + 3,
        top: appt.row * ROW + 2,
        width: colW - 6,
        height: appt.len * ROW - 4,
        background: appt.colour,
        touchAction: 'none',
      }}
      animate={shake ? { rotate: [0, -4, 4, -3, 3, 0] } : { rotate: 0 }}
      transition={{ duration: 0.45 }}
      whileDrag={{ scale: 1.06, zIndex: 20, boxShadow: '0 16px 30px -10px rgba(0,0,0,0.35)' }}
      onDragStart={() => (moved.current = true)}
      onDragEnd={() => {
        const col = Math.max(0, Math.min(STAFF.length - 1, Math.round((appt.col * colW + x.get()) / colW)));
        const row = Math.max(0, Math.min(HOURS.length - appt.len, Math.round((appt.row * ROW + y.get()) / ROW)));
        const ok = onDrop(appt, col, row);
        if (ok) {
          // The block's slot changed underneath it; keep it where the finger left
          // it, then let it settle into the new slot.
          x.set(appt.col * colW + x.get() - col * colW);
          y.set(appt.row * ROW + y.get() - row * ROW);
        } else {
          setShake((s) => s + 1);
        }
        animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
        animate(y, 0, { type: 'spring', stiffness: 420, damping: 32 });
        setTimeout(() => (moved.current = false), 0);
      }}
      onTap={() => !moved.current && onTap(appt)}
      className="absolute cursor-grab overflow-hidden rounded-lg p-1.5 text-[#2A0F06] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-[11px] font-bold leading-tight">{appt.service}</p>
        <GripVertical className="h-3 w-3 shrink-0 opacity-50" />
      </div>
      <p className="truncate text-[9.5px] font-medium opacity-80">{appt.client}</p>
      <span
        className="mt-1 inline-block rounded-full px-1.5 py-[1px] text-[8.5px] font-semibold"
        style={{ background: status.colour }}
      >
        {status.label}
      </span>
    </motion.div>
  );
}

/** Salonyy in miniature: drag appointments between staff and hours, tap one to move it along. */
export function SalonDemo() {
  const [appts, setAppts] = useState(START);
  const [toast, setToast] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(72);

  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const measure = () => setColW(el.clientWidth / STAFF.length);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const say = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600);
  };

  const onDrop = (a: Appt, col: number, row: number) => {
    if (col === a.col && row === a.row) return true;
    if (clash(appts, a, col, row)) {
      say(`Conflict: ${STAFF[col]} is busy at ${HOURS[row]}`);
      return false;
    }
    setAppts((list) => list.map((o) => (o.id === a.id ? { ...o, col, row } : o)));
    say(`${a.service} moved to ${STAFF[col]}, ${HOURS[row]}`);
    return true;
  };

  const onTap = (a: Appt) => {
    const next = (a.status + 1) % STATUSES.length;
    setAppts((list) => list.map((o) => (o.id === a.id ? { ...o, status: next } : o)));
    say(`${a.client}: ${STATUSES[next].label}`);
  };

  return (
    <div className="relative flex h-full flex-col bg-[#FFF7F0] px-3 pb-4 pt-10 font-sans text-[#3A1606]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[19px] font-bold tracking-tight">Today</p>
        <span className="rounded-full bg-[#3A1606] px-2.5 py-1 text-[10px] font-semibold text-[#FFB86B]">
          {appts.length} bookings
        </span>
      </div>
      <p className="mt-0.5 text-[10.5px] text-black/50">Drag to reschedule. Tap to move it along.</p>

      <div className="mt-2 flex pl-9">
        {STAFF.map((s) => (
          <p key={s} className="flex-1 text-center text-[10.5px] font-bold">
            {s}
          </p>
        ))}
      </div>

      <div className="relative mt-1 flex">
        <div className="w-9 shrink-0">
          {HOURS.map((h) => (
            <p key={h} className="font-mono text-[9px] text-black/40" style={{ height: ROW }}>
              {h}
            </p>
          ))}
        </div>
        <div ref={grid} className="relative flex-1 rounded-xl bg-white" style={{ height: ROW * HOURS.length }}>
          {HOURS.map((h, i) => (
            <div key={h} className="absolute inset-x-0 border-t border-black/[0.06]" style={{ top: i * ROW }} />
          ))}
          {STAFF.map((s, i) =>
            i === 0 ? null : (
              <div key={s} className="absolute inset-y-0 border-l border-black/[0.06]" style={{ left: i * colW }} />
            ),
          )}
          {appts.map((a) => (
            <Block key={a.id} appt={a} colW={colW} onDrop={onDrop} onTap={onTap} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`absolute inset-x-3 bottom-3 rounded-xl px-3 py-2 text-center text-[11px] font-semibold text-white ${
              toast.startsWith('Conflict') ? 'bg-[#D7263D]' : 'bg-[#3A1606]'
            }`}
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
