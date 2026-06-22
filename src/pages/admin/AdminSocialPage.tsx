import { useState, useEffect, FormEvent } from 'react';
import { Twitter, Instagram, Linkedin, Facebook, Save, ExternalLink, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { AdminBreadcrumb } from '../../components/AdminLayout';

interface SocialField {
  key: string;
  label: string;
  placeholder: string;
  Icon: React.ElementType;
  brandColor: string;
  hint: string;
}

const fields: SocialField[] = [
  {
    key: 'linkedin_url',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/yourprofile',
    Icon: Linkedin,
    brandColor: '#0A66C2',
    hint: 'Your LinkedIn profile or company page URL.',
  },
  {
    key: 'social_twitter_url',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/yourhandle',
    Icon: Twitter,
    brandColor: '#000000',
    hint: 'Your X / Twitter profile URL.',
  },
  {
    key: 'social_instagram_url',
    label: 'Instagram',
    placeholder: 'https://instagram.com/yourhandle',
    Icon: Instagram,
    brandColor: '#E1306C',
    hint: 'Your Instagram profile URL.',
  },
  {
    key: 'social_facebook_url',
    label: 'Facebook',
    placeholder: 'https://facebook.com/yourpage',
    Icon: Facebook,
    brandColor: '#1877F2',
    hint: 'Your Facebook profile or page URL.',
  },
];

export function AdminSocialPage() {
  const { settings, loading, reload } = useSiteSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setValues({
        linkedin_url: settings.linkedin_url,
        social_twitter_url: settings.social_twitter_url,
        social_instagram_url: settings.social_instagram_url,
        social_facebook_url: settings.social_facebook_url,
      });
    }
  }, [loading, settings]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const upserts = Object.entries(values).map(([key, value]) => ({
      key,
      value: value.trim(),
    }));

    const { error: err } = await supabase
      .from('site_settings')
      .upsert(upserts, { onConflict: 'key' });

    setSaving(false);

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      reload();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <AdminBreadcrumb items={[{ label: 'Social Media' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">Social Media</h1>
        <p className="text-sm text-light-secondary dark:text-dark-secondary">
          Add or update your social media profile URLs. Icons appear automatically in the site footer when a URL is saved.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-sm text-accent-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, placeholder, Icon, brandColor, hint }) => (
          <div key={key} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <Icon size={18} style={{ color: brandColor }} />
              </div>
              <div>
                <label htmlFor={key} className="block text-sm font-semibold text-light-text dark:text-dark-text leading-none mb-0.5">
                  {label}
                </label>
                <p className="text-xs text-light-muted dark:text-dark-muted">{hint}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id={key}
                type="url"
                value={values[key] ?? ''}
                onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                  bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                  placeholder:text-light-muted dark:placeholder:text-dark-muted
                  focus:outline-none focus:ring-2 focus:ring-accent-cyan/30
                  text-sm transition-colors"
              />
              {values[key] && (
                <a
                  href={values[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors flex-shrink-0"
                  title="Open link"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Leave a field blank to hide that icon from the footer.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saved ? (
              <><Check size={15} /> Saved</>
            ) : saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <><Save size={15} /> Save changes</>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-3">Preview</p>
        <div className="flex items-center gap-2">
          {fields
            .filter(f => values[f.key])
            .map(({ key, label, Icon, brandColor }) => (
              <div
                key={key}
                className="p-2.5 rounded-lg border border-light-border dark:border-dark-border"
                title={label}
              >
                <Icon size={18} style={{ color: brandColor }} />
              </div>
            ))}
          {fields.every(f => !values[f.key]) && (
            <p className="text-sm text-light-muted dark:text-dark-muted">No icons will show — add a URL above to see a preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
