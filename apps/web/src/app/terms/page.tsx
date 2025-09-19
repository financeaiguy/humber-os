'use client'
// export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, FileText, Users, Clock, Shield, DollarSign, AlertTriangle, CheckCircle, Scale } from 'lucide-react'

export default function TermsOfServicePage() {
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
              <Scale className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Terms & Conditions</h1>
              <p className="text-slate-400">Your agreement to use Humber Operations</p>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Last Updated:</strong> September 15, 2025 • 
              <strong>Effective Date:</strong> September 15, 2025
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Agreement Overview
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              These Terms & Conditions govern your use of the Humber Operations platform for engineering staffing, 
              time tracking, document management, and related services in the automotive manufacturing industry.
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-200 text-sm">
                <strong>By using our platform, you agree to these terms.</strong> If you don't agree, please don't use our services.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-green-400" />
              Our Services
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🏭 Engineering Staffing Services</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Engineer Recruitment:</strong> Sourcing qualified automotive engineers (Controls, Mechanical, Electrical, Piping, Robotics)</li>
                  <li>• <strong>Vetting & Background Checks:</strong> Comprehensive screening including drug tests and security clearance</li>
                  <li>• <strong>Client Deployment:</strong> Matching engineers to automotive client projects (GM, Ford, Stellantis, HIROTEC)</li>
                  <li>• <strong>Performance Management:</strong> Ongoing evaluation and career development</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">⏰ Time Tracking & Verification</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Biometric Time Tracking:</strong> Secure clock in/out using fingerprint, face, or voice recognition</li>
                  <li>• <strong>Geolocation Verification:</strong> GPS-based work site verification and geofencing</li>
                  <li>• <strong>3-Layer Trust System:</strong> Biometric (40%) + Location (35%) + Device (25%) verification</li>
                  <li>• <strong>Automated Reconciliation:</strong> Comparing engineer-reported vs client-verified hours</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🤖 AI & Document Management</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>RAG Knowledge Base:</strong> AI-powered document analysis and question answering</li>
                  <li>• <strong>Professional Chat Assistant:</strong> Intelligent help with company policies and procedures</li>
                  <li>• <strong>Automated Reporting:</strong> PDF generation for timesheets, performance, and financial analysis</li>
                  <li>• <strong>Multi-Channel Notifications:</strong> Email and SMS alerts for critical events</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Your Responsibilities
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">⚙️ For Engineers</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Accurately track all work hours using biometric verification</li>
                  <li>• Clock in/out only from approved work sites</li>
                  <li>• Maintain professional conduct at client locations</li>
                  <li>• Report safety incidents and compliance violations immediately</li>
                  <li>• Keep personal information and emergency contacts current</li>
                  <li>• Protect client confidential information and trade secrets</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">👥 For Managers</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Review and approve timesheet submissions promptly</li>
                  <li>• Investigate and resolve time discrepancies within 48 hours</li>
                  <li>• Ensure engineers meet client requirements and deadlines</li>
                  <li>• Maintain accurate project documentation and SOPs</li>
                  <li>• Report compliance violations to legal department</li>
                  <li>• Provide accurate performance evaluations</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🏢 For Clients</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Verify engineer work hours accurately and promptly</li>
                  <li>• Provide safe working environments meeting OSHA standards</li>
                  <li>• Pay invoices according to agreed terms (typically NET 30)</li>
                  <li>• Maintain confidentiality of Humber Operations processes</li>
                  <li>• Report engineer performance issues constructively</li>
                  <li>• Comply with automotive industry security requirements</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔧 For All Users</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Use the platform only for legitimate business purposes</li>
                  <li>• Maintain the security of your login credentials</li>
                  <li>• Report security vulnerabilities responsibly</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Follow all applicable laws and regulations</li>
                  <li>• Use AI chat assistant responsibly and professionally</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Prohibited Activities
            </h2>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <p className="text-red-200 mb-4"><strong>The following activities are strictly prohibited:</strong></p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-red-200 space-y-2 text-sm">
                  <li>• <strong>Time Fraud:</strong> False time reporting, buddy punching, location spoofing</li>
                  <li>• <strong>Security Violations:</strong> Sharing credentials, bypassing biometric verification</li>
                  <li>• <strong>Data Misuse:</strong> Unauthorized access, data theft, privacy violations</li>
                  <li>• <strong>System Abuse:</strong> Overloading servers, automated attacks, reverse engineering</li>
                </ul>
                
                <ul className="text-red-200 space-y-2 text-sm">
                  <li>• <strong>Compliance Violations:</strong> Ignoring safety protocols, regulatory violations</li>
                  <li>• <strong>Intellectual Property:</strong> Copying software, stealing trade secrets</li>
                  <li>• <strong>Harassment:</strong> Inappropriate behavior, discrimination, hostile communication</li>
                  <li>• <strong>Commercial Misuse:</strong> Competing services, client poaching, unauthorized solicitation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Payment & Billing Terms
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">💰 For Clients (Automotive Companies)</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Billing Cycle:</strong> Weekly invoicing based on verified time tracking data</li>
                  <li>• <strong>Payment Terms:</strong> NET 30 days from invoice date</li>
                  <li>• <strong>Hourly Rates:</strong> $75-$95/hour based on engineer category and experience</li>
                  <li>• <strong>Overtime:</strong> 1.5x rate for hours over 40 per week</li>
                  <li>• <strong>Late Fees:</strong> 1.5% per month on overdue amounts</li>
                  <li>• <strong>Disputed Hours:</strong> Must be reported within 7 days of invoice</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">👷 For Engineers</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Payroll:</strong> Bi-weekly direct deposit based on verified hours</li>
                  <li>• <strong>Time Accuracy:</strong> Must clock in/out accurately with biometric verification</li>
                  <li>• <strong>Expense Reimbursement:</strong> Pre-approved travel and equipment costs</li>
                  <li>• <strong>Benefits:</strong> Health insurance, 401k matching after 90 days</li>
                  <li>• <strong>Performance Bonuses:</strong> Based on client satisfaction and project completion</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-400" />
              Service Availability & Support
            </h2>
            
            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">🕒 Platform Availability</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>Uptime Target:</strong> 99.9% availability (8.76 hours downtime per year)</li>
                    <li>• <strong>Maintenance Windows:</strong> Sundays 2-4 AM EST (announced 48 hours prior)</li>
                    <li>• <strong>Emergency Maintenance:</strong> May occur with minimal notice for security issues</li>
                    <li>• <strong>Mobile Access:</strong> Available 24/7 for time tracking and emergency access</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-3">🆘 Support Services</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>Business Hours:</strong> Monday-Friday 6 AM - 8 PM EST</li>
                    <li>• <strong>Emergency Support:</strong> 24/7 for critical time tracking issues</li>
                    <li>• <strong>Response Times:</strong> Critical (1 hour), High (4 hours), Normal (24 hours)</li>
                    <li>• <strong>AI Chat Assistant:</strong> Available 24/7 for immediate help</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security & Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              Security & Compliance Requirements
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2">🚨 Critical Security Requirements</h3>
                <ul className="text-red-200 text-sm space-y-1">
                  <li>• Biometric verification is mandatory for all time tracking</li>
                  <li>• Location verification required for work site compliance</li>
                  <li>• Device registration and trust verification enforced</li>
                  <li>• All actions logged for audit and compliance purposes</li>
                </ul>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">📋 Regulatory Compliance</h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• <strong>FLSA:</strong> Fair Labor Standards Act compliance for accurate time tracking</li>
                  <li>• <strong>SOX:</strong> Sarbanes-Oxley financial reporting and audit requirements</li>
                  <li>• <strong>OSHA:</strong> Occupational safety and health standards</li>
                  <li>• <strong>ITAR:</strong> International Traffic in Arms Regulations (for defense contractors)</li>
                  <li>• <strong>GDPR/CCPA:</strong> Data protection and privacy regulations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🧠 Intellectual Property</h2>
            
            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">🏢 Humber Operations IP</h3>
                  <p className="text-slate-300 text-sm mb-2">
                    The platform, including software, algorithms, AI models, and documentation, is proprietary to Humber Operations.
                  </p>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• 3-layer trust verification system and algorithms</li>
                    <li>• RAG-powered AI chat and document analysis</li>
                    <li>• Automated report generation and scheduling</li>
                    <li>• Multi-tenant architecture and security systems</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">🏭 Client IP Protection</h3>
                  <p className="text-slate-300 text-sm">
                    Engineers and staff must protect automotive client intellectual property including:
                    manufacturing processes, design specifications, quality standards, and proprietary technologies.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">⚖️ Limitation of Liability</h2>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-400 mb-3">📋 Service Limitations</h3>
              <ul className="text-yellow-200 space-y-2 text-sm">
                <li>• <strong>Platform Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>• <strong>Data Accuracy:</strong> Users responsible for verifying accuracy of time tracking and personal data</li>
                <li>• <strong>Third-Party Integration:</strong> Not responsible for failures in client systems or third-party services</li>
                <li>• <strong>Force Majeure:</strong> Not liable for delays due to natural disasters, pandemics, or government actions</li>
                <li>• <strong>Maximum Liability:</strong> Limited to fees paid in the 12 months preceding the claim</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🚪 Account Termination</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✅ Voluntary Termination</h3>
                <p className="text-slate-300 text-sm">
                  You may terminate your account anytime with 30 days written notice. 
                  Data will be retained according to legal requirements and then securely deleted.
                </p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">⚠️ Involuntary Termination</h3>
                <p className="text-slate-300 text-sm">
                  We may terminate accounts for violations of these terms, security breaches, 
                  non-payment, or illegal activities. Critical violations result in immediate termination.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🏛️ Governing Law & Disputes</h2>
            
            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">📍 Jurisdiction</h3>
                  <p className="text-slate-300 text-sm">
                    These terms are governed by Michigan state law and federal law of the United States. 
                    Disputes will be resolved in Wayne County, Michigan courts.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">🤝 Dispute Resolution</h3>
                  <p className="text-slate-300 text-sm">
                    We prefer to resolve disputes through direct communication. For formal disputes:
                    1) Contact legal@example.com, 2) 30-day good faith negotiation period, 
                    3) Binding arbitration if needed, 4) Court proceedings as last resort.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">📞 Questions About These Terms</h2>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-300 font-semibold mb-2">Legal Department</p>
                  <p className="text-blue-200">Email: legal@example.com</p>
                  <p className="text-blue-200">Phone: 1-800-HUMBER-1</p>
                  <p className="text-blue-200">Response time: 24 hours</p>
                </div>
                
                <div>
                  <p className="text-blue-300 font-semibold mb-2">Business Address</p>
                  <p className="text-blue-200">Humber Operations LLC</p>
                  <p className="text-blue-200">Legal Department</p>
                  <p className="text-blue-200">1234 Automotive Drive</p>
                  <p className="text-blue-200">Detroit, MI 48201</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-blue-300 font-semibold mb-2">Connect With Us</p>
                <div className="flex items-center gap-4">
                  <a href="https://linkedin.com/company/humber-operations" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                    LinkedIn: @humber-operations
                  </a>
                  <a href="https://twitter.com/humberops" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                    X: @humberops
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Agreement */}
          <section>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Agreement Acknowledgment</h3>
              <p className="text-green-200 text-sm">
                By using the Humber Operations platform, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms & Conditions and our Privacy Policy.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
