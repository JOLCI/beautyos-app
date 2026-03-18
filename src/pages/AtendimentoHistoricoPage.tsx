import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Receipt, Loader2, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { TransactionTicketDialog } from '@/components/financeiro/TransactionTicketDialog'

export default function AtendimentoHistoricoPage() {
  const { company } = usePasskey()
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [ticketTx, setTicketTx] = useState<any>(null)

  const handleSearch = async () => {
    if (!searchTerm) return
    setSearching(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles!transactions_user_id_fkey(name)')
      .eq('id', searchTerm)
      .eq('company_id', company?.id)
      .maybeSingle()

    setSearching(false)
    if (error || !data) {
      toast.error('Ticket não encontrado')
      return
    }
    setTicketTx(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico e Tickets</h1>
        <p className="text-muted-foreground">Consulte os atendimentos e vendas finalizadas.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Consulta Avançada de Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Utilize o ID do Ticket gerado na conclusão do atendimento para consultar o histórico
              detalhado.
            </p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="font-mono text-xs"
              />
              <Button onClick={handleSearch} disabled={searching} className="shrink-0">
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-md border-dashed bg-muted/20">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-2 h-full text-muted-foreground">
            <Calendar className="w-8 h-8 opacity-50" />
            <p className="text-sm">
              Para visualizar o histórico completo de clientes e agendamentos passados, acesse a
              guia de <strong>Caixa</strong> ou <strong>Relatórios</strong>.
            </p>
          </CardContent>
        </Card>
      </div>

      <TransactionTicketDialog
        transaction={ticketTx}
        open={!!ticketTx}
        onOpenChange={(o: boolean) => !o && setTicketTx(null)}
      />
    </div>
  )
}
