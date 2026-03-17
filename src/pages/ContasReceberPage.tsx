import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle2, MessageCircle } from 'lucide-react'
import { mockReceivables } from '@/lib/mock'
import { toast } from 'sonner'

export default function ContasReceberPage() {
  const [receivables, setReceivables] = useState(mockReceivables)

  const handleReceive = (id: string) => {
    setReceivables(receivables.map((r) => (r.id === id ? { ...r, status: 'paid' } : r)))
    toast.success('Valor Recebido', { description: 'Entrada registrada no caixa.' })
  }

  const sendReminder = () => {
    toast.info('Lembrete Enviado', { icon: <MessageCircle className="w-4 h-4" /> })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
          <p className="text-muted-foreground">Acompanhe fiados e convênios.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Novo Recebível
        </Button>
      </div>

      <div className="md:hidden space-y-4">
        {receivables.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold block">{r.description}</span>
                <Badge variant="secondary" className="uppercase text-[10px] mt-1">
                  {r.type}
                </Badge>
              </div>
              <span className="font-bold text-primary">R$ {r.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-4">
              {r.status !== 'paid' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#25D366] px-2"
                  onClick={sendReminder}
                  aria-label="Lembrar via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              {r.status !== 'paid' ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={() => handleReceive(r.id)}
                >
                  Receber
                </Button>
              ) : (
                <Badge className="bg-green-500">Recebido</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Previsão</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {r.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      R$ {r.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {r.status === 'paid' ? (
                        <Badge className="bg-green-500">Recebido</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      {r.status !== 'paid' && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-[#25D366]"
                            onClick={sendReminder}
                            aria-label="Lembrar via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200"
                            onClick={() => handleReceive(r.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Receber
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
