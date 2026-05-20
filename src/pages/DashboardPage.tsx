import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendingUp, Calendar, AlertTriangle, History, Clock, XCircle, User } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
      if (t.status !== 'confirmed' || t.tipo_transacao === 'transferencia_interna') return acc
      return t.type === 'inflow' ? acc + t.amount : acc - t.amount
    }, 0)

    const saldoPendente = titles.reduce((acc: number, t: any) => {
      if (t.type === 'receivable' && ['open', 'partial'].includes(t.status)) {
        return acc + (t.open_amount !== null ? t.open_amount : t.original_amount - t.paid_amount)
      }
      return acc
    }, 0)

    const contasAPagarVencidas = titles
      .filter(
        (t: any) =>
          t.type === 'payable' && ['open', 'partial'].includes(t.status) && t.due_date < today,
      )
      .reduce(
        (acc: number, t: any) => acc + (t.open_amount ?? t.original_amount - t.paid_amount),
        0,
      )

    const contasAPagarAVencer = titles
      .filter(
        (t: any) =>
          t.type === 'payable' && ['open', 'partial'].includes(t.status) && t.due_date >= today,
      )
      .reduce(
        (acc: number, t: any) => acc + (t.open_amount ?? t.original_amount - t.paid_amount),
        0,
      )

    const entradasHoje = transactions.reduce((acc: number, t: any) => {
      if (
        t.status === 'confirmed' &&
        t.type === 'inflow' &&
        t.transaction_date === today &&
        t.tipo_transacao !== 'transferencia_interna'
      ) {
        return acc + t.amount
      }
      return acc
    }, 0)

    const despesasHoje = transactions.reduce((acc: number, t: any) => {
      if (
        t.status === 'confirmed' &&
        t.type === 'outflow' &&
        t.transaction_date === today &&
        t.tipo_transacao !== 'transferencia_interna'
      ) {
        return acc + t.amount
      }
      return acc
    }, 0)

    const overdueReceivables = titles.filter(
      (t: any) =>
        t.type === 'receivable' && ['open', 'partial'].includes(t.status) && t.due_date < today,
    )

    const appsHoje = appointments.filter(
      (a: any) =>
        a.date === today && ['agendado', 'confirmado', 'em_atendimento'].includes(a.status),
    )
    const totalApps = appsHoje.length
    const cancelledApps = appsHoje.filter((a: any) => a.status === 'cancelado').length

    return {
      saldo,
      saldoPendente,
      contasAPagarVencidas,
      contasAPagarAVencer,
      entradasHoje,
      despesasHoje,
      overdueReceivables,
      appsHoje,
      totalApps,
      cancelledApps,
    }
  }, [transactions, titles, appointments, today])

  // Calcula os dados do gráfico de receita da semana atual baseando-se nas transações reais
  const chartData = useMemo(() => {
    const data = [
      { name: 'Seg', total: 0 },
      { name: 'Ter', total: 0 },
      { name: 'Qua', total: 0 },
      { name: 'Qui', total: 0 },
      { name: 'Sex', total: 0 },
      { name: 'Sáb', total: 0 },
      { name: 'Dom', total: 0 },
    ]
    if (!transactions) return data

    const hoje = new Date()
    const diaSemana = hoje.getDay() // 0 é Domingo, 1 é Segunda...

    // Encontrar o início da semana (Segunda-feira)
    const inicioSemana = new Date(hoje)
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana
    inicioSemana.setDate(hoje.getDate() + diff)
    inicioSemana.setHours(0, 0, 0, 0)

    transactions.forEach((t: any) => {
      if (
        t.status === 'confirmed' &&
        t.type === 'inflow' &&
        t.transaction_date &&
        t.tipo_transacao !== 'transferencia_interna'
      ) {
        const txData = new Date(t.transaction_date + 'T12:00:00')
        // Verifica se a transação está na semana atual
        if (txData >= inicioSemana) {
          const idxDia = txData.getDay() // 0 = Dom, 1 = Seg ...
          const idxArray = idxDia === 0 ? 6 : idxDia - 1 // Mapeia Seg=0 até Dom=6
          data[idxArray].total += t.amount
        }
      }
    })

    return data
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
            className="bg-destructive/10 text-destructive border-destructive/20 cursor-pointer hover:bg-destructive/20 transition-colors shadow-sm"
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
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.entradasHoje.toFixed(2)}</div>
          </CardContent>
        </Card>

        {stats.despesasHoje > 0 && (
          <Card
            className="shadow-sm cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-orange-500"
            onClick={() => navigate(`/${passkey}/financeiro/caixa`)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Despesas Hoje</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {stats.despesasHoje.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )}

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
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
              Títulos a receber
            </p>
          </CardContent>
        </Card>

        <Card
          className="shadow-sm cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-destructive"
          onClick={() => navigate(`/${passkey}/financeiro/contas-pagar`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex justify-between items-center text-sm mb-1 border-b pb-1">
                <span className="text-muted-foreground">Vencidas</span>
                <span className="font-bold text-destructive">
                  R$ {stats.contasAPagarVencidas.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">A Vencer</span>
                <span className="font-bold text-primary">
                  R$ {stats.contasAPagarAVencer.toFixed(2)}
                </span>
              </div>
            </div>
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
        <Card className="md:col-span-2 shadow-sm">
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

        <Card className="md:col-span-1 overflow-hidden flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Próximos Atendimentos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {stats.appsHoje.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center mt-8">
                Nenhum agendamento hoje.
              </p>
            ) : (
              stats.appsHoje.slice(0, 6).map((app: any) => {
                const cli = clients?.find((c: any) => c.id === app.client_id)
                let colorClass = 'border-primary/20 bg-primary/5'
                let statusClass = 'text-primary border-primary'
                if (['finalizado', 'completed', 'paid'].includes(app.status?.toLowerCase())) {
                  colorClass = 'border-green-500/30 bg-green-500/10'
                  statusClass = 'text-green-700 border-green-300 bg-green-100'
                } else if (
                  ['cancelado', 'cancelled', 'failed'].includes(app.status?.toLowerCase())
                ) {
                  colorClass = 'border-destructive/20 bg-destructive/5 opacity-70 line-through'
                  statusClass = 'text-destructive border-destructive/20 bg-destructive/10'
                } else {
                  colorClass = 'border-amber-500/30 bg-amber-500/10'
                  statusClass = 'text-amber-700 border-amber-300 bg-amber-100'
                }

                return (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/${passkey}/agenda?date=${app.date}`)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:brightness-95 transition-all ${colorClass}`}
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-background shadow-sm font-bold text-xs border border-border/50">
                      {app.start_time.substring(0, 5)}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Avatar className="w-8 h-8 border shadow-sm">
                        <AvatarImage
                          src={
                            cli?.avatar_url ||
                            `https://img.usecurling.com/ppl/thumbnail?seed=${cli?.id || 'a'}`
                          }
                        />
                        <AvatarFallback>
                          <User className="w-4 h-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {cli?.nome_preferido || cli?.name || 'Cliente'}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase mt-1 ${statusClass}`}
                        >
                          {translateStatus(app.status)}
                        </Badge>
                      </div>
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
