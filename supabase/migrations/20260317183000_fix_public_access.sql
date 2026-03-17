-- Ensure anon and authenticated roles have SELECT access to the companies table
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.companies TO authenticated;

-- Ensure the RLS policy allows anyone (including anon) to read the companies table
-- This allows fetching the passkey and salon info before the user logs in
DROP POLICY IF EXISTS "anon_select_companies" ON public.companies;
CREATE POLICY "anon_select_companies" ON public.companies
  FOR SELECT
  USING (true);

-- Ensure the RPC function to resolve email by username can be executed by unauthenticated users
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text, uuid) TO authenticated;
