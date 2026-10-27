/**
 * Generates the home-screen icons the web app manifest points at, from the
 * favicon's own path, so they need no font installed.
 *
 *   npm install --no-save sharp
 *   node scripts/make-icons.mjs
 *
 * icon-*.png is the favicon's rounded tile. maskable-512.png fills the square
 * edge to edge with the D inside the safe zone, for launchers that cut their
 * own shape (Android).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const favicon = await readFile(resolve(publicDir, 'favicon.svg'), 'utf8');
const d = favicon.match(/<path d="([^"]+)"/)[1];

const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#12110F"/>
  <g transform="translate(32 32) scale(0.72) translate(-32 -32)"><path d="${d}" fill="#F4F1EA"/></g>
</svg>`;

for (const size of [192, 512]) {
  await writeFile(resolve(publicDir, `icon-${size}.png`), await sharp(Buffer.from(favicon), { density: 72 * (size / 64) }).resize(size, size).png().toBuffer());
}
await writeFile(resolve(publicDir, 'maskable-512.png'), await sharp(Buffer.from(maskable), { density: 576 }).resize(512, 512).png().toBuffer());

console.log('Wrote public/icon-192.png, icon-512.png and maskable-512.png');
