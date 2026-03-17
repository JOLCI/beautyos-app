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
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const { company } = usePasskey()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { passkey } = useParams()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    setLoading(true)

    let loginEmail = identifier.trim()

    // If not an email, lookup email by username and company_id
    if (!loginEmail.includes('@')) {
      const { data, error } = await supabase.rpc('get_email_for_login', {
        p_username: loginEmail,
        p_company_id: company.id,
      })

      if (error || !data) {
        setLoading(false)
        toast.error('Usuário ou senha incorretos.')
        return
      }
      loginEmail = data as string
    }

    const { error } = await signIn(loginEmail, password)
    setLoading(false)

    if (error) {
      toast.error('Usuário ou senha incorretos.')
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
              className="w-20 h-20 object-contain rounded-full border shadow-sm bg-white"
            />
          ) : (
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center text-primary font-bold text-3xl shadow-inner border border-primary/20">
              {company?.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">{company?.name}</CardTitle>
            <CardDescription>Acesse sua conta do BeautyOS</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">E-mail ou Usuário</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Ex: admin@beautyos.com ou admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-11"
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
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full rounded-full h-11 text-base shadow-md font-medium"
              disabled={loading}
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
