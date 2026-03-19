import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { user_id, email, password, name, role, company_id } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    const updates: any = {
      user_metadata: {},
    }

    if (email) {
      updates.email = email
      updates.email_confirm = true
    }
    if (password) {
      updates.password = password
    }

    if (name) updates.user_metadata.name = name
    if (role) updates.user_metadata.role = role
    if (company_id) updates.user_metadata.company_id = company_id

    // Update Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      user_id,
      updates,
    )

    if (authError) throw authError

    // Sync Profile manually just in case the existing handle_new_user trigger doesn't cover updates
    const profileUpdate: any = {}
    if (name) profileUpdate.name = name
    if (role) profileUpdate.role = role
    if (company_id !== undefined) profileUpdate.company_id = company_id
    if (email) profileUpdate.username = email

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user_id)

      if (profileError) throw profileError
    }

    return new Response(JSON.stringify({ success: true, user: authData.user }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
