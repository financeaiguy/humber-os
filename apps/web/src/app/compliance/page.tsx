'use client'
export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, AlertTriangle, CheckCircle, Clock, Users, Database, Scale } from 'lucide-react'

export default function CompliancePage() {
  const complianceItems = [
    {
      category: 'Biometric Privacy Laws',
      items: [
        { law: 'Illinois BIPA', status: 'compliant', description: 'Biometric Information Privacy Act compliance' },
        { law: 'Texas CUBI', status: 'compliant', description: 'Capture or Use of Biometric Identifier Act' },
        { law: 'California CCPA', status: 'compliant', description: 'Consumer privacy rights for biometric data' },
        { law: 'GDPR Article 9', status: 'compliant', description: 'Special category data protections' }
      ]
    },
    {
      category: 'Labor & Employment Laws',
      items: [
        { law: 'FLSA', status: 'compliant', description: 'Fair Labor Standards Act time tracking' },
        { law: 'State Labor Laws', status: 'compliant', description: 'Michigan, Ohio, Indiana employment laws' },
        { law: 'OSHA Standards', status: 'compliant', description: 'Occupational safety and health compliance' },
        { law: 'Workers Compensation', status: 'compliant', description: 'Insurance and safety requirements' }
      ]
    },
    {
      category: 'Financial & Audit',
      items: [
        { law: 'SOX Compliance', status: 'compliant', description: 'Sarbanes-Oxley financial reporting' },
        { law: 'IRS Requirements', status: 'compliant', description: 'Tax reporting and payroll compliance' },
        { law: 'State Tax Laws', status: 'compliant', description: 'Multi-state tax withholding' },
        { law: 'GAAP Standards', status: 'compliant', description: 'Generally Accepted Accounting Principles' }
      ]
    },
    {
      category: 'Industry Specific',
      items: [
        { law: 'ITAR', status: 'compliant', description: 'International Traffic in Arms Regulations' },
        { law: 'EAR', status: 'compliant', description: 'Export Administration Regulations' },
        { law: 'Automotive Security', status: 'compliant', description: 'Client-specific security requirements' },
        { law: 'ISO 27001', status: 'in-progress', description: 'Information security management' }
      ]
    },
    {
      category: 'Background Checks',
      items: [
        { law: 'FCRA', status: 'compliant', description: 'Fair Credit Reporting Act compliance' },
        { law: 'State Background Laws', status: 'compliant', description: 'Multi-state background check laws' },
        { law: 'Drug Testing Laws', status: 'compliant', description: 'DOT and state drug testing requirements' },
        { law: 'Ban the Box', status: 'compliant', description: 'Fair chance employment practices' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'needs-attention': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'needs-attention': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
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
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Scale className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Legal Compliance Dashboard</h1>
              <p className="text-slate-400">Comprehensive legal and regulatory compliance overview</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">98%</div>
              <div className="text-sm text-green-300">Compliance Score</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">23</div>
              <div className="text-sm text-blue-300">Laws & Regulations</div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-purple-300">Active Violations</div>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">1</div>
              <div className="text-sm text-orange-300">In Progress</div>
            </div>
          </div>
        </motion.div>

        {/* Compliance Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {complianceItems.map((category, categoryIndex) => (
            <div key={category.category} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                {category.category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.law}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: categoryIndex * 0.1 + itemIndex * 0.05 }}
                    className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{item.law}</h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        <span className="text-xs capitalize">{item.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">🚀 Compliance Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/biometric-consent" className="group">
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors">
                <FileText className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Biometric Consent</h3>
                <p className="text-blue-200 text-sm">Manage biometric data consent and rights</p>
              </div>
            </Link>
            
            <Link href="/dpia" className="group">
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors">
                <Database className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">DPIA Report</h3>
                <p className="text-green-200 text-sm">Data Protection Impact Assessment</p>
              </div>
            </Link>
            
            <Link href="/legal-contact" className="group">
              <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors">
                <Users className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Legal Contact</h3>
                <p className="text-purple-200 text-sm">Contact legal and privacy officers</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
