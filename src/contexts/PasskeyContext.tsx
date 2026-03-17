import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { applyTheme } from '@/lib/colorUtils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  passkey: string
  name: string
  primary_color: string
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

        if (err) throw err

        if (data) {
          setCompany(data)
          if (data.primary_color) applyTheme(data.primary_color)
        } else {
          toast.error('Chave de acesso inválida ou não encontrada.')
          setError(true)
        }
      } catch (e: any) {
        console.error('Error fetching company context:', e)
        toast.error('Erro ao conectar com o servidor da empresa.')
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [passkey])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !company) {
    return <Navigate to="/" replace />
  }

  return <PasskeyContext.Provider value={{ company, loading }}>{children}</PasskeyContext.Provider>
}

export const usePasskey = () => useContext(PasskeyContext)
