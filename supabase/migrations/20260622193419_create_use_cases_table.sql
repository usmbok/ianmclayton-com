
CREATE TABLE public.use_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text,
  -- Client identity
  client_display_name text,
  client_name text,
  show_client_name boolean NOT NULL DEFAULT false,
  -- Classification
  industry text,
  servicenow_product text,
  project_type text,
  employer_id uuid REFERENCES employers(id) ON DELETE SET NULL,
  -- Narrative sections (HTML)
  summary_html text,
  challenge_html text,
  solution_html text,
  outcomes_html text,
  -- Structured outcome bullets (stored as text array)
  outcome_bullets text[] DEFAULT '{}',
  -- Optional PDF attachment path (relative to /public/)
  pdf_path text,
  -- Metadata
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  confidentiality text NOT NULL DEFAULT 'public' CHECK (confidentiality IN ('public', 'sanitised', 'private')),
  featured boolean NOT NULL DEFAULT false,
  date_delivered date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "use_cases_select_public" ON public.use_cases
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "use_cases_admin_select" ON public.use_cases
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "use_cases_admin_insert" ON public.use_cases
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "use_cases_admin_update" ON public.use_cases
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "use_cases_admin_delete" ON public.use_cases
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER use_cases_updated_at
  BEFORE UPDATE ON public.use_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX use_cases_slug_idx ON public.use_cases(slug);
CREATE INDEX use_cases_status_idx ON public.use_cases(status);
