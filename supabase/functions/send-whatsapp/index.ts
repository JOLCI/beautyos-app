import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { template, to } = await req.json()

  // Mock WhatsApp send
  return new Response(
    JSON.stringify({
      success: true,
      message: `Message template '${template}' sent to ${to || 'client'} successfully via API.`,
    }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    },
  )
})
