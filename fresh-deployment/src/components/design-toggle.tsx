'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Apple } from 'lucide-react'

export function DesignToggle() {
  const [isJobsMode, setIsJobsMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check localStorage for preference
    const savedMode = localStorage.getItem('humber-design-mode')
    if (savedMode === 'jobs') {
      setIsJobsMode(true)
      document.documentElement.setAttribute('data-design-mode', 'jobs')
    }
  }, [])

  const toggleDesignMode = () => {
    const newMode = !isJobsMode
    setIsJobsMode(newMode)
    
    if (newMode) {
      document.documentElement.setAttribute('data-design-mode', 'jobs')
      localStorage.setItem('humber-design-mode', 'jobs')
    } else {
      document.documentElement.removeAttribute('data-design-mode')
      localStorage.removeItem('humber-design-mode')
    }
    
    // Force page reload to apply new styles
    window.location.reload()
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-white border-2 border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
        title="Design Mode Toggle"
      >
        {isJobsMode ? (
          <Apple size={20} className="text-gray-800" />
        ) : (
          <Palette size={20} className="text-gray-600" />
        )}
      </button>

      {/* Toggle Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-20 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72"
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Design Mode</h3>
                <p className="text-sm text-gray-600">
                  Switch between design philosophies
                </p>
              </div>

              <div className="space-y-3">
                {/* Current Mode */}
                <div 
                  className={`p-3 rounded-lg border-2 transition-all ${
                    !isJobsMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Current Design</p>
                      <p className="text-sm text-gray-600">Rich gradients & animations</p>
                    </div>
                    {!isJobsMode && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                  </div>
                </div>

                {/* Jobs Mode */}
                <div 
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isJobsMode ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={toggleDesignMode}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Apple size={16} />
                        Jobs-Inspired
                      </p>
                      <p className="text-sm text-gray-600">Minimal, elegant, focused</p>
                    </div>
                    {isJobsMode && <div className="w-3 h-3 bg-gray-900 rounded-full" />}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-500 border-t pt-3">
                {isJobsMode ? (
                  <p>
                    <strong>Jobs Mode:</strong> Simplified navigation, minimal colors, 
                    maximum focus on content and usability.
                  </p>
                ) : (
                  <p>
                    <strong>Current:</strong> Rich visual experience with gradients, 
                    animations, and comprehensive feature access.
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}