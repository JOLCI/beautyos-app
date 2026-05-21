DO $$
BEGIN
  -- 1. Tasks Deletion Security
  DROP POLICY IF EXISTS "company_tasks_delete" ON public.tasks;
  CREATE POLICY "company_tasks_delete" ON public.tasks
    FOR DELETE TO authenticated 
    USING (
      created_by = auth.uid() OR 
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
    );

  -- 2. Idempotent check for purchases if any updates were needed
  -- Purchases table already supports all requirements for CRUD
END $$;
