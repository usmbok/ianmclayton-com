-- Drop the circular policy that causes infinite recursion
-- (it queries profiles to check if user is admin, which re-triggers the policy)
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
