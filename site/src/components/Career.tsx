import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Role } from '../data/site';
import { experience, impactStats, irisModules, metrics, worlds } from '../data/site';
import { useOverlayHistory, useScrollLock, useWorld } from '../lib/hooks';
import { Mask, Rise, Words, useShown } from './Motion';
import { Odometer } from './Odometer';

const TILE = ['#C6F94E', '#F0A6E0', '#FFB86B', '#8FB8FF'];

/**
 * The day job, on warm paper because it is the part people read closely:
 * what IRIS is, the numbers, the roles as a stack of cards, and what changed
 * because of the work.
 */
export function Career() {
  const ref = useRef<HTMLElement>(null);
  useWorld(ref, 'career', worlds.cream);
  const [reading, setReading] = useState<number | null>(null);

  return (
    <section id="career" ref={ref} className="relative py-24 md:py-36">
      <div className="gutter">
        <p className="eyebrow">The day job</p>
        <Mask as="h2" className="display h-section mt-6 max-w-5xl">
          <span className="block">Seven years.</span>
        </Mask>
        <Mask as="p" delay={0.06} className="display h-section max-w-5xl">
          <span className="block">One company.</span>
        </Mask>
        <Mask as="p" delay={0.12} className="serif-i h-section max-w-5xl text-accent">
          <span className="block">Intern to team lead.</span>
        </Mask>
        <p className="lede pretty mt-8 max-w-2xl">
          <Words text="At Pixel Software Solutions I lead the team behind IRIS, an enterprise insurance ERP that more than 30 companies across the Middle East, Africa and Europe run their operations on." />
        </p>
      </div>

      <div className="gutter mt-14 grid grid-cols-1 items-center gap-12 md:mt-20 md:grid-cols-2">
        <Orbit />
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <Rise
              key={m.label}
              delay={i * 0.06}
              className="relative isolate flex aspect-square flex-col justify-between rounded-[1.75rem] p-4 text-[#16121F] sm:p-6"
            >
              <div className="absolute inset-0 -z-10 rounded-[1.75rem]" style={{ background: TILE[i] }} />
              <p className="display text-[clamp(2.2rem,10vw,3.6rem)] leading-none">
                <Odometer value={m.value} suffix={m.suffix} />
              </p>
              <div>
                <p className="text-[14px] font-semibold leading-snug sm:text-[15px]">{m.label}</p>
                <p className="mt-1 text-[12px] leading-snug opacity-70">{m.sub}</p>
              </div>
            </Rise>
          ))}
        </div>
      </div>

      {/* Roles, newest first, stacking as you scroll. */}
      <div className="gutter mt-24 md:mt-32">
        <h3 className="display text-[clamp(2rem,7vw,3.6rem)]">The roles</h3>
        <p className="mt-2 text-fg/70">Scroll through them, and open any one to read the whole of it.</p>
        <RoleStack onRead={setReading} />
      </div>
      <RoleSheet index={reading} onClose={() => setReading(null)} />

      {/* Impact */}
      <div className="gutter mt-20 md:mt-28">
        <h3 className="display text-[clamp(2rem,7vw,3.6rem)]">What changed because of it</h3>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {impactStats.map((s, i) => (
            <Impact key={s.label} stat={s} delay={i * 0.08} colour={TILE[i]} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * IRIS in the middle, its modules circling it. The ring turns with a CSS
 * animation and each label turns back the other way to stay upright, all on
 * the compositor; no script runs while it spins.
 */
function Orbit() {
  const n = irisModules.length;
  const [ref, shown] = useShown<HTMLDivElement>();

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-[84%] max-w-[440px] sm:w-full">
      <div className="absolute inset-[8%] rounded-full border-2 border-dashed border-fg/15" />
      <div className="absolute inset-[19%] rounded-full border-2 border-fg/10" />
      <div
        className={`absolute inset-[37%] flex flex-col items-center justify-center rounded-full bg-fg text-bg transition-[transform,opacity] duration-700 ease-out ${
          shown ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <span className="display text-[clamp(1.5rem,7vw,2.6rem)]">IRIS</span>
        <span className="text-[10px] font-medium opacity-70 sm:text-[11px]">30+ insurers</span>
      </div>

      <ul className="spin-slow absolute inset-0">
        {irisModules.map((m, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          // Two rings, alternating, so long names never sit shoulder to shoulder,
          // and the inner one clear of the centre.
          const r = i % 2 ? 31 : 46;
          return (
            <li key={m} className="absolute" style={{ left: `${50 + r * Math.cos(a)}%`, top: `${50 + r * Math.sin(a)}%` }}>
              <span className="block -translate-x-1/2 -translate-y-1/2">
                <span className="spin-slow-rev block">
                  <span
                    className="block whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-[#16121F] shadow-sm sm:text-[12.5px]"
                    style={{ background: TILE[i % TILE.length] }}
                  >
                    {m}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The roles as a stack. Each card pins a little below the one before it and
 * holds still for a stretch of scrolling, so it can be read, before the next
 * one slides up over it. Every card is as tall as the tallest, so a short
 * card never leaves the bottom of the one beneath it showing.
 *
 * Cards never expand in place: a pinned card that grew had to stop pinning,
 * which threw it back up the page and made the stack skip a card. The whole
 * role opens in a sheet instead.
 */
const STACK_TOP = 88;
const STACK_STEP = 16;

function RoleStack({ onRead }: { onRead: (i: number) => void }) {
  const list = useRef<HTMLOListElement>(null);
  // Off when a card would not fit on screen below the ones pinned above it
  // (a phone on its side, very large text): the next card would cover the
  // end of it, button included, so the cards simply follow one another.
  const [stack, setStack] = useState(true);

  // The tallest card's content sets the height of all of them.
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const inners = [...ol.querySelectorAll<HTMLElement>('[data-role-inner]')];
    const cards = [...ol.querySelectorAll<HTMLElement>('[data-role-card]')];
    // The screen's height with the browser's toolbars showing, which does not
    // change as they slide away, so the stack never switches mid-scroll.
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;height:100svh;width:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const fit = () => {
      const tallest = Math.max(...inners.map((el) => el.offsetHeight));
      if (tallest <= 0) return;
      ol.style.setProperty('--role-h', `${tallest}px`);
      const card = Math.max(...cards.map((el) => el.offsetHeight));
      setStack(STACK_TOP + STACK_STEP * (experience.length - 1) + card + 16 <= probe.offsetHeight);
    };
    fit();
    const ro = new ResizeObserver(fit);
    inners.forEach((el) => ro.observe(el));
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      fit();
    };
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      probe.remove();
    };
  }, []);

  return (
    <ol ref={list} className={stack ? 'mt-8' : 'mt-8 space-y-5'}>
      {experience.map((role, i) => (
        <Fragment key={`${role.company}-${role.title}`}>
          <li
            data-role-card
            // A card comes to the front only for keyboard focus, so Tab never
            // lands on a button hidden under the cards pinned over it. Not for
            // any focus: closing a role's sheet hands focus back to the card's
            // button, and that card then stayed in front of every later one.
            className={stack ? 'sticky has-[:focus-visible]:z-10' : ''}
            style={stack ? { top: `${STACK_TOP + i * STACK_STEP}px` } : undefined}
          >
            <RoleCard role={role} index={i} onRead={() => onRead(i)} />
          </li>
          {/* The stretch of scrolling each card holds still for. A spacer
              rather than a margin: a pinned card's margin counts against how
              long it can stay pinned, and the last card would never hold. */}
          {stack && <li aria-hidden="true" className="h-[32svh]" />}
        </Fragment>
      ))}
    </ol>
  );
}

function RoleCard({ role, index, onRead }: { role: Role; index: number; onRead: () => void }) {
  const more = role.points.length - 1 + (role.tags?.length ? 1 : 0);

  return (
    <div
      className="rounded-[1.75rem] border-2 border-fg/10 p-5 shadow-[0_-14px_40px_-22px_rgba(0,0,0,0.3)] sm:p-8"
      style={{ background: `color-mix(in srgb, var(--bg) ${94 - index * 2}%, var(--fg))` }}
    >
      <div style={{ minHeight: 'var(--role-h)' }}>
        <div data-role-inner className="flex flex-col">
          <span className="flex flex-wrap items-center gap-2">
            <span className="chip">{role.period}</span>
            {role.current && <span className="chip bg-accent text-bg">Now</span>}
            <span className="ml-auto font-mono text-[12px] text-fg/50">
              {String(index + 1).padStart(2, '0')} / {String(experience.length).padStart(2, '0')}
            </span>
          </span>
          <span className="display mt-3 block text-[clamp(1.6rem,6.5vw,2.5rem)] leading-[1.02]">{role.title}</span>
          <span className="mt-1.5 block text-[15px] text-fg/70">
            {role.company} · {role.place}
          </span>
          <ul className="mt-5">
            <Point text={role.points[0]} />
          </ul>
          {more > 0 && (
            <button
              type="button"
              onClick={onRead}
              className="mt-5 inline-flex items-center gap-1.5 self-start text-[14.5px] font-semibold text-accent"
            >
              Read the whole role <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** One role in full, in a sheet from the bottom of the screen. */
function RoleSheet({ index, onClose }: { index: number | null; onClose: () => void }) {
  const open = index !== null;
  const role = index === null ? null : experience[index];
  // Kept through the closing animation, after `index` has gone.
  const shown = useRef<Role | null>(null);
  if (role) shown.current = role;
  const r = role ?? shown.current;

  useScrollLock(open);
  const layer = useRef<HTMLDivElement>(null);
  useOverlayHistory(open, onClose, layer);
  const close = useRef<HTMLButtonElement>(null);

  // Focus moves into the sheet and stays there (its close button is the only
  // control), and goes back to the card's button when it closes.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'Tab') {
        e.preventDefault();
        close.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && r && (
        <div key="sheet" ref={layer} className="fixed inset-0 z-[320]">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/45"
            style={{ touchAction: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={r.title}
            // Its own scrolling, not the smooth scroller's.
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[86svh] max-w-2xl overflow-y-auto overscroll-contain rounded-t-[2rem] bg-bg p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-fg shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.5)] sm:p-8"
            initial={{ transform: 'translateY(100%)' }}
            animate={{ transform: 'translateY(0%)' }}
            exit={{ transform: 'translateY(100%)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-fg/20" aria-hidden="true" />
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="chip">{r.period}</span>
                  {r.current && <span className="chip bg-accent text-bg">Now</span>}
                </span>
                <p className="display mt-3 text-[clamp(1.8rem,7vw,2.6rem)] leading-[1.02]">{r.title}</p>
                <p className="mt-1.5 text-[15px] text-fg/70">
                  {r.company} · {r.place}
                </p>
              </div>
              <button
                ref={close}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-fg/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-6 space-y-3">
              {r.points.map((p) => (
                <Point key={p} text={p} />
              ))}
            </ul>
            {r.tags && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Point({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-[15.5px] leading-relaxed text-fg/85">
      <span aria-hidden="true" className="mt-[0.6rem] h-2 w-2 shrink-0 rounded-full bg-accent" />
      <span className="pretty">{text}</span>
    </li>
  );
}

function Impact({
  stat,
  delay,
  colour,
}: {
  stat: (typeof impactStats)[number];
  delay: number;
  colour: string;
}) {
  const pct = parseInt(stat.value, 10);
  const [ref, shown] = useShown<HTMLDivElement>();
  return (
    <Rise as="li" delay={delay} className="rounded-[1.75rem] border-2 border-fg/10 p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="display text-[clamp(2.6rem,11vw,4rem)] leading-none">{stat.value}</p>
        <p className="text-right text-[16px] font-semibold">{stat.label}</p>
      </div>
      {/* The bar grows with scaleX rather than width, so it never triggers layout. */}
      <div ref={ref} className="mt-4 h-3 overflow-hidden rounded-full bg-fg/10">
        <div
          className="h-full w-full origin-left rounded-full transition-transform duration-[1400ms] ease-out"
          style={
            {
              background: colour,
              transform: `scaleX(${shown ? pct / 100 : 0})`,
              transitionDelay: `${delay + 0.2}s`,
            } as CSSProperties
          }
        />
      </div>
      <p className="pretty mt-3 text-[15px] text-fg/75">{stat.detail}</p>
    </Rise>
  );
}
