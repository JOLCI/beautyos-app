import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { applyTheme } from '@/lib/colorUtils'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Company {
  id: string
  passkey: string
  name: string
  primary_color: string
  secondary_color?: string
  logo_url: string
  settings: any
}

interface PasskeyContextType {
  company: Company | null
  loading: boolean
}

const PasskeyContext = createContext<PasskeyContextType>({ company: null, loading: true })

export const PasskeyProvider = ({ children }: { children: ReactNode }) => {
  const { passkey } = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    if (!passkey) {
      setLoading(false)
      setError(true)
      return
    }

    const fetchCompany = async () => {
      setLoading(true)
      setError(false)
      try {
        const { data, error: err } = await supabase
          .from('companies')
          .select('*')
          .ilike('passkey', passkey)
          .maybeSingle()

        if (!mounted) return

        if (err) throw err

        if (data) {
          setCompany(data)
          if (data.primary_color) applyTheme(data.primary_color, data.secondary_color)
        } else {
          console.warn('Company not found for passkey:', passkey)
          setError(true)
        }
      } catch (e: any) {
        console.error('Error fetching company context:', e)
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCompany()

    return () => {
      mounted = false
    }
  }, [passkey])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Carregando dados do salão...
        </p>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center max-w-md text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Salão não encontrado</h2>
          <p className="text-muted-foreground mb-8">
            Não conseguimos localizar um salão com a chave de acesso{' '}
            <strong className="text-foreground">{passkey}</strong>. Verifique o link de acesso
            digitado.
          </p>
          <Button asChild className="rounded-full w-full h-11 text-base shadow-sm">
            <Link to="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <PasskeyContext.Provider value={{ company, loading }}>{children}</PasskeyContext.Provider>
}

export const usePasskey = () => useContext(PasskeyContext)
