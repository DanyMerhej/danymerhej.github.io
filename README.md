# dannymerhej.github.io

Personal portfolio: experience, projects and capabilities in one place.
Live at **https://dannymerhej.github.io**.

Built from scratch: React 18 + TypeScript (strict) + Vite + Tailwind + Framer Motion.
No template, no UI kit, no third-party requests at runtime. Fonts are self-hosted.

## How the repository is laid out

```
/                 <- the published site (index.html, assets/, fonts/), generated, do not edit
/site             ← the source project
  /src
    /components   one file per section + the shared widgets
    /data/site.ts ALL the content: copy, projects, experience, links
    /lib/hooks.ts theme store, media queries, scroll helpers
  /public         favicon, og image, robots, sitemap, self-hosted fonts
  /scripts        publish, font fetcher, social-image generator
```

GitHub Pages serves a user site from the **default branch, root folder**, which is
why the build output is committed rather than kept in `dist/`.

## Editing the content

Almost everything visible on the page comes from a single file:

```
site/src/data/site.ts
```

Add a project, change a job description, update a link. It is all there, typed.
Nothing else needs touching.

## Local development

```bash
cd site
npm install
npm run dev        # http://localhost:5173
```

## Publishing

Pushing to `main` is enough: `.github/workflows/build.yml` rebuilds the site and
commits the output back to the root.

To do it by hand:

```bash
cd site
npm run deploy     # typecheck + build + copy dist/ to the repository root
```

Then commit the changed root files.

## Regenerating assets

```bash
cd site
node scripts/fetch-fonts.mjs           # re-download the self-hosted woff2 subsets
npm install --no-save sharp
node scripts/make-images.mjs           # regenerate og.png + apple-touch-icon.png
```

## Using a custom domain

1. Point the domain at GitHub Pages:
   - apex (`example.com`) → four `A` records: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` → `CNAME` to `dannymerhej.github.io`
2. Add the domain under **Settings → Pages → Custom domain** (this creates a `CNAME`
   file in the repository root, which the publish script preserves).
3. Tick **Enforce HTTPS** once the certificate is issued.
4. Update the absolute URLs in `site/index.html` (canonical, `og:url`, `og:image`),
   `site/public/robots.txt` and `site/public/sitemap.xml`.
