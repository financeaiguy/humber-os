'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: { [key: string]: string } = {
    CredentialsSignin: 'Invalid email or password.',
    OAuthSignin: 'Error with OAuth provider.',
    OAuthCallback: 'Error in OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth account.',
    EmailCreateAccount: 'Could not create email account.',
    Callback: 'Error in callback handler.',
    OAuthAccountNotLinked: 'Account not linked with OAuth provider.',
    EmailSignin: 'Error sending email.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An error occurred during authentication.',
  }

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 w-fit mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>
            <p className="text-slate-400">{message}</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Back to Sign In
            </Link>
            
            <Link
              href="/"
              className="block w-full py-3 rounded-lg bg-slate-700/50 text-white font-medium text-center hover:bg-slate-700/70 transition-all duration-200"
            >
              Go to Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs text-slate-500 font-mono">Error code: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}