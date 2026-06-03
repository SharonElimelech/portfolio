import { useEffect, useRef, useState, useCallback } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef<number>(0);

  // Check if mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Smooth lerp animation loop
  const animate = useCallback(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Dot: tight follow (lerp 0.35)
    dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.35;
    dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.35;

    // Ring: looser follow (lerp 0.15)
    ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

    dot.style.transform = `translate(${dotPos.current.x - 3}px, ${dotPos.current.y - 3}px)`;
    ring.style.transform = `translate(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px)`;

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const onMouseEnter = () => setIsHovering(true);
    const onMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', onMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    // Observe DOM for interactive elements
    const bindInteractives = () => {
      const interactives = document.querySelectorAll('a, button, [data-cursor-hover]');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });
      return interactives;
    };

    // Initial bind + re-bind on DOM changes
    let interactives = bindInteractives();
    const observer = new MutationObserver(() => {
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
      interactives = bindInteractives();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
      observer.disconnect();
    };
  }, [isMobile, animate]);

  if (isMobile) return null;

  return (
    <>
      {/* Red dot — 6px, solid fill */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999]"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#ff0000',
          mixBlendMode: 'difference',
          transition: isHovering ? 'opacity 0.2s ease-out' : 'none',
          opacity: isHovering ? 0 : 1,
        }}
      />
      {/* Hover ring — 32px, outlined with glow */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[99998]"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: isHovering ? '1px solid #ff0000' : '1px solid transparent',
          backgroundColor: 'transparent',
          boxShadow: isHovering ? '0 0 12px rgba(255, 0, 0, 0.4)' : 'none',
          mixBlendMode: 'difference',
          transition: 'border-color 0.25s ease-out, box-shadow 0.25s ease-out, width 0.25s ease-out, height 0.25s ease-out',
        }}
      />
    </>
  );
}
