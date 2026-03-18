-- Migration: Add metadata to transactions and update descriptions for simplicity
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Replace (AUTOMATICO) with (A) and (MANUAL) with (M)
UPDATE public.financial_accounts
SET description = replace(description, '(AUTOMATICO)', '(A)')
WHERE description LIKE '%(AUTOMATICO)%';

UPDATE public.transactions
SET description = replace(description, '(AUTOMATICO)', '(A)')
WHERE description LIKE '%(AUTOMATICO)%';

UPDATE public.financial_accounts
SET description = replace(description, '(MANUAL)', '(M)')
WHERE description LIKE '%(MANUAL)%';

UPDATE public.transactions
SET description = replace(description, '(MANUAL)', '(M)')
WHERE description LIKE '%(MANUAL)%';
