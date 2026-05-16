import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendingUp, Calendar, AlertTriangle, History, Clock, XCircle } from 'lucide-react'
import {
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
import { useAuth } from '@/hooks/use-auth'
import { translateStatus } from '@/lib/utils'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { passkey } = useParams()
  const { profile } = useAuth()

  const isAdminOrRoot = profile?.role === 'admin' || profile?.role === 'root'
  const today = new Date().toISOString().split('T')[0]

  const { data: transactions } = useQuery<any>('transactions', { select: '*' })
  const { data: titles } = useQuery<any>('financial_titles', { select: '*' })
  const { data: appointments } = useQuery<any>('appointments')
  const { data: clients } = useQuery<any>('clients')

  const stats = useMemo(() => {
    const saldo = transactions.reduce((acc: number, t: any) => {
      if (t.status !== 'confirmed') return acc
      return t.type === 'inflow' ? acc + t.amount : acc - t.amount
    }, 0)

    const saldoPendente = titles.reduce((acc: number, t: any) => {
      if (t.type === 'receivable' && ['open', 'partial'].includes(t.status)) {
        return acc + (t.open_amount !== null ? t.open_amount : t.original_amount - t.paid_amount)
      }
      return acc
    }, 0)

    const entradasHoje = transactions.reduce((acc: number, t: any) => {
      if (t.status === 'confirmed' && t.type === 'inflow' && t.transaction_date === today) {
        return acc + t.amount
      }
      return acc
    }, 0)

    const overdueReceivables = titles.filter(
      (t: any) =>
        t.type === 'receivable' && ['open', 'partial'].includes(t.status) && t.due_date < today,
    )

    const appsHoje = appointments.filter((a: any) => a.date === today && a.status !== 'provisional')
    const totalApps = appsHoje.length
    const cancelledApps = appsHoje.filter((a: any) => a.status === 'cancelado').length

    return {
      saldo,
      saldoPendente,
      entradasHoje,
      overdueReceivables,
      appsHoje,
      totalApps,
      cancelledApps,
    }
  }, [transactions, titles, appointments, today])

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
  }, [transactions])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">Métricas de precisão e auditoria financeira.</p>
      </div>

      <div className="flex flex-col gap-3">
        {stats.overdueReceivables.length > 0 && isAdminOrRoot && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20 cursor-pointer hover:bg-destructive/20 transition-colors"
            onClick={() => navigate(`/${passkey}/financeiro/contas-receber?filter=overdue`)}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Recebimentos Atrasados</AlertTitle>
            <AlertDescription>
              Existem {stats.overdueReceivables.length} contas a receber vencidas (Saldo em aberto).
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`shadow-sm transition-colors ${isAdminOrRoot ? 'cursor-pointer hover:bg-muted/50' : ''}`}
          onClick={() => isAdminOrRoot && navigate(`/${passkey}/financeiro/caixa`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual (Confirmado)</CardTitle>
            <History className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.saldo.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card
          className="shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(`/${passkey}/financeiro/caixa`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje (Confirmada)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.entradasHoje.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card
          className="shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(`/${passkey}/financeiro/contas-receber`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.saldoPendente.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Soma de títulos a receber</p>
          </CardContent>
        </Card>

        <Card
          className="shadow-sm cursor-pointer hover:bg-muted/50 transition-colors bg-destructive/5 border-destructive/20"
          onClick={() => navigate(`/${passkey}/financeiro/contas-pagar`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">A Pagar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R${' '}
              {titles
                ?.reduce(
                  (acc: number, t: any) =>
                    t.type === 'payable' && ['open', 'partial'].includes(t.status)
                      ? acc + (t.open_amount ?? t.original_amount - t.paid_amount)
                      : acc,
                  0,
                )
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-destructive/80">
              Soma de contas a pagar
            </p>
          </CardContent>
        </Card>

        <Card
          className="shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(`/${passkey}/agenda`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agenda de Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{stats.totalApps}</div>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="text-right border-l pl-4 border-border/50">
              <div className="text-xl font-bold text-destructive flex items-center justify-end gap-1">
                <XCircle className="w-3 h-3" /> {stats.cancelledApps}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cancelados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Receita Semanal (Confirmada)</CardTitle>
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
            <CardTitle>Próximos Atendimentos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {stats.appsHoje.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center mt-8">
                Nenhum agendamento hoje.
              </p>
            ) : (
              stats.appsHoje.slice(0, 6).map((app: any) => {
                const cli = clients?.find((c: any) => c.id === app.client_id)
                let colorClass = 'border-primary/20 bg-primary/5'
                let statusClass = 'text-primary border-primary'
                if (app.status === 'finalizado') {
                  colorClass = 'border-green-500/20 bg-green-500/5'
                  statusClass = 'text-green-600 border-green-200 bg-green-50'
                }
                if (app.status === 'cancelado') {
                  colorClass = 'border-destructive/20 bg-destructive/5 opacity-70 line-through'
                  statusClass = 'text-destructive border-destructive/20'
                }

                return (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/${passkey}/agenda?date=${app.date}`)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${colorClass}`}
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-background shadow-sm font-bold text-xs border">
                      {app.start_time.substring(0, 5)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{cli?.name || 'Cliente'}</h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase mt-1 ${statusClass}`}
                      >
                        {translateStatus(app.status)}
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
