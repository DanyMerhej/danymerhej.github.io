/**
 * Normalises the brand logos and the portrait into public/brand/.
 *
 * Sources are whatever the originals happen to be (jpg, png, webp, wildly
 * different sizes, some on a solid panel). Everything comes out as a square
 * 320px webp with a transparent background, so the cards can treat them
 * identically and no logo shows a panel edge against the tile behind it.
 *
 * Run when a logo changes:
 *   npm install --no-save sharp
 *   BRAND_SRC=/path/to/originals node scripts/make-brand.mjs
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { knockout } from './knockout.mjs';
import { reverse } from './reverse.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'brand');

const SRC = process.env.BRAND_SRC;
if (!SRC) {
  console.error('Set BRAND_SRC to the directory holding the original logo files.');
  process.exit(1);
}

/**
 * name      output file
 * extract   crop box, for artwork sitting inside a glow that trim() cannot find
 * knock     flood-fill the flat background away from the edges
 * reverse   recolour dark line art to ivory, for a mark drawn for a light page
 */
const logos = [
  { file: '7d417e4c-155807.jpg', name: 'salonyy', knock: true },
  { file: '7743be3b-70a3fef78b0a42deacf7585aa5824bb21_all_16270.png', name: 'splittyy' },
  {
    file: '911a1654-158014.png',
    name: 'eventyy',
    extract: { left: 128, top: 128, width: 772, height: 772 },
  },
  { file: '1f84187e-146062.png', name: 'stackup', knock: true },
  { file: 'ed846eef-70a3fef78b0a42deacf7585aa5824bb21_all_4129.png', name: 'alpha', knock: true },
  { file: 'e6948f29-70a3fef78b0a42deacf7585aa5824bb21_all_16844.png', name: 'hotw', knock: true },
  { file: '597ea0b3-70a3fef78b0a42deacf7585aa5824bb21_all_11892.png', name: 'ishrakati' },
  // public/img/brand/logo.png from the BitsEvents repository. Black line art on
  // an ivory page, so it is reversed out to sit on the card's dark tile.
  { file: 'bits-logo.png', name: 'bits', reverse: true },
  {
    file: '50f6b206-70a3fef78b0a42deacf7585aa5824bb21_all_9714.webp',
    name: 'lensandshot',
    knock: true,
    // A photographic backdrop, so it needs a wider catch and a long fade.
    knockOptions: { tolerance: 88, feather: 70 },
  },
];

await mkdir(out, { recursive: true });

for (const { file, name, extract, knock, knockOptions, reverse: rev } of logos) {
  const src = resolve(SRC, file);
  const meta = await sharp(src).metadata();

  // Cropping runs as its own pass: sharp applies trim() before extract() within
  // a single pipeline, so chaining the two fails on the extract area.
  let input = extract ? await sharp(src).extract(extract).toBuffer() : src;

  let note = '';
  if (knock) {
    const result = await knockout(input, knockOptions);
    input = result.buffer;
    note = ` knocked ${((result.cleared / result.total) * 100).toFixed(0)}% bg=${result.bg.join(',')}`;
  }

  if (rev) {
    input = await reverse(input);
    note += ' reversed';
  }

  const pipeline = sharp(input);

  // Originals often carry a wide empty margin, which would render the mark tiny
  // inside its tile. An explicit crop or a knockout already handles that.
  if (!extract) pipeline.trim({ threshold: 12 });

  await pipeline
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(resolve(out, `${name}.webp`));

  console.log(`${name.padEnd(12)} ${meta.width}x${meta.height}${extract ? ' cropped' : ''}${note}`);
}

// The portrait is cropped square rather than letterboxed.
await sharp(resolve(SRC, 'portrait-source'))
  .resize(512, 512, { fit: 'cover', position: 'top' })
  .webp({ quality: 88 })
  .toFile(resolve(out, 'portrait.webp'));

console.log('portrait     512x512');
