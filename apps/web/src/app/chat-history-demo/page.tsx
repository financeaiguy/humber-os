'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, History, ArrowLeft } from 'lucide-react'
import { ComprehensiveChatHistory } from '@/components/comprehensive-chat-history'
import Link from 'next/link'

export default function ChatHistoryDemo() {
  const [showHistory, setShowHistory] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Link 
              href="/"
              className="absolute left-4 top-4 p-2 hover:bg-white/10 rounded-xl transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </Link>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <History className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Enhanced Chat History
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            A comprehensive conversation management interface that shows all conversations across different categories
          </p>
        </motion.div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Sparkles className="h-6 w-6 mr-3 text-purple-400" />
              New Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <h3 className="text-lg font-medium text-blue-300 mb-2">Three View Types</h3>
                  <p className="text-slate-400 text-sm">
                    • My Conversations - Your personal chats<br/>
                    • All Conversations - System-wide conversations<br/>
                    • Shared Conversations - Team collaborations
                  </p>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <h3 className="text-lg font-medium text-green-300 mb-2">Advanced Filtering</h3>
                  <p className="text-slate-400 text-sm">
                    • Search across titles, messages, and tags<br/>
                    • Filter by category (Documents, Engineer, General, Help)<br/>
                    • Sort by recent, oldest, most active, or alphabetical
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <h3 className="text-lg font-medium text-purple-300 mb-2">Rich Metadata</h3>
                  <p className="text-slate-400 text-sm">
                    • Conversation participants and sharing status<br/>
                    • Tags, pins, stars, and descriptions<br/>
                    • Message counts and activity timestamps
                  </p>
                </div>
                
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <h3 className="text-lg font-medium text-orange-300 mb-2">Bulk Actions</h3>
                  <p className="text-slate-400 text-sm">
                    • Multi-select conversations<br/>
                    • Share, archive, or delete multiple items<br/>
                    • Export conversation data
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHistory(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center space-x-3 mx-auto"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Try New Chat History</span>
              </motion.button>
            </div>
          </div>

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Before */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-red-300 mb-4">Before (Simple)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center h-32 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-600">
                  <div className="text-center">
                    <History className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No chat history yet</p>
                  </div>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Only shows "No history yet"</li>
                  <li>• Basic local session storage</li>
                  <li>• No search or filtering</li>
                  <li>• Limited conversation data</li>
                </ul>
              </div>
            </div>

            {/* After */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-green-300 mb-4">After (Comprehensive)</h3>
              <div className="space-y-3">
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-1">
                      <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">My</div>
                      <div className="px-2 py-1 bg-slate-600 text-slate-400 text-xs rounded">All</div>
                      <div className="px-2 py-1 bg-slate-600 text-slate-400 text-xs rounded">Shared</div>
                    </div>
                    <div className="text-xs text-slate-400">24 conversations</div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-white/5 rounded text-xs">
                      <div className="font-medium text-white">Safety Protocols</div>
                      <div className="text-slate-400">12 messages • 5m ago</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded text-xs">
                      <div className="font-medium text-white">Engineer Review</div>
                      <div className="text-slate-400">8 messages • 1h ago</div>
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Rich conversation management</li>
                  <li>• Advanced search & filtering</li>
                  <li>• Multiple view types</li>
                  <li>• Bulk operations support</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Selected Conversation</h3>
              <p className="text-slate-300">
                You selected conversation: <code className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">{selectedSession}</code>
              </p>
              <p className="text-sm text-slate-400 mt-2">
                In a real application, this would load the full conversation history and messages.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Comprehensive Chat History Modal */}
      <ComprehensiveChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectConversation={(sessionId) => {
          setSelectedSession(sessionId)
          setShowHistory(false)
        }}
      />
    </div>
  )
}
