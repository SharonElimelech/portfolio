import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

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

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

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

    // Crimson + Silver + White sakura petals
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

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    };
    document.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      crimsonSakura.material.uniforms.uTime.value = elapsed;
      silverSakura.material.uniforms.uTime.value = elapsed * 0.7;

      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
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

  // Text entrance animation
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
        );
    }, textRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Three.js Canvas Background - z-0 */}
      <div
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, #050505 70%)',
        }}
      />

      {/* Main content wrapper - z-10 */}
      <div ref={textRef} className="relative z-10 w-full min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-24">
        {/* Japanese vertical text - decorative */}
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden lg:block">
          <span className="font-syncopate text-crimson/20 text-6xl tracking-[0.5em]" style={{ writingMode: 'vertical-rl' }}>
            サムライ
          </span>
        </div>

        {/* Main Title Block */}
        <div className="max-w-5xl">
          {/* Pills */}
          <div ref={pillsRef} className="flex flex-wrap gap-3 mb-8">
            {['Fullstack Dev', 'AI Specialist', 'CS Student'].map((pill) => (
              <span
                key={pill}
                className="hero-pill px-4 py-1.5 border border-crimson/40 text-crimson font-mono text-[10px] tracking-[0.2em] uppercase bg-crimson/5"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* SHARON */}
          <div className="overflow-hidden">
            <h1
              className="hero-title-line font-syncopate text-[12vw] md:text-[10vw] lg:text-[9vw] leading-[0.9] tracking-[-0.02em] text-ghost"
              style={{
                WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
                textShadow: '0 0 60px rgba(255, 42, 42, 0.15)',
              }}
            >
              SHARON
            </h1>
          </div>

          {/* ELIMELECH - offset right */}
          <div className="overflow-hidden ml-[5vw] md:ml-[8vw]">
            <h1
              className="hero-title-line font-syncopate text-[12vw] md:text-[10vw] lg:text-[9vw] leading-[0.9] tracking-[-0.02em]"
              style={{
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
              Fullstack Developer & CS Student
            </p>
            <p className="hero-subtitle font-space text-sm md:text-base text-ash mt-3 max-w-lg leading-relaxed">
              Merging the aesthetics of clean code with futuristic AI technology.
              Building high-performance web architectures with precision and discipline.
            </p>
          </div>
        </div>

        {/* Stats Bento Strip */}
        <div
          ref={statsRef}
          className="absolute bottom-8 md:bottom-12 left-6 md:left-16 lg:left-24 right-6 md:right-16 lg:right-24"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Tech Stack', value: 'Next.js · Python · Node', icon: '◈' },
              { label: 'Focus', value: 'AI Integration', icon: '◉' },
              { label: 'Status', value: 'CS Student', icon: '◆' },
              { label: 'Experience', value: 'Fullstack Dev', icon: '◇' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="hero-stat-card glass-panel p-4 md:p-5 group hover:border-crimson/30 transition-all duration-500"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Hero Ronin Image */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] md:w-[40%] z-[5] pointer-events-none hidden lg:block">
        <img
          src="/images/hero-ronin.png"
          alt=""
          className="w-full h-full object-cover object-top"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
            opacity: 0.85,
          }}
        />
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-[8] pointer-events-none"
        style={{ background: 'linear-gradient(to top, #050505 0%, transparent 100%)' }}
      />
    </section>
  );
}
