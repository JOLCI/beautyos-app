import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  Printer,
  ShieldAlert,
  Coins,
  CalendarDays,
  Receipt,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@/hooks/use-query'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/hooks/use-auth'
import { FinancialDescription } from '@/components/financeiro/FinancialDescription'
import { TransactionTicketDialog } from '@/components/financeiro/TransactionTicketDialog'
import { formatFinancialDescription } from '@/lib/financial'

export default function RelatoriosPage() {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const [dateStart, setDateStart] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0])
  const [ticketTx, setTicketTx] = useState<any>(null)

  const { data: auditLogs } = useQuery<any>('financial_audit_logs', {
    order: { column: 'created_at', ascending: false },
  })
  const { data: commissions, refetch: refetchComm } = useQuery<any>('commissions')
  const { data: profiles } = useQuery<any>('profiles')
  const { data: transactions } = useQuery<any>('transactions', {
    order: { column: 'created_at', ascending: false },
    select: '*, clients(name)',
  })

  const filteredTx = useMemo(
    () =>
      transactions.filter((t: any) => {
        const d = t.settled_at ? t.settled_at.split('T')[0] : t.created_at.split('T')[0]
        return d >= dateStart && d <= dateEnd
      }),
    [transactions, dateStart, dateEnd],
  )

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data.length) return toast.warning('Nenhum dado para exportar')
    const keys = Object.keys(data[0])
    const csv = [keys.join(',')]
      .concat(
        data.map((row) =>
          keys.map((k) => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','),
        ),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = window.URL.createObjectURL(blob)
    a.download = `${filename}.csv`
    a.click()
    toast.success('Exportação concluída')
  }

  const handlePrint = () => {
    window.print()
  }

  const payCommissions = async () => {
    const pending = commissions.filter((c: any) => c.status === 'pending')
    if (pending.length === 0) return toast.info('Nenhuma comissão pendente')
    const total = pending.reduce((a: any, b: any) => a + b.amount, 0)

    const desc = formatFinancialDescription('OUTROS', 'Pagamento de Comissões em Lote', false)

    await supabase.from('transactions').insert([
      {
        company_id: company?.id,
        type: 'saida',
        amount: total,
        description: desc,
        status: 'completed',
        payment_method: 'OUTROS',
        settled_at: new Date().toISOString(),
      },
    ])
    for (const c of pending)
      await supabase.from('commissions').update({ status: 'paid' }).eq('id', c.id)
    toast.success('Comissões pagas e baixadas no caixa')
    refetchComm()
  }

  const isAdminOrRoot = profile?.role === 'admin' || profile?.role === 'root'
  const totalIn = filteredTx.reduce(
    (acc: number, t: any) => (t.type === 'entrada' ? acc + t.amount : acc),
    0,
  )
  const totalOut = filteredTx.reduce(
    (acc: number, t: any) => (t.type === 'saida' ? acc + t.amount : acc),
    0,
  )
  const bal = totalIn - totalOut

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 printable-hide">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Relatórios</h1>
          <p className="text-muted-foreground">Análises financeiras e exportações.</p>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl border">
          <CalendarDays className="w-4 h-4 text-muted-foreground ml-2" />
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="h-8 w-auto border-none bg-transparent"
          />
          <span className="text-muted-foreground">até</span>
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="h-8 w-auto border-none bg-transparent"
          />
        </div>
      </div>

      {isAdminOrRoot && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 printable-hide">
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="text-sm text-green-700 mb-1 font-medium">Entradas Totais</div>
              <div className="text-2xl font-bold text-green-700">R$ {totalIn.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="text-sm text-destructive mb-1 font-medium">Saídas Totais</div>
              <div className="text-2xl font-bold text-destructive">R$ {totalOut.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="text-sm text-primary mb-1 font-medium">Saldo do Período</div>
              <div className="text-2xl font-bold text-primary">R$ {bal.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="fluxo" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 w-full md:w-56 justify-start overflow-x-auto border-r-0 md:border-r pr-2 printable-hide">
          <TabsTrigger value="fluxo" className="w-full justify-start gap-3 px-4 py-3">
            <FileText className="w-4 h-4" /> Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="w-full justify-start gap-3 px-4 py-3">
            <Coins className="w-4 h-4" /> Comissões
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="w-full justify-start gap-3 px-4 py-3">
            <ShieldAlert className="w-4 h-4" /> Auditoria
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0 printable-content">
          <TabsContent value="fluxo" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between printable-hide">
                <CardTitle>Fluxo de Caixa (Transações)</CardTitle>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(filteredTx, 'fluxo_caixa')}
                  >
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" /> PDF / Imprimir
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right w-16 printable-hide">Ticket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTx.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          {t.settled_at
                            ? new Date(t.settled_at).toLocaleDateString()
                            : new Date(t.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              t.type === 'entrada'
                                ? 'text-green-600 border-green-600/30'
                                : 'text-destructive border-destructive/30'
                            }
                          >
                            {t.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <FinancialDescription record={t} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right printable-hide">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => setTicketTx(t)}
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTx.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Nenhum registro no período.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comissoes" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between printable-hide">
                <div>
                  <CardTitle>Comissões Devidas</CardTitle>
                  <CardDescription>Valores a repassar para os profissionais.</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(commissions, 'comissoes')}
                  >
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button size="sm" onClick={payCommissions}>
                    Pagar Pendentes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((c: any) => {
                      const p = profiles.find((pr: any) => pr.id === c.professional_id)
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{p?.name}</TableCell>
                          <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {c.status === 'paid' ? (
                              <Badge className="bg-green-500">Pago</Badge>
                            ) : (
                              <Badge variant="outline">Pendente</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">R$ {c.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between printable-hide">
                <CardTitle>Logs de Auditoria Financeira</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(auditLogs, 'auditoria')}
                >
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data / Hora</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Histórico de Alterações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 50).map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(a.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-[10px]">{a.table_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {a.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-sm">
                          {a.action === 'UPDATE' && a.old_values && a.new_values ? (
                            <div className="flex flex-col gap-1 overflow-x-auto pb-2">
                              <div className="text-destructive opacity-80 break-all">
                                <span className="font-bold">De:</span>{' '}
                                {JSON.stringify(a.old_values)}
                              </div>
                              <div className="text-green-700 break-all">
                                <span className="font-bold">Para:</span>{' '}
                                {JSON.stringify(a.new_values)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground break-all">
                              {JSON.stringify(a.new_values || a.old_values)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <TransactionTicketDialog
        transaction={ticketTx}
        open={!!ticketTx}
        onOpenChange={(o: boolean) => !o && setTicketTx(null)}
      />
    </div>
  )
}
