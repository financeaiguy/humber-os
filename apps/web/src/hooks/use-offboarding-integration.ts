'use client'

import { useState, useEffect } from 'react'

// Integration hook to connect off-boarding with projects, bull pen, and onboarding
export function useOffboardingIntegration() {
  const [integrationData, setIntegrationData] = useState({
    availableEngineers: [],
    activeProjects: [],
    onboardingQueue: [],
    bullPenStatus: null
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchIntegrationData()
  }, [])

  const fetchIntegrationData = async () => {
    try {
      setIsLoading(true)
      
      // In production, these would be real API calls
      const [engineers, projects, onboarding, bullPen] = await Promise.all([
        fetchAvailableEngineers(),
        fetchActiveProjects(),
        fetchOnboardingQueue(),
        fetchBullPenStatus()
      ])

      setIntegrationData({
        availableEngineers: engineers,
        activeProjects: projects,
        onboardingQueue: onboarding,
        bullPenStatus: bullPen
      })
    } catch (error) {
      // SECURITY: Removed console.error('Error fetching integration data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data functions - replace with real API calls in production
  const fetchAvailableEngineers = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: 'eng-001',
        name: 'John Smith',
        role: 'Senior Engineering Consultant',
        currentProject: 'GM Assembly Line Automation',
        clientName: 'General Motors',
        status: 'active',
        skillLevel: 'senior',
        location: 'Detroit, MI',
        billableRate: 150,
        utilizationRate: 95,
        performanceRating: 4.8,
        contractEndDate: '2024-12-31',
        availability: 'available_with_notice'
      },
      {
        id: 'eng-002',
        name: 'Maria Garcia',
        role: 'Manufacturing Engineer',
        currentProject: 'Ford Paint Shop Upgrade',
        clientName: 'Ford Motor Company',
        status: 'active',
        skillLevel: 'mid',
        location: 'Dearborn, MI',
        billableRate: 125,
        utilizationRate: 88,
        performanceRating: 4.6,
        contractEndDate: '2024-08-15',
        availability: 'immediate_termination_notice'
      },
      {
        id: 'eng-003',
        name: 'David Chen',
        role: 'Automation Specialist',
        currentProject: 'Stellantis QC System',
        clientName: 'Stellantis',
        status: 'active',
        skillLevel: 'senior',
        location: 'Auburn Hills, MI',
        billableRate: 140,
        utilizationRate: 92,
        performanceRating: 4.7,
        contractEndDate: '2024-10-30',
        availability: 'project_dependent'
      }
    ]
  }

  const fetchActiveProjects = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: 'proj-gm-001',
        name: 'GM Assembly Line Automation',
        client: 'General Motors',
        status: 'active',
        completion: 85,
        startDate: '2023-06-01',
        scheduledEndDate: '2024-01-30',
        actualEndDate: null,
        engineersAssigned: ['eng-001'],
        projectValue: 1200000,
        remainingValue: 180000,
        canOffboard: true,
        offboardingType: 'PROJECT_COMPLETION'
      },
      {
        id: 'proj-ford-002',
        name: 'Ford Paint Shop Upgrade',
        client: 'Ford Motor Company',
        status: 'active',
        completion: 45,
        startDate: '2023-09-15',
        scheduledEndDate: '2024-06-15',
        actualEndDate: null,
        engineersAssigned: ['eng-002'],
        projectValue: 800000,
        remainingValue: 440000,
        canOffboard: true,
        offboardingType: 'PROJECT_PAUSE'
      },
      {
        id: 'proj-stellantis-003',
        name: 'Stellantis QC System',
        client: 'Stellantis',
        status: 'paused',
        completion: 25,
        startDate: '2023-11-01',
        scheduledEndDate: '2024-08-01',
        actualEndDate: null,
        engineersAssigned: ['eng-003'],
        projectValue: 950000,
        remainingValue: 712500,
        canOffboard: true,
        offboardingType: 'PROJECT_TERMINATION'
      }
    ]
  }

  const fetchOnboardingQueue = async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return [
      {
        id: 'onboard-001',
        engineerName: 'Michael Torres',
        expectedStartDate: '2024-02-01',
        targetProject: 'New Toyota Assembly Project',
        status: 'documentation_pending',
        skillLevel: 'senior',
        replacementFor: null
      },
      {
        id: 'onboard-002',
        engineerName: 'Sarah Kim',
        expectedStartDate: '2024-02-15',
        targetProject: 'Tesla Model Y Line Optimization',
        status: 'visa_processing',
        skillLevel: 'mid',
        replacementFor: 'eng-002'
      }
    ]
  }

  const fetchBullPenStatus = async () => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return {
      availableCount: 12,
      deployedCount: 36,
      inTransitCount: 8,
      benchedCount: 4,
      totalUtilization: 87,
      averageReadiness: 4.2,
      criticalSkills: ['Automation', 'Quality Systems', 'PLC Programming'],
      upcomingAvailability: [
        {
          engineerId: 'eng-005',
          engineerName: 'Alex Rodriguez',
          availableDate: '2024-02-01',
          currentProject: 'Nissan Welding Line',
          reason: 'project_completion'
        },
        {
          engineerId: 'eng-006',
          engineerName: 'Emily Watson',
          availableDate: '2024-02-10',
          currentProject: 'BMW Paint Quality',
          reason: 'contract_end'
        }
      ]
    }
  }

  // Helper functions for off-boarding integration
  const getEngineerById = (engineerId: string) => {
    return integrationData.availableEngineers.find(eng => eng.id === engineerId)
  }

  const getProjectById = (projectId: string) => {
    return integrationData.activeProjects.find(proj => proj.id === projectId)
  }

  const getReplacementCandidates = (engineerId: string) => {
    const engineer = getEngineerById(engineerId)
    if (!engineer) return []

    // Find engineers with similar skills or replacements in onboarding
    return integrationData.onboardingQueue.filter(candidate => 
      candidate.replacementFor === engineerId || 
      candidate.skillLevel === engineer.skillLevel
    )
  }

  const calculateOffboardingImpact = (engineerId: string, projectId: string) => {
    const engineer = getEngineerById(engineerId)
    const project = getProjectById(projectId)

    if (!engineer || !project) {
      return {
        financialImpact: 0,
        scheduleImpact: 0,
        riskLevel: 'unknown'
      }
    }

    const remainingWork = (100 - project.completion) / 100
    const potentialRevenueLoss = project.remainingValue * remainingWork
    const scheduleDelayWeeks = engineer.skillLevel === 'senior' ? 2 : 1
    
    let riskLevel = 'low'
    if (potentialRevenueLoss > 100000 || scheduleDelayWeeks > 3) riskLevel = 'high'
    else if (potentialRevenueLoss > 50000 || scheduleDelayWeeks > 1) riskLevel = 'medium'

    return {
      financialImpact: potentialRevenueLoss,
      scheduleImpact: scheduleDelayWeeks,
      riskLevel,
      utilizationImpact: engineer.utilizationRate,
      hasReplacement: getReplacementCandidates(engineerId).length > 0
    }
  }

  const updateBullPenStatus = async (engineerId: string, newStatus: 'available' | 'transitioning' | 'offboarded') => {
    // In production, this would update the bull pen system
    // SECURITY: Removed // SECURITY: Removed console.log(`Updating bull pen status for ${engineerId} to ${newStatus}`)
    
    // Refresh integration data
    await fetchIntegrationData()
  }

  const notifyStakeholders = async (offboardingRequest: any) => {
    // In production, this would send notifications to relevant stakeholders
    const engineer = getEngineerById(offboardingRequest.engineerId)
    const project = getProjectById(offboardingRequest.projectId)
    
    const notifications = []
    
    // Notify project manager
    notifications.push({
      recipient: 'project_manager',
      type: 'offboarding_initiated',
      engineer: engineer?.name,
      project: project?.name,
      scheduledDate: offboardingRequest.scheduledDate
    })
    
    // Notify HR for terminations
    if (offboardingRequest.type.includes('TERMINATION')) {
      notifications.push({
        recipient: 'hr_team',
        type: 'employee_termination',
        engineer: engineer?.name,
        reason: offboardingRequest.reason
      })
    }
    
    // Notify finance for payment processing
    notifications.push({
      recipient: 'finance_team',
      type: 'financial_processing',
      engineer: engineer?.name,
      finalPayment: offboardingRequest.financialImpact.finalPayment
    })

    // SECURITY: Removed // SECURITY: Removed console.log('Sending notifications:', notifications)
    return notifications
  }

  return {
    integrationData,
    isLoading,
    refetch: fetchIntegrationData,
    
    // Helper functions
    getEngineerById,
    getProjectById,
    getReplacementCandidates,
    calculateOffboardingImpact,
    updateBullPenStatus,
    notifyStakeholders
  }
}