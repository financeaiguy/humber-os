'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'

const mockCredentials = [
  { email: 'admin@example.com', password: 'admin123', role: 'System Admin', description: 'Full system access' },
  { email: 'engineer@example.com', password: 'engineer123', role: 'Engineer', description: 'Engineering management' },
  { email: 'operator@example.com', password: 'operator123', role: 'Operator', description: 'Operations control' },
  { email: 'customer@example.com', password: 'customer123', role: 'Customer (Demo)', description: 'Client portal access' },
  { email: 'partner@example.com', password: 'partner123', role: 'Partner (Demo)', description: 'Partner management' },
  { email: 'employee@example.com', password: 'employee123', role: 'Employee', description: 'Self-service portal' },
]

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check for prefilled email from signup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefillEmail = sessionStorage.getItem('prefillEmail')
      if (prefillEmail) {
        setEmail(prefillEmail)
        sessionStorage.removeItem('prefillEmail')
        // Focus password field if email is prefilled
        setTimeout(() => {
          const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
          if (passwordInput) {
            passwordInput.focus()
          }
        }, 100)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn(email, password)

      if (!result.success) {
        setError(result.error)
      } else {
        // Success - redirect will happen automatically via the signIn function
        // router.push('/') and router.refresh() are handled by the signIn function
      }
    } catch (error) {
      setError('Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (credentials: { email: string; password: string }) => {
    setEmail(credentials.email)
    setPassword(credentials.password)
    setLoading(true)
    setError('')

    try {
      const result = await signIn(credentials.email, credentials.password)

      if (!result.success) {
        setError(result.error)
      } else {
        // Success - redirect will happen automatically via the signIn function
        // router.push('/') and router.refresh() are handled by the signIn function
      }
    } catch (error) {
      setError('Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page signin-container fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center space-y-8 text-white lg:pr-8"
        >
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Humber Operations</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Engineering Staffing
              <span className="block text-blue-400">Automation System</span>
            </h2>
            <p className="text-slate-300 text-lg">
              Streamline your engineering deployments with our intelligent automation platform.
              Multi-partner RBAC system for secure, scalable operations.
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-400">Demo Accounts - Click to Login</h3>
            <p className="text-sm text-slate-400 mb-4">
              Test different user roles and permissions in the system
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mockCredentials.map((cred, index) => (
                <motion.button
                  key={cred.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleDemoLogin(cred)}
                  disabled={loading}
                  className="text-left p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500 transition-all duration-200 group hover:bg-slate-800/70"
                >
                  <div className="text-sm font-medium text-white group-hover:text-blue-400">
                    {cred.role}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{cred.email}</div>
                  <div className="text-xs text-slate-500">{cred.description}</div>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">🎯 Role Capabilities:</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <div><strong>System Admin:</strong> Full system access, user management, all features</div>
                <div><strong>Engineer:</strong> Team management, time approval, bull pen access</div>
                <div><strong>Operator:</strong> Project management, compliance monitoring</div>
                <div><strong>Customer:</strong> View assigned engineers, approve timesheets</div>
                <div><strong>Partner:</strong> Strategic oversight, client relations, analytics</div>
                <div><strong>Employee:</strong> Self-service time tracking, personal calendar</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8">
              <div className="text-center mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 w-fit mx-auto mb-4">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}