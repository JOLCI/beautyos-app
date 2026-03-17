import { EmptyState } from '@/components/ui/empty-state'
import { History, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function AtendimentoHistoricoPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">Listagem de tickets finalizados recentemente.</p>
      </div>

      <EmptyState
        icon={History}
        title="Nenhum histórico disponível"
        description="Você ainda não finalizou nenhum atendimento hoje. Utilize o Novo Checkout para registrar."
        action={
          <Button
            onClick={() => navigate('/atendimento/novo')}
            className="rounded-full mt-4 shadow-md"
          >
            <PlayCircle className="w-4 h-4 mr-2" /> Ir para Checkout
          </Button>
        }
      />
    </div>
  )
}
