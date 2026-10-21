import { supabase } from './supabase';
import type {
  AdminMessage,
  EarlyAccessRequest,
  EarlyAccessStatus,
  Profile,
  Subscription,
} from '../types';

export interface EarlyAccessQuery {
  search?: string;
  status?: EarlyAccessStatus | 'all';
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'oldest' | 'name';
}

export interface Paged<T> {
  rows: T[];
  count: number;
}

const PAGE_SIZE = 25;

export async function fetchEarlyAccess({
  search = '',
  status = 'all',
  page = 0,
  pageSize = PAGE_SIZE,
  sort = 'newest',
}: EarlyAccessQuery): Promise<Paged<EarlyAccessRequest>> {
  let query = supabase
    .from('early_access_requests')
    .select('*', { count: 'exact' });

  if (status !== 'all') query = query.eq('status', status);
  if (search.trim()) {
    const term = search.trim().replace(/[%,]/g, '');
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%,use_case.ilike.%${term}%`,
    );
  }

  const from = page * pageSize;
  query = query.range(from, from + pageSize - 1);

  if (sort === 'oldest') query = query.order('created_at', { ascending: true });
  else if (sort === 'name') query = query.order('full_name', { ascending: true });
  else query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as EarlyAccessRequest[], count: count ?? 0 };
}

/** Everything from the last N days, used for metrics and CSV export. */
export async function fetchEarlyAccessWindow(days = 90): Promise<EarlyAccessRequest[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('early_access_requests')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return (data ?? []) as EarlyAccessRequest[];
}

export async function updateEarlyAccess(
  id: string,
  patch: Partial<Pick<EarlyAccessRequest, 'status' | 'notes' | 'priority'>>,
): Promise<void> {
  const payload: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (patch.status === 'approved' || patch.status === 'declined') {
    payload.decided_at = new Date().toISOString();
  }
  if (patch.status === 'reviewing' || patch.status === 'invited') {
    payload.contacted_at = new Date().toISOString();
  }
  const { error } = await supabase.from('early_access_requests').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteEarlyAccess(id: string): Promise<void> {
  const { error } = await supabase.from('early_access_requests').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function bulkUpdateEarlyAccessStatus(
  ids: string[],
  status: EarlyAccessStatus,
): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase
    .from('early_access_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw new Error(error.message);
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function updateProfile(id: string, patch: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Subscription[];
}

export async function updateSubscription(id: string, status: Subscription['status']): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchMessages(): Promise<AdminMessage[]> {
  const { data, error } = await supabase
    .from('admin_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminMessage[];
}

export interface SendMessageInput {
  subject: string;
  body: string;
  recipients: { email: string; name?: string | null }[];
  audience: AdminMessage['audience'];
  sentBy: string;
}

/**
 * Records the campaign, then hands it to the send-email Edge Function.
 * The function owns the provider credential, so no mail API key ever
 * reaches the browser.
 */
export async function sendAdminMessage({
  subject,
  body,
  recipients,
  audience,
  sentBy,
}: SendMessageInput): Promise<AdminMessage> {
  const unique = Array.from(
    new Map(recipients.map((r) => [r.email.toLowerCase(), r])).values(),
  ).filter((r) => r.email);

  if (!unique.length) throw new Error('Choose at least one recipient.');
  if (!subject.trim()) throw new Error('Add a subject line.');

  const { data: created, error: insertError } = await supabase
    .from('admin_messages')
    .insert([
      {
        created_by: sentBy,
        subject: subject.trim(),
        body,
        audience,
        recipient_count: unique.length,
        sent_count: 0,
        failed_count: 0,
        status: 'queued',
      },
    ])
    .select('*')
    .single();

  if (insertError) throw new Error(insertError.message);
  const message = created as AdminMessage;

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        messageId: message.id,
        subject: message.subject,
        html: body,
        recipients: unique.map((r) => ({ email: r.email, name: r.name ?? null })),
      },
    });
    if (error) throw error;

    const sent = Number((data as { sent?: number } | null)?.sent ?? unique.length);
    const failed = Number((data as { failed?: number } | null)?.failed ?? 0);

    await supabase
      .from('admin_messages')
      .update({
        sent_count: sent,
        failed_count: failed,
        status: failed === 0 ? 'sent' : sent > 0 ? 'partial' : 'failed',
      })
      .eq('id', message.id);

    return { ...message, sent_count: sent, failed_count: failed, status: failed === 0 ? 'sent' : sent > 0 ? 'partial' : 'failed' };
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : 'The email function is not available yet.';
    await supabase
      .from('admin_messages')
      .update({ status: 'failed', error: reason })
      .eq('id', message.id);
    throw new Error(reason);
  }
}

export function toCsv(rows: EarlyAccessRequest[]): string {
  const columns: (keyof EarlyAccessRequest)[] = [
    'created_at',
    'full_name',
    'email',
    'company',
    'role',
    'team_size',
    'use_case',
    'status',
    'region',
    'timezone',
    'locale',
    'device_type',
    'source',
    'utm_source',
    'utm_campaign',
    'referrer',
    'landing_path',
    'notes',
  ];

  const escape = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const text = String(value).replace(/"/g, '""');
    return /[",\n]/.test(text) ? `"${text}"` : text;
  };

  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => escape(row[column])).join(',')),
  ].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface Metrics {
  total: number;
  today: number;
  last7: number;
  last30: number;
  previous30: number;
  growthPercent: number | null;
  byStatus: Record<EarlyAccessStatus, number>;
  bySource: { label: string; value: number }[];
  byDevice: { label: string; value: number }[];
  byRegion: { label: string; value: number }[];
  byDay: { date: string; value: number }[];
  approvalRate: number | null;
  topCampaigns: { label: string; value: number }[];
}

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Derives every waitlist metric from one bounded query result. */
export function computeMetrics(rows: EarlyAccessRequest[]): Metrics {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = startOfDay(now).getTime();

  const byStatus: Record<EarlyAccessStatus, number> = {
    new: 0,
    reviewing: 0,
    approved: 0,
    invited: 0,
    onboarded: 0,
    declined: 0,
  };

  const source = new Map<string, number>();
  const device = new Map<string, number>();
  const region = new Map<string, number>();
  const campaign = new Map<string, number>();
  const day = new Map<string, number>();

  let today = 0;
  let last7 = 0;
  let last30 = 0;
  let previous30 = 0;

  for (const row of rows) {
    const created = new Date(row.created_at).getTime();
    const ageDays = (now.getTime() - created) / dayMs;

    if (row.status && byStatus[row.status] !== undefined) byStatus[row.status] += 1;
    if (created >= todayStart) today += 1;
    if (ageDays <= 7) last7 += 1;
    if (ageDays <= 30) last30 += 1;
    else if (ageDays <= 60) previous30 += 1;

    const bump = (map: Map<string, number>, key?: string | null) => {
      const label = (key || 'Unknown').trim() || 'Unknown';
      map.set(label, (map.get(label) ?? 0) + 1);
    };

    bump(source, row.source || (row.referrer ? 'referral' : 'direct'));
    bump(device, row.device_type);
    bump(region, row.region || row.country);
    if (row.utm_campaign) bump(campaign, row.utm_campaign);

    const key = new Date(row.created_at).toISOString().slice(0, 10);
    day.set(key, (day.get(key) ?? 0) + 1);
  }

  const byDay: { date: string; value: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * dayMs).toISOString().slice(0, 10);
    byDay.push({ date, value: day.get(date) ?? 0 });
  }

  const sortDesc = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

  const approvedish = byStatus.approved + byStatus.invited + byStatus.onboarded;

  return {
    total: rows.length,
    today,
    last7,
    last30,
    previous30,
    growthPercent:
      previous30 === 0 ? (last30 > 0 ? 100 : null) : Math.round(((last30 - previous30) / previous30) * 100),
    byStatus,
    bySource: sortDesc(source),
    byDevice: sortDesc(device),
    byRegion: sortDesc(region),
    byDay,
    approvalRate: rows.length ? Math.round((approvedish / rows.length) * 100) : null,
    topCampaigns: sortDesc(campaign),
  };
}
