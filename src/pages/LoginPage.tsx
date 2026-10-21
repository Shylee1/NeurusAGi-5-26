import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/authService';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Seo } from '../components/Seo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, setLoading: setAuthLoading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.signInWithPassword(email, password);
      login(authService.mapUser(user));

      // Accounts still on a temporary credential must set a real password first.
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, must_change_password')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.must_change_password) {
        navigate('/change-password', { replace: true });
        return;
      }

      navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Seo title="Sign in to NeurusAGi" description="Sign in to your NeurusAGi account." path="/login" noindex />

      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 neural-glow">
          <div className="text-center mb-8">
            <h1 className="heading-lg text-3xl mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your NeurusAGi account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="input-container">
              <label className="input-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                name="email"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="input-container">
              <label className="input-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Enter your password"
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
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
