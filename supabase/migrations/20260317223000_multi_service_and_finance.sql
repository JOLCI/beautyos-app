ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_ids UUID[] DEFAULT '{}';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

ALTER TABLE public.financial_accounts ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'manual';
ALTER TABLE public.financial_accounts ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff';

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.client_custom_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, service_id)
);

ALTER TABLE public.client_custom_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_custom_prices_select" ON public.client_custom_prices FOR SELECT TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_custom_prices_insert" ON public.client_custom_prices FOR INSERT TO authenticated WITH CHECK (company_id = auth_company_id());
CREATE POLICY "company_custom_prices_update" ON public.client_custom_prices FOR UPDATE TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_custom_prices_delete" ON public.client_custom_prices FOR DELETE TO authenticated USING (company_id = auth_company_id());
