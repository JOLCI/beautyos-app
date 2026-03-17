-- Fix infinite recursion in profiles RLS policies
DROP POLICY IF EXISTS "auth_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_all_profiles" ON public.profiles;

-- Use JWT metadata directly to determine the company_id for the current user
-- instead of querying the profiles table again
CREATE POLICY "auth_select_profiles" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (
    (company_id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'))
    OR id = auth.uid()
  );

CREATE POLICY "auth_all_profiles" ON public.profiles 
  FOR ALL TO authenticated 
  USING (
    (company_id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'))
    OR id = auth.uid()
  );

-- Update auth_company_id() helper function to read from JWT metadata
-- This avoids recursion in policies on other tables (like clients, appointments)
CREATE OR REPLACE FUNCTION public.auth_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid;
$$;

-- Ensure companies policy also doesn't cause recursion when updating
DROP POLICY IF EXISTS "auth_update_companies" ON public.companies;
CREATE POLICY "auth_update_companies" ON public.companies 
  FOR UPDATE TO authenticated 
  USING (id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'));

-- Ensure anon role can query the companies table to identify salons by passkey
DROP POLICY IF EXISTS "anon_select_companies" ON public.companies;
CREATE POLICY "anon_select_companies" ON public.companies 
  FOR SELECT TO anon 
  USING (true);

-- Ensure permissions for unauthenticated users to execute the login helper function
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text, uuid) TO authenticated;
