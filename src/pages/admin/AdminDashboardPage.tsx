import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Clock, FileText, Star, Briefcase, Share2, Settings, ShieldOff, MessageSquare, TrendingUp, Eye, Building2, Layout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

interface Stats {
  projects: number;
  timeline: number;
  articles: number;
  testimonials: number;
  contactSubmissions: number;
}

interface RecentSubmission {
  id: string;
  name: string;
  email: string;
  reason: string;
  created_at: string;
}

const NAV_CARDS = [
  { to: '/admin/home',       label: 'Home Page',     icon: Layout,     description: 'Hero text, banner slides, expertise areas' },
  { to: '/admin/projects',   label: 'Projects',      icon: FolderOpen, description: 'Manage case studies and project archive' },
  { to: '/admin/employers',  label: 'Employers',     icon: Building2,  description: 'Manage employer list and link to projects' },
  { to: '/admin/timeline',   label: 'Timeline',      icon: Clock,      description: 'Add career milestones, awards, projects' },
  { to: '/admin/articles',   label: 'Articles',      icon: FileText,   description: 'Write and publish long-form articles' },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star,      description: 'Manage client and peer quotes' },
  { to: '/admin/work-history', label: 'Work History', icon: Briefcase, description: 'Update career and role history' },
  { to: '/admin/social',     label: 'Social Media',  icon: Share2,     description: 'Update social profile URLs' },
  { to: '/admin/settings',   label: 'Site Settings', icon: Settings,   description: 'Bio, tagline, contact details, SEO' },
];

const REASON_LABELS: Record<string, string> = {
  speaking: 'Speaking',
  advisory: 'Advisory',
  media: 'Media',
  general: 'General',
};

function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function AdminDashboardPage() {
  const { profile, listMfaFactors } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentSubmission[]>([]);

  useEffect(() => {
    listMfaFactors().then(factors => {
      setMfaEnabled(factors.some(f => f.status === 'verified'));
    });

    // Fetch counts in parallel
    Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('timeline_entries').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('id,name,email,reason,created_at').order('created_at', { ascending: false }).limit(5),
    ]).then(([projects, timeline, articles, testimonials, contacts, recentContacts]) => {
      setStats({
        projects: projects.count ?? 0,
        timeline: timeline.count ?? 0,
        articles: articles.count ?? 0,
        testimonials: testimonials.count ?? 0,
        contactSubmissions: contacts.count ?? 0,
      });
      setRecent(recentContacts.data ?? []);
    });
  }, []);

  return (
    <div>
      <AdminBreadcrumb items={[]} />

      {/* 2FA nudge banner */}
      {mfaEnabled === false && (
        <Link
          to="/admin/mfa"
          className="flex items-center gap-3 mb-6 px-4 py-3.5 rounded-xl bg-accent-amber/10 border border-accent-amber/30 hover:bg-accent-amber/15 transition-colors group"
        >
          <ShieldOff size={18} className="text-accent-amber flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">Two-factor authentication is not enabled</p>
            <p className="text-xs text-light-muted dark:text-dark-muted">Set up Microsoft Authenticator now to protect your account.</p>
          </div>
          <span className="text-xs font-medium text-accent-cyan group-hover:underline flex-shrink-0">Set up 2FA &rarr;</span>
        </Link>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p className="text-sm text-light-secondary dark:text-dark-secondary">
          Site overview and content management.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Projects',     value: stats?.projects,           icon: FolderOpen, to: '/admin/projects',     color: 'text-accent-cyan' },
          { label: 'Articles',     value: stats?.articles,           icon: FileText,   to: '/admin/articles',     color: 'text-accent-green' },
          { label: 'Timeline',     value: stats?.timeline,           icon: Clock,      to: '/admin/timeline',     color: 'text-accent-blue' },
          { label: 'Testimonials', value: stats?.testimonials,       icon: Star,       to: '/admin/testimonials', color: 'text-accent-gold' },
          { label: 'Enquiries',    value: stats?.contactSubmissions,  icon: MessageSquare, to: null,              color: 'text-accent-orange' },
        ].map(({ label, value, icon: Icon, to, color }) => (
          <div
            key={label}
            className="card p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-light-muted dark:text-dark-muted">{label}</span>
              <Icon size={15} className={color} />
            </div>
            <div className="text-2xl font-bold text-light-text dark:text-dark-text">
              {value === undefined ? <span className="inline-block w-8 h-6 bg-light-elevated dark:bg-dark-elevated rounded animate-pulse" /> : value}
            </div>
            {to && (
              <Link to={to} className="text-xs text-accent-cyan hover:underline flex items-center gap-1 mt-auto">
                Manage <TrendingUp size={11} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Two-column: nav cards + recent enquiries */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Nav cards */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">Content Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NAV_CARDS.map(({ to, label, icon: Icon, description }) => (
              <Link
                key={to}
                to={to}
                className="card card-hover p-4 flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-cyan/20 transition-colors">
                  <Icon size={16} className="text-accent-cyan" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-0.5">{label}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent enquiries */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">Recent Enquiries</h2>
          <div className="card overflow-hidden">
            {recent.length === 0 && stats !== null && (
              <div className="px-4 py-8 text-center text-xs text-light-muted dark:text-dark-muted">
                No enquiries yet.
              </div>
            )}
            {recent.length === 0 && stats === null && (
              <div className="space-y-1 p-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}
              </div>
            )}
            {recent.map((s, i) => (
              <div key={s.id} className={`px-4 py-3 flex items-start gap-3 ${i > 0 ? 'border-t border-light-border dark:border-dark-border' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-accent-cyan/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye size={13} className="text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{s.name}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted truncate">{s.email}</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan mt-1 inline-block">
                    {REASON_LABELS[s.reason] ?? s.reason}
                  </span>
                </div>
                <span className="text-[10px] text-light-muted dark:text-dark-muted flex-shrink-0 mt-0.5">{formatRelative(s.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
