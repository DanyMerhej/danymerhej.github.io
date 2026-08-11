/**
 * Generates the social preview image and the apple-touch icon from SVG.
 * Run manually (`node scripts/make-images.mjs`) when the wording changes.
 * The output is committed, so the build itself needs no image toolchain.
 *
 * Requires `sharp` plus the site's display face installed locally:
 *   npm install --no-save sharp
 */
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const PAPER = '#F4F1EA';
const INK = '#12110F';
const INK_2 = '#5C564E';
const INK_3 = '#928A80';

/**
 * The card repeats the cover: solid first line, outlined second, both fitted to
 * the same measure. Sizes are tuned so five letters and six letters end level.
 */
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>

  <g font-family="JetBrains Mono" font-size="15" letter-spacing="3.2" fill="${INK_3}">
    <text x="72" y="72">DEVELOPMENT TEAM LEAD &amp; SENIOR SOFTWARE ENGINEER</text>
    <text x="1128" y="72" text-anchor="end">LEBANON</text>
  </g>
  <line x1="72" y1="96" x2="1128" y2="96" stroke="#D8D1C4" stroke-width="1"/>

  <g font-family="Syne" font-weight="800" letter-spacing="-6">
    <text x="68" y="266" font-size="172" fill="${INK}">DANNY</text>
    <text x="68" y="410" font-size="142" fill="none" stroke="${INK}" stroke-width="2">MERHEJ</text>
  </g>

  <line x1="72" y1="462" x2="1128" y2="462" stroke="#D8D1C4" stroke-width="1"/>

  <g font-family="Inter" font-size="25" fill="${INK_2}">
    <text x="72" y="510">Enterprise insurance platforms at 30+ insurers.</text>
    <text x="72" y="546">Independently shipped, AI-powered products on web and mobile.</text>
  </g>

  <g font-family="JetBrains Mono" font-size="14" letter-spacing="2.4" fill="${INK_3}">
    <text x="72" y="596">IRIS · SPLITTYY · EVENTYY · SALONYY · STACKUP</text>
    <text x="1128" y="596" text-anchor="end">dannymerhej.com</text>
  </g>
</svg>`;

const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="${INK}"/>
  <text x="90" y="130" text-anchor="middle" font-family="Syne"
        font-weight="800" font-size="116" fill="${PAPER}">D</text>
</svg>`;

await writeFile(resolve(publicDir, 'og.png'), await sharp(Buffer.from(og)).png().toBuffer());
await writeFile(
  resolve(publicDir, 'apple-touch-icon.png'),
  await sharp(Buffer.from(icon)).png().toBuffer(),
);

console.log('Wrote public/og.png and public/apple-touch-icon.png');
