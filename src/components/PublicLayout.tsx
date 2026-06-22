import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, Lock, Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { SocialIcons } from './SocialIcons';

const navLinks = [
  { to: '/', label: 'Home', icon: true },
  { to: '/about', label: 'About' },
  { to: '/work-history', label: 'Work History' },
  { to: '/projects', label: 'Projects' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/articles', label: 'Articles' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-lg font-semibold tracking-tight text-light-text dark:text-dark-text">
              Ian M. Clayton
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  title={link.label}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-accent-cyan bg-light-elevated dark:bg-dark-elevated'
                      : 'text-light-secondary dark:text-dark-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-elevated'
                  }`}
                >
                  {link.icon ? <Home size={16} /> : link.label}
                </Link>
              ))}

              <div className="ml-2 pl-2 border-l border-light-border dark:border-dark-border flex items-center gap-1">
                <ThemeToggle />
                <Link
                  to="/admin"
                  className="p-2 rounded-lg text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                  title="Admin dashboard"
                >
                  <LayoutDashboard size={18} />
                </Link>
                {user ? (
                  <>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-lg text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                      title={`Sign out (${profile?.full_name || user.email})`}
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="p-2 rounded-lg text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                    title="Sign in"
                  >
                    <LogIn size={18} />
                  </Link>
                )}
              </div>
            </nav>

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-accent-cyan bg-light-elevated dark:bg-dark-elevated'
                      : 'text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-light-border dark:border-dark-border pt-2 mt-2 space-y-1">
                <Link to="/roadmap" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated">
                  Build Roadmap
                </Link>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated">
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated">
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-light-border dark:border-dark-border mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col items-center gap-5">
            <SocialIcons settings={settings} size={20} />
            <div className="flex items-center gap-6">
              <Link to="/roadmap" className="text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                Build Status
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-light-muted dark:text-dark-muted text-center">
                &copy; 2026 Ian M. Clayton. All Rights Reserved.
              </p>
              <Link
                to="/login"
                aria-label="Access"
                className="text-light-muted/40 dark:text-dark-muted/40 hover:text-light-muted dark:hover:text-dark-muted transition-colors"
              >
                <Lock size={13} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
