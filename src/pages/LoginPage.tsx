import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const { company } = usePasskey()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { passkey } = useParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error('Acesso negado', { description: 'Credenciais inválidas.' })
    } else {
      navigate(`/${passkey}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-elevation border-border">
        <CardHeader className="space-y-4 items-center text-center">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt="Logo"
              className="w-20 h-20 object-contain rounded-full border shadow-sm"
            />
          ) : (
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
              {company?.name.charAt(0)}
            </div>
          )}
          <CardTitle className="text-2xl font-bold tracking-tight">{company?.name}</CardTitle>
          <CardDescription>Acesse sua conta</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail ou Usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@beautyos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full rounded-full h-11 text-base shadow-md"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
