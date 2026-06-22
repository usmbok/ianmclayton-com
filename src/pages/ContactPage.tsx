import { useState } from 'react';
import { Mail, MapPin, Calendar, Linkedin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../hooks/useSiteSettings';

type Reason = 'speaking' | 'advisory' | 'media' | 'general' | '';

interface FormState {
  name: string;
  email: string;
  organisation: string;
  reason: Reason;
  message: string;
}

const REASONS: { value: Reason; label: string }[] = [
  { value: 'speaking',  label: 'Speaking engagement' },
  { value: 'advisory',  label: 'Advisory / consulting' },
  { value: 'media',     label: 'Media / press enquiry' },
  { value: 'general',   label: 'General enquiry' },
];

export function ContactPage() {
  const { settings } = useSiteSettings();

  const [form, setForm] = useState<FormState>({
    name: '', email: '', organisation: '', reason: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason) { setError('Please select a reason for your enquiry.'); return; }

    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase.from('contact_submissions').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      organisation: form.organisation.trim() || null,
      reason: form.reason,
      message: form.message.trim(),
    });

    setSubmitting(false);

    if (dbError) {
      setError('Something went wrong. Please try again or email directly.');
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="bg-light-bg dark:bg-dark-bg">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="section-label">Contact</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-light-text dark:text-dark-text leading-tight mt-2 max-w-2xl">
            Start a <span className="text-accent-cyan">conversation</span>
          </h1>
          <p className="mt-5 text-light-secondary dark:text-dark-secondary text-lg max-w-xl leading-relaxed">
            Whether you have a speaking request, an advisory enquiry, or just want to connect — Ian
            reads every message and responds personally.
          </p>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-14">

            {/* Left — contact info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-5">
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: settings.email || 'ian@ianmclayton.com',
                    href: `mailto:${settings.email || 'ian@ianmclayton.com'}`,
                  },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: settings.location || 'Sarasota, Florida, USA',
                    href: null,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-accent-cyan" />
                    </div>
                    <div>
                      <div className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wide mb-0.5">
                        {label}
                      </div>
                      {href ? (
                        <a href={href} className="text-light-text dark:text-dark-text hover:text-accent-cyan transition-colors text-sm">
                          {value}
                        </a>
                      ) : (
                        <span className="text-light-text dark:text-dark-text text-sm">{value}</span>
                      )}
                    </div>
                  </div>
                ))}

                {settings.linkedin_url && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Linkedin size={18} className="text-accent-cyan" />
                    </div>
                    <div>
                      <div className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wide mb-0.5">
                        LinkedIn
                      </div>
                      <a
                        href={settings.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light-text dark:text-dark-text hover:text-accent-cyan transition-colors text-sm"
                      >
                        Connect on LinkedIn
                      </a>
                    </div>
                  </div>
                )}

                {settings.calendly_url && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-accent-cyan" />
                    </div>
                    <div>
                      <div className="text-xs text-light-muted dark:text-dark-muted font-medium uppercase tracking-wide mb-0.5">
                        Book a call
                      </div>
                      <a
                        href={settings.calendly_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light-text dark:text-dark-text hover:text-accent-cyan transition-colors text-sm"
                      >
                        Schedule via Calendly
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Response expectation */}
              <div className="p-5 bg-light-elevated dark:bg-dark-elevated rounded-xl border border-light-border dark:border-dark-border">
                <h3 className="font-semibold text-light-text dark:text-dark-text text-sm mb-2">What to expect</h3>
                <ul className="space-y-2">
                  {[
                    'Ian reads every message personally',
                    'Responses typically within 2 business days',
                    'Speaking enquiries — please include your event date and audience size',
                    'Advisory enquiries — a brief description of your challenge helps',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-light-secondary dark:text-dark-secondary leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-accent-cyan flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <SuccessState />
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8 space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Full name" required>
                      <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        required
                        placeholder="Jane Smith"
                        className="form-input"
                      />
                    </Field>

                    <Field label="Email address" required>
                      <input
                        type="email"
                        value={form.email}
                        onChange={update('email')}
                        required
                        placeholder="jane@example.com"
                        className="form-input"
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Organisation">
                      <input
                        type="text"
                        value={form.organisation}
                        onChange={update('organisation')}
                        placeholder="Your company or organisation"
                        className="form-input"
                      />
                    </Field>

                    <Field label="Reason for enquiry" required>
                      <select
                        value={form.reason}
                        onChange={update('reason')}
                        required
                        className="form-input"
                      >
                        <option value="" disabled>Select a reason…</option>
                        {REASONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Message" required>
                    <textarea
                      value={form.message}
                      onChange={update('message')}
                      required
                      rows={6}
                      placeholder="Tell Ian what's on your mind…"
                      className="form-input resize-none"
                    />
                  </Field>

                  {error && (
                    <div className="flex items-center gap-2 text-accent-red text-sm p-3 bg-accent-red/10 rounded-lg">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-light-text dark:text-dark-text">
        {label}
        {required && <span className="text-accent-cyan ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessState() {
  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-12 text-center space-y-4">
      <div className="w-14 h-14 bg-accent-cyan/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={28} className="text-accent-cyan" />
      </div>
      <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Message sent</h2>
      <p className="text-light-secondary dark:text-dark-secondary text-sm max-w-sm mx-auto leading-relaxed">
        Thank you for reaching out. Ian reads every message personally and will be in touch within
        two business days.
      </p>
    </div>
  );
}
