import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery } from '@/hooks/use-query'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2, ShoppingCart, CalendarCheck } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'
import { useSearchParams } from 'react-router-dom'

export default function AtendimentoNovoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlAppId = searchParams.get('appointmentId')

  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: professionals } = useQuery<any>('profiles', { match: { is_active: true } })
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })

  const today = new Date().toISOString().split('T')[0]
  const { data: appointments } = useQuery<any>('appointments', { match: { date: today } })

  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [professionalId, setProfessionalId] = useState('')
  const [checkoutClientId, setCheckoutClientId] = useState('')
  const [currentAppId, setCurrentAppId] = useState<string | null>(null)

  const loadAppointment = (appId: string) => {
    const app =
      appointments.find((a: any) => a.id === appId) || (urlAppId === appId ? { id: appId } : null) // simplistic check for passed ID
    if (!app && urlAppId === appId) {
      // If we got here, maybe fetch single via generic method, but we assume appointments contains it if it's today
      return
    }
    if (app) {
      setProfessionalId(app.professional_id || '')
      setCheckoutClientId(app.client_id || '')
      setCurrentAppId(app.id)

      const srvs: any[] = []
      const ids = app.service_ids?.length ? app.service_ids : app.service_id ? [app.service_id] : []
      ids.forEach((id: string, index: number) => {
        const s = services.find((srv: any) => srv.id === id)
        if (s) srvs.push({ ...s, uniqueId: Date.now() + index })
      })
      setSelectedItems(srvs)
      setSearchParams({ appointmentId: app.id })
    }
  }

  // Effect to load URL appointment
  useEffect(() => {
    if (urlAppId && appointments.length && services.length) {
      loadAppointment(urlAppId)
    }
  }, [urlAppId, appointments, services])

  const addItem = (id: string) => {
    const s = services.find((srv) => srv.id === id)
    if (s) setSelectedItems([...selectedItems, { ...s, uniqueId: Date.now() }])
  }

  const removeItem = (uniqueId: number) =>
    setSelectedItems(selectedItems.filter((i) => i.uniqueId !== uniqueId))
  const total = useMemo(() => selectedItems.reduce((acc, i) => acc + i.price, 0), [selectedItems])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ponto de Venda (PDV)</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Label className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Buscar Agendamento (Opcional)
            </Label>
            <Select value={currentAppId || ''} onValueChange={loadAppointment}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione um agendamento de hoje para auto-preencher" />
              </SelectTrigger>
              <SelectContent>
                {appointments
                  .filter((a: any) => a.status === 'agendado' || a.status === 'confirmado')
                  .map((a: any) => {
                    const cli = clients.find((c: any) => c.id === a.client_id)
                    return (
                      <SelectItem key={a.id} value={a.id}>
                        {a.start_time.slice(0, 5)} - {cli?.name || 'Desconhecido'}
                      </SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Profissional (Para Comissões)</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Quem realizou o serviço?" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Adicionar Item Avulso</Label>
            <Select onValueChange={addItem} value="">
              <SelectTrigger>
                <SelectValue placeholder="Selecione produto ou serviço..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - R$ {s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-4">
            {selectedItems.map((item) => (
              <div
                key={item.uniqueId}
                className="flex justify-between items-center p-3 border rounded-lg bg-card shadow-sm"
              >
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <p className="text-xs text-muted-foreground uppercase">{item.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">R$ {item.price.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.uniqueId)}
                    className="text-destructive h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <Button
              className="w-full h-14 rounded-full text-lg mt-4 shadow-elevation"
              onClick={() => setSheetOpen(true)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Avançar para Pagamento (R${' '}
              {total.toFixed(2)})
            </Button>
          )}
        </CardContent>
      </Card>

      <CheckoutSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        total={total}
        items={selectedItems}
        professionalId={professionalId}
        initialClientId={checkoutClientId}
        appointmentId={currentAppId}
        onComplete={() => {
          setSheetOpen(false)
          setSelectedItems([])
          setProfessionalId('')
          setCheckoutClientId('')
          setCurrentAppId(null)
          setSearchParams({})
        }}
      />
    </div>
  )
}
