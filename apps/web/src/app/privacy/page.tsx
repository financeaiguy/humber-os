'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Clock, FileText, Globe, Phone } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-slate-400">How we protect your information</p>
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
              <Eye className="w-6 h-6 text-blue-400" />
              What This Policy Covers
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Humber Operations provides engineering staffing automation services for automotive manufacturing clients. 
              This Privacy Policy explains how we collect, use, protect, and share information when you use our platform 
              for time tracking, document management, AI assistance, and workforce management.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                <strong>Important:</strong> This policy applies to engineers, managers, clients, and all users of our platform.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-green-400" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Personal & Professional Information
                </h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Basic Details:</strong> Name, email, phone number, date of birth</li>
                  <li>• <strong>Professional Info:</strong> Engineering category, skills, experience, certifications</li>
                  <li>• <strong>Employment Data:</strong> Salary, availability, work locations, visa status</li>
                  <li>• <strong>Emergency Contacts:</strong> Name, relationship, contact information</li>
                  <li>• <strong>Legal Identifiers:</strong> SSN, TIN, passport information (encrypted)</li>
                </ul>
              </div>

              {/* Biometric Data */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Biometric & Security Data
                </h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Biometric Verification:</strong> Fingerprint templates, facial recognition data, voice patterns</li>
                  <li>• <strong>Device Information:</strong> Device ID, hardware fingerprints, security capabilities</li>
                  <li>• <strong>Authentication Tokens:</strong> Encrypted JWT tokens for secure access</li>
                  <li>• <strong>Security Logs:</strong> Login attempts, access patterns, security events</li>
                </ul>
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="text-red-200 text-sm">
                    <strong>Security Note:</strong> Biometric data is processed locally on your device and never stored in raw form. 
                    Only encrypted mathematical templates are retained for verification purposes.
                  </p>
                </div>
              </div>

              {/* Location Data */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  Location & Time Tracking Data
                </h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>GPS Coordinates:</strong> Precise location during clock in/out for work site verification</li>
                  <li>• <strong>Work Hours:</strong> Start time, end time, break duration, total hours worked</li>
                  <li>• <strong>Geofencing Data:</strong> Verification of presence within approved work sites</li>
                  <li>• <strong>Time Zone Information:</strong> For accurate time calculation across locations</li>
                  <li>• <strong>Travel Patterns:</strong> Movement between work sites for deployment optimization</li>
                </ul>
              </div>

              {/* Document Data */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Document & Communication Data
                </h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Uploaded Documents:</strong> SOPs, safety protocols, project specifications, training materials</li>
                  <li>• <strong>Chat Conversations:</strong> AI assistant interactions for knowledge base queries</li>
                  <li>• <strong>Document Processing:</strong> OCR text extraction from uploaded files</li>
                  <li>• <strong>Search Queries:</strong> Document search patterns for system improvement</li>
                  <li>• <strong>Report Generation:</strong> Custom reports and automated scheduling preferences</li>
                </ul>
              </div>

              {/* Usage Analytics */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Usage & Analytics Data
                </h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Platform Usage:</strong> Feature usage patterns, session duration, page views</li>
                  <li>• <strong>Performance Metrics:</strong> Load times, error rates, system responsiveness</li>
                  <li>• <strong>Business Intelligence:</strong> Workflow efficiency, productivity scores</li>
                  <li>• <strong>Audit Logs:</strong> All system actions for compliance and security</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🏭 Core Business Operations</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Engineer recruitment and deployment to client projects</li>
                  <li>• Time tracking and payroll processing</li>
                  <li>• Client billing and revenue management</li>
                  <li>• Performance evaluation and career development</li>
                  <li>• Compliance with labor laws and safety regulations</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔐 Security & Compliance</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Preventing time theft and unauthorized access</li>
                  <li>• Ensuring accurate billing to automotive clients</li>
                  <li>• Meeting legal requirements for time tracking</li>
                  <li>• Maintaining audit trails for compliance</li>
                  <li>• Protecting sensitive automotive industry data</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🤖 AI & Automation</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Document analysis for knowledge base creation</li>
                  <li>• AI-powered engineer-project matching</li>
                  <li>• Automated report generation and scheduling</li>
                  <li>• Predictive analytics for deployment success</li>
                  <li>• Intelligent chat assistance for users</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">📊 Analytics & Improvement</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Platform optimization and user experience</li>
                  <li>• Business intelligence and decision making</li>
                  <li>• Performance monitoring and error detection</li>
                  <li>• Feature usage analysis for product development</li>
                  <li>• Cost optimization and efficiency improvements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🛡️ How We Protect Your Data</h2>
            
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-400 mb-2">🔒 Encryption & Security</h3>
                <p className="text-green-200 text-sm">
                  All sensitive data is encrypted using AES-256 encryption. Biometric data is processed locally and only 
                  encrypted templates are stored. JWT tokens use secure signing algorithms.
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">🏢 Multi-Tenant Isolation</h3>
                <p className="text-blue-200 text-sm">
                  Each client's data is completely isolated using dedicated database instances. 
                  No client can access another client's information - like separate apartments in a building.
                </p>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-purple-400 mb-2">📋 Audit & Compliance</h3>
                <p className="text-purple-200 text-sm">
                  All system actions are logged for compliance with SOX, GDPR, CCPA, and automotive industry regulations. 
                  Regular security audits ensure ongoing protection.
                </p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🤝 When We Share Information</h2>
            
            <div className="bg-slate-700/30 rounded-lg p-6">
              <p className="text-slate-300 mb-4">We only share your information in these specific situations:</p>
              
              <ul className="text-slate-300 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <strong>With Client Companies:</strong> Time tracking data, work performance, and project-related information 
                    are shared with automotive clients (GM, Ford, Stellantis, HIROTEC) for billing and project management.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <strong>With Payroll Services:</strong> Hours worked and payment information for payroll processing 
                    (ADP, QuickBooks integration).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <strong>For Legal Compliance:</strong> Background check data with authorized screening services, 
                    tax information with government agencies, audit data with compliance authorities.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <strong>Emergency Situations:</strong> Contact information with emergency services or 
                    designated emergency contacts when required for safety.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">✋ Your Rights & Choices</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">📖 Access & Review</h3>
                <p className="text-slate-300 text-sm">
                  View all personal data we have about you through your profile settings or by contacting support.
                </p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✏️ Correct & Update</h3>
                <p className="text-slate-300 text-sm">
                  Update your personal information, work preferences, and contact details anytime in your profile.
                </p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">📤 Data Export</h3>
                <p className="text-slate-300 text-sm">
                  Download your data in standard formats (PDF, CSV, JSON) through the reports section.
                </p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">🗑️ Data Deletion</h3>
                <p className="text-slate-300 text-sm">
                  Request data deletion (subject to legal retention requirements for payroll and compliance).
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">⏰ How Long We Keep Your Data</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 text-white">Data Type</th>
                    <th className="text-left py-3 text-white">Retention Period</th>
                    <th className="text-left py-3 text-white">Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700">
                    <td className="py-3">Time tracking records</td>
                    <td className="py-3">7 years</td>
                    <td className="py-3">Tax & labor law requirements</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3">Payroll information</td>
                    <td className="py-3">7 years</td>
                    <td className="py-3">IRS requirements</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3">Background check data</td>
                    <td className="py-3">7 years</td>
                    <td className="py-3">FCRA compliance</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3">Biometric templates</td>
                    <td className="py-3">Until employment ends + 1 year</td>
                    <td className="py-3">Security & fraud prevention</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3">Chat conversations</td>
                    <td className="py-3">2 years</td>
                    <td className="py-3">Training & support improvement</td>
                  </tr>
                  <tr>
                    <td className="py-3">Usage analytics</td>
                    <td className="py-3">1 year</td>
                    <td className="py-3">Product improvement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🔗 Third-Party Services</h2>
            
            <div className="space-y-4">
              <p className="text-slate-300">
                We use the following trusted third-party services to provide our platform:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">☁️ Infrastructure</h3>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• <strong>Cloudflare:</strong> Hosting, security, data storage</li>
                    <li>• <strong>Vercel:</strong> Frontend deployment and CDN</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">📧 Communications</h3>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• <strong>SendGrid:</strong> Email notifications and reports</li>
                    <li>• <strong>Twilio:</strong> SMS alerts and verification</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">🔍 Background Checks</h3>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• <strong>Authorized screening providers</strong> for background verification</li>
                    <li>• <strong>Drug testing laboratories</strong> for safety compliance</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">💼 Business Integration</h3>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• <strong>ADP/QuickBooks:</strong> Payroll processing</li>
                    <li>• <strong>Client systems:</strong> Project management integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6 text-blue-400" />
              Contact Us About Privacy
            </h2>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <p className="text-blue-200 mb-4">
                If you have questions about this Privacy Policy or want to exercise your rights:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-300 font-semibold mb-2">Privacy Officer</p>
                  <p className="text-blue-200">Email: privacy@humberops.com</p>
                  <p className="text-blue-200">Phone: 1-800-HUMBER-1</p>
                  <p className="text-blue-200">Response time: 48 hours</p>
                </div>
                
                <div>
                  <p className="text-blue-300 font-semibold mb-2">Mailing Address</p>
                  <p className="text-blue-200">Humber Operations LLC</p>
                  <p className="text-blue-200">Privacy Department</p>
                  <p className="text-blue-200">1234 Automotive Drive</p>
                  <p className="text-blue-200">Detroit, MI 48201</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-blue-300 font-semibold mb-2">Follow Us for Updates</p>
                <div className="flex items-center gap-4">
                  <a href="https://linkedin.com/company/humber-operations" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                    LinkedIn
                  </a>
                  <a href="https://twitter.com/humberops" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                    X (Twitter)
                  </a>
                  <a href="https://youtube.com/@humberoperations" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                    YouTube
                  </a>
                  <a href="https://github.com/humber-operations" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🔄 Policy Updates</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. 
              We'll notify you of significant changes via email or platform notifications at least 30 days before they take effect.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
