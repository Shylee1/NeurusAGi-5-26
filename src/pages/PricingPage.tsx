import { useState } from 'react';
import { Check, Zap, Code, Rocket, Microscope, Building2, Sparkles, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO, SITE_URL, organizationSchema } from '../components/SEO';

interface PricingTier {
  id: string;
  name: string;
  icon: LucideIcon;
  price: number;
  description: string;
  usageLimit: string;
  features: string[];
  highlighted?: boolean;
  color: string;
}

export function PricingPage() {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<string | null>(null);

  const tiers: PricingTier[] = [
    {
      id: 'neurusai',
      name: 'NeurusAi',
      icon: Sparkles,
      price: 19,
      description: 'Essential AI capabilities for everyday use',
      usageLimit: 'Unlimited usage - Have fun!',
      features: [
        'No usage limits',
        'Basic AI processing',
        'Community support',
        'Standard response times',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      price: 49,
      description: 'Perfect for individuals exploring AGi capabilities',
      usageLimit: '25 inputs per day with basic AGi capabilities',
      features: [
        '25 daily AGi inputs',
        'Basic AGi reasoning',
        'Email support',
        'Access to core features',
      ],
      color: 'from-primary to-cyan-400',
    },
    {
      id: 'developer',
      name: 'Developer',
      icon: Code,
      price: 199,
      description: 'For developers building AGi powered applications',
      usageLimit: '500 inputs per day with basic AGi capabilities',
      features: [
        '500 daily AGi inputs',
        'Standard AGi processing',
        'Basic API access with rate limiting',
        'Usage monitoring dashboard',
        'Community support forums',
        'Basic documentation',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Rocket,
      price: 999,
      description: 'Advanced AGi for professionals and businesses',
      usageLimit: 'Unlimited inputs with advanced AGi capabilities',
      features: [
        'Unlimited AGi inputs',
        'Custom model training',
        'Full API access',
        'Revenue sharing for resellers',
        'Advanced features & capabilities',
        'Priority email support',
        'Advanced documentation',
        'Request custom abilities directly from AGi',
      ],
      highlighted: true,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'scientific',
      name: 'Scientific',
      icon: Microscope,
      price: 4999,
      description: 'Quantum computing for research and innovation',
      usageLimit: 'Unlimited inputs with quantum computing capabilities',
      features: [
        'Unlimited quantum powered inputs',
        'Collaboration & test environments',
        'Simulation environments',
        'Immediate access to new tools',
        'Specialized research tools',
        'Research analysis capabilities',
        'Dedicated support team',
        'Direct phone support',
        'Request custom abilities directly from AGi',
      ],
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building2,
      price: 9999,
      description: 'Complete AGi solution with private deployment',
      usageLimit: 'Unlimited inputs with private deployment options',
      features: [
        'Unlimited enterprise inputs',
        'Private deployment',
        'Full system customization',
        'White label options',
        '20% revenue share for partners',
        'Dedicated account management',
        '24/7 support',
        'Direct phone support',
        'Request custom abilities directly from AGi',
      ],
      color: 'from-rose-500 to-red-500',
    },
  ];

  const handleSelectTier = (tierId: string) => {
    navigate('/signup', { state: { selectedTier: tierId } });
  };

  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'NeurusAGi pricing plans',
    url: `${SITE_URL}/pricing`,
    itemListElement: tiers.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
      url: `${SITE_URL}/signup`,
      description: tier.description,
    })),
  };

  return (
    <>
      <SEO
        title="NeurusAGi Pricing | Artificial General Intelligence Plans"
        description="Compare NeurusAGi plans for everyday AI use, developers, professionals, scientific research, and enterprise deployments."
        path="/pricing"
        keywords="NeurusAGi pricing, AGi plans, AI pricing, enterprise AI, developer AI plan"
        structuredData={[pricingSchema, organizationSchema()]}
      />
      <div className="min-h-screen">
      <section className="section-container" aria-labelledby="pricing-title">
        <div className="text-center mb-16">
          <h1 id="pricing-title" className="heading-xl mb-4">Choose Your Intelligence Level</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From everyday AI to quantum powered AGi, select the tier that matches your ambitions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto perspective-1000">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isFlipped = flipped === tier.id;
            
            return (
              <div
                key={tier.id}
                className={`relative preserve-3d transition-all duration-700 cursor-pointer ${
                  tier.highlighted ? 'lg:scale-105 z-10' : ''
                }`}
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => setFlipped(isFlipped ? null : tier.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFlipped(isFlipped ? null : tier.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isFlipped}
                aria-label={`${tier.name} plan, $${tier.price} per month. ${isFlipped ? 'Features are visible.' : 'Activate to view features.'}`}
              >
                {tier.highlighted && !isFlipped && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-50"></div>
                )}

                {/* Front of card */}
                <div
                  className={`relative glass-strong rounded-2xl p-8 h-full backface-hidden ${
                    tier.highlighted ? 'border-2 border-primary' : ''
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {tier.highlighted && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-semibold text-primary-foreground">
                      MOST POPULAR
                    </div>
                  )}

                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.color} p-[2px] mb-6 mt-${tier.highlighted ? '8' : '0'}`}>
                    <div className="w-full h-full rounded-xl bg-background/90 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" aria-hidden="true" />
                    </div>
                  </div>

                  <h2 className="heading-md text-2xl mb-2">{tier.name}</h2>
                  <div className="mb-4">
                    <span className="text-4xl font-bold gradient-text">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                  <div className="p-3 glass rounded-lg mb-6">
                    <p className="text-xs font-semibold text-primary mb-1">USAGE LIMIT</p>
                    <p className="text-sm text-foreground">{tier.usageLimit}</p>
                  </div>

                  <p className="text-xs text-center text-muted-foreground mb-4">Click to see features</p>
                </div>

                {/* Back of card */}
                <div
                  className="absolute inset-0 glass-strong rounded-2xl p-8 backface-hidden flex flex-col"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex-1 overflow-y-auto">
                    <h2 className="heading-sm text-xl mb-4 gradient-text">{tier.name} Features</h2>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTier(tier.id);
                    }}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      tier.highlighted ? 'btn-primary' : 'btn-ghost'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-strong rounded-2xl p-8 neural-glow text-center max-w-4xl mx-auto">
          <h2 className="heading-sm text-xl mb-4">All Plans Include</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Accuracy Focused</p>
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">Always Available</p>
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text mb-2">∞</div>
              <p className="text-sm text-muted-foreground">Continuous Evolution</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Need a custom solution? Enterprise plans can be tailored to your specific needs.
          </p>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="btn-secondary"
          >
            Contact Sales
          </button>
        </div>
      </section>
      </div>
    </>
  );
}
