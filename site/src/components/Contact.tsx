import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Check, Copy, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import { useRef, useState } from 'react';
import { profile, worlds } from '../data/site';
import { useFinePointer, useWorld } from '../lib/hooks';
import { scrollToY } from '../lib/smooth';
import { WhatsAppIcon } from './Icons';
import { Mask } from './Motion';

const CONFETTI = ['#C6F94E', '#F0A6E0', '#FFB86B', '#8FB8FF', '#FFD166', '#FFFFFF'];

/** The ask, at full volume, on the loudest colour on the page. */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  useWorld(ref, 'contact', worlds.orange);
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(0);
  const year = new Date().getFullYear();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setBurst((b) => b + 1);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden pt-24 md:pt-36">
      <div className="gutter">
        <p className="eyebrow border-fg/30">Contact</p>
        <Mask as="h2" className="display mt-6 text-[clamp(3rem,15vw,10rem)]">
          <span className="block">Got something</span>
        </Mask>
        <Mask as="p" delay={0.06} className="display text-[clamp(3rem,15vw,10rem)]">
          <span className="block">worth building?</span>
        </Mask>
        <Mask as="p" delay={0.12} className="serif-i text-[clamp(3rem,15vw,10rem)] leading-[0.95]">
          <span className="block">Let&rsquo;s talk.</span>
        </Mask>

        <p className="lede pretty mt-8 max-w-2xl text-fg/85">
          Open to senior engineering and technical leadership roles, architecture consulting, and product work where
          the whole thing needs building rather than just a screen.
        </p>

        {/* WhatsApp first: it is where I answer fastest. Email sits right beside it. */}
        <div className="mt-10 grid max-w-2xl gap-3">
          <Magnetic>
            <a
              href={profile.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-whatsapp group h-16 w-full text-[1.05rem] shadow-[0_18px_40px_-18px_rgba(6,40,20,0.6)]"
              data-cursor="Chat"
            >
              <WhatsAppIcon className="h-6 w-6 shrink-0" />
              Message me on WhatsApp
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="btn-solid h-14 min-w-0 gap-2 px-4 text-[0.95rem] sm:px-6"
              data-cursor="Write"
            >
              <Mail className="h-5 w-5 shrink-0" />
              <span className="min-w-0 truncate">{profile.email}</span>
            </a>
            <div className="relative">
              <button
                type="button"
                onClick={copy}
                className="btn-ghost h-14 w-14 border-fg/30 px-0 sm:w-auto sm:px-5"
                aria-label={copied ? 'Copied' : 'Copy the email address'}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <Confetti key={burst} play={burst > 0} />
            </div>
          </div>
        </div>

        <ul className="mt-16 grid border-t-2 border-fg/15 sm:grid-cols-2 lg:grid-cols-4">
          <Channel icon={<WhatsAppIcon className="h-5 w-5" />} label="WhatsApp" value={profile.phone} href={profile.whatsapp} />
          <Channel icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" value="danny-merhej" href={profile.linkedin} />
          <Channel icon={<Instagram className="h-5 w-5" />} label="Instagram" value={profile.instagramHandle} href={profile.instagram} />
          <Channel icon={<Phone className="h-5 w-5" />} label="Call" value={profile.phone} href={`tel:${profile.phoneHref}`} />
        </ul>
      </div>

      {/* The sign-off: the name once more, at the bottom of the page, cut by the edge. */}
      <p
        aria-hidden="true"
        className="display pointer-events-none mt-16 select-none whitespace-nowrap text-center text-[12.4vw] leading-[0.8] text-fg/90"
      >
        Danny <span className="serif-i">✦</span> Merhej
      </p>

      <footer className="gutter pb-32 pt-8 md:pb-10">
        <div className="flex flex-col gap-4 border-t-2 border-fg/15 pt-6 text-[14px] text-fg/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}. Designed and built from scratch.
          </p>
          <div className="flex items-center gap-5">
            <span>Bricolage Grotesque · DM Sans · Instrument Serif</span>
            <button type="button" onClick={() => scrollToY(0)} className="inline-flex items-center gap-1.5 font-semibold">
              Top <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}

function Channel({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  const external = href.startsWith('http');
  return (
    <li className="border-b-2 border-fg/15">
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
        className="group flex items-center justify-between gap-4 py-6 sm:pr-6"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[14px] font-semibold opacity-75">
            {icon} {label}
          </span>
          <span className="mt-1.5 block truncate font-display text-[1.6rem] font-bold leading-tight">{value}</span>
        </span>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </a>
    </li>
  );
}

/** Pulls toward the cursor a little while it hovers, then springs back. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  if (!fine || reduced) return <div className="w-full sm:w-auto">{children}</div>;

  return (
    <motion.div
      className="w-full sm:w-auto"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function Confetti({ play }: { play: boolean }) {
  const reduced = useReducedMotion();
  if (!play || reduced) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2 + Math.random() * 0.3;
        const d = 80 + Math.random() * 120;
        return (
          <motion.span
            key={i}
            className="absolute block h-2.5 w-1.5 rounded-sm"
            style={{ background: CONFETTI[i % CONFETTI.length] }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 60, rotate: Math.random() * 720, opacity: 0 }}
            transition={{ duration: 1.1 + Math.random() * 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}
