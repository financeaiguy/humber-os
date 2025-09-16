'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, X, Check, AlertCircle, Info, CheckCircle, 
  Clock, User, FileText, Shield, Briefcase, Calendar,
  ChevronRight, Archive, Trash2, Eye, EyeOff,
  Filter, Search, RefreshCw, Settings, Download
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface Notification {
  id: string
  type: 'onboarding' | 'task' | 'system' | 'alert' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: any
}

interface NotificationManagerProps {
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'right'
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'onboarding',
    title: 'New Employee Onboarding',
    message: 'Michael Chen has completed documentation phase',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    priority: 'high',
    category: 'Employee Onboarding',
    actionUrl: '/onboarding',
    actionLabel: 'View Progress'
  },
  {
    id: '2',
    type: 'alert',
    title: 'Pending Approval Required',
    message: 'Sarah Johnson\'s background check needs your approval',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    priority: 'urgent',
    category: 'Approvals',
    actionUrl: '/onboarding',
    actionLabel: 'Review Now'
  },
  {
    id: '3',
    type: 'task',
    title: 'Training Schedule Reminder',
    message: 'David Kim\'s IT security training is scheduled for tomorrow',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
    priority: 'medium',
    category: 'Training',
    actionUrl: '/onboarding',
    actionLabel: 'View Schedule'
  },
  {
    id: '4',
    type: 'success',
    title: 'Onboarding Completed',
    message: 'Emily Rodriguez has successfully completed all onboarding steps',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: true,
    priority: 'low',
    category: 'Completions'
  },
  {
    id: '5',
    type: 'system',
    title: 'System Update',
    message: 'New compliance requirements have been added to the onboarding process',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    read: true,
    priority: 'low',
    category: 'System'
  }
]

export function NotificationManager({ isOpen, onClose, position = 'left' }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'onboarding' | 'urgent'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setSelectedNotification(null)
  }

  const handleArchive = (id: string) => {
    // In production, this would move to an archive collection
    handleDelete(id)
  }

  const getFilteredNotifications = () => {
    let filtered = [...notifications]
    
    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read)
        break
      case 'onboarding':
        filtered = filtered.filter(n => n.type === 'onboarding')
        break
      case 'urgent':
        filtered = filtered.filter(n => n.priority === 'urgent' || n.priority === 'high')
        break
    }
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort by timestamp (newest first) and priority
    return filtered.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'onboarding': return User
      case 'task': return Briefcase
      case 'alert': return AlertCircle
      case 'success': return CheckCircle
      case 'system': return Info
      default: return Bell
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/20'
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'onboarding': return 'from-blue-500 to-cyan-500'
      case 'task': return 'from-purple-500 to-pink-500'
      case 'alert': return 'from-red-500 to-orange-500'
      case 'success': return 'from-green-500 to-emerald-500'
      case 'system': return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: position === 'left' ? -400 : 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: position === 'left' ? -400 : 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-[400px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl z-50`}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bell className="h-6 w-6 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Notifications</h2>
                    <p className="text-xs text-slate-400">
                      {unreadCount} unread, {urgentCount} urgent
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {(['all', 'unread', 'onboarding', 'urgent'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === tab
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
              >
                <Check className="h-3 w-3" />
                <span>Mark all as read</span>
              </button>
              <button
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
              >
                <Settings className="h-3 w-3" />
                <span>Settings</span>
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {getFilteredNotifications().length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No notifications found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {filter !== 'all' ? 'Try changing your filter' : 'You\'re all caught up!'}
                  </p>
                </div>
              ) : (
                getFilteredNotifications().map((notification) => {
                  const Icon = getIcon(notification.type)
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedNotification(notification)}
                      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        !notification.read
                          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                          : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="absolute top-4 left-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                      )}

                      <div className="flex items-start space-x-3 ml-2">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(notification.type)} flex-shrink-0`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-sm font-medium text-white truncate pr-2">
                              {notification.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(notification.id)
                              }}
                              className="p-1 rounded hover:bg-slate-700 transition-colors flex-shrink-0"
                            >
                              <X className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                          
                          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {notification.category && (
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                  {notification.category}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                          </div>

                          {notification.actionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification.id)
                                // Navigate to action URL
                                window.location.href = notification.actionUrl
                              }}
                              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                            >
                              <span>{notification.actionLabel || 'View'}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity flex space-x-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="p-1 rounded hover:bg-slate-700 transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="h-3 w-3 text-slate-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchive(notification.id)
                          }}
                          className="p-1 rounded hover:bg-slate-700 transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50">
              <button className="w-full py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-sm">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Notification Badge Component for the sidebar
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null
  
  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
      {count > 9 ? '9+' : count}
    </span>
  )
}