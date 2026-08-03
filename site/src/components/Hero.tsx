import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Instagram, Linkedin, Mail } from 'lucide-react';
import { BackdropField } from './BackdropField';
import { Scramble } from './Scramble';
import { profile } from '../data/site';

const NAME = 'MERHEJ';

export function Hero() {
  const reduced = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <header id="top" className="relative isolate overflow-hidden">
      {/* Layered backdrop: hairline grid, drifting colour, interactive dot field. */}
      <div aria-hidden="true" className="absolute inset-0 grid-field" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 animate-breathe rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--c-signal) / 0.14), rgb(var(--c-violet) / 0.10) 45%, transparent 70%)',
        }}
      />
      <BackdropField />

      {/* Extra bottom padding on small screens clears the fixed section bar. */}
      <div className="shell relative flex min-h-[100svh] flex-col justify-center pb-28 pt-32 md:pb-24 md:pt-36">
        <motion.div {...rise(0.05)} className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Open to the right conversation
            </span>
          </span>
          <span className="eyebrow">{profile.location}</span>
        </motion.div>

        {/* Name: letters stagger in, then behave as one block. */}
        <h1 className="mt-9 font-display font-extrabold leading-[0.85]">
          <motion.span {...rise(0.12)} className="block text-10xl">
            DANNY
          </motion.span>
          <span className="block text-10xl" aria-hidden="true">
            {NAME.split('').map((letter, i) => (
              <motion.span
                key={`${letter}-${i}`}
                className="inline-block"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: '0.35em' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.22 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                style={
                  i === NAME.length - 1
                    ? { color: 'rgb(var(--c-accent))' }
                    : undefined
                }
              >
                {letter}
              </motion.span>
            ))}
          </span>
          <span className="sr-only">Danny Merhej</span>
        </h1>

        <motion.div
          {...rise(0.5)}
          className="mt-8 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-start md:gap-12"
        >
          <p className="text-sm text-muted md:w-[15rem] md:shrink-0">
            <span className="text-ink">Currently</span>
            <br />
            <Scramble phrases={profile.roles} />
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-muted text-pretty md:text-lg">
            {profile.intro}
          </p>
        </motion.div>

        <motion.div {...rise(0.62)} className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#projects" className="btn-primary group">
            See the work
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a href={`mailto:${profile.email}`} className="btn-ghost group">
            <Mail className="h-4 w-4" />
            Get in touch
          </a>
          <div className="ml-1 flex items-center gap-1">
            <IconLink href={profile.linkedin} label="LinkedIn">
              <Linkedin className="h-[18px] w-[18px]" />
            </IconLink>
            <IconLink href={profile.instagram} label="Instagram">
              <Instagram className="h-[18px] w-[18px]" />
            </IconLink>
          </div>
        </motion.div>

        <motion.a
          {...rise(0.8)}
          href="#work"
          aria-label="Scroll to experience"
          className="mt-16 hidden w-fit items-center gap-3 text-faint transition-colors hover:text-ink md:mt-20 md:inline-flex"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">Scroll</span>
        </motion.a>
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted
                 transition-all duration-300 hover:-translate-y-0.5 hover:border-faint hover:text-ink"
    >
      {children}
    </a>
  );
}
