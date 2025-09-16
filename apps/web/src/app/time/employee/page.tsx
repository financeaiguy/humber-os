'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, History, User } from 'lucide-react'
import EmployeeClockView from '@/components/time-tracking/EmployeeClockView'
import TimeTrackingCalendar from '@/components/time-tracking/TimeTrackingCalendar'

export default function EmployeeTimePage() {
  const [activeTab, setActiveTab] = useState<'clock' | 'calendar' | 'history'>('clock')
  
  // In a real app, you would get the employee data from authentication/session
  const mockEmployeeData = {
    id: 'emp_001',
    name: 'Sarah Johnson',
    role: 'Senior Electrical Engineer',
    project: 'GM Assembly Line',
    avatar: 'SJ'
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Employee Navigation */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-center space-x-1 p-4">
          <button
            onClick={() => setActiveTab('clock')}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'clock'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="h-6 w-6" />
            <span className="text-sm font-medium">Time Clock</span>
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'calendar'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm font-medium">Schedule</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="h-6 w-6" />
            <span className="text-sm font-medium">History</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'clock' && (
          <EmployeeClockView employeeData={mockEmployeeData} onClose={() => {}} />
        )}
        
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <TimeTrackingCalendar 
              userRole="employee"
              employeeId={mockEmployeeData.id}
              isReadOnly={false}
            />
          </motion.div>
        )}
        
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Time Entry History</h2>
              <p className="text-slate-400 mb-6">Your complete time tracking history with verification details.</p>
              
              {/* History table would go here */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <div>
                        <div className="text-white font-medium">September {15 + i}, 2025</div>
                        <div className="text-slate-400 text-sm">8.5 hours - GM Assembly Line</div>
                      </div>
                    </div>
                    <div className="text-green-400 text-sm">Approved</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}