ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS composite_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS unit_of_measure TEXT DEFAULT 'UN';

CREATE TABLE IF NOT EXISTS public.pix_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    pix_key TEXT NOT NULL,
    pix_key_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_key TEXT NOT NULL,
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    purchase_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pix_gateways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_pix_gateways" ON public.pix_gateways FOR ALL TO authenticated USING (company_id = auth_company_id());

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_whatsapp_templates" ON public.whatsapp_templates FOR ALL TO authenticated USING (company_id = auth_company_id());

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_suppliers" ON public.suppliers FOR ALL TO authenticated USING (company_id = auth_company_id());

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_purchases" ON public.purchases FOR ALL TO authenticated USING (company_id = auth_company_id());

CREATE OR REPLACE FUNCTION public.enforce_single_active_gateway()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
    IF NEW.is_active = true THEN
        UPDATE public.pix_gateways
        SET is_active = false
        WHERE company_id = NEW.company_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trg_single_active_gateway ON public.pix_gateways;
CREATE TRIGGER trg_single_active_gateway
BEFORE INSERT OR UPDATE ON public.pix_gateways
FOR EACH ROW EXECUTE FUNCTION public.enforce_single_active_gateway();

