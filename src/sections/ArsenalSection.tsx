import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ArsenalCard {
  title: string;
  subtitle: string;
  description: string;
  stats: { label: string; value: string }[];
  icon: string;
  link: string;
  featured?: boolean;
}

// Projects from CV + github.com/SharonElimelech
const arsenalCards: ArsenalCard[] = [
  {
    title: 'WhatsApp AI Customer-Service Bot',
    subtitle: 'In production · Node.js · Claude API',
    description:
      'Production AI bot: WhatsApp messages arrive via Meta Cloud API webhooks and are answered by an LLM constrained to an approved knowledge base, with human-callback escalation through tool-calling into Make.com. Webhook signature verification, async processing and per-customer conversation state.',
    stats: [
      { label: 'Status', value: 'Live' },
      { label: 'Stack', value: 'Node · Claude' },
    ],
    icon: '◈',
    link: 'https://github.com/SharonElimelech',
    featured: true,
  },
  {
    title: 'Personal Portfolio',
    subtitle: 'React · TypeScript · Vite',
    description:
      'This site — a fully responsive personal portfolio with a reusable, typed component architecture (40+ UI components), deployed to production on Vercel with automated builds from GitHub.',
    stats: [
      { label: 'Components', value: '40+' },
      { label: 'Deploy', value: 'Vercel' },
    ],
    icon: '◉',
    link: 'https://github.com/SharonElimelech/portfolio',
  },
  {
    title: 'Math Tutor App',
    subtitle: 'PWA · JavaScript',
    description:
      'A PWA for managing private lessons — students, calendar, WhatsApp payment reminders and income summaries.',
    stats: [
      { label: 'Type', value: 'PWA' },
      { label: 'Stack', value: 'JS' },
    ],
    icon: '◆',
    link: 'https://github.com/SharonElimelech/math-tutor-app',
  },
  {
    title: 'CRM Cloud',
    subtitle: 'Web App',
    description:
      'A cloud CRM web app for tracking clients and pipeline — built and deployed for real-world use.',
    stats: [
      { label: 'Type', value: 'CRM' },
      { label: 'Stack', value: 'Web' },
    ],
    icon: '◇',
    link: 'https://github.com/SharonElimelech/crm-cloud',
  },
  {
    title: 'Business Websites',
    subtitle: 'WordPress · HTML · CSS · JS',
    description:
      'Responsive business sites delivered end-to-end — UI design, content structure and deployment. Includes a polished site for a law practice.',
    stats: [
      { label: 'Type', value: 'Sites' },
      { label: 'Stack', value: 'WP' },
    ],
    icon: '◈',
    link: 'https://github.com/SharonElimelech/Lawyer-web-site',
  },
  {
    title: 'Bank Account Simulator',
    subtitle: 'C++ · OOP',
    description:
      'A banking-system simulator applying object-oriented design — classes, inheritance and encapsulation.',
    stats: [
      { label: 'Type', value: 'App' },
      { label: 'Stack', value: 'C++' },
    ],
    icon: '◉',
    link: 'https://github.com/SharonElimelech/bank-simuletor',
  },
];

function LineChart({ active }: { active: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current || !active) return;
    const path = pathRef.current;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
    });
  }, [active]);

  return (
    <svg viewBox="0 0 200 60" className="w-full h-16 mt-4" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF2A2A" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#FF2A2A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF2A2A" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d="M0,50 Q25,45 50,35 T100,25 T150,30 T200,15"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="35" r="3" fill="#FF2A2A" opacity={active ? 1 : 0} className="transition-opacity duration-500" />
      <circle cx="100" cy="25" r="3" fill="#FF2A2A" opacity={active ? 1 : 0} className="transition-opacity duration-500" />
      <circle cx="150" cy="30" r="3" fill="#FF2A2A" opacity={active ? 1 : 0} className="transition-opacity duration-500" />
    </svg>
  );
}

export default function ArsenalSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.arsenal-heading',
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.arsenal-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.arsenal-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="arsenal"
      ref={sectionRef}
      className="relative w-full py-32 md:py-48 overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 42, 42, 0.03) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24">
        {/* Heading */}
        <div className="arsenal-heading mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-2 h-2 rounded-full bg-crimson animate-glow-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-crimson uppercase">
              Selected Work
            </span>
          </div>
          <div className="flex items-center gap-6">
            <h2 className="font-oswald text-4xl md:text-6xl lg:text-7xl text-ghost tracking-tight">
              ARSENAL
            </h2>
            <div className="h-[1px] flex-1 max-w-[200px] bg-gradient-to-r from-crimson to-transparent" />
          </div>
        </div>

        {/* Bento Grid */}
        <div className="arsenal-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-6xl mx-auto">
          {arsenalCards.map((card, i) => (
            <a
              key={card.title}
              href={card.link}
              target="_blank"
              rel="noreferrer"
              data-cursor-hover
              className={`arsenal-card glass-heavy p-6 md:p-8 relative overflow-hidden group block ${card.featured ? 'md:col-span-2' : ''}`}
              style={{
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Border trace on hover */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: hoveredCard === i ? 1 : 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 42, 42, 0.2), transparent)',
                  backgroundSize: '200% 100%',
                  animation: hoveredCard === i ? 'border-trace 2s linear infinite' : 'none',
                }}
              />

              {/* Inner glow */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                style={{
                  opacity: hoveredCard === i ? 1 : 0,
                  boxShadow: 'inset 0 0 40px rgba(255, 42, 42, 0.05)',
                }}
              />

              <div className="relative z-10">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-crimson text-xl group-hover:scale-110 transition-transform duration-300">
                        {card.icon}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.2em] text-ash/60 uppercase">
                        {card.subtitle}
                      </span>
                    </div>
                    <h3
                      className="font-oswald text-xl md:text-2xl tracking-wide transition-colors duration-300"
                      style={{
                        color: hoveredCard === i ? '#FF2A2A' : '#FFFFFF',
                        animation: hoveredCard === i ? 'glitch-text 0.3s ease' : 'none',
                      }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 border border-crimson/20 flex items-center justify-center group-hover:border-crimson/60 transition-colors duration-300">
                    <span className="text-crimson text-xs">→</span>
                  </div>
                </div>

                {/* Description */}
                <p className="font-space text-sm text-ash leading-relaxed mb-6">
                  {card.description}
                </p>

                {/* Mini Chart */}
                <LineChart active={hoveredCard === i} />

                {/* Stats */}
                <div className="flex gap-8 mt-4 pt-4 border-t border-white/5">
                  {card.stats.map((stat) => (
                    <div key={stat.label}>
                      <span className="font-oswald text-lg text-ghost">{stat.value}</span>
                      <span className="block font-mono text-[8px] tracking-[0.2em] text-ash/50 uppercase mt-1">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
