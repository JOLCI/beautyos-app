import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/hooks/use-auth'

export function useQuery<T>(
  table: string,
  options?: {
    match?: Record<string, any>
    order?: { column: string; ascending: boolean }
    select?: string
    enabled?: boolean
  },
) {
  const { company } = usePasskey()
  const { session } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    // Skip fetching completely if explicitly disabled
    if (options?.enabled === false) {
      setLoading(false)
      setData([])
      return
    }

    // Restrict fetching to authenticated sessions for non-public tables
    const isPublicTable = table === 'companies' || table === 'profiles'
    if (!isPublicTable && !session) {
      setLoading(false)
      setData([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      let q = supabase.from(table).select(options?.select || '*')

      // Strict isolation on frontend
      if (table !== 'companies' && company?.id) {
        q = q.eq('company_id', company.id)
      }

      if (options?.match) {
        // Clean match object to remove undefined or null values
        // This prevents sending invalid UUID strings to Supabase like "undefined"
        const cleanMatch = Object.fromEntries(
          Object.entries(options.match).filter(
            ([_, v]) => v !== undefined && v !== null && v !== 'undefined' && v !== 'null',
          ),
        )
        if (Object.keys(cleanMatch).length > 0) {
          q = q.match(cleanMatch)
        }
      }

      if (options?.order) q = q.order(options.order.column, { ascending: options.order.ascending })

      const { data: result, error: supabaseError } = await q
      if (supabaseError) {
        console.error(`Supabase error fetching ${table}:`, supabaseError)
        throw new Error(supabaseError.message)
      }
      setData((result as T[]) || [])
    } catch (err: any) {
      console.error(`Runtime error fetching ${table}:`, err)
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      setData([])
    } finally {
      setLoading(false)
    }
  }, [table, JSON.stringify(options), company?.id, session])

  useEffect(() => {
    if (table === 'companies' || company?.id) {
      fetch()
    }
  }, [fetch, table, company?.id])

  return { data, loading, error, refetch: fetch }
}
