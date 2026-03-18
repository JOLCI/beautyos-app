-- Migration: Add fields for financial restructuring and audit

-- 1. Add new columns to transactions
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS ticket_id TEXT UNIQUE DEFAULT UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8)),
  ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Populate ticket_id for existing transactions using the UUID start
UPDATE public.transactions 
SET ticket_id = UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 8)) 
WHERE ticket_id IS NULL;

-- 3. Make ticket_id NOT NULL now that it is populated
ALTER TABLE public.transactions ALTER COLUMN ticket_id SET NOT NULL;

-- 4. Set payment_method to NOT NULL, with default for existing records
UPDATE public.transactions SET payment_method = 'OUTROS' WHERE payment_method IS NULL;
ALTER TABLE public.transactions ALTER COLUMN payment_method SET NOT NULL;

-- 5. Add CHECK constraints for relational integrity
-- Client ID is mandatory if the transaction is linked to an appointment (ref_id is not null)
ALTER TABLE public.transactions
  ADD CONSTRAINT check_transaction_client_id 
  CHECK ( (ref_id IS NULL) OR (client_id IS NOT NULL) );

-- 6. Add new columns to financial_accounts
ALTER TABLE public.financial_accounts 
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. Audit Triggers
CREATE OR REPLACE FUNCTION public.set_financial_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_transactions_set_audit ON public.transactions;
CREATE TRIGGER trg_transactions_set_audit
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_financial_audit_fields();

DROP TRIGGER IF EXISTS trg_financial_accounts_set_audit ON public.financial_accounts;
CREATE TRIGGER trg_financial_accounts_set_audit
  BEFORE INSERT OR UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_financial_audit_fields();

-- 8. Fix existing null created_by fields using user_id if present
UPDATE public.transactions SET created_by = user_id, updated_by = user_id WHERE created_by IS NULL;

