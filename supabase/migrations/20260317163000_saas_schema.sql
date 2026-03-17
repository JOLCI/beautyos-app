-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies (Tenants)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passkey TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    primary_color TEXT DEFAULT '#e11d48',
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles linked to auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'atendimento',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    anamnesis JSONB DEFAULT '{}'::jsonb,
    special_prices JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services & Products
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'service', -- 'service' or 'product'
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    cost_price DECIMAL(10,2),
    is_composite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cash Register / Transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'entrada' or 'saida'
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'cancelled', 'pending'
    ref_id UUID, -- For linking related entities
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts Payable/Receivable
CREATE TABLE public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'payable' or 'receivable'
    sub_type TEXT, -- e.g., 'convenio', 'fornecedor'
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    settled_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'in', 'out'
    quantity INTEGER NOT NULL,
    reason TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commissions
CREATE TABLE public.commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2),
    fixed_value DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Companies: Anyone can read, but filter by passkey for landing
CREATE POLICY "anon_select_companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "auth_update_companies" ON public.companies FOR UPDATE TO authenticated USING (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Profiles: Users in same company can read
CREATE POLICY "auth_select_profiles" ON public.profiles FOR SELECT TO authenticated USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "auth_all_profiles" ON public.profiles FOR ALL TO authenticated USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Generic policy function for company-scoped tables
CREATE OR REPLACE FUNCTION auth_company_id() RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE POLICY "company_clients" ON public.clients FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_services" ON public.services FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_appointments" ON public.appointments FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_transactions" ON public.transactions FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_financials" ON public.financial_accounts FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_inventory" ON public.inventory FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_inventory_movements" ON public.inventory_movements FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_comm_rules" ON public.commission_rules FOR ALL TO authenticated USING (company_id = auth_company_id());
CREATE POLICY "company_commissions" ON public.commissions FOR ALL TO authenticated USING (company_id = auth_company_id());

-- Triggers
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, company_id, name, username, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'atendimento')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- SEED DATA
DO $$
DECLARE
  comp_id UUID := gen_random_uuid();
  admin_id UUID := gen_random_uuid();
  cli_id UUID := gen_random_uuid();
  srv_id UUID := gen_random_uuid();
  prod_id UUID := gen_random_uuid();
  inv_id UUID := gen_random_uuid();
BEGIN
  -- Insert Company
  INSERT INTO public.companies (id, passkey, name) VALUES (comp_id, 'BEAUTY01', 'Studio Beauty');

  -- Insert Admin User in auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'admin@beautyos.com', crypt('StrongPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('company_id', comp_id, 'name', 'Admin Root', 'username', 'admin', 'role', 'admin')::jsonb,
    false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
  );

  -- Insert Initial Data
  INSERT INTO public.clients (id, company_id, name, phone, email) VALUES
    (cli_id, comp_id, 'Carla Dias', '11999999999', 'carla@ex.com'),
    (gen_random_uuid(), comp_id, 'Mariana Souza', '11888888888', 'mari@ex.com');

  INSERT INTO public.services (id, company_id, code, name, type, price, duration) VALUES
    (srv_id, comp_id, 'SRV-001', 'Corte Feminino', 'service', 150.00, 60),
    (prod_id, comp_id, 'PROD-001', 'Shampoo Premium', 'product', 80.00, 0);

  INSERT INTO public.appointments (company_id, client_id, service_id, professional_id, date, start_time, end_time, status) VALUES
    (comp_id, cli_id, srv_id, admin_id, CURRENT_DATE, '10:00:00', '11:00:00', 'confirmado');

  INSERT INTO public.transactions (company_id, type, amount, description, status) VALUES
    (comp_id, 'entrada', 150.00, 'Pagamento Corte', 'completed'),
    (comp_id, 'saida', 50.00, 'Material Limpeza', 'completed');

  INSERT INTO public.financial_accounts (company_id, type, description, amount, due_date, status) VALUES
    (comp_id, 'payable', 'Conta de Luz', 350.00, CURRENT_DATE + INTERVAL '5 days', 'pending'),
    (comp_id, 'receivable', 'Convênio Y', 500.00, CURRENT_DATE + INTERVAL '2 days', 'pending');

  INSERT INTO public.inventory (id, company_id, service_id, quantity, min_quantity) VALUES
    (inv_id, comp_id, prod_id, 20, 5);

  INSERT INTO public.inventory_movements (company_id, inventory_id, type, quantity, reason, user_id) VALUES
    (comp_id, inv_id, 'in', 20, 'Estoque Inicial', admin_id);

END $$;
