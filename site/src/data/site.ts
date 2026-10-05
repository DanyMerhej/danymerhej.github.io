export type Status = 'live' | 'building' | 'early';

/**
 * The colours a section or product paints the whole page with while it holds
 * the middle of the screen. Hex, so they read the way a designer writes them.
 */
export interface World {
  bg: string;
  fg: string;
  accent: string;
}

/** Which playable toy sits on the back of the product's phone. */
export type DemoId = 'split' | 'event' | 'salon' | 'rent' | 'stack';

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'site' | 'store' | 'code' | 'social';
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  /** One-line positioning shown on the card. */
  blurb: string;
  status: Status;
  year: string;
  role: string;
  /** Short, scannable feature bullets shown in the expanded view. */
  highlights: string[];
  /** The interesting engineering problem, written for a peer to read. */
  engineering: string;
  stack: string[];
  links: ProjectLink[];
  /** Two hues used for the card's signature gradient. */
  hues: [string, string];
  /** Brand mark in public/brand, shown on the card and in the dialog. */
  logo: string;
  /** A product I own and run, or a build for a brand. Products lead the page. */
  kind: 'product' | 'build';
  /** Short category shown as a chip: SaaS, Mobile game, Shopify storefront... */
  category: string;
  /** The colour world the page turns into for this project. */
  world: World;
  /** Real screenshots in public/shots, captured by scripts/capture-shots.mjs. */
  shots?: { mobile?: string; desktop?: string };
  demo?: DemoId;
}

export const profile = {
  name: 'Danny Merhej',
  first: 'Danny',
  last: 'Merhej',
  title: 'Development Team Lead & Senior Software Engineer',
  roles: [
    'Development Team Lead',
    'Senior Software Engineer',
    'Solution Architect',
    'Full-Stack Product Builder',
    'AI Integration Engineer',
  ],
  location: 'Lebanon',
  email: 'danymerhej.work@gmail.com',
  phone: '+961 71 604 930',
  phoneHref: '+96171604930',
  linkedin: 'https://www.linkedin.com/in/danny-merhej',
  instagram: 'https://instagram.com/danny_merhej',
  instagramHandle: '@danny_merhej',
  portrait: '/brand/portrait.webp',
  /** The opening line. Products first: they are the work with my name on it. */
  hero: 'I design, build and ship my own products, end to end.',
  heroSub:
    'Architecture, AI, backend, interface, app stores. By day I lead the team behind IRIS, an insurance ERP that 30+ insurers run on.',
  /** The word that keeps changing in the hero's "I build ..." line. */
  builds: ['AI apps', 'SaaS platforms', 'idle games', 'Shopify stores', 'smart homes', 'insurance ERPs'],
  intro:
    'I lead the team behind IRIS, an enterprise insurance ERP running at 30+ insurance companies across the Middle East, Africa and Europe. Outside of that, I design and ship my own products end to end: architecture, AI, backend, UI, app stores.',
  /** A short handle for each summary paragraph, so the long copy can be scanned. */
  summaryHeads: ['Where it started', 'What the day job taught me', 'The other half', 'Off the screen'],
  summary: [
    'Seven years ago I walked into Pixel Software Solutions as an intern. Today I lead the team that builds IRIS, an insurance ERP that more than 30 companies across three continents run their business on: policy administration, underwriting, claims, accounting, collections, reinsurance, reporting, broker portals and the integrations that tie them to the outside world.',
    'That work taught me the unglamorous half of engineering. Regulated domains, million-row tables, migrations that cannot fail, and clients who need a straight answer today. I own the technical conversation with them from the first requirement to the release note.',
    'The other half is mine. Nights and weekends I build complete products alone: architecture, database, security model, AI pipeline, interface, CI/CD, app store listing. Splittyy, Eventyy, Salonyy and Rentyy are live, and Splittyy is on Google Play too. StackUp is in active development, and two commercial storefronts are trading. I build them because shipping something with your own name on it is the fastest way to stay sharp.',
    'Not all of it is software. I also do home automation: Sonoff and Zigbee mesh networks, a hub that runs locally, and lighting, climate, access and sensors that keep working when the internet does not. It is the same job as the rest of it. Decide what the system should do when nobody is watching, then make it do that every time.',
  ],
  languages: [
    { name: 'Arabic', level: 'Native' },
    { name: 'English', level: 'Fluent' },
    { name: 'French', level: 'Conversational' },
  ],
  education: {
    degree: 'BSc, Computer Science',
    school: 'Lebanese Canadian University',
    year: 'July 2017',
  },
};

export const metrics = [
  { value: 7, suffix: '+', label: 'years building software', sub: 'intern to team lead, one company' },
  { value: 30, suffix: '+', label: 'insurance companies on IRIS', sub: 'Middle East · Africa · Europe' },
  { value: 1000, suffix: '+', label: 'tickets & requests delivered', sub: '100% on-time on key milestones' },
  { value: 1, suffix: 'TB+', label: 'production data tuned', sub: 'query time down 30%' },
];

