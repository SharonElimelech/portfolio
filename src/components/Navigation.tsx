import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface NavigationProps {
  onNavigate: (target: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
  }, []);

  const handleClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    onNavigate(target);
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 flex items-center justify-between transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(5, 5, 5, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
      }}
    >
      {/* Logo */}
      <a
        href="#hero"
        onClick={(e) => handleClick(e, '#hero')}
        className="flex items-center gap-3 group"
        data-cursor-hover
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="transition-transform duration-300 group-hover:rotate-45">
          <path d="M16 0L20 12L32 16L20 20L16 32L12 20L0 16L12 12L16 0Z" fill="#FF2A2A" />
        </svg>
        <span className="font-syncopate text-xs tracking-[0.3em] text-ghost hidden md:block">
          SE
        </span>
      </a>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-10">
        {[
          { label: 'DISCIPLINE', target: '#discipline' },
          { label: 'ARSENAL', target: '#arsenal' },
          { label: 'TRANSMISSION', target: '#transmission' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.target}
            onClick={(e) => handleClick(e, item.target)}
            className="font-mono text-[11px] tracking-[0.2em] text-ash hover:text-crimson transition-colors duration-300 relative group"
            data-cursor-hover
          >
            {item.label}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-crimson transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <a
        href="#transmission"
        onClick={(e) => handleClick(e, '#transmission')}
        className="relative px-6 py-2.5 border border-crimson text-crimson font-mono text-[11px] tracking-[0.15em] hover:bg-crimson hover:text-black transition-all duration-0"
        data-cursor-hover
        style={{ transitionDuration: '0s' }}
      >
        MAKE CONTACT
      </a>
    </nav>
  );
}
