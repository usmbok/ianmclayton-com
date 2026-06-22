ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS show_client_name boolean NOT NULL DEFAULT false;
