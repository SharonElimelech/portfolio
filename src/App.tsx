import { useCallback } from 'react';
import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import { useLenis } from './hooks/useLenis';

export default function App() {
  // useLenis already drives lenis.raf via gsap.ticker — no extra RAF loop here,
  // a second loop would advance Lenis twice per frame (doubled scroll speed / jank).
  const lenisRef = useLenis();

  const handleNavigate = useCallback((target: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.5 });
    } else {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lenisRef]);

  return (
    <Routes>
      <Route path="/" element={<Home onNavigate={handleNavigate} />} />
    </Routes>
  );
}
