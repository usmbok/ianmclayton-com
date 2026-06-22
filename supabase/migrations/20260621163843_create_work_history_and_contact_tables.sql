
-- Work history
CREATE TABLE public.work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation text NOT NULL,
  role_title text NOT NULL,
  employment_type text DEFAULT 'full-time' CHECK (employment_type IN (
    'full-time', 'contract', 'advisory', 'consulting', 'part-time'
  )),
  date_start date NOT NULL,
  date_end date,
  is_current boolean NOT NULL DEFAULT false,
  location text,
  summary text NOT NULL,
  detail_html text,
  key_achievements text[] DEFAULT '{}',
  client_type text,
  domains text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  related_project_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_work_history" ON public.work_history
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_work_history" ON public.work_history
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_work_history" ON public.work_history
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_work_history" ON public.work_history
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER work_history_updated_at
  BEFORE UPDATE ON public.work_history
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX work_history_date_idx ON public.work_history(date_start DESC);

-- Contact submissions
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organisation text,
  reason text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "insert_contact_submissions" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Only admins can read submissions
CREATE POLICY "admin_select_contact_submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "admin_update_contact_submissions" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "admin_delete_contact_submissions" ON public.contact_submissions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
