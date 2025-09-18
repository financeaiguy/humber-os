'use client'

import { useState } from 'react'

// export const runtime = 'edge'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, User, Mail, Lock, Eye, EyeOff, Users } from 'lucide-react'
import Link from 'next/link'
import { UserRole } from '@humber/types'

const partners = [
  { id: 'humber-operations', name: 'Humber Operations' },
  { id: 'partner-gm', name: 'General Motors' },
  { id: 'partner-ford', name: 'Ford Motor Company' },
  { id: 'partner-stellantis', name: 'Stellantis' },
  { id: 'partner-hirotec', name: 'HIROTEC America' },
]

const roles: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'PARTNER_ADMIN',
    label: 'System Admin / Partner',
    description: 'Full system access, user management, all features'
  },
  {
    value: 'PARTNER_OPERATOR',
    label: 'Engineer / Operator / Customer',
    description: 'Operations control, project management, compliance monitoring'
  },
  {
    value: 'ENGINEER_EMPLOYEE',
    label: 'Employee (Self-Service)',
    description: 'Personal time tracking, calendar access, limited features'
  }
]

// Demo accounts for quick testing
const demoAccounts = [
  { email: 'admin@humber.com', password: 'admin123', role: 'System Admin', access: 'Full system access' },
  { email: 'engineer@humber.com', password: 'engineer123', role: 'Engineer', access: 'Team management, approvals' },
  { email: 'operator@humber.com', password: 'operator123', role: 'Operator', access: 'Operations control' },
  { email: 'customer@gm.com', password: 'customer123', role: 'Customer (GM)', access: 'Client portal access' },
  { email: 'partner@ford.com', password: 'partner123', role: 'Partner (Ford)', access: 'Strategic management' },
  { email: 'employee@humber.com', password: 'employee123', role: 'Employee', access: 'Self-service portal' },
]

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ENGINEER_EMPLOYEE' as UserRole,
    partnerId: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // TODO: Implement actual signup API call
      // // SECURITY: Removed // SECURITY: Removed // SECURITY: Removed console.log('Sign up data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store email in sessionStorage for prefilling signin
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('prefillEmail', formData.email)
      }
      
      // Show success message and redirect
      alert(`Account created successfully for ${formData.name}! Redirecting to sign in with your email prefilled...`)
      
      // Redirect to signin page
      router.push('/auth/signin')
      
    } catch (error) {
      // SECURITY: Removed // SECURITY: Removed console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
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
              Join Our
              <span className="block text-blue-400">Partner Network</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Create your account and get access to our engineering staffing automation platform.
              Choose your role and partner organization to get started.
            </p>
          </div>

          {/* Role Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-400">Role Types</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.value} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <div className="font-medium text-white">{role.label}</div>
                  <div className="text-sm text-slate-400">{role.description}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8">
              <div className="text-center mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-slate-400">Join the Humber Operations platform</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Partner Organization
                  </label>
                  <select
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select your organization</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Create a password"
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Demo Accounts Section */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">🧪 Demo Accounts Available</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Skip signup and test with pre-configured demo accounts
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demoAccounts.map((account, index) => (
                    <motion.div
                      key={account.email}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                    >
                      <div className="text-sm font-medium text-white">{account.role}</div>
                      <div className="text-xs text-slate-400 mb-1">{account.email}</div>
                      <div className="text-xs text-slate-500">{account.access}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400">
                    💡 <strong>Quick Test:</strong> Go to <Link href="/auth/signin" className="underline hover:text-blue-300">Sign In</Link> and click any demo account to instantly test different roles and permissions.
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign in
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