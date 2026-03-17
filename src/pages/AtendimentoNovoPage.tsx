import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery } from '@/hooks/use-query'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2, ShoppingCart } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'

export default function AtendimentoNovoPage() {
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: professionals } = useQuery<any>('profiles', { match: { is_active: true } })

  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [professionalId, setProfessionalId] = useState('')

  const addItem = (id: string) => {
    const s = services.find((srv) => srv.id === id)
    if (s) setSelectedItems([...selectedItems, { ...s, uniqueId: Date.now() }])
  }

  const removeItem = (uniqueId: number) =>
    setSelectedItems(selectedItems.filter((i) => i.uniqueId !== uniqueId))
  const total = useMemo(() => selectedItems.reduce((acc, i) => acc + i.price, 0), [selectedItems])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ponto de Venda</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Profissional (Para Comissões)</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional que realizou o serviço..." />
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
            <Label>Adicionar Serviço ou Produto</Label>
            <Select onValueChange={addItem} value="">
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
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

          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div
                key={item.uniqueId}
                className="flex justify-between items-center p-3 border rounded-lg bg-card"
              >
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">R$ {item.price.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.uniqueId)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <Button
              className="w-full h-14 rounded-full text-lg mt-4"
              onClick={() => setSheetOpen(true)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Cobrar R$ {total.toFixed(2)}
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
        onComplete={() => {
          setSheetOpen(false)
          setSelectedItems([])
          setProfessionalId('')
        }}
      />
    </div>
  )
}