/** The parts of IRIS my team builds, as listed in the role description. */
export const irisModules = [
  'Policy administration',
  'Underwriting',
  'Claims',
  'Accounting',
  'Collections',
  'Reinsurance',
  'Reporting',
  'Broker portals',
  'Integrations',
];

export const impactStats = [
  { value: '40%', label: 'fewer bugs', detail: 'through stronger code-review standards and quality practices' },
  { value: '25%', label: 'faster delivery', detail: 'after introducing Kanban and Jira agile flow' },
  { value: '30%', label: 'faster queries', detail: 'performance tuning across 1TB+ of production data' },
  { value: '20%', label: 'more team output', detail: 'mentoring juniors and mid-level engineers to ownership' },
];

export interface Role {
  company: string;
  title: string;
  period: string;
  place: string;
  current?: boolean;
  points: string[];
  tags?: string[];
}

export const experience: Role[] = [
  {
    company: 'Pixel Software Solutions',
    title: 'Development Team Lead',
    period: 'May 2024 to Present',
    place: 'Lebanon',
    current: true,
    tags: ['Leadership', 'Architecture', 'InsurTech', 'Client-facing'],
    points: [
      'Lead a team of 2 to 3 developers across the architecture, development and delivery of IRIS, covering policy administration, underwriting, claims, accounting, collections, reporting, reinsurance, broker portals and third-party integrations, used by 30+ insurers across the Middle East, Africa and Europe.',
      'Primary technical point of contact for requirements gathering, solution design and client communication: 1,000+ tickets and requests handled with 100% on-time delivery of key milestones.',
      'Designed and integrated REST APIs connecting IRIS to external insurance systems and third-party services, strengthening platform interoperability.',
      'Cut bugs by 40% by raising code-review standards and embedding software quality practices in the team.',
      'Introduced agile delivery with Kanban and Jira, improving delivery speed and project turnaround by 25%.',
      'Led performance tuning and database optimisation across systems holding 1TB+ of data, cutting query execution time by 30%.',
      'Mentor junior and mid-level developers on architecture and engineering practice, lifting team productivity by 20%.',
    ],
  },
  {
    company: 'Pixel Software Solutions',
    title: 'Senior Software Developer',
    period: 'Feb 2019 to May 2024',
    place: 'Lebanon',
    tags: ['C#', 'VB.NET', 'SQL Server', 'Solution design'],
    points: [
      "Owned end-to-end delivery for enterprise insurance clients, from requirements and solution design through development, release and maintenance, across IRIS's policy administration, underwriting and claims modules.",
      'Architected and built solutions in C#, VB.NET and SQL Server for clients with complex regulatory, operational and integration requirements.',
      'Progressed from internship to senior engineering ownership, building the architecture and solution-design foundation for later team leadership.',
    ],
  },
  {
    company: 'Pixel Software Solutions',
    title: 'Software Developer, Internship',
    period: 'Feb 2019 to Apr 2019',
    place: 'Lebanon',
    points: [
      'First exposure to .NET and enterprise insurance software, and the start of a 7+ year run at the same company.',
    ],
  },
  {
    company: 'BESTSELLER',
    title: 'Assistant Store Manager',
    period: 'Jun 2015 to Feb 2019',
    place: 'Lebanon',
    tags: ['Before engineering'],
    points: [
      'Progressed from Sales Executive to Cashier to Visual Merchandising Coordinator to Assistant Store Manager.',
      'Exceeded sales targets by 20%, trained and mentored a team of 10, and set visual merchandising standards that improved the customer experience.',
      'Streamlined inventory management, reducing shrinkage by 15%. Recognised with Employee of the Month for leadership.',
    ],
  },
];

