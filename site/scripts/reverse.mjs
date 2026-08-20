/**
 * Reverses a dark line-art mark out to ivory, keeping its coloured accents.
 *
 * The card tiles are always dark, so every brand mark in public/brand reads
 * light on that ground. A logo drawn as black line art for an ivory page
 * would disappear there, so its neutral strokes are recoloured while anything
 * with real chroma (a gold flourish, a coloured glyph) is left exactly as it
 * was drawn. Alpha carries the shape, so recolouring RGB alone keeps every
 * antialiased edge intact.
 */
import sharp from 'sharp';

const IVORY = [244, 241, 234];

/**
 * @param input        anything sharp accepts
 * @param saturation   below this (0 to 255, max minus min channel) a pixel
 *                     counts as neutral and gets reversed out
 */
export async function reverse(input, { saturation = 40 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (chroma >= saturation) continue;
    data[i] = IVORY[0];
    data[i + 1] = IVORY[1];
    data[i + 2] = IVORY[2];
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();
}
