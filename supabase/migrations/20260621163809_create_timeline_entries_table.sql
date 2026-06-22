
CREATE TABLE public.timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organisation text,
  entry_date date NOT NULL,
  entry_date_end date,
  entry_type text NOT NULL DEFAULT 'career' CHECK (entry_type IN (
    'career', 'project', 'publication', 'award', 'education', 'speaking', 'milestone'
  )),
  project_type text,
  client_type text,
  industry text,
  summary text NOT NULL,
  detail_html text,
  role text,
  -- Themes and skills
  sm_themes text[] DEFAULT '{}',
  automation_themes text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  technologies text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  -- Status flags
  is_milestone boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  confidentiality text NOT NULL DEFAULT 'public' CHECK (confidentiality IN ('public', 'sanitised', 'private')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  -- Related content
  related_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  related_article_id uuid,
  -- SEO
  meta_keywords text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_published_timeline" ON public.timeline_entries
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "insert_timeline" ON public.timeline_entries
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_timeline" ON public.timeline_entries
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_timeline" ON public.timeline_entries
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER timeline_entries_updated_at
  BEFORE UPDATE ON public.timeline_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX timeline_entries_date_idx ON public.timeline_entries(entry_date DESC);
CREATE INDEX timeline_entries_type_idx ON public.timeline_entries(entry_type);
CREATE INDEX timeline_entries_featured_idx ON public.timeline_entries(is_featured);
