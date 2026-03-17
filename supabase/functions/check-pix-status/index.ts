import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { transactionId } = await req.json()

  // Mock PIX status check
  return new Response(
    JSON.stringify({
      success: true,
      status: 'paid',
      transactionId,
    }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    },
  )
})
