DO $$ 
BEGIN
    UPDATE public.clients SET phone = regexp_replace(phone, '\D', '', 'g');
    UPDATE public.suppliers SET phone = regexp_replace(phone, '\D', '', 'g') WHERE phone IS NOT NULL;
END $$;

CREATE OR REPLACE VIEW public.v_client_service_intervals AS
SELECT 
    a.id AS appointment_id,
    a.company_id,
    a.client_id,
    a.service_id,
    s.name AS service_name,
    s.price AS service_price,
    a.date,
    a.start_time,
    a.status,
    LAG(a.date) OVER (PARTITION BY a.client_id, a.service_id ORDER BY a.date ASC) AS previous_date,
    (a.date - LAG(a.date) OVER (PARTITION BY a.client_id, a.service_id ORDER BY a.date ASC))::integer AS days_interval
FROM appointments a
JOIN services s ON s.id = a.service_id
WHERE a.status = 'finalizado';