export const projects: Project[] = [
  {
    id: 'splittyy',
    name: 'Splittyy',
    tagline: 'AI expense splitting, web + Android',
    blurb:
      'Photograph a receipt, get it itemised by AI, then split it with anyone. Live, offline-capable and multi-currency.',
    status: 'live',
    year: '2024 to now',
    role: 'Sole architect & engineer',
    logo: '/brand/splittyy.webp',
    kind: 'product',
    category: 'AI · SaaS · Android',
    world: { bg: '#C6F94E', fg: '#0E1A10', accent: '#0B7A5C' },
    shots: { mobile: '/shots/splittyy-mobile.webp', desktop: '/shots/splittyy-desktop.webp' },
    demo: 'split',
    hues: ['#C6F94E', '#39D0A5'],
    highlights: [
      'AI receipt scanning: Gemini extracts items, prices and totals straight from a photo, with no manual entry',
      'Live sessions, so several people can split the same bill in real time from their own phones',
      'Multi-currency by design, with automatic exchange-rate detection for whichever currencies a bill mixes',
      'Offline-first through IndexedDB, so the app keeps working with no connection',
      'Friends, groups, trips, settle-up balances and a full searchable transaction history',
      'Analytics dashboard with CSV and PDF export',
      'One codebase serving web on Cloudflare Pages and Android through Capacitor on Google Play',
    ],
    engineering:
      'The hard part was never the splitting maths, it was consistency. Receipts arrive as images and have to become structured data reliably enough to trust, so the Gemini pipeline runs server-side in a Deno edge function with a strict schema and fallbacks for the shapes real receipts actually take: tax printed after the subtotal, service charges, several currencies on one bill. On top of that sits an offline-first data model, an IndexedDB cache that has to reconcile with Supabase and Postgres when several devices edit the same split at once. Auth is Google OAuth, the whole backend is serverless, and the same TypeScript codebase ships to the browser and to the Play Store.',
    stack: [
      'React 18',
      'TypeScript',
      'Vite',
      'Tailwind',
      'shadcn/ui',
      'Framer Motion',
      'Zustand',
      'TanStack Query',
      'Supabase',
      'PostgreSQL',
      'Deno Edge Functions',
      'Google Gemini',
      'Capacitor',
      'Cloudflare Pages',
    ],
    links: [
      { label: 'splittyy.com', href: 'https://splittyy.com', kind: 'site' },
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.splittyy.app',
        kind: 'store',
      },
      { label: '@splittyyapp', href: 'https://instagram.com/splittyyapp', kind: 'social' },
    ],
  },
  {
    id: 'eventyy',
    name: 'Eventyy',
    tagline: 'Your digital event office',
    blurb:
      'A multi-tenant event operations platform that runs any type of event, from the first client meeting to the last guest leaving.',
    status: 'live',
    year: '2025 to now',
    role: 'Architect & engineer',
    logo: '/brand/eventyy.webp',
    kind: 'product',
    category: 'Multi-tenant SaaS',
    world: { bg: '#F0A6E0', fg: '#2A0B2A', accent: '#2A55D9' },
    shots: { mobile: '/shots/eventyy-mobile.webp', desktop: '/shots/eventyy-desktop.webp' },
    demo: 'event',
    hues: ['#E879C9', '#6BC4FF'],
    highlights: [
      'One root object, the Event, carrying clients, suppliers, media, finance, timeline and live event-day state',
      'Handles any event type: weddings, birthdays, engagements, corporate events, memorials, whatever the coordinator runs',
      'Modules toggle per event and per plan: suppliers, finance, media, tasks, timeline, discussions, knowledge',
      'Smart Notes rather than plain notes, with reminders, attachments, voice, mentions and AI actions',
      'Quotations, contracts and payments, with generated printable finance documents',
      'Client and supplier portals with per-event, module-scoped access',
      'Trilingual from day one in English, Arabic and French, with full RTL',
    ],
    engineering:
      "This one is an exercise in getting the boundaries right before writing features. Tenant isolation is enforced in Postgres rather than in the UI: every tenant table carries a non-null org_id, ships with its RLS policies, and lands in the same commit as a pgTAP test proving one organisation cannot read another. Two security-definer helpers describe the entire access model, one for org membership and one for per-event external participants. AI is a layer rather than a feature, so everything runs through a single gateway edge function and today's provider can be swapped without touching product code. Storage uses path-based RLS, and the build order follows a written spec, so no module ships without schema, policies, screens, mobile parity, realtime and isolation tests.",
    stack: [
      'React 18',
      'TypeScript (strict)',
      'Vite',
      'Tailwind',
      'shadcn/ui',
      'TanStack Query',
      'Zustand',
      'Supabase',
      'Postgres RLS',
      'pgvector',
      'Edge Functions',
      'i18next + RTL',
      'Capacitor',
      'GitHub Actions',
      'Cloudflare Pages',
    ],
    links: [
      { label: 'eventyy.com', href: 'https://eventyy.com', kind: 'site' },
      { label: '@eventyyapp', href: 'https://instagram.com/eventyyapp', kind: 'social' },
    ],
  },
  {
    id: 'salonyy',
    name: 'Salonyy',
    tagline: 'Salon and clinic operations, done properly',
    blurb:
      'Multi-branch management for salons, spas and laser clinics: appointments, CRM, POS and real profitability.',
    status: 'live',
    year: '2025 to now',
    role: 'Architect & engineer',
    logo: '/brand/salonyy.webp',
    kind: 'product',
    category: 'SaaS · iOS · Android',
    world: { bg: '#FFB86B', fg: '#3A1606', accent: '#C2185B' },
    shots: { mobile: '/shots/salonyy-mobile.webp', desktop: '/shots/salonyy-desktop.webp' },
    demo: 'salon',
    hues: ['#FF7AB6', '#FFB86B'],
    highlights: [
      'Multi-branch with 7 roles and a granular permission matrix',
      'Appointments with day and week views, drag-to-reschedule, multi-service and multi-staff bookings, and conflict detection',
      'Status pipeline: New, Confirmed, Checked In, In Service, Completed, No Show, Cancelled',
      'Customer CRM with a unified timeline and computed insights: lifetime value, visit frequency, favourite service and churn risk',
      'POS with mixed payments across cash, card, transfer and wallet, plus discounts and a cash drawer',
      'Finance that shows real profit: revenue minus cost of goods, commissions and operating costs, including recurring costs like a daily-rented laser machine',
      'Nothing about the business domain is hardcoded. Services, categories, costs and roles are all editable data',
    ],
    engineering:
      'Most salon software is either a pretty calendar with no accounting, or an ERP nobody wants to open. Salonyy tries to be neither. The scheduling core does real conflict detection across staff, rooms and equipment while staying drag-and-drop fluid on a phone, and the finance layer computes genuine profitability rather than revenue, which means modelling cost of goods, per-staff commission and fixed recurring costs as first-class data. Everything is domain-agnostic: a nail bar, a laser clinic and a wellness centre run the same build with different rows in the database. One codebase ships to web, iOS and Android through Capacitor, with Playwright covering the end-to-end paths.',
    stack: [
      'React 18',
      'TypeScript (strict)',
      'Vite',
      'Tailwind',
      'Radix UI',
      'dnd-kit',
      'Recharts',
      'TanStack Query',
      'Zustand',
      'react-hook-form + zod',
      'Supabase',
      'Postgres RLS',
      'Capacitor',
      'Playwright',
    ],
    links: [
      { label: 'salonyy.site', href: 'https://salonyy.site', kind: 'site' },
      { label: '@trysalonyy', href: 'https://instagram.com/trysalonyy', kind: 'social' },
    ],
  },
  {
    id: 'rentyy',
    name: 'Rentyy',
    tagline: 'The rental office in your pocket',
    blurb:
      'A multi-tenant rental operations platform for car rental companies: the fleet, the dates, the handover, the contract, the servicing and the money.',
    status: 'live',
    year: '2026 to now',
    role: 'Architect & engineer',
    logo: '/brand/rentyy.webp',
    kind: 'product',
    category: 'Multi-tenant SaaS',
    world: { bg: '#EE6A3F', fg: '#1A0702', accent: '#FFE2C8' },
    shots: { mobile: '/shots/rentyy-mobile.webp', desktop: '/shots/rentyy-desktop.webp' },
    demo: 'rent',
    hues: ['#E8562A', '#F0A868'],
    highlights: [
      'The fleet with its photos, papers and rate plans, where registration, insurance and inspection expiry watch themselves',
      'A timeline board of the whole fleet: what is out, what is back today, and where the gaps are',
      'Pricing as a list of periods rather than three fixed columns, with a quote engine that picks the cheapest legal combination and shows its reasoning',
      'Handover and return wizards: photos, odometer, fuel and damage pinned onto a diagram of the car, resumable if the phone rings halfway through',
      'A return that diffs itself against the handover: kilometres driven, fuel used, and every mark that was not there before',
      "Contracts printed from a template, or overlaid onto the company's own preprinted paper so only the values land in the boxes",
      'Servicing due by date or by odometer, and traffic fines that attach themselves to whoever had the keys that minute',
      'A white-labelled public page where a stranger browses the fleet for their dates with no account at all',
    ],
    engineering:
      "A rental office argues about two things: who had the car on those dates, and what it looked like when it left. Both are settled below the interface. Overlapping rentals are impossible at the database, a GiST exclusion constraint over the vehicle and the date range rather than a screen that checks first, because two agents quoting the same car for the same week is an ordinary Tuesday. Condition is captured as damage markers in normalised coordinates on a car diagram, so a mark lands in the same place on a phone and on a printed report, and every handover carries the last known condition forward instead of redrawing the car from nothing. Tenancy is RLS with a lesson attached: a policy declared for all also covers SELECT in Postgres, so gating only the membership helper had left every table readable through its own write policy. The isolation suite caught that, and a test pins it now. Nothing about the first client's business is in the code either. Currency, VAT, rate periods, deposits, fuel policy, contract wording and branding are rows, so a change of mind after a meeting is a settings screen rather than a migration.",
    stack: [
      'React 18',
      'TypeScript (strict)',
      'Vite',
      'Tailwind',
      'TanStack Query',
      'Zustand',
      'react-hook-form + zod',
      'Supabase',
      'Postgres RLS',
      'pgTAP',
      'Edge Functions',
      'Capacitor',
      'PWA',
      'Playwright',
      'Cloudflare Pages',
      'GitHub Actions',
    ],
    links: [
      { label: 'rentyy.net', href: 'https://rentyy.net', kind: 'site' },
      { label: '@rentyyapp', href: 'https://instagram.com/rentyyapp', kind: 'social' },
    ],
  },
  {
    id: 'stackup',
    name: 'StackUp: Idle Empire',
    tagline: 'An idle tycoon game with a sense of humour',
    blurb:
      'From a lemonade stand to a moon base. Parody businesses, live rivals, markets and a prestige skill tree.',
    status: 'building',
    year: '2025 to now',
    role: 'Designer & engineer',
    logo: '/brand/stackup.webp',
    kind: 'product',
    category: 'Mobile game',
    world: { bg: '#FFD166', fg: '#2A1500', accent: '#D9480F' },
    demo: 'stack',
    hues: ['#FFD166', '#FF7A45'],
    highlights: [
      '15 level-gated businesses with payback times ranging from seconds to days',
      'A League of rival tycoons that keep earning while you are away',
      'Markets, real estate, lifestyle, collections, a Lucky Wheel and timed FRENZY runs',
      'Prestige: IPO for permanent power in a skill tree',
      'Story chapters, daily and weekly missions, achievements, streaks and offline earnings',
      'An economy tuned by simulation: millionaire on day one, trillionaire only after prestige',
    ],
    engineering:
      'An idle game is a balance problem wearing a game costume. The interesting work is the economy: fifteen assets whose costs and payouts have to stay meaningful across fifteen orders of magnitude, tuned by running simulations rather than by guessing, plus offline earnings and rivals that advance correctly across a closed app. State is a single Zustand store persisted to AsyncStorage with migration-safe schemas, animation runs on Reanimated worklets so the numbers never stutter, and monetisation is deliberately opt-in: rewarded boosts and cosmetics, never pay-to-win.',
    stack: [
      'Expo 57',
      'React Native 0.86',
      'React 19',
      'TypeScript',
      'Expo Router',
      'Zustand',
      'Reanimated 4',
      'AsyncStorage',
      'EAS Build',
    ],
    links: [],
  },
  {
    id: 'alpha',
    name: 'Alpha Supplements',
    tagline: 'Custom Shopify storefront',
    blurb:
      'A bespoke dark, high-contrast commerce theme built for a gym and supplements audience, trading today.',
    status: 'live',
    year: '2025',
    role: 'Design & build',
    logo: '/brand/alpha.webp',
    kind: 'build',
    category: 'Shopify storefront',
    world: { bg: '#1A1414', fg: '#FFF1EC', accent: '#D7FF3A' },
    shots: { mobile: '/shots/alpha-mobile.webp', desktop: '/shots/alpha-desktop.webp' },
    hues: ['#FF4D4D', '#FFB020'],
    highlights: [
      'A custom "Alpha" design layer built on Shopify Dawn 15.5 as a foundation',
      'Dark, high-contrast art direction aimed squarely at a gym audience',
      'Design layer isolated from Dawn internals, so upstream theme upgrades stay tractable',
      'Two-way GitHub and Shopify sync: pushes to main deploy, theme-editor edits commit back',
      'Local development against live store data with hot reload, writing nothing to production',
    ],
    engineering:
      "The constraint here is maintenance, not looks. Forking a Shopify theme and editing it freely is how stores end up permanently stranded on an old version, so the bespoke layer sits deliberately apart from Dawn's internals and Dawn can be upgraded without unpicking the design. Deployment has no CI and no secrets: Shopify pulls from the repository directly, and the fact that theme-editor changes commit back to main is treated as expected behaviour rather than a conflict to fight.",
    stack: ['Shopify', 'Liquid', 'Dawn 15.5', 'CSS', 'JavaScript', 'Shopify CLI'],
    links: [{ label: 'alphasupplementstore.com', href: 'https://alphasupplementstore.com', kind: 'site' }],
  },
  {
    id: 'hotw',
    name: 'Home of the Watches',
    tagline: 'Editorial commerce for collectors',
    blurb:
      'A luxury watch storefront for a client, where every listing is a story: provenance, condition, calibre and era.',
    status: 'building',
    year: '2025 to now',
    role: 'Design & build, client project',
    logo: '/brand/hotw.webp',
    kind: 'build',
    category: 'Shopify storefront',
    world: { bg: '#2A2416', fg: '#F6ECD2', accent: '#C9A227' },
    shots: { mobile: '/shots/hotw-mobile.webp', desktop: '/shots/hotw-desktop.webp' },
    hues: ['#C9A227', '#8E7B3F'],
    highlights: [
      'An "Aged Patina" luxury design system built on Shopify Craft',
      'Editorial homepage with featured timepieces, brand story and journal',
      'Collector-grade product pages carrying reference, era, movement, case diameter and lug width',
      'A full condition report covering dial, case, crown, crystal, movement and strap, plus box and papers',
      'Historical background, restoration details and provenance for each watch',
      'Brand taxonomy mega-menu, faceted filtering, SEO and structured data',
    ],
    engineering:
      'Selling a vintage watch is selling trust, so the product page had to carry far more than a price and a photo. Every collector-grade field, from reference and calibre through condition per component to restoration history and provenance, is a Shopify metafield the template reads and hides gracefully when empty. The merchant can list a watch with three facts or with thirty, and the page stays composed either way. Brand comes from the vendor field, so the eyebrow, the cards and the mega-menu taxonomy all stay in sync from one source.',
    stack: ['Shopify', 'Liquid', 'Craft theme', 'Metafields', 'Structured data', 'CSS', 'JavaScript'],
    links: [
      {
        label: 'homeofthewatches.com',
        href: 'https://homeofthewatches.com',
        kind: 'site',
      },
    ],
  },
  {
    id: 'elastick',
    name: 'E-Lastick',
    tagline: 'Smart gear, tested before it ships',
    blurb:
      'A storefront for a gadget retailer in Lebanon: tech for the phone, the car and the home, tested before it is listed and delivered anywhere in the country.',
    status: 'building',
    year: '2026 to now',
    role: 'Design & build, client project',
    logo: '/brand/elastick.webp',
    kind: 'build',
    category: 'Shopify storefront',
    world: { bg: '#193B74', fg: '#F2F6FF', accent: '#F4721D' },
    shots: { mobile: '/shots/elastick-mobile.webp', desktop: '/shots/elastick-desktop.webp' },
    hues: ['#F4721D', '#193B74'],
    highlights: [
      "A bespoke design layer over Shopify Horizon, in the brand's navy and orange",
      'Shopping by category, the way people actually shop: tech and gadgets, home essentials, kitchen and toys',
      'A statement whose words light up in turn as it scrolls into view, and that stays readable if the script never runs',
      'A header that settles into a solid bar once the page moves, with a hairline tracking how far down you are',
      'Dark sections found at runtime and given a quiet texture, even after the merchant recolours one in the editor',
      'Delivery and returns promised in the announcement bar, on the home page and again beside Add to cart',
      'A cart count that pops when it changes, so adding something registers even with the drawer closed',
    ],
    engineering:
      "Shopify's Horizon theme does not sit still. It swaps section markup on filtering, on pagination and live in the theme editor, and on a desktop the page scrolls inside a wrapper rather than the window, so a motion layer written the obvious way breaks in every one of those places. This one is written defensively instead. Nothing starts hidden: the statement's words are fully readable in the markup and only dim once an observer exists that is guaranteed to light them again, anything on screen at first paint appears at once with no fade, and a failsafe shows whatever is still hidden while it sits in view. A single frame-throttled handler drives the header state, the progress hairline and the hero parallax through two custom properties and one attribute, and it listens in the capture phase but only to the page's own scroller, so a product carousel can never move the progress bar. A tone pass reads the background colour Horizon actually computed for each section and textures only the dark ones, then runs again whenever the merchant recolours a section in the editor, so the design survives a client changing their mind.",
    stack: ['Shopify', 'Liquid', 'Horizon 4.1', 'CSS', 'JavaScript'],
    links: [
      {
        label: 'elastickstore.myshopify.com',
        href: 'https://elastickstore.myshopify.com',
        kind: 'site',
      },
    ],
  },
  {
    id: 'flow',
    name: 'Flow Clothing',
    tagline: 'Quiet fronts, statement backs',
    blurb:
      'A storefront for an independent streetwear label: oversized graphic tees and matching sets, cut unisex, with the story printed on the back.',
    status: 'building',
    year: '2026 to now',
    role: 'Design & build, client project',
    logo: '/brand/flow.webp',
    kind: 'build',
    category: 'Shopify storefront',
    world: { bg: '#1B2FE0', fg: '#F3F5FF', accent: '#FF5A1F' },
    shots: { mobile: '/shots/flow-mobile.webp', desktop: '/shots/flow-desktop.webp' },
    hues: ['#1B2FE0', '#FF5A1F'],
    highlights: [
      "The label's electric blue carried through the colour schemes, with buttons that turn orange under the cursor",
      'Two lines, graphic tees and matching sets of tee and shorts, with unisex sizing from XXS to 3XL',
      'Collections that cut across both lines: T-Shirts, Matching Sets, All Black and a Summer Capsule',
      'A hero with separate desktop and mobile crops, so the banner is composed for each screen rather than cropped by chance',
      "A ticker running the sets' mantras: No Rush, Less Noise More Life, Stay Quiet Move Sharp",
      'Product pages that describe the back as carefully as the front, since that is where the print lives',
    ],
    engineering:
      "A label this size does not need a custom theme so much as a disciplined one. The home page is assembled entirely from Horizon's own sections and blocks, configured rather than rewritten: a hero with its two crops, a ticker, product rails, a collection grid and the brand story. The identity lives in the colour schemes and in the catalogue itself, tagged by colour, cut, mood and print, and sliced into collections that cross both lines. Staying inside the theme's building blocks keeps the store in the owner's hands: a new banner, a reordered home page or a collection pushed to the front is a job for the theme editor rather than for a developer.",
    stack: ['Shopify', 'Horizon 3.5', 'Theme editor', 'Colour schemes', 'Collections', 'Product tags'],
    links: [
      {
        label: 'zqbmay-5c.myshopify.com',
        href: 'https://zqbmay-5c.myshopify.com',
        kind: 'site',
      },
    ],
  },
  {
    id: 'bits',
    name: 'BITS Events',
    tagline: 'A catalogue that ends in a message',
    blurb:
      'A single page for an event entertainment business in Lebanon, built so a visitor pictures their own evening and then reaches for WhatsApp.',
    status: 'live',
    year: '2026',
    role: 'Design & build, client project',
    logo: '/brand/bits.webp',
    kind: 'build',
    category: 'Website',
    world: { bg: '#EBDCC0', fg: '#2A2012', accent: '#8A6424' },
    shots: { mobile: '/shots/bits-mobile.webp', desktop: '/shots/bits-desktop.webp' },
    hues: ['#C2984E', '#EBDCC0'],
    highlights: [
      'One scrolling journey through five worlds: photography, stations, games, entertainment and the small details',
      'Every word on the site, and which photograph belongs to which experience, lives in one JSON file',
      'A Python pipeline rendering WebP at four widths per photograph, each with a blurred placeholder inlined so nothing pops in',
      '27 WhatsApp links, each prefilled with the experience the visitor was reading about',
      'A 48 photograph gallery in a tilted editorial masonry, with a keyboard and swipe lightbox',
      'Zero third-party requests: self-hosted subset fonts, no analytics, no embeds, no CDN',
      'Only the client\'s own photographs, several of them frames lifted from his event videos',
    ],
    engineering:
      "The brief arrived with hard rules: no prices anywhere, no cart or checkout language, and one phone number that every enquiry has to reach. Rules that live in a document get broken by the third edit, so these live in a check script that fails the build on a currency amount, a buy word, a missing alt attribute, a third-party host, or a WhatsApp link pointing anywhere but the client's number. The site itself is deliberately unfashionable: no framework, no server, no build step in CI. A Python pass turns the client's originals into responsive WebP, writes the page from that one file of copy, and the output is committed, so deploying is a file copy that cannot fail on a dependency.",
    stack: [
      'HTML',
      'CSS',
      'JavaScript',
      'Python',
      'Pillow',
      'WebP',
      'Structured data',
      'Cloudflare Pages',
    ],
    links: [
      { label: 'bitsevents.net', href: 'https://bitsevents.net', kind: 'site' },
      { label: '@bits_events.lb', href: 'https://instagram.com/bits_events.lb', kind: 'social' },
    ],
  },
];

