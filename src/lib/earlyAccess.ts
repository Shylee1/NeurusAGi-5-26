import { supabase } from './supabase';

export interface EarlyAccessFormValues {
  fullName: string;
  email: string;
  company?: string;
  role?: string;
  teamSize?: string;
  useCase?: string;
  /** Hidden field used to catch bots. Real users never fill this in. */
  website?: string;
}

export interface EarlyAccessSubmission extends EarlyAccessFormValues {
  country?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  locale?: string | null;
  languages?: string | null;
  referrer?: string | null;
  landing_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_type?: string | null;
  screen?: string | null;
  platform?: string | null;
  hardware?: string | null;
  user_agent?: string | null;
  source?: string | null;
}

export type EarlyAccessResult =
  | { ok: true; duplicate?: false }
  | { ok: true; duplicate: true }
  | { ok: false; message: string };

/**
 * Region context that is available without any browser permission prompt:
 * the IANA timezone, UI locale and preferred languages. Nothing is inferred
 * from IP geolocation and no precise location is requested.
 */
export function describeTimezone(timezone: string): { country: string | null; region: string | null; city: string | null } {
  // Timezones look like "America/Chicago" or "Europe/London".
  const parts = timezone.split('/');
  if (parts.length < 2) return { country: null, region: null, city: null };
  const city = parts.slice(1).join('/').replace(/_/g, ' ');
  return { country: null, region: parts[0].replace(/_/g, ' '), city };
}

function deviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/** Collects anonymous, publicly available context about the visit. */
export function collectVisitContext(): EarlyAccessSubmission {
  const empty: EarlyAccessSubmission = {
    fullName: '',
    email: '',
    country: null,
    region: null,
    city: null,
    timezone: null,
    locale: null,
    languages: null,
    referrer: null,
    landing_path: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    device_type: null,
    screen: null,
    platform: null,
    hardware: null,
    user_agent: null,
    source: null,
  };

  if (typeof window === 'undefined') return empty;

  const params = new URLSearchParams(window.location.search);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  const geo = timezone ? describeTimezone(timezone) : { country: null, region: null, city: null };
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };

  return {
    ...empty,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    timezone,
    locale: navigator.language || null,
    languages: (navigator.languages || []).join(', ') || null,
    referrer: document.referrer || null,
    landing_path: window.location.pathname + window.location.search,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    device_type: deviceType(),
    screen: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}x`,
    platform: nav.platform || null,
    hardware: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} cores` : null,
    user_agent: navigator.userAgent,
    source: document.referrer ? 'referral' : params.get('utm_source') ? 'campaign' : 'direct',
  };
}

export async function submitEarlyAccess(values: EarlyAccessFormValues): Promise<EarlyAccessResult> {
  const email = values.email.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, message: 'Enter a valid email address so we can reach you.' };
  }
  if (!values.fullName.trim()) {
    return { ok: false, message: 'Enter your name so we know who to contact.' };
  }
  // Honeypot: silently succeed so bots do not learn they were filtered.
  if (values.website) {
    return { ok: true };
  }

  const context = collectVisitContext();
  const payload = {
    ...context,
    full_name: values.fullName.trim(),
    email,
    company: values.company?.trim() || null,
    role: values.role?.trim() || null,
    team_size: values.teamSize || null,
    use_case: values.useCase?.trim() || null,
  };

  try {
    const { error } = await supabase.from('early_access_requests').insert([payload]);

    if (!error) return { ok: true };

    if (error.code === '23505') {
      return { ok: true, duplicate: true };
    }

    if (error.code === '42P01' || error.code === 'PGRST205') {
      return {
        ok: false,
        message:
          'Early access requests are not connected to the database yet. Please email jt@neurusagi.com and we will add you manually.',
      };
    }

    if (/failed to fetch|networkerror|load failed|fetch failed/i.test(error.message ?? '')) {
      return {
        ok: false,
        message:
          'We could not reach the request service. Please try again in a moment, or email jt@neurusagi.com and we will add you manually.',
      };
    }

    return {
      ok: false,
      message: 'Something went wrong saving your request. Please try again or email jt@neurusagi.com.',
    };
  } catch {
    return {
      ok: false,
      message: 'We could not reach the server. Please try again, or email jt@neurusagi.com.',
    };
  }
}
