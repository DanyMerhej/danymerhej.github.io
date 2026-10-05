# danymerhej.github.io

Personal portfolio: experience, projects and capabilities in one place.
Live at **https://dannymerhej.com**.

Built from scratch: React 18 + TypeScript (strict) + Vite + Tailwind + Framer Motion, with
Matter.js for the toy box, Lenis for smooth wheel scrolling and a hand-written WebGL shader.
No template, no UI kit, no third-party requests at runtime. Fonts are self-hosted.

## The idea

Mobile first, and in colour. The page has no fixed palette: every section, and every
product, paints the whole page in its own **colour world** (background, ink and accent)
while it holds the middle of the screen, and the change is a cross-fade because the
three values are registered CSS custom properties. On a phone the browser toolbar follows
along. `src/lib/world.ts` holds the mechanism, `worlds` in `site.ts` the palettes.

The products I own come first and get the most room:

- **Hero**: a domain-warped WebGL gradient in the products' colours, seen at full strength
  only through the letters of the name (a multiply knockout). The letters breathe through the
  typeface's weight and width axes, swell toward a finger or cursor, and scatter on scroll.
- **Toy box**: every project's mark as a physics object. Grab, throw, shake, or tilt the
  phone. A tap opens the project.
- **Product worlds**: one full-colour screen per product, with the real app on a phone
  that tilts up as you scroll and turns over into a playable toy of the same idea
  (`src/components/demos`): split a receipt, switch an event to Arabic, drag bookings,
  mark a hire car, run an idle empire.
- **Client builds**: the section pins and scrolling walks sideways along the row, the page
  taking each brand's colours as its card reaches the middle.
- **Day job, skills, beyond code, about, contact**: IRIS's modules in orbit, role cards
  that stack, swipeable capability cards, a toolkit in tabs, a floor plan whose lights you
  can switch (and which keeps working with the internet "unplugged"), and a quote that
  lights word by word as you read.

Every project also has its own page at `/work/<id>/`, opened through a curtain of its colour
that grows from where you tapped. The build writes a real HTML file for each, with the
project's own title and preview card, so a shared link previews properly.

Type: Bricolage Grotesque (display, variable), DM Sans (text), Instrument Serif (italic
accents). Everything respects `prefers-reduced-motion`: the shader stands still, the toy box
becomes a grid and the sideways section becomes a list.

## How the repository is laid out

```
/                 <- the published site (index.html, assets/, work/, ...), generated, do not edit
/site             ← the source project
  /src
    /components   Hero, Products (ToyBox, ProductWorld, FlipPhone), Builds, Career, Skills,
                  Beyond, About, Contact, ProjectPage, plus Nav, Menu, Intro, Curtain,
                  Pointer, Liquid (the shader), Kinetic, Marquee, Motion, Frames
      /demos      the five playable product toys
    /data/site.ts ALL the content: copy, projects, experience, links, colour worlds
    /lib          world.ts (colour worlds), router.ts (/work/<id>), smooth.ts, hooks.ts
  /public         favicon, og image, robots, self-hosted fonts, brand marks, screenshots
  /scripts        publish, font fetcher, screenshot capture, social-image generator
```

GitHub Pages serves a user site from the **default branch, root folder**, which is
why the build output is committed rather than kept in `dist/`.

## Editing the content

Almost everything visible on the page comes from a single file:

```
site/src/data/site.ts
```

Add a project, change a job description, update a link. It is all there, typed.
A project's `kind` decides whether it is one of my products (a full-colour world, first) or
a client build (the sideways row), `world` sets its colours, and `demo` picks its toy.

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
npm install --no-save playwright sharp
node scripts/capture-shots.mjs         # re-screenshot every live site into public/shots
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
`ORIGIN` in `site/vite.config.ts` (project pages and the sitemap) and `site/scripts/make-images.mjs`.
