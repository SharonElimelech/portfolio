import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import InteractiveParticles from '../components/InteractiveParticles';
import { useIsMobile } from '../hooks/use-mobile';

// ── Three.js shaders ──

const SAKURA_VERTEX_SHADER = `
  attribute float alpha;
  attribute float size;
  attribute vec3 color;
  varying float vAlpha;
  varying vec3 vColor;
  uniform float uTime;
  
  void main() {
    vAlpha = alpha;
    vColor = color;
    vec3 pos = position;
    pos.x += sin(uTime * 0.5 + position.y * 0.1) * 0.5;
    pos.y -= mod(uTime * 0.3 + position.z * 0.05, 30.0);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SAKURA_FRAGMENT_SHADER = `
  varying float vAlpha;
  varying vec3 vColor;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float petalShape = smoothstep(0.5, 0.1, dist);
    float highlight = smoothstep(0.3, 0.0, dist) * 0.5;
    gl_FragColor = vec4(vColor + highlight, vAlpha * petalShape);
  }
`;

function createSakuraSystem(scene: THREE.Scene, count: number, colors: number[][]) {
  const positions = new Float32Array(count * 3);
  const alphas = new Float32Array(count);
  const sizes = new Float32Array(count);
  const colorArray = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    alphas[i] = 0.3 + Math.random() * 0.7;
    sizes[i] = 3 + Math.random() * 8;
    const c = colors[Math.floor(Math.random() * colors.length)];
    colorArray[i * 3] = c[0];
    colorArray[i * 3 + 1] = c[1];
    colorArray[i * 3 + 2] = c[2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const material = new THREE.ShaderMaterial({
    vertexShader: SAKURA_VERTEX_SHADER,
    fragmentShader: SAKURA_FRAGMENT_SHADER,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return { points, material };
}

// ── Main component ──

export default function HeroSection() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  // ── Mouse tracking for 3D tilt ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-smoothed mouse values for organic feel
  const springConfig = { stiffness: 50, damping: 20, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Typography 3D tilt: subtle rotateX/Y based on mouse
  const typoRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [2, -2]);
  const typoRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-3, 3]);

  // Cards 3D tilt: slightly stronger than text
  const cardsRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [3, -3]);
  const cardsRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-4, 4]);

  // Samurai subtle mouse parallax (translate, not rotate)
  const samuraiMoveX = useTransform(smoothMouseX, [-0.5, 0.5], [12, -12]);
  const samuraiMoveY = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);

  // ── Scroll-linked parallax ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const particleY = useTransform(scrollYProgress, [0, 1], [0, 200], { ease: (t: number) => t });
  const typographyY = useTransform(scrollYProgress, [0, 1], [0, 500], { ease: (t: number) => t });
  const samuraiY = useTransform(scrollYProgress, [0, 1], [0, 100], { ease: (t: number) => t });
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, 400], { ease: (t: number) => t });
  const cardsOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [1, 1, 0], { ease: (t: number) => t });

  // ── Global mouse listener for 3D tilt ──
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // Normalize to -0.5..0.5
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [mouseX, mouseY]);

  // ── Three.js sakura background ──
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x050505, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const crimsonSakura = createSakuraSystem(scene, 200, [
      [1.0, 0.16, 0.16],
      [0.9, 0.5, 0.5],
      [1.0, 0.6, 0.6],
    ]);

    const silverSakura = createSakuraSystem(scene, 100, [
      [0.9, 0.9, 0.9],
      [0.7, 0.7, 0.8],
      [1.0, 1.0, 1.0],
    ]);

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const spot1 = new THREE.SpotLight(0xFF2A2A, 500);
    spot1.position.set(10, 40, 20);
    scene.add(spot1);
    const spot2 = new THREE.SpotLight(0x550000, 500);
    spot2.position.set(-20, 10, 20);
    scene.add(spot2);

    let camMouseX = 0;
    let camMouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      camMouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      camMouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    };
    document.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      crimsonSakura.material.uniforms.uTime.value = elapsed;
      silverSakura.material.uniforms.uTime.value = elapsed * 0.7;

      camera.position.x += (camMouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (-camMouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

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
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (canvasRef.current?.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── GSAP entrance animations ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.8 });

      tl.fromTo(
        '.hero-title-line',
        { y: 120, opacity: 0, skewY: 7 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.2, ease: 'cubic-bezier(0.16, 1, 0.3, 1)', stagger: 0.15 }
      )
        .fromTo(
          '.hero-subtitle',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          '-=0.5'
        )
        .fromTo(
          '.hero-pill',
          { y: 20, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)', stagger: 0.1 },
          '-=0.4'
        )
        .fromTo(
          '.hero-stat-card',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)', stagger: 0.1 },
          '-=0.3'
        )
        .fromTo(
          '.hero-samurai',
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 1.4, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          '-=1.2'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen overflow-x-clip"
      style={{ background: '#050505', perspective: '1200px' }}
    >
      {/* ═══ LAYER 0 — Three.js Sakura Background (z-0) ═══ */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          pointerEvents: 'none',
          y: particleY,
          willChange: 'transform',
        }}
      >
        <div ref={canvasRef} className="absolute inset-0" />
      </motion.div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, #050505 70%)',
        }}
      />

      {/* ═══ LAYER 1.5 — Interactive 2D Particles (z-[2]) ═══ */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <InteractiveParticles className="absolute inset-0" />
      </div>

      {/* ═══ LAYER 2 — Typography + Content (z-10) with 3D tilt ═══ */}
      <motion.div
        className="relative z-10 w-full min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-24 max-w-[1920px] mx-auto"
        style={{
          y: typographyY,
          rotateX: typoRotateX,
          rotateY: typoRotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Japanese vertical text - decorative */}
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden lg:block z-[2]">
          <span className="font-syncopate text-crimson/20 text-6xl tracking-[0.5em]" style={{ writingMode: 'vertical-rl' }}>
            サムライ
          </span>
        </div>

        {/* Main Title Block */}
        <div className="max-w-5xl">
          {/* Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {['Full-Stack Dev', 'AI Integrations', '3rd-Year CS @ HIT'].map((pill) => (
              <span
                key={pill}
                className="hero-pill px-4 py-1.5 border border-crimson/40 text-crimson font-mono text-[10px] tracking-[0.2em] uppercase bg-crimson/5"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* ── SHARON ── */}
          <div className="overflow-hidden">
            <h1
              className="hero-title-line font-syncopate leading-[0.9] tracking-[-0.02em] text-ghost"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 7.5rem)',
                WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
                textShadow: '0 0 60px rgba(255, 42, 42, 0.15)',
              }}
            >
              SHARON
            </h1>
          </div>

          {/* ── ELIMELECH ── */}
          <div className="overflow-hidden" style={{ marginLeft: 'clamp(0.75rem, 5vw, 6rem)' }}>
            <h1
              className="hero-title-line font-syncopate leading-[0.9] tracking-[-0.02em]"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 7.5rem)',
                color: 'transparent',
                WebkitTextStroke: '2px #FF2A2A',
                textShadow: '0 0 40px rgba(255, 42, 42, 0.3)',
              }}
            >
              ELIMELECH
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mt-8 ml-1">
            <p className="hero-subtitle font-oswald text-lg md:text-xl tracking-[0.3em] text-crimson uppercase">
              Full-Stack Developer &amp; CS Student @ HIT
            </p>
            <p className="hero-subtitle font-space text-sm md:text-base text-ash mt-3 max-w-lg leading-relaxed">
              Building full-stack web apps with React, TypeScript and Node.js,
              and wiring in AI through the OpenAI API. Clean code, real products,
              shipped with precision and discipline.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══ LAYER 3 — Samurai Figure (z-20, foreground) with breathing + parallax ═══ */}
      <motion.div
        className="hero-samurai absolute bottom-0 right-0 z-20 pointer-events-none
                   w-auto max-w-[50vw] max-h-screen
                   max-md:max-w-[70vw] max-md:opacity-25"
        style={{
          y: samuraiY,
          x: samuraiMoveX,
          maxWidth: 'min(50vw, 800px)',
          willChange: 'transform',
        }}
        animate={{
          translateY: [0, -6, 0, -3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.3, 0.5, 0.75, 1],
        }}
      >
        <motion.div
          className="w-full h-full"
          style={{
            y: samuraiMoveY,
          }}
        >
          <img
            src="/images/hero-ronin.png"
            alt=""
            className="h-screen w-auto object-contain object-bottom"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ═══ Info Cards — Bottom strip (z-30) with 3D tilt ═══ */}
      {/* On mobile the cards flow in-document (relative) so they never overlap
          the centered title/subtitle; on md+ they overlay the hero bottom. */}
      <motion.div
        className="relative md:absolute md:bottom-12 md:left-16 lg:left-24 md:right-16 lg:right-24 z-30 max-w-[1920px] mx-auto px-6 md:px-0 mt-12 pb-12 md:mt-0 md:pb-0"
        style={{
          y: isMobile ? undefined : cardsY,
          opacity: isMobile ? undefined : cardsOpacity,
          rotateX: isMobile ? undefined : cardsRotateX,
          rotateY: isMobile ? undefined : cardsRotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Tech Stack', value: 'React · TypeScript · Node', icon: '◈' },
            { label: 'Focus', value: 'OpenAI API', icon: '◉' },
            { label: 'Status', value: '3rd-Year @ HIT', icon: '◆' },
            { label: 'Based In', value: 'Israel', icon: '◇' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="hero-stat-card glass-panel p-4 md:p-5 group transition-colors duration-300"
              data-cursor-hover
              whileHover={{
                y: -4,
                scale: 1.02,
                boxShadow: '0 10px 30px rgba(255, 0, 0, 0.15)',
                borderColor: 'rgba(255, 42, 42, 0.4)',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-crimson text-xs">{stat.icon}</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-ash uppercase">
                  {stat.label}
                </span>
              </div>
              <p className="font-oswald text-sm md:text-base text-ghost tracking-wide group-hover:text-crimson transition-colors duration-300">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-[35] pointer-events-none"
        style={{ background: 'linear-gradient(to top, #050505 0%, transparent 100%)' }}
      />
    </section>
  );
}
