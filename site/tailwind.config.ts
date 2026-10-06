import type { Config } from 'tailwindcss';

/**
 * The three page colours are registered custom properties that cross-fade as
 * the colour world changes (see src/lib/world.ts). Opacity modifiers such as
 * `text-fg/60` are mixed against transparent, so they follow along.
 */
const mix = (v: string) => `color-mix(in srgb, var(${v}) calc(<alpha-value> * 100%), transparent)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // hover: styles only where hovering exists, so a tap on a phone never leaves
  // a button stuck in its hover state.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        bg: mix('--bg'),
        fg: mix('--fg'),
        accent: mix('--accent'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      // Loops and scroll-driven motion live in index.css, as compositor-only CSS.
    },
  },
  plugins: [],
} satisfies Config;
