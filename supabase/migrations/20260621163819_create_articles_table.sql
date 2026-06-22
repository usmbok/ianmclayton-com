
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content_html text,
  category text,
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  reading_time_minutes int DEFAULT 5,
  -- Related content
  related_project_ids uuid[] DEFAULT '{}',
  related_timeline_ids uuid[] DEFAULT '{}',
  related_article_ids uuid[] DEFAULT '{}',
  -- SEO
  meta_title text,
  meta_description text,
  meta_keywords text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Add FK from timeline_entries to articles now that articles exists
ALTER TABLE public.timeline_entries
  ADD CONSTRAINT timeline_entries_related_article_fk
  FOREIGN KEY (related_article_id) REFERENCES public.articles(id) ON DELETE SET NULL;

CREATE POLICY "select_published_articles" ON public.articles
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "admin_select_all_articles" ON public.articles
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "insert_articles" ON public.articles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_articles" ON public.articles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_articles" ON public.articles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX articles_slug_idx ON public.articles(slug);
CREATE INDEX articles_status_idx ON public.articles(status);
CREATE INDEX articles_featured_idx ON public.articles(featured);
CREATE INDEX articles_published_at_idx ON public.articles(published_at DESC);
