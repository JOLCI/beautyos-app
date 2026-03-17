import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2, Trash2, Edit2, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ServicosPage() {
  const { company } = usePasskey()
  const {
    data: services,
    loading,
    refetch,
  } = useQuery<any>('services', { match: { is_active: true } })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    price: '',
    type: 'service',
    duration: '60',
    cost_price: '',
    is_composite: false,
    unit_of_measure: 'UN',
    composite_items: [] as any[],
  })

  const openSheet = (s: any = null) => {
    if (s) {
      setEditing(s)
      setForm({
        name: s.name,
        price: s.price.toString(),
        type: s.type,
        duration: s.duration.toString(),
        cost_price: s.cost_price?.toString() || '',
        is_composite: s.is_composite,
        unit_of_measure: s.unit_of_measure || 'UN',
        composite_items: s.composite_items || [],
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        price: '',
        type: 'service',
        duration: '60',
        cost_price: '',
        is_composite: false,
        unit_of_measure: 'UN',
        composite_items: [],
      })
    }
    setSheetOpen(true)
  }

  const addCompositeItem = (id: string) => {
    const it = services.find((x: any) => x.id === id)
    if (it)
      setForm({
        ...form,
        composite_items: [
          ...form.composite_items,
          {
            id: it.id,
            name: it.name,
            quantity: 1,
            cost: it.cost_price || 0,
            um: it.unit_of_measure || 'UN',
          },
        ],
      })
  }

  const removeCompositeItem = (idx: number) => {
    const newItems = [...form.composite_items]
    newItems.splice(idx, 1)
    setForm({ ...form, composite_items: newItems })
  }

  const calculatedCost = form.is_composite
    ? form.composite_items.reduce((acc, i) => acc + i.cost * i.quantity, 0)
    : form.cost_price
      ? Number(form.cost_price)
      : 0

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Nome e preço obrigatórios')

    const payload = {
      name: form.name,
      price: Number(form.price),
      type: form.type,
      duration: Number(form.duration),
      cost_price: calculatedCost,
      is_composite: form.is_composite,
      unit_of_measure: form.unit_of_measure,
      composite_items: form.composite_items,
    }

    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing.id)
      toast.success('Atualizado')
    } else {
      const code = `${form.type === 'product' ? 'PRD' : 'SRV'}-${Date.now().toString().slice(-4)}`
      await supabase.from('services').insert([{ ...payload, code, company_id: company?.id }])
      toast.success('Adicionado')
    }
    setSheetOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços & Produtos</h1>
          <p className="text-muted-foreground">Catálogo e composição avançada (BOM).</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Item
        </Button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo / UND</TableHead>
                  <TableHead>Valor Venda</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {s.name}
                      {s.is_composite && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          <Layers className="w-3 h-3 mr-1" /> Composto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {s.type === 'product' ? 'Produto' : 'Serviço'}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        {s.unit_of_measure}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      R$ {s.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      R$ {s.cost_price?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openSheet(s)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar Item' : 'Novo Item'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Serviço</SelectItem>
                    <SelectItem value="product">Produto / Insumo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade de Medida</Label>
                <Select
                  value={form.unit_of_measure}
                  onValueChange={(v) => setForm({ ...form, unit_of_measure: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                    <SelectItem value="ML">Mililitro (ML)</SelectItem>
                    <SelectItem value="GR">Grama (GR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Venda (R$)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              {!form.is_composite && (
                <div className="space-y-2">
                  <Label>Custo Unitário (R$)</Label>
                  <Input
                    type="number"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  />
                </div>
              )}
            </div>

            {form.type === 'service' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Duração Estimada (min)</Label>
                  <Input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                  <div>
                    <Label className="text-sm font-semibold">Bill of Materials (BOM)</Label>
                    <p className="text-xs text-muted-foreground">Consome produtos ao finalizar.</p>
                  </div>
                  <Switch
                    checked={form.is_composite}
                    onCheckedChange={(v) => setForm({ ...form, is_composite: v })}
                  />
                </div>

                {form.is_composite && (
                  <div className="border p-3 rounded-lg space-y-3 bg-card shadow-inner">
                    <Label>Insumos Utilizados</Label>
                    <Select value="" onValueChange={addCompositeItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar insumo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services
                          .filter((x: any) => x.type === 'product')
                          .map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      {form.composite_items.map((ci: any, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="flex-1 truncate">{ci.name}</span>
                          <span className="text-xs text-muted-foreground w-8">{ci.um}</span>
                          <Input
                            type="number"
                            className="w-16 h-8 text-right"
                            value={ci.quantity}
                            onChange={(e) => {
                              const newI = [...form.composite_items]
                              newI[idx].quantity = Number(e.target.value)
                              setForm({ ...form, composite_items: newI })
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeCompositeItem(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Custo Calculado:</span>
                      <span className="text-primary">R$ {calculatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <SheetFooter className="mt-8">
            <Button className="w-full" onClick={handleSave}>
              Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
