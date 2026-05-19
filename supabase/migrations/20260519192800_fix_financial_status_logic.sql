DO $$
BEGIN
  -- Re-calculate paid_amount on titles based on transactions to fix any inconsistency
  UPDATE public.financial_titles ft
  SET 
    paid_amount = COALESCE((
      SELECT SUM(t.amount) 
      FROM public.transactions t 
      WHERE t.financial_title_id = ft.id 
        AND t.status IN ('confirmed')
    ), 0)
  WHERE ft.id IN (SELECT id FROM public.financial_titles);

  -- Correct status based on paid_amount and original_amount if not cancelled
  UPDATE public.financial_titles
  SET status = CASE 
    WHEN paid_amount >= original_amount THEN 'paid'
    WHEN paid_amount > 0 AND paid_amount < original_amount THEN 'partial'
    ELSE 'open'
  END
  WHERE status != 'cancelled';
END $$;
