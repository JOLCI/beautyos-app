import { mockServices } from '@/lib/mock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus } from 'lucide-react'

export default function ServicosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">Catálogo de serviços e pacotes.</p>
        </div>
        <Button className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServices.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      {s.isComposite && (
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          Composto
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.duration} min</TableCell>
                  <TableCell className="font-semibold text-primary">
                    R$ {s.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.costPrice ? `R$ ${s.costPrice.toFixed(2)}` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
