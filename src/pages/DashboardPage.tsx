import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Clock,
  Package,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@/hooks/use-query'

export default function DashboardPage() {
  const { data: transactions } = useQuery<any>('transactions', { match: { status: 'completed' } })
  const { data: payables } = useQuery<any>('financial_accounts', {
    match: { type: 'payable', status: 'pending' },
  })
  const { data: appointments } = useQuery<any>('appointments')
  const { data: clients } = useQuery<any>('clients')
  const { data: inventory } = useQuery<any>('inventory')
  const { data: products } = useQuery<any>('services', { match: { type: 'product' } })

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const entradasHoje = transactions
      .filter((t: any) => t.type === 'entrada' && t.created_at.startsWith(today))
      .reduce((a: any, b: any) => a + b.amount, 0)
    const saldo = transactions.reduce(
      (a: any, b: any) => (b.type === 'entrada' ? a + b.amount : a - b.amount),
      0,
    )
    const overdue = payables.filter((p: any) => new Date(p.due_date) < new Date())
    const appsHoje = appointments.filter((a: any) => a.date === today)
    const lowStock = inventory.filter((i: any) => i.quantity <= i.min_quantity)
    return { entradasHoje, saldo, overdue, appsHoje, lowStock }
  }, [transactions, payables, appointments, inventory])

  const chartData = useMemo(() => {
    return [
      { name: 'Seg', total: 400 },
      { name: 'Ter', total: 300 },
      { name: 'Qua', total: 550 },
      { name: 'Qui', total: 200 },
      { name: 'Sex', total: 800 },
      { name: 'Sáb', total: 1200 },
      { name: 'Dom', total: 0 },
    ]
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">Indicadores e alertas do seu negócio.</p>
      </div>

      <div className="flex flex-col gap-3">
        {stats.overdue.length > 0 && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Alerta Financeiro</AlertTitle>
            <AlertDescription>
              Existem {stats.overdue.length} contas a pagar vencidas.
            </AlertDescription>
          </Alert>
        )}
        {stats.lowStock.length > 0 && (
          <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Package className="h-4 w-4" />
            <AlertTitle>Alerta de Estoque</AlertTitle>
            <AlertDescription>
              {stats.lowStock.length} produtos estão com estoque baixo ou zerado.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.saldo.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.entradasHoje.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appsHoje.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Receita Semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Agenda de Hoje</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {stats.appsHoje.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center mt-8">
                Nenhum agendamento hoje.
              </p>
            ) : (
              stats.appsHoje.map((app: any) => {
                const cli = clients.find((c: any) => c.id === app.client_id)
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-background shadow-sm text-primary font-bold text-xs border">
                      {app.start_time.substring(0, 5)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{cli?.name || 'Cliente'}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase mt-1">
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
