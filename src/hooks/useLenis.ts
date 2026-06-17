import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Skip smooth-scroll hijacking on touch devices — Lenis intercepts touch
    // events and was breaking / stuttering native scrolling on mobile.
    // Native scroll still drives ScrollTrigger and Framer Motion fine.
    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Framer Motion's useScroll reads window.scrollY (which Lenis updates) but
    // listens for the native 'scroll' event — dispatch one on every Lenis tick.
    lenis.on('scroll', () => {
      window.dispatchEvent(new Event('scroll'));
    });

    // Drive Lenis from GSAP's ticker (single RAF source for the whole app).
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
