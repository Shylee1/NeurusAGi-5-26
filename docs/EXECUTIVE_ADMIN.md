# Executive Admin Login
- **URL:** `/login` → Executive Admin dashboard at `/admin`
- **Login ID:** `JT@NEURUSAGI.COM` (case-insensitive)
- **Initial password:** `123`
- **First login:** forced redirect (in-app, not an HTTP redirect) to `/change-password`; the dashboard cannot be opened until a new password (min. 8 chars, different from `123`) is set. The new password is stored only as a SHA-256 hash in the browser (`localStorage`); the initial password then stops working in that browser.

## Production hardening (do this in Supabase)
The in-app account above is a bootstrap so the executive can always get in. For server-grade auth, also: Supabase Dashboard → Authentication → Add user `jt@neurusagi.com` with a strong password, then set that user's row in `profiles` to `role = 'admin'`. Never commit a service-role key or a plaintext production password. Change the bootstrap password immediately on first login as prompted.
