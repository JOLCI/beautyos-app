import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Placeholder function to resolve missing entrypoint error',
    }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    },
  )
})
