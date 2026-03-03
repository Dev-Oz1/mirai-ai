import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useApi<T>(apiFunc: (...args: any[]) => Promise<T>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const result = await apiFunc(...args)
        setState({ data: result, error: null, isLoading: false })
        return result
      } catch (error: any) {
        const errorMessage = error.message || 'An unexpected error occurred'
        setState({ data: null, error: errorMessage, isLoading: false })
        throw error
      }
    },
    [apiFunc],
  )

  return { ...state, execute }
}
