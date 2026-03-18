-- Ensure index on client_id for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_client_id_perf ON public.transactions USING btree (client_id);

-- Ensure RLS is enabled and policies are set (they might exist, so we drop and recreate or just use DO block)
DO $$
BEGIN
    -- Transactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'company_transactions_select'
    ) THEN
        CREATE POLICY "company_transactions_select" ON public.transactions
          FOR SELECT TO authenticated USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');
    END IF;

    -- Clients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'company_clients_select'
    ) THEN
        CREATE POLICY "company_clients_select" ON public.clients
          FOR SELECT TO authenticated USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');
    END IF;

    -- WhatsApp Templates
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_templates' AND policyname = 'company_whatsapp_templates_select'
    ) THEN
        CREATE POLICY "company_whatsapp_templates_select" ON public.whatsapp_templates
          FOR SELECT TO authenticated USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');
    END IF;
END
$$;
