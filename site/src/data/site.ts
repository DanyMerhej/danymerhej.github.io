export type Status = 'live' | 'building' | 'early';

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
  intro:
    'I lead the team behind IRIS, an enterprise insurance ERP running at 30+ insurance companies across the Middle East, Africa and Europe. Outside of that, I design and ship my own products end to end: architecture, AI, backend, UI, app stores.',
  summary: [
    'Seven years ago I walked into Pixel Software Solutions as an intern. Today I lead the team that builds IRIS, an insurance ERP that more than 30 companies across three continents run their business on: policy administration, underwriting, claims, accounting, collections, reinsurance, reporting, broker portals and the integrations that tie them to the outside world.',
    'That work taught me the unglamorous half of engineering. Regulated domains, million-row tables, migrations that cannot fail, and clients who need a straight answer today. I own the technical conversation with them from the first requirement to the release note.',
    'The other half is mine. Nights and weekends I build complete products alone: architecture, database, security model, AI pipeline, interface, CI/CD, app store listing. Splittyy, Eventyy and Salonyy are live, and Splittyy is on Google Play too. StackUp is in active development, and two commercial storefronts are trading. I build them because shipping something with your own name on it is the fastest way to stay sharp.',
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
    id: 'stackup',
    name: 'StackUp: Idle Empire',
    tagline: 'An idle tycoon game with a sense of humour',
    blurb:
      'From a lemonade stand to a moon base. Parody businesses, live rivals, markets and a prestige skill tree.',
    status: 'building',
    year: '2025 to now',
    role: 'Designer & engineer',
    logo: '/brand/stackup.webp',
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
        label: 'homeofthewatches.myshopify.com',
        href: 'https://homeofthewatches.myshopify.com',
        kind: 'site',
      },
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
  'Solution Architecture',
];

export const statusLabel: Record<Status, string> = {
  live: 'Live',
  building: 'In development',
  early: 'Early build',
};

/** The running order of the page, used by the contents list and the menu. */
export const chapters = [
  { id: 'ledger', label: 'The day job' },
  { id: 'works', label: 'The work' },
  { id: 'craft', label: 'What I do' },
  { id: 'beyond', label: 'Beyond code' },
  { id: 'colophon', label: 'About & contact' },
];
