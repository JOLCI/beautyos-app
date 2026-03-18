-- Add notes to suppliers
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS notes VARCHAR(2000);

-- Update clients
ALTER TABLE public.clients ALTER COLUMN notes TYPE VARCHAR(2000);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday_day INT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday_month INT;

-- Enable RLS and create policies with strict isolation and Root fallback
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_whatsapp_templates" ON public.whatsapp_templates;
CREATE POLICY "company_whatsapp_templates" ON public.whatsapp_templates 
FOR ALL TO authenticated USING (
  company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root'
);

ALTER TABLE public.pix_gateways ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_pix_gateways" ON public.pix_gateways;
CREATE POLICY "company_pix_gateways" ON public.pix_gateways 
FOR ALL TO authenticated USING (
  company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root'
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_inventory" ON public.inventory;
CREATE POLICY "company_inventory" ON public.inventory 
FOR ALL TO authenticated USING (
  company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root'
);

ALTER TABLE public.client_custom_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_custom_prices_all" ON public.client_custom_prices;
CREATE POLICY "company_custom_prices_all" ON public.client_custom_prices 
FOR ALL TO authenticated USING (
  company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root'
);
