-- Migration: Complete Restructure of Financial Module
-- WARNING: This migration drops existing financial data to establish a single source of truth.

-- 1. Drop existing tables and their dependencies
DROP TABLE IF EXISTS public.financial_accounts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- 2. Create the Financial Titles table (Accounts Receivable/Payable)
CREATE TABLE public.financial_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled')),
    original_amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    open_amount NUMERIC GENERATED ALWAYS AS (original_amount - paid_amount) STORED,
    due_date DATE NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_title_entity CHECK (
        (type = 'receivable' AND client_id IS NOT NULL) OR
        (type = 'payable' AND supplier_id IS NOT NULL)
    )
);

-- 3. Create the new Transactions table (Cash Flow)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    ticket_id TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8)),
    type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
    origin TEXT NOT NULL CHECK (origin IN ('manual_entry', 'automatic_entry', 'receivable_settlement', 'payable_settlement', 'adjustment', 'transfer')),
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    payment_method TEXT NOT NULL,
    due_date DATE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    confirmed_at TIMESTAMPTZ,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    financial_title_id UUID REFERENCES public.financial_titles(id) ON DELETE SET NULL,
    ref_id UUID, -- For linking to appointments if needed directly
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_tx_entity CHECK (
        (origin IN ('receivable_settlement') AND client_id IS NOT NULL) OR
        (origin IN ('payable_settlement') AND supplier_id IS NOT NULL)
    )
);

-- 4. Audit Triggers
CREATE OR REPLACE FUNCTION public.set_financial_audit_v2()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = auth.uid();
        NEW.updated_by = auth.uid();
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_titles_audit
    BEFORE INSERT OR UPDATE ON public.financial_titles
    FOR EACH ROW EXECUTE FUNCTION public.set_financial_audit_v2();

CREATE TRIGGER trg_transactions_audit
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.set_financial_audit_v2();

-- 5. Performance Indexes
CREATE INDEX idx_titles_company_id ON public.financial_titles(company_id);
CREATE INDEX idx_titles_client_id ON public.financial_titles(client_id);
CREATE INDEX idx_titles_supplier_id ON public.financial_titles(supplier_id);
CREATE INDEX idx_titles_status ON public.financial_titles(status);
CREATE INDEX idx_titles_due_date ON public.financial_titles(due_date);

CREATE INDEX idx_tx_company_id ON public.transactions(company_id);
CREATE INDEX idx_tx_client_id ON public.transactions(client_id);
CREATE INDEX idx_tx_supplier_id ON public.transactions(supplier_id);
CREATE INDEX idx_tx_status ON public.transactions(status);
CREATE INDEX idx_tx_transaction_date ON public.transactions(transaction_date);

-- 6. RLS Policies
ALTER TABLE public.financial_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_titles_all" ON public.financial_titles
    FOR ALL TO authenticated
    USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

CREATE POLICY "company_transactions_all" ON public.transactions
    FOR ALL TO authenticated
    USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

-- 7. Validation View
CREATE OR REPLACE VIEW public.v_financial_inconsistencies AS
SELECT 'transactions' AS source, id, company_id, 'Missing mandatory entity reference' AS error_desc
FROM public.transactions
WHERE (origin = 'receivable_settlement' AND client_id IS NULL)
   OR (origin = 'payable_settlement' AND supplier_id IS NULL)
UNION ALL
SELECT 'financial_titles' AS source, id, company_id, 'Missing mandatory entity reference' AS error_desc
FROM public.financial_titles
WHERE (type = 'receivable' AND client_id IS NULL)
   OR (type = 'payable' AND supplier_id IS NULL);
