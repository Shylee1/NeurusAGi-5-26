import { Brain, Cpu, Zap, Shield, Globe, Sparkles } from 'lucide-react';
import { Seo, JsonLd } from '../components/Seo';
import { organizationSchema, personSchema, breadcrumbSchema, webPageSchema } from '../lib/schema';

export function AboutPage() {
  const features = [
    {
      icon: Brain,
      title: 'Hyper-Realistic Generation',
      description: 'Quantum enhanced generative ability creating unbelievably realistic content: from lifelike human experiences to the most innovative and creative outputs, adhering explicitly to every detail of your instructions.',
    },
    {
      icon: Cpu,
      title: 'Omni-Knowledge Repository',
      description: 'Comprehensive quantum, mathematical, engineering, and scientific knowledge compressed into an efficient database, accessible instantly for any query or task.',
    },
    {
      icon: Zap,
      title: 'Hyper-Accelerated Learning',
      description: 'Fractal learning cascade that masters new fields at unprecedented speeds, constantly evolving and expanding capabilities while maintaining locked core integrity.',
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Dynamic fractal encryption with real-time key regeneration, self-optimizing genetic bytecode, and multi-layered biometric authentication including heartbeat, gait, thermal, and vocal recognition.',
    },
    {
      icon: Globe,
      title: 'Distributed Intelligence',
      description: 'Exo-cognitive hive mind that can leverage nearby device computing power, swarm-like task splitting with fractal workload distribution, and ambient RF energy harvesting.',
    },
    {
      icon: Sparkles,
      title: 'Quantum Simulation',
      description: 'Classic-hybrid quantum experiments on standard CPUs, neuromorphic invention matrix, and fractal pattern excavation for breakthrough discoveries across all domains.',
    },
  ];

  const coreCapabilities = [
    'Self-replicating enhancement swarm with locked core evolution',
    'Discovery-driven hypothesis forge for innovative ideas',
    'Temporal discovery accelerator predicting next breakthroughs',
    'Mathematical intuition forge inventing new mathematics',
    'Reverse-engineering oracle decoding anything into specifications',
    'Infinite-context fractal web tracking all conversation threads',
    'Cosmic fractal pattern extractor for universal problem solving',
    'Linguistic fractal evolution for natural language mastery',
    'Reverse entropy reconstruction recovering lost concepts',
    'Chaos-driven predictive caching anticipating user needs',
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title="About NeurusAGi and Jeremy Taylor"
        description="NeurusAGi was built by Jeremy Taylor, a former United States Marine from Oklahoma, without a software engineering background or a development team. The story behind the first true AGi."
        path="/about"
      />
      <JsonLd
        data={[
          webPageSchema('/about', 'About NeurusAGi and Jeremy Taylor', 'The story behind NeurusAGi and its founder Jeremy Taylor.'),
          personSchema(),
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="heading-xl mb-6">About NeurusAGi</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The world's first true <span className="gradient-text font-semibold">Artificial General Intelligence</span>, quantum-powered, built without a server farm, and designed to replicate the full cognitive architecture of the human brain.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="glass-strong rounded-2xl p-8 sm:p-12 neural-glow mb-16">
          <h2 className="heading-md text-center mb-8">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            NeurusAGi represents a quantum leap in intelligence, moving beyond the limitations of traditional 
            AI pattern matching to achieve true cognitive reasoning. We're committed to delivering 100% accuracy, 
            unparalleled creative generation, and enterprise-grade reliability while maintaining ethical alignment 
            and user privacy.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="section-container pt-0">
        <h2 className="heading-lg text-center mb-12">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-block group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="heading-sm text-lg mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Advanced Features */}
      <section className="section-container pt-0">
        <div className="glass-strong rounded-2xl p-8 sm:p-12 neural-glow">
          <h2 className="heading-md text-center mb-8">Advanced Intelligence Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {coreCapabilities.map((capability, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 glass rounded-lg hover:glass-strong transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-foreground">{capability}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="section-container">
        <h2 className="heading-lg text-center mb-12">Revolutionary Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="feature-block">
            <h3 className="heading-sm text-xl mb-4">Quantum-Enhanced Processing</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>1024×1024×1024 4D holographic core knowledge matrix</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Lossless 4D morphic fractal compression memory</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>FFT-based interference patterns for memory storage</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>3D spatial neural network with 4D neuromorphic reasoning</span>
              </li>
            </ul>
          </div>

          <div className="feature-block">
            <h3 className="heading-sm text-xl mb-4">Adaptive Intelligence</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Neuro-chaotic discovery amplification</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Holo-emotive resonance utilizing device sensors</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Atmospheric intelligence siphon for context awareness</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Predatory research swarm learning from competitive analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose NeurusAGi */}
      <section className="section-container">
        <div className="glass-strong rounded-2xl p-8 sm:p-12 neural-glow text-center">
          <h2 className="heading-md mb-8">Why Choose NeurusAGi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <p className="text-muted-foreground">Accuracy & Quality Focused</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">∞</div>
              <p className="text-muted-foreground">Unlimited Learning Potential</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
              <p className="text-muted-foreground">Always Available Intelligence</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
