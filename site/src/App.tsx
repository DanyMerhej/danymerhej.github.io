import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Beyond } from './components/Beyond';
import { Colophon } from './components/Colophon';
import { Cover } from './components/Cover';
import { Craft } from './components/Craft';
import { Header } from './components/Header';
import { Intro } from './components/Intro';
import { Ledger } from './components/Ledger';
import { Menu } from './components/Menu';
import { Works } from './components/Works';
import { useHueThemeSync, useIntro, useTheme } from './lib/hooks';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, endIntro] = useIntro();
  const [theme] = useTheme();

  // Keep the ink fallback correct when the palette flips between chapters.
  useHueThemeSync(theme);

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

  return (
    <div className="grain relative min-h-screen">
      <AnimatePresence>{intro && <Intro key="intro" onDone={endIntro} />}</AnimatePresence>

      <Header onOpenMenu={() => setMenuOpen(true)} />

      <Cover intro={intro} />

      <main>
        <Ledger />
        <Works />
        <Craft />
        <Beyond />
        <Colophon />
      </main>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
