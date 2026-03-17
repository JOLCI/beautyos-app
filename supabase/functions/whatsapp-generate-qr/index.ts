import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(JSON.stringify({ success: true, qr: 'mock-qr-code-data' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
})
