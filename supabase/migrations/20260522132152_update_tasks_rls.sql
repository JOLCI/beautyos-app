-- Drop the existing delete policy if it exists
DROP POLICY IF EXISTS "company_tasks_delete" ON public.tasks;

-- Create the refined RLS policy restricting delete to creator or admin/root
CREATE POLICY "company_tasks_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
  );

-- Ensure other standard policies are intact for completeness
DROP POLICY IF EXISTS "company_tasks_insert" ON public.tasks;
CREATE POLICY "company_tasks_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.auth_company_id() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'root'
  );

DROP POLICY IF EXISTS "company_tasks_update" ON public.tasks;
CREATE POLICY "company_tasks_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    company_id = public.auth_company_id() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'root'
  );

DROP POLICY IF EXISTS "company_tasks_select" ON public.tasks;
CREATE POLICY "company_tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    company_id = public.auth_company_id() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'root'
  );

-- Automatically populate company_id using auth_company_id() function
ALTER TABLE public.tasks ALTER COLUMN company_id SET DEFAULT public.auth_company_id();
ALTER TABLE public.purchases ALTER COLUMN company_id SET DEFAULT public.auth_company_id();
