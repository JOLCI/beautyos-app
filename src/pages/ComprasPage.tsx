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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, PackagePlus, Trash2, Edit2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Textarea } from '@/components/ui/textarea'

export default function ComprasPage() {
  const { company } = usePasskey()
  const { data: purchases, refetch } = useQuery<any>('purchases', {
    select: '*, suppliers(name), services(name)',
    order: { column: 'created_at', ascending: false },
  })
  const { data: suppliers } = useQuery<any>('suppliers', { match: { is_active: true } })
  const { data: services } = useQuery<any>('services', { match: { type: 'product' } })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState([{ service_id: '', quantity: 1, unit_cost: 0 }])
  const [installments, setInstallments] = useState([
    { due_date: new Date().toISOString().split('T')[0], amount: 0, method: 'PIX' },
  ])

  const [editOpen, setEditOpen] = useState(false)
  const [purchaseToEdit, setPurchaseToEdit] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const openSheet = (purchase: any = null) => {
    if (purchase) {
      setEditingId(purchase.id)
      setSupplierId(purchase.supplier_id)
      setPurchaseDate(purchase.purchase_date.split('T')[0])
      setItems([
        {
          service_id: purchase.service_id,
          quantity: purchase.quantity,
          unit_cost: purchase.unit_cost,
        },
      ])
      setInstallments([])
    } else {
      setEditingId('')
      setSupplierId('')
      setPurchaseDate(new Date().toISOString().split('T')[0])
      setItems([{ service_id: '', quantity: 1, unit_cost: 0 }])
      setInstallments([
        { due_date: new Date().toISOString().split('T')[0], amount: 0, method: 'PIX' },
      ])
    }
    setSheetOpen(true)
  }

  const handleEditClick = (p: any) => {
    setPurchaseToEdit(p)
    setEditOpen(true)
  }

  const handleDeletePurchase = async (id: string) => {
    if (
      confirm(
        'Tem certeza que deseja deletar o registro desta compra? Todas as parcelas associadas serão excluídas.',
      )
    ) {
      // Clean up orphaned transactions related to the installments of this purchase
      const { data: titles } = await supabase
        .from('financial_titles')
        .select('id')
        .eq('purchase_id', id)
      if (titles && titles.length > 0) {
        const titleIds = titles.map((t: any) => t.id)
        await supabase.from('transactions').delete().in('financial_title_id', titleIds)
      }

      await supabase.from('purchases').delete().eq('id', id)
      toast.success('Compra deletada com sucesso')
      refetch()
    }
  }

  const handleUpdatePurchase = async () => {
    if (!purchaseToEdit) return
    setSaving(true)
    const { error } = await supabase
      .from('purchases')
      .update({
        notes: purchaseToEdit.notes,
        purchase_date: purchaseToEdit.purchase_date,
        supplier_id: purchaseToEdit.supplier_id,
      })
      .eq('id', purchaseToEdit.id)

    setSaving(false)
    if (error) toast.error('Erro ao atualizar: ' + error.message)
    else {
      toast.success('Compra atualizada com sucesso')
      refetch()
      setEditOpen(false)
    }
  }

  const totalCost = items.reduce((acc, i) => acc + Number(i.quantity) * Number(i.unit_cost), 0)

  const distributeInstallments = () => {
    if (installments.length === 0 || totalCost === 0) return
    const split = totalCost / installments.length
    setInstallments(installments.map((ins) => ({ ...ins, amount: split })))
  }

  const handleSaveNew = async () => {
    if (!supplierId || items.some((i) => !i.service_id || i.quantity <= 0))
      return toast.error('Preencha fornecedor e os itens corretamente.')

    const instSum = installments.reduce((acc, i) => acc + Number(i.amount), 0)
    if (Math.abs(instSum - totalCost) > 0.05)
      return toast.error('A soma das parcelas deve ser igual ao total da compra.')

    setSaving(true)
    const purchaseInserts = items.map((i) => ({
      company_id: company?.id,
      supplier_id: supplierId,
      service_id: i.service_id,
      quantity: Number(i.quantity),
      unit_cost: Number(i.unit_cost),
      total_cost: Number(i.quantity) * Number(i.unit_cost),
      purchase_date: purchaseDate,
    }))

    const { data: purData, error: purErr } = await supabase
      .from('purchases')
      .insert(purchaseInserts)
      .select()
    if (purErr) {
      setSaving(false)
      return toast.error('Erro ao salvar compras: ' + purErr.message)
    }

    const firstPurchaseId = purData?.[0]?.id

    for (const item of items) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('*')
        .eq('service_id', item.service_id)
        .maybeSingle()
      if (inv) {
        await supabase
          .from('inventory')
          .update({ quantity: inv.quantity + Number(item.quantity) })
          .eq('id', inv.id)
        await supabase.from('inventory_movements').insert([
          {
            company_id: company?.id,
            inventory_id: inv.id,
            type: 'in',
            quantity: Number(item.quantity),
            reason: 'Compra de Fornecedor',
          },
        ])
      }
    }

    if (installments.length > 0) {
      const titleInserts = installments.map((ins, idx) => ({
        company_id: company?.id,
        type: 'payable',
        status: 'open',
        original_amount: Number(ins.amount),
        due_date: ins.due_date,
        description: `Compra de Produtos - Parcela ${idx + 1}/${installments.length} [${ins.method}]`,
        supplier_id: supplierId,
        purchase_id: firstPurchaseId,
      }))
      await supabase.from('financial_titles').insert(titleInserts as any)
    }

    setSaving(false)
    toast.success('Compra registrada e estoque atualizado!')
    setSheetOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras e Reposição</h1>
          <p className="text-muted-foreground">
            Registre compras de múltiplos produtos e gere contas a pagar.
          </p>
        </div>
        <Button onClick={() => openSheet(null)} className="rounded-full shadow-md">
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
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {new Date(p.purchase_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{p.services?.name}</TableCell>
                  <TableCell>{p.suppliers?.name}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell>R$ {p.unit_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    R$ {p.total_cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(p)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeletePurchase(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!purchases?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma compra registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Editar Compra' : 'Registrar Nova Compra'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-4 border p-4 rounded-xl bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data da Compra</Label>
                  <Input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Itens da Compra</h4>
                {!editingId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setItems([...items, { service_id: '', quantity: 1, unit_cost: 0 }])
                    }
                  >
                    + Item
                  </Button>
                )}
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end border-b pb-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Produto</Label>
                    <Select
                      value={item.service_id}
                      onValueChange={(v) => {
                        const newItems = [...items]
                        newItems[idx].service_id = v
                        setItems(newItems)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-2">
                    <Label className="text-xs">Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[idx].quantity = Number(e.target.value)
                        setItems(newItems)
                      }}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Custo (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[idx].unit_cost = Number(e.target.value)
                        setItems(newItems)
                      }}
                      onBlur={distributeInstallments}
                    />
                  </div>
                  {!editingId && items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive mb-0.5"
                      onClick={() => {
                        const newItems = items.filter((_, i) => i !== idx)
                        setItems(newItems)
                        setTimeout(distributeInstallments, 100)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg p-2 bg-muted rounded-lg">
                <span>Total dos Itens:</span>
                <span className="text-destructive">R$ {totalCost.toFixed(2)}</span>
              </div>
            </div>
            {!editingId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Parcelas / Vencimentos</h4>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={distributeInstallments}>
                      Dividir Igual
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const lastDate =
                          installments.length > 0
                            ? new Date(installments[installments.length - 1].due_date)
                            : new Date()
                        lastDate.setMonth(lastDate.getMonth() + 1)
                        setInstallments([
                          ...installments,
                          {
                            due_date: lastDate.toISOString().split('T')[0],
                            amount: 0,
                            method: 'PIX',
                          },
                        ])
                      }}
                    >
                      + Parcela
                    </Button>
                  </div>
                </div>
                {installments.map((ins, idx) => (
                  <div key={idx} className="flex gap-2 items-end bg-muted/20 p-2 rounded-lg border">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Vencimento</Label>
                      <Input
                        type="date"
                        value={ins.due_date}
                        onChange={(e) => {
                          const newI = [...installments]
                          newI[idx].due_date = e.target.value
                          setInstallments(newI)
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Método</Label>
                      <Select
                        value={ins.method}
                        onValueChange={(v) => {
                          const newI = [...installments]
                          newI[idx].method = v
                          setInstallments(newI)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                          <SelectItem value="CARTAO">Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ins.amount}
                        onChange={(e) => {
                          const newI = [...installments]
                          newI[idx].amount = Number(e.target.value)
                          setInstallments(newI)
                        }}
                      />
                    </div>
                    {installments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive mb-0.5"
                        onClick={() => {
                          const newI = installments.filter((_, i) => i !== idx)
                          setInstallments(newI)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleSave} className="w-full h-12 text-lg">
              {editingId ? 'Salvar Alterações' : 'Confirmar Compra'}
            </Button>{' '}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select
                value={purchaseToEdit?.supplier_id || ''}
                onValueChange={(v) => setPurchaseToEdit({ ...purchaseToEdit, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data da Compra</Label>
              <Input
                type="date"
                value={purchaseToEdit?.purchase_date || ''}
                onChange={(e) =>
                  setPurchaseToEdit({ ...purchaseToEdit, purchase_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={purchaseToEdit?.notes || ''}
                onChange={(e) => setPurchaseToEdit({ ...purchaseToEdit, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePurchase} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
