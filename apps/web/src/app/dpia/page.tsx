'use client'

// export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Database, Users, Lock, FileText } from 'lucide-react'

export default function DPIAPage() {
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
              <h1 className="text-4xl font-bold text-white">Data Protection Impact Assessment</h1>
              <p className="text-slate-400">GDPR Article 35 compliance for high-risk data processing</p>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Assessment Date:</strong> September 15, 2025 • 
              <strong>Next Review:</strong> September 15, 2026 • 
              <strong>Status:</strong> Approved by Data Protection Officer
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
          {/* Processing Overview */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-green-400" />
              High-Risk Data Processing Activities
            </h2>
            
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">🔴 Biometric Data Processing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Data Types</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• Fingerprint templates (mathematical)</li>
                      <li>• Facial geometry measurements</li>
                      <li>• Voice pattern signatures</li>
                      <li>• Hand geometry data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Risk Level</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• <strong>HIGH RISK:</strong> Irreversible identification</li>
                      <li>• <strong>GDPR Article 9:</strong> Special category data</li>
                      <li>• <strong>State Laws:</strong> BIPA, CUBI compliance</li>
                      <li>• <strong>Impact:</strong> Identity theft potential</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">🟡 Location Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Data Types</h4>
                    <ul className="text-orange-200 text-sm space-y-1">
                      <li>• GPS coordinates (precise location)</li>
                      <li>• Work site geofencing data</li>
                      <li>• Movement patterns</li>
                      <li>• Time-stamped location history</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Risk Level</h4>
                    <ul className="text-orange-200 text-sm space-y-1">
                      <li>• <strong>MEDIUM RISK:</strong> Privacy invasion</li>
                      <li>• <strong>Surveillance:</strong> Continuous monitoring</li>
                      <li>• <strong>Personal Life:</strong> Inference potential</li>
                      <li>• <strong>Security:</strong> Stalking/harassment risk</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">🟡 Personal Data Processing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Data Types</h4>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• SSN, passport, visa information</li>
                      <li>• Emergency contact details</li>
                      <li>• Financial and salary data</li>
                      <li>• Health and background check data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Risk Level</h4>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• <strong>MEDIUM RISK:</strong> Identity theft</li>
                      <li>• <strong>Financial:</strong> Fraud potential</li>
                      <li>• <strong>Discrimination:</strong> Bias potential</li>
                      <li>• <strong>Compliance:</strong> Regulatory violations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Risk Assessment & Mitigation
            </h2>
            
            <div className="space-y-6">
              {/* High Risk Mitigations */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 High Risk Mitigations</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Biometric Data Protection</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• <strong>Local Processing:</strong> Biometric scanning occurs on user device only</li>
                      <li>• <strong>Template Encryption:</strong> AES-256 encryption for all stored templates</li>
                      <li>• <strong>No Raw Storage:</strong> Never store actual fingerprints or photos</li>
                      <li>• <strong>Immediate Destruction:</strong> Raw data deleted after template creation</li>
                      <li>• <strong>Access Logging:</strong> All access to biometric data logged and monitored</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Legal Safeguards</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• <strong>Explicit Consent:</strong> Written consent before any collection</li>
                      <li>• <strong>Purpose Limitation:</strong> Only used for time tracking and security</li>
                      <li>• <strong>Retention Limits:</strong> Automatic deletion after employment + 1 year</li>
                      <li>• <strong>No Sale Policy:</strong> Biometric data never sold or monetized</li>
                      <li>• <strong>Alternative Methods:</strong> Non-biometric options always available</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Medium Risk Mitigations */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">⚠️ Medium Risk Mitigations</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Location Data Protection</h4>
                    <ul className="text-orange-200 text-sm space-y-1">
                      <li>• <strong>Work Hours Only:</strong> Location tracked only during work hours</li>
                      <li>• <strong>Geofencing:</strong> Data collection limited to approved work sites</li>
                      <li>• <strong>Aggregation:</strong> Individual movements aggregated for privacy</li>
                      <li>• <strong>Retention Limits:</strong> Location data deleted after 90 days</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Personal Data Security</h4>
                    <ul className="text-orange-200 text-sm space-y-1">
                      <li>• <strong>Multi-Tenant Isolation:</strong> Complete client data separation</li>
                      <li>• <strong>Role-Based Access:</strong> Minimum necessary access principle</li>
                      <li>• <strong>Regular Audits:</strong> Quarterly access reviews and cleanup</li>
                      <li>• <strong>Incident Response:</strong> 72-hour breach notification protocol</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Basis */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Legal Basis for Processing
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">⚖️ GDPR Legal Basis</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-400">Article 6(1)(b) - Contract Performance</h4>
                      <p className="text-slate-300 text-sm">
                        Processing necessary for employment contract performance and time tracking obligations.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-400">Article 6(1)(c) - Legal Obligation</h4>
                      <p className="text-slate-300 text-sm">
                        Compliance with labor laws, tax reporting, and automotive industry security requirements.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-purple-400">Article 9(2)(a) - Explicit Consent</h4>
                      <p className="text-slate-300 text-sm">
                        For biometric data (special category), we rely on your explicit, informed consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🇺🇸 US Legal Framework</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Federal Laws</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• <strong>FLSA:</strong> Accurate time tracking mandate</li>
                      <li>• <strong>FCRA:</strong> Background check compliance</li>
                      <li>• <strong>SOX:</strong> Financial reporting accuracy</li>
                      <li>• <strong>OSHA:</strong> Workplace safety requirements</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">State Laws</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• <strong>Illinois BIPA:</strong> Biometric privacy protection</li>
                      <li>• <strong>California CCPA:</strong> Consumer privacy rights</li>
                      <li>• <strong>Texas CUBI:</strong> Biometric data security</li>
                      <li>• <strong>Michigan Labor:</strong> State-specific time tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Subject Rights */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Data Subject Rights Implementation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">🔍 Right to Access</h3>
                  <p className="text-blue-200 text-sm mb-2">Implementation:</p>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li>• Self-service data export in profile settings</li>
                    <li>• Complete data package within 30 days</li>
                    <li>• Machine-readable JSON format</li>
                    <li>• Includes all processing activities log</li>
                  </ul>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-400 mb-2">✏️ Right to Rectification</h3>
                  <p className="text-green-200 text-sm mb-2">Implementation:</p>
                  <ul className="text-green-200 text-xs space-y-1">
                    <li>• Real-time profile editing interface</li>
                    <li>• Automated validation and verification</li>
                    <li>• Propagation to all connected systems</li>
                    <li>• Audit trail of all corrections</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-400 mb-2">🗑️ Right to Erasure</h3>
                  <p className="text-purple-200 text-sm mb-2">Implementation:</p>
                  <ul className="text-purple-200 text-xs space-y-1">
                    <li>• Automated deletion workflows</li>
                    <li>• Legal retention period compliance</li>
                    <li>• Cryptographic data destruction</li>
                    <li>• Deletion confirmation certificates</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">📤 Right to Portability</h3>
                  <p className="text-yellow-200 text-sm mb-2">Implementation:</p>
                  <ul className="text-yellow-200 text-xs space-y-1">
                    <li>• Structured data export (JSON, CSV, XML)</li>
                    <li>• API access for automated transfers</li>
                    <li>• Standard industry formats</li>
                    <li>• Secure transfer protocols</li>
                  </ul>
                </div>
                
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">🛑 Right to Object</h3>
                  <p className="text-red-200 text-sm mb-2">Implementation:</p>
                  <ul className="text-red-200 text-xs space-y-1">
                    <li>• Granular consent management</li>
                    <li>• Alternative processing methods</li>
                    <li>• Immediate processing cessation</li>
                    <li>• No employment consequences</li>
                  </ul>
                </div>
                
                <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-400 mb-2">⏸️ Right to Restrict</h3>
                  <p className="text-gray-200 text-sm mb-2">Implementation:</p>
                  <ul className="text-gray-200 text-xs space-y-1">
                    <li>• Temporary processing suspension</li>
                    <li>• Data quarantine procedures</li>
                    <li>• Limited access controls</li>
                    <li>• Dispute resolution workflows</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Necessity and Proportionality */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">⚖️ Necessity and Proportionality Assessment</h2>
            
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Justified Processing</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Business Necessity</h4>
                    <p className="text-green-200 text-sm">
                      Biometric time tracking is necessary to prevent time fraud, ensure accurate client billing, 
                      and meet automotive industry security requirements. Traditional methods (badges, PINs) 
                      are insufficient for high-security automotive manufacturing environments.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Proportionality Analysis</h4>
                    <p className="text-green-200 text-sm">
                      The level of data collection is proportional to the security and accuracy requirements. 
                      We use the minimum biometric data necessary and provide multiple alternative methods 
                      for employees who prefer not to use biometric authentication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">🔄 Less Intrusive Alternatives Considered</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-500/20">
                        <th className="text-left py-2 text-white">Alternative Method</th>
                        <th className="text-left py-2 text-white">Security Level</th>
                        <th className="text-left py-2 text-white">Why Insufficient</th>
                      </tr>
                    </thead>
                    <tbody className="text-blue-200">
                      <tr className="border-b border-blue-500/10">
                        <td className="py-2">PIN/Password</td>
                        <td className="py-2">Low</td>
                        <td className="py-2">Easily shared, forgotten, or stolen</td>
                      </tr>
                      <tr className="border-b border-blue-500/10">
                        <td className="py-2">RFID Badge</td>
                        <td className="py-2">Medium</td>
                        <td className="py-2">Can be lost, stolen, or used by others</td>
                      </tr>
                      <tr className="border-b border-blue-500/10">
                        <td className="py-2">Manual Timesheets</td>
                        <td className="py-2">Low</td>
                        <td className="py-2">Prone to fraud, errors, and disputes</td>
                      </tr>
                      <tr>
                        <td className="py-2">Supervisor Verification</td>
                        <td className="py-2">Medium</td>
                        <td className="py-2">Not scalable, creates bottlenecks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation and Review */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">👥 Stakeholder Consultation</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🗣️ Consultation Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Internal Stakeholders</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Legal Department (reviewed and approved)</li>
                      <li>• Data Protection Officer (ongoing oversight)</li>
                      <li>• IT Security Team (technical implementation)</li>
                      <li>• HR Department (employee relations)</li>
                      <li>• Operations Management (business requirements)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">External Consultation</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Privacy law attorneys (legal compliance)</li>
                      <li>• Cybersecurity consultants (technical security)</li>
                      <li>• Industry associations (best practices)</li>
                      <li>• Regulatory authorities (guidance)</li>
                      <li>• Employee representatives (feedback)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">📅 Review Schedule</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <span className="text-white font-medium">Annual DPIA Review:</span>
                      <span className="text-slate-300 text-sm ml-2">September 15th each year</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div>
                      <span className="text-white font-medium">Quarterly Risk Assessment:</span>
                      <span className="text-slate-300 text-sm ml-2">March, June, September, December</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div>
                      <span className="text-white font-medium">Technology Review:</span>
                      <span className="text-slate-300 text-sm ml-2">When implementing new biometric technologies</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <div>
                      <span className="text-white font-medium">Incident-Triggered Review:</span>
                      <span className="text-slate-300 text-sm ml-2">Within 30 days of any security incident</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monitoring and Compliance */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-400" />
              Ongoing Monitoring and Compliance
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">📊 Compliance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <div className="text-xl font-bold text-green-400">99.9%</div>
                    <div className="text-xs text-green-300">Data Security Uptime</div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-xl font-bold text-blue-400">&lt; 24h</div>
                    <div className="text-xs text-blue-300">Breach Response Time</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                    <div className="text-xl font-bold text-purple-400">100%</div>
                    <div className="text-xs text-purple-300">Consent Documentation</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                    <div className="text-xl font-bold text-orange-400">0</div>
                    <div className="text-xs text-orange-300">Privacy Violations</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔍 Audit and Review Process</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Monthly Security Scans:</strong> Automated vulnerability assessments</li>
                  <li>• <strong>Quarterly Penetration Testing:</strong> Third-party security testing</li>
                  <li>• <strong>Annual Legal Review:</strong> Compliance with evolving privacy laws</li>
                  <li>• <strong>Continuous Monitoring:</strong> Real-time threat detection and response</li>
                  <li>• <strong>Employee Training:</strong> Quarterly privacy and security training updates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">DPIA Conclusion</h3>
            <p className="text-green-200 text-sm max-w-2xl mx-auto">
              Based on this comprehensive assessment, the biometric time tracking system implements 
              appropriate technical and organizational measures to ensure high-risk data processing 
              complies with all applicable privacy laws while serving legitimate business interests.
            </p>
            
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-green-300 text-xs">
                <strong>DPO Approval:</strong> Jane Smith, Data Protection Officer • 
                <strong>Legal Review:</strong> John Doe, Privacy Counsel • 
                <strong>Next Review:</strong> September 15, 2026
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
