/**
 * Production-ready storage layer for recruits data
 * In production, this would connect to a real database (PostgreSQL, MongoDB, etc.)
 */

interface Recruit {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  status: 'pending' | 'interviewed' | 'offered' | 'onboarding' | 'onboarded' | 'rejected'
  createdAt: string
  updatedAt: string
  onboardingData?: OnboardingData
  consentData?: ConsentData
}

interface OnboardingData {
  startDate: string
  salary: string
  location: string
  certifications: string[]
  skills: string[]
  onboardingSteps: OnboardingStep[]
  onboardingDate?: string
}

interface OnboardingStep {
  step: string
  completed: boolean
  completedAt?: string
}

interface ConsentData {
  consents: ConsentRecord[]
  gdprCompliant: boolean
  lastUpdated: string
}

interface ConsentRecord {
  type: 'privacy' | 'marketing' | 'biometric' | 'data_processing'
  given: boolean
  timestamp: string | null
  version: string
  text?: string
}

// In-memory storage for development/testing
// In production, replace with actual database calls
class RecruitsStorage {
  private static instance: RecruitsStorage
  private recruits: Map<string, Recruit> = new Map()

  private constructor() {
    // Initialize with sample data
    this.initializeSampleData()
  }

  static getInstance(): RecruitsStorage {
    if (!RecruitsStorage.instance) {
      RecruitsStorage.instance = new RecruitsStorage()
    }
    return RecruitsStorage.instance
  }

  private initializeSampleData() {
    const sampleRecruits: Recruit[] = [
      {
        id: 'rec_123',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        position: 'Senior Mechanical Engineer',
        department: 'Engineering',
        status: 'offered',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingData: {
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          salary: '$85,000',
          location: 'Detroit, MI',
          certifications: ['ABC Manufacturing', 'PLC Programming'],
          skills: ['AutoCAD', 'SolidWorks', 'ANSYS'],
          onboardingSteps: [
            { step: 'Document Verification', completed: false },
            { step: 'Background Check', completed: false },
            { step: 'IT Equipment Setup', completed: false },
            { step: 'Safety Training', completed: false },
            { step: 'Team Introduction', completed: false }
          ]
        },
        consentData: {
          consents: [
            { type: 'privacy', given: false, timestamp: null, version: '1.0' },
            { type: 'marketing', given: false, timestamp: null, version: '1.0' },
            { type: 'biometric', given: false, timestamp: null, version: '1.0' }
          ],
          gdprCompliant: false,
          lastUpdated: new Date().toISOString()
        }
      },
      {
        id: 'rec_456',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@example.com',
        phone: '(555) 234-5678',
        position: 'Quality Control Specialist',
        department: 'Operations',
        status: 'interviewed',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    sampleRecruits.forEach(recruit => {
      this.recruits.set(recruit.id, recruit)
    })
  }

  // CRUD Operations
  async getRecruit(id: string): Promise<Recruit | null> {
    return this.recruits.get(id) || null
  }

  async getAllRecruits(): Promise<Recruit[]> {
    return Array.from(this.recruits.values())
  }

  async createRecruit(data: Omit<Recruit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recruit> {
    const recruit: Recruit = {
      ...data,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.recruits.set(recruit.id, recruit)
    return recruit
  }

  async updateRecruit(id: string, updates: Partial<Recruit>): Promise<Recruit | null> {
    const recruit = this.recruits.get(id)
    if (!recruit) return null

    const updatedRecruit = {
      ...recruit,
      ...updates,
      id: recruit.id, // Ensure ID can't be changed
      createdAt: recruit.createdAt, // Ensure creation date can't be changed
      updatedAt: new Date().toISOString()
    }

    this.recruits.set(id, updatedRecruit)
    return updatedRecruit
  }

  async deleteRecruit(id: string): Promise<boolean> {
    return this.recruits.delete(id)
  }

  // Onboarding specific operations
  async updateOnboarding(id: string, onboardingData: Partial<OnboardingData>): Promise<Recruit | null> {
    const recruit = await this.getRecruit(id)
    if (!recruit) return null

    const updatedRecruit = {
      ...recruit,
      status: 'onboarding' as const,
      onboardingData: {
        ...recruit.onboardingData,
        ...onboardingData
      },
      updatedAt: new Date().toISOString()
    }

    this.recruits.set(id, updatedRecruit)
    return updatedRecruit
  }

  async completeOnboarding(id: string): Promise<Recruit | null> {
    const recruit = await this.getRecruit(id)
    if (!recruit) return null

    const updatedRecruit = {
      ...recruit,
      status: 'onboarded' as const,
      onboardingData: {
        ...recruit.onboardingData!,
        onboardingDate: new Date().toISOString(),
        onboardingSteps: recruit.onboardingData?.onboardingSteps.map(step => ({
          ...step,
          completed: true,
          completedAt: new Date().toISOString()
        })) || []
      },
      updatedAt: new Date().toISOString()
    }

    this.recruits.set(id, updatedRecruit)
    return updatedRecruit
  }

  // Consent specific operations
  async updateConsent(id: string, consentType: string, given: boolean, text?: string): Promise<Recruit | null> {
    const recruit = await this.getRecruit(id)
    if (!recruit) return null

    const consentData = recruit.consentData || {
      consents: [],
      gdprCompliant: false,
      lastUpdated: new Date().toISOString()
    }

    const existingConsentIndex = consentData.consents.findIndex(c => c.type === consentType)
    
    if (existingConsentIndex >= 0) {
      consentData.consents[existingConsentIndex] = {
        ...consentData.consents[existingConsentIndex],
        given,
        timestamp: given ? new Date().toISOString() : null,
        text
      }
    } else {
      consentData.consents.push({
        type: consentType as any,
        given,
        timestamp: given ? new Date().toISOString() : null,
        version: '1.0',
        text
      })
    }

    // Check GDPR compliance (privacy consent must be given)
    consentData.gdprCompliant = consentData.consents.some(c => c.type === 'privacy' && c.given)
    consentData.lastUpdated = new Date().toISOString()

    const updatedRecruit = {
      ...recruit,
      consentData,
      updatedAt: new Date().toISOString()
    }

    this.recruits.set(id, updatedRecruit)
    return updatedRecruit
  }

  async withdrawAllConsents(id: string): Promise<Recruit | null> {
    const recruit = await this.getRecruit(id)
    if (!recruit) return null

    const consentData = {
      consents: recruit.consentData?.consents.map(c => ({
        ...c,
        given: false,
        timestamp: null
      })) || [],
      gdprCompliant: false,
      lastUpdated: new Date().toISOString()
    }

    const updatedRecruit = {
      ...recruit,
      consentData,
      updatedAt: new Date().toISOString()
    }

    this.recruits.set(id, updatedRecruit)
    return updatedRecruit
  }
}

export const recruitsStorage = RecruitsStorage.getInstance()
export type { Recruit, OnboardingData, ConsentData, ConsentRecord, OnboardingStep }