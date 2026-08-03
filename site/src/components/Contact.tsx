import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { profile } from '../data/site';
import { Reveal } from './Reveal';

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-24 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--c-signal) / 0.13), rgb(var(--c-violet) / 0.09) 50%, transparent 72%)',
        }}
      />

      <div className="shell relative">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="eyebrow">05 / Contact</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-8 max-w-4xl font-display text-display font-semibold text-balance">
            Got something worth building?
            <br />
            <span className="text-accent">Let's talk about it.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted text-pretty md:text-lg">
            Open to senior engineering and technical leadership roles, architecture consulting, and
            product work where the whole thing needs building — not just a screen. Fastest way to
            reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-11 flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="btn-primary group">
              <Mail className="h-4 w-4" />
              {profile.email}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button type="button" onClick={copyEmail} className="btn-ghost">
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy address'}
            </button>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          <ContactTile
            icon={<Linkedin className="h-4 w-4" />}
            label="LinkedIn"
            value="danny-merhej"
            href={profile.linkedin}
            delay={0}
          />
          <ContactTile
            icon={<Github className="h-4 w-4" />}
            label="GitHub"
            value="DanyMerhej"
            href={profile.github}
            delay={0.06}
          />
          <ContactTile
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={profile.phone}
            href={`tel:${profile.phoneHref}`}
            delay={0.12}
          />
        </div>
      </div>
    </section>
  );
}

function ContactTile({
  icon,
  label,
  value,
  href,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  delay: number;
}) {
  const external = href.startsWith('http');
  return (
    <Reveal delay={delay}>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
        className="group flex h-full items-center justify-between gap-4 bg-surface p-7 transition-colors duration-300 hover:bg-raised"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 text-faint">
            <span className="text-accent">{icon}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{label}</span>
          </div>
          <p className="mt-3 truncate font-display text-lg font-medium tracking-tight">{value}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
      </a>
    </Reveal>
  );
}
