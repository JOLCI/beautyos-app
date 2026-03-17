DROP POLICY IF EXISTS "auth_update_companies" ON public.companies;
DROP POLICY IF EXISTS "auth_all_companies" ON public.companies;

CREATE POLICY "auth_all_companies" ON public.companies FOR ALL TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root') OR
  (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
);
