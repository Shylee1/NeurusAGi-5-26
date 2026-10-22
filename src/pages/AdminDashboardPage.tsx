import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Check,
  Copy,
  Download,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Send,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { AdminMessage, EarlyAccessRequest, EarlyAccessStatus, Profile, Subscription } from '../types';
import {
  bulkUpdateEarlyAccessStatus,
  computeMetrics,
  deleteEarlyAccess,
  downloadCsv,
  fetchEarlyAccess,
  fetchEarlyAccessWindow,
  fetchMessages,
  fetchProfiles,
  fetchSubscriptions,
  sendAdminMessage,
  toCsv,
  updateEarlyAccess,
  updateProfile,
  updateSubscription,
} from '../lib/admin';
import { Seo } from '../components/Seo';

type Tab = 'overview' | 'early-access' | 'users' | 'subscriptions' | 'messages';

const STATUS_LABELS: Record<EarlyAccessStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  approved: 'Approved',
  invited: 'Invited',
  onboarded: 'Onboarded',
  declined: 'Declined',
};

const STATUS_CLASSES: Record<EarlyAccessStatus, string> = {
  new: 'bg-primary/15 text-primary',
  reviewing: 'bg-secondary/15 text-secondary',
  approved: 'bg-emerald-500/15 text-emerald-300',
  invited: 'bg-sky-500/15 text-sky-300',
  onboarded: 'bg-emerald-600/20 text-emerald-200',
  declined: 'bg-destructive/15 text-destructive',
};

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'early-access', label: 'Early access', icon: UserCheck },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', icon: TrendingUp },
  { id: 'messages', label: 'Messaging', icon: Mail },
];

