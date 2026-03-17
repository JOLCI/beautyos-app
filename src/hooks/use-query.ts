import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useQuery<T>(
  table: string,
  options?: { match?: Record<string, any>; order?: { column: string; ascending: boolean } },
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from(table).select('*')
    if (options?.match) q = q.match(options.match)
    if (options?.order) q = q.order(options.order.column, { ascending: options.order.ascending })

    const { data: result } = await q
    setData((result as T[]) || [])
    setLoading(false)
  }, [table, JSON.stringify(options)])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, refetch: fetch }
}
