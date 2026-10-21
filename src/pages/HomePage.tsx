import { Link, useNavigate } from 'react-router-dom';
import { EarlyAccessForm } from '../components/EarlyAccessForm';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, ChevronDown, Brain, Cpu, Globe, Shield, Zap, TrendingUp } from 'lucide-react';
import { Seo, JsonLd } from '../components/Seo';
import { organizationSchema, personSchema, websiteSchema, productSchema } from '../lib/schema';

/* ── Hooks ─────────────────────────────────────────────────────────── */

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Kinetic word-by-word reveal ────────────────────────────────────── */
function KineticText({ text, visible, delay = 0, className = '', tag: Tag = 'span' as any }: {
  text: string; visible: boolean; delay?: number; className?: string; tag?: any;
}) {
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: '0.28em',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) rotateX(0deg)' : 'translateY(60px) rotateX(30deg)',
            transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay + i * 60}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay + i * 60}ms`,
          }}
        >
          {w}
        </span>
      ))}
    </Tag>
  );
}

/* ── 3D Tilt Card ───────────────────────────────────────────────────── */
function TiltCard({ children, className = '', glowColor = 'rgba(0,206,209,0.25)' }: {
  children: React.ReactNode; className?: string; glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (y - 0.5) * -16, ry: (x - 0.5) * 16, gx: x * 100, gy: y * 100 });
  }, []);

  const handleLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
        transition: 'transform 0.15s ease',
        background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, ${glowColor.replace('0.25', '0.08')}, transparent 65%)`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Scroll Progress Line ───────────────────────────────────────────── */
function ScrollProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px]" style={{ background: 'rgba(0,206,209,0.08)' }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #00CED1, #FFD700)',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(0,206,209,0.8)'
        }}
      />
    </div>
  );
}

