import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Printer, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@/hooks/use-query'

export default function RelatoriosPage() {
  const { data: auditLogs } = useQuery<any>('financial_audit_logs', {
    order: { column: 'created_at', ascending: false },
  })

  const handleExport = (type: string) => {
    if (type === 'audit_logs') {
      const csv = ['Data,Usuário,Ação,Tabela,Valores']
        .concat(
          auditLogs.map(
            (l) =>
              `${l.created_at},${l.user_id},${l.action},${l.table_name},"${JSON.stringify(l.new_values || l.old_values).replace(/"/g, '""')}"`,
          ),
        )
        .join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auditoria_financeira.csv`
      a.click()
      toast.success('Exportação CSV concluída')
      return
    }

    toast.success(`Exportação CSV iniciada: ${type}`)
    const blob = new Blob(['id,date,value\n1,2023-10-10,100'], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${type}.csv`
    a.click()
  }

  const reports = [
    {
      id: 'fluxo_caixa',
      title: 'Fluxo de Caixa',
      desc: 'Entradas e saídas consolidadas.',
      icon: FileText,
    },
    {
      id: 'atendimentos',
      title: 'Atendimentos',
      desc: 'Histórico de tickets finalizados.',
      icon: FileText,
    },
    {
      id: 'pagar_receber',
      title: 'A Pagar / A Receber',
      desc: 'Projeção financeira.',
      icon: FileText,
    },
    { id: 'estoque', title: 'Posição de Estoque', desc: 'Inventário e custo.', icon: FileText },
    {
      id: 'comissoes',
      title: 'Comissões Profissionais',
      desc: 'Valores devidos por período.',
      icon: FileText,
    },
    {
      id: 'audit_logs',
      title: 'Auditoria Financeira',
      desc: 'Logs de alterações em transações.',
      icon: ShieldAlert,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
          <p className="text-muted-foreground">Exporte e imprima dados do sistema.</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="rounded-full shadow-sm">
          <Printer className="w-4 h-4 mr-2" /> Imprimir Página
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <r.icon className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">{r.title}</CardTitle>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full rounded-lg"
                variant="secondary"
                onClick={() => handleExport(r.id)}
              >
                <Download className="w-4 h-4 mr-2" /> Baixar Excel (CSV)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
