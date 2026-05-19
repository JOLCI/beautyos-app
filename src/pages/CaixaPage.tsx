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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Wallet,
  Loader2,
  Filter,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/hooks/use-auth'
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
  const { profile } = useAuth()
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

  const { data: suppliers } = useQuery<any>('suppliers', { match: { is_active: true } })
  const { data: profiles } = useQuery<any>('profiles')

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
    supplier_id: 'none',
    profile_id: 'none',
  })

  const [closingModalOpen, setClosingModalOpen] = useState(false)
  const [closureForm, setClosureForm] = useState<Record<string, string>>({})

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

  // Filtra as transações baseando-se na data informada e no status selecionado
  const filtered = useMemo(() => {
    return txs.filter((t: any) => {
      const d = t.transaction_date
      if (d !== dateFilter && statusFilter !== 'pending') return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      return true
    })
  }, [txs, dateFilter, statusFilter])

  // Função responsável por salvar um lançamento manual de entrada ou saída
  const handleEntrySave = async () => {
    if (!entryForm.amount || !entryForm.desc) return toast.error('Preencha valor e descrição')

    let destDesc = entryForm.desc
    if (entryType === 'outflow' && entryForm.profile_id !== 'none') {
      const p = profiles?.find((x: any) => x.id === entryForm.profile_id)
      if (p) destDesc += ` (Colaborador: ${p.name})`
    }

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
          description: destDesc,
          supplier_id: entryForm.supplier_id !== 'none' ? entryForm.supplier_id : null,
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
        supplier_id: entryForm.supplier_id !== 'none' ? entryForm.supplier_id : null,
        description: destDesc,
        transaction_date: entryForm.date,
        confirmed_at: new Date().toISOString(),
      },
    ])

    toast.success('Lançamento efetuado com reflexo no fluxo de caixa!')
    setEntrySheetOpen(false)
    refetch()
  }

  // Função para executar o fechamento do caixa diário realizando auditoria
  const handleCloseRegister = async () => {
    const methods = ['PIX', 'DINHEIRO', 'DEBITO', 'CREDITO']
    const details = methods
      .map((m) => {
        const expected =
          filtered
            .filter(
              (t: any) => t.status === 'confirmed' && t.type === 'inflow' && t.payment_method === m,
            )
            .reduce((a: number, b: any) => a + b.amount, 0) -
          filtered
            .filter(
              (t: any) =>
                t.status === 'confirmed' && t.type === 'outflow' && t.payment_method === m,
            )
            .reduce((a: number, b: any) => a + b.amount, 0)
        const verified = Number(closureForm[m] || 0)
        return { method: m, expected, verified, diff: verified - expected }
      })
      .filter((d) => d.expected !== 0 || d.verified !== 0)

    const hasDiff = details.some((d) => Math.abs(d.diff) > 0.01)
    if (hasDiff) {
      if (
        !confirm(
          'Existem divergências entre o valor registrado e o conferido. Deseja auditar e fechar o caixa mesmo assim?',
        )
      )
        return
    }

    await supabase.from('cash_closures').insert({
      company_id: company?.id,
      closure_date: dateFilter,
      closed_by: profile?.id,
      details,
      notes: hasDiff ? 'Fechamento com divergência detectada.' : 'Fechamento sem divergências.',
    })

    toast.success('Caixa fechado e conferência registrada com sucesso!')
    setClosingModalOpen(false)
  }

  // Função para excluir um lançamento financeiro manual, caso não existam conflitos
  const handleDeleteTx = async (tx: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      !confirm(
        'Deseja realmente excluir este lançamento manual? (Também excluirá o título financeiro correspondente)',
      )
    )
      return

    if (tx.financial_title_id) {
      await supabase.from('financial_titles').delete().eq('id', tx.financial_title_id)
    }
    await supabase.from('transactions').delete().eq('id', tx.id)
    toast.success('Lançamento excluído com sucesso')
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
          <h1 className="text-3xl font-bold tracking-tight">Caixa e Transações (PDV)</h1>
          <p className="text-muted-foreground">
            Controle de entradas, saídas e conferência diária.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50 shadow-sm"
            onClick={() => {
              setEntryType('inflow')
              setEntryForm({
                ...entryForm,
                amount: '',
                desc: '',
                supplier_id: 'none',
                profile_id: 'none',
              })
              setEntrySheetOpen(true)
            }}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" /> Entrada
          </Button>
          <Button
            variant="outline"
            className="text-destructive border-red-200 bg-red-50 shadow-sm"
            onClick={() => {
              setEntryType('outflow')
              setEntryForm({
                ...entryForm,
                amount: '',
                desc: '',
                supplier_id: 'none',
                profile_id: 'none',
              })
              setEntrySheetOpen(true)
            }}
          >
            <ArrowDownRight className="w-4 h-4 mr-1" /> Saída
          </Button>
          <Button
            variant="secondary"
            className="shadow-sm font-semibold"
            onClick={() => {
              setClosureForm({})
              setClosingModalOpen(true)
            }}
          >
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
              <option value="confirmed">Confirmados</option>
              <option value="pending">A Confirmar (Pendentes)</option>
            </select>
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-2 font-semibold">
              <Wallet className="w-4 h-4" /> Saldo Confirmado (Dia)
            </div>
            <div className="text-3xl font-bold tracking-tight">R$ {saldo.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-700 mb-2 font-semibold">
              Entradas Confirmadas
            </div>
            <div className="text-3xl font-bold text-green-700 tracking-tight">
              R$ {totalEntradas.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive mb-2 font-semibold">
              Saídas Confirmadas
            </div>
            <div className="text-3xl font-bold text-destructive tracking-tight">
              R$ {totalSaidas.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora/Data</TableHead>
                  <TableHead>Entidade e Descrição</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor / Ações</TableHead>
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
                      {new Date(t.created_at).toLocaleString('pt-BR')}
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
                        className="text-[10px] uppercase"
                      >
                        {translateStatus(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold flex items-center justify-end gap-3 h-full pt-3">
                      <span>R$ {t.amount.toFixed(2)}</span>
                      {t.origin === 'manual_entry' && t.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteTx(t, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum movimento registrado nesta data com os filtros atuais.
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
              {entryType === 'inflow' ? 'Nova Entrada Manual' : 'Nova Saída (Despesa)'}
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
              <Label>Descrição / Referência</Label>
              <Input
                value={entryForm.desc}
                onChange={(e) => setEntryForm({ ...entryForm, desc: e.target.value })}
                placeholder="Ex: Pagamento Extra..."
              />
            </div>
            {entryType === 'outflow' && (
              <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
                <div className="space-y-2">
                  <Label>Pessoa Destino (Fornecedor)</Label>
                  <Select
                    value={entryForm.supplier_id}
                    onValueChange={(v) => {
                      // Se selecionar fornecedor, removemos o vínculo com colaborador
                      setEntryForm({ ...entryForm, supplier_id: v, profile_id: 'none' })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Nenhum --</SelectItem>
                      {suppliers?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pessoa Destino (Colaborador / Atendente)</Label>
                  <Select
                    value={entryForm.profile_id}
                    onValueChange={(v) => {
                      // Se selecionar colaborador, removemos o vínculo com fornecedor
                      setEntryForm({ ...entryForm, profile_id: v, supplier_id: 'none' })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Nenhum --</SelectItem>
                      {profiles
                        ?.filter((p: any) => p.is_attendant)
                        .map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5 border">
                                <AvatarImage src={p.avatar_url} />
                                <AvatarFallback className="text-[10px]">
                                  {p.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {p.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
              <Label>Data de Competência</Label>
              <Input
                type="date"
                value={entryForm.date}
                onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
              />
            </div>
            <Button className="w-full mt-4 h-12" onClick={handleEntrySave}>
              Confirmar Lançamento no Fluxo
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={closingModalOpen} onOpenChange={setClosingModalOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Fechamento de Caixa</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border">
              <Label className="font-semibold">Data de Conferência</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto shadow-sm"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Conferência obrigatória por método de pagamento. Digite o valor real em gaveta/conta
              para auditar a data de{' '}
              {new Date(dateFilter + 'T12:00:00').toLocaleDateString('pt-BR')}.
            </p>

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
              const net = mIn - mOut

              if (mIn === 0 && mOut === 0) return null

              const verifiedVal = closureForm[m] ? Number(closureForm[m]) : 0
              const diff = verifiedVal - net

              return (
                <div
                  key={m}
                  className={`p-4 border rounded-xl space-y-3 ${Math.abs(diff) > 0.01 && verifiedVal > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20'}`}
                >
                  <h4 className="font-bold border-b pb-2 flex items-center justify-between">
                    {m}
                    {Math.abs(diff) > 0.01 && verifiedVal > 0 && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sistema (Registrado)</span>
                    <span className="font-medium">R$ {net.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="font-semibold">Valor Conferido (Real)</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-28 text-right font-mono"
                      placeholder="0.00"
                      value={closureForm[m] || ''}
                      onChange={(e) => setClosureForm({ ...closureForm, [m]: e.target.value })}
                    />
                  </div>
                  {verifiedVal > 0 && Math.abs(diff) > 0.01 && (
                    <div
                      className={`flex justify-between text-xs font-bold pt-1 ${diff > 0 ? 'text-green-600' : 'text-destructive'}`}
                    >
                      <span>Diferença detectada:</span>
                      <span>
                        {diff > 0 ? '+' : ''} R$ {diff.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
            <Button className="w-full h-12 mt-4 shadow-elevation" onClick={handleCloseRegister}>
              Salvar Auditoria de Fechamento
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
