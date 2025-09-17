'use client'
export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Clock, Shield, FileText, AlertTriangle } from 'lucide-react'

export default function LegalContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
              <Phone className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Legal Contact</h1>
              <p className="text-slate-400">Get help with legal, privacy, and compliance matters</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Legal Department */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Legal Department</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href="mailto:legal@humberops.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                  legal@humberops.com
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href="tel:+18004862371" className="text-blue-400 hover:text-blue-300 transition-colors">
                  1-800-HUMBER-1 (1-800-486-2371)
                </a>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <div className="text-slate-300">
                  <p>Humber Operations LLC</p>
                  <p>Legal Department</p>
                  <p>1234 Automotive Drive</p>
                  <p>Detroit, MI 48201</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Officer */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Privacy Officer</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href="mailto:privacy@humberops.com" className="text-green-400 hover:text-green-300 transition-colors">
                  privacy@humberops.com
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Same number, ask for Privacy Officer</span>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-1" />
                <div className="text-slate-300">
                  <p><strong>Response Time:</strong></p>
                  <p>Privacy requests: 48 hours</p>
                  <p>Data deletion: 30 days</p>
                  <p>General inquiries: 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Common Legal Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">🤔 Common Legal Questions</h2>
          
          <div className="space-y-6">
            {/* Biometric Privacy */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Biometric Data Privacy
              </h3>
              <div className="space-y-3 text-slate-300 text-sm">
                <p><strong>Q: Is my fingerprint/face data secure?</strong></p>
                <p>A: Yes. We only store encrypted mathematical templates, never actual biometric images. 
                   Processing happens on your device, and templates are immediately encrypted using AES-256.</p>
                
                <p><strong>Q: Can I opt out of biometric tracking?</strong></p>
                <p>A: Biometric verification is required for time tracking to prevent fraud and ensure accurate client billing. 
                   Alternative employment arrangements may be available - contact HR.</p>
              </div>
            </div>

            {/* Time Tracking Legal */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Time Tracking & Labor Law
              </h3>
              <div className="space-y-3 text-slate-300 text-sm">
                <p><strong>Q: Why is location tracking required?</strong></p>
                <p>A: Location verification ensures accurate billing to clients and compliance with work site safety requirements. 
                   It protects both you and the company from billing disputes.</p>
                
                <p><strong>Q: What if there's a time discrepancy?</strong></p>
                <p>A: All discrepancies are investigated within 48 hours. You'll receive notification and can provide 
                   additional information. Final decisions follow FLSA guidelines.</p>
              </div>
            </div>

            {/* Data Rights */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Your Data Rights (GDPR/CCPA)
              </h3>
              <div className="space-y-3 text-slate-300 text-sm">
                <p><strong>Q: Can I see all data you have about me?</strong></p>
                <p>A: Yes. Request a complete data export through your profile settings or email privacy@humberops.com. 
                   We'll provide it within 30 days in machine-readable format.</p>
                
                <p><strong>Q: Can I delete my account and data?</strong></p>
                <p>A: Yes, with some limitations. Payroll and tax records must be retained for 7 years per IRS requirements. 
                   All other data can be deleted upon request.</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Emergency Legal Issues</h3>
            </div>
            <p className="text-red-200 text-sm mb-3">
              For urgent legal matters, security breaches, or compliance violations:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="tel:+18004862371" 
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call: 1-800-HUMBER-1 (24/7)
              </a>
              <a 
                href="mailto:emergency@humberops.com" 
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email: emergency@humberops.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
