ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jolci.lobato@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'jolci.lobato@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Jolci", "role": "root"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, username, role, is_active)
    VALUES (v_user_id, 'jolci.lobato@gmail.com', 'Jolci', 'jolci', 'root', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Remove non-digits from clients.phone safely
UPDATE public.clients SET phone = regexp_replace(phone, '\D', '', 'g') WHERE phone IS NOT NULL;

-- Add nome_preferido to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nome_preferido VARCHAR(100);

-- Add checklist_id to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS checklist_id UUID;

-- Add tipo_transacao and referencia_caixa_anterior to transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
    CREATE TYPE transaction_type_enum AS ENUM('receita', 'despesa', 'transferencia_interna', 'ajuste_caixa');
  END IF;
END $$;

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tipo_transacao transaction_type_enum DEFAULT 'receita';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS referencia_caixa_anterior UUID;

-- Create cash_balance_history
CREATE TABLE IF NOT EXISTS public.cash_balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    saldo_inicial DECIMAL(15,2) NOT NULL DEFAULT 0,
    saldo_movimentacoes DECIMAL(15,2) NOT NULL DEFAULT 0,
    saldo_final DECIMAL(15,2) NOT NULL DEFAULT 0,
    transferido_proximo_dia BOOLEAN DEFAULT FALSE,
    data_transferencia DATE,
    id_transacao_transferencia UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    observacoes TEXT,
    fechado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, data)
);

-- Add RLS to cash_balance_history
ALTER TABLE public.cash_balance_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_cash_balance" ON public.cash_balance_history;
CREATE POLICY "company_cash_balance" ON public.cash_balance_history FOR ALL TO authenticated USING (company_id = public.auth_company_id());

-- Create payment_methods
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type_enum') THEN
    CREATE TYPE payment_method_type_enum AS ENUM('dinheiro','cartao_credito','cartao_debito','pix','convenio','cheque');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    tipo payment_method_type_enum NOT NULL DEFAULT 'dinheiro',
    baixa_automatica BOOLEAN DEFAULT TRUE,
    exige_data BOOLEAN DEFAULT FALSE,
    descricao_visivel BOOLEAN DEFAULT TRUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, nome)
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_payment_methods" ON public.payment_methods;
CREATE POLICY "company_payment_methods" ON public.payment_methods FOR ALL TO authenticated USING (company_id = public.auth_company_id());

-- Seed payment_methods
CREATE OR REPLACE FUNCTION public.seed_payment_methods_for_company(p_company_id UUID) RETURNS void AS $$
BEGIN
  INSERT INTO public.payment_methods (company_id, nome, tipo, baixa_automatica, exige_data, descricao_visivel) VALUES
  (p_company_id, 'Dinheiro', 'dinheiro', true, false, true),
  (p_company_id, 'Cartão Crédito', 'cartao_credito', true, false, true),
  (p_company_id, 'Cartão Débito', 'cartao_debito', true, false, true),
  (p_company_id, 'PIX', 'pix', true, false, true),
  (p_company_id, 'PIX Agendado', 'pix', false, true, true),
  (p_company_id, 'Convênio', 'convenio', false, true, true),
  (p_company_id, 'Cheque', 'cheque', false, true, true)
  ON CONFLICT (company_id, nome) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.companies LOOP
    PERFORM public.seed_payment_methods_for_company(rec.id);
  END LOOP;
END $$;

-- Create checklists tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_type_enum') THEN
    CREATE TYPE checklist_type_enum AS ENUM('cliente', 'servico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_item_type_enum') THEN
    CREATE TYPE checklist_item_type_enum AS ENUM('texto','numero','data','sim_nao','produto');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_body_type_enum') THEN
    CREATE TYPE checklist_body_type_enum AS ENUM('mao_esquerda','mao_direita','pe_esquerdo','pe_direito');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo checklist_type_enum NOT NULL DEFAULT 'cliente',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_checklists" ON public.checklists;
CREATE POLICY "company_checklists" ON public.checklists FOR ALL TO authenticated USING (company_id = public.auth_company_id());

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    tipo_resposta checklist_item_type_enum NOT NULL DEFAULT 'texto',
    obrigatoria BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_checklist_items" ON public.checklist_items;
CREATE POLICY "company_checklist_items" ON public.checklist_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_items.checklist_id AND company_id = public.auth_company_id())
);

CREATE TABLE IF NOT EXISTS public.checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    resposta_item JSONB DEFAULT '{}'::jsonb,
    respondido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    respondido_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
ALTER TABLE public.checklist_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_checklist_responses" ON public.checklist_responses;
CREATE POLICY "company_checklist_responses" ON public.checklist_responses FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_responses.checklist_id AND company_id = public.auth_company_id())
);

CREATE TABLE IF NOT EXISTS public.checklist_body_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_response_id UUID REFERENCES public.checklist_responses(id) ON DELETE CASCADE,
    tipo_corpo checklist_body_type_enum NOT NULL,
    ungueal_numero INT CHECK (ungueal_numero BETWEEN 1 AND 5),
    posicao_x DECIMAL,
    posicao_y DECIMAL,
    tipo_alteracao VARCHAR(50),
    descricao_texto TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.checklist_body_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_checklist_body_map" ON public.checklist_body_map;
CREATE POLICY "company_checklist_body_map" ON public.checklist_body_map FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.checklist_responses cr
    JOIN public.checklists c ON c.id = cr.checklist_id
    WHERE cr.id = checklist_body_map.checklist_response_id AND c.company_id = public.auth_company_id()
  )
);

-- Recreate v_client_service_intervals view
DROP VIEW IF EXISTS public.v_client_service_intervals;
CREATE OR REPLACE VIEW public.v_client_service_intervals AS
SELECT 
    a.id as appointment_id,
    a.company_id,
    a.client_id,
    s.id as service_id,
    s.name as service_name,
    s.price as service_price,
    a.date,
    a.start_time,
    a.status,
    lag(a.date) over (partition by a.client_id, s.id order by a.date) as previous_date,
    a.date - lag(a.date) over (partition by a.client_id, s.id order by a.date) as days_interval
FROM public.appointments a
LEFT JOIN public.services s ON s.id = ANY(a.service_ids) OR s.id = a.service_id;

-- Add client_custom_prices type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'special_price_type_enum') THEN
    CREATE TYPE special_price_type_enum AS ENUM('acrescimo','desconto','promocao','manual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'special_price_adj_enum') THEN
    CREATE TYPE special_price_adj_enum AS ENUM('reais','percentual');
  END IF;
END $$;

ALTER TABLE public.client_custom_prices ADD COLUMN IF NOT EXISTS preco_padrao_original DECIMAL(15,2);
ALTER TABLE public.client_custom_prices ADD COLUMN IF NOT EXISTS tipo_especial special_price_type_enum DEFAULT 'manual';
ALTER TABLE public.client_custom_prices ADD COLUMN IF NOT EXISTS valor_ajuste DECIMAL(15,2);
ALTER TABLE public.client_custom_prices ADD COLUMN IF NOT EXISTS tipo_ajuste special_price_adj_enum DEFAULT 'reais';
ALTER TABLE public.client_custom_prices ADD COLUMN IF NOT EXISTS observacoes TEXT;
