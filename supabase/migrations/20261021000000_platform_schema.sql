-- NeurusAGi platform schema
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
-- It is safe to re-run: every statement is guarded.
--
-- Contents
--   1. helpers and shared tables
--   2. early access requests (the Request Early Access form)
--   3. admin messaging
--   4. row level security
--   5. the Executive Admin account (jt@neurusagi.com, temporary password 123)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- 1. helpers

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------- 2. shared tables

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  must_change_password boolean not null default false,
  password_changed_at timestamptz,
  location_city text,
  location_state text,
  location_country text,
  compliance_region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null default 'tier1',
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  inquiry_type text not null default 'general',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'responded')),
  created_at timestamptz not null default now()
);

create table if not exists public.investor_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'responded')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'user',
  content text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------- 3. early access requests table

create table if not exists public.early_access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (length(trim(full_name)) between 1 and 160),
  email text not null check (position('@' in email) > 1),
  company text,
  role text,
  team_size text,
  use_case text,
  -- context the browser shares without any permission prompt
  country text,
  region text,
  city text,
  timezone text,
  locale text,
  languages text,
  referrer text,
  landing_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_type text,
  screen text,
  platform text,
  hardware text,
  user_agent text,
  source text,
  -- management fields
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'approved', 'invited', 'onboarded', 'declined')),
  priority integer not null default 0,
  notes text,
  contacted_at timestamptz,
  decided_at timestamptz
);

create unique index if not exists early_access_requests_email_key
  on public.early_access_requests (lower(email));
create index if not exists early_access_requests_created_idx
  on public.early_access_requests (created_at desc);
create index if not exists early_access_requests_status_idx
  on public.early_access_requests (status);
create index if not exists early_access_requests_search_idx
  on public.early_access_requests
  using gin (to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(use_case, '')));

-- Keep the requested status vocabulary aligned with the dashboard.
alter table public.early_access_requests
  drop constraint if exists early_access_requests_status_check;
alter table public.early_access_requests
  add constraint early_access_requests_status_check
  check (status in ('new', 'reviewing', 'approved', 'invited', 'onboarded', 'declined'));

-- ------------------------------------------------ 4. admin messaging tables

create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  subject text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('selected', 'status', 'all')),
  recipient_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  status text not null default 'queued' check (status in ('queued', 'sent', 'partial', 'failed')),
  error text
);

create index if not exists admin_messages_created_idx on public.admin_messages (created_at desc);

-- ------------------------------------------------------------ 5. RLS

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.investor_inquiries enable row level security;
alter table public.chat_messages enable row level security;
alter table public.early_access_requests enable row level security;
alter table public.admin_messages enable row level security;

-- Security definer keeps the check independent of the caller's own policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Reading the caller's role through a definer function avoids the recursive
-- RLS lookup that a self-referencing subquery would trigger.
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_same_user(target uuid)
returns boolean
language sql
stable
as $$
  select auth.uid() = target;
$$;

-- profiles
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (public.is_same_user(id) or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (public.is_same_user(id))
  with check (public.is_same_user(id) and role = public.current_role());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (public.is_same_user(id) and role = 'user');

drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- subscriptions
drop policy if exists "subscriptions read own" on public.subscriptions;
create policy "subscriptions read own" on public.subscriptions
  for select using (public.is_same_user(user_id) or public.is_admin());

drop policy if exists "subscriptions admin write" on public.subscriptions;
create policy "subscriptions admin write" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- contact and investor forms: open insert, admin read
drop policy if exists "contact insert" on public.contact_submissions;
create policy "contact insert" on public.contact_submissions
  for insert to anon, authenticated with check (true);

drop policy if exists "contact admin read" on public.contact_submissions;
create policy "contact admin read" on public.contact_submissions
  for select using (public.is_admin());

drop policy if exists "investor insert" on public.investor_inquiries;
create policy "investor insert" on public.investor_inquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "investor admin read" on public.investor_inquiries;
create policy "investor admin read" on public.investor_inquiries
  for select using (public.is_admin());

-- early access: anyone may submit, only admins may read or change
drop policy if exists "early access insert" on public.early_access_requests;
create policy "early access insert" on public.early_access_requests
  for insert to anon, authenticated with check (true);

drop policy if exists "early access admin read" on public.early_access_requests;
create policy "early access admin read" on public.early_access_requests
  for select using (public.is_admin());

drop policy if exists "early access admin update" on public.early_access_requests;
create policy "early access admin update" on public.early_access_requests
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "early access admin delete" on public.early_access_requests;
create policy "early access admin delete" on public.early_access_requests
  for delete using (public.is_admin());

-- admin messaging
drop policy if exists "messages admin read" on public.admin_messages;
create policy "messages admin read" on public.admin_messages
  for select using (public.is_admin());

drop policy if exists "messages admin insert" on public.admin_messages;
create policy "messages admin insert" on public.admin_messages
  for insert with check (public.is_admin());

drop policy if exists "messages admin update" on public.admin_messages;
create policy "messages admin update" on public.admin_messages
  for update using (public.is_admin()) with check (public.is_admin());

-- chat messages stay private to their owner
drop policy if exists "chat own" on public.chat_messages;
create policy "chat own" on public.chat_messages
  for all using (public.is_same_user(user_id)) with check (public.is_same_user(user_id));

-- --------------------------------------------------- 6. triggers

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists early_access_updated_at on public.early_access_requests;
create trigger early_access_updated_at before update on public.early_access_requests
  for each row execute function public.set_updated_at();

-- Every new auth user gets a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------- 7. Executive Admin account (JT)

-- The account is created with the temporary password 123 and a flag that
-- forces a password change on first sign-in. Change it immediately after.
do $$
declare
  admin_email text := 'jt@neurusagi.com';
  admin_password text := '123';
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = admin_email;

  if admin_id is null then
    admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id, 'authenticated', 'authenticated', admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('username', 'Jeremy Taylor'),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), admin_id, admin_id::text, 'email',
      jsonb_build_object('sub', admin_id::text, 'email', admin_email, 'email_verified', true),
      now(), now(), now()
    );
  end if;

  insert into public.profiles (id, email, username, role, must_change_password)
  values (admin_id, admin_email, 'Jeremy Taylor', 'admin', true)
  on conflict (id) do update
    set role = 'admin',
        email = excluded.email,
        must_change_password = true;

  insert into public.subscriptions (user_id, tier, status)
  select admin_id, 'tier6', 'active'
  where not exists (select 1 from public.subscriptions where user_id = admin_id);
end;
$$;

-- ------------------------------------------------------------- 8. storage
  
-- Nothing to store here yet. Attachments would go in a private bucket that is
-- reachable only through signed URLs issued by an Edge Function.
