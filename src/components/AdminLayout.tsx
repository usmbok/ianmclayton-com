import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Clock, FileText, Star,
  Briefcase, Share2, Settings, LogOut, Menu, X, ChevronRight,
  Globe, ShieldCheck, Home, Building2, Layout, BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin',      label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/home', label: 'Home Page',  icon: Layout,          exact: false },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/projects',   label: 'Projects',   icon: FolderOpen, exact: false },
      { to: '/admin/use-cases',  label: 'Use Cases',  icon: BookOpen,   exact: false },
      { to: '/admin/employers',  label: 'Employers',  icon: Building2,  exact: false },
      { to: '/admin/timeline', label: 'Timeline', icon: Clock, exact: false },
      { to: '/admin/articles', label: 'Articles', icon: FileText, exact: false },
      { to: '/admin/testimonials', label: 'Testimonials', icon: Star, exact: false },
      { to: '/admin/work-history', label: 'Work History', icon: Briefcase, exact: false },
    ],
  },
  {
    label: 'Site',
    items: [
      { to: '/admin/social', label: 'Social Media', icon: Share2, exact: false },
      { to: '/admin/mfa', label: 'Two-Factor Auth', icon: ShieldCheck, exact: false },
      { to: '/admin/settings', label: 'Site Settings', icon: Settings, exact: false },
    ],
  },
];

function NavItem({ to, label, icon: Icon, exact }: { to: string; label: string; icon: React.ElementType; exact: boolean }) {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-accent-cyan/10 text-accent-cyan'
          : 'text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated hover:text-light-text dark:hover:text-dark-text'
      }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      {label}
    </Link>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-light-border dark:border-dark-border">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-cyan flex items-center justify-center">
            <LayoutDashboard size={14} className="text-white dark:text-dark-bg" />
          </div>
          <span className="text-sm font-semibold text-light-text dark:text-dark-text">Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded text-light-muted dark:text-dark-muted">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-light-border dark:border-dark-border px-3 py-4 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
        >
          <Globe size={16} />
          View site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <div className="flex items-center justify-between px-3 pt-2 mt-1 border-t border-light-border dark:border-dark-border">
          <div className="min-w-0">
            <p className="text-xs font-medium text-light-text dark:text-dark-text truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-[11px] text-light-muted dark:text-dark-muted truncate">{profile?.email}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-elevated dark:bg-dark-bg flex transition-colors duration-300">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 border-r border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-64 flex flex-col bg-light-bg dark:bg-dark-elevated border-r border-light-border dark:border-dark-border">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-bg">
            <Menu size={20} className="text-light-text dark:text-dark-text" />
          </button>
          <span className="text-sm font-semibold text-light-text dark:text-dark-text flex-1">Admin</span>
          <Link to="/" title="Go to public site" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-bg text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
            <Home size={18} />
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-light-muted dark:text-dark-muted mb-6">
      <Link
        to="/"
        title="Go to public site"
        className="flex items-center p-1 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated hover:text-accent-cyan transition-colors"
      >
        <Home size={14} />
      </Link>
      <ChevronRight size={14} className="opacity-40" />
      <Link to="/admin" className="hover:text-light-text dark:hover:text-dark-text transition-colors">Admin</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={14} />
          {item.to ? (
            <Link to={item.to} className="hover:text-light-text dark:hover:text-dark-text transition-colors">{item.label}</Link>
          ) : (
            <span className="text-light-text dark:text-dark-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