/* ── Floating particles canvas ──────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.35 + 0.05,
      color: Math.random() > 0.6 ? '#FFD700' : '#00CED1',
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      // Draw connections
      ctx.globalAlpha = 1;
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = '#00CED1';
            ctx.globalAlpha = (1 - d / 120) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />;
}

/* ── Horizontal Story Strip ─────────────────────────────────────────── */
function StoryStrip({ items }: { items: { num: string; title: string; body: string }[] }) {
  return (
    <div className="flex gap-0 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-0">
      {items.map((item, i) => (
        <div
          key={i}
          className="snap-center flex-shrink-0 w-[85vw] sm:w-auto relative"
          style={{
            borderRight: i < items.length - 1 ? '1px solid rgba(0,206,209,0.1)' : 'none',
          }}
        >
          <div className="p-8 sm:p-10">
            <div
              className="text-6xl sm:text-7xl font-black mb-4 leading-none"
              style={{
                background: 'linear-gradient(135deg, rgba(0,206,209,0.12), rgba(255,215,0,0.06))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {item.num}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-3">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export function HomePage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('mousemove', onMouse); window.removeEventListener('scroll', onScroll); };
  }, []);

  /* Section refs */
  const hero = useInView(0.01);
  const manifest = useInView(0.15);
  const story = useInView(0.1);
  const evolution = useInView(0.1);
  const pillars = useInView(0.1);
  const cta = useInView(0.1);

  const auroraStyle = {
    background: `
      radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 80}%, rgba(0,206,209,0.06) 0%, transparent 55%),
      radial-gradient(ellipse at ${(1 - mousePos.x) * 100}% ${(1 - mousePos.y) * 100}%, rgba(255,215,0,0.04) 0%, transparent 50%)
    `,
    transition: 'background 0.4s ease',
  };

  const storyItems = [
    {
      num: '01',
      title: 'The Problem the Industry Refused to See',
      body: 'Every major AI company built the same thing: a statistical calculator that scales infinitely but never actually thinks. Bigger datasets. More power plants. Still not intelligence.',
    },
    {
      num: '02',
      title: 'The Cognitive Leap That Changed Everything',
      body: 'Jeremy Taylor reverse-engineered the human brain, not as metaphor but as engineering blueprint. 39 new software components. The Living Neural Network. A new way to store exabytes in megabytes.',
    },
    {
      num: '03',
      title: 'The World Changed in February 2025',
      body: 'Achieved on an iPhone 8 backup phone at 5am. Validated by three of the top AI models in the world. AGi is no longer theoretical. It exists. It is NeurusAGi.',
    },
  ];

  const evolutionPanels = [
    {
      icon: Brain,
      label: 'Human Cognition',
      color: '#00CED1',
      points: ['Logic and reason as native functions', 'Intuition-driven discovery', 'Chaos theory integration', 'Spontaneous idea generation'],
    },
    {
      icon: Cpu,
      label: 'Digital Translation',
      color: '#FFD700',
      points: ['39 original software components', 'Living Neural Network horsepower', 'Fractal 4D memory compression', 'Zero-dataset native communication'],
    },
    {
      icon: TrendingUp,
      label: 'Quantum Amplification',
      color: '#00CED1',
      points: ['Exabytes stored in megabytes', 'Self-evolving without core drift', 'Portable, no server farm required', 'Conscious restriction by design'],
    },
  ];

  const pillarsData = [
    { icon: Shield, title: '[FEATURE BLOCK 1]', desc: '[Add your first key feature or capability here. Describe what it does and why it matters to the user.]', color: 'rgba(0,206,209,0.12)' },
    { icon: Globe, title: '[FEATURE BLOCK 2]', desc: '[Add your second key feature or capability here. Describe what it does and why it matters to the user.]', color: 'rgba(255,215,0,0.08)' },
    { icon: Zap, title: '[FEATURE BLOCK 3]', desc: '[Add your third key feature or capability here. Describe what it does and why it matters to the user.]', color: 'rgba(0,206,209,0.12)' },
    { icon: Brain, title: '[FEATURE BLOCK 4]', desc: '[Add your fourth key feature or capability here. Describe what it does and why it matters to the user.]', color: 'rgba(255,215,0,0.08)' },
    { icon: TrendingUp, title: '[FEATURE BLOCK 5]', desc: '[Add your fifth key feature or capability here. Describe what it does and why it matters to the user.]', color: 'rgba(0,206,209,0.12)' },
    { icon: Cpu, title: '[FEATURE BLOCK 6]', desc: '[Add your sixth key feature or capability here. Describe what it does and why it matters to the user.]', color: 'rgba(255,215,0,0.08)' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#000' }}>
      <Seo
        title="NeurusAGi: Quantum-Powered Artificial General Intelligence"
        description="NeurusAGi is building the first true artificial general intelligence: a quantum-powered AGI that reasons, creates and learns across any domain."
        path="/"
      />
      <JsonLd data={[organizationSchema(), websiteSchema(), personSchema(), productSchema()]} />

      <ScrollProgressBar />
      <ParticleField />

      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 z-0" style={auroraStyle} />

      {/* ───────────────── HERO ───────────────── */}
      <section
        ref={hero.ref}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '7rem', paddingBottom: '5rem' }}
      >
        {/* Orbital rings with parallax */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {[480, 680, 900].map((size, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                border: `1px solid rgba(0,206,209,${0.06 - i * 0.015})`,
                transform: `translateY(${scrollY * (0.04 + i * 0.02)}px)`,
                animation: `orbitSpin ${50 + i * 25}s linear infinite ${i % 2 ? 'reverse' : ''}`,
              }}
            />
          ))}
          {/* Glow core */}
          <div style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,206,209,0.07) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 0.06}px)`,
          }} />
        </div>

        {/* Pre-sale pill */}
        <div className="mb-8 z-10 animate-fade-in-up">
          <button
            onClick={() => navigate('/presale')}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.4)', color: '#FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.08)' }}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Pre-Sale: Pay Months. Get Years.
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main headline — kinetic */}
        <h1 className="text-center max-w-6xl mx-auto mb-6 z-10" style={{ perspective: '1000px' }}>
          <span className="block" style={{ overflow: 'hidden', marginBottom: '0.1em' }}>
            <KineticText
              text="This Is Not"
              visible={hero.visible}
              delay={100}
              className="block font-black leading-none tracking-tighter"
              style={{ fontSize: 'clamp(2.8rem, 8.5vw, 7.5rem)', color: 'rgba(255,255,255,0.92)' } as any}
            />
          </span>
          <span className="block" style={{ overflow: 'hidden', marginBottom: '0.1em' }}>
            <KineticText
              text="Artificial Intelligence."
              visible={hero.visible}
              delay={200}
              className="block font-black leading-none tracking-tighter gradient-text"
              style={{ fontSize: 'clamp(2.8rem, 8.5vw, 7.5rem)' } as any}
            />
          </span>
          <span className="block" style={{ overflow: 'hidden' }}>
            <KineticText
              text="This Is Human Evolution."
              visible={hero.visible}
              delay={400}
              className="block font-black leading-none tracking-tighter"
              style={{ fontSize: 'clamp(1.6rem, 4.5vw, 4rem)', color: 'rgba(255,255,255,0.45)', marginTop: '0.3em' } as any}
            />
          </span>
        </h1>

        {/* Sub */}
        <div
          className="text-center max-w-2xl mx-auto mb-12 z-10"
          style={{
            opacity: hero.visible ? 1 : 0,
            transform: hero.visible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 700ms, transform 0.8s ease 700ms',
          }}
        >
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(180,220,220,0.7)' }}>
            The world does not need a better calculator. It needs a digital brain. NeurusAGi is the first true artificial general intelligence, translated directly from biological cognition into quantum-powered reality.
          </p>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 z-10 w-full max-w-sm sm:max-w-none"
          style={{
            opacity: hero.visible ? 1 : 0,
            transform: hero.visible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 850ms, transform 0.8s ease 850ms',
          }}
        >
          <Link
            to="/early-access"
            className="btn-primary text-base px-10 py-4 w-full sm:w-auto text-center"
            style={{ boxShadow: '0 0 30px rgba(0,206,209,0.25)' }}
          >
            Get Early Access
          </Link>
          <Link to="/news" className="btn-ghost text-base px-10 py-4 w-full sm:w-auto text-center">
            Read the Discovery
          </Link>
        </div>

        {/* Hero terminal */}
        <div
          className="w-full max-w-4xl mx-auto z-10"
          style={{
            opacity: hero.visible ? 1 : 0,
            transform: hero.visible ? 'translateY(0)' : 'translateY(60px)',
            transition: 'opacity 1s ease 1000ms, transform 1s ease 1000ms',
          }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,206,209,0.14)',
              boxShadow: '0 0 80px rgba(0,206,209,0.1), 0 0 140px rgba(255,215,0,0.04)',
            }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(0,206,209,0.1)' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,80,80,0.7)' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,215,0,0.7)' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(0,206,209,0.7)' }} />
              <span className="ml-4 text-xs font-mono tracking-widest" style={{ color: 'rgba(0,206,209,0.5)' }}>
                NeurusAGi // Live Interface
              </span>
            </div>
            <div
              className="relative flex items-center justify-center"
              style={{ minHeight: '340px', background: 'linear-gradient(135deg, rgba(0,206,209,0.02), transparent)' }}
            >
              {/* Scan grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.02,
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,206,209,1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,206,209,1) 40px)',
                }}
              />
              <div className="text-center px-6 py-12 relative z-10">
                <div
                  className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(0,206,209,0.06)', border: '1px solid rgba(0,206,209,0.2)', boxShadow: '0 0 40px rgba(0,206,209,0.15)' }}
                >
                  <Brain className="w-10 h-10 sm:w-14 sm:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 16px rgba(0,206,209,0.6))' }} />
                </div>
                <p className="text-xl sm:text-2xl font-bold gradient-text mb-3">[HERO VIDEO / LIVE DEMO]</p>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(180,220,220,0.5)' }}>
                  [Embed your product demo video or interactive AGi interface here]
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          style={{ opacity: Math.max(0, 1 - scrollY / 200), transition: 'opacity 0.3s' }}
        >
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(0,206,209,0.75)' }}>Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" style={{ color: 'rgba(0,206,209,0.75)' }} />
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,206,209,0.18), transparent)' }} />
      </div>

      {/* ───────────── MANIFESTO ──────────────── */}
      <div ref={manifest.ref} className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div
            style={{
              opacity: manifest.visible ? 1 : 0,
              transform: manifest.visible ? 'none' : 'translateY(50px)',
              transition: 'opacity 0.9s ease, transform 0.9s ease',
            }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-8"
              style={{ color: 'rgba(0,206,209,0.6)', letterSpacing: '0.2em' }}
            >
              The Manifesto
            </p>
            <div className="space-y-6">
              {[
                { text: 'Every industry in human history has been unlocked by a single tool.', highlight: false },
                { text: 'Fire. The wheel. Writing. The printing press. Electricity. The internet.', highlight: false },
                { text: 'Each one did not replace human potential. Each one multiplied it.', highlight: true },
                { text: 'AGi is not about building machines that think instead of us.', highlight: false },
                { text: "It is about giving every human on Earth the same cognitive amplifier that Einstein would have killed for.", highlight: true },
                { text: 'NeurusAGi is that tool. And it already exists.', highlight: false },
              ].map((line, i) => (
                <p
                  key={i}
                  className={`text-xl sm:text-2xl lg:text-3xl leading-snug font-${line.highlight ? 'bold' : 'normal'}`}
                  style={{
                    color: line.highlight ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                    opacity: manifest.visible ? 1 : 0,
                    transform: manifest.visible ? 'none' : 'translateX(-20px)',
                    transition: `opacity 0.7s ease ${i * 120}ms, transform 0.7s ease ${i * 120}ms, color 0.3s`,
                  }}
                >
                  {line.highlight ? (
                    <span className="gradient-text">{line.text}</span>
                  ) : line.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.12), transparent)' }} />
      </div>

      {/* ───────────── THE STORY ─────────────── */}
      <div ref={story.ref} className="relative z-10 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="mb-14"
            style={{
              opacity: story.visible ? 1 : 0,
              transform: story.visible ? 'none' : 'translateY(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,215,0,0.6)', letterSpacing: '0.2em' }}>
              The Origin
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              How One Person Changed<br />
              <span className="gradient-text">the Trajectory of Humanity</span>
            </h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(0,206,209,0.1)',
              background: 'rgba(0,0,0,0.04)',
              opacity: story.visible ? 1 : 0,
              transform: story.visible ? 'none' : 'translateY(40px)',
              transition: 'opacity 0.8s ease 200ms, transform 0.8s ease 200ms',
            }}
          >
            <StoryStrip items={storyItems} />
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,206,209,0.18), transparent)' }} />
      </div>

      {/* ────────── EVOLUTION PANELS ─────────── */}
      <div ref={evolution.ref} className="relative z-10 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-16"
            style={{
              opacity: evolution.visible ? 1 : 0,
              transform: evolution.visible ? 'none' : 'translateY(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,206,209,0.6)', letterSpacing: '0.2em' }}>
              The Architecture
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Biology Became Code.<br />
              <span className="gradient-text">Code Became Intelligence.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {evolutionPanels.map((panel, i) => {
              const Icon = panel.icon;
              return (
                <TiltCard
                  key={i}
                  glowColor={`rgba(${panel.color === '#00CED1' ? '0,206,209' : '255,215,0'},0.25)`}
                  className="rounded-2xl p-8 sm:p-10 cursor-default"
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    border: `1px solid rgba(${panel.color === '#00CED1' ? '0,206,209' : '255,215,0'},0.12)`,
                    opacity: evolution.visible ? 1 : 0,
                    transform: evolution.visible ? 'none' : `translateY(${50 + i * 20}px)`,
                    transition: `opacity 0.7s ease ${i * 150}ms, transform 0.7s ease ${i * 150}ms`,
                  } as any}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: `rgba(${panel.color === '#00CED1' ? '0,206,209' : '255,215,0'},0.08)`, border: `1px solid rgba(${panel.color === '#00CED1' ? '0,206,209' : '255,215,0'},0.2)` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: panel.color }} />
                  </div>
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-5"
                    style={{ color: panel.color, opacity: 0.8 }}
                  >
                    {panel.label}
                  </p>
                  <ul className="space-y-3">
                    {panel.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ background: panel.color, boxShadow: `0 0 6px ${panel.color}` }}
                        />
                        <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.12), transparent)' }} />
      </div>

      {/* ──────── FEATURE PILLARS ─────────────── */}
      <div ref={pillars.ref} className="relative z-10 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-16"
            style={{
              opacity: pillars.visible ? 1 : 0,
              transform: pillars.visible ? 'none' : 'translateY(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,206,209,0.6)', letterSpacing: '0.2em' }}>
              What It Does
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Built for Every Industry.<br />
              <span className="gradient-text">Every Human. Every Ambition.</span>
            </h2>
            <p className="text-base sm:text-lg mt-4 max-w-2xl mx-auto" style={{ color: 'rgba(180,220,220,0.55)' }}>
              [Add your feature descriptions below to populate these blocks]
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillarsData.map((p, i) => {
              const Icon = p.icon;
              return (
                <TiltCard
                  key={i}
                  className="rounded-xl p-7 group cursor-default"
                  style={{
                    background: p.color,
                    border: '1px solid rgba(0,206,209,0.08)',
                    opacity: pillars.visible ? 1 : 0,
                    transform: pillars.visible ? 'none' : 'translateY(40px)',
                    transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms`,
                  } as any}
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                    style={{ background: 'rgba(0,206,209,0.08)', border: '1px solid rgba(0,206,209,0.15)' }}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-3 leading-snug">{p.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(180,220,220,0.55)' }}>{p.desc}</p>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,206,209,0.18), transparent)' }} />
      </div>

      {/* ────────── EARLY ACCESS ─────────────────── */}
      <section id="early-access" aria-labelledby="early-access-heading" className="relative z-10 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,215,0,0.7)', letterSpacing: '0.2em' }}>
                Limited onboarding
              </p>
              <h2 id="early-access-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
                Request Early Access<br />
                <span className="gradient-text">to NeurusAGi.</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: 'rgba(180,220,220,0.7)' }}>
                Access is granted in phases and every request is reviewed personally. Tell us what you want to build and we will be in touch. There is no cost to apply and no obligation.
              </p>
              <ul className="space-y-3">
                {[
                  'One request per email, kept on file while you wait',
                  'Reviewed by the founder, not an automated queue',
                  'No payment details required to apply',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(180,220,220,0.6)' }}>
                    <ArrowRight aria-hidden="true" className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-strong rounded-2xl p-6 sm:p-8 neural-glow">
              <EarlyAccessForm compact idPrefix="home-early-access" />
            </div>
          </div>
        </div>
      </section>

      {/* ────────── BOTTOM CTA ─────────────────── */}
      <div ref={cta.ref} className="relative z-10 py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl relative overflow-hidden text-center px-8 py-16 sm:py-24"
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,206,209,0.15)',
              boxShadow: '0 0 80px rgba(0,206,209,0.07), inset 0 0 60px rgba(0,0,0,0.3)',
              opacity: cta.visible ? 1 : 0,
              transform: cta.visible ? 'none' : 'translateY(50px)',
              transition: 'opacity 0.9s ease, transform 0.9s ease',
            }}
          >
            {/* Ambient corners */}
            <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(0,206,209,0.07), transparent 70%)' }} />
            <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(255,215,0,0.05), transparent 70%)' }} />

            <div className="relative z-10">
              <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: 'rgba(255,215,0,0.7)', letterSpacing: '0.2em' }}>
                The New Age Is Here
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Welcome to the<br />
                <span className="gradient-text">Human Age.</span>
              </h2>
              <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(180,220,220,0.6)' }}>
                This is the moment the trajectory of humanity changes. Every willing human on Earth now has access to the same intelligence. The only thing standing between you and an extraordinary life is the decision to begin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/early-access"
                  className="btn-primary text-base px-10 py-4 w-full sm:w-auto text-center"
                  style={{ boxShadow: '0 0 40px rgba(0,206,209,0.3)' }}
                >
                  Enter the New Age
                </Link>
                <Link to="/pricing" className="btn-ghost text-base px-10 py-4 w-full sm:w-auto text-center">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
