-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create cash_closures table
CREATE TABLE IF NOT EXISTS public.cash_closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    closure_date DATE NOT NULL,
    details JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for cash_closures
ALTER TABLE public.cash_closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_cash_closures_all" ON public.cash_closures;
CREATE POLICY "company_cash_closures_all" ON public.cash_closures
    FOR ALL TO authenticated
    USING (
      company_id = COALESCE((SELECT company_id FROM profiles WHERE id = auth.uid()), (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid) 
      OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'root'
    );

-- Ensure storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
CREATE POLICY "Avatar Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Update Access" ON storage.objects;
CREATE POLICY "Avatar Update Access" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Delete Access" ON storage.objects;
CREATE POLICY "Avatar Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
