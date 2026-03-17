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
import { Plus, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ComprasPage() {
  const { company } = usePasskey()
  const { data: purchases, refetch } = useQuery<any>('purchases', {
    order: { column: 'created_at', ascending: false },
  })
  const { data: suppliers } = useQuery<any>('suppliers', { match: { is_active: true } })
  const { data: products } = useQuery<any>('services', {
    match: { is_active: true, type: 'product' },
  })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({
    supplier_id: '',
    service_id: '',
    quantity: '1',
    unit_cost: '',
    purchase_date: new Date().toISOString().split('T')[0],
  })

  const handleSave = async () => {
    if (!form.service_id || !form.unit_cost) return toast.error('Preencha os campos obrigatórios')

    const qty = Number(form.quantity)
    const cost = Number(form.unit_cost)

    await supabase.from('purchases').insert([
      {
        company_id: company?.id,
        supplier_id: form.supplier_id || null,
        service_id: form.service_id,
        quantity: qty,
        unit_cost: cost,
        total_cost: qty * cost,
        purchase_date: form.purchase_date,
      },
    ])

    const { data: inv } = await supabase
      .from('inventory')
      .select('*')
      .eq('service_id', form.service_id)
      .single()
    if (inv) {
      await supabase
        .from('inventory')
        .update({ quantity: inv.quantity + qty })
        .eq('id', inv.id)
    } else {
      await supabase
        .from('inventory')
        .insert([{ company_id: company?.id, service_id: form.service_id, quantity: qty }])
    }

    await supabase.from('services').update({ cost_price: cost }).eq('id', form.service_id)

    toast.success('Compra registrada e estoque atualizado')
    setSheetOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground">Registro de entrada de produtos e insumos.</p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Nova Compra
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Custo Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => {
                const srv = products.find((s: any) => s.id === p.service_id)
                const sup = suppliers.find((s: any) => s.id === p.supplier_id)
                return (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.purchase_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{srv?.name}</TableCell>
                    <TableCell>{sup?.name || '-'}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>R$ {p.unit_cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">
                      R$ {p.total_cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader className="mb-6">
            <SheetTitle>Registrar Compra</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select
                value={form.service_id}
                onValueChange={(v) => setForm({ ...form, service_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor (Opcional)</Label>
              <Select
                value={form.supplier_id}
                onValueChange={(v) => setForm({ ...form, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Unitário (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.unit_cost}
                  onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter className="mt-8">
            <Button className="w-full" onClick={handleSave}>
              Confirmar Entrada
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
