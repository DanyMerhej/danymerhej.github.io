# danymerhej.github.io

Personal portfolio: experience, projects and capabilities in one place.
Live at **https://dannymerhej.com**.

Built from scratch: React 18 + TypeScript (strict) + Vite + Tailwind + Framer Motion.
No template, no UI kit, no third-party requests at runtime. Fonts are self-hosted.

## The idea

The shell is monochrome, ink on warm paper, and every colour on the page belongs
to a product. Each work chapter claims the page's `--hue` while it holds the
middle of the viewport, so the header, rules, buttons and selection colour take
on the colour of whatever you are looking at, and scrolling reads as a walk
through six colour worlds rather than a scroll past six identical cards.

Type is set like a magazine: a masthead whose two lines are sized so five
letters and six letters end level, a contents list, chapters, and a colophon.

## How the repository is laid out

```
/                 <- the published site (index.html, assets/, fonts/), generated, do not edit
/site             ← the source project
  /src
    /components   Cover, Ledger, Works, Craft, Beyond, Colophon,
                  plus Header, Menu, Intro, Motion, Odometer
    /data/site.ts ALL the content: copy, projects, experience, links
    /lib/hooks.ts theme store, the `--hue` stack, viewport and intro helpers
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
BRAND_SRC=/path/to/logos node scripts/make-brand.mjs   # normalise logos + portrait
```

`make-images.mjs` needs the Syne display face installed locally, since it renders
the card through SVG.

## Custom domain

The site is served from **dannymerhej.com**. `site/public/CNAME` holds the domain and
is copied to the repository root on every build, so the setting survives rebuilds
rather than depending on the value stored in the GitHub UI.

DNS at the registrar:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `danymerhej.github.io.` |

GitHub redirects `www` to the apex automatically, and `danymerhej.github.io` redirects
to the domain. **Enforce HTTPS** in Settings → Pages once the certificate is issued.

To move to a different domain, change `site/public/CNAME` and the absolute URLs in
`site/index.html` (canonical, `og:url`, `og:image`), `site/public/robots.txt`,
`site/public/sitemap.xml` and `site/scripts/make-images.mjs`.
