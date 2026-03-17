import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'

export default function RelatoriosPage() {
  const handleExport = (type: string) => {
    toast.success(`Exportação CSV iniciada: ${type}`)
    // Fake CSV generation
    const blob = new Blob(['id,date,value\n1,2023-10-10,100'], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${type}.csv`
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  const reports = [
    { id: 'fluxo_caixa', title: 'Fluxo de Caixa', desc: 'Entradas e saídas consolidadas.' },
    { id: 'atendimentos', title: 'Atendimentos', desc: 'Histórico de tickets finalizados.' },
    { id: 'pagar_receber', title: 'A Pagar / A Receber', desc: 'Projeção financeira.' },
    { id: 'estoque', title: 'Posição de Estoque', desc: 'Inventário e custo.' },
    { id: 'comissoes', title: 'Comissões Profissionais', desc: 'Valores devidos por período.' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
          <p className="text-muted-foreground">Exporte e imprima dados do sistema.</p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir Página
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <FileText className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">{r.title}</CardTitle>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" onClick={() => handleExport(r.id)}>
                <Download className="w-4 h-4 mr-2" /> Baixar Excel (CSV)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