export interface Venture {
  id: string;
  name: string;
  kind: string;
  handle: string;
  href: string;
  body: string;
  logo: string;
  hues: [string, string];
}

/** The work that is not software. */
export const ventures: Venture[] = [
  {
    id: 'lensandshot',
    name: 'Lens and Shot',
    kind: 'Photography',
    handle: '@lensandshot',
    href: 'https://instagram.com/lensandshot',
    logo: '/brand/lensandshot.webp',
    hues: ['#8FB8FF', '#C7D8F5'],
    body: 'Photography is the other way I look at things, and the one habit I have kept the longest. I shoot whenever I get the chance and publish the work at @lensandshot. Different craft, same instinct: frame it properly, wait for the moment, keep what earns its place.',
  },
  {
    id: 'ishrakati',
    name: 'Ishrakati',
    kind: 'Skincare brand',
    handle: '@ishrakati',
    href: 'https://instagram.com/ishrakati',
    logo: '/brand/ishrakati.webp',
    hues: ['#F2B8C6', '#E8D5B7'],
    body: 'Ishrakati is my own skincare brand. It is where the work is product, brand and audience instead of schema and deployment, and it keeps me close to the commercial side of building something: what people actually want, how you say it, and what makes them come back.',
  },
];

export interface Capability {
  title: string;
  body: string;
  points: string[];
  glyph: string;
}

