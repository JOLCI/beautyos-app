import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  profile: any | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = (userId: string) => {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (mounted) {
            setProfile(data || null)
            setLoading(false)
          }
        })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) =>
    await supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    // Clear profile optimistically from local state
    setProfile(null)
    setUser(null)
    setSession(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        // Intercept specific session missing errors (e.g. 403 session_not_found)
        const isSessionMissing =
          error.status === 403 ||
          error.message?.includes('session_not_found') ||
          error.message?.includes('Session from session_id claim in JWT does not exist')

        if (isSessionMissing) {
          console.warn('Session already missing on server. Proceeding with local logout.')
          return { error: null } // Return success to avoid failing the logout flow
        }

        console.error('Error during sign out:', error)
        return { error }
      }

      return { error: null }
    } catch (err) {
      console.error('Unexpected error during sign out:', err)
      // Fallback: treat as successful local logout to ensure user isn't stuck
      return { error: null }
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
