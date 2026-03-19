-- Add recurrence_days to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS recurrence_days INTEGER DEFAULT 0;

-- Add related_transaction_id to whatsapp_message_schedules
ALTER TABLE public.whatsapp_message_schedules ADD COLUMN IF NOT EXISTS related_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE;

-- WhatsApp Tags Table for Dynamic Tag Registry
CREATE TABLE IF NOT EXISTS public.whatsapp_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    source_table TEXT,
    source_field TEXT,
    formatter TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, tag_name)
);

ALTER TABLE public.whatsapp_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_wa_tags_all" ON public.whatsapp_tags
    FOR ALL TO authenticated
    USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

-- Seed basic tags for future dynamic parsing extensions
CREATE OR REPLACE FUNCTION seed_basic_wa_tags() RETURNS void AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT id FROM public.companies LOOP
        INSERT INTO public.whatsapp_tags (company_id, tag_name, source_table, source_field) VALUES
        (rec.id, '[NOME_CLIENTE]', 'clients', 'name'),
        (rec.id, '[DATA]', 'appointments', 'date'),
        (rec.id, '[VALOR]', 'financial_titles', 'original_amount'),
        (rec.id, '[PIX]', 'pix_gateways', 'pix_key'),
        (rec.id, '[SERVICOS]', 'services', 'name')
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT seed_basic_wa_tags();

-- Trigger for Transactions to cancel pending WhatsApp messages
CREATE OR REPLACE FUNCTION public.cancel_related_wa_schedules_tx()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled') AND OLD.status NOT IN ('cancelled') THEN
        UPDATE public.whatsapp_message_schedules 
        SET status = 'cancelled', updated_at = NOW()
        WHERE related_transaction_id = NEW.id AND status = 'pending';
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.whatsapp_message_schedules 
        SET status = 'cancelled', updated_at = NOW()
        WHERE related_transaction_id = OLD.id AND status = 'pending';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cancel_wa_on_tx ON public.transactions;
CREATE TRIGGER trg_cancel_wa_on_tx
    AFTER UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.cancel_related_wa_schedules_tx();
