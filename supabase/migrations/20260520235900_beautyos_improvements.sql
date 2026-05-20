DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_type_enum') THEN
    CREATE TYPE checklist_type_enum AS ENUM ('cliente', 'servico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_item_type_enum') THEN
    CREATE TYPE checklist_item_type_enum AS ENUM ('texto', 'numero', 'data', 'sim_nao', 'dropdown', 'produto');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_body_type_enum') THEN
    CREATE TYPE checklist_body_type_enum AS ENUM ('mao_esquerda', 'mao_direita', 'pe_esquerdo', 'pe_direito');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo checklist_type_enum NOT NULL DEFAULT 'cliente',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    ordem INT NOT NULL DEFAULT 0,
    pergunta VARCHAR(500) NOT NULL,
    tipo_resposta checklist_item_type_enum NOT NULL DEFAULT 'texto',
    obrigatoria BOOLEAN DEFAULT false,
    dropdown_origem VARCHAR(50),
    valores_json JSONB,
    query_sql TEXT,
    lista_manual TEXT,
    cache_ttl INT DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
    respondido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    respondido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_body_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_response_id UUID REFERENCES public.checklist_responses(id) ON DELETE CASCADE,
    tipo_corpo checklist_body_type_enum NOT NULL,
    ungueal_numero INT CHECK (ungueal_numero >= 1 AND ungueal_numero <= 5),
    posicao_x NUMERIC,
    posicao_y NUMERIC,
    tipo_alteracao VARCHAR(255),
    descricao_texto TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES public.checklists(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.agenda_blockers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    days_of_week JSONB,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP VIEW IF EXISTS public.v_cliente_timeline_360;
CREATE VIEW public.v_cliente_timeline_360 AS
SELECT * FROM (
  SELECT id, company_id, date::timestamp with time zone as evento_datetime, 'AGENDAMENTO' as tipo_evento, date as data_ref, null::numeric as valor, status as status_evento, client_id, 3 as sequencia_tipo
  FROM public.appointments
  UNION ALL
  SELECT id, company_id, created_at as evento_datetime, 'TÍTULO' as tipo_evento, due_date as data_ref, original_amount as valor, status as status_evento, client_id, 2 as sequencia_tipo
  FROM public.financial_titles
  UNION ALL
  SELECT id, company_id, created_at as evento_datetime, 'TRANSAÇÃO' as tipo_evento, transaction_date as data_ref, amount as valor, status as status_evento, client_id, 1 as sequencia_tipo
  FROM public.transactions
) as eventos;

CREATE OR REPLACE FUNCTION public.sync_transaction_on_title_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.transactions
    SET status = 'confirmed', confirmed_at = NOW()
    WHERE financial_title_id = NEW.id AND status != 'confirmed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_transaction_on_title_paid ON public.financial_titles;
CREATE TRIGGER trg_sync_transaction_on_title_paid
AFTER UPDATE ON public.financial_titles
FOR EACH ROW
EXECUTE FUNCTION public.sync_transaction_on_title_paid();

DO $$
DECLARE
  batch_size INT := 1000;
  affected INT;
BEGIN
  LOOP
    UPDATE public.transactions
    SET status = 'confirmed', confirmed_at = NOW()
    WHERE id IN (
      SELECT ft.id FROM public.transactions ft
      JOIN public.financial_titles t ON ft.financial_title_id = t.id
      WHERE t.status = 'paid' AND ft.status != 'confirmed'
      LIMIT batch_size
    );
    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
