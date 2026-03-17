-- WhatsApp Logs Table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passkey VARCHAR(8) NOT NULL,
    appointment_id UUID,
    trigger VARCHAR(50) NOT NULL,
    recipient_phone VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('sent', 'failed', 'skipped')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read-only access" ON whatsapp_logs
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('admin', 'root')
        )
    );

-- Insertions must come from Edge Functions with Service Role key
-- No INSERT policy for authenticated users from frontend

-- Cron Job for Reminders every 30 minutes
-- Requires pg_cron extension
SELECT cron.schedule(
    'whatsapp-reminders',
    '*/30 * * * *',
    $$
    SELECT net.http_post(
        url:='https://your-project.supabase.co/functions/v1/send-reminders',
        headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    )
    $$
);
