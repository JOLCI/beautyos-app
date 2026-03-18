import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentDay = now.getDate()
    const currentMonth = now.getMonth() + 1

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Get all companies to process templates per company
    const { data: companies } = await supabase.from('companies').select('id, name')

    for (const company of companies || []) {
      // 1. Fetch templates
      const { data: templates } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)

      if (!templates || templates.length === 0) continue

      const tplBirthday = templates.find((t: any) => t.template_key === 'aniversario')
      const tplReminder24h = templates.find((t: any) => t.template_key === 'lembrete_24h')
      const tplPixAgendado = templates.find((t: any) => t.template_key === 'cobranca_pix_agendado')

      // 2. Process Birthdays
      if (tplBirthday) {
        const { data: bdayClients } = await supabase
          .from('clients')
          .select('id, name, phone')
          .eq('company_id', company.id)
          .eq('birthday_day', currentDay)
          .eq('birthday_month', currentMonth)

        for (const client of bdayClients || []) {
          const msg = tplBirthday.body.replace(/\[NOME_CLIENTE\]/g, client.name)
          await supabase.functions.invoke('send-whatsapp', {
            body: { to: client.phone, message: msg },
          })
        }
      }

      // 3. Process 24h Reminders (Tomorrow's appointments)
      if (tplReminder24h) {
        const { data: apps } = await supabase
          .from('appointments')
          .select('id, start_time, date, client_id, clients(name, phone)')
          .eq('company_id', company.id)
          .eq('date', tomorrowStr)
          .eq('status', 'agendado')

        for (const app of apps || []) {
          const client = Array.isArray(app.clients) ? app.clients[0] : app.clients
          if (!client?.phone) continue

          let msg = tplReminder24h.body.replace(/\[NOME_CLIENTE\]/g, client.name)
          msg = msg.replace(/\[DATA_HORA\]/g, `${app.date} às ${app.start_time.slice(0, 5)}`)
          await supabase.functions.invoke('send-whatsapp', {
            body: { to: client.phone, message: msg },
          })
        }
      }

      // 4. Process Due Dates (PIX AGENDADO / CONVENIO)
      if (tplPixAgendado) {
        const { data: accounts } = await supabase
          .from('financial_accounts')
          .select('id, amount, description, due_date')
          .eq('company_id', company.id)
          .eq('due_date', todayStr)
          .eq('status', 'pending')

        // Due dates don't have direct client reference in this schema without parsing description
        // Assuming we append client name in description "Recebível Automático (PIX_AGENDADO) - Nome"
        for (const acc of accounts || []) {
          // Simplistic extraction or assuming admin handles manually if phone isn't linked easily
          // In a real prod environment we'd link financial_accounts directly to clients
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Triggers processed' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
