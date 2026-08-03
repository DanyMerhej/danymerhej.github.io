/**
 * Generates the social preview image and the apple-touch icon from SVG.
 * Run manually (`node scripts/make-images.mjs`) when the wording changes —
 * the output is committed, so the build itself needs no image toolchain.
 *
 * Requires `sharp` and the site fonts installed locally:
 *   npm install --no-save sharp
 */
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const INK = '#0A0B0D';
const SIGNAL = '#C6F94E';
const WHITE = '#F0F0EE';
const MUTED = '#9CA0A6';

const gridLines = () => {
  let out = '';
  for (let x = 0; x <= 1200; x += 60) {
    out += `<line x1="${x}" y1="0" x2="${x}" y2="630" stroke="#282C33" stroke-width="1"/>`;
  }
  for (let y = 0; y <= 630; y += 60) {
    out += `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="#282C33" stroke-width="1"/>`;
  }
  return out;
};

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="18%" cy="8%" r="62%">
      <stop offset="0%" stop-color="${SIGNAL}" stop-opacity="0.20"/>
      <stop offset="45%" stop-color="#7C6BFF" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="gridmask"><rect width="1200" height="630" fill="url(#fade)"/></mask>
  </defs>

  <rect width="1200" height="630" fill="${INK}"/>
  <g mask="url(#gridmask)" opacity="0.55">${gridLines()}</g>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g font-family="JetBrains Mono" font-size="17" letter-spacing="3.4" fill="${MUTED}">
    <text x="80" y="92">DEVELOPMENT TEAM LEAD · SENIOR SOFTWARE ENGINEER</text>
  </g>
  <circle cx="1112" cy="86" r="7" fill="${SIGNAL}"/>
  <text x="1092" y="92" text-anchor="end" font-family="JetBrains Mono" font-size="17"
        letter-spacing="2.6" fill="${MUTED}">LEBANON</text>

  <g font-family="Bricolage Grotesque" font-weight="800" font-size="132" letter-spacing="-5">
    <text x="80" y="290" fill="${WHITE}">DANNY</text>
    <text x="80" y="410" fill="${WHITE}">MERHE<tspan fill="${SIGNAL}">J</tspan></text>
  </g>

  <rect x="80" y="452" width="128" height="5" rx="2.5" fill="${SIGNAL}"/>

  <g font-family="Inter" font-size="25" fill="${MUTED}">
    <text x="80" y="516">Enterprise insurance platforms at 30+ insurers.</text>
    <text x="80" y="552">Independently shipped, AI-powered products on web and mobile.</text>
  </g>

  <g font-family="JetBrains Mono" font-size="15" letter-spacing="2" fill="#6C717A">
    <text x="80" y="600">IRIS · SPLITTYY · EVENTYY · BEAUTYFLOW · STACKUP</text>
    <text x="1120" y="600" text-anchor="end">dannymerhej.github.io</text>
  </g>
</svg>`;

const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="${INK}"/>
  <text x="90" y="128" text-anchor="middle" font-family="Bricolage Grotesque"
        font-weight="800" font-size="112" fill="${SIGNAL}">D</text>
</svg>`;

await writeFile(resolve(publicDir, 'og.png'), await sharp(Buffer.from(og)).png().toBuffer());
await writeFile(
  resolve(publicDir, 'apple-touch-icon.png'),
  await sharp(Buffer.from(icon)).png().toBuffer(),
);

console.log('Wrote public/og.png and public/apple-touch-icon.png');
