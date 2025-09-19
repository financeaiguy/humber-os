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
          // Application error occurred - Error instance
        } else {
          // Application error occurred - generic object
        }
      } else {
        // Application error occurred - non-object type
      }
    } catch (e) {
      // Error in error handler
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