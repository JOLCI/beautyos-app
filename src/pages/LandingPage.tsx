import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Flower } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LandingPage() {
  const [passkey, setPasskey] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passkey.trim()) return

    setLoading(true)
    const code = passkey.toUpperCase().trim()
    const { data, error } = await supabase
      .from('companies')
      .select('passkey')
      .eq('passkey', code)
      .single()

    setLoading(false)
    if (error || !data) {
      toast.error('Empresa não encontrada', {
        description: 'Verifique a chave informada e tente novamente.',
      })
    } else {
      navigate(`/${data.passkey}/login`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-elevation border-border">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full inline-block mb-2">
            <Flower className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">BeautyOS</CardTitle>
          <CardDescription>O sistema inteligente para o seu salão</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccess} className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium">Digite a chave de acesso da sua empresa:</p>
              <Input
                placeholder="Ex: BEAUTY01"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="text-center text-lg uppercase h-12"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-full text-base" disabled={loading}>
              {loading ? 'Buscando...' : 'Acessar Sistema'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
