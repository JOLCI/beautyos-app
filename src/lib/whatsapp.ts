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

  let pixKeyToUse = context.pixKey

  // 2. Dynamic Tag Engine Logic & Validation
  if (msg.includes('[PIX]') && !pixKeyToUse) {
    const { data: pixGateway } = await supabase
      .from('pix_gateways')
      .select('pix_key')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .maybeSingle()

    if (pixGateway?.pix_key) {
      pixKeyToUse = pixGateway.pix_key
    } else {
      return {
        error:
          'Erro: Chave PIX ausente ou nenhum gateway ativo. Impossível agendar mensagem com a tag [PIX].',
      }
    }
  }

  // Registry Resolution
  msg = msg.replace(/\[NOME_CLIENTE\]/g, context.clientName || '')
  msg = msg.replace(/\[DATA\]/g, context.date || '')
  msg = msg.replace(/\[DATA_HORA\]/g, context.dateTime || '')

  if (msg.includes('[VALOR]')) {
    if (context.amount !== undefined && context.amount !== null) {
      const val = Number(context.amount)
      if (isNaN(val)) {
        return { error: 'Erro: Valor numérico inválido. Impossível agendar mensagem.' }
      }
      const formatted = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      msg = msg.replace(/\[VALOR\]/g, formatted)
    } else {
      return { error: 'Erro: Valor ausente. Impossível agendar mensagem com a tag [VALOR].' }
    }
  }

  msg = msg.replace(/\[SERVICOS\]/g, context.services || '')

  if (pixKeyToUse) {
    msg = msg.replace(/\[PIX\]/g, pixKeyToUse)
  }

  // Integrity Check: Block scheduling if there are unresolved tags
  if (msg.match(/\[.*?\]/)) {
    return {
      error: 'Erro: A mensagem renderizada contém tags não resolvidas. Operação cancelada.',
    }
  }

  // Formatting Date Scheduling
  const finalScheduleDate = new Date(scheduleDate)
  const isFixedTime = ['cobranca_pix_agendado', 'aniversario', 'recorrencia'].includes(templateKey)

  if (isFixedTime) {
    // Force specific message types to 08:00 AM local time
    finalScheduleDate.setHours(8, 0, 0, 0)
  }

  // 3. Schedule the message
  const { error } = await supabase.from('whatsapp_message_schedules').insert([
    {
      company_id: companyId,
      client_id: clientId,
      phone_number: phone,
      rendered_message: msg,
      scheduled_at_datetime: finalScheduleDate.toISOString(),
      related_title_id: relatedTitleId || null,
      related_transaction_id: relatedTxId || null,
      status: 'pending',
    },
  ])

  return { error: error?.message }
}
