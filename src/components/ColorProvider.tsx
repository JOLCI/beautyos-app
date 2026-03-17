import { useEffect } from 'react'
import { applyTheme } from '@/lib/colorUtils'

export function ColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('@beautyos:colors')
    if (saved) {
      try {
        const { primary } = JSON.parse(saved)
        if (primary) applyTheme(primary)
      } catch (e) {
        console.error('Failed to parse colors', e)
      }
    }
  }, [])

  return <>{children}</>
}
