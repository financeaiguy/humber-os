'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react'
import { UserRole, TooltipType, TooltipPlacement } from '@humber/types'

interface SmartTooltipProps {
  id: string
  title: string
  content: string
  type?: TooltipType
  placement?: TooltipPlacement
  userRole?: UserRole
  trigger?: 'hover' | 'click' | 'focus' | 'auto'
  delay?: number
  hasAction?: boolean
  actionText?: string
  onAction?: () => void
  children: React.ReactNode
  className?: string
}

export function SmartTooltip({
  id,
  title,
  content,
  type = 'HELP',
  placement = 'TOP',
  userRole = 'NEW_USER',
  trigger = 'hover',
  delay = 500,
  hasAction = false,
  actionText = 'Learn More',
  onAction,
  children,
  className = ''
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Check if user has seen this tooltip before
  useEffect(() => {
    const dismissedTooltips = JSON.parse(localStorage.getItem('dismissedTooltips') || '[]')
    if (dismissedTooltips.includes(id)) {
      setIsDismissed(true)
    }
  }, [id])

  // Auto-show for new users
  useEffect(() => {
    if (trigger === 'auto' && !isDismissed && userRole === 'NEW_USER') {
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    }
  }, [trigger, isDismissed, userRole, delay])

  const showTooltip = () => {
    if (isDismissed) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const dismissTooltip = () => {
    setIsVisible(false)
    setIsDismissed(true)
    
    // Remember dismissal
    const dismissedTooltips = JSON.parse(localStorage.getItem('dismissedTooltips') || '[]')
    if (!dismissedTooltips.includes(id)) {
      dismissedTooltips.push(id)
      localStorage.setItem('dismissedTooltips', JSON.stringify(dismissedTooltips))
    }
  }

  const getTooltipIcon = () => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'TIP': return <Lightbulb className="w-4 h-4 text-blue-400" />
      case 'FEATURE': return <Zap className="w-4 h-4 text-purple-400" />
      case 'PROCESS': return <Play className="w-4 h-4 text-green-400" />
      default: return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getTooltipColor = () => {
    switch (type) {
      case 'WARNING': return 'border-yellow-400/50 bg-yellow-900/20'
      case 'TIP': return 'border-blue-400/50 bg-blue-900/20'
      case 'FEATURE': return 'border-purple-400/50 bg-purple-900/20'
      case 'PROCESS': return 'border-green-400/50 bg-green-900/20'
      default: return 'border-slate-400/50 bg-slate-900/20'
    }
  }

  const getPlacementClasses = () => {
    switch (placement) {
      case 'TOP': return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'BOTTOM': return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'LEFT': return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'RIGHT': return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      case 'TOP_LEFT': return 'bottom-full right-0 mb-2'
      case 'TOP_RIGHT': return 'bottom-full left-0 mb-2'
      case 'BOTTOM_LEFT': return 'top-full right-0 mt-2'
      case 'BOTTOM_RIGHT': return 'top-full left-0 mt-2'
      default: return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const triggerProps = {
    ...(trigger === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip
    }),
    ...(trigger === 'click' && {
      onClick: () => setIsVisible(!isVisible)
    }),
    ...(trigger === 'focus' && {
      onFocus: showTooltip,
      onBlur: hideTooltip
    })
  }

  if (isDismissed && trigger !== 'click') {
    return <>{children}</>
  }

  return (
    <div className={`relative inline-block ${className}`} {...triggerProps}>
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              absolute z-[10000] w-80 max-w-sm
              ${getPlacementClasses()}
            `}
          >
            <div className={`
              backdrop-blur-xl border rounded-2xl p-4 shadow-2xl
              ${getTooltipColor()}
            `}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTooltipIcon()}
                  <h3 className="font-semibold text-white text-sm">{title}</h3>
                </div>
                <button
                  onClick={dismissTooltip}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              {/* Content */}
              <p className="text-slate-200 text-sm leading-relaxed mb-4">
                {content}
              </p>
              
              {/* Role-specific badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
                  For {userRole.toLowerCase().replace('_', ' ')} users
                </span>
                
                {hasAction && (
                  <button
                    onClick={() => {
                      onAction?.()
                      dismissTooltip()
                    }}
                    className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                  >
                    {actionText}
                  </button>
                )}
              </div>
              
              {/* Arrow pointer */}
              <div className={`
                absolute w-3 h-3 transform rotate-45 border
                ${placement === 'TOP' ? 'top-full left-1/2 -translate-x-1/2 -mt-1.5 border-r-0 border-b-0' : ''}
                ${placement === 'BOTTOM' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1.5 border-l-0 border-t-0' : ''}
                ${placement === 'LEFT' ? 'left-full top-1/2 -translate-y-1/2 -ml-1.5 border-t-0 border-l-0' : ''}
                ${placement === 'RIGHT' ? 'right-full top-1/2 -translate-y-1/2 -mr-1.5 border-b-0 border-r-0' : ''}
                ${getTooltipColor().split(' ')[0]} ${getTooltipColor().split(' ')[1]}
              `} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Walkthrough overlay component
interface WalkthroughOverlayProps {
  isActive: boolean
  currentStep: any
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onComplete: () => void
  totalSteps: number
  currentStepIndex: number
}

export function WalkthroughOverlay({
  isActive,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  totalSteps,
  currentStepIndex
}: WalkthroughOverlayProps) {
  if (!isActive || !currentStep) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Spotlight effect on target element */}
        <div className="absolute inset-0">
          <div 
            className="absolute border-4 border-blue-400 rounded-lg shadow-2xl shadow-blue-400/50"
            style={{
              // This would be calculated based on currentStep.targetElement position
              top: '200px',
              left: '300px',
              width: '200px',
              height: '100px'
            }}
          />
        </div>
        
        {/* Tooltip card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 max-w-md shadow-2xl">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= currentStepIndex ? 'bg-blue-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-3">{currentStep.title}</h3>
            <p className="text-slate-200 mb-6 leading-relaxed">{currentStep.content}</p>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={onPrevious}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Skip Tour
                </button>
              </div>
              
              <div className="flex gap-2">
                {currentStepIndex < totalSteps - 1 ? (
                  <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onComplete}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Complete
                    <Zap className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Simple help button that shows contextual help
interface HelpButtonProps {
  content: string
  title?: string
  placement?: TooltipPlacement
  className?: string
}

export function HelpButton({ 
  content, 
  title = 'Help', 
  placement = 'TOP',
  className = '' 
}: HelpButtonProps) {
  return (
    <SmartTooltip
      id={`help-${Date.now()}`}
      title={title}
      content={content}
      type="HELP"
      placement={placement}
      trigger="hover"
      className={className}
    >
      <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-full hover:bg-blue-400/10">
        <HelpCircle className="w-4 h-4" />
      </button>
    </SmartTooltip>
  )
}

// Feature introduction component
interface FeatureIntroProps {
  title: string
  description: string
  benefits: string[]
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedTime: string
  onStartTour: () => void
  onDismiss: () => void
}

export function FeatureIntro({
  title,
  description,
  benefits,
  difficulty,
  estimatedTime,
  onStartTour,
  onDismiss
}: FeatureIntroProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-400 bg-green-400/10'
      case 'INTERMEDIATE': return 'text-yellow-400 bg-yellow-400/10'
      case 'ADVANCED': return 'text-red-400 bg-red-400/10'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-4 right-4 z-[9999] w-96"
    >
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor()}`}>
                {difficulty}
              </span>
              <span className="text-xs text-slate-400">
                ~{estimatedTime} to learn
              </span>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Description */}
        <p className="text-slate-200 mb-4 leading-relaxed">{description}</p>
        
        {/* Benefits */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">What you'll learn:</h4>
          <ul className="space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-slate-300 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onStartTour}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Start Interactive Tour
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Progress indicator for multi-step processes
interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  onStepClick?: (step: number) => void
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepNames,
  onStepClick
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {stepNames.map((name, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`
              relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all cursor-pointer
              ${index <= currentStep 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-slate-700 border-slate-600 text-slate-400'
              }
              ${onStepClick ? 'hover:scale-110' : ''}
            `}
            onClick={() => onStepClick?.(index)}
          >
            <span className="text-xs font-bold">{index + 1}</span>
            
            {/* Step name tooltip */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
              {name}
            </div>
          </div>
          
          {index < totalSteps - 1 && (
            <div className={`
              w-8 h-0.5 mx-1 transition-all
              ${index < currentStep ? 'bg-blue-500' : 'bg-slate-600'}
            `} />
          )}
        </div>
      ))}
    </div>
  )
}
