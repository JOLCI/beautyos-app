ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create service-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-images', 'service-images', true) 
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Give public access to service images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated uploads to service images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated updates to service images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated deletes to service images" ON storage.objects;
  
  CREATE POLICY "Give public access to service images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
  CREATE POLICY "Allow authenticated uploads to service images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images');
  CREATE POLICY "Allow authenticated updates to service images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'service-images');
  CREATE POLICY "Allow authenticated deletes to service images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-images');
END $$;
