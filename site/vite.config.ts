import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { projects } from './src/data/site';

const ORIGIN = 'https://dannymerhej.com';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Gives every project a real page at /work/<id>/ in the build: the same app,
 * but with the project's own title, description and canonical address in the
 * HTML, so a shared link previews as that project and loads with a 200 rather
 * than as a 404. Also writes the 404 page (the app, which shows the home page
 * for any address it does not know) and a sitemap listing every page.
 */
function projectPages(): Plugin {
  return {
    name: 'project-pages',
    apply: 'build',
    // After Vite has written index.html into the bundle.
    enforce: 'post',
    generateBundle(_, bundle) {
      const index = bundle['index.html'];
      if (!index || index.type !== 'asset') return;
      const html = String(index.source);

      for (const p of projects) {
        const url = `${ORIGIN}/work/${p.id}/`;
        const title = escape(`${p.name} | Danny Merhej`);
        const desc = escape(`${p.tagline}. ${p.blurb}`);
        const page = html
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`);
        this.emitFile({ type: 'asset', fileName: `work/${p.id}/index.html`, source: page });
      }

      this.emitFile({ type: 'asset', fileName: '404.html', source: html });

      const urls = [`${ORIGIN}/`, ...projects.map((p) => `${ORIGIN}/work/${p.id}/`)];
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(
          (u, i) =>
            `  <url>\n    <loc>${u}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${i === 0 ? '1.0' : '0.8'}</priority>\n  </url>`,
        ),
        '</urlset>',
        '',
      ].join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

/**
 * framer-motion 11 runs opacity and transform animations as Web Animations.
 * When one finishes it sets the final value for its next frame and removes
 * the Web Animation straight away, so for one frame the element shows its
 * old style: the index flashed open after closing and blinked shut after
 * opening. Committing the final style before the animation is removed closes
 * that gap. The build fails if the code it patches ever moves.
 */
function framerFinishFix(): Plugin {
  const target = /(motionValue\.set\(getFinalKeyframe\([^;]*;\s*onComplete && onComplete\(\);\s*)(this\.cancel\(\);)/;
  return {
    name: 'framer-finish-fix',
    apply: 'build',
    transform(code, id) {
      if (!id.includes('framer-motion') || !id.endsWith('AcceleratedAnimation.mjs')) return null;
      if (!target.test(code)) this.error('framer-finish-fix: the onfinish handler has changed; check the patch.');
      return code.replace(target, '$1try { animation.commitStyles(); } catch (e) {}\n                $2');
    },
  };
}

export default defineConfig({
  plugins: [react(), projectPages(), framerFinishFix()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
