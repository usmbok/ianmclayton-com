-- Banner slides table
CREATE TABLE IF NOT EXISTS banner_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  content_html text NOT NULL,
  icon text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE banner_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banner_slides_select_public" ON banner_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "banner_slides_insert_admin"  ON banner_slides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "banner_slides_update_admin"  ON banner_slides FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "banner_slides_delete_admin"  ON banner_slides FOR DELETE TO authenticated USING (true);

-- Seed initial banner slides from current hardcoded credibility strip
INSERT INTO banner_slides (label, content_html, icon, active, sort_order) VALUES
  ('ITSM Lifetime Award', '<p>ITSM Industry Lifetime Award Recipient</p>', 'Award', true, 10),
  ('USMBOK Author', '<p>Author: Universal Service Management Body of Knowledge (USMBOK)</p>', 'BookOpen', true, 20),
  ('Service Management Practitioner', '<p>Service Management &amp; Intelligent Automation Practitioner</p>', 'Lightbulb', true, 30),
  ('Transformation &amp; Advisory', '<p>Transformation / Advisory / Thought Leadership</p>', 'Briefcase', true, 40);

-- Hero text settings
INSERT INTO site_settings (key, value, label) VALUES
  ('hero_eyebrow',     'Service Management · Intelligent Automation',  'Hero eyebrow text'),
  ('hero_heading_html','<p>Ian M. <em>Clayton</em></p>',                'Hero heading (HTML)'),
  ('hero_body_html',   '<p>Service management thought leader, intelligent automation advocate, author, practitioner, and industry lifetime award recipient.</p><p>This site is a personal archive of my work, projects, lessons, articles, and career journey across service management, digital operations, transformation, and automation.</p>', 'Hero body copy (HTML)'),
  ('hero_btn1_label',  'Explore my journey',                            'Hero primary button label'),
  ('hero_btn1_url',    '/timeline',                                     'Hero primary button URL'),
  ('hero_btn2_label',  'View projects',                                 'Hero button 2 label'),
  ('hero_btn2_url',    '/projects',                                     'Hero button 2 URL'),
  ('hero_btn3_label',  'Read articles',                                 'Hero button 3 label'),
  ('hero_btn3_url',    '/articles',                                     'Hero button 3 URL'),
  ('hero_btn4_label',  'Contact',                                       'Hero button 4 label'),
  ('hero_btn4_url',    '/contact',                                      'Hero button 4 URL'),
  ('banner_slide_delay_ms', '5000',                                     'Banner slide delay (ms)'),
  ('banner_autoplay',  'true',                                          'Banner autoplay enabled')
ON CONFLICT (key) DO NOTHING;