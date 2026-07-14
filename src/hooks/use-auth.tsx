import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INACTIVITY_TIMEOUT = 90 * 60 * 1000 // 90 minutes

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // checkInactivity needs the current user, but reading it from state would force
  // `user` into the effect's deps — and the effect also writes to `user`, which
  // loops forever (getSession returns a fresh object on every call).
  const userRef = useRef<User | null>(null)
  userRef.current = user

  useEffect(() => {
    let lastActivity = Date.now()

    const handleActivity = () => {
      lastActivity = Date.now()
    }

    const checkInactivity = async () => {
      if (userRef.current && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        toast.error('Sessão expirada por inatividade. Faça login novamente.')
        await supabase.auth.signOut()
      }
    }

    const loadProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
    }

    const applySession = (session: Session | null) => {
      setSession(session)
      // Keep the previous object when it is the same user, so consumers that
      // depend on `user` are not re-run on every session read.
      setUser((prev) => (prev?.id === session?.user?.id ? prev : (session?.user ?? null)))
      if (session?.user) {
        loadProfile(session.user.id).then(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session)
    })

    // Setup inactivity tracking
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)

    const interval = setInterval(checkInactivity, 60000) // check every minute

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      clearInterval(interval)
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
