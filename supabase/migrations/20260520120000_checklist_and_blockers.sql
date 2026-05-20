-- Bloqueios de Agenda
CREATE TABLE IF NOT EXISTS agenda_blockers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('single_date', 'interval')),
    start_date DATE,
    end_date DATE,
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    days_of_week JSONB,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklists
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_type_enum') THEN CREATE TYPE checklist_type_enum AS ENUM ('cliente', 'servico'); END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_item_type_enum') THEN CREATE TYPE checklist_item_type_enum AS ENUM ('texto', 'numero', 'data', 'sim_nao', 'dropdown'); END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_body_type_enum') THEN CREATE TYPE checklist_body_type_enum AS ENUM ('mao_esquerda', 'mao_direita', 'pe_esquerdo', 'pe_direito'); END IF; END $do$;

CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    nome VARCHAR NOT NULL,
    tipo checklist_type_enum NOT NULL DEFAULT 'servico',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    tipo_resposta checklist_item_type_enum NOT NULL DEFAULT 'texto',
    obrigatoria BOOLEAN DEFAULT false,
    dropdown_origem TEXT,
    lista_manual TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    respostas JSONB NOT NULL DEFAULT '{}',
    respondido_em TIMESTAMPTZ DEFAULT NOW(),
    respondido_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_body_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_response_id UUID REFERENCES checklist_responses(id) ON DELETE CASCADE,
    tipo_corpo checklist_body_type_enum NOT NULL,
    ungueal_numero INTEGER CHECK (ungueal_numero >= 1 AND ungueal_numero <= 5),
    posicao_x NUMERIC,
    posicao_y NUMERIC,
    tipo_alteracao VARCHAR,
    descricao_texto TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES checklists(id);

-- Fix waitlist schema
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS preferred_days JSONB;

-- RLS Checklists
DROP POLICY IF EXISTS "company_checklists" ON public.checklists;
CREATE POLICY "company_checklists" ON public.checklists FOR ALL TO authenticated USING (company_id = auth_company_id());

DROP POLICY IF EXISTS "company_checklist_items" ON public.checklist_items;
CREATE POLICY "company_checklist_items" ON public.checklist_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM checklists c WHERE c.id = checklist_id AND c.company_id = auth_company_id()));

DROP POLICY IF EXISTS "company_checklist_responses" ON public.checklist_responses;
CREATE POLICY "company_checklist_responses" ON public.checklist_responses FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM checklists c WHERE c.id = checklist_id AND c.company_id = auth_company_id()));

DROP POLICY IF EXISTS "company_checklist_body_map" ON public.checklist_body_map;
CREATE POLICY "company_checklist_body_map" ON public.checklist_body_map FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM checklist_responses cr JOIN checklists c ON c.id = cr.checklist_id WHERE cr.id = checklist_response_id AND c.company_id = auth_company_id()));

-- RLS Blockers
DROP POLICY IF EXISTS "company_agenda_blockers" ON public.agenda_blockers;
CREATE POLICY "company_agenda_blockers" ON public.agenda_blockers FOR ALL TO authenticated USING (company_id = auth_company_id());

-- Create Trigger for Financial Sync
CREATE OR REPLACE FUNCTION sync_financial_transactions() RETURNS TRIGGER AS $sync$
BEGIN
   IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
      UPDATE public.transactions 
      SET status = 'confirmed', confirmed_at = NOW() 
      WHERE financial_title_id = NEW.id AND status != 'confirmed';
   END IF;
   RETURN NEW;
END;
$sync$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_financial_transactions ON public.financial_titles;
CREATE TRIGGER trg_sync_financial_transactions
AFTER UPDATE ON public.financial_titles
FOR EACH ROW EXECUTE FUNCTION sync_financial_transactions();

