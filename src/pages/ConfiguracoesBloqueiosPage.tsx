import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function ConfiguracoesBloqueiosPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bloqueios de Agenda</h1>
        <p className="text-muted-foreground">Gerencie os bloqueios e indisponibilidades.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bloqueios</CardTitle>
          <CardDescription>Configure bloqueios para profissionais.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5 gap-4">
            <div className="p-4 bg-background rounded-full shadow-sm">
              <Calendar className="w-8 h-8 text-primary/60" />
            </div>
            <p className="font-medium text-lg">Página em Construção</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
