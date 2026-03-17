CREATE TABLE public.financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_financial_audit_logs" ON public.financial_audit_logs 
    FOR SELECT TO authenticated USING (company_id = public.auth_company_id());

CREATE OR REPLACE FUNCTION log_financial_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        v_company_id := NEW.company_id;
        INSERT INTO public.financial_audit_logs (company_id, user_id, action, table_name, record_id, new_values)
        VALUES (v_company_id, v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_company_id := NEW.company_id;
        INSERT INTO public.financial_audit_logs (company_id, user_id, action, table_name, record_id, old_values, new_values)
        VALUES (v_company_id, v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_company_id := OLD.company_id;
        INSERT INTO public.financial_audit_logs (company_id, user_id, action, table_name, record_id, old_values)
        VALUES (v_company_id, v_user_id, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION log_financial_changes();

CREATE TRIGGER audit_financial_accounts_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION log_financial_changes();
