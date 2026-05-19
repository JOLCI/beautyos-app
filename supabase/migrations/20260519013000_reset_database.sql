-- Migration: Reset database and counters
-- Preserva APENAS: usuários/equipe (profiles, auth.users) e Configurações (companies, pix_gateways, whatsapp_tags, whatsapp_templates)

TRUNCATE TABLE 
  public.appointments,
  public.cash_closures,
  public.client_custom_prices,
  public.clients,
  public.commission_rules,
  public.commissions,
  public.financial_audit_logs,
  public.financial_titles,
  public.inventory,
  public.inventory_movements,
  public.purchases,
  public.services,
  public.suppliers,
  public.transactions,
  public.whatsapp_message_schedules
RESTART IDENTITY CASCADE;
