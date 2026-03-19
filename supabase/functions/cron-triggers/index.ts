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
    const currentDay = now.getDate()
    const currentMonth = now.getMonth() + 1

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

      // 2. Process Birthdays: Schedule a message at 08:00 AM today
      if (tplBirthday) {
        const { data: bdayClients } = await supabase
          .from('clients')
          .select('id, name, phone')
          .eq('company_id', company.id)
          .eq('birthday_day', currentDay)
          .eq('birthday_month', currentMonth)

        for (const client of bdayClients || []) {
          const scheduleDate = new Date()
          scheduleDate.setHours(8, 0, 0, 0)

          let msg = tplBirthday.body.replace(/\[NOME_CLIENTE\]/g, client.name || '')

          // We insert into whatsapp_message_schedules instead of sending directly to keep auditing
          await supabase.from('whatsapp_message_schedules').insert({
            company_id: company.id,
            client_id: client.id,
            phone_number: client.phone,
            rendered_message: msg,
            scheduled_at_datetime: scheduleDate.toISOString(),
            status: 'pending',
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Triggers processed and scheduled successfully.' }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
