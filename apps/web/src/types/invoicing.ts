export interface Invoice {
  id: string
  invoiceNumber: string
  projectId: string
  projectName: string
  clientId: string
  clientName: string
  clientEmail: string
  
  // Invoice Details
  status: InvoiceStatus
  type: InvoiceType
  description: string
  lineItems: InvoiceLineItem[]
  
  // Dynamic Cost Calculation
  engineerCosts: EngineerCostBreakdown[]
  totalEngineerHours: number
  totalEngineerCost: number
  softCosts: ProjectSoftCosts
  hardCosts: ProjectHardCosts
  travelExpenses: TravelExpense[]
  miscExpenses: MiscExpense[]
  
  // Financial
  subtotal: number
  taxRate: number
  taxAmount: number
  discountAmount?: number
  total: number
  currency: string
  
  // Approval Chain
  approvalStatus: ApprovalStatus
  approvals: ProjectApproval[]
  requiredApprovers: ApproverType[]
  
  // Dates
  issueDate: string
  dueDate: string
  paidDate?: string
  createdAt: string
  updatedAt: string
  
  // Payment
  paymentMethod?: PaymentMethod
  paymentLink?: string
  paymentLinkExpiry?: string
  transactionId?: string
  
  // Customer Portal
  customerPortalAccess: boolean
  portalToken?: string
  portalExpiryDate?: string
  
  // Metadata
  notes?: string
  attachments?: InvoiceAttachment[]
  billableHours?: number
  hourlyRate?: number
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  category: LineItemCategory
  engineerId?: string
  engineerName?: string
  datePerformed?: string
  hours?: number
}

export interface InvoiceAttachment {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  uploadedAt: string
}

export interface CustomerPortalAccess {
  invoiceId: string
  clientEmail: string
  accessToken: string
  expiryDate: string
  isActive: boolean
  lastAccessed?: string
  paymentCompleted: boolean
}

export interface PaymentRecord {
  id: string
  invoiceId: string
  amount: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  transactionId: string
  gatewayResponse: any
  processedAt: string
  refundedAmount?: number
  refundedAt?: string
}

export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial_payment'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded'

export type InvoiceType = 
  | 'project_milestone'
  | 'hourly_billing'
  | 'fixed_price'
  | 'expense_reimbursement'
  | 'recurring'

export type PaymentMethod = 
  | 'credit_card'
  | 'bank_transfer'
  | 'check'
  | 'wire_transfer'
  | 'paypal'
  | 'stripe'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type LineItemCategory = 
  | 'engineering_hours'
  | 'materials'
  | 'equipment_rental'
  | 'travel_expenses'
  | 'software_licenses'
  | 'consulting'
  | 'project_management'
  | 'other'

// Project Billing Configuration
export interface ProjectBillingConfig {
  projectId: string
  billingType: InvoiceType
  hourlyRate?: number
  milestones?: ProjectMilestone[]
  autoInvoicing: boolean
  invoiceFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'milestone' | 'completion'
  paymentTerms: number // days
  lateFeeRate?: number
  customerPortalEnabled: boolean
  allowPartialPayments: boolean
}

export interface ProjectMilestone {
  id: string
  name: string
  description: string
  amount: number
  dueDate: string
  completed: boolean
  invoiced: boolean
  invoiceId?: string
}

// Customer Portal Session
export interface CustomerPortalSession {
  sessionId: string
  clientEmail: string
  accessibleInvoices: string[]
  loginTime: string
  expiryTime: string
  ipAddress: string
  userAgent: string
}

// Dynamic Cost Calculation Interfaces
export interface EngineerCostBreakdown {
  engineerId: string
  engineerName: string
  engineerRole: string
  hourlyRate: number
  hoursWorked: number
  totalCost: number
  costCenter: string
  billable: boolean
  overtime: boolean
  overtimeRate?: number
  overtimeHours?: number
  overtimeCost?: number
}

