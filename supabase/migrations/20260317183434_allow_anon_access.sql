-- Ensure anon role can read from the companies table for public identification before login
DROP POLICY IF EXISTS "anon_select_companies" ON public.companies;
CREATE POLICY "anon_select_companies" ON public.companies
    FOR SELECT
    TO anon
    USING (true);

-- Ensure authenticated role can also select
DROP POLICY IF EXISTS "auth_select_companies" ON public.companies;
CREATE POLICY "auth_select_companies" ON public.companies
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant select permission to the roles explicitly
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.companies TO authenticated;

-- Allow unauthenticated users to resolve usernames to emails for the login helper
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_for_login(text, uuid) TO authenticated;
