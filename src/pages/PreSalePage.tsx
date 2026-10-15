import { useState } from 'react';
import { Check, Zap, Code, Rocket, Microscope, Building2, Sparkles, ArrowRight, Clock, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const tiers: PricingTier[] = [
  {
    id: 'neurusai',
    name: 'NeurusAi',
    icon: Sparkles,
    price: 19,
    description: 'Essential AI capabilities for everyday use',
    usageLimit: 'Unlimited usage - Have fun!',
    features: ['No usage limits', 'Basic AI processing', 'Community support', 'Standard response times'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    price: 49,
    description: 'Perfect for individuals exploring AGi capabilities',
    usageLimit: '25 inputs per day with basic AGi capabilities',
    features: ['25 daily AGi inputs', 'Basic AGi reasoning', 'Email support', 'Access to core features'],
    color: 'from-primary to-cyan-400',
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: Code,
    price: 199,
    description: 'For developers building AGi powered applications',
    usageLimit: '500 inputs per day with basic AGi capabilities',
    features: ['500 daily AGi inputs', 'Standard AGi processing', 'Basic API access', 'Usage monitoring', 'Community support', 'Documentation'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Rocket,
    price: 999,
    description: 'Advanced AGi for professionals and businesses',
    usageLimit: 'Unlimited inputs with advanced AGi capabilities',
    features: ['Unlimited AGi inputs', 'Custom model training', 'Full API access', 'Revenue sharing', 'Priority support', 'Request custom AGi abilities'],
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
    features: ['Unlimited quantum inputs', 'Collaboration environments', 'Simulation environments', 'Immediate new tool access', 'Dedicated support', 'Direct phone support', 'Request custom AGi abilities'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    price: 9999,
    description: 'Complete AGi solution with private deployment',
    usageLimit: 'Unlimited inputs with private deployment options',
    features: ['Private deployment', 'Full customization', 'White label options', '20% revenue share', 'Dedicated account manager', '24/7 support', 'Direct phone support', 'Request custom AGi abilities'],
    color: 'from-rose-500 to-red-500',
  },
];

export function PreSalePage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [months, setMonths] = useState(1);

  const selectedTierData = tiers.find(t => t.id === selectedTier);
  const years = months;
  const totalCost = selectedTierData ? selectedTierData.price * months : 0;

  const presaleSchema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'NeurusAGi pre-sale plans',
    url: `${SITE_URL}/presale`,
    itemListElement: tiers.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: 'USD',
      description: `${tier.description}. Prepay monthly access during the NeurusAGi pre-sale.`,
      url: `${SITE_URL}/presale`,
    })),
  };

  return (
    <>
      <SEO
        title="NeurusAGi Pre-Sale | Early Access Plans"
        description="Explore NeurusAGi pre-sale plans and choose the access tier and number of months that fit your goals."
        path="/presale"
        keywords="NeurusAGi pre-sale, AGi early access, AI early access, NeurusAGi plans"
        structuredData={[presaleSchema, organizationSchema()]}
      />
      <div className="min-h-screen relative overflow-hidden">
      {/* Aurora background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(ellipse, rgba(0,206,209,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <section className="relative z-10 section-container" aria-labelledby="presale-title">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.35)', color: '#FFD700' }}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            Pre-Launch Exclusive - Limited Time
          </div>
          <h1 id="presale-title" className="heading-xl mb-4">Pre-Sale: Pay Months, Get Years</h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            For every month you prepay, you receive a full year of access. Prepay 2 months and get 2 years. This is our pre-launch thank you to early believers.
          </p>
        </div>

        {/* Conversion Banner */}
        <div
          className="max-w-3xl mx-auto rounded-2xl p-6 mb-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,206,209,0.08), rgba(255,215,0,0.06))', border: '1px solid rgba(255,215,0,0.25)' }}
        >
          <p className="text-lg font-bold text-secondary mb-1">The Deal is Simple</p>
          <p className="text-muted-foreground text-sm">
            Every month you prepay = 1 full year of access after launch. No tricks. No fine print.
          </p>
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-3xl font-black gradient-text">1 mo</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">paid</p>
            </div>
            <ArrowRight className="w-6 h-6 text-primary" />
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: '#FFD700' }}>1 yr</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">received</p>
            </div>
          </div>
        </div>

        {/* Tier Selection */}
        <h2 id="tier-selection-title" className="text-xl font-bold text-center text-muted-foreground mb-6">Step 1: Select Your Tier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mb-12">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;
            return (
              <button
                type="button"
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className="text-left rounded-2xl p-5 transition-all duration-300 cursor-pointer"
                style={{
                  background: isSelected ? 'rgba(0,206,209,0.08)' : 'rgba(0,0,0,0.05)',
                  border: isSelected ? '2px solid rgba(0,206,209,0.6)' : '1px solid rgba(0,206,209,0.12)',
                  boxShadow: isSelected ? '0 0 24px rgba(0,206,209,0.2)' : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {tier.highlighted && (
                  <div className="text-xs font-bold text-black bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full inline-block mb-3">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{tier.name}</p>
                    <p className="text-primary font-black">${tier.price}<span className="text-muted-foreground text-xs font-normal">/mo</span></p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{tier.description}</p>
                <ul className="space-y-1.5">
                  {tier.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {tier.features.length > 3 && (
                    <li className="text-xs text-muted-foreground pl-5">+{tier.features.length - 3} more</li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Months Input */}
        {selectedTier && (
          <div
            className="max-w-xl mx-auto rounded-2xl p-8 mb-10"
            style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,206,209,0.2)' }}
          >
            <h2 className="text-xl font-bold text-center mb-6">Step 2: Choose How Many Months to Prepay</h2>

            <div className="mb-6">
              <label htmlFor="presale-months" className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Months to prepay
              </label>
              <input
                id="presale-months"
                name="months"
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                className="input-field w-full text-2xl font-bold text-center"
                style={{ fontSize: '1.5rem' }}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">Enter 1 to 24 months</p>
            </div>

            {/* Summary */}
            <div
              className="rounded-xl p-5 text-center mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(0,206,209,0.07), rgba(255,215,0,0.05))', border: '1px solid rgba(255,215,0,0.2)' }}
            >
              <div className="flex items-center justify-around gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">You Pay</p>
                  <p className="text-2xl font-black gradient-text">${totalCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{months} month{months !== 1 ? 's' : ''} upfront</p>
                </div>
                <ArrowRight className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">You Get</p>
                  <p className="text-2xl font-black" style={{ color: '#FFD700' }}>{years} Year{years !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground">of full access</p>
                </div>
              </div>
            </div>

            <Link
              to={`/signup?tier=${selectedTier}&months=${months}`}
              state={{ selectedTier, months }}
              className="btn-primary w-full text-center text-base py-4 flex items-center justify-center gap-2"
              aria-label={`Continue with the ${selectedTierData?.name} pre-sale plan`}
              style={{ display: 'flex' }}
            >
              Continue to Registration <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Your selected plan and prepayment period will be carried into registration so the next steps are clear.
            </p>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Questions? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> or <Link to="/pricing" className="text-primary hover:underline">view standard pricing</Link>.
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
