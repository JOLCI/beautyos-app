import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
        <p className="text-muted-foreground">Gerenciamento de fichas de anamnese e inspeção.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A funcionalidade completa de checklists será disponibilizada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
