-- Migration to automatically sync financial_titles with their transactions
-- ensuring "cancelled" status logic is prioritized and paid amounts remain consistent.

CREATE OR REPLACE FUNCTION public.recalculate_financial_title()
RETURNS trigger AS $function$
DECLARE
  v_title_id UUID;
  v_total_paid NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_title_id := OLD.financial_title_id;
  ELSE
    v_title_id := NEW.financial_title_id;
  END IF;

  IF v_title_id IS NOT NULL THEN
    -- Calculate total paid amount from confirmed transactions ONLY
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM public.transactions
    WHERE financial_title_id = v_title_id AND status = 'confirmed';

    -- Update title, ensuring 'cancelled' status is sticky
    UPDATE public.financial_titles
    SET 
      paid_amount = v_total_paid,
      status = CASE 
                 WHEN status = 'cancelled' THEN 'cancelled'
                 WHEN v_total_paid >= original_amount THEN 'paid'
                 WHEN v_total_paid > 0 THEN 'partial'
                 ELSE 'open'
               END
    WHERE id = v_title_id;
  END IF;

  IF TG_OP = 'DELETE' THEN 
    RETURN OLD; 
  ELSE 
    RETURN NEW; 
  END IF;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_title ON public.transactions;
CREATE TRIGGER trg_recalculate_title
  AFTER INSERT OR UPDATE OF status, amount, financial_title_id OR DELETE
  ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_financial_title();
