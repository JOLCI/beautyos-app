import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { mockUsers } from '@/lib/mock'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  login: (passkey: string, username: string, pass: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('@beautyos:user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  const login = (passkey: string, username: string, pass: string) => {
    if (username === 'root' && pass === 's3nh4') {
      const rootUser = mockUsers.find((u) => u.username === 'root')!
      setUser(rootUser)
      localStorage.setItem('@beautyos:user', JSON.stringify(rootUser))
      return true
    }

    const found = mockUsers.find((u) => u.username === username && u.passkey === passkey)
    if (found && pass === '123') {
      // mock password
      setUser(found)
      localStorage.setItem('@beautyos:user', JSON.stringify(found))
      return true
    }

    toast({ title: 'Acesso negado', description: 'Credenciais inválidas.', variant: 'destructive' })
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('@beautyos:user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
