DO $$
DECLARE
  root_comp_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  root_user_id UUID := gen_random_uuid();
  existing_root_user_id UUID;
BEGIN
  -- Evitar conflito se o passkey BEAUTY01 já estiver em uso por outra empresa não-root
  UPDATE public.companies 
  SET passkey = 'BEAUTY01_OLD_' || substr(id::text, 1, 4) 
  WHERE passkey = 'BEAUTY01' AND id != root_comp_id;

  -- Insere ou Atualiza a Empresa Default
  INSERT INTO public.companies (id, passkey, name)
  VALUES (root_comp_id, 'BEAUTY01', 'BeautyOS Master')
  ON CONFLICT (id) DO UPDATE SET passkey = EXCLUDED.passkey, name = EXCLUDED.name;

  -- Checa se o usuário root já existe pelo e-mail
  SELECT id INTO existing_root_user_id FROM auth.users WHERE email = 'root@beautyos.com' LIMIT 1;

  IF existing_root_user_id IS NULL THEN
    -- Insere Usuário Root com os campos corretos exigidos pelo GoTrue
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      root_user_id, '00000000-0000-0000-0000-000000000000', 'root@beautyos.com', crypt('s3nh4', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('company_id', root_comp_id, 'name', 'Root Admin', 'username', 'root', 'role', 'root')::jsonb,
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    -- Atualiza a senha e metadata do root existente para garantir consistência
    UPDATE auth.users
    SET encrypted_password = crypt('s3nh4', gen_salt('bf')),
        raw_user_meta_data = json_build_object('company_id', root_comp_id, 'name', 'Root Admin', 'username', 'root', 'role', 'root')::jsonb
    WHERE id = existing_root_user_id;

    -- Garante que o profile associado esteja correto
    UPDATE public.profiles
    SET company_id = root_comp_id, role = 'root', username = 'root', name = 'Root Admin'
    WHERE id = existing_root_user_id;
  END IF;

END $$;

-- Criação da função RPC para login usando Username, passando pela RLS e garantindo a mesma tenant
CREATE OR REPLACE FUNCTION public.get_email_for_login(p_username TEXT, p_company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT au.email INTO v_email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.username = p_username 
    AND p.company_id = p_company_id 
    AND p.is_active = true
  LIMIT 1;

  RETURN v_email;
END;
$$;
