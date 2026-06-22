
-- Grant anon and authenticated roles access to public schema and all public tables
-- RLS policies alone are not enough — the role must also have the underlying table privilege
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT SELECT ON public.timeline_entries TO anon, authenticated;
GRANT SELECT ON public.work_history TO anon, authenticated;
GRANT SELECT ON public.expertise_areas TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;

-- Allow authenticated (admin) to insert/update/delete where RLS permits
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.timeline_entries TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.work_history TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.expertise_areas TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Ensure future tables also get default grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
