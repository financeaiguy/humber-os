'use client'
// export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Users, Scale, AlertTriangle, CheckCircle, Clock, Shield, FileText } from 'lucide-react'

export default function JointEmploymentPage() {
  const jointEmploymentFactors = [
    {
      factor: 'Supervision and Control',
      humberRole: 'Recruitment, placement, payroll, performance management',
      clientRole: 'Day-to-day work direction, task assignment, safety oversight',
      riskLevel: 'High',
      mitigation: 'Clear contract delineation of supervisory responsibilities'
    },
    {
      factor: 'Payment and Benefits',
      humberRole: 'Salary, benefits, workers comp, payroll taxes',
      clientRole: 'Project bonuses, overtime approval, expense reimbursement',
      riskLevel: 'Medium',
      mitigation: 'All compensation flows through Humber Operations'
    },
    {
      factor: 'Hiring and Firing',
      humberRole: 'Recruitment, screening, hiring decisions, termination',
      clientRole: 'Project assignment, performance feedback, removal requests',
      riskLevel: 'High',
      mitigation: 'Humber retains final hiring/firing authority'
    },
    {
      factor: 'Training and Development',
      humberRole: 'Safety training, compliance training, skill development',
      clientRole: 'Job-specific training, equipment operation, procedures',
      riskLevel: 'Low',
      mitigation: 'Documented training responsibility matrix'
    }
  ]

  const liabilityAreas = [
    {
      area: 'FMLA Obligations',
      description: 'Family and Medical Leave Act responsibilities',
      humberLiability: 'Track FMLA eligibility, provide leave administration',
      clientLiability: 'Maintain job protection, coordinate with Humber on leave',
      protection: 'Joint FMLA policy with clear responsibility allocation'
    },
    {
      area: 'Wage & Hour Claims',
      description: 'FLSA overtime and minimum wage compliance',
      humberLiability: 'Accurate time tracking, overtime calculation, payroll',
      clientLiability: 'Work schedule approval, overtime authorization',
      protection: 'Biometric time tracking with client approval workflows'
    },
    {
      area: 'Discrimination Claims',
      description: 'Equal Employment Opportunity violations',
      humberLiability: 'Non-discriminatory hiring, placement policies',
      clientLiability: 'Equal treatment at work site, harassment prevention',
      protection: 'Joint EEO training and incident reporting procedures'
    },
    {
      area: 'Safety and Workers Comp',
      description: 'Workplace injury and safety compliance',
      humberLiability: 'Workers comp coverage, safety training, incident reporting',
      clientLiability: 'Safe work environment, OSHA compliance, hazard communication',
      protection: 'Comprehensive safety protocols and insurance coverage'
    }
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
              <Scale className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Joint Employment Liability</h1>
              <p className="text-slate-400">Managing shared employment responsibilities with automotive clients</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-yellow-200 text-sm">
                  <strong>Joint Employment Risk:</strong> When Humber Operations and automotive clients 
                  (GM, Ford, Stellantis, HIROTEC) both exercise control over engineers, both entities 
                  may be liable for employment law violations.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Joint Employment Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Joint Employment Factor Analysis
          </h2>
          
          <div className="space-y-6">
            {jointEmploymentFactors.map((factor, index) => (
              <motion.div
                key={factor.factor}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-700/30 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{factor.factor}</h3>
                  <div className={`px-3 py-1 rounded-full border text-xs ${getRiskColor(factor.riskLevel)}`}>
                    {factor.riskLevel} Risk
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Humber Operations Role</h4>
                    <p className="text-slate-300 text-sm">{factor.humberRole}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">Client Company Role</h4>
                    <p className="text-slate-300 text-sm">{factor.clientRole}</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">Risk Mitigation Strategy</h4>
                  <p className="text-purple-200 text-sm">{factor.mitigation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Liability Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            Shared Liability Management
          </h2>
          
          <div className="space-y-6">
            {liabilityAreas.map((area, index) => (
              <div key={area.area} className="bg-slate-700/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{area.area}</h3>
                </div>
                
                <p className="text-slate-400 text-sm mb-4">{area.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">Humber Operations Responsibilities</h4>
                    <p className="text-blue-200 text-sm">{area.humberLiability}</p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">Client Company Responsibilities</h4>
                    <p className="text-green-200 text-sm">{area.clientLiability}</p>
                  </div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">🛡️ Protection Strategy</h4>
                  <p className="text-purple-200 text-sm">{area.protection}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contract Protections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-400" />
            Contractual Protections
          </h2>
          
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">📋 Standard Contract Clauses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-green-200 space-y-2 text-sm">
                  <li>• <strong>Indemnification:</strong> Client indemnifies Humber for workplace injuries</li>
                  <li>• <strong>Insurance Requirements:</strong> Client maintains minimum $2M liability coverage</li>
                  <li>• <strong>Safety Compliance:</strong> Client warrants OSHA-compliant workplace</li>
                  <li>• <strong>Supervision Limits:</strong> Clear boundaries on client supervisory authority</li>
                </ul>
                
                <ul className="text-green-200 space-y-2 text-sm">
                  <li>• <strong>Wage & Hour:</strong> Client pre-approves all overtime and schedule changes</li>
                  <li>• <strong>Discrimination:</strong> Joint commitment to EEO compliance</li>
                  <li>• <strong>Termination:</strong> Humber retains sole termination authority</li>
                  <li>• <strong>Data Protection:</strong> Client protects engineer personal information</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">⚖️ Dispute Resolution Framework</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-white">Direct Resolution (30 days)</h4>
                    <p className="text-blue-200 text-sm">Humber and client work directly to resolve employment disputes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-white">Mediation (60 days)</h4>
                    <p className="text-green-200 text-sm">Neutral third-party mediation for complex disputes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-white">Arbitration (90 days)</h4>
                    <p className="text-purple-200 text-sm">Binding arbitration for unresolved liability issues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
