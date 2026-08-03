/**
 * Normalises the brand logos and the portrait into public/brand/.
 *
 * Sources are whatever the originals happen to be (jpg, png, webp, wildly
 * different sizes). Everything comes out as a square 320px webp with
 * transparency preserved, so the cards can treat them identically.
 *
 * Run when a logo changes:
 *   npm install --no-save sharp && node scripts/make-brand.mjs
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'brand');

const SRC = process.env.BRAND_SRC;
if (!SRC) {
  console.error('Set BRAND_SRC to the directory holding the original logo files.');
  process.exit(1);
}

/**
 * [source file, output name, optional extract]
 *
 * `extract` is for sources whose artwork sits inside a soft glow or a
 * non-uniform backdrop, where trim() has no uniform border to find.
 */
const logos = [
  ['7d417e4c-155807.jpg', 'salonyy'],
  ['7743be3b-70a3fef78b0a42deacf7585aa5824bb21_all_16270.png', 'splittyy'],
  ['911a1654-158014.png', 'eventyy', { left: 128, top: 128, width: 772, height: 772 }],
  ['1f84187e-146062.png', 'stackup'],
  ['ed846eef-70a3fef78b0a42deacf7585aa5824bb21_all_4129.png', 'alpha'],
  ['e6948f29-70a3fef78b0a42deacf7585aa5824bb21_all_16844.png', 'hotw'],
  ['597ea0b3-70a3fef78b0a42deacf7585aa5824bb21_all_11892.png', 'ishrakati'],
  ['50f6b206-70a3fef78b0a42deacf7585aa5824bb21_all_9714.webp', 'lensandshot'],
];

await mkdir(out, { recursive: true });

for (const [file, name, extract] of logos) {
  const meta = await sharp(resolve(SRC, file)).metadata();

  // Cropping runs as its own pass: sharp applies trim() before extract() within
  // a single pipeline, so chaining the two fails on the extract area.
  const input = extract
    ? await sharp(resolve(SRC, file)).extract(extract).toBuffer()
    : resolve(SRC, file);

  const pipeline = sharp(input);

  // Several originals ship with a lot of empty margin, which would render the
  // mark tiny inside the card tile. An explicit crop already handles that.
  if (!extract) pipeline.trim({ threshold: 12 });

  await pipeline
    .resize(320, 320, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90 })
    .toFile(resolve(out, `${name}.webp`));

  console.log(
    `${name.padEnd(12)} ${meta.width}x${meta.height} alpha=${meta.hasAlpha}${extract ? ' cropped' : ''}`,
  );
}

// The portrait is cropped square rather than letterboxed.
await sharp(resolve(SRC, 'portrait-source'))
  .resize(512, 512, { fit: 'cover', position: 'top' })
  .webp({ quality: 88 })
  .toFile(resolve(out, 'portrait.webp'));

console.log('portrait     512x512');
