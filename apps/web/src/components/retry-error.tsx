'use client'

import { useState } from 'react'
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RetryErrorProps {
  error: Error | string
  onRetry?: () => void | Promise<void>
  showDetails?: boolean
  variant?: 'inline' | 'full' | 'compact'
  maxRetries?: number
}

export function RetryError({
  error,
  onRetry,
  showDetails = process.env.NODE_ENV === 'development',
  variant = 'inline',
  maxRetries = 3
}: RetryErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  const errorMessage = typeof error === 'string' 
    ? 'An error occurred. Please try again.' 
    : 'An error occurred. Please try again.'
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                        errorMessage.toLowerCase().includes('fetch')
  const isServerError = errorMessage.toLowerCase().includes('500') || 
                       errorMessage.toLowerCase().includes('server')
  const isTimeout = errorMessage.toLowerCase().includes('timeout')

  const handleRetry = async () => {
    if (!onRetry || retryCount >= maxRetries) return

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await onRetry()
    } catch (err) {
      // SECURITY: console statement removed: console.error('Retry failed:', err)
    } finally {
      setIsRetrying(false)
    }
  }

  const getIcon = () => {
    if (isNetworkError) return WifiOff
    if (isServerError) return ServerCrash
    if (isTimeout) return Clock
    return AlertCircle
  }

  const Icon = getIcon()

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2 text-red-400 p-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{errorMessage}</span>
        {onRetry && retryCount < maxRetries && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-red-500/20 p-8 text-center">
            <div className="h-16 w-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isNetworkError ? 'Connection Problem' :
               isServerError ? 'Server Error' :
               isTimeout ? 'Request Timeout' :
               'Something Went Wrong'}
            </h3>
            <p className="text-slate-400 mb-6">
              {errorMessage}
            </p>
            {onRetry && retryCount < maxRetries && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
              >
                <RefreshCw className={`h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
                {retryCount > 0 && (
                  <span className="text-xs opacity-70">
                    ({retryCount}/{maxRetries})
                  </span>
                )}
              </button>
            )}
            {retryCount >= maxRetries && (
              <p className="text-sm text-red-400 mt-4">
                Maximum retry attempts reached. Please refresh the page or contact support.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // Default inline variant
  return (
    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-400 font-medium">Error Loading Data</p>
          <p className="text-sm text-slate-400 mt-1">{errorMessage}</p>
          
          {showDetails && error instanceof Error && process.env.NODE_ENV === 'development' && (
            <>
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="text-xs text-slate-500 hover:text-slate-400 mt-2 transition-colors"
              >
                {showErrorDetails ? 'Hide' : 'Show'} Details
              </button>
              <AnimatePresence>
                {showErrorDetails && (
                  <motion.pre
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs text-slate-500 mt-2 overflow-x-auto bg-slate-900/50 rounded p-2"
                  >
                    {'Error details hidden for security'}
                  </motion.pre>
                )}
              </AnimatePresence>
            </>
          )}
          
          {onRetry && retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-3 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center space-x-2 w-fit"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
              {retryCount > 0 && (
                <span className="text-xs opacity-70">
                  ({retryCount}/{maxRetries})
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}