import { useEffect, useState } from 'react';
import { About } from './components/About';
import { Beyond } from './components/Beyond';
import { Capabilities } from './components/Capabilities';
import { CommandPalette } from './components/CommandPalette';
import { Contact } from './components/Contact';
import { Cursor } from './components/Cursor';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Nav } from './components/Nav';
import { Projects } from './components/Projects';
import { ScrollProgress } from './components/ScrollProgress';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      // `/` opens search too, unless the visitor is typing in a field.
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="grain relative min-h-screen">
      <Cursor />
      <ScrollProgress />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />

      <Hero />

      <main id="main">
        <Marquee />
        <Experience />
        <Projects />
        <Capabilities />
        <About />
        <Beyond />
        <Contact />
      </main>

      <Footer />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
