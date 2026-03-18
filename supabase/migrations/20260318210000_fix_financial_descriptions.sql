DO $$
BEGIN
  -- Fix transactions descriptions where client_id is known but description says 'Cliente Não Identificado' or lacks the name
  UPDATE public.transactions t
  SET description = 
      '(' || COALESCE(t.payment_method, 'OUTROS') || ') - ' || 
      c.name || 
      CASE WHEN t.description LIKE '%(A)%' OR t.description LIKE '%(AUTOMATICO)%' THEN ' (A)' ELSE ' (M)' END
  FROM public.clients c
  WHERE t.client_id = c.id
  AND t.type = 'entrada'
  AND (
      t.description LIKE '%Cliente Não Identificado%' 
      OR t.description NOT LIKE '% - ' || c.name || ' %'
  );

  -- Fix financial_accounts descriptions similarly
  UPDATE public.financial_accounts f
  SET description = 
      '(' || 
      CASE 
          WHEN f.description LIKE '(PIX)%' THEN 'PIX'
          WHEN f.description LIKE '(DINHEIRO)%' THEN 'DINHEIRO'
          WHEN f.description LIKE '(DEBITO)%' THEN 'DEBITO'
          WHEN f.description LIKE '(CREDITO)%' THEN 'CREDITO'
          WHEN f.description LIKE '(CONVENIO)%' THEN 'CONVENIO'
          ELSE 'OUTROS'
      END
      || ') - ' || 
      c.name || 
      CASE WHEN f.description LIKE '%(A)%' OR f.description LIKE '%(AUTOMATICO)%' THEN ' (A)' ELSE ' (M)' END
  FROM public.clients c
  WHERE f.client_id = c.id
  AND f.type = 'receivable'
  AND (
      f.description LIKE '%Cliente Não Identificado%' 
      OR f.description NOT LIKE '% - ' || c.name || ' %'
  );
END $$;
