ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS canceled_by_client BOOLEAN DEFAULT false;
