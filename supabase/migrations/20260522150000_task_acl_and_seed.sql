DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jolci.lobato@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'jolci.lobato@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Jolci Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_active, username)
    VALUES (new_user_id, 'jolci.lobato@gmail.com', 'Jolci Admin', 'admin', true, 'jolci_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- RLS for tasks
DROP POLICY IF EXISTS "company_tasks_delete" ON public.tasks;
CREATE POLICY "company_tasks_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    company_id = auth_company_id() AND
    (
      created_by = auth.uid() OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
    )
  );
