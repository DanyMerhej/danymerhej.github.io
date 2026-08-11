import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import { profile } from '../data/site';
import { Mask, Rise, Words } from './Motion';

/**
 * About and contact, set as a colophon: the pitch at full size, then the
 * particulars in the small print where a magazine would put them.
 */
export function Colophon() {
  const [copied, setCopied] = useState(false);
  const year = new Date().getFullYear();

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
    <section id="colophon" className="scroll-mt-16 pt-24 md:pt-36">
      <div className="gutter">
        <p className="label">05 / About &amp; contact</p>

        <blockquote className="mt-10 max-w-5xl">
          <p className="font-serif text-[1.9rem] italic leading-[1.15] balance md:text-[3.2rem]">
            <Words
              text="Enterprise work taught me what it costs when software breaks. Building my own products taught me how fast it can move when nothing is in the way."
              stagger={0.02}
            />
          </p>
        </blockquote>

        <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <div className="space-y-6">
              {profile.summary.map((p, i) => (
                <Rise key={i} delay={0.05 + i * 0.05}>
                  <p className="text-[0.98rem] leading-relaxed text-ink-2 pretty md:text-lg">{p}</p>
                </Rise>
              ))}
            </div>
          </div>

          {/* Particulars */}
          <div className="md:col-span-4 md:col-start-9">
            <Rise delay={0.1}>
              <img
                src={profile.portrait}
                alt={profile.name}
                width={512}
                height={512}
                loading="lazy"
                decoding="async"
                className="mb-8 w-full max-w-[15rem] object-cover grayscale md:max-w-none"
              />
            </Rise>

            <Detail label="Based in" value={profile.location} />
            <Detail label="Education" value={profile.education.degree} sub={profile.education.school} />
            <div className="border-t border-rule py-4">
              <p className="label">Languages</p>
              <ul className="mt-3 space-y-1.5">
                {profile.languages.map((l) => (
                  <li key={l.name} className="flex items-baseline justify-between gap-4 text-sm">
                    <span>{l.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                      {l.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* The ask */}
      <div className="gutter mt-24 md:mt-36">
        <div className="border-t border-rule pt-12 md:pt-16">
          <Mask as="h2" className="display section-type max-w-4xl">
            <span className="block">Got something</span>
          </Mask>
          <Mask as="div" delay={0.08} className="display section-type max-w-4xl">
            <span className="block">worth building?</span>
          </Mask>
          <Mask as="div" delay={0.16} className="display section-type max-w-4xl">
            <span className="block hue">Let&rsquo;s talk about it.</span>
          </Mask>

          <p className="lede pretty mt-8 max-w-2xl">
            Open to senior engineering and technical leadership roles, architecture consulting, and
            product work where the whole thing needs building rather than just a screen.
          </p>

          {/* The address is one unbreakable token, so on a narrow screen the
              button takes the full width and lets it truncate rather than
              forcing the whole layout wider than the viewport. */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="action-solid group w-full min-w-0 sm:w-auto"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{profile.email}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button type="button" onClick={copyEmail} className="action-line w-full sm:w-auto">
              {copied ? <Check className="h-4 w-4 hue" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy address'}
            </button>
          </div>

          <div className="mt-14 grid sm:grid-cols-3">
            <Channel
              icon={<Linkedin className="h-4 w-4" />}
              label="LinkedIn"
              value="danny-merhej"
              href={profile.linkedin}
            />
            <Channel
              icon={<Instagram className="h-4 w-4" />}
              label="Instagram"
              value={profile.instagramHandle}
              href={profile.instagram}
            />
            <Channel
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={profile.phone}
              href={`tel:${profile.phoneHref}`}
            />
          </div>
        </div>
      </div>

      <footer className="gutter mt-20 pb-28 md:pb-14">
        <div className="flex flex-col gap-4 border-t border-rule pt-8 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}. Designed and built from scratch.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-mono">Syne · Inter · JetBrains Mono</span>
            <a href="#cover" className="ul-draw inline-flex min-h-[2.75rem] items-center font-mono">
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}

function Detail({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-t border-rule py-4">
      <p className="label">{label}</p>
      <p className="mt-2 text-sm">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-ink-3">{sub}</p>}
    </div>
  );
}

function Channel({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer noopener' : undefined}
      className="group flex items-center justify-between gap-4 border-t border-rule py-6 pr-6 transition-colors duration-500"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2.5">
          <span className="hue">{icon}</span>
          <span className="label">{label}</span>
        </span>
        <span className="mt-2.5 block truncate text-base transition-colors duration-500 group-hover:text-hue">
          {value}
        </span>
      </span>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-3 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-hue" />
    </a>
  );
}
