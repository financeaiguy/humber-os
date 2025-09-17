'use client'

import { useState } from 'react'

export const runtime = 'edge'
import { motion } from 'framer-motion'
import { useSession } from '@/components/session-context'
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
  Sun
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    timesheet: true,
    projects: true,
    billing: false
  })

  if (!session?.user) {
    return <div className="text-white">Loading...</div>
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Eye },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

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
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('Change avatar')
                      }}
                      className="absolute bottom-0 right-0 h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
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
                      defaultValue={session.user.name || ''}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={session.user.email || ''}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
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
                      placeholder="City, State"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Time Zone
                    </label>
                    <select className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
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
                      defaultValue={session.user.role?.replace('_', ' ')}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/30 border border-slate-700 text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      // TODO: Implement save functionality
                      console.log('Saving changes...')
                    }}
                    type="button"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
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
                    billing: { label: 'Billing Notifications', desc: 'Invoice and payment notifications', icon: Globe }
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
                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <Lock className="h-6 w-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Change Password</h3>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          console.log('Update password')
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <Key className="h-6 w-6 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                    </div>
                    <p className="text-slate-400 mb-4">Add an extra layer of security to your account</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('Enable 2FA')
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Enable 2FA
                    </button>
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