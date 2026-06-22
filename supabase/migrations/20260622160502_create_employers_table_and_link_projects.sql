CREATE TABLE IF NOT EXISTS employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  website text,
  industry text,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employers_select_public" ON employers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "employers_insert_admin" ON employers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "employers_update_admin" ON employers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "employers_delete_admin" ON employers FOR DELETE TO authenticated USING (true);

-- Seed from work_history organisations
INSERT INTO employers (name, short_name, sort_order) VALUES
  ('Acorio (NTT Data Company)',                          'Acorio',            1),
  ('Advance Solutions Corporation',                      'Advance Solutions', 2),
  ('Unisys Corporation',                                 'Unisys',            3),
  ('Sterling Software (acquired by Computer Associates)','Sterling Software', 4),
  ('Various Enterprises (HP, KPMG, IBM, G2G3 & Others)','Various Enterprises',5);

-- Add employer FK to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS employer_id uuid REFERENCES employers(id) ON DELETE SET NULL;