export const capabilities: Capability[] = [
  {
    title: 'Software & solution architecture',
    glyph: '⌘',
    body:
      'Designing systems that survive contact with real clients, real regulation and real data volumes, then explaining them to the people paying for them.',
    points: [
      'Enterprise ERP module design',
      'Multi-tenant SaaS from the schema up',
      'Domain modelling for regulated industries',
      'Requirements, solution design, release',
    ],
  },
  {
    title: 'Enterprise backend',
    glyph: '⛁',
    body:
      'Seven years inside an insurance ERP: policy administration, underwriting, claims, accounting, collections, reinsurance and the integrations around them.',
    points: [
      'C#, VB.NET, .NET Framework & Core',
      'SQL Server at 1TB+ scale',
      'Performance tuning & query optimisation',
      'REST APIs and third-party integrations',
    ],
  },
  {
    title: 'Full-stack product',
    glyph: '◧',
    body:
      'Complete products built alone: database, security model, API, interface, deployment, app store. Web and mobile from one codebase.',
    points: [
      'React 18 + TypeScript (strict)',
      'Supabase / PostgreSQL with RLS',
      'Capacitor & Expo for iOS + Android',
      'Cloudflare Pages, GitHub Actions, CI/CD',
    ],
  },
  {
    title: 'AI integration',
    glyph: '◍',
    body:
      'AI as an engineered layer rather than a bolt-on demo: provider abstractions, structured extraction, and a fallback for every failure mode.',
    points: [
      'Vision to structured-data pipelines',
      'Provider-agnostic gateways',
      'Prompt engineering with schemas',
      'AI-assisted development workflows',
    ],
  },
  {
    title: 'Interface & experience',
    glyph: '◑',
    body:
      'Products that feel like Linear or Stripe, not like enterprise software. Responsive, accessible, internationalised and RTL-ready.',
    points: [
      'Design systems with Tailwind + Radix',
      'Motion design with Framer Motion',
      'i18n and full RTL from day one',
      'Touch-safe, offline-capable UX',
    ],
  },
  {
    title: 'Home & building automation',
    glyph: '⌂',
    body:
      'The same instinct pointed at a building instead of a browser. A Zigbee mesh, a hub that keeps thinking with the internet unplugged, and a house that responds to state rather than waiting for somebody to open an app.',
    points: [
      'Sonoff & Zigbee mesh networks',
      'Local-first hubs, no cloud dependency',
      'Lighting, climate, access & sensors',
      'Scenes, schedules & presence automation',
    ],
  },
  {
    title: 'Leading delivery',
    glyph: '⌗',
    body:
      'Running a team and the client relationship at the same time: the technical decisions, and the conversation about them.',
    points: [
      'Mentoring juniors to ownership',
      'Code review standards that cut bugs 40%',
      'Kanban / Jira agile delivery',
      'Direct client technical ownership',
    ],
  },
];

