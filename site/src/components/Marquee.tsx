import { marqueeItems } from '../data/site';

/** Infinite ticker — the list is rendered twice so the loop is seamless. */
export function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative border-y border-line py-5">
      <div className="mask-fade-x overflow-hidden">
        <ul className="flex w-max animate-marquee items-center gap-10 pr-10">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="flex shrink-0 items-center gap-10">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-faint">{item}</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-signal/60" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
