import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Compass,
  Copy,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MoonStar,
  Phone,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { profile, projects, sections, ventures } from '../data/site';
import { useScrollLock, useTheme } from '../lib/hooks';

interface Item {
  id: string;
  label: string;
  hint: string;
  group: 'Navigate' | 'Projects' | 'Beyond code' | 'Contact' | 'Preferences';
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, toggleTheme] = useTheme();

  useScrollLock(open);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => {
      onClose();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const open_ = (href: string) => () => {
      onClose();
      window.open(href, '_blank', 'noopener,noreferrer');
    };

    return [
      ...sections.map<Item>((s) => ({
        id: `nav-${s.id}`,
        label: s.label,
        hint: 'Jump to section',
        group: 'Navigate',
        icon: <Compass className="h-4 w-4" />,
        run: go(s.id),
      })),
      ...projects.map<Item>((p) => ({
        id: `project-${p.id}`,
        label: p.name,
        hint: p.tagline,
        group: 'Projects',
        icon: <ArrowUpRight className="h-4 w-4" />,
        run: () => {
          onClose();
          window.dispatchEvent(new CustomEvent('open-project', { detail: p.id }));
        },
      })),
      ...ventures.map<Item>((v) => ({
        id: `venture-${v.id}`,
        label: v.name,
        hint: `${v.kind} · ${v.handle}`,
        group: 'Beyond code',
        icon: <Instagram className="h-4 w-4" />,
        run: open_(v.href),
      })),
      {
        id: 'mail',
        label: 'Send an email',
        hint: profile.email,
        group: 'Contact',
        icon: <Mail className="h-4 w-4" />,
        run: () => {
          onClose();
          window.location.href = `mailto:${profile.email}`;
        },
      },
      {
        id: 'copy',
        label: 'Copy email address',
        hint: profile.email,
        group: 'Contact',
        icon: <Copy className="h-4 w-4" />,
        run: () => {
          void navigator.clipboard?.writeText(profile.email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        },
      },
      {
        id: 'phone',
        label: 'Call',
        hint: profile.phone,
        group: 'Contact',
        icon: <Phone className="h-4 w-4" />,
        run: () => {
          onClose();
          window.location.href = `tel:${profile.phoneHref}`;
        },
      },
      {
        id: 'linkedin',
        label: 'LinkedIn profile',
        hint: 'linkedin.com/in/danny-merhej',
        group: 'Contact',
        icon: <Linkedin className="h-4 w-4" />,
        run: open_(profile.linkedin),
      },
      {
        id: 'github',
        label: 'GitHub profile',
        hint: 'github.com/DanyMerhej',
        group: 'Contact',
        icon: <Github className="h-4 w-4" />,
        run: open_(profile.github),
      },
      {
        id: 'instagram',
        label: 'Instagram',
        hint: profile.instagramHandle,
        group: 'Contact',
        icon: <Instagram className="h-4 w-4" />,
        run: open_(profile.instagram),
      },
      {
        id: 'theme',
        label: 'Toggle light / dark',
        hint: 'Switch the palette',
        group: 'Preferences',
        icon: <MoonStar className="h-4 w-4" />,
        run: toggleTheme,
      },
    ];
  }, [onClose, toggleTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<Item['group'], Item[]>();
    results.forEach((item) => {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    });
    return [...map.entries()];
  }, [results]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      // Wait for the entrance transform before focusing, or Safari scrolls the page.
      const id = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => (results.length ? (c + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        results[cursor]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, cursor, onClose]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, projects, contact…"
                className="w-full bg-transparent py-4 text-sm text-ink outline-none placeholder:text-faint"
                aria-label="Search"
              />
              <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {grouped.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-faint">Nothing matches that.</p>
              )}

              {grouped.map(([group, list]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    {group}
                  </p>
                  {list.map((item) => {
                    flatIndex += 1;
                    const selected = flatIndex === cursor;
                    const myIndex = flatIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setCursor(myIndex)}
                        onClick={item.run}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          selected ? 'bg-raised text-ink' : 'text-muted'
                        }`}
                      >
                        <span className={selected ? 'text-accent' : 'text-faint'}>{item.icon}</span>
                        <span className="flex-1 text-sm text-ink">{item.label}</span>
                        <span className="hidden truncate text-xs text-faint sm:block">
                          {item.id === 'copy' && copied ? 'Copied' : item.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
