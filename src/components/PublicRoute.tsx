import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const { passkey: urlPasskey } = useParams()
  const [resolvedPasskey, setResolvedPasskey] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let mounted = true
    if (user && profile && !urlPasskey && !resolvedPasskey) {
      setFetching(true)

      let q = supabase.from('companies').select('passkey')
      if (profile.role !== 'root') {
        q = q.eq('id', profile.company_id)
      }

      q.limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (mounted) {
            if (data?.passkey) {
              setResolvedPasskey(data.passkey)
            }
            setFetching(false)
          }
        })
    }
    return () => {
      mounted = false
    }
  }, [user, profile, urlPasskey, resolvedPasskey])

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm animate-pulse">Verificando sessão...</p>
      </div>
    )
  }

  if (user && profile) {
    const pk = urlPasskey || resolvedPasskey
    if (pk) {
      return <Navigate to={`/${pk}/dashboard`} replace />
    }
  }

  return <>{children}</>
}
