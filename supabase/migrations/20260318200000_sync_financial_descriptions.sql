-- Replace old long markers with new standardized markers for all historical records
UPDATE public.transactions
SET description = replace(description, '(AUTOMATICO)', '(A)')
WHERE description LIKE '%(AUTOMATICO)%';

UPDATE public.financial_accounts
SET description = replace(description, '(AUTOMATICO)', '(A)')
WHERE description LIKE '%(AUTOMATICO)%';

UPDATE public.transactions
SET description = replace(description, '(MANUAL)', '(M)')
WHERE description LIKE '%(MANUAL)%';

UPDATE public.financial_accounts
SET description = replace(description, '(MANUAL)', '(M)')
WHERE description LIKE '%(MANUAL)%';

-- Trigger Function to sync Transaction description -> Financial Account
CREATE OR REPLACE FUNCTION public.sync_transaction_desc_fn()
RETURNS trigger AS $$
BEGIN
    IF NEW.description IS DISTINCT FROM OLD.description THEN
        -- Update related financial accounts only if they actually differ to avoid infinite trigger loops
        UPDATE public.financial_accounts
        SET description = NEW.description
        WHERE transaction_id = NEW.id AND description IS DISTINCT FROM NEW.description;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_transaction_desc ON public.transactions;
CREATE TRIGGER trg_sync_transaction_desc
AFTER UPDATE OF description ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_transaction_desc_fn();


-- Trigger Function to sync Financial Account description -> Transaction
CREATE OR REPLACE FUNCTION public.sync_financial_desc_fn()
RETURNS trigger AS $$
BEGIN
    IF NEW.description IS DISTINCT FROM OLD.description AND NEW.transaction_id IS NOT NULL THEN
        -- Update related transaction only if it actually differs to avoid infinite trigger loops
        UPDATE public.transactions
        SET description = NEW.description
        WHERE id = NEW.transaction_id AND description IS DISTINCT FROM NEW.description;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_financial_desc ON public.financial_accounts;
CREATE TRIGGER trg_sync_financial_desc
AFTER UPDATE OF description ON public.financial_accounts
FOR EACH ROW EXECUTE FUNCTION public.sync_financial_desc_fn();
