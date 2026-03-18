-- WhatsApp Schedules Table
CREATE TABLE IF NOT EXISTS public.whatsapp_message_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    rendered_message TEXT NOT NULL,
    scheduled_at_datetime TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
    related_title_id UUID REFERENCES public.financial_titles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client Avatar
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- RLS for Schedules
ALTER TABLE public.whatsapp_message_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_wa_schedules" ON public.whatsapp_message_schedules
    FOR ALL TO authenticated
    USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

-- Storage Bucket for Avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('client_avatars', 'client_avatars', true) ON CONFLICT DO NOTHING;

CREATE POLICY "public_avatars" ON storage.objects FOR SELECT USING (bucket_id = 'client_avatars');
CREATE POLICY "auth_upload_avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client_avatars');
CREATE POLICY "auth_update_avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'client_avatars');
CREATE POLICY "auth_delete_avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client_avatars');

-- Cascade Deletions via Trigger for Data Integrity
CREATE OR REPLACE FUNCTION public.cancel_related_wa_schedules()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'paid') AND OLD.status NOT IN ('cancelled', 'paid') THEN
        UPDATE public.whatsapp_message_schedules 
        SET status = 'cancelled', updated_at = NOW()
        WHERE related_title_id = NEW.id AND status = 'pending';
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.whatsapp_message_schedules 
        SET status = 'cancelled', updated_at = NOW()
        WHERE related_title_id = OLD.id AND status = 'pending';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_cancel_wa_on_title
    AFTER UPDATE OR DELETE ON public.financial_titles
    FOR EACH ROW EXECUTE FUNCTION public.cancel_related_wa_schedules();

-- Cleanup Script Function
CREATE OR REPLACE FUNCTION public.cleanup_inconsistent_financial_data()
RETURNS VOID AS $$
BEGIN
    -- Delete transactions that are settlements but lack client/supplier
    DELETE FROM public.transactions 
    WHERE (origin = 'receivable_settlement' AND client_id IS NULL)
       OR (origin = 'payable_settlement' AND supplier_id IS NULL);
       
    -- Mark titles as cancelled if they have no entity
    UPDATE public.financial_titles
    SET status = 'cancelled', description = COALESCE(description, '') || ' (Auto-cancelado: sem entidade vinculada)'
    WHERE (type = 'receivable' AND client_id IS NULL)
       OR (type = 'payable' AND supplier_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
