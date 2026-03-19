-- Creates a view to calculate the interval in days between the same service for a specific client
CREATE OR REPLACE VIEW public.v_client_service_intervals AS
SELECT 
    a.id as appointment_id,
    a.company_id,
    a.client_id,
    a.service_id,
    s.name as service_name,
    s.price as service_price,
    a.date,
    a.start_time,
    a.status,
    LAG(a.date) OVER (PARTITION BY a.client_id, a.service_id ORDER BY a.date ASC, a.start_time ASC) as previous_date,
    (a.date - LAG(a.date) OVER (PARTITION BY a.client_id, a.service_id ORDER BY a.date ASC, a.start_time ASC)) as days_interval
FROM public.appointments a
JOIN public.services s ON a.service_id = s.id;

GRANT SELECT ON public.v_client_service_intervals TO authenticated;
GRANT SELECT ON public.v_client_service_intervals TO anon;
GRANT SELECT ON public.v_client_service_intervals TO service_role;
