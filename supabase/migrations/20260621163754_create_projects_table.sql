
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  client_display_name text,
  client_type text,
  industry text,
  date_start date,
  date_end date,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  confidentiality text NOT NULL DEFAULT 'public' CHECK (confidentiality IN ('public', 'sanitised', 'private')),
  featured boolean NOT NULL DEFAULT false,
  short_focus text,
  project_type text,
  role text,
  -- SM and automation themes
  sm_themes text[] DEFAULT '{}',
  automation_themes text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  -- Rich text case-study sections (stored as HTML)
  context_html text,
  challenge_html text,
  my_role_html text,
  approach_html text,
  contributions_html text,
  outcomes_html text,
  lessons_html text,
  -- Related content
  related_article_ids uuid[] DEFAULT '{}',
  related_timeline_ids uuid[] DEFAULT '{}',
  -- SEO
  meta_title text,
  meta_description text,
  meta_keywords text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_published_projects" ON public.projects
  FOR SELECT TO anon, authenticated USING (status = 'published' OR confidentiality != 'private');
CREATE POLICY "admin_select_all_projects" ON public.projects
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "insert_projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_projects" ON public.projects
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_projects" ON public.projects
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX projects_slug_idx ON public.projects(slug);
CREATE INDEX projects_status_idx ON public.projects(status);
CREATE INDEX projects_featured_idx ON public.projects(featured);
