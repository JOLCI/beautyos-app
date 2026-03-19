-- Drop potential global username constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_key;
    END IF;
END
$$;

-- Drop old lower index if it exists
DROP INDEX IF EXISTS profiles_username_lower_idx;

-- Create company-scoped case-insensitive username index to allow same username in different companies
CREATE UNIQUE INDEX IF NOT EXISTS profiles_company_username_lower_idx ON public.profiles (company_id, lower(username));

-- Create the robust identity resolver function
CREATE OR REPLACE FUNCTION public.resolve_login_identifier(p_identifier TEXT, p_company_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_clean_identifier TEXT;
    v_user_count INT;
    v_resolved_email TEXT;
BEGIN
    -- Normalize the identifier
    v_clean_identifier := lower(trim(p_identifier));

    -- 1. Try Email Match
    SELECT au.email INTO v_resolved_email
    FROM auth.users au
    JOIN public.profiles p ON p.id = au.id
    WHERE lower(au.email) = v_clean_identifier
      AND p.company_id = p_company_id
      AND p.is_active = true
    LIMIT 1;

    IF v_resolved_email IS NOT NULL THEN
        RETURN jsonb_build_object('status', 'success', 'email', v_resolved_email, 'match_type', 'email');
    END IF;

    -- 2. Try Username Match
    SELECT au.email INTO v_resolved_email
    FROM auth.users au
    JOIN public.profiles p ON p.id = au.id
    WHERE lower(p.username) = v_clean_identifier
      AND p.company_id = p_company_id
      AND p.is_active = true
    LIMIT 1;

    IF v_resolved_email IS NOT NULL THEN
        RETURN jsonb_build_object('status', 'success', 'email', v_resolved_email, 'match_type', 'username');
    END IF;

    -- 3. Try Name Match
    SELECT count(*), max(au.email) INTO v_user_count, v_resolved_email
    FROM auth.users au
    JOIN public.profiles p ON p.id = au.id
    WHERE lower(p.name) = v_clean_identifier
      AND p.company_id = p_company_id
      AND p.is_active = true;

    IF v_user_count = 1 THEN
        RETURN jsonb_build_object('status', 'success', 'email', v_resolved_email, 'match_type', 'name');
    ELSIF v_user_count > 1 THEN
        RETURN jsonb_build_object('status', 'ambiguous', 'message', 'Múltiplos usuários encontrados com este nome.');
    END IF;

    -- 4. Not found
    RETURN jsonb_build_object('status', 'not_found');
END;
$$;
