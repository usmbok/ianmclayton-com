ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS client_comments_html text;