export const toolkit: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['C#', 'VB.NET', 'SQL', 'TypeScript', 'JavaScript'] },
  { group: 'Frameworks', items: ['.NET Framework', '.NET Core', 'ASP.NET', 'React', 'Vite', 'Expo', 'Capacitor'] },
  {
    group: 'Frontend',
    items: ['TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Radix', 'Framer Motion', 'Zustand', 'TanStack Query'],
  },
  { group: 'Backend & data', items: ['SQL Server', 'PostgreSQL', 'Supabase', 'Edge Functions', 'pgvector', 'RLS'] },
  { group: 'AI', items: ['Google Gemini', 'AI integrations', 'Prompt engineering', 'AI-assisted development'] },
  { group: 'Cloud & CI', items: ['Google Cloud', 'Cloudflare Pages', 'GitHub Actions', 'EAS Build'] },
  {
    group: 'Home automation',
    items: ['Zigbee', 'Sonoff', 'Zigbee2MQTT', 'Home Assistant', 'MQTT', 'Smart switches & sensors'],
  },
  { group: 'Reporting', items: ['Crystal Reports', 'ComponentOne', 'DevExpress'] },
  { group: 'Tools', items: ['Visual Studio', 'SSMS', 'Git', 'GitHub', 'Jira', 'Postman', 'Swagger'] },
  {
    group: 'Practice',
    items: ['REST APIs', 'Agile', 'Kanban', 'Code review', 'CI/CD', 'Solution architecture', 'Performance tuning'],
  },
];

