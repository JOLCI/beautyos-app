import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function SaldoInicialPage() {
  const handleSave = () => {
    toast({ title: 'Sucesso', description: 'Saldo inicial do caixa atualizado com sucesso.' })
  }

  return (
    <div className="max-w-md mx-auto mt-10 animate-fade-in-up">
      <Card className="border-border shadow-elevation">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-xl">R$</span>
          </div>
          <CardTitle className="text-2xl">Abertura de Caixa</CardTitle>
          <CardDescription>Defina o valor de troco disponível no caixa hoje.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Valor Inicial (R$)</Label>
            <Input type="number" placeholder="0.00" className="h-12 text-lg text-center" />
          </div>
          <Button className="w-full h-12 rounded-full text-base shadow-md" onClick={handleSave}>
            Confirmar Saldo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
