import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Seo } from '../components/Seo';

/**
 * Shown when an account still carries the temporary credential.
 * The profile flag is cleared only after a successful password update.
 */
export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();

  const isAdmin = profile?.role === 'admin';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 12) {
      setError('Use at least 12 characters. Length matters more than symbols.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    if (password === currentPassword) {
      setError('Choose a password that is different from the temporary one.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ must_change_password: false, password_changed_at: new Date().toISOString() })
          .eq('id', user.id);

        if (profileError) {
          // The password is already changed; surface the flag issue without blocking the user.
          console.warn('Could not clear must_change_password flag:', profileError.message);
        }
        if (profile) {
          setProfile({ ...profile, must_change_password: false } as typeof profile);
        }
      }

      toast.success('Password updated');
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Seo
        title="Set a new password"
        description="Set a permanent password for your NeurusAGi account."
        path="/change-password"
        noindex
      />
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 neural-glow">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck aria-hidden="true" className="w-7 h-7 text-primary" />
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Account security</p>
          </div>
          <h1 className="heading-lg text-3xl mb-2">Set a new password</h1>
          <p className="text-muted-foreground mb-8">
            {isAdmin
              ? 'This account is still using its temporary password. Choose a permanent one to continue to the Executive Admin dashboard.'
              : 'Choose a permanent password for your account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-container">
              <label className="input-label" htmlFor="current-password">
                Current or temporary password
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field w-full"
                required
                disabled={loading}
              />
            </div>

            <div className="input-container">
              <label className="input-label" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                minLength={12}
                required
                disabled={loading}
                aria-describedby="password-requirements"
              />
              <p id="password-requirements" className="text-xs text-muted-foreground mt-2">
                At least 12 characters. A passphrase of four unrelated words is strong and easy to
                remember.
              </p>
            </div>

            <div className="input-container">
              <label className="input-label" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-field w-full"
                minLength={12}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                'Save new password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
