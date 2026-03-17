import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, QrCode, Copy } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  total: number
}

export function CheckoutSheet({ open, onOpenChange, total }: Props) {
  const [method, setMethod] = useState('pix')
  const [discount, setDiscount] = useState('0')
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')

  const finalTotal = total - Number(discount || 0)

  useEffect(() => {
    if (open) setStatus('idle')
  }, [open])

  useEffect(() => {
    if (status === 'waiting' && method === 'pix') {
      const t = setTimeout(() => {
        setStatus('success')
        toast({ title: 'Pagamento Confirmado', description: 'PIX recebido com sucesso na conta.' })
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [status, method])

  const handleFinish = () => {
    if (method === 'pix') {
      setStatus('waiting')
    } else {
      setStatus('success')
      toast({ title: 'Atendimento Finalizado', description: 'Lançamento de caixa gerado.' })
    }
  }

  const copyPix = () => {
    toast({
      title: 'Chave Copiada',
      description: 'Chave PIX Copia e Cola enviada para área de transferência.',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px] w-full flex flex-col h-full p-0">
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle className="text-2xl">Finalizar Cobrança</SheetTitle>
            <SheetDescription>Selecione a forma de pagamento.</SheetDescription>
          </SheetHeader>
        </div>

        {status === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-6 animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-center">Pagamento Confirmado!</h3>
            <p className="text-muted-foreground text-center text-lg">
              O ticket foi fechado e registrado no fluxo de caixa de hoje.
            </p>
            <Button
              className="mt-8 rounded-full px-8 h-12 text-lg w-full max-w-xs"
              onClick={() => onOpenChange(false)}
            >
              Concluir
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="bg-muted/30 p-5 rounded-2xl border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-semibold">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Desconto (R$)</span>
                <Input
                  type="number"
                  className="w-28 h-9 text-right font-semibold"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">Total a Pagar</span>
                <span className="text-3xl font-extrabold text-primary">
                  R$ {Math.max(0, finalTotal).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Método de Pagamento</Label>
              <RadioGroup
                value={method}
                onValueChange={setMethod}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {[
                  { id: 'pix', label: 'PIX Dinâmico' },
                  { id: 'credit', label: 'Crédito' },
                  { id: 'debit', label: 'Débito' },
                  { id: 'cash', label: 'Dinheiro' },
                  { id: 'convenio', label: 'Convênio / Fiado' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className={cn(
                      'flex flex-col items-center justify-center space-y-2 border-2 rounded-xl p-4 cursor-pointer transition-all text-center',
                      method === opt.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted/50',
                    )}
                    onClick={() => setMethod(opt.id)}
                  >
                    <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                    <Label htmlFor={opt.id} className="cursor-pointer font-semibold leading-tight">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {method === 'pix' && status === 'waiting' && (
              <div className="flex flex-col items-center justify-center p-8 bg-card border-2 border-primary/20 rounded-2xl animate-fade-in shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-2xl"></div>
                <div className="relative z-10 bg-white p-4 rounded-xl shadow-sm border mb-6">
                  <QrCode className="w-40 h-40 text-black" />
                </div>
                <div className="relative z-10 text-center space-y-2 w-full">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-sm font-semibold mb-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping mr-2 inline-block"></span>{' '}
                    Aguardando pagamento
                  </Badge>
                  <div className="flex w-full items-center gap-2 mt-4">
                    <Input
                      readOnly
                      value="0002012636br.gov.bcb.pix0114+5511999999999..."
                      className="h-10 text-xs text-muted-foreground bg-muted/50 border-0"
                    />
                    <Button size="icon" variant="secondary" onClick={copyPix} className="shrink-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {status !== 'success' && (
          <div className="p-6 border-t bg-background">
            <Button
              onClick={handleFinish}
              disabled={status === 'waiting'}
              className="w-full rounded-full h-14 text-lg font-bold shadow-xl transition-transform hover:scale-[1.01]"
            >
              {status === 'waiting' ? 'Verificando PIX...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
