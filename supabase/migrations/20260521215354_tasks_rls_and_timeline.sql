DO $$
BEGIN
  -- Fix tasks delete RLS
  DROP POLICY IF EXISTS "company_tasks_delete" ON public.tasks;
  CREATE POLICY "company_tasks_delete" ON public.tasks
    FOR DELETE TO authenticated
    USING (created_by = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root');

  -- Recreate view v_cliente_timeline_360 to ensure data_ref is correct and sortable
  CREATE OR REPLACE VIEW public.v_cliente_timeline_360 AS
   SELECT 
      id,
      company_id,
      client_id,
      created_at AS evento_datetime,
      date AS data_ref,
      status AS status_evento,
      'AGENDAMENTO' AS tipo_evento,
      NULL::numeric AS valor,
      1 AS sequencia_tipo
   FROM public.appointments
   UNION ALL
   SELECT 
      id,
      company_id,
      client_id,
      created_at AS evento_datetime,
      transaction_date AS data_ref,
      status AS status_evento,
      'TRANSAÇÃO' AS tipo_evento,
      amount AS valor,
      3 AS sequencia_tipo
   FROM public.transactions
   UNION ALL
   SELECT 
      id,
      company_id,
      client_id,
      created_at AS evento_datetime,
      due_date AS data_ref,
      status AS status_evento,
      'TÍTULO' AS tipo_evento,
      original_amount AS valor,
      2 AS sequencia_tipo
   FROM public.financial_titles;
END $$;
