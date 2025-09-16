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
    console.error(error)
  }, [error])

  return (
    <RetryError
      error={error}
      onRetry={reset}
      variant="full"
    />
  )
}