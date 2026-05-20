import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Hammer } from 'lucide-react'

export default function ConfiguracoesChecklistsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Checklists</h1>
        <p className="text-muted-foreground">Gerencie os modelos e perguntas de checklists.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modelos de Checklist</CardTitle>
          <CardDescription>Configure os checklists para serviços e anamneses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5 gap-4">
            <div className="p-4 bg-background rounded-full shadow-sm">
              <Hammer className="w-8 h-8 text-primary/60" />
            </div>
            <p className="font-medium text-lg">Página em Construção</p>
            <p className="text-sm text-center max-w-sm">
              A interface de gerenciamento de checklists está sendo desenvolvida e estará disponível
              em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
