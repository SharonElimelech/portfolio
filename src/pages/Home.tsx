import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '../components/CustomCursor';
import Navigation from '../components/Navigation';
import HeroSection from '../sections/HeroSection';
import DisciplineSection from '../sections/DisciplineSection';
import ArsenalSection from '../sections/ArsenalSection';
import TransmissionSection from '../sections/TransmissionSection';

gsap.registerPlugin(ScrollTrigger);

interface HomeProps {
  onNavigate: (target: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  // Refresh ScrollTrigger after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative" style={{ background: '#050505' }}>
      <CustomCursor />
      <Navigation onNavigate={onNavigate} />
      <main>
        <HeroSection />
        <DisciplineSection />
        <ArsenalSection />
        <TransmissionSection />
      </main>
    </div>
  );
}
