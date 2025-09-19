'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'

interface SimpleTooltipProps {
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  isVisible: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentStep?: number
  totalSteps?: number
  showResetButton?: boolean
  onReset?: () => void
  children?: React.ReactNode
}

export function SimpleTooltip({
  title,
  description,
  position = 'bottom',
  isVisible,
  onClose,
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 1,
  showResetButton = false,
  onReset,
  children
}: SimpleTooltipProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-[999999] ${positionClasses[position]} w-80 max-w-sm`}
        >
          {/* Arrow */}
          <div className={`absolute ${arrowClasses[position]} w-0 h-0 border-8`} />

          {/* Tooltip Content */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold text-sm">{title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {showResetButton && onReset && (
                  <button
                    onClick={onReset}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Reset Tutorial"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {totalSteps > 1 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Step {currentStep} of {totalSteps}</span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {description}
            </p>

            {/* Children (for custom content) */}
            {children && (
              <div className="mb-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
                {children}
              </div>
            )}

            {/* Navigation Buttons */}
            {(onPrevious || onNext) && (
              <div className="flex justify-between">
                <button
                  onClick={onPrevious}
                  disabled={!onPrevious}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    onPrevious
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={onNext}
                  disabled={!onNext}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                    onNext
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{currentStep === totalSteps ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Single action button */}
            {!onNext && !onPrevious && (
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Got it!
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Wrapper component for positioning tooltips around elements
interface TooltipWrapperProps {
  children: React.ReactNode
  tooltip: Omit<SimpleTooltipProps, 'children'>
  className?: string
}

export function TooltipWrapper({ children, tooltip, className = '' }: TooltipWrapperProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <SimpleTooltip {...tooltip} />
    </div>
  )
}