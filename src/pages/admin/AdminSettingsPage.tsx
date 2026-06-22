import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface SettingsGroup {
  label: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'url'; placeholder: string }[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    label: 'Identity',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Service Management Thought Leader…' },
      { key: 'bio_short', label: 'Short bio', type: 'textarea', placeholder: 'One paragraph introduction…' },
      { key: 'bio_full', label: 'Full bio', type: 'textarea', placeholder: 'Extended biography…' },
    ],
  },
  {
    label: 'Contact',
    fields: [
      { key: 'email', label: 'Contact email', type: 'text', placeholder: 'ian@example.com' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
      { key: 'calendly_url', label: 'Calendly URL', type: 'url', placeholder: 'https://calendly.com/…' },
    ],
  },
  {
    label: 'Social Media',
    fields: [
      { key: 'linkedin_url', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/…' },
      { key: 'social_twitter_url', label: 'Twitter / X', type: 'url', placeholder: 'https://twitter.com/…' },
      { key: 'social_instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/…' },
      { key: 'social_facebook_url', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/…' },
    ],
  },
  {
    label: 'SEO',
    fields: [
      { key: 'meta_description', label: 'Meta description', type: 'textarea', placeholder: 'Site-wide meta description…' },
      { key: 'meta_keywords', label: 'Meta keywords', type: 'text', placeholder: 'service management, ITSM, automation…' },
    ],
  },
];

export function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(row => { map[row.key] = row.value ?? ''; });
        setValues(map);
      }
      setLoading(false);
    });
  }, []);

  function set(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }));
    setSuccess(false);
  }

  async function save() {
    setSaving(true); setError(''); setSuccess(false);
    const upserts = Object.entries(values).map(([key, value]) => ({ key, value }));
    const { error: err } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  if (loading) {
    return (
      <div>
        <AdminBreadcrumb items={[{ label: 'Site Settings' }]} />
        <div className="space-y-4 max-w-2xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Site Settings' }]} />
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Site Settings</h1>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Global content and configuration</p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 disabled:opacity-50 transition-colors"
          >
            <Save size={14} />{saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm mb-4">
            <AlertCircle size={15} />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-green/10 text-accent-green text-sm mb-4">
            <CheckCircle size={15} />Settings saved successfully.
          </div>
        )}

        <div className="space-y-8">
          {SETTINGS_GROUPS.map(group => (
            <div key={group.label}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4 pb-2 border-b border-light-border dark:border-dark-border">
                {group.label}
              </h2>
              <div className="space-y-4">
                {group.fields.map(field => (
                  <div key={field.key}>
                    <label className={labelCls}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        className={inputCls}
                        value={values[field.key] ?? ''}
                        onChange={e => set(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type === 'url' ? 'url' : 'text'}
                        className={inputCls}
                        value={values[field.key] ?? ''}
                        onChange={e => set(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-light-border dark:border-dark-border">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 disabled:opacity-50 transition-colors"
          >
            <Save size={14} />{saving ? 'Saving…' : 'Save all changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
