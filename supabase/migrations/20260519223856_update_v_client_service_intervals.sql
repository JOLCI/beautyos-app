CREATE OR REPLACE VIEW public.v_client_service_intervals AS
WITH appointment_services AS (
    -- Unnest service_ids to get individual service names/prices
    SELECT 
        a.id as appointment_id,
        a.company_id,
        a.client_id,
        a.date,
        a.start_time,
        a.status,
        s.name as service_name,
        s.price as service_price
    FROM public.appointments a
    LEFT JOIN public.services s ON s.id = ANY(a.service_ids) OR s.id = a.service_id
)
SELECT 
    appointment_id,
    company_id,
    client_id,
    NULL::uuid as service_id, -- Keep for backward compatibility if needed
    service_name,
    service_price,
    date,
    start_time,
    status,
    LAG(date) OVER (PARTITION BY client_id, service_name ORDER BY date ASC) as previous_date,
    (date - LAG(date) OVER (PARTITION BY client_id, service_name ORDER BY date ASC))::integer as days_interval
FROM (
    -- Group or Select logic depending on UI needs
    -- This version provides one row per service per appointment for interval tracking
    SELECT * FROM appointment_services
) as base_data;
