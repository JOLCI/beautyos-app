DO $$
BEGIN
  -- Criação de trigger para retornar o status de agendamentos finalizados
  -- para 'agendado' caso a transação financeira vinculada seja cancelada ou deletada.
END $$;

CREATE OR REPLACE FUNCTION public.rollback_appointment_status()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.ref_id IS NOT NULL THEN
      UPDATE public.appointments
      SET status = 'agendado'
      WHERE id = OLD.ref_id AND status = 'finalizado';
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      IF NEW.ref_id IS NOT NULL THEN
        UPDATE public.appointments
        SET status = 'agendado'
        WHERE id = NEW.ref_id AND status = 'finalizado';
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_cancelled_rollback_appointment ON public.transactions;
CREATE TRIGGER on_transaction_cancelled_rollback_appointment
  AFTER UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.rollback_appointment_status();
