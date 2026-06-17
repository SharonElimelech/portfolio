import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface NavigationProps {
  onNavigate: (target: string) => void;
}

const NAV_ITEMS = [
  { label: 'DISCIPLINE', target: '#discipline' },
  { label: 'ARSENAL', target: '#arsenal' },
  { label: 'TRANSMISSION', target: '#transmission' },
];

export default function Navigation({ onNavigate }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    setMenuOpen(false);
    onNavigate(target);
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 flex items-center justify-between transition-all duration-500"
      style={{
        backgroundColor: scrolled || menuOpen ? 'rgba(5, 5, 5, 0.8)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
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

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-10">
        {NAV_ITEMS.map((item) => (
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

      {/* Desktop CTA Button */}
      <a
        href="#transmission"
        onClick={(e) => handleClick(e, '#transmission')}
        className="hidden md:inline-flex relative px-6 py-2.5 border border-crimson text-crimson font-mono text-[11px] tracking-[0.15em] hover:bg-crimson hover:text-black"
        data-cursor-hover
        style={{ transitionDuration: '0.2s' }}
      >
        MAKE CONTACT
      </a>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        className="md:hidden relative z-[110] w-10 h-10 flex flex-col items-center justify-center gap-1.5"
      >
        <span
          className="block w-6 h-[2px] bg-crimson transition-all duration-300"
          style={{ transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}
        />
        <span
          className="block w-6 h-[2px] bg-crimson transition-all duration-300"
          style={{ opacity: menuOpen ? 0 : 1 }}
        />
        <span
          className="block w-6 h-[2px] bg-crimson transition-all duration-300"
          style={{ transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
        />
      </button>

      {/* Mobile fullscreen menu */}
      <div
        className="md:hidden fixed inset-0 z-[105] flex flex-col items-center justify-center gap-10 transition-all duration-300"
        style={{
          background: 'rgba(5, 5, 5, 0.97)',
          backdropFilter: 'blur(16px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-12px)',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.target}
            onClick={(e) => handleClick(e, item.target)}
            className="font-syncopate text-2xl tracking-[0.3em] text-ghost hover:text-crimson transition-colors duration-300"
          >
            {item.label}
          </a>
        ))}
        <a
          href="#transmission"
          onClick={(e) => handleClick(e, '#transmission')}
          className="mt-4 px-8 py-3 border border-crimson text-crimson font-mono text-xs tracking-[0.2em]"
        >
          MAKE CONTACT
        </a>
      </div>
    </nav>
  );
}
