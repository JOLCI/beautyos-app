DO $seed$
DECLARE
    v_comp_id UUID;
    v_prof1_id UUID := gen_random_uuid();
    v_prof2_id UUID := gen_random_uuid();
    v_prof3_id UUID := gen_random_uuid();
    v_cli_ids UUID[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
    v_srv_ids UUID[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
BEGIN
    SELECT id INTO v_comp_id FROM public.companies WHERE passkey = 'BEAUTY01' LIMIT 1;
    IF v_comp_id IS NULL THEN
        v_comp_id := gen_random_uuid();
        INSERT INTO public.companies (id, passkey, name) VALUES (v_comp_id, 'BEAUTY01', 'BeautyOS Demo');
    END IF;

    -- users
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token)
    VALUES 
    (v_prof1_id, '00000000-0000-0000-0000-000000000000', 'prof1@beautyos.com', crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', json_build_object('company_id', v_comp_id, 'name', 'Carlos Corte', 'username', 'prof1', 'role', 'atendimento')::jsonb, false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''),
    (v_prof2_id, '00000000-0000-0000-0000-000000000000', 'prof2@beautyos.com', crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', json_build_object('company_id', v_comp_id, 'name', 'Ana Cor', 'username', 'prof2', 'role', 'atendimento')::jsonb, false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''),
    (v_prof3_id, '00000000-0000-0000-0000-000000000000', 'prof3@beautyos.com', crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', json_build_object('company_id', v_comp_id, 'name', 'Pedro Manicure', 'username', 'prof3', 'role', 'atendimento')::jsonb, false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', '');

    -- clients
    INSERT INTO public.clients (id, company_id, name, phone, email) VALUES
    (v_cli_ids[1], v_comp_id, 'Alice Silva', '11900000001', 'alice@email.com'),
    (v_cli_ids[2], v_comp_id, 'Bruno Costa', '11900000002', 'bruno@email.com'),
    (v_cli_ids[3], v_comp_id, 'Camila Rocha', '11900000003', 'camila@email.com'),
    (v_cli_ids[4], v_comp_id, 'Diego Mendes', '11900000004', 'diego@email.com'),
    (v_cli_ids[5], v_comp_id, 'Elena Nogueira', '11900000005', 'elena@email.com');

    -- services
    INSERT INTO public.services (id, company_id, code, name, type, price, duration) VALUES
    (v_srv_ids[1], v_comp_id, 'SRV-01', 'Corte Masculino', 'service', 50.00, 30),
    (v_srv_ids[2], v_comp_id, 'SRV-02', 'Corte Feminino', 'service', 120.00, 60),
    (v_srv_ids[3], v_comp_id, 'SRV-03', 'Coloração', 'service', 200.00, 120),
    (v_srv_ids[4], v_comp_id, 'SRV-04', 'Escova Progressiva', 'service', 150.00, 90),
    (v_srv_ids[5], v_comp_id, 'SRV-05', 'Manicure', 'service', 35.00, 45),
    (v_srv_ids[6], v_comp_id, 'SRV-06', 'Pedicure', 'service', 45.00, 45),
    (v_srv_ids[7], v_comp_id, 'SRV-07', 'Design de Sobrancelhas', 'service', 40.00, 30),
    (v_srv_ids[8], v_comp_id, 'SRV-08', 'Maquiagem', 'service', 180.00, 60),
    (v_srv_ids[9], v_comp_id, 'PRD-01', 'Shampoo Hidratante', 'product', 85.00, 0),
    (v_srv_ids[10], v_comp_id, 'PRD-02', 'Condicionador Profundo', 'product', 95.00, 0);

    -- appointments (pending)
    INSERT INTO public.appointments (company_id, client_id, service_id, professional_id, date, start_time, end_time, status) VALUES
    (v_comp_id, v_cli_ids[1], v_srv_ids[1], v_prof1_id, CURRENT_DATE, '09:00:00', '09:30:00', 'agendado'),
    (v_comp_id, v_cli_ids[2], v_srv_ids[3], v_prof2_id, CURRENT_DATE, '10:00:00', '12:00:00', 'agendado'),
    (v_comp_id, v_cli_ids[3], v_srv_ids[5], v_prof3_id, CURRENT_DATE, '14:00:00', '14:45:00', 'agendado'),
    (v_comp_id, v_cli_ids[4], v_srv_ids[8], v_prof2_id, CURRENT_DATE, '16:00:00', '17:00:00', 'agendado'),
    (v_comp_id, v_cli_ids[5], v_srv_ids[2], v_prof1_id, CURRENT_DATE, '17:30:00', '18:30:00', 'agendado');

END $seed$;
