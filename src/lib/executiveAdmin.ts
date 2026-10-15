// Executive Admin bootstrap account.
// Login: JT@NEURUSAGI.COM (case-insensitive) / initial password: 123
// On first login the admin is forced to /change-password; the replacement
// password is stored only as a SHA-256 hash in this browser. For production,
// also create this same user in Supabase Auth and set profiles.role='admin'
// (see docs/EXECUTIVE_ADMIN.md) — never commit a service-role key.
export const EXECUTIVE_EMAIL = 'jt@neurusagi.com';
const INITIAL_PASSWORD = '123';
const HASH_KEY = 'neurus_exec_pw_hash';
const MUST_CHANGE_KEY = 'neurus_exec_must_change';
const SESSION_KEY = 'neurus_exec_session';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const isExecutiveEmail = (email: string) => email.trim().toLowerCase() === EXECUTIVE_EMAIL;
export function executiveMustChangePassword() { return localStorage.getItem(MUST_CHANGE_KEY) !== '0'; }
export function hasExecutiveSession() { return localStorage.getItem(SESSION_KEY) === '1'; }

export async function executiveSignIn(email: string, password: string): Promise<boolean> {
  if (!isExecutiveEmail(email)) return false;
  const stored = localStorage.getItem(HASH_KEY);
  const ok = stored ? (await sha256(password)) === stored : password === INITIAL_PASSWORD;
  if (!ok) throw new Error('Invalid email or password');
  localStorage.setItem(SESSION_KEY, '1');
  if (!stored) localStorage.setItem(MUST_CHANGE_KEY, '1');
  return true;
}
export async function executiveChangePassword(newPassword: string) {
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');
  if (newPassword === INITIAL_PASSWORD) throw new Error('Choose a password different from the initial password');
  localStorage.setItem(HASH_KEY, await sha256(newPassword));
  localStorage.setItem(MUST_CHANGE_KEY, '0');
  localStorage.setItem(SESSION_KEY, '1');
}
export function executiveSignOut() {
  localStorage.removeItem(SESSION_KEY);
}
export const executiveUser = () => ({ id: 'executive-admin', email: EXECUTIVE_EMAIL, username: 'JT' });
export const executiveProfile = () => ({
  id: 'executive-admin', email: EXECUTIVE_EMAIL, username: 'JT', role: 'admin' as const,
  created_at: new Date(0).toISOString(), updated_at: new Date(0).toISOString(),
});
