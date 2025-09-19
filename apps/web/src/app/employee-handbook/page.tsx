'use client'

// export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Book, Clock, Shield, Users, AlertTriangle, CheckCircle, FileText, Phone } from 'lucide-react'

export default function EmployeeHandbookPage() {
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
              <Book className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Employee Handbook</h1>
              <p className="text-slate-400">Policies, procedures, and your rights as a Humber Operations employee</p>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Version:</strong> 2025.1 • 
              <strong>Effective Date:</strong> January 1, 2025 • 
              <strong>Next Review:</strong> January 1, 2026
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Time Tracking Policies */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-400" />
              Time Tracking Policies
            </h2>
            
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Required Procedures</h3>
                <ul className="text-green-200 space-y-2 text-sm">
                  <li>• <strong>Clock In/Out:</strong> Must use biometric verification at start and end of each work period</li>
                  <li>• <strong>Break Tracking:</strong> Clock out for breaks longer than 15 minutes</li>
                  <li>• <strong>Location Verification:</strong> Must be within approved work site boundaries</li>
                  <li>• <strong>Device Registration:</strong> Personal devices must be registered for mobile access</li>
                  <li>• <strong>Accuracy Requirement:</strong> All time entries must be accurate to the minute</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">❌ Prohibited Activities</h3>
                <ul className="text-red-200 space-y-2 text-sm">
                  <li>• <strong>Buddy Punching:</strong> Clocking in/out for another employee (immediate termination)</li>
                  <li>• <strong>Time Fraud:</strong> Falsifying work hours or location (immediate termination)</li>
                  <li>• <strong>System Manipulation:</strong> Attempting to bypass security measures (immediate termination)</li>
                  <li>• <strong>Sharing Credentials:</strong> Sharing biometric data or device access (immediate termination)</li>
                  <li>• <strong>Off-Site Work:</strong> Working from unapproved locations without authorization</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">🔧 Technical Requirements</h3>
                <ul className="text-blue-200 space-y-2 text-sm">
                  <li>• <strong>Mobile App:</strong> Latest version of Humber Operations mobile app required</li>
                  <li>• <strong>Biometric Setup:</strong> Complete biometric enrollment within 3 days of hire</li>
                  <li>• <strong>Device Security:</strong> Devices must have lock screen and be virus-free</li>
                  <li>• <strong>Network Access:</strong> Use secure Wi-Fi or cellular data only</li>
                  <li>• <strong>Software Updates:</strong> Keep app updated to latest security patches</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Workplace Policies */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Workplace Conduct & Safety
            </h2>
            
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🏭 Client Site Conduct</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Professional Appearance:</strong> Business casual attire, safety equipment as required</li>
                  <li>• <strong>Confidentiality:</strong> Strict protection of client intellectual property and trade secrets</li>
                  <li>• <strong>Safety Compliance:</strong> Follow all OSHA and client-specific safety protocols</li>
                  <li>• <strong>Communication:</strong> Professional communication with client personnel at all times</li>
                  <li>• <strong>Documentation:</strong> Accurate project documentation and progress reporting</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🚫 Zero Tolerance Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>Harassment:</strong> Sexual, racial, or any form of harassment</li>
                    <li>• <strong>Discrimination:</strong> Based on protected characteristics</li>
                    <li>• <strong>Violence:</strong> Physical or verbal threats</li>
                    <li>• <strong>Substance Abuse:</strong> Drugs or alcohol on work sites</li>
                  </ul>
                  
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>Data Theft:</strong> Unauthorized data access or sharing</li>
                    <li>• <strong>Fraud:</strong> Time, expense, or credential fraud</li>
                    <li>• <strong>Safety Violations:</strong> Willful disregard for safety protocols</li>
                    <li>• <strong>Client Poaching:</strong> Soliciting client employees or contracts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits & Rights */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Employee Benefits & Rights
            </h2>
            
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-3">💼 Compensation & Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">💰 Pay Structure</h4>
                    <ul className="text-green-200 text-sm space-y-1">
                      <li>• <strong>Hourly Rates:</strong> $75-95/hour based on category</li>
                      <li>• <strong>Overtime:</strong> 1.5x rate for hours over 40/week</li>
                      <li>• <strong>Travel Time:</strong> Paid at regular rate</li>
                      <li>• <strong>On-Call:</strong> $25/hour standby rate</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">🏥 Benefits Package</h4>
                    <ul className="text-green-200 text-sm space-y-1">
                      <li>• <strong>Health Insurance:</strong> 90% company paid</li>
                      <li>• <strong>401k Match:</strong> 6% company match</li>
                      <li>• <strong>PTO:</strong> 3 weeks vacation, 1 week sick</li>
                      <li>• <strong>Training:</strong> $2,000 annual education budget</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">⚖️ Legal Rights</h3>
                <ul className="text-blue-200 space-y-2 text-sm">
                  <li>• <strong>Privacy Rights:</strong> Control over personal and biometric data</li>
                  <li>• <strong>Whistleblower Protection:</strong> Safe reporting of legal violations</li>
                  <li>• <strong>Equal Opportunity:</strong> Fair treatment regardless of protected characteristics</li>
                  <li>• <strong>Workers' Compensation:</strong> Coverage for work-related injuries</li>
                  <li>• <strong>Family Leave:</strong> FMLA and state family leave protections</li>
                  <li>• <strong>Reasonable Accommodations:</strong> Disability and religious accommodations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reporting & Grievances */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6 text-red-400" />
              Reporting Procedures
            </h2>
            
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 Emergency Reporting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Immediate Dangers</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• <strong>Safety Emergencies:</strong> Call 911 first, then notify supervisor</li>
                      <li>• <strong>Security Breaches:</strong> security@example.com (24/7)</li>
                      <li>• <strong>Violence/Threats:</strong> Call 911 and HR immediately</li>
                      <li>• <strong>Data Breaches:</strong> privacy@example.com within 1 hour</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">24/7 Hotlines</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• <strong>Emergency Line:</strong> 1-800-HUMBER-1</li>
                      <li>• <strong>Anonymous Tip Line:</strong> 1-800-ETHICS-1</li>
                      <li>• <strong>HR After Hours:</strong> hr-emergency@example.com</li>
                      <li>• <strong>Legal Emergencies:</strong> legal-emergency@example.com</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Non-Emergency Reporting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">HR Issues</h4>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• <strong>Workplace Conflicts:</strong> hr@example.com</li>
                      <li>• <strong>Benefits Questions:</strong> benefits@example.com</li>
                      <li>• <strong>Payroll Issues:</strong> payroll@example.com</li>
                      <li>• <strong>Performance Concerns:</strong> Direct supervisor first</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Technical Support</h4>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• <strong>App Issues:</strong> support@example.com</li>
                      <li>• <strong>Biometric Problems:</strong> biometric@example.com</li>
                      <li>• <strong>System Access:</strong> it-support@example.com</li>
                      <li>• <strong>Training Requests:</strong> training@example.com</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">🛡️ Whistleblower Protection</h3>
                <div className="space-y-3">
                  <p className="text-purple-200 text-sm">
                    Humber Operations prohibits retaliation against employees who report suspected violations 
                    of law, regulations, or company policies in good faith.
                  </p>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Protected Reporting</h4>
                    <ul className="text-purple-200 text-sm space-y-1">
                      <li>• Anonymous reporting available through ethics hotline</li>
                      <li>• Identity protection for all good faith reporters</li>
                      <li>• Investigation within 30 days of report</li>
                      <li>• Corrective action taken when violations confirmed</li>
                      <li>• Legal protection under federal and state whistleblower laws</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Rights */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Privacy Rights & Data Protection
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">🔐 Your Privacy Rights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-blue-200 space-y-2 text-sm">
                    <li>• <strong>Biometric Consent:</strong> Voluntary consent for biometric data collection</li>
                    <li>• <strong>Data Access:</strong> View all personal data we have about you</li>
                    <li>• <strong>Data Correction:</strong> Update incorrect personal information</li>
                    <li>• <strong>Data Deletion:</strong> Request deletion (subject to legal retention)</li>
                  </ul>
                  
                  <ul className="text-blue-200 space-y-2 text-sm">
                    <li>• <strong>Processing Objection:</strong> Object to certain data processing</li>
                    <li>• <strong>Data Portability:</strong> Receive your data in portable format</li>
                    <li>• <strong>Automated Decisions:</strong> Right to human review of AI decisions</li>
                    <li>• <strong>Breach Notification:</strong> Immediate notification of data breaches</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">📱 Technology Use Policy</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Personal Devices:</strong> May be used for work with proper security measures</li>
                  <li>• <strong>Company Equipment:</strong> Business use only, monitoring may occur</li>
                  <li>• <strong>Social Media:</strong> Professional conduct when identifying as Humber employee</li>
                  <li>• <strong>Data Security:</strong> Protect all company and client data</li>
                  <li>• <strong>Software Installation:</strong> Only approved software on company devices</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Disciplinary Procedures */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Disciplinary Procedures
            </h2>
            
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">📋 Progressive Discipline Policy</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Step 1: Verbal Warning</h4>
                    <p className="text-orange-200 text-sm">
                      For minor policy violations, attendance issues, or performance concerns. 
                      Documented in employee file with improvement plan.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Step 2: Written Warning</h4>
                    <p className="text-orange-200 text-sm">
                      For repeated violations or more serious misconduct. 
                      Formal documentation with specific improvement requirements and timeline.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Step 3: Final Warning</h4>
                    <p className="text-orange-200 text-sm">
                      Last chance before termination. May include suspension without pay, 
                      mandatory training, or performance improvement plan.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Step 4: Termination</h4>
                    <p className="text-orange-200 text-sm">
                      For continued violations, serious misconduct, or failure to meet improvement requirements. 
                      Some violations (fraud, violence, illegal activity) result in immediate termination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Disclaimers */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-400" />
              Important Legal Notices
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2">⚠️ At-Will Employment</h3>
                <p className="text-red-200 text-sm">
                  Employment with Humber Operations is at-will, meaning either party may terminate 
                  the employment relationship at any time, with or without cause, and with or without notice, 
                  subject to applicable laws and contractual obligations.
                </p>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-400 mb-2">📋 Equal Opportunity</h3>
                <p className="text-yellow-200 text-sm">
                  Humber Operations is an equal opportunity employer committed to providing a workplace 
                  free from discrimination and harassment based on race, color, religion, sex, national origin, 
                  age, disability, sexual orientation, gender identity, veteran status, or any other protected characteristic.
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">🔄 Handbook Updates</h3>
                <p className="text-blue-200 text-sm">
                  This handbook may be updated periodically to reflect changes in laws, regulations, 
                  or company policies. Employees will be notified of significant changes via email 
                  and updated versions will be available in the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Employee Acknowledgment</h3>
            <p className="text-green-200 text-sm mb-4">
              By using the Humber Operations platform, you acknowledge that you have received, 
              read, and understand this Employee Handbook and agree to comply with all policies and procedures.
            </p>
            
            <div className="flex justify-center gap-4">
              <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                I Acknowledge and Agree
              </button>
              <Link href="/legal-contact" className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors">
                I Have Questions
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
