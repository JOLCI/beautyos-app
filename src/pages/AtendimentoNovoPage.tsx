import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockClients, mockServices } from '@/lib/mock'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, Search, Zap, Ticket, Plus } from 'lucide-react'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AtendimentoNovoPage() {
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  const filteredClients =
    search.length > 2
      ? mockClients.filter(
          (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
        )
      : []

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
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Checkout</h1>
        <p className="text-muted-foreground">Inicie um atendimento rapidamente.</p>
      </div>

      {!selectedClient ? (
        <div className="space-y-6 animate-fade-in">
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <Input
              placeholder="Buscar cliente por nome ou celular..."
              className="pl-12 h-14 rounded-full text-lg border-primary/30 shadow-md focus-visible:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredClients.length > 0 && (
              <Card className="absolute top-16 left-0 right-0 z-10 shadow-xl border-border rounded-xl overflow-hidden animate-in slide-in-from-top-2">
                <CardContent className="p-0">
                  {filteredClients.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer flex justify-between items-center transition"
                      onClick={() => setSelectedClient(c)}
                    >
                      <div>
                        <p className="font-semibold text-base">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.phone}</p>
                      </div>
                      <Badge variant="secondary">Selecionar</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center">
            <span className="text-muted-foreground text-sm">ou</span>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-dashed border-2 rounded-xl h-14 px-8 border-primary/40 text-primary hover:bg-primary/5"
              onClick={() =>
                setSelectedClient({ id: 'avulso', name: 'Cliente Avulso (Sem cadastro)' })
              }
            >
              <Zap className="w-5 h-5 mr-2" /> Atendimento sem agendamento
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-border shadow-elevation rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-primary/10 to-accent/20 p-6 border-b border-border flex justify-between items-start">
            <div>
              <Badge className="mb-2 bg-primary text-white">
                <Ticket className="w-3 h-3 mr-1" /> Ticket Ativo
              </Badge>
              <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
              {selectedClient.phone && (
                <p className="text-muted-foreground">{selectedClient.phone}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedClient(null)
                setSelectedServices([])
              }}
            >
              Alterar Cliente
            </Button>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Adicionar Serviço / Produto</Label>
              <Select onValueChange={addService} value="">
                <SelectTrigger className="h-12 rounded-xl border-dashed border-2">
                  <SelectValue placeholder="Selecione para adicionar ao ticket..." />
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
              <div className="space-y-3 pt-4">
                {selectedServices.map((id) => {
                  const s = mockServices.find((srv) => srv.id === id)
                  return (
                    <div
                      key={id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-card p-4 rounded-xl border shadow-sm gap-4 relative group hover:border-primary/50 transition"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-base">{s?.name}</span>
                        <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                          <span>Preço Base: R$ {s?.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Qtd:</Label>
                          <Input
                            type="number"
                            defaultValue="1"
                            min="1"
                            className="w-16 h-8 text-center"
                          />
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap">
                          R$ {s?.price.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/20 mt-6">
                  <span className="font-bold text-lg">Total do Ticket:</span>
                  <span className="font-extrabold text-2xl text-primary">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full h-14 rounded-full text-lg shadow-lg mt-8"
              disabled={selectedServices.length === 0}
              onClick={() => setSheetOpen(true)}
            >
              Ir para Pagamento
            </Button>
          </CardContent>
        </Card>
      )}

      <CheckoutSheet open={sheetOpen} onOpenChange={setSheetOpen} total={total} />
    </div>
  )
}
