ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday_day INT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday_month INT;

ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS notes TEXT;

