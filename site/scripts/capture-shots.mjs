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
 * stylesheet makes a screenshot nobody should see. A page whose visible images
 * still fail to load is reloaded, and named in the output if it never recovers.
 * A site that answers with an error status keeps its old shot. Look at the
 * results before committing them anyway.
 */
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'shots');

// The page each shot is taken of, not always the home page.
const SITES = {
  splittyy: 'https://splittyy.com',
  eventyy: 'https://eventyy.com',
  // The home page is the client booking app; the product is what a salon owner signs up for.
  salonyy: 'https://salonyy.site/business',
  rentyy: 'https://rentyy.net',
  alpha: 'https://alphasupplementstore.com',
  hotw: 'https://homeofthewatches.com',
  elastick: 'https://elastickstore.myshopify.com',
  flow: 'https://zqbmay-5c.myshopify.com',
  bits: 'https://bitsevents.net',
};

const MOBILE = { width: 390, height: 844, scale: 2, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
const DESKTOP = { width: 1440, height: 900, scale: 1, ua: undefined };
const LOADS = 3;

async function write(png, id, kind) {
  const width = kind === 'mobile' ? 600 : 1280;
  await sharp(png).resize({ width }).webp({ quality: 78 }).toFile(join(out, `${id}-${kind}.webp`));
  console.log(`→ shots/${id}-${kind}.webp`);
}

// Images on screen that have a source but no pixels yet (still loading, or failed).
function unloadedImages() {
  return [...document.images]
    .filter((img) => {
      const r = img.getBoundingClientRect();
      const onScreen = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      return onScreen && (img.currentSrc || img.src) && !(img.complete && img.naturalWidth > 0);
    })
    .map((img) => img.currentSrc || img.src);
}

// Waits until the page is fully drawn and returns the visible images that never loaded.
async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  // Lazy images and scroll-reveal sections only load once they have been on screen,
  // so walk down the page and back up. Capped, because some pages scroll forever.
  await page.evaluate(async () => {
    for (let i = 0; i < 40 && scrollY + innerHeight < document.documentElement.scrollHeight - 1; i++) {
      scrollBy({ top: innerHeight / 2, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 250));
    }
    await new Promise((r) => setTimeout(r, 500));
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(`(${unloadedImages})().length === 0`, null, { timeout: 20000, polling: 250 }).catch(() => {});
  // A heading drawn in the fallback font is as wrong as a missing image.
  await page.evaluate(() => document.fonts.ready.then(() => {}));
  // Let entrance animations and sticky headers finish reacting to the scroll.
  await page.waitForTimeout(3000);
  return page.evaluate(unloadedImages);
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
      // An HTTPS proxy that inspects traffic re-signs every certificate.
      ignoreHTTPSErrors: Boolean(proxy),
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
      // A request that ran out of retries leaves a broken image, so load the page
      // again; one that is broken on every load is broken on the site itself.
      let broken = [];
      for (let load = 1; load <= LOADS; load++) {
        const res = await page.goto(SITES[id], { waitUntil: 'load', timeout: 120000 });
        // A paused store or a dead deploy still renders a page; never let it replace a good shot.
        if (res && !res.ok()) throw new Error(`HTTP ${res.status()}, kept the old shot`);
        broken = await settle(page);
        if (!broken.length) break;
        console.warn(`  ${id} ${kind}: ${broken.length} image(s) not loaded on load ${load}/${LOADS}`);
      }
      for (const src of broken) console.warn(`! ${id} ${kind}: broken image ${src}`);
      await write(await page.screenshot(), id, kind);
    } catch (e) {
      console.error(`✗ ${id} ${kind}: ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();
