import React from 'react'
import { Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Loader2 } from 'lucide-react'

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const { user, profile, loading } = useAuth()
  const { company } = usePasskey()
  const { passkey } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (!user || !profile) {
    // Save intended location to return after login if needed, though simple replace is ok
    return <Navigate to={`/${passkey}/login`} replace state={{ from: location }} />
  }

  // Cross-tenant protection (unless root)
  if (profile.role !== 'root' && profile.company_id !== company?.id) {
    return <Navigate to={`/${passkey}/login`} replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 animate-fade-in">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-3xl font-bold">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Você não tem permissão para acessar esta área.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full px-8">
          Voltar
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
