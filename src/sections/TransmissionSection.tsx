import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const METRICS = [
  { label: 'Commits', value: 180, suffix: '+', chart: 'line' },
  { label: 'Frameworks', value: 12, suffix: '', chart: 'bar' },
  { label: 'Projects', value: 25, suffix: '+', chart: 'area' },
];

function MiniChart({ type, active }: { type: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    let progress = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      progress = Math.min(progress + 0.02, 1);

      if (type === 'line') {
        ctx.beginPath();
        ctx.strokeStyle = '#FF2A2A';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < w * progress; x++) {
          const y = h / 2 + Math.sin(x * 0.05) * 15 * Math.sin(x * 0.02);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Data points
        for (let x = 0; x < w * progress; x += 30) {
          const y = h / 2 + Math.sin(x * 0.05) * 15 * Math.sin(x * 0.02);
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FF2A2A';
          ctx.fill();
        }
      } else if (type === 'bar') {
        const barCount = 8;
        const barW = (w / barCount) - 4;
        for (let i = 0; i < barCount * progress; i++) {
          const barH = 10 + Math.random() * (h - 20);
          const x = i * (w / barCount) + 2;
          const y = h - barH;
          ctx.fillStyle = `rgba(255, 42, 42, ${0.3 + (i / barCount) * 0.7})`;
          ctx.fillRect(x, y, barW, barH);
        }
      } else if (type === 'area') {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 42, 42, 0.15)';
        for (let x = 0; x < w * progress; x++) {
          const y = h - 10 - Math.abs(Math.sin(x * 0.03)) * (h - 20);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(w * progress, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#FF2A2A';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < w * progress; x++) {
          const y = h - 10 - Math.abs(Math.sin(x * 0.03)) * (h - 20);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [type, active]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className="w-full h-14 mt-2"
    />
  );
}

export default function TransmissionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hologramRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>(METRICS.map(() => 0));
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hologram entrance
      gsap.fromTo(
        hologramRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Metrics entrance
      gsap.fromTo(
        '.metric-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.metrics-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            // Animate count-up
            METRICS.forEach((metric, i) => {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: metric.value,
                duration: 2,
                delay: i * 0.2,
                ease: 'power2.out',
                onUpdate: () => {
                  setCounts((prev) => {
                    const next = [...prev];
                    next[i] = Math.round(obj.val);
                    return next;
                  });
                },
              });
            });
          },
        }
      );

      // CTA entrance
      gsap.fromTo(
        '.cta-block',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: '.cta-block',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="transmission"
      ref={sectionRef}
      className="relative w-full py-32 md:py-48 overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 42, 42, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24">
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-4">
          <span className="w-2 h-2 rounded-full bg-crimson mt-2 animate-glow-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-crimson uppercase">
            Contact
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          {/* Left: Metrics Dashboard */}
          <div>
            <h2 className="font-oswald text-4xl md:text-5xl text-ghost mb-4">
              Stats Defining<br />
              <span className="text-crimson">the Developer</span>
            </h2>
            <p className="font-space text-ash text-sm mb-10 max-w-md">
              Every metric is a testament to dedication, precision, and relentless pursuit of excellence.
            </p>

            <div className="metrics-grid space-y-4">
              {METRICS.map((metric, i) => (
                <div
                  key={metric.label}
                  className="metric-card glass-panel p-5 flex items-center gap-6 group hover:border-crimson/30 transition-all duration-500"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  onMouseEnter={() => setHoveredMetric(i)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[9px] tracking-[0.2em] text-ash/50 uppercase">
                        {metric.label}
                      </span>
                    </div>
                    <div className="font-oswald text-3xl md:text-4xl text-ghost group-hover:text-crimson transition-colors duration-300">
                      {counts[i]}{metric.suffix}
                    </div>
                    <MiniChart type={metric.chart} active={hoveredMetric === i} />
                  </div>
                  <div className="w-12 h-12 border border-crimson/20 flex items-center justify-center group-hover:border-crimson/50 transition-colors duration-300">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-crimson">
                      <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" fill="currentColor" opacity="0.6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Holographic Transmission */}
          <div className="flex items-center justify-center">
            <div
              ref={hologramRef}
              className="relative w-full max-w-[500px]"
              style={{ aspectRatio: '16/9' }}
            >
              {/* Holographic terminal */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  background: '#050505',
                  border: '1px solid rgba(255, 42, 42, 0.3)',
                  maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                }}
              >
                {/* Rotating conic gradient border */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    padding: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'conic-gradient(from var(--r), transparent 0%, #FF2A2A 10%, transparent 20%)',
                      animation: 'rotate 4s linear infinite',
                      zIndex: -1,
                    }}
                  />
                </div>

                {/* Video/Image area with screen blend */}
                <div className="relative w-full h-full p-4">
                  <div
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #111 0%, #0A0A0A 100%)',
                    }}
                  >
                    {/* Simulated code environment */}
                    <div className="absolute inset-0 p-6 font-mono text-[10px] leading-relaxed overflow-hidden" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                      <div className="text-crimson mb-2">{'>'} ssh sharon@dev-terminal</div>
                      <div className="text-ash mb-1">Connected to development environment...</div>
                      <div className="text-ash mb-4">Authentication verified. Welcome, Sharon.</div>
                      <div className="text-crimson/60">$ ls -la /projects</div>
                      <div className="text-ghost/40 ml-4">drwxr-xr-x  ai-integration/</div>
                      <div className="text-ghost/40 ml-4">drwxr-xr-x  nextjs-architecture/</div>
                      <div className="text-ghost/40 ml-4">drwxr-xr-x  python-backend/</div>
                      <div className="text-ghost/40 ml-4">drwxr-xr-x  webgl-experiments/</div>
                      <div className="mt-4 text-crimson/60">$ cat mission.txt</div>
                      <div className="text-ghost/50 ml-4 mt-2 max-w-xs">
                        Building the future, one commit at a time.
                        Precision. Discipline. Excellence.
                      </div>
                      <div className="mt-4 text-crimson animate-pulse">_</div>
                    </div>

                    {/* Scanlines overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0, 0, 0, 0.4) 3px)',
                      }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-crimson/40" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-crimson/40" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-crimson/40" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-crimson/40" />
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div
                className="absolute -inset-4 pointer-events-none -z-10"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255, 42, 42, 0.08) 0%, transparent 60%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* CTA Block */}
        <div className="cta-block text-center">
          <div className="inline-block">
            <p className="font-space text-ash text-sm mb-8">
              Ready to build something extraordinary?
            </p>
            <a
              href="mailto:sharon@example.com"
              className="group relative inline-flex items-center gap-4 px-12 py-5 border border-crimson text-crimson font-oswald text-xl tracking-[0.2em] uppercase overflow-hidden transition-all duration-0 hover:text-black"
              data-cursor-hover
              style={{
                transitionDuration: '0s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = '#FF2A2A';
                el.style.boxShadow = '0 0 40px rgba(255, 42, 42, 0.5), 0 0 80px rgba(255, 42, 42, 0.2)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.boxShadow = 'none';
              }}
            >
              <span className="relative z-10">INITIATE_CONNECTION</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </div>

          {/* Footer credits */}
          <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M16 0L20 12L32 16L20 20L16 32L12 20L0 16L12 12L16 0Z" fill="#FF2A2A" opacity="0.6" />
              </svg>
              <span className="font-mono text-[9px] tracking-[0.2em] text-ash/40 uppercase">
                Sharon Elimelech © 2025
              </span>
            </div>
            <div className="flex items-center gap-6">
              {['GitHub', 'LinkedIn', 'Twitter'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-mono text-[9px] tracking-[0.2em] text-ash/40 uppercase hover:text-crimson transition-colors duration-300"
                  data-cursor-hover
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top fade from previous section */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[5]"
        style={{ background: 'linear-gradient(to bottom, #050505 0%, transparent 100%)' }}
      />
    </section>
  );
}
