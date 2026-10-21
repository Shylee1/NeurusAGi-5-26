import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../lib/authService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, MapPin, Globe } from 'lucide-react';
import { Seo } from '../components/Seo';

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    city: '',
    state: '',
    country: '',
  });
  const [consent, setConsent] = useState(false);
  const { user, setProfile } = useAuth();
  const navigate = useNavigate();

  const determineComplianceRegion = (country: string, state?: string) => {
    const countryLower = country.toLowerCase();
    const stateLower = state?.toLowerCase() || '';

    // EU countries
    const euCountries = [
      'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic',
      'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary',
      'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands',
      'poland', 'portugal', 'romania', 'slovakia', 'slovenia', 'spain', 'sweden'
    ];

    if (euCountries.includes(countryLower)) {
      return 'EU';
    } else if (countryLower === 'united states' && stateLower === 'california') {
      return 'California';
    } else if (countryLower === 'china') {
      return 'China';
    }
    return 'default';
  };

  const handleLocationSubmit = async () => {
    if (!location.city || !location.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    const region = determineComplianceRegion(location.country, location.state);
    
    // Fetch compliance rules for this region
    const { data: complianceData } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('region', region)
      .single();

    if (complianceData?.requires_explicit_consent) {
      setStep(2);
    } else {
      await completeOnboarding(region);
    }
  };

  const completeOnboarding = async (region?: string) => {
    setLoading(true);

    try {
      const complianceRegion = region || determineComplianceRegion(location.country, location.state);

      await authService.updateProfile(user!.id, {
        ...location,
        compliance_region: complianceRegion,
      });

      // Fetch updated profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      toast.success('Welcome to NeurusAGi!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Seo title="NeurusAGi Onboarding" description="Finish setting up your NeurusAGi account." path="/onboarding" noindex />

      <div className="w-full max-w-2xl">
        <div className="glass-strong rounded-2xl p-8 sm:p-12 neural-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-lg text-3xl mb-2">Welcome to NeurusAGi</h1>
            <p className="text-muted-foreground">
              Let's personalize your experience
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h2 className="heading-md text-2xl mb-2">Your Location</h2>
                <p className="text-sm text-muted-foreground">
                  We need this to ensure compliance with local regulations
                </p>
              </div>

              <div className="input-container">
                <label className="input-label">City *</label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div className="input-container">
                <label className="input-label">State / Province</label>
                <input
                  type="text"
                  value={location.state}
                  onChange={(e) => setLocation({ ...location, state: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter your state or province (optional)"
                />
              </div>

              <div className="input-container">
                <label className="input-label">Country *</label>
                <input
                  type="text"
                  value={location.country}
                  onChange={(e) => setLocation({ ...location, country: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter your country"
                  required
                />
              </div>

              <button
                onClick={handleLocationSubmit}
                className="w-full btn-primary"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Compliance Consent */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h2 className="heading-md text-2xl mb-2">Privacy & Compliance</h2>
                <p className="text-sm text-muted-foreground">
                  Based on your location, we need your consent to proceed
                </p>
              </div>

              <div className="glass rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-2">Data Processing Agreement</h3>
                <p className="text-sm text-muted-foreground">
                  By using NeurusAGi, you agree to our processing of your data in accordance with:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Our Terms of Service and Privacy Policy</li>
                  <li>Local data protection regulations (GDPR, CCPA, etc.)</li>
                  <li>Secure storage and processing of your information</li>
                  <li>Your right to access, modify, or delete your data</li>
                </ul>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-primary/30 bg-card text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-foreground">
                  I have read and agree to the data processing terms and provide my explicit consent
                </span>
              </label>

              <button
                onClick={() => completeOnboarding()}
                disabled={!consent || loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Setting up...</span>
                  </span>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
