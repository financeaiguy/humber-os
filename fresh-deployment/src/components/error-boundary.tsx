'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    
    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, DataDog, etc.
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: this.state.retryCount + 1
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-red-500/20 p-8">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-slate-400 mb-6">
                    We encountered an unexpected error. The team has been notified and is working on a fix.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mb-6">
                    <button
                      onClick={this.handleReset}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Try Again</span>
                      {this.state.retryCount > 0 && (
                        <span className="text-xs opacity-70">
                          ({this.state.retryCount})
                        </span>
                      )}
                    </button>
                    <Link
                      href="/"
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Home className="h-4 w-4" />
                      <span>Go Home</span>
                    </Link>
                  </div>

                  {/* Error Details Toggle */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <>
                      <button
                        onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        {this.state.showDetails ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span>
                          {this.state.showDetails ? 'Hide' : 'Show'} technical details
                        </span>
                      </button>

                      {this.state.showDetails && (
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                          <div className="mb-3">
                            <p className="text-xs text-red-400 font-mono mb-1">Error Message:</p>
                            <p className="text-sm text-slate-300 font-mono">
                              {this.state.error.message}
                            </p>
                          </div>
                          {this.state.errorInfo && (
                            <div>
                              <p className="text-xs text-red-400 font-mono mb-1">Stack Trace:</p>
                              <pre className="text-xs text-slate-400 font-mono overflow-x-auto">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}