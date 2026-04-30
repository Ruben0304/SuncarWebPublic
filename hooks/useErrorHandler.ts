'use client'

import { useState, useCallback } from 'react'
import { getErrorMessage, logError } from '@/lib/errorHandler'

interface UseErrorHandlerReturn {
  error: string | null
  setError: (error: string | null) => void
  handleError: (error: unknown, context?: string) => void
  clearError: () => void
  hasError: boolean
}

/**
 * Hook personalizado para manejar errores de forma consistente
 * 
 * @example
 * const { error, handleError, clearError } = useErrorHandler()
 * 
 * try {
 *   await fetchData()
 * } catch (err) {
 *   handleError(err, 'fetchData')
 * }
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown, context?: string) => {
    const message = getErrorMessage(error)
    setError(message)
    logError(error, context)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    setError,
    handleError,
    clearError,
    hasError: error !== null,
  }
}
