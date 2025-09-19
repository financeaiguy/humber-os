'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/components/session-context'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Eye,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  Globe,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  QrCode,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // 2FA State
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [twoFASecret, setTwoFASecret] = useState('')

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    timezone: 'Eastern Time (ET)',
    department: ''
  })

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    timesheet: true,
    projects: true,
    billing: false,
    security: true,
    marketing: false
  })

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        location: '',
        timezone: 'Eastern Time (ET)',
        department: session.user.role?.replace('_', ' ') || ''
      })
    }
  }, [session])

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Eye },
  ]

  const generateBackupCodes = () => {
    const codes = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const handleEnable2FA = async () => {
    // Generate a proper base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 16; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)]
    }
    setTwoFASecret(secret)
    setShowQRCode(true)

    // Generate backup codes
    const codes = generateBackupCodes()
    setBackupCodes(codes)
  }

  const handleVerify2FA = async () => {
    // In production, verify the code against the secret
    if (verificationCode.length === 6) {
      setTwoFAEnabled(true)
      setShowQRCode(false)
      setShowBackupCodes(true)
      setMessage({ type: 'success', text: '2FA has been successfully enabled!' })
      setVerificationCode('')
    } else {
      setMessage({ type: 'error', text: 'Invalid verification code. Please try again.' })
    }
  }

  const handleDisable2FA = () => {
    setTwoFAEnabled(false)
    setTwoFASecret('')
    setBackupCodes([])
    setMessage({ type: 'success', text: '2FA has been disabled.' })
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long!' })
      return
    }

    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }, 1500)
  }

  const handleProfileSave = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }, 1500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'Copied to clipboard!' })
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg flex items-center justify-between ${
              message.type === 'success' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className={`${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </span>
            </div>
            <button onClick={() => setMessage({ type: '', text: '' })}>
              <X className="h-4 w-4 text-slate-400 hover:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
                  <p className="text-slate-400">Update your personal information and preferences</p>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {session.user.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{session.user.name}</h3>
                    <p className="text-slate-400">{session.user.role?.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-500">{session.user.partnerName}</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      placeholder="City, State"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Time Zone
                    </label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileData.department}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/30 border border-slate-700 text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProfileSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                  <p className="text-slate-400">Choose how you want to be notified about important updates</p>
                </div>

                <div className="space-y-6">
                  {Object.entries({
                    email: { label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                    push: { label: 'Push Notifications', desc: 'Browser and mobile push notifications', icon: Smartphone },
                    sms: { label: 'SMS Notifications', desc: 'Text message notifications for urgent items', icon: Phone },
                    timesheet: { label: 'Timesheet Reminders', desc: 'Reminders to submit timesheets', icon: Clock },
                    projects: { label: 'Project Updates', desc: 'Updates on project status and milestones', icon: Building },
                    billing: { label: 'Billing Notifications', desc: 'Invoice and payment notifications', icon: Globe },
                    security: { label: 'Security Alerts', desc: 'Important security and login notifications', icon: ShieldCheck },
                    marketing: { label: 'Marketing Communications', desc: 'Product updates and newsletters', icon: Mail }
                  }).map(([key, { label, desc, icon: Icon }]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                      <div className="flex items-center space-x-4">
                        <Icon className="h-5 w-5 text-slate-400" />
                        <div>
                          <h3 className="font-medium text-white">{label}</h3>
                          <p className="text-sm text-slate-400">{desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[key as keyof typeof notifications]}
                          onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Security & Privacy</h2>
                  <p className="text-slate-400">Manage your account security and privacy settings</p>
                </div>

                <div className="space-y-6">
                  {/* Password Change */}
                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <Lock className="h-6 w-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Change Password</h3>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Key className="h-6 w-6 text-green-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                          <p className="text-slate-400">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      {twoFAEnabled && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                          Enabled
                        </span>
                      )}
                    </div>

                    {!twoFAEnabled && !showQRCode && (
                      <button
                        onClick={handleEnable2FA}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Enable 2FA
                      </button>
                    )}

                    {/* QR Code Setup */}
                    {showQRCode && !twoFAEnabled && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-800 rounded-lg">
                          <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white rounded-lg">
                              <QRCode
                                value={`otpauth://totp/HumberOS:${session?.user?.email || 'user@example.com'}?secret=${twoFASecret}&issuer=HumberOS`}
                                size={128}
                                level="M"
                              />
                            </div>
                          </div>
                          <p className="text-center text-sm text-slate-400 mb-4">
                            Scan this QR code with your authenticator app
                          </p>
                          <div className="p-3 bg-slate-900 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">Manual entry key:</p>
                            <div className="flex items-center justify-between">
                              <code className="text-sm text-white font-mono">{twoFASecret}</code>
                              <button
                                onClick={() => copyToClipboard(twoFASecret)}
                                className="p-1 hover:bg-slate-700 rounded"
                              >
                                <Copy className="h-4 w-4 text-slate-400" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Enter verification code from your app
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="000000"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              maxLength={6}
                              className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-center text-lg"
                            />
                            <button
                              onClick={handleVerify2FA}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => {
                                setShowQRCode(false)
                                setTwoFASecret('')
                                setVerificationCode('')
                              }}
                              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Backup Codes */}
                    {showBackupCodes && backupCodes.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-yellow-400">Backup Recovery Codes</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={downloadBackupCodes}
                              className="p-1 hover:bg-slate-700 rounded"
                              title="Download codes"
                            >
                              <Download className="h-4 w-4 text-slate-400" />
                            </button>
                            <button
                              onClick={() => setShowBackupCodes(false)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <X className="h-4 w-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-yellow-400 mb-3">
                          Save these codes in a safe place. You can use them to access your account if you lose your device.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((code, index) => (
                            <div
                              key={index}
                              className="p-2 bg-slate-800 rounded text-sm font-mono text-white flex items-center justify-between"
                            >
                              {code}
                              <button
                                onClick={() => copyToClipboard(code)}
                                className="p-1 hover:bg-slate-700 rounded"
                              >
                                <Copy className="h-3 w-3 text-slate-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disable 2FA */}
                    {twoFAEnabled && !showQRCode && (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                          Two-factor authentication is currently enabled on your account.
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowBackupCodes(!showBackupCodes)}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
                          </button>
                          <button
                            onClick={handleDisable2FA}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Disable 2FA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <Monitor className="h-6 w-6 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Monitor className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Current Device</p>
                            <p className="text-xs text-slate-400">Chrome on macOS • Active now</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          This device
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Appearance</h2>
                  <p className="text-slate-400">Customize how the application looks and feels</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {darkMode ? <Moon className="h-6 w-6 text-blue-400" /> : <Sun className="h-6 w-6 text-yellow-400" />}
                        <div>
                          <h3 className="text-lg font-semibold text-white">Dark Mode</h3>
                          <p className="text-slate-400">Toggle between light and dark themes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <Monitor className="h-6 w-6 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Display Preferences</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Dashboard Layout
                        </label>
                        <select className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                          <option>Compact</option>
                          <option>Comfortable</option>
                          <option>Spacious</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Sidebar Position
                        </label>
                        <select className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                          <option>Left</option>
                          <option>Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}