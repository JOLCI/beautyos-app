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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Plus, PackagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ComprasPage() {
  const { company } = usePasskey()
  const { data: purchases, refetch } = useQuery<any>('purchases', {
    select: '*, suppliers(name), services(name)',
  })
  const { data: suppliers } = useQuery<any>('suppliers', { match: { is_active: true } })
  const { data: services } = useQuery<any>('services', { match: { type: 'product' } })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({
    supplier_id: '',
    service_id: '',
    quantity: '',
    unit_cost: '',
    purchase_date: new Date().toISOString().split('T')[0],
    generate_payable: true,
  })

  const totalCost = Number(form.quantity || 0) * Number(form.unit_cost || 0)

  const handleSave = async () => {
    if (!form.supplier_id || !form.service_id || !form.quantity || !form.unit_cost)
      return toast.error('Preencha os campos obrigatórios')

    const payload = {
      company_id: company?.id,
      supplier_id: form.supplier_id,
      service_id: form.service_id,
      quantity: Number(form.quantity),
      unit_cost: Number(form.unit_cost),
      total_cost: totalCost,
      purchase_date: form.purchase_date,
    }

    const { data: purchase, error } = await supabase
      .from('purchases')
      .insert([payload])
      .select()
      .single()
    if (error) return toast.error('Erro ao salvar compra')

    // Atualiza estoque
    const { data: inv } = await supabase
      .from('inventory')
      .select('*')
      .eq('service_id', form.service_id)
      .single()
    if (inv) {
      await supabase
        .from('inventory')
        .update({ quantity: inv.quantity + Number(form.quantity) })
        .eq('id', inv.id)
      await supabase.from('inventory_movements').insert([
        {
          company_id: company?.id,
          inventory_id: inv.id,
          type: 'in',
          quantity: Number(form.quantity),
          reason: 'Compra de Fornecedor',
        },
      ])
    }

    // Gera Título a Pagar se solicitado
    if (form.generate_payable) {
      await supabase.from('financial_titles').insert([
        {
          company_id: company?.id,
          type: 'payable',
          status: 'open',
          original_amount: totalCost,
          due_date: form.purchase_date,
          description: `Compra de Produto - REF: ${purchase?.id.split('-')[0]}`,
          supplier_id: form.supplier_id,
        },
      ])
      toast.success('Compra registrada e Título a Pagar gerado!')
    } else {
      toast.success('Compra registrada com sucesso!')
    }

    setSheetOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras e Reposição</h1>
          <p className="text-muted-foreground">
            Registre compras de produtos e atualize o estoque.
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="rounded-full shadow-md">
          <PackagePlus className="w-4 h-4 mr-2" /> Nova Compra
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
              {purchases.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.purchase_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{p.services?.name}</TableCell>
                  <TableCell>{p.suppliers?.name}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell>R$ {p.unit_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    R$ {p.total_cost.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma compra registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Registrar Nova Compra</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select
                value={form.supplier_id}
                onValueChange={(v) => setForm({ ...form, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    ?.filter((s: any) => s && s.id && s.id.trim() !== '')
                    .map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Produto (Estoque)</Label>
              <Select
                value={form.service_id}
                onValueChange={(v) => setForm({ ...form, service_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {services
                    ?.filter((s: any) => s && s.id && s.id.trim() !== '')
                    .map((s: any) => (
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
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Unitário (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_cost}
                  onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data da Compra</Label>
              <Input
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center border">
              <span className="font-semibold">Custo Total:</span>
              <span className="text-xl font-bold text-destructive">R$ {totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="gen_pay"
                checked={form.generate_payable}
                onChange={(e) => setForm({ ...form, generate_payable: e.target.checked })}
              />
              <Label htmlFor="gen_pay" className="cursor-pointer">
                Gerar Título a Pagar automaticamente
              </Label>
            </div>
            <Button
              onClick={handleSave}
              className="w-full mt-4"
              disabled={!form.supplier_id || !form.service_id}
            >
              Confirmar Compra
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
