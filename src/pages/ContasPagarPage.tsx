import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CheckCircle2, Plus, AlertTriangle, Building2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { TitlePaymentDialog } from '@/components/financeiro/TitlePaymentDialog'
import { TitleDetailSheet } from '@/components/financeiro/TitleDetailSheet'
import { translateStatus } from '@/lib/utils'

export default function ContasPagarPage() {
  const { company } = usePasskey()
  const { data: titles, refetch } = useQuery<any>('financial_titles', {
    match: { type: 'payable' },
    select: '*, suppliers(name)',
  })
  const { data: suppliers } = useQuery<any>('suppliers', { match: { is_active: true } })

  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [paymentTitle, setPaymentTitle] = useState<any>(null)
  const [detailTitle, setDetailTitle] = useState<any>(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    supplier_id: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    recurrence: false,
  })

  const openSheet = () => {
    setForm({
      supplier_id: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
      recurrence: false,
    })
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.supplier_id || !form.amount) return toast.error('Preencha fornecedor e valor.')
    setSaving(true)

    const inserts = []
    let currDate = new Date(form.due_date + 'T12:00:00')

    inserts.push({
      company_id: company?.id,
      type: 'payable',
      status: 'open',
      original_amount: Number(form.amount),
      due_date: form.due_date,
      description: form.notes,
      supplier_id: form.supplier_id,
    })

    if (form.recurrence) {
      const startMonth = currDate.getMonth()
      for (let i = 1; i <= 11 - startMonth; i++) {
        let nextD = new Date(currDate)
        nextD.setMonth(currDate.getMonth() + i)
        inserts.push({
          company_id: company?.id,
          type: 'payable',
          status: 'open',
          original_amount: Number(form.amount),
          due_date: nextD.toISOString().split('T')[0],
          description: form.notes + ` (Parcela ${i + 1})`,
          supplier_id: form.supplier_id,
        })
      }
    }

    await supabase.from('financial_titles').insert(inserts)

    toast.success(
      form.recurrence
        ? 'Despesas recorrentes criadas até o fim do ano com sucesso!'
        : 'Título criado com sucesso',
    )
    setSheetOpen(false)
    setSaving(false)
    refetch()
  }

  const today = new Date().toISOString().split('T')[0]
  const filteredTitles = (titles || [])
    .filter((t: any) => {
      if (
        filterParam === 'overdue' &&
        !(['open', 'partial'].includes(t.status) && t.due_date < today)
      )
        return false

      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (startDate && t.due_date < startDate) return false
      if (endDate && t.due_date > endDate) return false

      if (search) {
        const q = search.toLowerCase()
        const supplierName = t.suppliers?.name?.toLowerCase() || ''
        const desc = t.description?.toLowerCase() || ''
        const valueStr = String(t.original_amount)
        if (!supplierName.includes(q) && !desc.includes(q) && !valueStr.includes(q)) return false
      }
      return true
    })
    .sort((a: any, b: any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gestão rigorosa de obrigações com fornecedores.</p>
        </div>
        <Button onClick={openSheet} className="rounded-full shadow-md w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Nova Despesa
        </Button>
      </div>

      <div className="flex flex-col gap-4 bg-muted/20 p-4 rounded-xl border">
        <div className="w-full">
          <Label className="text-xs mb-1 block">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Fornecedor, nota, valor..."
              className="pl-9 bg-background w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <Label className="text-xs mb-1 block">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Label className="text-xs mb-1 block">Data Inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="w-full md:w-48">
            <Label className="text-xs mb-1 block">Data Final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {filterParam === 'overdue' && (
        <div className="flex justify-between items-center bg-amber-500/10 text-amber-700 p-3 rounded-lg border border-amber-500/20 mb-4 shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4" /> Exibindo títulos vencidos.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchParams({})}
            className="bg-transparent border-amber-500/50 text-amber-700"
          >
            Limpar Filtro
          </Button>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Aberto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTitles.map((t: any) => {
                const isCancelled = t.status === 'cancelled'
                return (
                  <TableRow
                    key={t.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isCancelled ? 'opacity-60 bg-muted/10' : ''}`}
                    onClick={() => setDetailTitle(t)}
                  >
                    <TableCell className="font-medium">
                      <div
                        className={`flex items-center gap-2 ${isCancelled ? 'line-through' : ''}`}
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {t.suppliers?.name || 'Fornecedor Removido'}
                      </div>
                      {t.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {t.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>R$ {t.original_amount.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-destructive">
                      R$ {(t.open_amount ?? t.original_amount - t.paid_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {t.status === 'paid' ? (
                        <Badge className="bg-green-500 text-white uppercase border-green-600">
                          {translateStatus(t.status)}
                        </Badge>
                      ) : t.status === 'cancelled' ? (
                        <Badge className="bg-destructive text-white uppercase border-destructive">
                          {translateStatus(t.status)}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white uppercase border-amber-600">
                          {translateStatus(t.status)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {['open', 'partial'].includes(t.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 relative z-10 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPaymentTitle(t)
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredTitles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma conta a pagar encontrada.
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
            <SheetTitle>Nova Despesa / Conta a Pagar</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Fornecedor (Obrigatório)</Label>
              <Select
                value={form.supplier_id || undefined}
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
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento Inicial</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações Adicionais</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 mt-4 p-4 border rounded-xl bg-muted/20">
              <input
                type="checkbox"
                id="rec"
                checked={form.recurrence}
                onChange={(e) => setForm({ ...form, recurrence: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="flex flex-col">
                <Label htmlFor="rec" className="cursor-pointer font-bold">
                  Gerar Lançamentos Recorrentes
                </Label>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Criar automaticamente até dezembro do ano atual.
                </span>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 h-12 shadow-elevation"
            >
              Criar Lançamento
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <TitlePaymentDialog
        open={!!paymentTitle}
        onOpenChange={(o: boolean) => !o && setPaymentTitle(null)}
        title={paymentTitle}
        onComplete={refetch}
      />
      <TitleDetailSheet
        open={!!detailTitle}
        onOpenChange={(o: boolean) => !o && setDetailTitle(null)}
        title={detailTitle}
        onUpdate={() => {
          refetch()
          setDetailTitle(null)
        }}
      />
    </div>
  )
}
