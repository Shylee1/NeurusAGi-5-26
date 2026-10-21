import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when real credentials are present. The UI uses this to explain the
 * situation instead of failing with a network error.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[NeurusAGi] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. ' +
      'Forms and accounts will not work until a Supabase project is connected.',
  );
}

/**
 * Kept valid even when unconfigured so the prerender build and static pages can
 * render. Requests fail politely at call time rather than at import time.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function getSupabaseClient() {
  return supabase;
}
