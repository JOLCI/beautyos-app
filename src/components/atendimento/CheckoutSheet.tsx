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
import { CheckCircle2, QrCode } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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
        toast({
          title: 'Pagamento PIX Confirmado',
          description: 'O valor foi recebido com sucesso.',
        })
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [status, method])

  const handleFinish = () => {
    if (method === 'pix') {
      setStatus('waiting')
    } else {
      setStatus('success')
      toast({ title: 'Atendimento Finalizado', description: 'Checkout realizado com sucesso.' })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Checkout</SheetTitle>
          <SheetDescription>Finalize o atendimento e receba o pagamento.</SheetDescription>
        </SheetHeader>

        {status === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
            <h3 className="text-2xl font-bold">Tudo certo!</h3>
            <p className="text-muted-foreground text-center">
              O atendimento foi finalizado e registrado no caixa.
            </p>
            <Button className="mt-8 rounded-full" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Desconto (R$)</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Total a Pagar</span>
                <span>R$ {Math.max(0, finalTotal).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Forma de Pagamento</Label>
              <RadioGroup
                value={method}
                onValueChange={setMethod}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="cursor-pointer w-full font-medium">
                    PIX Dinâmico
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="cursor-pointer w-full font-medium">
                    Cartão Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                  <RadioGroupItem value="debit" id="debit" />
                  <Label htmlFor="debit" className="cursor-pointer w-full font-medium">
                    Cartão Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer w-full font-medium">
                    Dinheiro
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {method === 'pix' && status === 'waiting' && (
              <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-xl animate-fade-in shadow-inner">
                <div className="relative">
                  <QrCode className="w-32 h-32 text-primary opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <p className="mt-4 font-medium text-center">Aguardando pagamento do PIX...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Escaneie o QR Code no app do banco
                </p>
              </div>
            )}
          </div>
        )}

        {status !== 'success' && (
          <SheetFooter className="mt-auto pt-4 border-t border-border">
            <Button
              onClick={handleFinish}
              disabled={status === 'waiting'}
              className="w-full rounded-full h-12 text-base shadow-md"
            >
              {status === 'waiting' ? 'Aguardando...' : 'Confirmar e Finalizar'}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
