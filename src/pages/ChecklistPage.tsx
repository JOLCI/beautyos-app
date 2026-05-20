import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Loader2 } from 'lucide-react'

export default function ChecklistPage() {
  const { company } = usePasskey()

  const { data: responses, loading } = useQuery<any>('checklist_responses', {
    order: { column: 'respondido_em', ascending: false },
  })
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: checklists } = useQuery<any>('checklists', { match: { company_id: company?.id } })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Anamnese</h1>
          <p className="text-muted-foreground">
            Visualize as respostas de checklists dos clientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Respostas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : responses?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma resposta encontrada.</p>
          ) : (
            <div className="space-y-4">
              {responses?.map((r: any) => {
                const client = clients?.find((c: any) => c.id === r.cliente_id)
                const checklist = checklists?.find((c: any) => c.id === r.checklist_id)

                return (
                  <div
                    key={r.id}
                    className="p-4 border rounded-xl bg-card shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold">
                        {client?.nome_preferido || client?.name || 'Cliente Desconhecido'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {checklist?.nome || 'Checklist Desconhecido'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {new Date(r.respondido_em).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(r.respondido_em).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
