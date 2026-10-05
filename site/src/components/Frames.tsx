import type { ReactNode } from 'react';

/** A phone, drawn in CSS: a dark bezel, an island, and a screen for anything. */
export function Phone({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/19] w-[min(72vw,300px)] rounded-[2.6rem] bg-[#0B0A10] p-[10px] ${className ?? ''}`}
      style={{
        boxShadow: `0 0 0 1.5px #2A2833, 0 40px 80px -30px ${glow ?? '#000'}cc, inset 0 0 0 1px #3A3844`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.05rem] bg-white">
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-2 z-20 h-[22px] w-[34%] -translate-x-1/2 rounded-full bg-[#0B0A10]"
        />
      </div>
    </div>
  );
}

/** A browser window with the site's address in the bar. */
export function Browser({
  children,
  url,
  className,
}: {
  children: ReactNode;
  url: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.1rem] bg-[#16141C] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white/10 px-3 py-1 text-center font-mono text-[11px] text-white/70">
          {url}
        </span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/** A screenshot that sits inside a frame and loads only when needed. */
export function Shot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`block h-full w-full object-cover object-top ${className ?? ''}`}
    />
  );
}
