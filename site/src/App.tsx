import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { navigate, savedHomeScroll, takePendingHash, useRoute, workPath } from './lib/router';
import { scrollToId, scrollToY, startSmoothScroll } from './lib/smooth';
import { setBaseWorld } from './lib/world';

export default function App() {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, endIntro] = useIntro();

  useEffect(() => startSmoothScroll(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMenuOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openProject = useCallback((p: Project, x: number, y: number) => {
    navigate(workPath(p.id), { colour: p.world.bg, x, y, label: p.name });
  }, []);

  const backHome = useCallback((p: Project, x: number, y: number) => {
    navigate('/', { colour: worlds.lilac.bg, x, y, hash: p.kind === 'product' ? `work-${p.id}` : 'builds' });
  }, []);

  const toChapter = useCallback((id: string) => {
    navigate('/', { colour: worlds.lilac.bg, hash: id });
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  const project = route.name === 'work' ? projects.find((p) => p.id === route.id) : undefined;

  return (
    <div className="grain relative min-h-screen overflow-x-clip">
      <AnimatePresence>{intro && <Intro key="intro" onDone={endIntro} />}</AnimatePresence>

      {project ? (
        <ProjectView key={project.id} project={project} onOpen={openProject} onBack={backHome} onOpenMenu={openMenu} />
      ) : (
        <Home intro={intro} onOpen={openProject} onOpenMenu={openMenu} />
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

function Home({
  intro,
  onOpen,
  onOpenMenu,
}: {
  intro: boolean;
  onOpen: (p: Project, x: number, y: number) => void;
  onOpenMenu: () => void;
}) {
  const restored = useRef(false);

  useLayoutEffect(() => {
    setBaseWorld(worlds.night);
    if (restored.current) return;
    restored.current = true;

    const hash = takePendingHash() ?? (homeVisited ? null : window.location.hash.slice(1) || null);
    const saved = homeVisited ? savedHomeScroll() : null;
    homeVisited = true;

    // Wait two frames: the pinned sections size themselves after mounting.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (hash) scrollToId(hash, true);
        else if (saved !== null) scrollToY(saved, true);
      }),
    );
  }, []);

  return (
    <>
      <Header onOpenMenu={onOpenMenu} />
      <main>
        <Hero intro={intro} />
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
}

function ProjectView(props: React.ComponentProps<typeof ProjectPage>) {
  useLayoutEffect(() => {
    homeVisited = true;
    scrollToY(0, true);
  }, []);
  return <ProjectPage {...props} />;
}
