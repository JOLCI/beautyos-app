-- Migration to add client_id to financial tables for better traceability
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.financial_accounts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_client_id ON public.financial_accounts(client_id);

DO $$
DECLARE
    rec RECORD;
    c_id UUID;
BEGIN
    -- 1. Standardize descriptions for those that are missing the pattern
    FOR rec IN SELECT id, description, payment_method, ref_id FROM public.transactions WHERE description NOT LIKE '%) - % (%' LOOP
        UPDATE public.transactions 
        SET description = '(' || COALESCE(UPPER(payment_method), 'OUTROS') || ') - ' || COALESCE(NULLIF(TRIM(description), ''), 'Cliente Não Identificado') || ' (' || CASE WHEN ref_id IS NOT NULL THEN 'A' ELSE 'M' END || ')'
        WHERE id = rec.id;
    END LOOP;
    
    FOR rec IN SELECT id, description, origin FROM public.financial_accounts WHERE description NOT LIKE '%) - % (%' LOOP
        UPDATE public.financial_accounts 
        SET description = '(OUTROS) - ' || COALESCE(NULLIF(TRIM(description), ''), 'Cliente Não Identificado') || ' (' || CASE WHEN origin = 'pdv' THEN 'A' ELSE 'M' END || ')'
        WHERE id = rec.id;
    END LOOP;

    -- 2. Link client_id based on parsed name for standardized records
    FOR rec IN SELECT id, description, company_id FROM public.transactions WHERE description LIKE '%) - % (%' LOOP
        SELECT id INTO c_id FROM public.clients 
        WHERE company_id = rec.company_id 
          AND name = TRIM(SUBSTRING(rec.description FROM '\) - (.*?) \('))
        LIMIT 1;
        
        IF c_id IS NOT NULL THEN
            UPDATE public.transactions SET client_id = c_id WHERE id = rec.id;
        END IF;
    END LOOP;

    FOR rec IN SELECT id, description, company_id FROM public.financial_accounts WHERE description LIKE '%) - % (%' LOOP
        SELECT id INTO c_id FROM public.clients 
        WHERE company_id = rec.company_id 
          AND name = TRIM(SUBSTRING(rec.description FROM '\) - (.*?) \('))
        LIMIT 1;
        
        IF c_id IS NOT NULL THEN
            UPDATE public.financial_accounts SET client_id = c_id WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;
