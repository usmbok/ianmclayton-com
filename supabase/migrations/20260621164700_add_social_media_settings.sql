
-- Add social media URL keys to site_settings
INSERT INTO public.site_settings (key, value, label) VALUES
  ('social_twitter_url',   '', 'X (Twitter) URL'),
  ('social_instagram_url', '', 'Instagram URL'),
  ('social_facebook_url',  '', 'Facebook URL')
ON CONFLICT (key) DO NOTHING;

-- Rename existing linkedin_url label for consistency
UPDATE public.site_settings SET label = 'LinkedIn URL' WHERE key = 'linkedin_url';
