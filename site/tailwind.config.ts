import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces resolve from CSS variables so light/dark share one scale.
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        signal: 'rgb(var(--c-signal) / <alpha-value>)',
        'signal-ink': 'rgb(var(--c-signal-ink) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        violet: 'rgb(var(--c-violet) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        '10xl': ['clamp(3.5rem, 13vw, 11rem)', { lineHeight: '0.86', letterSpacing: '-0.045em' }],
        display: ['clamp(2.5rem, 6.5vw, 5.25rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        section: ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
      },
      maxWidth: {
        shell: '78rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        breathe: 'breathe 9s ease-in-out infinite',
        blink: 'blink 1.1s steps(1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
