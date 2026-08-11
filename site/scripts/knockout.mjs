import sharp from 'sharp';

/**
 * Makes a logo's flat background transparent.
 *
 * Several of the source marks are exported on a solid black or navy panel. Sat
 * on the dark tile the cards use, that panel reads as a slightly different
 * black rectangle around the artwork, which is the visible edge we want gone.
 *
 * This is a flood fill from the border rather than a "remove every dark pixel"
 * pass: only background connected to the edge is cleared, so black *inside* the
 * artwork (a silhouette, the counter of a letter) survives. Pixels close to the
 * background colour go fully transparent, pixels in a wider band fade out, which
 * keeps the anti-aliased rim from turning into a hard staircase.
 */
export async function knockout(input, { tolerance = 42, feather = 34 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const at = (x, y) => (y * width + x) * channels;

  // Background colour is whatever the four corners agree on.
  const corners = [
    at(0, 0),
    at(width - 1, 0),
    at(0, height - 1),
    at(width - 1, height - 1),
  ];
  const bg = [0, 1, 2].map((c) => Math.round(corners.reduce((sum, i) => sum + data[i + c], 0) / 4));

  const dist = (i) =>
    Math.sqrt(
      (data[i] - bg[0]) ** 2 + (data[i + 1] - bg[1]) ** 2 + (data[i + 2] - bg[2]) ** 2,
    );

  // Breadth-first from every border pixel that still looks like the background.
  const seen = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    const p = y * width + x;
    if (seen[p]) return;
    seen[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  const band = tolerance + feather;
  let cleared = 0;

  for (let head = 0; head < queue.length; head++) {
    const p = queue[head];
    const i = p * channels;
    const d = dist(i);
    if (d > band) continue;

    if (d <= tolerance) {
      data[i + 3] = 0;
      cleared++;
    } else {
      // Inside the soft band: fade rather than cut.
      const k = (d - tolerance) / feather;
      data[i + 3] = Math.round(data[i + 3] * k);
    }

    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  return {
    buffer: await sharp(data, { raw: { width, height, channels } }).png().toBuffer(),
    cleared,
    total: width * height,
    bg,
  };
}
