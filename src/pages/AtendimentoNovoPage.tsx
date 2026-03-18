import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ShoppingCart, User, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'

export default function AtendimentoNovoPage() {
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')

  const { data: appointments } = useQuery<any>('appointments', { match: { status: 'agendado' } })
  const { data: clients } = useQuery<any>('clients')
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })

  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    if (appointmentId && appointments.length > 0 && !selectedApp) {
      const app = appointments.find((a: any) => a.id === appointmentId)
      if (app) handleSelectApp(app)
    }
  }, [appointmentId, appointments])

  const handleSelectApp = (app: any) => {
    setSelectedApp(app)
    const appSrvIds = app.service_ids?.length
      ? app.service_ids
      : app.service_id
        ? [app.service_id]
        : []
    const items = appSrvIds
      .map((id: string) => services.find((s: any) => s.id === id))
      .filter(Boolean)
    setCart(items)
  }

  const filteredApps = useMemo(() => {
    return appointments.filter((a: any) => {
      const cli = clients.find((c: any) => c.id === a.client_id)
      const term = search.toLowerCase()
      return (
        cli?.name.toLowerCase().includes(term) ||
        a.date.includes(term) ||
        a.start_time.includes(term)
      )
    })
  }, [appointments, clients, search])

  const total = cart.reduce((acc, curr) => acc + (curr.price || 0), 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PDV / Checkout</h1>
        <p className="text-muted-foreground">
          Selecione um agendamento ou inicie um atendimento avulso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agendamento (Cliente, Data, Hora)..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {filteredApps.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum agendamento aberto.
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredApps.map((a: any) => {
                      const cli = clients.find((c: any) => c.id === a.client_id)
                      return (
                        <div
                          key={a.id}
                          onClick={() => handleSelectApp(a)}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />{' '}
                              {cli?.name || 'Cliente Desconhecido'}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />{' '}
                                {new Date(a.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {a.start_time.slice(0, 5)}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Selecionar
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b border-border bg-muted/20 font-semibold">
              Adicionar Serviços ou Produtos Extras
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {services.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => setCart([...cart, s])}
                    className="border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors text-sm flex flex-col justify-between"
                  >
                    <span className="font-medium truncate">{s.name}</span>
                    <span className="text-primary mt-2">R$ {s.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <div className="p-6 border-b border-border bg-muted/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Resumo do Atendimento</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApp ? (
                    <span className="text-primary font-medium">Vinculado a um agendamento</span>
                  ) : (
                    'Atendimento Avulso'
                  )}
                </p>
              </div>
            </div>
            <CardContent className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  O carrinho está vazio.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-muted-foreground text-xs">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => setCart(cart.filter((_, idx) => i !== idx))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-4 border-t mt-4 flex items-center justify-between text-xl font-bold">
                    <span>Total Parcial</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full h-12 text-lg rounded-xl mt-6"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Avançar para Pagamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={cart}
        initialClientId={selectedApp?.client_id}
        appointmentId={selectedApp?.id}
        onComplete={() => {
          setCart([])
          setSelectedApp(null)
          setCheckoutOpen(false)
        }}
      />
    </div>
  )
}
