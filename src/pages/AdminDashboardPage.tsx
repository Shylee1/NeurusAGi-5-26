import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Subscription, ContactSubmission, InvestorInquiry } from '../types';
import { Users, DollarSign, Mail, TrendingUp, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    contactSubmissions: 0,
    investorInquiries: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      // Load contact submissions
      const { data: contactData } = await supabase
        .from('contact_submissions')
        .select('id')
        .eq('status', 'new');

      // Load investor inquiries
      const { data: investorData } = await supabase
        .from('investor_inquiries')
        .select('id')
        .eq('status', 'new');

      if (usersData) setUsers(usersData);
      if (subsData) setSubscriptions(subsData);

      setStats({
        totalUsers: usersData?.length || 0,
        activeSubscriptions: subsData?.filter(s => s.status === 'active').length || 0,
        contactSubmissions: contactData?.length || 0,
        investorInquiries: investorData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seo = (
    <SEO
      title="Admin Dashboard | NeurusAGi"
      description="Private NeurusAGi administration dashboard."
      path="/admin"
      noindex
    />
  );

  if (loading) {
    return (
      <>
        {seo}
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" role="status" aria-label="Loading administration dashboard" />
        </div>
      </>
    );
  }

  return (
    <>
      {seo}
      <div className="min-h-screen">
      <section className="section-container" aria-labelledby="admin-title">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 id="admin-title" className="heading-xl mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your NeurusAGi platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="feature-block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-3xl font-bold gradient-text">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-primary/30" aria-hidden="true" />
              </div>
            </div>

            <div className="feature-block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
                  <p className="text-3xl font-bold gradient-text">{stats.activeSubscriptions}</p>
                </div>
                <DollarSign className="w-12 h-12 text-primary/30" aria-hidden="true" />
              </div>
            </div>

            <div className="feature-block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">New Contacts</p>
                  <p className="text-3xl font-bold gradient-text">{stats.contactSubmissions}</p>
                </div>
                <Mail className="w-12 h-12 text-primary/30" aria-hidden="true" />
              </div>
            </div>

            <div className="feature-block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Investor Inquiries</p>
                  <p className="text-3xl font-bold gradient-text">{stats.investorInquiries}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-primary/30" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="glass-strong rounded-2xl p-8 neural-glow mb-8">
            <h2 className="heading-md text-2xl mb-6">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">Recent NeurusAGi subscriptions</caption>
                <caption className="sr-only">Recent NeurusAGi users</caption>
                <thead>
                  <tr className="border-b border-primary/20">
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Username</th>
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Location</th>
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-sm">{user.username || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {user.location_city ? `${user.location_city}, ${user.location_country}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="glass-strong rounded-2xl p-8 neural-glow">
            <h2 className="heading-md text-2xl mb-6">Recent Subscriptions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User ID</th>
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tier</th>
                    <th scope="col" className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.slice(0, 10).map((sub) => (
                    <tr key={sub.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-xs">{sub.user_id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-sm uppercase">{sub.tier}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sub.status === 'active' ? 'bg-primary/20 text-primary' :
                          sub.status === 'suspended' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted/20 text-muted-foreground'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
