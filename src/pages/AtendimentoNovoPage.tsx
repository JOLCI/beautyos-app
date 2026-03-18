import { useState, useMemo } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, CalendarClock, User, Plus } from 'lucide-react'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

export default function AtendimentoNovoPage() {
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: appointments } = useQuery<any>('appointments', { match: { status: 'agendado' } })
  const { data: clients } = useQuery<any>('clients')

  const [cart, setCart] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('')

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  )

  const pendingAppointments = useMemo(() => {
    return appointments
      .map((a) => {
        const client = clients.find((c) => c.id === a.client_id)
        const service = services.find((s) => s.id === a.service_id)
        return { ...a, client, service }
      })
      .filter((a) => a.client)
  }, [appointments, clients, services])

  const addToCart = (service: any) => {
    setCart([...cart, service])
  }

  const loadAppointment = (apt: any) => {
    setSelectedClientId(apt.client_id)
    setSelectedAppointmentId(apt.id)
    if (apt.service) {
      setCart([apt.service])
      toast.success('Agendamento carregado no PDV')
    }
  }

  return (
    <div className="space-y-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDV / Novo Atendimento</h1>
          <p className="text-muted-foreground">
            Inicie uma venda avulsa ou carregue um agendamento pendente.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarClock className="w-5 h-5" /> Agendamentos Pendentes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAppointments.map((apt) => (
              <Card
                key={apt.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => loadAppointment(apt)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> {apt.client?.name}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {new Date(apt.date).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {apt.start_time} - {apt.service?.name || 'Vários Serviços'}
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingAppointments.length === 0 && (
              <div className="col-span-full p-4 border border-dashed rounded-xl text-center text-muted-foreground">
                Nenhum agendamento pendente no momento.
              </div>
            )}
          </div>
        </div>

        <Card>
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos e serviços por nome ou código..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredServices.map((s) => (
                  <div
                    key={s.id}
                    className="border rounded-xl p-4 flex flex-col justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 font-mono">{s.code}</div>
                      <div className="font-medium line-clamp-2">{s.name}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-primary">R$ {s.price.toFixed(2)}</span>
                      <Button size="sm" variant="secondary" onClick={() => addToCart(s)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col min-h-[500px] sticky top-6">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="font-medium line-clamp-1 flex-1">{item.name}</span>
                  <span className="text-muted-foreground ml-2">R$ {item.price.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 text-destructive"
                    onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Carrinho vazio
                </div>
              )}
            </div>

            <div className="pt-4 mt-auto border-t">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>R$ {cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
              </div>
              <Button
                className="w-full h-12 text-lg rounded-xl shadow-elevation"
                disabled={cart.length === 0}
                onClick={() => setCheckoutOpen(true)}
              >
                Ir para Pagamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={cart}
        initialClientId={selectedClientId}
        appointmentId={selectedAppointmentId}
        onComplete={() => {
          setCart([])
          setSelectedClientId('')
          setSelectedAppointmentId('')
          setCheckoutOpen(false)
        }}
      />
    </div>
  )
}
