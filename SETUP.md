# NeurusAGi setup

Everything in the app is wired up. Three things need credentials before the
database-backed features (Request Early Access, accounts, Executive Admin) go
live, because the Supabase project the app previously pointed at no longer
resolves.

## 1. Create the Supabase project

1. Create a project at <https://supabase.com/dashboard>.
2. Copy **Project URL** and **anon public key** from Project Settings → API.

The old project (`bcdfrxbzannqixlcjwwb.supabase.co`) returns NXDOMAIN, so this
step cannot be skipped.

## 2. Run the schema

Open the SQL editor in the new project and run
`supabase/migrations/20261021000000_platform_schema.sql`.

That single file creates:

- `profiles`, `subscriptions`, `contact_submissions`, `investor_inquiries`,
  `chat_messages`
- `early_access_requests` with a unique index on lower-cased email
- `admin_messages` for the messaging log
- row level security on every table: anonymous inserts for the public forms,
  admin-only reads and writes for anything containing leads or people
- the Executive Admin account `jt@neurusagi.com` with the temporary password
  `123` and `must_change_password = true`, which forces a password change on the
  first successful sign-in

It is idempotent, so re-running it is safe.

> Security note: `123` is a temporary credential that anyone can guess. The app
> refuses to open `/admin` until it is replaced, but change it the same day the
> site goes live. Even better, change the password in the SQL file before you run
> it.

## 3. Set the environment variables

Local development: copy `.env.example` to `.env` and fill both values.

Vercel: Project → Settings → Environment Variables, for Production and Preview:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

Both values are public by design (they ship inside the browser bundle). Row
level security is what protects the data. Never put a service role key in a
`VITE_` variable.

## 4. Optional: turn on email sending

The admin messaging screen records every campaign in `admin_messages` whether or
not a provider is connected. To actually deliver mail:

```bash
supabase functions deploy send-email
supabase secrets set RESEND_API_KEY=... MAIL_FROM="NeurusAGi <updates@neurusagi.com>"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase. The
function verifies the caller's JWT and rejects anyone who is not an admin, so the
provider key never reaches the browser.

## 5. How the crawlable files are produced

`npm run build` does three steps:

1. `vite build` produces the client bundle.
2. `vite build --ssr src/entry-server.tsx` produces the render entry.
3. `node scripts/prerender.mjs` renders every public route to real HTML and writes
   `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` and `rss.xml` into
   `dist/`.

Routes rendered statically: `/`, `/about`, `/news`, `/early-access`, `/pricing`,
`/investors`, `/contact` and one page per article at `/news/<slug>`.

Adding an article to `src/data/articles.ts` (with `slug`, `publishedAt`,
`updatedAt`) automatically gives it a page, a sitemap entry, an RSS item and an
`llms-full.txt` section on the next build.

## 6. Deploying

The repository is a plain Vite app; `vercel.json` at the project root sets the
build command, output directory, cache headers and the SPA fallback for
client-only routes such as `/dashboard` and `/admin`.

Do not place `vercel.json` inside `public/`. Doing so makes Vercel serve it as a
static file and silently skips the rewrite, which is what made every deep link
return 404 before.

## 7. Local checks

```bash
npm run typecheck
npm run build
npm run preview   # serves dist/ with the prerendered pages
```
