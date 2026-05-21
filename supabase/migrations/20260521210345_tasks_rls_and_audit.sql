DO $$
BEGIN
  -- Fix is_attendant consistency
  UPDATE public.profiles SET is_attendant = false WHERE is_attendant IS NULL;
  ALTER TABLE public.profiles ALTER COLUMN is_attendant SET DEFAULT false;
END $$;

CREATE OR REPLACE FUNCTION public.set_tasks_created_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_tasks_set_created_by ON public.tasks;
CREATE TRIGGER trg_tasks_set_created_by
  BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_tasks_created_by();

DROP POLICY IF EXISTS "company_tasks" ON public.tasks;
DROP POLICY IF EXISTS "company_tasks_select" ON public.tasks;
DROP POLICY IF EXISTS "company_tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "company_tasks_update" ON public.tasks;
DROP POLICY IF EXISTS "company_tasks_delete" ON public.tasks;

CREATE POLICY "company_tasks_select" ON public.tasks 
  FOR SELECT TO authenticated 
  USING ((company_id = auth_company_id()) OR (( SELECT profiles.role FROM profiles WHERE (profiles.id = auth.uid())) = 'root'::text));

CREATE POLICY "company_tasks_insert" ON public.tasks 
  FOR INSERT TO authenticated 
  WITH CHECK ((company_id = auth_company_id()) OR (( SELECT profiles.role FROM profiles WHERE (profiles.id = auth.uid())) = 'root'::text));

CREATE POLICY "company_tasks_update" ON public.tasks 
  FOR UPDATE TO authenticated 
  USING ((company_id = auth_company_id()) OR (( SELECT profiles.role FROM profiles WHERE (profiles.id = auth.uid())) = 'root'::text));

-- Only the owner (created_by) or root can delete tasks
CREATE POLICY "company_tasks_delete" ON public.tasks 
  FOR DELETE TO authenticated 
  USING ((created_by = auth.uid()) OR (( SELECT profiles.role FROM profiles WHERE (profiles.id = auth.uid())) = 'root'::text));
