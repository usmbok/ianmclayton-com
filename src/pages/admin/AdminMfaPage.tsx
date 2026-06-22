import { useState, useEffect, FormEvent } from 'react';
import { ShieldCheck, ShieldOff, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminBreadcrumb } from '../../components/AdminLayout';

type EnrollStep = 'loading' | 'setup' | 'confirming' | 'verified';

export function AdminMfaPage() {
  const { enrollMfa, confirmMfaEnrollment, unenrollMfa, listMfaFactors } = useAuth();

  const [verifiedFactorId, setVerifiedFactorId] = useState<string | null>(null);
  const [loadingFactors, setLoadingFactors] = useState(true);

  const [step, setStep] = useState<EnrollStep>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function loadFactors() {
    setLoadingFactors(true);
    const list = await listMfaFactors();
    const verified = list.find(f => f.status === 'verified');
    if (verified) {
      setVerifiedFactorId(verified.id);
      setStep('verified');
    } else {
      setVerifiedFactorId(null);
      // Auto-start enrollment so QR code is shown immediately
      await startEnrollment();
    }
    setLoadingFactors(false);
  }

  useEffect(() => { loadFactors(); }, []);

  async function startEnrollment() {
    setError(null);
    setWorking(true);
    setCode('');
    const { error, qrCode, secret, factorId } = await enrollMfa();
    setWorking(false);
    if (error) { setError(error); setStep('setup'); return; }
    setQrCode(qrCode);
    setSecret(secret);
    setPendingFactorId(factorId);
    setStep('setup');
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!pendingFactorId) return;
    setError(null);
    setWorking(true);
    const { error } = await confirmMfaEnrollment(pendingFactorId, code.replace(/\s/g, ''));
    setWorking(false);
    if (error) {
      setError('Invalid code — please check your authenticator and try again.');
      setCode('');
      return;
    }
    setStep('verified');
    loadFactors();
  }

  async function handleUnenroll() {
    if (!verifiedFactorId) return;
    if (!window.confirm('Remove two-factor authentication? You will only need your password to sign in.')) return;
    setWorking(true);
    const { error } = await unenrollMfa(verifiedFactorId);
    setWorking(false);
    if (error) { setError(error); return; }
    setVerifiedFactorId(null);
    await startEnrollment();
  }

  return (
    <div className="max-w-xl">
      <AdminBreadcrumb items={[{ label: 'Two-Factor Authentication' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">Two-Factor Authentication</h1>
        <p className="text-sm text-light-secondary dark:text-dark-secondary">
          Protect your account with a TOTP authenticator app — Microsoft Authenticator, Google Authenticator, or Authy.
        </p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-sm text-accent-red">
          {error}
        </div>
      )}

      {(loadingFactors || step === 'loading') && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Already enabled */}
      {step === 'verified' && (
        <div className="space-y-5">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-green/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-accent-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-light-text dark:text-dark-text">2FA is enabled</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">Your account is protected. You will be asked for a code on every sign-in.</p>
            </div>
          </div>
          <button
            onClick={handleUnenroll}
            disabled={working}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-accent-red/40 text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-50"
          >
            <ShieldOff size={15} />
            Remove 2FA
          </button>
        </div>
      )}

      {/* QR setup */}
      {step === 'setup' && qrCode && (
        <div className="space-y-6">
          <div className="card p-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-accent-amber flex-shrink-0 mt-0.5" />
            <p className="text-sm text-light-secondary dark:text-dark-secondary">
              2FA is not yet enabled. Scan the QR code below with your authenticator app, then enter a code to confirm.
            </p>
          </div>

          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-light-text dark:text-dark-text mb-1">Step 1 — Scan with your app</h2>
              <p className="text-xs text-light-secondary dark:text-dark-secondary">
                Open <strong>Microsoft Authenticator</strong> (or any TOTP app) &rarr; tap <strong>+</strong> &rarr; <strong>Other account</strong> &rarr; scan this code.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-light-border dark:border-dark-border inline-block">
                <img src={qrCode} alt="Authenticator QR code" className="w-52 h-52 block" />
              </div>
              <button
                type="button"
                onClick={startEnrollment}
                disabled={working}
                className="inline-flex items-center gap-1.5 text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                <RefreshCw size={12} />
                Generate new code
              </button>
            </div>

            {secret && (
              <div>
                <p className="text-xs text-light-muted dark:text-dark-muted mb-1.5">Can't scan? Enter this key manually:</p>
                <code className="block text-xs font-mono bg-light-elevated dark:bg-dark-bg px-3 py-2.5 rounded-lg text-light-text dark:text-dark-text tracking-widest break-all select-all">
                  {secret}
                </code>
              </div>
            )}
          </div>

          <form onSubmit={handleConfirm} className="card p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-light-text dark:text-dark-text mb-1">Step 2 — Verify</h2>
              <p className="text-xs text-light-secondary dark:text-dark-secondary">
                Enter the 6-digit code your app is currently showing to complete setup.
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9\s]*"
              maxLength={7}
              required
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

            <button
              type="submit"
              disabled={working || code.replace(/\s/g, '').length < 6}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {working ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Verifying…</>
              ) : (
                <><CheckCircle size={15} /> Enable 2FA</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
