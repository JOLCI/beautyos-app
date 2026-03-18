-- Migration: Standardize descriptions for financial accounts and transactions
-- Formats existing records to match: ([FORMA DE PAGAMENTO]) - [NOME DO CLIENTE] ([ORIGEM])

-- 1. Update existing financial_accounts created by PDV
-- Old Format: "Recebível Automático (PIX) - Maria Silva"
-- New Format: "(PIX) - Maria Silva (AUTOMATICO)"
UPDATE public.financial_accounts
SET description = regexp_replace(description, '^Recebível Automático \((.*?)\) - (.*)$', '(\1) - \2 (AUTOMATICO)')
WHERE description LIKE 'Recebível Automático %' AND origin = 'pdv';

-- 2. Update existing transactions created by PDV
-- Old Format: "Checkout PDV - 2 itens"
-- New Format: "(PIX) - Cliente Não Identificado (AUTOMATICO)"
-- Note: we use the payment_method column to build the new string.
UPDATE public.transactions
SET description = '(' || COALESCE(payment_method, 'DINHEIRO') || ') - Cliente Não Identificado (AUTOMATICO)'
WHERE description LIKE 'Checkout PDV%';
