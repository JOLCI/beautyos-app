import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@/hooks/use-query'
import { formatEntityName, getOriginLabel } from '@/lib/financial'
import { translateStatus } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { FileText, TrendingUp, TrendingDown, Wallet, Download, Printer } from 'lucide-react'

export default function RelatoriosPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })

  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    return d.toISOString().split('T')[0]
  })

  const [methodFilter, setMethodFilter] = useState('ALL')

  const { data: transactions } = useQuery<any>('transactions', {
    match: { status: 'confirmed' },
    select: '*, clients(name), suppliers(name)',
  })

  const filteredData = useMemo(() => {
    return transactions
      .filter((t: any) => {
        const d = t.transaction_date
        if (d < startDate || d > endDate) return false
        if (methodFilter !== 'ALL' && t.payment_method !== methodFilter) return false
        return true
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
      )
  }, [transactions, startDate, endDate])

  const totals = useMemo(() => {
    const inflows = filteredData.reduce(
      (acc: number, t: any) => (t.type === 'inflow' ? acc + t.amount : acc),
      0,
    )
    const outflows = filteredData.reduce(
      (acc: number, t: any) => (t.type === 'outflow' ? acc + t.amount : acc),
      0,
    )
    return { inflows, outflows, balance: inflows - outflows }
  }, [filteredData])

  const chartData = useMemo(() => {
    const daily: Record<string, { name: string; Receitas: number; Despesas: number }> = {}
    filteredData.forEach((t: any) => {
      const d = t.transaction_date.slice(5, 10)
      if (!daily[d]) daily[d] = { name: d, Receitas: 0, Despesas: 0 }
      if (t.type === 'inflow') daily[d].Receitas += t.amount
      else if (t.type === 'outflow') daily[d].Despesas += t.amount
    })
    return Object.values(daily).sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredData])

  const exportCSV = () => {
    const headers = ['Data', 'Ticket', 'Entidade', 'Origem', 'Tipo', 'Método', 'Valor']
    const rows = filteredData.map((t: any) => [
      new Date(t.transaction_date).toLocaleDateString(),
      t.ticket_id,
      formatEntityName(t) || '-',
      getOriginLabel(t.origin),
      translateStatus(t.type),
      t.payment_method,
      t.amount.toFixed(2),
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_fluxo_${startDate}_a_${endDate}.csv`)
    link.click()
  }

  const exportPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análise de fluxo de caixa consolidado.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-muted-foreground">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-10 px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="ALL">Todos os Métodos</option>
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Entradas</p>
              <h3 className="text-2xl font-bold text-green-600">R$ {totals.inflows.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-full text-destructive">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Saídas</p>
              <h3 className="text-2xl font-bold text-destructive">
                R$ {totals.outflows.toFixed(2)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Saldo do Período</p>
              <h3 className="text-2xl font-bold">R$ {totals.balance.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Fluxo Diário (Período Selecionado)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sem dados confirmados para o período selecionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R${v}`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend />
                <Bar dataKey="Receitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="p-4 border-b flex justify-between items-center print:hidden">
          <h3 className="font-semibold">Detalhamento das Transações</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Entidade / Origem</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.transaction_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {t.ticket_id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatEntityName(t)}</div>
                    <div className="text-xs text-muted-foreground">{getOriginLabel(t.origin)}</div>
                  </TableCell>
                  <TableCell className="uppercase text-xs">{t.payment_method}</TableCell>
                  <TableCell
                    className={`text-right font-bold ${t.type === 'inflow' ? 'text-green-600' : 'text-destructive'}`}
                  >
                    {t.type === 'outflow' ? '-' : ''} R$ {t.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum registro encontrado neste período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
