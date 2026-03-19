-- Client Photos Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('client-photos', 'client-photos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "public_client_photos" ON storage.objects FOR SELECT USING (bucket_id = 'client-photos');
CREATE POLICY "auth_upload_client_photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-photos');
CREATE POLICY "auth_update_client_photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'client-photos');
CREATE POLICY "auth_delete_client_photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-photos');

-- Ensure open_amount logic or default is set if null
UPDATE public.financial_titles SET open_amount = original_amount - paid_amount WHERE open_amount IS NULL;

