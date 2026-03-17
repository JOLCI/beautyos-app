import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DollarSign, TrendingDown, TrendingUp, Calendar, AlertTriangle, Clock } from 'lucide-react'
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
import { mockDashboard, mockAppointments, mockClients } from '@/lib/mock'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const getShift = (time: string) => {
    const h = parseInt(time.split(':')[0])
    if (h < 12) return 'Manhã'
    if (h < 18) return 'Tarde'
    return 'Noite'
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">Visão geral do desempenho e saúde financeira.</p>
        </div>
      </div>

      <Alert
        variant="destructive"
        className="bg-destructive/10 text-destructive border-destructive/20"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cash Flow Alert</AlertTitle>
        <AlertDescription>
          Existem 2 contas a pagar vencidas totalizando R$ 1.200,00.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ 5.432,00</div>
            <p className="text-xs text-muted-foreground">+20% desde ontem</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.850,00</div>
            <p className="text-xs text-muted-foreground">Meta: R$ 2.000,00</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (7 dias)</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 3.200,00</div>
            <p className="text-xs text-muted-foreground">4 contas pendentes</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">41 na semana, 128 no mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Semanal</CardTitle>
            <CardDescription>Faturamento dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDashboard.revenueWeekly}>
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

        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (Mensal)</CardTitle>
            <CardDescription>Entradas x Saídas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDashboard.cashFlow}>
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
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }}
                />
                <Bar dataKey="entrada" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline de Hoje</CardTitle>
          <CardDescription>Próximos atendimentos agendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAppointments.map((app) => {
              const client = mockClients.find((c) => c.id === app.clientId)
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition"
                >
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-md bg-muted text-primary font-bold">
                    <span>{app.startTime}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{client?.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                      <Clock className="w-3 h-3" />
                      {app.startTime} - {app.endTime}
                      <Badge variant="outline" className="ml-2 text-[10px] uppercase">
                        {getShift(app.startTime)}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={app.status === 'confirmado' ? 'bg-green-500' : 'bg-blue-500'}>
                    {app.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
