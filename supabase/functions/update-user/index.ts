import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { user_id, email, password, name, role, company_id, username } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    const updates: any = {
      user_metadata: {},
    }

    if (email) {
      updates.email = email
      updates.email_confirm = true // Programmatically auto-confirm updated email addresses
    }

    // Only update the password if a new one was provided, otherwise ignore it
    if (password) {
      updates.password = password
    }

    if (name) updates.user_metadata.name = name
    if (role) updates.user_metadata.role = role
    if (company_id) updates.user_metadata.company_id = company_id
    if (username) updates.user_metadata.username = username

    // Safely update Auth User credentials inside Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      user_id,
      updates,
    )

    if (authError) throw authError

    // Sync Profile explicitly to maintain the relationship and UI synchronization
    const profileUpdate: any = {}
    if (name) profileUpdate.name = name
    if (role) profileUpdate.role = role
    if (company_id !== undefined) profileUpdate.company_id = company_id
    if (username) profileUpdate.username = username

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
