import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Only use this in edge functions securely - requires SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { email, password, name, role, company_id } = await req.json()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, company_id },
  })

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  return new Response(JSON.stringify({ success: true, user: data.user }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
})
