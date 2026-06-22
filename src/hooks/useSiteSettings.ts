import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  bio_short: string;
  bio_full: string;
  tagline: string;
  email: string;
  linkedin_url: string;
  social_twitter_url: string;
  social_instagram_url: string;
  social_facebook_url: string;
  calendly_url: string;
  location: string;
  meta_description: string;
  meta_keywords: string;
}

const defaults: SiteSettings = {
  bio_short: 'Service management thought leader, intelligent automation advocate, author, and industry lifetime award recipient.',
  bio_full: '',
  tagline: 'Service Management. Intelligent Automation. Human Value.',
  email: 'ian@ianmclayton.com',
  linkedin_url: '',
  social_twitter_url: '',
  social_instagram_url: '',
  social_facebook_url: '',
  calendly_url: '',
  location: 'Sarasota, Florida, USA',
  meta_description: '',
  meta_keywords: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');
    if (data) {
      const map = data.reduce<Partial<SiteSettings>>((acc, row) => {
        (acc as Record<string, string>)[row.key] = row.value ?? '';
        return acc;
      }, {});
      setSettings({ ...defaults, ...map });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return { settings, loading, reload: load };
}
