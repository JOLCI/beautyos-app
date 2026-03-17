import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 animate-fade-in">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-3xl font-bold">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Você não tem o nível de permissão necessário para acessar esta área.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full px-8">
          Voltar
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
