import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 text-center animate-fade-in-up">
        <Badge
          variant="secondary"
          className="px-4 py-1.5 text-sm uppercase tracking-wider rounded-full bg-accent text-accent-foreground shadow-sm"
        >
          Em construção
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground max-w-lg text-lg">
          Nossos engenheiros estão preparando KPIs fantásticos para você acompanhar o crescimento do
          seu negócio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 opacity-50 pointer-events-none grayscale">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.850,00</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
