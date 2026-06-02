import { useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import { useLenis } from './hooks/useLenis';

export default function App() {
  const lenisRef = useLenis();

  const handleNavigate = useCallback((target: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.5 });
    } else {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lenisRef]);

  // Sync Lenis with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    let rafId: number;
    function raf(time: number) {
      lenis!.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(rafId);
  }, [lenisRef]);

  return (
    <Routes>
      <Route path="/" element={<Home onNavigate={handleNavigate} />} />
    </Routes>
  );
}
