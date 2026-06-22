
-- Restore GoTrue (supabase_auth_admin) full access to auth schema
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin;

-- Ensure future objects also get the grants
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT ALL ON TABLES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT ALL ON SEQUENCES TO supabase_auth_admin;

-- Restore service_role access (used by admin API)
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA auth TO service_role;

-- authenticator role needs usage
GRANT USAGE ON SCHEMA auth TO authenticator;

-- Restore schema ownership signal so GoTrue can read its own objects
GRANT USAGE ON SCHEMA auth TO postgres;
