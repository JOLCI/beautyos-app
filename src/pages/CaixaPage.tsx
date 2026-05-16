import { useState, useMemo, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Wallet, Loader2, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { FinancialDescription } from '@/components/financeiro/FinancialDescription'
import { TransactionTicketDialog } from '@/components/financeiro/TransactionTicketDialog'
import { translateStatus } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function CaixaPage() {
  const { company } = usePasskey()
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const {
    data: txs,
    loading,
    refetch,
  } = useQuery<any>('transactions', {
    order: { column: 'created_at', ascending: false },
    select: '*, clients(name), suppliers(name)',
  })

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<string>(
    filterParam === 'pending' ? 'pending' : 'all',
  )
  const [selectedTx, setSelectedTx] = useState<any>(null)

  const [entrySheetOpen, setEntrySheetOpen] = useState(false)
  const [entryType, setEntryType] = useState<'inflow' | 'outflow'>('inflow')
  const [entryForm, setEntryForm] = useState({
    amount: '',
    desc: '',
    method: 'PIX',
    date: new Date().toISOString().split('T')[0],
  })

  const [closingModalOpen, setClosingModalOpen] = useState(false)

  useEffect(() => {
    if (!company?.id) return
    const channel = supabase
      .channel('realtime_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `company_id=eq.${company.id}`,
        },
        () => refetch(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [company?.id, refetch])

  const filtered = useMemo(() => {
    return txs.filter((t: any) => {
      const d = t.transaction_date
      if (d !== dateFilter && statusFilter !== 'pending') return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      return true
    })
  }, [txs, dateFilter, statusFilter])

  const handleEntrySave = async () => {
    if (!entryForm.amount || !entryForm.desc) return toast.error('Preencha valor e descrição')

    const titleRes = await supabase
      .from('financial_titles')
      .insert([
        {
          company_id: company?.id,
          type: entryType === 'inflow' ? 'receivable' : 'payable',
          status: 'paid',
          original_amount: Number(entryForm.amount),
          paid_amount: Number(entryForm.amount),
          due_date: entryForm.date,
          description: entryForm.desc,
        },
      ])
      .select()
      .single()

    await supabase.from('transactions').insert([
      {
        company_id: company?.id,
        type: entryType,
        origin: 'manual_entry',
        amount: Number(entryForm.amount),
        status: 'confirmed',
        payment_method: entryForm.method,
        financial_title_id: titleRes.data?.id,
        description: entryForm.desc,
        transaction_date: entryForm.date,
        confirmed_at: new Date().toISOString(),
      },
    ])

    toast.success('Lançamento efetuado com sucesso')
    setEntrySheetOpen(false)
    refetch()
  }

  const saldo = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'confirmed' ? (t.type === 'inflow' ? acc + t.amount : acc - t.amount) : acc,
    0,
  )
  const totalEntradas = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'confirmed' && t.type === 'inflow' ? acc + t.amount : acc,
    0,
  )
  const totalSaidas = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'confirmed' && t.type === 'outflow' ? acc + t.amount : acc,
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixa e Transações</h1>
          <p className="text-muted-foreground">Histórico de fluxo de caixa e conciliações.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50"
            onClick={() => {
              setEntryType('inflow')
              setEntryForm({ ...entryForm, amount: '', desc: '' })
              setEntrySheetOpen(true)
            }}
          >
            + Entrada
          </Button>
          <Button
            variant="outline"
            className="text-destructive border-red-200 bg-red-50"
            onClick={() => {
              setEntryType('outflow')
              setEntryForm({ ...entryForm, amount: '', desc: '' })
              setEntrySheetOpen(true)
            }}
          >
            - Saída
          </Button>
          <Button variant="secondary" onClick={() => setClosingModalOpen(true)}>
            Fechar Caixa Dia
          </Button>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border hidden sm:flex">
            <Filter className="w-4 h-4 text-muted-foreground ml-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium p-1 outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Apenas Confirmados</option>
              <option value="pending">Apenas Pendentes (A Confirmar)</option>
            </select>
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto font-medium"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Wallet className="w-4 h-4" /> Saldo Confirmado do Período
            </div>
            <div className="text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-700 mb-2">Entradas Confirmadas</div>
            <div className="text-3xl font-bold text-green-700">R$ {totalEntradas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive mb-2">Saídas Confirmadas</div>
            <div className="text-3xl font-bold text-destructive">R$ {totalSaidas.toFixed(2)}</div>
          </CardContent>
        </Card>
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
                  <TableHead>Hora/Data</TableHead>
                  <TableHead>Entidade e Origem</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t: any) => (
                  <TableRow
                    key={t.id}
                    className={
                      t.status === 'cancelled'
                        ? 'opacity-50 line-through cursor-pointer hover:bg-muted/50'
                        : 'cursor-pointer hover:bg-muted/50'
                    }
                    onClick={() => setSelectedTx(t)}
                  >
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px]">
                      <FinancialDescription record={t} />
                    </TableCell>
                    <TableCell className="uppercase text-[10px] tracking-wider font-semibold">
                      {t.payment_method}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.type === 'inflow'
                            ? 'text-green-600 border-green-600/30'
                            : 'text-destructive border-destructive/30'
                        }
                      >
                        {translateStatus(t.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {translateStatus(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">R$ {t.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <TransactionTicketDialog
        open={!!selectedTx}
        onOpenChange={(o: boolean) => !o && setSelectedTx(null)}
        transaction={selectedTx}
        onUpdate={() => {
          refetch()
          setSelectedTx(null)
        }}
      />

      <Sheet open={entrySheetOpen} onOpenChange={setEntrySheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {entryType === 'inflow' ? 'Nova Entrada (Receita)' : 'Nova Saída (Despesa)'}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={entryForm.amount}
                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={entryForm.desc}
                onChange={(e) => setEntryForm({ ...entryForm, desc: e.target.value })}
                placeholder="Ex: Pagamento Fornecedor de Água..."
              />
            </div>
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select
                value={entryForm.method}
                onValueChange={(v) => setEntryForm({ ...entryForm, method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="DEBITO">Débito</SelectItem>
                  <SelectItem value="CREDITO">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={entryForm.date}
                onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
              />
            </div>
            <Button className="w-full mt-4" onClick={handleEntrySave}>
              Confirmar Lançamento
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={closingModalOpen} onOpenChange={setClosingModalOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              Resumo de Caixa: {new Date(dateFilter + 'T12:00:00').toLocaleDateString()}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {['PIX', 'DINHEIRO', 'DEBITO', 'CREDITO'].map((m) => {
              const mIn = filtered
                .filter(
                  (t: any) =>
                    t.status === 'confirmed' && t.type === 'inflow' && t.payment_method === m,
                )
                .reduce((a: number, b: any) => a + b.amount, 0)
              const mOut = filtered
                .filter(
                  (t: any) =>
                    t.status === 'confirmed' && t.type === 'outflow' && t.payment_method === m,
                )
                .reduce((a: number, b: any) => a + b.amount, 0)
              if (mIn === 0 && mOut === 0) return null
              return (
                <div key={m} className="p-4 border rounded-xl bg-muted/20 space-y-2">
                  <h4 className="font-bold border-b pb-2">{m}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entradas</span>
                    <span className="text-green-600 font-medium">R$ {mIn.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saídas</span>
                    <span className="text-destructive font-medium">R$ {mOut.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Líquido</span>
                    <span>R$ {(mIn - mOut).toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
