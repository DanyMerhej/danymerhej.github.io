/**
 * Screenshots every project's live site on a phone and on a desktop, and writes
 * them to public/shots as WebP, sized for the frames they are shown in.
 *
 *   npm install --no-save playwright sharp
 *   node scripts/capture-shots.mjs                 # every site
 *   node scripts/capture-shots.mjs splittyy flow   # just these
 *   node scripts/capture-shots.mjs --from ./pngs   # convert <id>-m.png / <id>-d.png you took yourself
 *
 * Every request is retried a few times, because a site that loads without its
 * stylesheet makes a screenshot nobody should see. Look at the results before
 * committing them anyway.
 */
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'shots');

const SITES = {
  splittyy: 'https://splittyy.com',
  eventyy: 'https://eventyy.com',
  salonyy: 'https://salonyy.site',
  rentyy: 'https://rentyy.net',
  alpha: 'https://alphasupplementstore.com',
  hotw: 'https://homeofthewatches.com',
  elastick: 'https://elastickstore.myshopify.com',
  flow: 'https://zqbmay-5c.myshopify.com',
  bits: 'https://bitsevents.net',
};

const MOBILE = { width: 390, height: 844, scale: 2, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
const DESKTOP = { width: 1440, height: 900, scale: 1, ua: undefined };

async function write(png, id, kind) {
  const width = kind === 'mobile' ? 600 : 1280;
  await sharp(png).resize({ width }).webp({ quality: 78 }).toFile(join(out, `${id}-${kind}.webp`));
  console.log(`→ shots/${id}-${kind}.webp`);
}

await mkdir(out, { recursive: true });
const args = process.argv.slice(2);

if (args[0] === '--from') {
  const dir = resolve(args[1] ?? '.');
  for (const id of Object.keys(SITES)) {
    for (const [tag, kind] of [['m', 'mobile'], ['d', 'desktop']]) {
      const png = join(dir, `${id}-${tag}.png`);
      if (existsSync(png)) await write(png, id, kind);
    }
  }
  process.exit(0);
}

const { chromium } = await import('playwright');
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy });
const ids = args.length ? args : Object.keys(SITES);

for (const id of ids) {
  for (const [kind, vp] of [['mobile', MOBILE], ['desktop', DESKTOP]]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.scale,
      isMobile: kind === 'mobile',
      hasTouch: kind === 'mobile',
      userAgent: vp.ua,
    });
    await ctx.route('**/*', async (route) => {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          return await route.fulfill({ response: await route.fetch({ timeout: 30000 }) });
        } catch {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
      return route.abort();
    });
    const page = await ctx.newPage();
    try {
      await page.goto(SITES[id], { waitUntil: 'load', timeout: 120000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(5000);
      await write(await page.screenshot(), id, kind);
    } catch (e) {
      console.error(`✗ ${id} ${kind}: ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();