export interface ProjectSoftCosts {
  softwareLicenses: CostItem[]
  cloudServices: CostItem[]
  subscriptions: CostItem[]
  training: CostItem[]
  consulting: CostItem[]
  documentation: CostItem[]
  total: number
}

export interface ProjectHardCosts {
  equipment: CostItem[]
  materials: CostItem[]
  tools: CostItem[]
  infrastructure: CostItem[]
  shipping: CostItem[]
  installation: CostItem[]
  total: number
}

export interface CostItem {
  id: string
  name: string
  description: string
  category: string
  unitCost: number
  quantity: number
  totalCost: number
  vendor?: string
  purchaseDate: string
  warrantyInfo?: string
  approved: boolean
  approvedBy?: string
  approvedAt?: string
}

export interface TravelExpense {
  id: string
  engineerId: string
  engineerName: string
  type: TravelExpenseType
  description: string
  amount: number
  currency: string
  date: string
  location: string
  receipt?: string
  mileage?: number
  mileageRate?: number
  approved: boolean
  approvedBy?: string
  approvedAt?: string
  reimbursable: boolean
  billableToClient: boolean
}

export interface MiscExpense {
  id: string
  submittedBy: string
  submitterName: string
  category: ExpenseCategory
  description: string
  amount: number
  currency: string
  date: string
  receipt?: string
  approved: boolean
  approvedBy?: string
  approvedAt?: string
  reimbursable: boolean
  billableToClient: boolean
  taxDeductible: boolean
}

export interface ProjectApproval {
  id: string
  projectId: string
  approverType: ApproverType
  approverId: string
  approverName: string
  approverEmail: string
  status: ApprovalStatus
  approvalDate?: string
  rejectionReason?: string
  notes?: string
  budgetLimit?: number
  conditions?: string[]
}

export interface ProjectBudgetAllocation {
  projectId: string
  totalBudget: number
  allocatedBudget: number
  remainingBudget: number
  engineerBudget: number
  softCostBudget: number
  hardCostBudget: number
  travelBudget: number
  contingencyBudget: number
  utilizationPercentage: number
  forecastedTotal: number
  budgetVariance: number
  lastUpdated: string
}

export interface EngineerDeployment {
  id: string
  projectId: string
  engineerId: string
  engineerName: string
  role: string
  deploymentDate: string
  endDate?: string
  status: DeploymentStatus
  location: string
  travelRequired: boolean
  accommodationRequired: boolean
  estimatedDuration: number // days
  actualDuration?: number
  costEstimate: number
  actualCost?: number
  approvedBy: string
  approvedAt: string
}

// Enums and Types
export type TravelExpenseType = 
  | 'airfare'
  | 'hotel'
  | 'meals'
  | 'ground_transport'
  | 'mileage'
  | 'parking'
  | 'fuel'
  | 'car_rental'
  | 'other'

export type ExpenseCategory = 
  | 'office_supplies'
  | 'equipment'
  | 'software'
  | 'training'
  | 'marketing'
  | 'utilities'
  | 'communication'
  | 'professional_services'
  | 'other'

export type ApproverType = 
  | 'operator'
  | 'partner'
  | 'admin'
  | 'finance'
  | 'project_manager'

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'requires_revision'
  | 'conditionally_approved'

export type DeploymentStatus = 
  | 'planned'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

// Cost Calculation Service Interface
export interface ProjectCostCalculator {
  calculateEngineerCosts(engineers: EngineerDeployment[], hourlyRates: Map<string, number>): Promise<EngineerCostBreakdown[]>
  calculateSoftCosts(items: CostItem[]): ProjectSoftCosts
  calculateHardCosts(items: CostItem[]): ProjectHardCosts
  calculateTotalProjectCost(projectId: string): Promise<number>
  validateBudgetAllocation(projectId: string, proposedCosts: number): Promise<boolean>
  generateCostForecast(projectId: string, completionPercentage: number): Promise<number>
}