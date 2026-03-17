import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, FileText, Printer, ShieldAlert, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@/hooks/use-query'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function RelatoriosPage() {
  const { company } = usePasskey()
  const { data: auditLogs } = useQuery<any>('financial_audit_logs', {
    order: { column: 'created_at', ascending: false },
  })
  const { data: commissions, refetch: refetchComm } = useQuery<any>('commissions')
  const { data: profiles } = useQuery<any>('profiles')
  const { data: transactions } = useQuery<any>('transactions')

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data.length) return toast.warning('Nenhum dado para exportar')
    const keys = Object.keys(data[0])
    const csv = [keys.join(',')]
      .concat(
        data.map((row) => keys.map((k) => `"${String(row[k]).replace(/"/g, '""')}"`).join(',')),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    toast.success('Exportação concluída')
  }

  const payCommissions = async () => {
    const pending = commissions.filter((c: any) => c.status === 'pending')
    if (pending.length === 0) return toast.info('Nenhuma comissão pendente')
    const total = pending.reduce((a: any, b: any) => a + b.amount, 0)

    await supabase.from('transactions').insert([
      {
        company_id: company?.id,
        type: 'saida',
        amount: total,
        description: 'Pagamento de Comissões em Lote',
        status: 'completed',
      },
    ])

    for (const c of pending) {
      await supabase.from('commissions').update({ status: 'paid' }).eq('id', c.id)
    }
    toast.success('Comissões pagas e baixadas no caixa')
    refetchComm()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Relatórios</h1>
          <p className="text-muted-foreground">Análises financeiras e exportações.</p>
        </div>
      </div>

      <Tabs defaultValue="fluxo" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 w-full md:w-56 justify-start overflow-x-auto border-r-0 md:border-r pr-2">
          <TabsTrigger value="fluxo" className="w-full justify-start gap-3 px-4 py-3">
            <FileText className="w-4 h-4" /> Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="w-full justify-start gap-3 px-4 py-3">
            <Coins className="w-4 h-4" /> Comissões
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="w-full justify-start gap-3 px-4 py-3">
            <ShieldAlert className="w-4 h-4" /> Auditoria
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="fluxo" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fluxo de Caixa (Transações)</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(transactions, 'fluxo_caixa')}
                >
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 50).map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                        <TableCell
                          className={t.type === 'entrada' ? 'text-green-600' : 'text-destructive'}
                        >
                          {t.type}
                        </TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {t.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comissoes" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Comissões Devidas</CardTitle>
                  <CardDescription>Valores a repassar para os profissionais.</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(commissions, 'comissoes')}
                  >
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button size="sm" onClick={payCommissions}>
                    Pagar Pendentes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((c: any) => {
                      const p = profiles.find((pr: any) => pr.id === c.professional_id)
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{p?.name}</TableCell>
                          <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{c.status === 'paid' ? 'Pago' : 'Pendente'}</TableCell>
                          <TableCell className="text-right">R$ {c.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Logs de Auditoria Financeira</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(auditLogs, 'auditoria')}
                >
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 50).map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs">
                          {new Date(a.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{a.table_name}</TableCell>
                        <TableCell>{a.action}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                          {JSON.stringify(a.new_values || a.old_values)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
