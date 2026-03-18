import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Receipt, Loader2, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function AtendimentoHistoricoPage() {
  const { company } = usePasskey()
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [ticket, setTicket] = useState<any>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

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
    setTicket(data)
    setSheetOpen(true)
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalhes do Ticket</SheetTitle>
          </SheetHeader>
          {ticket && (
            <div className="space-y-6 mt-6">
              <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID do Ticket</span>
                  <span className="font-mono font-medium text-xs break-all w-3/4 text-right">
                    {ticket.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data/Hora</span>
                  <span className="font-medium">
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Status do Pagamento</span>
                  <Badge
                    variant={ticket.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      ticket.status === 'completed' ? 'bg-green-600 hover:bg-green-600' : ''
                    }
                  >
                    {ticket.status === 'completed' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">Método</span>
                  <span className="uppercase font-semibold tracking-wider text-xs">
                    {ticket.payment_method || '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Serviços / Produtos Inclusos</h4>
                <div className="p-4 border rounded-xl bg-card shadow-sm">
                  <p className="text-sm font-medium leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-5 border rounded-xl bg-primary/10 shadow-inner">
                <span className="font-bold">Valor Total</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {ticket.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
