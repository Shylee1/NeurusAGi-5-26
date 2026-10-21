// Sends an admin message to early access recipients.
//
// Secrets (Supabase → Project Settings → Edge Functions → Secrets):
//   RESEND_API_KEY  API key from the email provider
//   MAIL_FROM       e.g. "NeurusAGi <updates@neurusagi.com>"
//
// Without RESEND_API_KEY the function still records the attempt and reports
// every recipient as failed, so nothing is silently lost.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Recipient {
  email: string;
  name?: string | null;
}

interface Payload {
  messageId?: string;
  subject: string;
  html: string;
  recipients: Recipient[];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing authorization' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM') ?? 'NeurusAGi <no-reply@neurusagi.com>';

  const admin = createClient(supabaseUrl, serviceKey);

  // Only an admin may send. The caller's own JWT identifies them.
  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Invalid session' }, 401);

  const { data: profile } = await admin
    .from('profiles')
    .select('role, status')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin' || profile?.status === 'suspended') {
    return json({ error: 'Administrator access required' }, 403);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const recipients = (payload.recipients ?? []).filter((r) => r?.email);
  if (!payload.subject || !payload.html || recipients.length === 0) {
    return json({ error: 'subject, html and at least one recipient are required' }, 400);
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    if (!resendKey) {
      failed += 1;
      errors.push('RESEND_API_KEY is not configured');
      break;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [recipient.email],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      if (!response.ok) {
        failed += 1;
        errors.push(`${recipient.email}: ${response.status} ${await response.text()}`);
      } else {
        sent += 1;
      }
    } catch (error) {
      failed += 1;
      errors.push(`${recipient.email}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    // Respect provider rate limits on larger lists.
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  if (payload.messageId) {
    await admin
      .from('admin_messages')
      .update({
        sent_count: sent,
        failed_count: failed,
        status: failed === 0 ? 'sent' : sent > 0 ? 'partial' : 'failed',
        error: errors.length ? errors.slice(0, 5).join(' | ') : null,
      })
      .eq('id', payload.messageId);
  }

  return json({
    sent,
    failed,
    configured: Boolean(resendKey),
    errors: errors.slice(0, 5),
  });
});
