'use client'

import { useEffect } from 'react'
import { RetryError } from '@/components/retry-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Safely handle error logging with better error checking
    try {
      if (error && typeof error === 'object') {
        if (error instanceof Error) {
          console.error('Application error:', error.message, error.stack)
        } else if ('message' in error && typeof error.message === 'string') {
          console.error('Application error:', error.message)
        } else {
          console.error('Application error:', JSON.stringify(error))
        }
      } else {
        console.error('Application error:', String(error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error in error handler:', e)
      console.error('Original error:', error)
    }
  }, [error])

  return (
    <RetryError
      error={error}
      onRetry={reset}
      variant="full"
    />
  )
}