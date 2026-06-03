import { useEffect, useRef, useCallback } from 'react';

// ── Particle type ──
interface Particle {
  x: number;
  y: number;
  z: number; // 0 = far, 1 = near — controls size, speed, opacity, blur
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  phase: number; // unique offset for drift
  driftSpeed: number;
}

const COLORS = [
  // Crimson / red family
  'rgba(255, 42, 42, ALPHA)',
  'rgba(255, 80, 80, ALPHA)',
  'rgba(200, 30, 30, ALPHA)',
  // Silver / white family
  'rgba(255, 255, 255, ALPHA)',
  'rgba(200, 200, 220, ALPHA)',
  'rgba(170, 170, 190, ALPHA)',
];

function createParticle(w: number, h: number): Particle {
  const z = Math.random(); // depth: 0 far → 1 near
  const x = Math.random() * w;
  const y = Math.random() * h;
  const colorTemplate = COLORS[Math.floor(Math.random() * COLORS.length)];
  // Deeper particles = dimmer, smaller
  const alpha = 0.15 + z * 0.6;
  const size = 1 + z * 4;

  return {
    x,
    y,
    z,
    baseX: x,
    baseY: y,
    vx: 0,
    vy: 0,
    size,
    color: colorTemplate.replace('ALPHA', alpha.toFixed(2)),
    alpha,
    phase: Math.random() * Math.PI * 2,
    driftSpeed: 0.2 + Math.random() * 0.6,
  };
}

interface Props {
  className?: string;
}

export default function InteractiveParticles({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0, active: false });
  const rafId = useRef(0);
  const dims = useRef({ w: 0, h: 0 });

  const PARTICLE_COUNT = 120;

  // ── Initialize particles ──
  const initParticles = useCallback((w: number, h: number) => {
    particles.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.current.push(createParticle(w, h));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // ── Sizing ──
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.parentElement?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight };
      dims.current.w = rect.width;
      dims.current.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onMouseLeave = () => {
      mouse.current.active = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // ── Animation loop ──
    let time = 0;

    const draw = () => {
      const { w, h } = dims.current;
      time += 0.016; // ~60fps timestep

      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const p of particles.current) {
        // ── Continuous floating drift ──
        const driftX = Math.sin(time * p.driftSpeed + p.phase) * (8 + p.z * 12);
        const driftY = Math.cos(time * p.driftSpeed * 0.7 + p.phase * 1.3) * (6 + p.z * 8);

        // ── Mouse parallax: particles shift opposite to cursor, deeper ones shift less ──
        let mouseOffsetX = 0;
        let mouseOffsetY = 0;
        if (mouse.current.active) {
          // Normalized mouse: -1 to 1 from center
          const nMx = (mx / w - 0.5) * 2;
          const nMy = (my / h - 0.5) * 2;
          // Deeper (lower z) = less shift. Near (higher z) = more shift.
          const strength = 15 + p.z * 35;
          mouseOffsetX = -nMx * strength;
          mouseOffsetY = -nMy * strength;
        }

        // ── Mouse repulsion: nearby particles push away ──
        let repelX = 0;
        let repelY = 0;
        if (mouse.current.active) {
          const dx = p.baseX + driftX + mouseOffsetX - mx;
          const dy = p.baseY + driftY + mouseOffsetY - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 120 + p.z * 60;
          if (dist < repelRadius && dist > 0) {
            const force = (1 - dist / repelRadius) * (8 + p.z * 16);
            repelX = (dx / dist) * force;
            repelY = (dy / dist) * force;
          }
        }

        // Final position with spring-like smoothing
        const targetX = p.baseX + driftX + mouseOffsetX + repelX;
        const targetY = p.baseY + driftY + mouseOffsetY + repelY;
        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;

        // ── Draw glow dot ──
        const radius = p.size;

        // Far particles get blur via larger softer glow
        if (p.z < 0.3) {
          // Deep background: soft, blurred glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, radius * 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.z < 0.65) {
          // Mid-depth: moderate glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.5);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.5, p.color.replace(/[\d.]+\)$/, `${p.alpha * 0.3})`));
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Near: sharp bright dot with tight glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 1.8);
          grad.addColorStop(0, p.color.replace(/[\d.]+\)$/, `${Math.min(1, p.alpha * 1.4)})`));
          grad.addColorStop(0.4, p.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
