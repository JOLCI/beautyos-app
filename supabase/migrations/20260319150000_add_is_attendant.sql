ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_attendant BOOLEAN DEFAULT false;

DO $$
BEGIN
    UPDATE public.profiles SET is_attendant = true WHERE role = 'atendimento';
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_id, name, username, role, is_attendant)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'atendimento'),
    COALESCE((NEW.raw_user_meta_data->>'is_attendant')::boolean, true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
