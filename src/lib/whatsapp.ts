import { supabase } from '@/lib/supabase/client'

/**
 * Evaluates template tags and schedules a WhatsApp message.
 * Incorporates Dynamic Tag Engine validation logic.
 */
export async function resolveAndScheduleWhatsApp(
  companyId: string,
  clientId: string,
  phone: string,
  templateKey: string,
  scheduleDate: string,
  context: {
    clientName?: string
    date?: string
    dateTime?: string
    amount?: string | number
    services?: string
    pixKey?: string
  },
  relatedTitleId?: string,
  relatedTxId?: string,
) {
  if (!phone) return { error: 'Telefone não fornecido' }

  // 1. Fetch template
  const { data: tpls } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('company_id', companyId)
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle()

  if (!tpls) return { error: 'Template inativo ou inexistente' }

  let msg = tpls.body

  // 2. Dynamic Tag Engine Logic & Validation
  // As per AC, missing mandatory tags block the scheduling.
  if (msg.includes('[PIX]') && !context.pixKey) {
    return { error: 'Erro: Chave PIX ausente. Impossível agendar mensagem com a tag [PIX].' }
  }

  // Registry Resolution (Fallback mapping applied in-memory for speed & reliability)
  msg = msg.replace(/\[NOME_CLIENTE\]/g, context.clientName || '')
  msg = msg.replace(/\[DATA\]/g, context.date || '')
  msg = msg.replace(/\[DATA_HORA\]/g, context.dateTime || '')
  msg = msg.replace(/\[VALOR\]/g, context.amount ? String(context.amount) : '')
  msg = msg.replace(/\[SERVICOS\]/g, context.services || '')
  if (context.pixKey) msg = msg.replace(/\[PIX\]/g, context.pixKey)

  // 3. Schedule the message
  const { error } = await supabase.from('whatsapp_message_schedules').insert([
    {
      company_id: companyId,
      client_id: clientId,
      phone_number: phone,
      rendered_message: msg,
      scheduled_at_datetime: scheduleDate,
      related_title_id: relatedTitleId || null,
      related_transaction_id: relatedTxId || null,
      status: 'pending',
    },
  ])

  return { error: error?.message }
}
