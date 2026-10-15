import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { hasExecutiveSession } from '../lib/executiveAdmin';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { executiveChangePassword, executiveMustChangePassword } from '../lib/executiveAdmin';

export function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const forced = executiveMustChangePassword();
  const user = useAuthStore(s => s.user);
  if (!hasExecutiveSession() && !user) return <Navigate to="/login" replace />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try { await executiveChangePassword(password); toast.success('Password changed'); navigate('/admin'); }
    catch (err: any) { toast.error(err.message); setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md"><div className="glass-strong rounded-2xl p-8 neural-glow">
        <div className="text-center mb-8"><h1 className="heading-lg text-3xl mb-2">Change Password</h1>
        <p className="text-muted-foreground">{forced ? 'You must change the initial password before continuing to the Executive Admin dashboard.' : 'Set a new password for your account.'}</p></div>
        <form onSubmit={submit} className="space-y-6">
          <div className="input-container"><label className="input-label" htmlFor="new-password">New Password</label>
          <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field w-full" required disabled={loading} /></div>
          <div className="input-container"><label className="input-label" htmlFor="confirm-password">Confirm New Password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="input-field w-full" required disabled={loading} /></div>
          <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save New Password'}</button>
        </form>
      </div></div>
    </div>
  );
}
