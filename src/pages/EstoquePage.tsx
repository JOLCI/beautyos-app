import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PackagePlus, PackageMinus, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function EstoquePage() {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const { data: inventory, refetch: refetchInv } = useQuery<any>('inventory')
  const { data: movements, refetch: refetchMov } = useQuery<any>('inventory_movements', {
    order: { column: 'created_at', ascending: false },
  })
  const { data: products } = useQuery<any>('services', {
    match: { type: 'product', is_active: true },
  })

  const adjustStock = async (invId: string, type: 'in' | 'out', currentQty: number) => {
    const qty = parseInt(
      prompt(`Quantidade para dar ${type === 'in' ? 'entrada' : 'baixa'}:`) || '0',
    )
    if (!qty || qty <= 0) return
    const reason = prompt('Motivo:')

    const newQty = type === 'in' ? currentQty + qty : currentQty - qty
    await supabase.from('inventory').update({ quantity: newQty }).eq('id', invId)
    await supabase
      .from('inventory_movements')
      .insert([
        {
          company_id: company?.id,
          inventory_id: invId,
          type,
          quantity: qty,
          reason,
          user_id: profile?.id,
        },
      ])

    toast.success('Estoque atualizado')
    refetchInv()
    refetchMov()
  }

  const createInitialStock = async (productId: string) => {
    await supabase
      .from('inventory')
      .insert([{ company_id: company?.id, service_id: productId, quantity: 0 }])
    refetchInv()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
        <p className="text-muted-foreground">Controle de inventário de produtos.</p>
      </div>

      <Tabs defaultValue="posicao">
        <TabsList>
          <TabsTrigger value="posicao">Posição de Estoque</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>
        <TabsContent value="posicao" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const inv = inventory.find((i) => i.service_id === p.id)
                    if (!inv)
                      return (
                        <TableRow key={p.id}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell colSpan={2} className="text-muted-foreground text-sm">
                            Não inicializado
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => createInitialStock(p.id)}
                            >
                              Iniciar Estoque
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    const isLow = inv.quantity <= inv.min_quantity
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-bold text-lg">{inv.quantity}</TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Baixo
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500">Normal</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => adjustStock(inv.id, 'in', inv.quantity)}
                          >
                            <PackagePlus className="w-4 h-4 mr-1" /> Entrada
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => adjustStock(inv.id, 'out', inv.quantity)}
                          >
                            <PackageMinus className="w-4 h-4 mr-1" /> Baixa
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="movimentacoes" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m) => {
                    const inv = inventory.find((i) => i.id === m.inventory_id)
                    const prod = products.find((p) => p.id === inv?.service_id)
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs">
                          {new Date(m.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{prod?.name || 'Desconhecido'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={m.type === 'in' ? 'text-green-600' : 'text-destructive'}
                          >
                            {m.type === 'in' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{m.quantity}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{m.reason}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
