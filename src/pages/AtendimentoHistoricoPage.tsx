import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AtendimentoHistoricoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Atendimentos</h1>
        <p className="text-muted-foreground">Listagem de tickets finalizados recentemente.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Nenhum histórico disponível ainda. Utilize o Novo Checkout para registrar um
            atendimento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
