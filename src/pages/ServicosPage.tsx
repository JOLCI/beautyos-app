import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ServicosPage() {
  const {
    data: services,
    loading,
    refetch,
  } = useQuery<any>('services', { match: { is_active: true } })

  const createService = async () => {
    const name = prompt('Nome do Serviço/Produto:')
    if (!name) return
    const price = prompt('Preço (R$):') || '0'
    const type = confirm('É um produto? (OK=Sim, Cancelar=Não)') ? 'product' : 'service'
    const { error } = await supabase
      .from('services')
      .insert([
        {
          name,
          price: Number(price),
          type,
          code: `SRV-${Date.now().toString().slice(-4)}`,
          company_id: services[0]?.company_id,
        },
      ])
    if (!error) {
      toast.success('Adicionado')
      refetch()
    }
  }

  const removeService = async (id: string) => {
    if (!confirm('Deseja realmente remover?')) return
    await supabase.from('services').update({ is_active: false }).eq('id', id)
    toast.success('Removido')
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços & Produtos</h1>
          <p className="text-muted-foreground">Catálogo para agendamentos e vendas.</p>
        </div>
        <Button onClick={createService} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.code}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {s.type === 'product' ? 'Produto' : 'Serviço'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      R$ {s.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(s.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
