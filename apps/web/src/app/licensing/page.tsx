'use client'
export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Award, MapPin, FileText, AlertTriangle, CheckCircle, DollarSign, Shield } from 'lucide-react'

export default function LicensingPage() {
  const stateRequirements = [
    {
      state: 'Michigan',
      required: true,
      status: 'compliant',
      licenseType: 'Private Employment Agency License',
      renewalDate: '2025-12-31',
      bondAmount: '$10,000',
      details: 'Required for all staffing agencies placing workers in Michigan'
    },
    {
      state: 'Ohio',
      required: false,
      status: 'n/a',
      licenseType: 'No specific licensing required',
      renewalDate: 'N/A',
      bondAmount: 'N/A',
      details: 'Ohio does not require specific staffing agency licensing'
    },
    {
      state: 'Indiana',
      required: true,
      status: 'compliant',
      licenseType: 'Employment Agency License',
      renewalDate: '2025-06-30',
      bondAmount: '$5,000',
      details: 'Required for placement of permanent employees'
    },
    {
      state: 'Illinois',
      required: true,
      status: 'compliant',
      licenseType: 'Private Employment Agency License',
      renewalDate: '2025-09-15',
      bondAmount: '$25,000',
      details: 'Required due to BIPA biometric data collection'
    },
    {
      state: 'Kentucky',
      required: false,
      status: 'n/a',
      licenseType: 'No specific licensing required',
      renewalDate: 'N/A',
      bondAmount: 'N/A',
      details: 'Kentucky does not require staffing agency licensing'
    },
    {
      state: 'Tennessee',
      required: true,
      status: 'pending',
      licenseType: 'Employment Agency License',
      renewalDate: '2025-03-31',
      bondAmount: '$10,000',
      details: 'Application in progress for Tennessee operations'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'n/a': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <AlertTriangle className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link 
            href="/compliance"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Compliance
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Award className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Licensing & Registration</h1>
              <p className="text-slate-400">State-specific staffing agency licensing and bonding requirements</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">4</div>
              <div className="text-sm text-green-300">Licensed States</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">$50K</div>
              <div className="text-sm text-blue-300">Total Bond Coverage</div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">6</div>
              <div className="text-sm text-purple-300">Operating States</div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">1</div>
              <div className="text-sm text-yellow-300">Pending Application</div>
            </div>
          </div>
        </motion.div>

        {/* State Licensing Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-400" />
            State-by-State Licensing Status
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stateRequirements.map((state, index) => (
              <motion.div
                key={state.state}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border ${getStatusColor(state.status)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{state.state}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(state.status)}
                    <span className="text-sm capitalize">{state.status.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">License Type:</span>
                    <span className="text-white">{state.licenseType}</span>
                  </div>
                  
                  {state.renewalDate !== 'N/A' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Renewal Date:</span>
                      <span className="text-white">{state.renewalDate}</span>
                    </div>
                  )}
                  
                  {state.bondAmount !== 'N/A' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bond Amount:</span>
                      <span className="text-white">{state.bondAmount}</span>
                    </div>
                  )}
                  
                  <p className="text-slate-300 text-xs mt-3 italic">{state.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insurance Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Insurance & Liability Coverage
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">🏥 Required Coverage</h3>
                <ul className="text-blue-200 space-y-2 text-sm">
                  <li>• <strong>Workers' Compensation:</strong> $2M per occurrence, all states</li>
                  <li>• <strong>General Liability:</strong> $2M per occurrence, $4M aggregate</li>
                  <li>• <strong>Professional Liability:</strong> $1M per claim, $3M aggregate</li>
                  <li>• <strong>Employment Practices:</strong> $1M per claim (EPLI)</li>
                  <li>• <strong>Cyber Liability:</strong> $5M for data breaches and cyber attacks</li>
                </ul>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-3">💼 Additional Coverage</h3>
                <ul className="text-green-200 space-y-2 text-sm">
                  <li>• <strong>Errors & Omissions:</strong> $1M for placement mistakes</li>
                  <li>• <strong>Fidelity Bond:</strong> $100K for employee dishonesty</li>
                  <li>• <strong>Auto Liability:</strong> $1M for business vehicle use</li>
                  <li>• <strong>Umbrella Policy:</strong> $10M excess coverage</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">⚖️ Joint Employment Protection</h3>
                <ul className="text-purple-200 space-y-2 text-sm">
                  <li>• <strong>Shared FMLA Liability:</strong> Coverage for family leave obligations</li>
                  <li>• <strong>Wage & Hour Claims:</strong> Protection against overtime disputes</li>
                  <li>• <strong>Discrimination Claims:</strong> Coverage for EEO violations</li>
                  <li>• <strong>Client Indemnification:</strong> Protection for client liability</li>
                </ul>
              </div>
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">🔐 Biometric-Specific Coverage</h3>
                <ul className="text-orange-200 space-y-2 text-sm">
                  <li>• <strong>BIPA Violation Claims:</strong> $5M coverage for biometric privacy violations</li>
                  <li>• <strong>Data Breach Response:</strong> $2M for breach notification and remediation</li>
                  <li>• <strong>Privacy Law Violations:</strong> Coverage for GDPR, CCPA fines</li>
                  <li>• <strong>Technology E&O:</strong> Coverage for biometric system failures</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Worker Classification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Worker Classification Compliance
          </h2>
          
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ ABC Test Compliance</h3>
              <p className="text-yellow-200 text-sm mb-4">
                For states using the ABC Test (California, Massachusetts, New Jersey), all three criteria must be met for independent contractor classification:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">A - Control</h4>
                  <p className="text-yellow-200 text-xs">
                    Worker is free from control and direction in performing work, 
                    both under contract and in fact.
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">B - Business</h4>
                  <p className="text-yellow-200 text-xs">
                    Work performed is outside the usual course of the hiring entity's business.
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">C - Custom</h4>
                  <p className="text-yellow-200 text-xs">
                    Worker is customarily engaged in an independently established trade, 
                    occupation, or business.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">📋 Humber Operations Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">W-2 Employees (Recommended)</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• All engineers classified as W-2 employees</li>
                    <li>• Full benefits and workers' compensation coverage</li>
                    <li>• Payroll taxes handled by Humber Operations</li>
                    <li>• FLSA overtime protection provided</li>
                    <li>• Reduced misclassification risk</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">1099 Contractors (Limited Use)</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Only for specialized consulting projects</li>
                    <li>• Must meet strict ABC test criteria</li>
                    <li>• Independent business entity required</li>
                    <li>• No direct client supervision</li>
                    <li>• Quarterly classification review required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
