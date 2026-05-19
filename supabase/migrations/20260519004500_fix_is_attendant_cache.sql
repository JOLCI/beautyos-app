ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_attendant BOOLEAN DEFAULT false;

DO $$
BEGIN
    UPDATE public.profiles SET is_attendant = true WHERE role = 'atendimento' AND is_attendant IS NULL;
END $$;

-- Force PostgREST to reload the schema cache so edge functions recognize the new column
NOTIFY pgrst, 'reload schema';
