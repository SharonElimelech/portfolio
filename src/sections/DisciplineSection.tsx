import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FeatureNode {
  title: string;
  description: string;
  icon: string;
}

const features: FeatureNode[] = [
  {
    title: 'Frontend',
    description: 'React, Next.js, TypeScript, Tailwind CSS, shadcn/ui and Vite — responsive, typed, component-driven interfaces.',
    icon: '◈',
  },
  {
    title: 'Backend',
    description: 'Node.js and Express — REST APIs, webhooks and SQL databases built to stay clean as they scale.',
    icon: '◉',
  },
  {
    title: 'AI Integration',
    description: 'LLM API integration with OpenAI and Claude — tool-calling, knowledge-base constraints and production bots.',
    icon: '◆',
  },
  {
    title: 'Foundations',
    description: 'JavaScript, Python, C++ and SQL — Data Structures & Algorithms, OOP and databases from CS at HIT.',
    icon: '◇',
  },
];

export default function DisciplineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  // Three.js orbital rings
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
    const geometry2 = new THREE.TorusGeometry(5, 0.02, 16, 100);
    const geometry3 = new THREE.TorusGeometry(6.5, 0.02, 16, 100);

    const material = new THREE.MeshBasicMaterial({ color: 0xFF2A2A, transparent: true, opacity: 0.6, wireframe: true });
    const material2 = new THREE.MeshBasicMaterial({ color: 0x550000, transparent: true, opacity: 0.4, wireframe: true });
    const material3 = new THREE.MeshBasicMaterial({ color: 0xaa0000, transparent: true, opacity: 0.2, wireframe: true });

    const ring1 = new THREE.Mesh(geometry, material);
    const ring2 = new THREE.Mesh(geometry2, material2);
    const ring3 = new THREE.Mesh(geometry3, material3);

    ring1.rotation.x = Math.PI * 0.35;
    ring1.rotation.y = Math.PI * 0.25;
    ring2.rotation.x = Math.PI * 0.35;
    ring2.rotation.y = Math.PI * 0.25;
    ring3.rotation.x = Math.PI * 0.35;
    ring3.rotation.y = Math.PI * 0.25;

    const group = new THREE.Group();
    group.add(ring1);
    group.add(ring2);
    group.add(ring3);
    scene.add(group);

    // Scroll-driven animation
    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const normalizedVelocity = (Math.abs(velocity) / 2000) * 0.5;
        group.rotation.z += 0.002 + normalizedVelocity;
        group.rotation.x += 0.001 - normalizedVelocity * 0.2;
      },
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        scrub: 1,
        start: 'top center',
        end: 'bottom top',
      },
    })
      .to(group.rotation, { x: Math.PI / 2, y: 0, z: 0, ease: 'none' })
      .to(group.rotation, { x: -Math.PI / 2, y: 0, z: 0, ease: 'none' })
      .to(camera.position, { y: -8, ease: 'none' }, '<');

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.005;
      ring3.rotation.z += 0.003;
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      scrollTrigger.kill();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (canvasRef.current?.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Node entrance animations
  useEffect(() => {
    if (!nodesRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.discipline-watermark',
        { opacity: 0, x: -50 },
        {
          opacity: 0.03,
          x: 0,
          duration: 1.5,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.discipline-title',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.discipline-desc',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.feature-node',
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          stagger: 0.15,
          scrollTrigger: {
            trigger: nodesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.about-image',
        { x: -80, opacity: 0 },
        {
          x: 0,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="discipline"
      ref={sectionRef}
      className="relative w-full py-32 md:py-48 overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Three.js Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* Watermark */}
      <div
        className="discipline-watermark absolute top-1/2 left-0 -translate-y-1/2 font-syncopate text-[18vw] leading-none tracking-[-0.02em] text-ghost pointer-events-none select-none whitespace-nowrap"
        style={{ opacity: 0.03 }}
      >
        ARCHITECTURE
      </div>

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24">
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-4">
          <span className="w-2 h-2 rounded-full bg-crimson mt-2 animate-glow-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-crimson uppercase">
            The Craftsmanship
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          {/* Left: Image */}
          <div className="about-image relative">
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img
                src="/images/about-samurai.png"
                alt="Cyber Samurai"
                className="w-full h-full object-cover"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                }}
              />
              {/* Overlay gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 42, 42, 0.1) 0%, transparent 50%)',
                }}
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-crimson/20" />
            <div className="absolute -top-4 -left-4 w-16 h-16 border border-crimson/10" />
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center">
            <h2 className="discipline-title font-oswald text-4xl md:text-5xl lg:text-6xl text-ghost leading-[1.1] mb-6">
              Merging{' '}
              <span className="text-crimson">clean code</span> with practical{' '}
              <span className="text-crimson">AI</span>.
            </h2>
            <p className="discipline-desc font-space text-ash text-base md:text-lg leading-relaxed max-w-lg">
              Third-year Computer Science student at HIT, focused on full-stack web
              development — React and TypeScript on the front, Node.js and Express
              behind it, with LLM APIs wired into real products. Discipline,
              accountability and performance under pressure, carried over from
              service in Shayetet 13.
            </p>
          </div>
        </div>

        {/* Feature Nodes */}
        <div ref={nodesRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="feature-node glass-panel p-8 group hover:border-crimson/30 transition-all duration-500 relative overflow-hidden"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255, 42, 42, 0.08) 0%, transparent 70%)',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-crimson text-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-crimson/30 to-transparent" />
                </div>

                <h3 className="font-oswald text-xl md:text-2xl text-ghost mb-3 tracking-wide group-hover:text-crimson transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="font-space text-sm text-ash leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson/50 group-hover:bg-crimson transition-colors duration-300" />
                  <span className="font-mono text-[9px] tracking-[0.2em] text-ash/60 uppercase">
                    System Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top/bottom fades */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[5]"
        style={{ background: 'linear-gradient(to bottom, #050505 0%, transparent 100%)' }}
      />
    </section>
  );
}