export const marqueeItems = [
  'C#',
  '.NET',
  'SQL Server',
  'TypeScript',
  'React',
  'Supabase',
  'PostgreSQL',
  'RLS',
  'Gemini',
  'Capacitor',
  'Expo',
  'Tailwind',
  'Edge Functions',
  'Cloudflare',
  'GitHub Actions',
  'REST APIs',
  'Shopify',
  'Zigbee',
  'Home Assistant',
  'Solution Architecture',
];

export const statusLabel: Record<Status, string> = {
  live: 'Live',
  building: 'In development',
  early: 'Early build',
};

/** The running order of the page, used by the dock, the index and the header. */
export const chapters = [
  { id: 'top', label: 'Hello' },
  { id: 'products', label: 'My products' },
  { id: 'builds', label: 'Client builds' },
  { id: 'career', label: 'The day job' },
  { id: 'skills', label: 'What I do' },
  { id: 'beyond', label: 'Beyond code' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/**
 * The colour world each section turns the page into. Products and builds bring
 * their own, from the project data.
 */
export const worlds = {
  night: { bg: '#110E1C', fg: '#FFF6EA', accent: '#C6F94E' },
  lilac: { bg: '#E4DCFF', fg: '#1B1433', accent: '#5B3DF5' },
  ink: { bg: '#15121D', fg: '#FBF4EA', accent: '#FFB020' },
  cream: { bg: '#FFF4E4', fg: '#1E1730', accent: '#E8562A' },
  mint: { bg: '#CFF3E0', fg: '#0D2A1E', accent: '#13795B' },
  midnight: { bg: '#0D1430', fg: '#EAF1FF', accent: '#FFC861' },
  sky: { bg: '#DCE8FF', fg: '#0D1A3A', accent: '#2F5BD3' },
  peach: { bg: '#FFE3D3', fg: '#2B1410', accent: '#D6336C' },
  orange: { bg: '#FF6B2C', fg: '#1C0A02', accent: '#1C0A02' },
} satisfies Record<string, World>;
