import { NextRequest, NextResponse } from 'next/server'
import { Invoice, InvoiceLineItem, EngineerCostBreakdown } from '@/types/invoicing'
import { projectCostCalculator } from '@/lib/project-cost-calculator'

export async function POST(request: NextRequest) {
  try {
    const { 
      projectId, 
      invoiceType, 
      billingPeriod, 
      includeExpenses, 
      includeTravel, 
      customLineItems,
      clientEmail,
      dueDate 
    } = await request.json()
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Generate comprehensive invoice based on project data
    const invoice = await generateProjectInvoice({
      projectId,
      invoiceType: invoiceType || 'project_milestone',
      billingPeriod,
      includeExpenses: includeExpenses !== false,
      includeTravel: includeTravel !== false,
      customLineItems: customLineItems || [],
      clientEmail,
      dueDate
    })

    console.log(`📄 Generated invoice ${invoice.invoiceNumber} for project ${projectId}`)

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice generated successfully'
    })

  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const clientEmail = searchParams.get('clientEmail')

    // Mock invoice storage - replace with actual database
    let invoices = await getMockInvoices()

    // Apply filters
    if (projectId) {
      invoices = invoices.filter(inv => inv.projectId === projectId)
    }

    if (status) {
      invoices = invoices.filter(inv => inv.status === status)
    }

    if (clientEmail) {
      invoices = invoices.filter(inv => inv.clientEmail === clientEmail)
    }

    return NextResponse.json({
      invoices,
      total: invoices.length
    })

  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

interface InvoiceGenerationOptions {
  projectId: string
  invoiceType: string
  billingPeriod?: { start: string; end: string }
  includeExpenses: boolean
  includeTravel: boolean
  customLineItems: InvoiceLineItem[]
  clientEmail?: string
  dueDate?: string
}

async function generateProjectInvoice(options: InvoiceGenerationOptions): Promise<Invoice> {
  const {
    projectId,
    invoiceType,
    billingPeriod,
    includeExpenses,
    includeTravel,
    customLineItems,
    clientEmail,
    dueDate
  } = options

  // Get project details
  const project = await getProjectDetails(projectId)
  
  // Calculate dynamic costs
  const budgetBreakdown = await projectCostCalculator.generateBudgetBreakdown(projectId)
  const engineers = await getProjectEngineers(projectId)
  const hourlyRates = await getHourlyRates()
  const engineerCosts = await projectCostCalculator.calculateEngineerCosts(engineers, hourlyRates)
  
  // Generate line items
  const lineItems: InvoiceLineItem[] = []
  
  // Add engineer costs as line items
  for (const engineerCost of engineerCosts) {
    lineItems.push({
      id: generateLineItemId(),
      description: `Engineering Services - ${engineerCost.engineerName} (${engineerCost.engineerRole})`,
      quantity: engineerCost.hoursWorked,
      unitPrice: engineerCost.hourlyRate,
      amount: engineerCost.totalCost,
      category: 'engineering_hours',
      engineerId: engineerCost.engineerId,
      engineerName: engineerCost.engineerName,
      hours: engineerCost.hoursWorked
    })

    // Add overtime if applicable
    if (engineerCost.overtime && engineerCost.overtimeHours && engineerCost.overtimeCost) {
      lineItems.push({
        id: generateLineItemId(),
        description: `Overtime - ${engineerCost.engineerName} (${engineerCost.engineerRole})`,
        quantity: engineerCost.overtimeHours,
        unitPrice: engineerCost.overtimeRate!,
        amount: engineerCost.overtimeCost,
        category: 'engineering_hours',
        engineerId: engineerCost.engineerId,
        engineerName: engineerCost.engineerName,
        hours: engineerCost.overtimeHours
      })
    }
  }

  // Add expenses if requested
  if (includeExpenses) {
    const expenses = await getProjectExpenses(projectId, { includeTravel })
    for (const expense of expenses) {
      if (expense.billableToClient && expense.approved) {
        lineItems.push({
          id: generateLineItemId(),
          description: `Expense - ${expense.description}`,
          quantity: 1,
          unitPrice: expense.amount,
          amount: expense.amount,
          category: 'travel_expenses',
          datePerformed: expense.date
        })
      }
    }
  }

  // Add soft costs
  const softCostItems = await getProjectSoftCosts(projectId)
  const softCosts = projectCostCalculator.calculateSoftCosts(softCostItems)
  for (const item of softCostItems) {
    if (item.approved) {
      lineItems.push({
        id: generateLineItemId(),
        description: `${item.category} - ${item.name}`,
        quantity: item.quantity,
        unitPrice: item.unitCost,
        amount: item.totalCost,
        category: 'software_licenses'
      })
    }
  }

  // Add hard costs
  const hardCostItems = await getProjectHardCosts(projectId)
  const hardCosts = projectCostCalculator.calculateHardCosts(hardCostItems)
  for (const item of hardCostItems) {
    if (item.approved) {
      lineItems.push({
        id: generateLineItemId(),
        description: `${item.category} - ${item.name}`,
        quantity: item.quantity,
        unitPrice: item.unitCost,
        amount: item.totalCost,
        category: 'materials'
      })
    }
  }

  // Add custom line items
  lineItems.push(...customLineItems)

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = await getTaxRate(project.clientId)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  // Generate invoice
  const invoice: Invoice = {
    id: generateInvoiceId(),
    invoiceNumber: await generateInvoiceNumber(),
    projectId,
    projectName: project.name,
    clientId: project.clientId,
    clientName: project.clientName,
    clientEmail: clientEmail || project.clientEmail,
    
    status: 'draft',
    type: invoiceType as any,
    description: `Invoice for ${project.name} - ${invoiceType.replace('_', ' ')}`,
    lineItems,
    
    // Dynamic costs
    engineerCosts,
    totalEngineerHours: engineerCosts.reduce((sum, ec) => sum + ec.hoursWorked, 0),
    totalEngineerCost: engineerCosts.reduce((sum, ec) => sum + ec.totalCost, 0),
    softCosts,
    hardCosts,
    travelExpenses: includeTravel ? await getProjectTravelExpenses(projectId) : [],
    miscExpenses: includeExpenses ? await getProjectMiscExpenses(projectId) : [],
    
    // Financial
    subtotal,
    taxRate,
    taxAmount,
    total,
    currency: 'USD',
    
    // Approval
    approvalStatus: 'pending',
    approvals: [],
    requiredApprovers: ['admin'], // Will be determined by amount
    
    // Dates
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || getDefaultDueDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Customer Portal
    customerPortalAccess: true,
    
    billableHours: lineItems
      .filter(item => item.category === 'engineering_hours')
      .reduce((sum, item) => sum + (item.hours || 0), 0)
  }

  // Store invoice (mock storage)
  await storeInvoice(invoice)

  return invoice
}

