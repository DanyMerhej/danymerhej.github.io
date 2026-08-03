import { ArrowUp } from 'lucide-react';
import { profile } from '../data/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line pb-28 pt-14 md:pb-14">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">{profile.name}</p>
            <p className="mt-2 max-w-md text-sm text-muted text-pretty">{profile.title}</p>
          </div>

          <a
            href="#top"
            className="group inline-flex items-center gap-3 self-start text-sm text-muted transition-colors hover:text-ink md:self-auto"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">Back to top</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-transform duration-300 group-hover:-translate-y-0.5">
              <ArrowUp className="h-4 w-4" />
            </span>
          </a>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-7 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Danny Merhej. Built from scratch with React, TypeScript, Tailwind and Framer Motion.</p>
          <p className="font-mono">
            Press <kbd className="rounded border border-line px-1.5 py-0.5">⌘K</kbd> to navigate
          </p>
        </div>
      </div>
    </footer>
  );
}
