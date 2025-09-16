import { useState, useEffect, useRef, useCallback } from 'react'
import { unifiedDataCollector } from '@/lib/unified-data-collector'

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
}

interface UseRealTimeOnboardingOptions {
  refreshInterval?: number
  enableNotifications?: boolean
  statusFilter?: string
  searchTerm?: string
}

interface RecentUpdate {
  message: string
  timestamp: Date
  type: 'status_change' | 'document_upload' | 'progress_update'
}

export function useRealTimeOnboarding(options: UseRealTimeOnboardingOptions = {}) {
  const {
    refreshInterval = 30000,
    enableNotifications = true,
    statusFilter,
    searchTerm
  } = options

  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [isRealTime, setIsRealTime] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const wsRef = useRef<WebSocket>()

  const generateMockData = useCallback(() => {
    const statuses: OnboardingCandidate['status'][] = ['vetting', 'offer_letter', 'legal', 'immigration', 'final_review', 'completed']
    const names = [
      'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 
      'Robert Wilson', 'Lisa Anderson', 'David Martinez', 'Jennifer Taylor',
      'William Brown', 'Maria Garcia', 'James Rodriguez', 'Patricia Lee'
    ]
    const roles = [
      'Senior Software Engineer', 'DevOps Engineer', 'Full Stack Developer',
      'Cloud Architect', 'Data Engineer', 'ML Engineer', 'Frontend Developer',
      'Backend Developer', 'Platform Engineer', 'Site Reliability Engineer'
    ]
    const locations = ['San Francisco, CA', 'Austin, TX', 'New York, NY', 'Seattle, WA', 'Remote']

    return names.map((name, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const phase = statuses.indexOf(status) + 1
      const progress = Math.min(100, (phase / 6) * 100 + Math.random() * 20)
      
      return {
        id: `candidate_${index + 1}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        role: roles[index % roles.length],
        status,
        phase,
        progress: Math.floor(progress),
        startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString(),
        assignedTo: `org_${Math.floor(Math.random() * 5) + 1}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        documents: {
          resume: Math.random() > 0.2,
          offer: status !== 'vetting' && Math.random() > 0.3,
          background: ['legal', 'immigration', 'final_review', 'completed'].includes(status) && Math.random() > 0.2,
          i9: ['immigration', 'final_review', 'completed'].includes(status) && Math.random() > 0.3,
          visa: status === 'immigration' && Math.random() > 0.5
        }
      }
    })
  }, [])

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true)
      
      // Generate mock data for now
      const mockData = generateMockData()
      setCandidates(mockData)
      
      // Calculate status counts
      const counts: Record<string, number> = {}
      mockData.forEach(candidate => {
        counts[candidate.status] = (counts[candidate.status] || 0) + 1
      })
      setStatusCounts(counts)
      
      // Collect data for each candidate
      for (const candidate of mockData) {
        await unifiedDataCollector.collectOnboardingData(
          candidate.id,
          {
            name: `${candidate.status}_check`,
            status: 'completed',
            duration: Math.random() * 3600000,
            attempts: 1,
            data: {
              candidateName: candidate.name,
              role: candidate.role,
              progress: candidate.progress,
              documents: candidate.documents
            }
          }
        )

        // Also collect recruitment pipeline data
        await unifiedDataCollector.collectRecruitmentData(
          candidate.id,
          'pipeline',
          {
            stage: candidate.status,
            enteredAt: new Date(candidate.startDate),
            status: 'active',
            notes: [`Candidate in ${candidate.status} phase`],
            scores: { progress: candidate.progress }
          }
        )
      }
      
      setLastUpdate(new Date())
      setError(null)
      
      // Simulate recent updates
      if (Math.random() > 0.5) {
        const newUpdate: RecentUpdate = {
          message: `${mockData[0].name} moved to ${mockData[0].status} stage`,
          timestamp: new Date(),
          type: 'status_change'
        }
        setRecentUpdates(prev => [newUpdate, ...prev].slice(0, 10))
      }
      
    } catch (err) {
      setError('Failed to fetch candidates')
      console.error('Error fetching candidates:', err)
    } finally {
      setLoading(false)
    }
  }, [generateMockData])

  const updateCandidate = useCallback(async (
    candidateId: string,
    updates: Partial<OnboardingCandidate>
  ) => {
    try {
      // Update local state
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, ...updates } : c
      ))
      
      // Collect update data
      if (updates.status) {
        await unifiedDataCollector.collectOnboardingData(
          candidateId,
          {
            name: 'status_update',
            status: 'completed',
            duration: 0,
            attempts: 1,
            data: updates
          }
        )
      }
      
      // Add to recent updates
      const candidate = candidates.find(c => c.id === candidateId)
      if (candidate) {
        const newUpdate: RecentUpdate = {
          message: `${candidate.name} updated: ${Object.keys(updates).join(', ')}`,
          timestamp: new Date(),
          type: 'progress_update'
        }
        setRecentUpdates(prev => [newUpdate, ...prev].slice(0, 10))
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error updating candidate:', err)
      throw err
    }
  }, [candidates])

  const refresh = useCallback(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Set up WebSocket for real-time updates (simulated)
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Simulate WebSocket connection
        setIsRealTime(true)
        
        // Simulate random updates
        const updateInterval = setInterval(() => {
          if (Math.random() > 0.7) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)]
            if (randomCandidate) {
              const newUpdate: RecentUpdate = {
                message: `${randomCandidate.name} activity detected`,
                timestamp: new Date(),
                type: Math.random() > 0.5 ? 'document_upload' : 'progress_update'
              }
              setRecentUpdates(prev => [newUpdate, ...prev].slice(0, 10))
            }
          }
        }, 10000)
        
        return () => clearInterval(updateInterval)
      } catch (err) {
        console.error('WebSocket connection failed:', err)
        setIsRealTime(false)
      }
    }
    
    const cleanup = connectWebSocket()
    return cleanup
  }, [candidates])

  // Set up polling interval
  useEffect(() => {
    fetchCandidates()
    
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchCandidates, refreshInterval)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchCandidates, refreshInterval])

  // Handle notifications
  useEffect(() => {
    if (!enableNotifications || recentUpdates.length === 0) return
    
    const latestUpdate = recentUpdates[0]
    if (latestUpdate && (Date.now() - latestUpdate.timestamp.getTime()) < 5000) {
      // Could trigger browser notification here if needed
      console.log('New update:', latestUpdate.message)
    }
  }, [recentUpdates, enableNotifications])

  return {
    candidates,
    loading,
    error,
    lastUpdate,
    recentUpdates,
    statusCounts,
    updateCandidate,
    refresh,
    isRealTime
  }
}