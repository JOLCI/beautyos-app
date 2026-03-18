import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'

export function useQuery<T>(
  table: string,
  options?: {
    match?: Record<string, any>
    order?: { column: string; ascending: boolean }
    select?: string
  },
) {
  const { company } = usePasskey()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from(table).select(options?.select || '*')

    // Strict isolation on frontend
    if (table !== 'companies' && company?.id) {
      q = q.eq('company_id', company.id)
    }

    if (options?.match) q = q.match(options.match)
    if (options?.order) q = q.order(options.order.column, { ascending: options.order.ascending })

    const { data: result, error } = await q
    if (error) console.error(`Error fetching ${table}:`, error)
    setData((result as T[]) || [])
    setLoading(false)
  }, [table, JSON.stringify(options), company?.id])

  useEffect(() => {
    if (table === 'companies' || company?.id) {
      fetch()
    }
  }, [fetch, table, company?.id])

  return { data, loading, refetch: fetch }
}
