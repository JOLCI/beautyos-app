DO $$
DECLARE
  v_company_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  v_user_id UUID;
BEGIN
  -- 1. Create or update the master company
  INSERT INTO public.companies (id, name, passkey, primary_color)
  VALUES (v_company_id, 'BeautyOS Master', 'BEAUTY01', '#e11d48')
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    passkey = EXCLUDED.passkey,
    primary_color = EXCLUDED.primary_color;

  -- 2. Check if the root user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'root@beautyos.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    -- Insert Auth User with correct constraints for GoTrue
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'root@beautyos.com',
      crypt('s3nh4', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('name', 'Root Admin', 'username', 'root', 'role', 'admin', 'company_id', v_company_id),
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    -- Update existing user to ensure password and metadata are correct
    UPDATE auth.users
    SET encrypted_password = crypt('s3nh4', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('name', 'Root Admin', 'username', 'root', 'role', 'admin', 'company_id', v_company_id)
    WHERE id = v_user_id;
  END IF;

  -- 3. Ensure the public.profile exists and is correctly linked
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    INSERT INTO public.profiles (id, company_id, name, username, role, is_active)
    VALUES (v_user_id, v_company_id, 'Root Admin', 'root', 'admin', true);
  ELSE
    UPDATE public.profiles
    SET company_id = v_company_id, 
        name = 'Root Admin', 
        username = 'root', 
        role = 'admin', 
        is_active = true
    WHERE id = v_user_id;
  END IF;

END $$;

-- 4. Re-create the RPC function to fetch email by username safely with case insensitivity
CREATE OR REPLACE FUNCTION public.get_email_for_login(p_username text, p_company_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email TEXT;
BEGIN
  SELECT au.email INTO v_email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.username ILIKE p_username 
    AND p.company_id = p_company_id 
    AND p.is_active = true
  LIMIT 1;

  RETURN v_email;
END;
$function$;
