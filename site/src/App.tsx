import { AnimatePresence } from 'framer-motion';
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { About } from './components/About';
import { Beyond } from './components/Beyond';
import { Builds } from './components/Builds';
import { Career } from './components/Career';
import { Contact } from './components/Contact';
import { Curtain } from './components/Curtain';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { Menu } from './components/Menu';
import { Dock, Header } from './components/Nav';
import { Cursor, TapRipples } from './components/Pointer';
import { Products } from './components/Products';
import { ProjectPage } from './components/ProjectPage';
import { Skills } from './components/Skills';
import type { Project } from './data/site';
import { projects, worlds } from './data/site';
import { useIntro } from './lib/hooks';
import { goBackTo, navigate, savedHomeScroll, takePendingHash, useRoute, workPath } from './lib/router';
import { scrollToId, scrollToY, startSmoothScroll } from './lib/smooth';
import { setBaseWorld, settleWorlds } from './lib/world';

export default function App() {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, endIntro] = useIntro();

  useEffect(() => startSmoothScroll(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Not from inside another dialog (a role's sheet), or the index would
        // open underneath it.
        if (document.querySelector('[aria-modal="true"]:not([aria-label="Index"])')) return;
        setMenuOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openProject = useCallback((p: Project, x: number, y: number) => {
    navigate(workPath(p.id), { colour: p.world.bg, x, y, direction: 'forward', morph: p.id });
  }, []);

  // Back through history when the home page is the entry before, so the
  // phone's back gesture afterwards leaves the site rather than reopening the
  // project; forward to the right chapter when the visit started here.
  const backHome = useCallback((p: Project, x: number, y: number) => {
    goBackTo('/', {
      colour: worlds.lilac.bg,
      x,
      y,
      hash: p.kind === 'product' ? `work-${p.id}` : 'builds',
      direction: 'back',
    });
  }, []);

  const toChapter = useCallback((id: string) => {
    navigate('/', { colour: worlds.lilac.bg, hash: id, direction: 'back' });
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  const project = route.name === 'work' ? projects.find((p) => p.id === route.id) : undefined;

  // The home page is built once and then kept, hidden, while a project is
  // open: coming back is a reveal, not a rebuild of the whole page.
  const [homeBuilt, setHomeBuilt] = useState(!project);
  // Once it has been left, its entrances count as played (index.css).
  const [homeSettled, setHomeSettled] = useState(false);
  useEffect(() => {
    if (!project) setHomeBuilt(true);
    else if (homeBuilt) setHomeSettled(true);
  }, [project, homeBuilt]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatePresence>{intro && <Intro key="intro" onDone={endIntro} />}</AnimatePresence>

      {homeBuilt && (
        <div hidden={Boolean(project)} data-settled={homeSettled ? '' : undefined}>
          <Home active={!project} onOpen={openProject} onOpenMenu={openMenu} />
        </div>
      )}
      {project && (
        <ProjectView key={project.id} project={project} onOpen={openProject} onBack={backHome} onOpenMenu={openMenu} />
      )}

      <Menu
        open={menuOpen}
        onClose={closeMenu}
        onOpenProject={openProject}
        onHome={route.name === 'work' ? toChapter : undefined}
      />
      <Curtain />
      <Cursor />
      <TapRipples />
    </div>
  );
}

/** Whether the home page has been shown before in this visit, i.e. whether to restore a scroll position. */
let homeVisited = false;

/**
 * Memoised: opening the index must not re-render a page of this size. Its
 * callbacks are stable, so it renders only when it is shown or hidden; the
 * intro's state reaches the hero through its own small store instead.
 */
const Home = memo(function Home({
  active,
  onOpen,
  onOpenMenu,
}: {
  active: boolean;
  onOpen: (p: Project, x: number, y: number) => void;
  onOpenMenu: () => void;
}) {
  const first = useRef(true);

  // Every time the page is shown: its own colours, and the right place on it.
  useLayoutEffect(() => {
    if (!active) return;
    setBaseWorld(worlds.night);

    const initial = first.current;
    first.current = false;
    const hash = takePendingHash() ?? (initial && !homeVisited ? window.location.hash.slice(1) || null : null);
    const saved = homeVisited ? savedHomeScroll() : null;
    homeVisited = true;

    const restore = () => {
      if (hash) scrollToId(hash, true);
      else if (saved !== null) scrollToY(saved, true);
    };
    // Coming back, the page is already built and sized: land now, inside
    // this commit, so a page transition's picture of the home page is taken
    // at the right place and in the right colours.
    if (!initial) {
      restore();
      settleWorlds();
    }
    // A first visit waits two frames: the pinned sections size themselves
    // after mounting. Coming back, this is a harmless second look.
    requestAnimationFrame(() => requestAnimationFrame(restore));
  }, [active]);

  return (
    <>
      <Header onOpenMenu={onOpenMenu} />
      <main>
        <Hero />
        <Products onOpen={onOpen} />
        <Builds onOpen={onOpen} />
        <Career />
        <Skills />
        <Beyond />
        <About />
        <Contact />
      </main>
      <Dock onOpenMenu={onOpenMenu} />
    </>
  );
});

function ProjectView(props: React.ComponentProps<typeof ProjectPage>) {
  useLayoutEffect(() => {
    homeVisited = true;
    scrollToY(0, true);
  }, []);
  return <ProjectPage {...props} />;
}
