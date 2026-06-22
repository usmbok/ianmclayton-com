import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Step = 'credentials' | 'mfa';

export function LoginPage() {
  const { signIn, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/admin';

  const [step, setStep] = useState<Step>('credentials');
  const [factorId, setFactorId] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [code, setCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentials(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error, mfaRequired, factorId: fid } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setError(error);
      return;
    }

    if (mfaRequired && fid) {
      // Has verified MFA factor — prompt for code
      setFactorId(fid);
      setStep('mfa');
    } else {
      // No MFA set up yet — send to setup page
      navigate('/admin/mfa', { replace: true });
    }
  }

  async function handleMfa(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await verifyMfa(factorId, code.replace(/\s/g, ''));
    setSubmitting(false);

    if (error) {
      setError('Invalid code — please try again.');
      setCode('');
      return;
    }

    // MFA verified — go to roadmap (or wherever they came from)
    navigate(from === '/admin/mfa' ? '/roadmap' : from, { replace: true });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {step === 'credentials' ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-cyan/10 mb-4">
                <KeyRound size={22} className="text-accent-cyan" />
              </div>
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Sign in</h1>
              <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
                Access restricted to authorised users
              </p>
            </div>

            <form onSubmit={handleCredentials} className="card p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-sm text-accent-red">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
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
                <label htmlFor="password" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-cyan/10 mb-4">
                <ShieldCheck size={22} className="text-accent-cyan" />
              </div>
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Two-factor auth</h1>
              <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleMfa} className="card p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-sm text-accent-red">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-xs font-medium text-light-secondary dark:text-dark-secondary mb-1.5">
                  Authenticator code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9\s]*"
                  maxLength={7}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="000 000"
                  className="w-full px-3.5 py-3 rounded-lg border border-light-border dark:border-dark-border
                    bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text
                    placeholder:text-light-muted dark:placeholder:text-dark-muted
                    focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
                    text-2xl tracking-[0.5em] text-center font-mono transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || code.replace(/\s/g, '').length < 6}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Verifying…' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(null); setCode(''); }}
                className="w-full text-sm text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors py-1"
              >
                Back to sign in
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
