'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface OnboardingCandidate {
  id: string
  name: string
  email: string
  role: string
  status: 'vetting' | 'offer_letter' | 'legal' | 'immigration' | 'final_review' | 'completed'
  phase: number
  progress: number
  startDate: string
  lastUpdate: string
  assignedTo?: string
  location?: string
  documents?: {
    resume?: boolean
    offer?: boolean
    background?: boolean
    i9?: boolean
    visa?: boolean
  }
  recruiter?: string
  priority?: 'high' | 'medium' | 'normal'
  estimatedCompletion?: string
  notes?: string
}

interface UseRealTimeOnboardingOptions {
  refreshInterval?: number
  enableNotifications?: boolean
  statusFilter?: string
  searchTerm?: string
}

interface OnboardingUpdate {
  type: 'candidate_updated' | 'status_changed' | 'document_uploaded' | 'progress_updated'
  candidateId: string
  data: Partial<OnboardingCandidate>
  timestamp: string
  message?: string
}

export function useRealTimeOnboarding(options: UseRealTimeOnboardingOptions = {}) {
  const {
    refreshInterval = 30000, // 30 seconds
    enableNotifications = true,
    statusFilter,
    searchTerm
  } = options

  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [recentUpdates, setRecentUpdates] = useState<OnboardingUpdate[]>([])
  const [mounted, setMounted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationPermissionRef = useRef<NotificationPermission>('default')

  // Ensure we're on the client
  useEffect(() => {
    setMounted(true)
    setLastUpdate(new Date())
  }, [])

  // Request notification permission
  useEffect(() => {
    if (enableNotifications && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission
      })
    }
  }, [enableNotifications])

  const fetchCandidates = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (searchTerm) {
        params.set('search', searchTerm)
      }
      params.set('timestamp', new Date().toISOString())

      const response = await fetch(`/api/onboarding/candidates?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }

      const data = await response.json()
      const newCandidates = data.candidates || []
      
      // Detect changes for notifications
      if (candidates.length > 0 && enableNotifications) {
        detectChanges(candidates, newCandidates)
      }

      setCandidates(newCandidates)
      setLastUpdate(new Date())
      
    } catch (err) {
      console.error('Failed to fetch candidates:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm, candidates, enableNotifications])

  const detectChanges = useCallback((oldCandidates: OnboardingCandidate[], newCandidates: OnboardingCandidate[]) => {
    const updates: OnboardingUpdate[] = []

    newCandidates.forEach(newCandidate => {
      const oldCandidate = oldCandidates.find(c => c.id === newCandidate.id)
      
      if (!oldCandidate) {
        // New candidate added
        updates.push({
          type: 'candidate_updated',
          candidateId: newCandidate.id,
          data: newCandidate,
          timestamp: new Date().toISOString(),
          message: `New candidate ${newCandidate.name} added to onboarding`
        })
        
        showNotification('New Candidate', `${newCandidate.name} has been added to onboarding`)
      } else {
        // Check for status changes
        if (oldCandidate.status !== newCandidate.status) {
          updates.push({
            type: 'status_changed',
            candidateId: newCandidate.id,
            data: { status: newCandidate.status },
            timestamp: new Date().toISOString(),
            message: `${newCandidate.name} moved to ${newCandidate.status.replace('_', ' ')}`
          })
          
          showNotification('Status Update', `${newCandidate.name} moved to ${newCandidate.status.replace('_', ' ')}`)
        }

        // Check for progress changes
        if (oldCandidate.progress !== newCandidate.progress) {
          updates.push({
            type: 'progress_updated',
            candidateId: newCandidate.id,
            data: { progress: newCandidate.progress },
            timestamp: new Date().toISOString(),
            message: `${newCandidate.name} progress updated to ${newCandidate.progress}%`
          })
        }

        // Check for document updates
        if (oldCandidate.documents && newCandidate.documents) {
          const oldDocs = Object.entries(oldCandidate.documents).filter(([_, completed]) => completed)
          const newDocs = Object.entries(newCandidate.documents).filter(([_, completed]) => completed)
          
          if (newDocs.length > oldDocs.length) {
            const newDocTypes = newDocs.filter(([type]) => 
              !oldDocs.some(([oldType]) => oldType === type)
            ).map(([type]) => type)

            updates.push({
              type: 'document_uploaded',
              candidateId: newCandidate.id,
              data: { documents: newCandidate.documents },
              timestamp: new Date().toISOString(),
              message: `${newCandidate.name} uploaded ${newDocTypes.join(', ')}`
            })
            
            showNotification('Document Upload', `${newCandidate.name} uploaded new documents`)
          }
        }
      }
    })

    if (updates.length > 0) {
      setRecentUpdates(prev => [...updates, ...prev].slice(0, 20)) // Keep last 20 updates
    }
  }, [])

  const showNotification = useCallback((title: string, body: string) => {
    if (
      enableNotifications && 
      'Notification' in window && 
      notificationPermissionRef.current === 'granted' &&
      document.hidden // Only show notifications when tab is not active
    ) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'onboarding-update'
      })
    }
  }, [enableNotifications])

  const updateCandidate = useCallback(async (candidateId: string, updates: Partial<OnboardingCandidate>) => {
    try {
      const response = await fetch('/api/onboarding/candidates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateId, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update candidate')
      }

      // Optimistically update the local state
      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId ? { ...candidate, ...updates } : candidate
      ))

      // Refresh data to ensure consistency
      setTimeout(() => fetchCandidates(false), 1000)
      
    } catch (err) {
      console.error('Failed to update candidate:', err)
      throw err
    }
  }, [fetchCandidates])

  const addCandidate = useCallback(async (candidateData: Partial<OnboardingCandidate>) => {
    try {
      const response = await fetch('/api/onboarding/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      })

      if (!response.ok) {
        throw new Error('Failed to add candidate')
      }

      const result = await response.json()
      
      // Add to local state
      setCandidates(prev => [result.candidate, ...prev])
      
      showNotification('Candidate Added', `${result.candidate.name} has been added to onboarding`)
      
      return result.candidate
    } catch (err) {
      console.error('Failed to add candidate:', err)
      throw err
    }
  }, [showNotification])

  const getStatusCounts = useCallback(() => {
    const counts: Record<string, number> = {}
    candidates.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }, [candidates])

  const getRecentActivity = useCallback(() => {
    return recentUpdates.slice(0, 10)
  }, [recentUpdates])

  // Start real-time updates
  useEffect(() => {
    if (!mounted) return

    // Initial fetch
    fetchCandidates(true)

    // Set up interval for real-time updates
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchCandidates(false)
      }, refreshInterval)
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchCandidates, refreshInterval, mounted])

  // Refresh when filters change
  useEffect(() => {
    fetchCandidates(false)
  }, [statusFilter, searchTerm])

  // Page visibility API for smart refreshing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && refreshInterval > 0) {
        // Refresh when user returns to tab
        fetchCandidates(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchCandidates, refreshInterval])

  // Return safe defaults during SSR
  if (!mounted) {
    return {
      candidates: [],
      loading: true,
      error: null,
      lastUpdate: null,
      recentUpdates: [],
      statusCounts: {},
      updateCandidate: async () => {},
      addCandidate: async () => ({} as OnboardingCandidate),
      refresh: () => {},
      isRealTime: false
    }
  }

  return {
    candidates,
    loading,
    error,
    lastUpdate,
    recentUpdates: getRecentActivity(),
    statusCounts: getStatusCounts(),
    updateCandidate,
    addCandidate,
    refresh: () => fetchCandidates(true),
    isRealTime: refreshInterval > 0
  }
}