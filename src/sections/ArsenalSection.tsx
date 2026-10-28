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
  link?: string;
  featured?: boolean;
}

// Flagship work first; every number here is sourced in career-profile.md.
const arsenalCards: ArsenalCard[] = [
  {
    title: 'WhatsApp AI Customer-Service Bot',
    subtitle: 'In production · Node.js · WhatsApp Cloud API · Claude / Gemini',
    description:
      'A law firm needed every WhatsApp lead answered — including after hours. The agent answers 24/7 only from an approved knowledge base, hands off to the lawyer with the full transcript through tool calling, and runs the lead flow end to end. HMAC-verified webhooks, de-dup, rate limits and a multi-provider LLM chain with automatic fallback, so no lead is lost.',
    stats: [
      { label: 'Status', value: 'Live' },
      { label: 'Availability', value: '24/7' },
    ],
    icon: '◈',
    link: 'https://github.com/SharonElimelech/whatsapp-ai-service-bot',
    featured: true,
  },
  {
    title: 'MathGen',
    subtitle: 'Co-founder · Astro · Cloudflare · Python · SymPy',
    description:
      'Worksheets for math teachers, generated from a bank of AI-written exercises that nobody has to trust blindly: SymPy verifies every answer and a person approves every batch before it merges. Private beta.',
    stats: [
      { label: 'Exercises', value: '101,720' },
      { label: 'My merged PRs', value: '178' },
    ],
    icon: '◉',
  },
  {
    title: 'JobPilot',
    subtitle: 'Autonomous agent · TypeScript · Claude · Supabase',
    description:
      'Scans 4 Israeli job sources every 2 hours, scores each posting against my CV with Claude structured outputs and pings me on Telegram at 70+ — with ghost-job detection and a Next.js dashboard.',
    stats: [
      { label: 'Sources', value: '4' },
      { label: 'Scan', value: 'Every 2h' },
    ],
    icon: '◆',
    link: 'https://github.com/SharonElimelech/jobpilot',
  },
  {
    title: 'Insolvency Case-Management CRM',
    subtitle: 'Electron · React · TypeScript · SQLite · Supabase',
    description:
      'Clients, debts, assets, payments, case pipeline, tasks and reports for a debt-relief law practice. Offline-first for sensitive legal data, with auto-backup, multi-PC sync, a one-click Windows installer and a cloud web edition.',
    stats: [
      { label: 'Mode', value: 'Offline-first' },
      { label: 'Ships as', value: '.exe + web' },
    ],
    icon: '◇',
    link: 'https://github.com/SharonElimelech/crm-cloud',
  },
  {
    title: 'Math Tutor App',
    subtitle: 'PWA · JavaScript · Cloudflare Workers',
    description:
      'The PWA that runs my tutoring business every day — students, lesson calendar, push reminders, WhatsApp payment messages and monthly income reports. Works offline.',
    stats: [
      { label: 'Type', value: 'PWA' },
      { label: 'Commits', value: '94' },
    ],
    icon: '◈',
    link: 'https://github.com/SharonElimelech/math-tutor-app',
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
          {arsenalCards.map((card, i) => {
            // ponytail: typed as 'a' so the link props type-check; a private project renders as a plain div
            const Card = (card.link ? 'a' : 'div') as 'a';
            return (
            <Card
              key={card.title}
              href={card.link}
              target={card.link ? '_blank' : undefined}
              rel={card.link ? 'noreferrer' : undefined}
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
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
