import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="card p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-green/10 mb-4">
              <UserPlus size={22} className="text-accent-green" />
            </div>
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Account created</h2>
            <p className="text-sm text-light-secondary dark:text-dark-secondary">
              Your account has been created. Redirecting you to sign in…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-cyan/10 mb-4">
            <UserPlus size={22} className="text-accent-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Create account</h1>
          <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
            Register to access additional features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-sm text-accent-red">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text
                placeholder:text-light-muted dark:placeholder:text-dark-muted
                focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
                text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text
                placeholder:text-light-muted dark:placeholder:text-dark-muted
                focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
                text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-light-border dark:border-dark-border
                  bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text
                  placeholder:text-light-muted dark:placeholder:text-dark-muted
                  focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
                  text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPw ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text
                placeholder:text-light-muted dark:placeholder:text-dark-muted
                focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
                text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-light-secondary dark:text-dark-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-light-muted dark:text-dark-muted mt-3">
          <Link to="/" className="hover:underline">Back to site</Link>
        </p>
      </div>
    </div>
  );
}
