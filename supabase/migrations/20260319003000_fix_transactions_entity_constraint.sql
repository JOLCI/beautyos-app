-- Drop the overly restrictive constraint that blocks non-settlement origins
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS check_tx_entity;

-- Add the corrected constraint that enforces entity presence only for settlement origins
ALTER TABLE public.transactions ADD CONSTRAINT check_tx_entity CHECK (
    (origin = 'receivable_settlement' AND client_id IS NOT NULL) OR
    (origin = 'payable_settlement' AND supplier_id IS NOT NULL) OR
    origin NOT IN ('receivable_settlement', 'payable_settlement')
);
