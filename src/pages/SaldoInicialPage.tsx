import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  Download,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

// Mock Data
const MOCK_HISTORY = [
  {
    id: '1',
    date: new Date().toISOString(),
    type: 'Saldo Inicial',
    amount: 500,
    newBalance: 500,
    reason: 'Abertura de caixa do dia',
    user: 'root',
  },
  {
    id: '2',
    date: new Date().toISOString(),
    type: 'Ajuste',
    amount: -50,
    newBalance: 450,
    reason: 'Retirada para compra de café',
    user: 'root',
  },
]

export default function SaldoInicialPage() {
  const [balance, setBalance] = useState(450)
  const [initialBalance, setInitialBalance] = useState(500)

  const [initialForm, setInitialForm] = useState({ amount: '', notes: '' })
  const [adjustForm, setAdjustForm] = useState({ amount: '', reason: '', type: 'add' })

  const [confirmWord, setConfirmWord] = useState('')
  const [openInitialDialog, setOpenInitialDialog] = useState(false)
  const [openAdjustDialog, setOpenAdjustDialog] = useState(false)

  const handleSetInitial = () => {
    if (confirmWord !== 'CONFIRMAR') return toast.error('Palavra de confirmação incorreta')
    setInitialBalance(Number(initialForm.amount))
    setBalance(Number(initialForm.amount))
    toast.success('Saldo inicial definido com sucesso', { icon: <Info className="w-4 h-4" /> })
    setOpenInitialDialog(false)
    setConfirmWord('')
    setInitialForm({ amount: '', notes: '' })
  }

  const handleAdjust = () => {
    if (confirmWord !== 'AJUSTE') return toast.error('Palavra de confirmação incorreta')
    const val = Number(adjustForm.amount)
    const adj = adjustForm.type === 'add' ? val : -val
    setBalance((prev) => prev + adj)
    toast.success('Ajuste de saldo realizado com sucesso')
    setOpenAdjustDialog(false)
    setConfirmWord('')
    setAdjustForm({ amount: '', reason: '', type: 'add' })
  }

  const projectedBalance =
    balance +
    (adjustForm.type === 'add' ? Number(adjustForm.amount || 0) : -Number(adjustForm.amount || 0))

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-destructive text-destructive-foreground font-bold p-4 rounded-lg flex items-center gap-3 shadow-md">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <p className="leading-tight">
          ÁREA RESTRITA — ROOT ONLY. Operações nesta página afetam diretamente o saldo do caixa.
          Proceda com cautela.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Saldo Atual do Caixa</CardTitle>
            <CardDescription>Caixa Principal</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-black flex items-center gap-2 ${balance < 0 ? 'text-destructive' : 'text-primary'}`}
            >
              {balance < 0 && <AlertCircle className="w-8 h-8" />}
              R$ {balance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Saldo Inicial de Hoje: <strong>R$ {initialBalance.toFixed(2)}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <Tabs defaultValue="initial" className="w-full">
            <div className="px-6 pt-4 pb-2 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="initial">Definir Inicial</TabsTrigger>
                <TabsTrigger value="adjust">Ajuste Manual</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="initial" className="p-6 mt-0 animate-fade-in">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
                  <Input
                    id="initialAmount"
                    type="number"
                    value={initialForm.amount}
                    onChange={(e) => setInitialForm({ ...initialForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialNotes">Observações</Label>
                  <Textarea
                    id="initialNotes"
                    placeholder="Ex: Abertura padrão de segunda-feira"
                    value={initialForm.notes}
                    onChange={(e) => setInitialForm({ ...initialForm, notes: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!initialForm.amount || !initialForm.notes}
                  onClick={() => setOpenInitialDialog(true)}
                >
                  Registrar Saldo Inicial
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="adjust" className="p-6 mt-0 animate-fade-in">
              <div className="space-y-4 max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={adjustForm.type === 'add' ? 'default' : 'outline'}
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                    className="w-full bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                  <Button
                    variant={adjustForm.type === 'sub' ? 'destructive' : 'outline'}
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'sub' })}
                    className="w-full"
                  >
                    <ArrowDownRight className="w-4 h-4 mr-2" /> Subtrair
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustAmount">Valor do Ajuste (R$)</Label>
                  <Input
                    id="adjustAmount"
                    type="number"
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustReason">Motivo (Mínimo 20 caracteres)</Label>
                  <Textarea
                    id="adjustReason"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    aria-describedby="reason-helper"
                  />
                  <p id="reason-helper" className="text-xs text-muted-foreground text-right">
                    {adjustForm.reason.length}/20
                  </p>
                </div>

                {adjustForm.amount && (
                  <div className="p-3 bg-muted rounded-md text-sm font-medium flex justify-between items-center">
                    <span>Novo saldo será:</span>
                    <span className={projectedBalance < 0 ? 'text-destructive' : ''}>
                      R$ {projectedBalance.toFixed(2)}
                    </span>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!adjustForm.amount || adjustForm.reason.length < 20}
                  onClick={() => setOpenAdjustDialog(true)}
                >
                  Aplicar Ajuste
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico de Ajustes</CardTitle>
            <CardDescription>Trilha de auditoria das operações ROOT.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Download CSV iniciado')}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Novo Saldo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HISTORY.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(h.date).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{h.type}</Badge>
                  </TableCell>
                  <TableCell
                    className={`font-semibold ${h.amount < 0 ? 'text-destructive' : 'text-green-600'}`}
                  >
                    {h.amount > 0 ? '+' : ''}
                    {h.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-bold">R$ {h.newBalance.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={h.reason}>
                    {h.reason}
                  </TableCell>
                  <TableCell className="uppercase text-xs font-mono">{h.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openInitialDialog} onOpenChange={setOpenInitialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Saldo Inicial</DialogTitle>
            <DialogDescription>
              Você está definindo o saldo inicial como <strong>R$ {initialForm.amount}</strong>.
              Esta ação criará um registro de auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label>Digite "CONFIRMAR" para prosseguir</Label>
            <Input value={confirmWord} onChange={(e) => setConfirmWord(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenInitialDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSetInitial} disabled={confirmWord !== 'CONFIRMAR'}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAdjustDialog} onOpenChange={setOpenAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Atenção: Ajuste Manual</DialogTitle>
            <DialogDescription>
              Você está prestes a {adjustForm.type === 'add' ? 'adicionar' : 'subtrair'}{' '}
              <strong>R$ {adjustForm.amount}</strong> do caixa. O novo saldo será{' '}
              <strong>R$ {projectedBalance.toFixed(2)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label>Digite "AJUSTE" para prosseguir</Label>
            <Input value={confirmWord} onChange={(e) => setConfirmWord(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdjustDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleAdjust}
              disabled={confirmWord !== 'AJUSTE'}
            >
              Aplicar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