const DAY_LABELS = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function AdminDashboardPage() {
  const { user, profile } = useAuthStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [windowRows, setWindowRows] = useState<EarlyAccessRequest[]>([]);
  const [rows, setRows] = useState<EarlyAccessRequest[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EarlyAccessStatus | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<EarlyAccessRequest | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [audience, setAudience] = useState<'selected' | 'all' | 'new'>('all');
  const [sending, setSending] = useState(false);

  const pageSize = 25;
  const metrics = useMemo(() => computeMetrics(windowRows), [windowRows]);

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [windowData, paged, people, subs, sent] = await Promise.all([
        fetchEarlyAccessWindow(90),
        fetchEarlyAccess({ search, status: statusFilter, page, pageSize, sort }),
        fetchProfiles(),
        fetchSubscriptions(),
        fetchMessages(),
      ]);
      setWindowRows(windowData);
      setRows(paged.rows);
      setCount(paged.count);
      setProfiles(people);
      setSubscriptions(subs);
      setMessages(sent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, sort, statusFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Keep the metrics reasonably live without hammering the database.
  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchEarlyAccessWindow(90).then(setWindowRows).catch(() => undefined);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const refresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const applyStatus = async (id: string, status: EarlyAccessStatus) => {
    try {
      await updateEarlyAccess(id, { status });
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
      setWindowRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
      if (detail?.id === id) setDetail({ ...detail, status });
      toast.success(`Marked as ${STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const saveNotes = async () => {
    if (!detail) return;
    try {
      await updateEarlyAccess(detail.id, { notes: notesDraft });
      toast.success('Notes saved');
      setDetail({ ...detail, notes: notesDraft });
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save notes');
    }
  };

  const removeRequest = async (id: string) => {
    if (!window.confirm('Delete this early access request permanently?')) return;
    try {
      await deleteEarlyAccess(id);
      toast.success('Request deleted');
      setDetail(null);
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const applyBulk = async (status: EarlyAccessStatus) => {
    if (!selected.length) return;
    try {
      await bulkUpdateEarlyAccessStatus(selected, status);
      toast.success(`${selected.length} request(s) updated`);
      setSelected([]);
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk update failed');
    }
  };

  const exportCsv = () => {
    downloadCsv(
      `neurusagi-early-access-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(windowRows),
    );
  };

  const recipientsForAudience = () => {
    if (audience === 'selected') {
      return rows
        .filter((row) => selected.includes(row.id))
        .map((row) => ({ email: row.email, name: row.full_name }));
    }
    if (audience === 'new') {
      return windowRows
        .filter((row) => row.status === 'new')
        .map((row) => ({ email: row.email, name: row.full_name }));
    }
    return windowRows.map((row) => ({ email: row.email, name: row.full_name }));
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const recipients = recipientsForAudience();
    if (!recipients.length) {
      toast.error('That audience has no recipients yet.');
      return;
    }
    setSending(true);
    try {
      await sendAdminMessage({
        subject: messageSubject,
        body: wrapEmail(messageBody),
        recipients,
        audience: audience === 'new' ? 'status' : audience,
        sentBy: user?.id ?? 'unknown',
      });
      toast.success(`Sent to ${recipients.length} recipient(s)`);
      setMessageSubject('');
      setMessageBody('');
      fetchMessages().then(setMessages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sending failed');
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Email copied');
    } catch {
      toast.error('Clipboard blocked by the browser');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 aria-hidden="true" className="w-8 h-8 animate-spin text-primary" />
        <span className="sr-only">Loading dashboard</span>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="min-h-screen">
      <Seo
        title="Executive Admin Dashboard"
        description="Internal NeurusAGi administration."
        path="/admin"
        noindex
      />

      <section className="section-container">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Executive admin</p>
              <h1 className="heading-xl mb-1">Dashboard</h1>
              <p className="text-muted-foreground">
                Signed in as {profile?.email || user?.email}
                {profile?.role === 'admin' && ' · administrator'}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={refresh} className="btn-ghost text-sm" disabled={refreshing}>
                <RefreshCw aria-hidden="true" className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing' : 'Refresh'}</span>
              </button>
              <Link to="/change-password" className="btn-secondary text-sm">
                Change password
              </Link>
            </div>
          </div>

          <div role="tablist" aria-label="Dashboard sections" className="flex flex-wrap gap-2 mb-8">
            {TABS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={tab === item.id}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    tab === item.id
                      ? 'bg-primary text-black'
                      : 'text-muted-foreground hover:text-foreground border border-primary/15'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
              {error}
              <p className="mt-2 text-xs text-muted-foreground">
                If the database has just been created, run the migration in{' '}
                <code>supabase/migrations</code> and reload.
              </p>
            </div>
          )}

          {tab === 'overview' && (
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Metric label="Total requests" value={metrics.total} hint="Last 90 days" />
                <Metric label="Today" value={metrics.today} hint="Since midnight" />
                <Metric
                  label="Last 7 days"
                  value={metrics.last7}
                  hint={metrics.growthPercent === null ? 'No prior period' : `${metrics.growthPercent >= 0 ? '+' : ''}${metrics.growthPercent}% vs prior 30 days`}
                />
                <Metric
                  label="Approval rate"
                  value={metrics.approvalRate === null ? 'n/a' : `${metrics.approvalRate}%`}
                  hint="Approved, invited or onboarded"
                />
              </div>

              <Panel title="Requests over the last 30 days">
                <div className="flex items-end gap-1 h-40" role="img" aria-label="Daily early access requests for the last 30 days">
                  {metrics.byDay.map((point) => {
                    const max = Math.max(...metrics.byDay.map((p) => p.value), 1);
                    return (
                      <div key={point.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100">
                          {point.value}
                        </span>
                        <div
                          className="w-full rounded-t bg-primary/60 group-hover:bg-primary transition-colors"
                          style={{ height: `${Math.max(3, (point.value / max) * 100)}%` }}
                          title={`${DAY_LABELS(point.date)}: ${point.value}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>{DAY_LABELS(metrics.byDay[0]?.date ?? '')}</span>
                  <span>{DAY_LABELS(metrics.byDay[metrics.byDay.length - 1]?.date ?? '')}</span>
                </div>
              </Panel>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Panel title="Pipeline">
                  <ul className="space-y-3">
                    {(Object.keys(STATUS_LABELS) as EarlyAccessStatus[]).map((status) => (
                      <li key={status} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
                        <span className="font-semibold">{metrics.byStatus[status]}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="Source">
                  <Breakdown items={metrics.bySource} />
                </Panel>
                <Panel title="Region (from timezone)">
                  <Breakdown items={metrics.byRegion} />
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Panel title="Device mix">
                  <Breakdown items={metrics.byDevice} />
                </Panel>
                <Panel title="Top campaigns">
                  {metrics.topCampaigns.length ? (
                    <Breakdown items={metrics.topCampaigns} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No UTM campaigns recorded yet.</p>
                  )}
                </Panel>
              </div>

              <Panel title="Latest requests">
                <ul className="divide-y divide-primary/10">
                  {windowRows.slice(0, 6).map((row) => (
                    <li key={row.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{row.full_name}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={row.status} />
                        <time className="text-xs text-muted-foreground" dateTime={row.created_at}>
                          {new Date(row.created_at).toLocaleDateString()}
                        </time>
                      </div>
                    </li>
                  ))}
                  {!windowRows.length && (
                    <li className="py-6 text-sm text-muted-foreground">
                      No requests yet. The form is live in the <Link to="/#early-access" className="text-primary">Request Early Access</Link> section of the homepage.
                    </li>
                  )}
                </ul>
              </Panel>
            </div>
          )}

          {tab === 'early-access' && (
            <div role="tabpanel" id="panel-early-access" aria-labelledby="tab-early-access" className="space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1">
                  <label htmlFor="wa-search" className="sr-only">
                    Search early access requests
                  </label>
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="wa-search"
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setPage(0);
                      setSearch(e.target.value);
                    }}
                    placeholder="Search name, email, company or use case"
                    className="input-field w-full pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label htmlFor="wa-status" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="wa-status"
                    value={statusFilter}
                    onChange={(e) => {
                      setPage(0);
                      setStatusFilter(e.target.value as EarlyAccessStatus | 'all');
                    }}
                    className="input-field"
                  >
                    <option value="all">All statuses</option>
                    {(Object.keys(STATUS_LABELS) as EarlyAccessStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="wa-sort" className="sr-only">
                    Sort requests
                  </label>
                  <select
                    id="wa-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="input-field"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A to Z</option>
                  </select>
                  <button type="button" onClick={exportCsv} className="btn-ghost text-sm">
                    <Download aria-hidden="true" className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <span>{selected.length} selected</span>
                  {(Object.keys(STATUS_LABELS) as EarlyAccessStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => applyBulk(status)}
                      className="rounded-md border border-primary/20 px-2 py-1 text-xs hover:bg-primary/10"
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="overflow-x-auto glass-strong rounded-2xl">
                <table className="w-full text-sm">
                  <caption className="sr-only">Early access requests</caption>
                  <thead>
                    <tr className="border-b border-primary/15 text-left">
                      <th scope="col" className="p-3 w-10">
                        <input
                          type="checkbox"
                          aria-label="Select all rows on this page"
                          checked={selected.length === rows.length && rows.length > 0}
                          onChange={(e) => setSelected(e.target.checked ? rows.map((row) => row.id) : [])}
                        />
                      </th>
                      <th scope="col" className="p-3">Name</th>
                      <th scope="col" className="p-3">Email</th>
                      <th scope="col" className="p-3">Company</th>
                      <th scope="col" className="p-3">Region</th>
                      <th scope="col" className="p-3">Status</th>
                      <th scope="col" className="p-3">Requested</th>
                      <th scope="col" className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-primary/10 hover:bg-primary/5">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.full_name}`}
                            checked={selected.includes(row.id)}
                            onChange={(e) =>
                              setSelected((prev) =>
                                e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
                              )
                            }
                          />
                        </td>
                        <td className="p-3">{row.full_name}</td>
                        <td className="p-3 text-muted-foreground">{row.email}</td>
                        <td className="p-3 text-muted-foreground">{row.company || '—'}</td>
                        <td className="p-3 text-muted-foreground">{row.region || row.country || '—'}</td>
                        <td className="p-3"><StatusBadge status={row.status} /></td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {new Date(row.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="rounded p-1.5 hover:bg-primary/10"
                              aria-label={`Open details for ${row.full_name}`}
                              onClick={() => {
                                setDetail(row);
                                setNotesDraft(row.notes ?? '');
                              }}
                            >
                              <Activity aria-hidden="true" className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1.5 hover:bg-primary/10"
                              aria-label={`Copy email for ${row.full_name}`}
                              onClick={() => copyEmail(row.email)}
                            >
                              <Copy aria-hidden="true" className="w-4 h-4" />
                            </button>
                            <a
                              href={`mailto:${row.email}?subject=${encodeURIComponent('Your NeurusAGi early access request')}`}
                              className="rounded p-1.5 hover:bg-primary/10"
                              aria-label={`Email ${row.full_name}`}
                            >
                              <Mail aria-hidden="true" className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          No requests match this view yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  {count} total · page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div role="tabpanel" id="panel-users" aria-labelledby="tab-users">
              <Panel title={`Platform users (${profiles.length})`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Registered users</caption>
                    <thead>
                      <tr className="border-b border-primary/15 text-left">
                        <th scope="col" className="p-3">Email</th>
                        <th scope="col" className="p-3">Username</th>
                        <th scope="col" className="p-3">Role</th>
                        <th scope="col" className="p-3">Joined</th>
                        <th scope="col" className="p-3 text-right">Role control</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((person) => (
                        <tr key={person.id} className="border-b border-primary/10">
                          <td className="p-3">{person.email}</td>
                          <td className="p-3 text-muted-foreground">{person.username || '—'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${person.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-primary/15 text-primary'}`}>
                              {person.role}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(person.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              className="text-xs rounded border border-primary/20 px-2 py-1 hover:bg-primary/10"
                              onClick={async () => {
                                const nextRole = person.role === 'admin' ? 'user' : 'admin';
                                if (!window.confirm(`Change ${person.email} to ${nextRole}?`)) return;
                                try {
                                  await updateProfile(person.id, { role: nextRole });
                                  toast.success('Role updated');
                                  loadAll();
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : 'Update failed');
                                }
                              }}
                            >
                              Make {person.role === 'admin' ? 'user' : 'admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!profiles.length && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No registered users yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}

          {tab === 'subscriptions' && (
            <div role="tabpanel" id="panel-subscriptions" aria-labelledby="tab-subscriptions">
              <Panel title={`Subscriptions (${subscriptions.length})`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Subscriptions</caption>
                    <thead>
                      <tr className="border-b border-primary/15 text-left">
                        <th scope="col" className="p-3">User</th>
                        <th scope="col" className="p-3">Tier</th>
                        <th scope="col" className="p-3">Status</th>
                        <th scope="col" className="p-3">Started</th>
                        <th scope="col" className="p-3 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-primary/10">
                          <td className="p-3 font-mono text-xs">{sub.user_id.slice(0, 8)}…</td>
                          <td className="p-3 uppercase">{sub.tier}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sub.status === 'active'
                                ? 'bg-primary/15 text-primary'
                                : sub.status === 'suspended'
                                  ? 'bg-destructive/20 text-destructive'
                                  : 'bg-muted/20 text-muted-foreground'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <select
                              aria-label={`Change status for subscription ${sub.id.slice(0, 8)}`}
                              value={sub.status}
                              onChange={async (e) => {
                                try {
                                  await updateSubscription(sub.id, e.target.value as Subscription['status']);
                                  toast.success('Subscription updated');
                                  loadAll();
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : 'Update failed');
                                }
                              }}
                              className="input-field text-xs"
                            >
                              <option value="active">active</option>
                              <option value="suspended">suspended</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {!subscriptions.length && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No subscriptions yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}

          {tab === 'messages' && (
            <div role="tabpanel" id="panel-messages" aria-labelledby="tab-messages" className="space-y-6">
              <Panel title="Message the early access list">
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="input-container">
                    <label className="input-label" htmlFor="msg-audience">Audience</label>
                    <select
                      id="msg-audience"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as typeof audience)}
                      className="input-field w-full"
                    >
                      <option value="all">Everyone on the early access list ({windowRows.length})</option>
                      <option value="new">Only requests not yet reviewed</option>
                      <option value="selected">Selected rows from the early access table ({selected.length})</option>
                    </select>
                  </div>
                  <div className="input-container">
                    <label className="input-label" htmlFor="msg-subject">Subject</label>
                    <input
                      id="msg-subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="input-field w-full"
                      required
                      placeholder="Your NeurusAGi access is ready"
                    />
                  </div>
                  <div className="input-container">
                    <label className="input-label" htmlFor="msg-body">Message</label>
                    <textarea
                      id="msg-body"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="input-field w-full resize-y"
                      rows={6}
                      required
                      placeholder="Write the update. Blank lines become paragraphs."
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={sending}>
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send aria-hidden="true" className="w-4 h-4" />
                        Send
                      </span>
                    )}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Delivery runs through the <code>send-email</code> Edge Function. Campaigns are
                    recorded either way, so nothing is lost if the provider is not configured yet.
                  </p>
                </form>
              </Panel>

              <Panel title="Message history">
                <ul className="divide-y divide-primary/10">
                  {messages.map((message) => (
                    <li key={message.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()} · {message.audience} ·{' '}
                          {message.sent_count}/{message.recipient_count} delivered
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        message.status === 'sent'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : message.status === 'failed'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-primary/15 text-primary'
                      }`}>
                        {message.status}
                      </span>
                    </li>
                  ))}
                  {!messages.length && (
                    <li className="py-6 text-sm text-muted-foreground">No messages sent yet.</li>
                  )}
                </ul>
              </Panel>
            </div>
          )}

          {detail && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
              <button
                type="button"
                aria-label="Close details"
                className="absolute inset-0 bg-black/80"
                onClick={() => setDetail(null)}
              />
              <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-strong rounded-2xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 id="request-detail-title" className="heading-md text-2xl">{detail.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{detail.email}</p>
                  </div>
                  <StatusBadge status={detail.status} />
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                  <Detail label="Company" value={detail.company} />
                  <Detail label="Role" value={detail.role} />
                  <Detail label="Team size" value={detail.team_size} />
                  <Detail label="Requested" value={new Date(detail.created_at).toLocaleString()} />
                  <Detail label="Region" value={[detail.city, detail.region].filter(Boolean).join(', ') || null} />
                  <Detail label="Timezone" value={detail.timezone} />
                  <Detail label="Language" value={detail.locale} />
                  <Detail label="Device" value={[detail.device_type, detail.screen].filter(Boolean).join(' · ') || null} />
                  <Detail label="Source" value={[detail.source, detail.utm_source, detail.utm_campaign].filter(Boolean).join(' · ') || null} />
                  <Detail label="Referrer" value={detail.referrer} />
                  <Detail label="Landing page" value={detail.landing_path} />
                  <Detail label="Platform" value={detail.platform} />
                </dl>

                {detail.use_case && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2">What they want to build</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.use_case}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="request-notes" className="input-label">Internal notes</label>
                  <textarea
                    id="request-notes"
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={3}
                    className="input-field w-full resize-y"
                    placeholder="Call notes, follow-up date, context"
                  />
                  <button type="button" onClick={saveNotes} className="mt-2 btn-secondary text-sm">
                    <Check aria-hidden="true" className="w-4 h-4" />
                    Save notes
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(Object.keys(STATUS_LABELS) as EarlyAccessStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => applyStatus(detail.id, status)}
                      className={`rounded-md px-3 py-1.5 text-xs border ${
                        detail.status === status
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-primary/20 hover:bg-primary/10'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-primary/15 pt-4">
                  <a href={`mailto:${detail.email}`} className="btn-primary text-sm">
                    <Mail aria-hidden="true" className="w-4 h-4" />
                    Reply by email
                  </a>
                  <button type="button" onClick={() => copyEmail(detail.email)} className="btn-ghost text-sm">
                    <Copy aria-hidden="true" className="w-4 h-4" />
                    Copy email
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRequest(detail.id)}
                    className="ml-auto text-sm text-destructive hover:underline"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4 inline" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="feature-block">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold gradient-text">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-strong rounded-2xl p-5 sm:p-6">
      <h2 className="heading-md text-xl mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Breakdown({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (!items.length) return <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground truncate pr-3">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/10" aria-hidden="true">
            <div className="h-full rounded-full bg-primary/60" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: EarlyAccessStatus }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${STATUS_CLASSES[status] ?? 'bg-primary/15 text-primary'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value || '—'}</dd>
    </div>
  );
}

function wrapEmail(body: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('');
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1a1c">${paragraphs}<p style="margin-top:24px;font-size:12px;color:#5b6b6d">NeurusAGi · jt@neurusagi.com</p></div>`;
}