// Helper functions
async function getProjectDetails(projectId: string) {
  // Mock project data - replace with actual database query
  return {
    id: projectId,
    name: 'GM Assembly Line Automation',
    clientId: 'client-gm',
    clientName: 'General Motors',
    clientEmail: 'customer@gm.com',
    status: 'in_progress'
  }
}

async function getProjectEngineers(projectId: string) {
  // Mock engineer deployment data
  return [
    {
      id: '1',
      projectId,
      engineerId: 'eng-001',
      engineerName: 'Sarah Johnson',
      role: 'Lead Electrical Engineer',
      deploymentDate: '2024-10-15',
      status: 'active' as any,
      location: 'Detroit, MI',
      travelRequired: true,
      accommodationRequired: true,
      estimatedDuration: 90,
      costEstimate: 150000,
      approvedBy: 'admin-001',
      approvedAt: '2024-10-14'
    }
  ]
}

async function getHourlyRates() {
  return new Map([
    ['eng-001', 175],
    ['eng-002', 150],
    ['eng-003', 160]
  ])
}

async function getProjectExpenses(projectId: string, options: { includeTravel: boolean }) {
  // Mock expense data - replace with actual database query
  return [
    {
      id: 'exp-001',
      description: 'Client dinner meeting',
      amount: 125.50,
      date: '2024-11-01',
      billableToClient: true,
      approved: true
    }
  ]
}

async function getProjectSoftCosts(projectId: string) {
  return []
}

async function getProjectHardCosts(projectId: string) {
  return []
}

async function getProjectTravelExpenses(projectId: string) {
  return []
}

async function getProjectMiscExpenses(projectId: string) {
  return []
}

async function getTaxRate(clientId: string): Promise<number> {
  // Return tax rate based on client location
  const taxRates = {
    'client-gm': 6.0, // Michigan
    'partner-ford': 6.0, // Michigan
    'client-stellantis': 6.0 // Michigan
  }
  return taxRates[clientId as keyof typeof taxRates] || 0
}

function getDefaultDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30) // 30 days from now
  return date.toISOString().split('T')[0]
}

async function storeInvoice(invoice: Invoice) {
  console.log('📄 Storing invoice:', invoice.invoiceNumber)
  // Mock storage - implement actual database storage
}

async function getMockInvoices(): Promise<Invoice[]> {
  // Return mock invoices for demo
  return []
}

function generateInvoiceId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateLineItemId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  return `HMB-${year}${month}-${sequence}`
}