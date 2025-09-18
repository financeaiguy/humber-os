'use client'
// export const runtime = 'edge'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Fingerprint, Shield, AlertTriangle, CheckCircle, Eye, Lock, Clock } from 'lucide-react'

export default function BiometricConsentPage() {
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
              <Fingerprint className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Biometric Data Consent</h1>
              <p className="text-slate-400">Your rights and our responsibilities with biometric information</p>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-200 text-sm">
              <strong>Important:</strong> This consent form complies with Illinois BIPA, Texas CUBI, and other state biometric privacy laws.
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
          {/* What We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-400" />
              What Biometric Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔐 Types of Biometric Data</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Fingerprint Templates:</strong> Mathematical representations of your fingerprint patterns (not actual images)</li>
                  <li>• <strong>Facial Recognition Data:</strong> Encrypted facial geometry measurements for Face ID verification</li>
                  <li>• <strong>Voice Patterns:</strong> Audio signature templates for voice recognition (optional)</li>
                  <li>• <strong>Hand Geometry:</strong> Palm vein patterns for enhanced security (where available)</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">🛡️ What We DON'T Store</h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Actual fingerprint images or photos</li>
                  <li>• Raw facial photographs or video recordings</li>
                  <li>• Voice recordings or audio files</li>
                  <li>• Any biometric data that could be reverse-engineered</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Purpose and Use */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Purpose and Use of Biometric Data
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Authorized Uses</h3>
                <ul className="text-green-200 space-y-2">
                  <li>• <strong>Time Clock Authentication:</strong> Verify your identity when clocking in and out</li>
                  <li>• <strong>Fraud Prevention:</strong> Prevent "buddy punching" and unauthorized time entries</li>
                  <li>• <strong>Accurate Billing:</strong> Ensure precise billing to automotive clients (GM, Ford, Stellantis, HIROTEC)</li>
                  <li>• <strong>Workplace Security:</strong> Control access to secure work sites and equipment</li>
                  <li>• <strong>Compliance Verification:</strong> Meet client security requirements for automotive projects</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">❌ Prohibited Uses</h3>
                <ul className="text-red-200 space-y-2">
                  <li>• Performance evaluation or disciplinary actions</li>
                  <li>• Marketing or commercial purposes</li>
                  <li>• Sharing with unauthorized third parties</li>
                  <li>• Law enforcement without proper warrant</li>
                  <li>• Any purpose not directly related to time tracking and security</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              Your Biometric Rights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🗳️ Voluntary Consent</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Consent is completely voluntary</li>
                  <li>• You can withdraw consent anytime</li>
                  <li>• Alternative time tracking methods available</li>
                  <li>• No employment consequences for declining</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">📋 Data Control Rights</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Request deletion of your biometric data</li>
                  <li>• Receive copy of stored biometric templates</li>
                  <li>• Know who has accessed your data</li>
                  <li>• Update consent preferences anytime</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">⚖️ Legal Protections</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Protected under Illinois BIPA</li>
                  <li>• Texas CUBI compliance</li>
                  <li>• GDPR Article 9 protections</li>
                  <li>• Right to legal remedies for violations</li>
                </ul>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔔 Notification Rights</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• 30-day notice for policy changes</li>
                  <li>• Immediate notice of data breaches</li>
                  <li>• Quarterly data usage reports</li>
                  <li>• Annual consent renewal reminders</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-400" />
              How We Protect Your Biometric Data
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔒 Technical Safeguards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>AES-256 Encryption:</strong> Military-grade encryption for all biometric templates</li>
                    <li>• <strong>Local Processing:</strong> Biometric scanning happens on your device only</li>
                    <li>• <strong>Template Storage:</strong> Only mathematical templates stored, never raw biometric data</li>
                    <li>• <strong>Secure Transmission:</strong> All data encrypted in transit using TLS 1.3</li>
                  </ul>
                  
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>Access Controls:</strong> Multi-factor authentication for system access</li>
                    <li>• <strong>Audit Logging:</strong> Complete logs of all biometric data access</li>
                    <li>• <strong>Regular Security Audits:</strong> Quarterly penetration testing</li>
                    <li>• <strong>Incident Response:</strong> 24-hour breach notification protocol</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🏢 Administrative Safeguards</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Need-to-Know Access:</strong> Only authorized personnel can access biometric systems</li>
                  <li>• <strong>Employee Training:</strong> All staff trained on biometric privacy requirements</li>
                  <li>• <strong>Vendor Management:</strong> Third-party contractors bound by same privacy standards</li>
                  <li>• <strong>Legal Compliance:</strong> Regular legal review of biometric practices</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Retention and Destruction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-400" />
              Data Retention and Destruction
            </h2>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-4">⏰ Retention Schedule</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-500/20">
                      <th className="text-left py-3 text-white">Biometric Data Type</th>
                      <th className="text-left py-3 text-white">Retention Period</th>
                      <th className="text-left py-3 text-white">Destruction Method</th>
                    </tr>
                  </thead>
                  <tbody className="text-orange-200">
                    <tr className="border-b border-orange-500/10">
                      <td className="py-3">Fingerprint templates</td>
                      <td className="py-3">Employment term + 1 year</td>
                      <td className="py-3">Secure cryptographic deletion</td>
                    </tr>
                    <tr className="border-b border-orange-500/10">
                      <td className="py-3">Facial recognition data</td>
                      <td className="py-3">Employment term + 1 year</td>
                      <td className="py-3">Secure cryptographic deletion</td>
                    </tr>
                    <tr className="border-b border-orange-500/10">
                      <td className="py-3">Voice patterns</td>
                      <td className="py-3">Employment term + 6 months</td>
                      <td className="py-3">Secure cryptographic deletion</td>
                    </tr>
                    <tr>
                      <td className="py-3">Device enrollment data</td>
                      <td className="py-3">Device active period + 90 days</td>
                      <td className="py-3">Secure cryptographic deletion</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded">
                <p className="text-orange-200 text-sm">
                  <strong>Automatic Destruction:</strong> All biometric data is automatically and securely destroyed 
                  according to the schedule above. You will receive confirmation of destruction via email.
                </p>
              </div>
            </div>
          </section>

          {/* Alternative Methods */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">🔄 Alternative Time Tracking Methods</h2>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <p className="text-blue-200 mb-4">
                <strong>If you choose not to provide biometric data, these alternatives are available:</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">📱 Mobile App + PIN</h3>
                  <p className="text-slate-300 text-sm">
                    Use the mobile app with a secure PIN and location verification. 
                    Requires manager approval for each time entry.
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">🏢 Supervisor Verification</h3>
                  <p className="text-slate-300 text-sm">
                    On-site supervisor can verify your time entries using their 
                    biometric authentication on your behalf.
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">🔑 RFID Badge System</h3>
                  <p className="text-slate-300 text-sm">
                    Use a secure RFID badge with encrypted chip technology. 
                    Requires additional location verification.
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">📝 Manual Time Sheets</h3>
                  <p className="text-slate-300 text-sm">
                    Paper time sheets with supervisor signature. 
                    Subject to additional verification and approval processes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">📋 Legal Compliance Framework</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🏛️ State Law Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Illinois BIPA</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Written consent before collection</li>
                      <li>• Specific purpose disclosure</li>
                      <li>• Retention schedule publication</li>
                      <li>• No sale of biometric data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">Texas CUBI</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Informed consent required</li>
                      <li>• Data destruction procedures</li>
                      <li>• Security safeguard requirements</li>
                      <li>• Disclosure limitations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🌍 Federal and International</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>GDPR Article 9:</strong> Special category data protections for EU residents</li>
                  <li>• <strong>CCPA:</strong> California consumer privacy rights</li>
                  <li>• <strong>PIPEDA:</strong> Canadian personal information protection</li>
                  <li>• <strong>FLSA:</strong> Fair Labor Standards Act time tracking requirements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Consent Process */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">✍️ Consent Process</h2>
            
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">📝 Informed Consent Requirements</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Clear Understanding</h4>
                      <p className="text-green-200 text-sm">
                        You understand what biometric data is being collected and how it will be used.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Voluntary Agreement</h4>
                      <p className="text-green-200 text-sm">
                        Your consent is given freely without coercion or employment pressure.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Revocable Consent</h4>
                      <p className="text-green-200 text-sm">
                        You can withdraw consent at any time with 30 days written notice.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Data Destruction</h4>
                      <p className="text-green-200 text-sm">
                        All your biometric data will be securely destroyed upon consent withdrawal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consent Actions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">🎯 Manage Your Consent</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-colors">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Provide Consent</div>
                    <div className="text-xs mt-1">Enable biometric time tracking</div>
                  </button>
                  
                  <button className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-colors">
                    <Eye className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">View My Data</div>
                    <div className="text-xs mt-1">See stored biometric templates</div>
                  </button>
                  
                  <button className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Withdraw Consent</div>
                    <div className="text-xs mt-1">Remove all biometric data</div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">📞 Biometric Privacy Officer</h2>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-300 font-semibold mb-2">Biometric Privacy Officer</p>
                  <p className="text-purple-200">Email: biometric@humberops.com</p>
                  <p className="text-purple-200">Phone: 1-800-HUMBER-1 ext. 101</p>
                  <p className="text-purple-200">Response time: 24 hours</p>
                </div>
                
                <div>
                  <p className="text-purple-300 font-semibold mb-2">Emergency Contact</p>
                  <p className="text-purple-200">For data breaches or security concerns</p>
                  <p className="text-purple-200">Email: security@humberops.com</p>
                  <p className="text-purple-200">Phone: 1-800-HUMBER-1 (24/7)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Notice */}
          <section>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Legal Notice</h3>
                  <p className="text-yellow-200 text-sm leading-relaxed">
                    Under Illinois BIPA and other state biometric privacy laws, you have the right to sue for damages 
                    if your biometric data is collected, stored, or used without proper consent or in violation of 
                    applicable laws. Statutory damages range from $1,000 to $5,000 per violation, plus attorney fees.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
