DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jolci.lobato@gmail.com') THEN
    DECLARE new_user_id uuid := gen_random_uuid();
    BEGIN
        INSERT INTO auth.users (
          id, instance_id, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
          is_super_admin, role, aud,
          confirmation_token, recovery_token, email_change_token_new,
          email_change, email_change_token_current,
          phone, phone_change, phone_change_token, reauthentication_token
        ) VALUES (
          new_user_id,
          '00000000-0000-0000-0000-000000000000',
          'jolci.lobato@gmail.com',
          crypt('Skip@Pass', gen_salt('bf')),
          NOW(), NOW(), NOW(),
          '{"provider": "email", "providers": ["email"]}',
          '{"name": "Admin", "role": "root"}',
          false, 'authenticated', 'authenticated',
          '', '', '', '', '', NULL, '', '', ''
        );
        INSERT INTO public.profiles (id, email, name, username, role, is_active)
        VALUES (new_user_id, 'jolci.lobato@gmail.com', 'Admin', 'admin', 'root', true)
        ON CONFLICT (id) DO NOTHING;
    END;
  END IF;
END $$;

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS processado_pdv BOOLEAN DEFAULT false;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS data_processamento_pdv TIMESTAMPTZ;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nome_preferido VARCHAR(255);

CREATE TABLE IF NOT EXISTS public.agenda_blockers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('single_date', 'interval')),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    days_of_week JSONB,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    preferred_days JSONB,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agenda_blockers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_agenda_blockers" ON public.agenda_blockers;
CREATE POLICY "company_agenda_blockers" ON public.agenda_blockers FOR ALL TO authenticated USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_waitlist" ON public.waitlist;
CREATE POLICY "company_waitlist" ON public.waitlist FOR ALL TO authenticated USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_tasks" ON public.tasks;
CREATE POLICY "company_tasks" ON public.tasks FOR ALL TO authenticated USING (company_id = auth_company_id() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

CREATE OR REPLACE VIEW public.v_cliente_timeline_360 AS
SELECT 
    a.id, 
    a.company_id,
    a.created_at as evento_datetime, 
    'AGENDAMENTO' as tipo_evento, 
    a.date as data_ref, 
    NULL::numeric as valor, 
    CASE 
        WHEN a.status IN ('realizado', 'finalizado', 'completed', 'paid') THEN 'FINALIZADO' 
        WHEN a.status IN ('cancelado', 'cancelled', 'failed') THEN 'CANCELADO' 
        ELSE 'PENDENTE' 
    END as status_evento, 
    a.client_id, 
    1 as sequencia_tipo
FROM appointments a
UNION ALL
SELECT 
    ft.id, 
    ft.company_id,
    ft.created_at as evento_datetime, 
    'TÍTULO' as tipo_evento, 
    ft.due_date as data_ref, 
    ft.original_amount as valor, 
    CASE 
        WHEN ft.status = 'paid' THEN 'FINALIZADO' 
        WHEN ft.status = 'cancelled' THEN 'CANCELADO'
        WHEN ft.due_date < CURRENT_DATE AND ft.status IN ('open', 'partial') THEN 'VENCIDO' 
        ELSE 'PENDENTE' 
    END as status_evento, 
    ft.client_id, 
    2 as sequencia_tipo
FROM financial_titles ft
UNION ALL
SELECT 
    tr.id, 
    tr.company_id,
    tr.transaction_date::timestamp as evento_datetime, 
    'TRANSAÇÃO' as tipo_evento, 
    tr.transaction_date as data_ref, 
    tr.amount as valor, 
    CASE 
        WHEN tr.status = 'confirmed' THEN 'FINALIZADO' 
        WHEN tr.status = 'cancelled' THEN 'CANCELADO' 
        ELSE 'PENDENTE' 
    END as status_evento, 
    tr.client_id, 
    3 as sequencia_tipo
FROM transactions tr
WHERE tr.origin != 'transfer' AND tr.type = 'inflow';
