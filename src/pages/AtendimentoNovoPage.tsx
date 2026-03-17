import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockClients, mockServices } from '@/lib/mock'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, PlusCircle } from 'lucide-react'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'

export default function AtendimentoNovoPage() {
  const [clientId, setClientId] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  const addService = (id: string) => {
    if (id && !selectedServices.includes(id)) setSelectedServices([...selectedServices, id])
  }
  const removeService = (id: string) =>
    setSelectedServices(selectedServices.filter((s) => s !== id))

  const total = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const s = mockServices.find((srv) => srv.id === id)
      return acc + (s?.price || 0)
    }, 0)
  }, [selectedServices])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Checkout</h1>
        <p className="text-muted-foreground">Registre um atendimento e realize a cobrança.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Detalhes do Atendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione ou busque o cliente..." />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Adicionar Serviço / Produto</Label>
            <Select onValueChange={addService} value="">
              <SelectTrigger>
                <SelectValue placeholder="Selecione para adicionar..." />
              </SelectTrigger>
              <SelectContent>
                {mockServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - R$ {s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedServices.length > 0 && (
            <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
              {selectedServices.map((id) => {
                const s = mockServices.find((srv) => srv.id === id)
                return (
                  <div
                    key={id}
                    className="flex justify-between items-center bg-background p-3 rounded-lg border shadow-sm"
                  >
                    <span className="font-medium">{s?.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-semibold">R$ {s?.price.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              <div className="flex justify-between items-center pt-2 font-bold text-lg px-2">
                <span>Total Estimado:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 rounded-full text-base shadow-md mt-6"
            disabled={!clientId || selectedServices.length === 0}
            onClick={() => setSheetOpen(true)}
          >
            Ir para o Pagamento
          </Button>
        </CardContent>
      </Card>

      <CheckoutSheet open={sheetOpen} onOpenChange={setSheetOpen} total={total} />
    </div>
  )
}
