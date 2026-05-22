DO $DO_BLOCK$
BEGIN
    -- Enhance Tasks RLS Policy to enforce strict owner-only deletes
    -- Ensures safety of task tracking by allowing only the creator, admin or root to remove tasks.
    DROP POLICY IF EXISTS "company_tasks_delete" ON public.tasks;
    
    CREATE POLICY "company_tasks_delete" ON public.tasks
      FOR DELETE TO authenticated
      USING (
        created_by = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
      );
END $DO_BLOCK$;
