import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/authService';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Seo } from '../components/Seo';

export function SignupPage() {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.sendOtp(email);
      toast.success('Verification code sent to your email');
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.verifyOtpAndSetPassword(email, otp, password, username);
      login(authService.mapUser(user));
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify code');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Seo title="Create a NeurusAGi account" description="Create your NeurusAGi account and start onboarding." path="/signup" noindex />

      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 neural-glow">
          <div className="text-center mb-8">
            <h1 className="heading-lg text-3xl mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join NeurusAGi today</p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="input-container">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending code...</span>
                  </span>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div className="input-container">
                <label className="input-label">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter 6-digit code"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Check your email ({email}) for the verification code
                </p>
              </div>

              <div className="input-container">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full"
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>

              <div className="input-container">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full"
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                Use different email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
