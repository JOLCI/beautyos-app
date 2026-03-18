import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQuery } from '@/hooks/use-query'
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
import { FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

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

  // Usando a nova tabela transactions (apenas confirmados)
  const { data: transactions } = useQuery<any>('transactions', {
    match: { status: 'confirmed' },
  })

  const filteredData = useMemo(() => {
    return transactions.filter((t: any) => {
      const d = t.transaction_date
      return d >= startDate && d <= endDate
    })
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
      const d = t.transaction_date.slice(5, 10) // MM-DD
      if (!daily[d]) daily[d] = { name: d, Receitas: 0, Despesas: 0 }
      if (t.type === 'inflow') daily[d].Receitas += t.amount
      else if (t.type === 'outflow') daily[d].Despesas += t.amount
    })
    return Object.values(daily).sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredData])

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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

      <Card>
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
                  tickFormatter={(v) => `R$${v}`}
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
    </div>
  )
}
