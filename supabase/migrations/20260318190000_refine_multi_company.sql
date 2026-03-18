DO $$
DECLARE
  first_comp uuid;
BEGIN
  -- 1. Get the oldest company to act as fallback for orphan records
  SELECT id INTO first_comp FROM public.companies ORDER BY created_at ASC LIMIT 1;
  
  IF first_comp IS NOT NULL THEN
    -- Fix missing company_id associations (Safe Defaults for Multi-Tenant completeness)
    UPDATE public.clients SET company_id = first_comp WHERE company_id IS NULL;
    UPDATE public.appointments SET company_id = first_comp WHERE company_id IS NULL;
    UPDATE public.services SET company_id = first_comp WHERE company_id IS NULL;
    UPDATE public.transactions SET company_id = first_comp WHERE company_id IS NULL;
    UPDATE public.financial_accounts SET company_id = first_comp WHERE company_id IS NULL;
    UPDATE public.profiles SET company_id = first_comp WHERE company_id IS NULL AND role != 'root';
    UPDATE public.whatsapp_templates SET company_id = first_comp WHERE company_id IS NULL;
    UPDATE public.pix_gateways SET company_id = first_comp WHERE company_id IS NULL;
  END IF;
END $$;

-- 2. Update RLS on Profiles to exclude 'root' from generic isolation
DROP POLICY IF EXISTS "auth_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_select_profiles" ON public.profiles;

CREATE POLICY "auth_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (
    company_id = auth_company_id()
    OR id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'root'
  );

-- 3. Update RLS on Transactions
DROP POLICY IF EXISTS "company_transactions" ON public.transactions;
CREATE POLICY "company_transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (
    company_id = auth_company_id()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'root'
  );

-- 4. Update RLS on Financial Accounts
DROP POLICY IF EXISTS "company_financials" ON public.financial_accounts;
CREATE POLICY "company_financials" ON public.financial_accounts
  FOR ALL TO authenticated
  USING (
    company_id = auth_company_id()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'root'
  );
