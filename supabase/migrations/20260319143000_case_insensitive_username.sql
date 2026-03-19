-- Drop existing case-sensitive unique constraint on username if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_key;
  END IF;
END $$;

-- Drop index if it exists independently
DROP INDEX IF EXISTS profiles_username_key;

-- Create a new case-insensitive unique index
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));

-- Update the get_email_for_login function to add logging and ensure it uses lower() for case-insensitive match
CREATE OR REPLACE FUNCTION public.get_email_for_login(p_username text, p_company_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email TEXT;
BEGIN
  RAISE LOG 'get_email_for_login: Resolving identifier "%" for company "%"', p_username, p_company_id;
  
  SELECT au.email INTO v_email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE lower(p.username) = lower(p_username)
    AND p.company_id = p_company_id 
    AND p.is_active = true
  LIMIT 1;

  IF v_email IS NOT NULL THEN
    RAISE LOG 'get_email_for_login: Found email for username "%"', p_username;
  ELSE
    RAISE LOG 'get_email_for_login: Username "%" not found', p_username;
  END IF;

  RETURN v_email;
END;
$function$;
