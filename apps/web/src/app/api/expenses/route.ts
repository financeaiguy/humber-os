import { NextRequest, NextResponse } from 'next/server'
import { TravelExpense, MiscExpense, TravelExpenseType, ExpenseCategory } from '@/types/invoicing'
import { withAuth, withRole, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
import { 
  travelExpenseSchema, 
  miscExpenseSchema, 
  expenseApprovalSchema,
  expenseFiltersSchema,
  validateRequestBody,
  createValidationResponse 
} from '@/lib/validation-schemas'
import { generateExpenseId } from '@/lib/secure-token-generator'

// Mock storage - replace with actual database
const travelExpenses = new Map<string, TravelExpense[]>()
const miscExpenses = new Map<string, MiscExpense[]>()

export async function POST(request: NextRequest) {
  try {
    const expenseData = await request.json()
    const { type } = expenseData
    
    // Validate input based on expense type
    let validationResult
    if (type === 'travel') {
      validationResult = validateRequestBody(travelExpenseSchema, expenseData)
    } else if (type === 'misc') {
      validationResult = validateRequestBody(miscExpenseSchema, expenseData)
    } else {
      return NextResponse.json(
        { error: 'Invalid expense type. Must be "travel" or "misc"' },
        { status: 400 }
      )
    }

    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const validatedData = validationResult.data

    let savedExpense
    
    if (type === 'travel') {
      savedExpense = await createTravelExpense(validatedData)
    } else {
      savedExpense = await createMiscExpense(validatedData)
    }

    // Auto-approve expenses under threshold or require approval
    const autoApproved = await checkAutoApproval(savedExpense, type)
    if (autoApproved) {
      savedExpense.approved = true
      savedExpense.approvedBy = 'system'
      savedExpense.approvedAt = new Date().toISOString()
    } else {
      // Send for approval
      await sendForApproval(savedExpense, type, projectId)
    }

    console.log(`💰 ${type} expense created:`, savedExpense.id, savedExpense.amount)

    return NextResponse.json({
      success: true,
      expense: savedExpense,
      autoApproved,
      message: autoApproved ? 'Expense auto-approved' : 'Expense submitted for approval'
    })

  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries())
    const validationResult = validateRequestBody(expenseFiltersSchema, queryParams)
    
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const { engineerId, projectId, type, status, startDate, endDate, page, limit } = validationResult.data

    let allExpenses: (TravelExpense | MiscExpense)[] = []

    // Get travel expenses
    if (!type || type === 'travel') {
      for (const expenses of travelExpenses.values()) {
        allExpenses.push(...expenses)
      }
    }

    // Get misc expenses
    if (!type || type === 'misc') {
      for (const expenses of miscExpenses.values()) {
        allExpenses.push(...expenses)
      }
    }

    // Apply filters
    let filteredExpenses = allExpenses

    if (engineerId) {
      filteredExpenses = filteredExpenses.filter(e => 
        'engineerId' in e ? e.engineerId === engineerId : e.submittedBy === engineerId
      )
    }

    if (projectId) {
      // Note: Add projectId to expense interfaces if needed
      // filteredExpenses = filteredExpenses.filter(e => e.projectId === projectId)
    }

    if (status === 'approved') {
      filteredExpenses = filteredExpenses.filter(e => e.approved)
    } else if (status === 'pending') {
      filteredExpenses = filteredExpenses.filter(e => !e.approved)
    }

    if (startDate && endDate) {
      filteredExpenses = filteredExpenses.filter(e => {
        const expenseDate = new Date(e.date)
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate)
      })
    }

    // Calculate totals
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const approvedAmount = filteredExpenses.filter(e => e.approved).reduce((sum, e) => sum + e.amount, 0)
    const pendingAmount = filteredExpenses.filter(e => !e.approved).reduce((sum, e) => sum + e.amount, 0)
    const reimbursableAmount = filteredExpenses.filter(e => e.reimbursable).reduce((sum, e) => sum + e.amount, 0)
    const billableAmount = filteredExpenses.filter(e => e.billableToClient).reduce((sum, e) => sum + e.amount, 0)

    return NextResponse.json({
      expenses: filteredExpenses,
      summary: {
        totalExpenses: filteredExpenses.length,
        totalAmount,
        approvedAmount,
        pendingAmount,
        reimbursableAmount,
        billableAmount
      }
    })

  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const requestData = await request.json()
    
    // Validate approval request
    const validationResult = validateRequestBody(expenseApprovalSchema, requestData)
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const { expenseId, action, approverId, notes } = validationResult.data

    const expense = await findExpenseById(expenseId)
    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      expense.approved = true
      expense.approvedBy = approverId
      expense.approvedAt = new Date().toISOString()
      
      console.log(`✅ Expense approved: ${expenseId} by ${approverId}`)
      
    } else if (action === 'reject') {
      expense.approved = false
      // Add rejection reason to notes or separate field
      
      console.log(`❌ Expense rejected: ${expenseId} by ${approverId}`)
    }

    return NextResponse.json({
      success: true,
      expense,
      message: `Expense ${action}d successfully`
    })

  } catch (error) {
    console.error('Update expense error:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

// Helper functions
async function createTravelExpense(data: any): Promise<TravelExpense> {
  const expense: TravelExpense = {
    id: generateExpenseId(),
    engineerId: data.engineerId,
    engineerName: data.engineerName,
    type: data.expenseType as TravelExpenseType,
    description: data.description,
    amount: data.amount,
    currency: data.currency || 'USD',
    date: data.date,
    location: data.location,
    receipt: data.receipt,
    mileage: data.mileage,
    mileageRate: data.mileageRate || 0.67, // IRS rate 2024
    approved: false,
    reimbursable: data.reimbursable !== false, // Default true
    billableToClient: data.billableToClient === true
  }

  // Calculate mileage amount if applicable
  if (expense.mileage && expense.mileageRate) {
    expense.amount = expense.mileage * expense.mileageRate
  }

  // Store expense
  const engineerExpenses = travelExpenses.get(data.engineerId) || []
  engineerExpenses.push(expense)
  travelExpenses.set(data.engineerId, engineerExpenses)

  return expense
}

async function createMiscExpense(data: any): Promise<MiscExpense> {
  const expense: MiscExpense = {
    id: generateExpenseId(),
    submittedBy: data.engineerId,
    submitterName: data.engineerName,
    category: data.category as ExpenseCategory,
    description: data.description,
    amount: data.amount,
    currency: data.currency || 'USD',
    date: data.date,
    receipt: data.receipt,
    approved: false,
    reimbursable: data.reimbursable !== false, // Default true
    billableToClient: data.billableToClient === true,
    taxDeductible: data.taxDeductible === true
  }

  // Store expense
  const submitterExpenses = miscExpenses.get(data.engineerId) || []
  submitterExpenses.push(expense)
  miscExpenses.set(data.engineerId, submitterExpenses)

  return expense
}

async function checkAutoApproval(expense: TravelExpense | MiscExpense, type: string): Promise<boolean> {
  // Auto-approve thresholds
  const autoApprovalLimits = {
    travel: {
      meals: 75,
      mileage: 200,
      parking: 50,
      fuel: 100,
      other: 100
    },
    misc: {
      office_supplies: 100,
      software: 50,
      communication: 75,
      other: 50
    }
  }

  if (type === 'travel') {
    const travelExpense = expense as TravelExpense
    const limit = autoApprovalLimits.travel[travelExpense.type] || autoApprovalLimits.travel.other
    return travelExpense.amount <= limit
  } else {
    const miscExpense = expense as MiscExpense
    const limit = autoApprovalLimits.misc[miscExpense.category] || autoApprovalLimits.misc.other
    return miscExpense.amount <= limit
  }
}

async function sendForApproval(expense: TravelExpense | MiscExpense, type: string, projectId: string) {
  // Mock approval notification - replace with actual notification service
  console.log(`📧 Sending expense for approval:`, {
    expenseId: expense.id,
    type,
    amount: expense.amount,
    projectId
  })
}

async function findExpenseById(expenseId: string): Promise<TravelExpense | MiscExpense | null> {
  // Search in travel expenses
  for (const expenses of travelExpenses.values()) {
    const expense = expenses.find(e => e.id === expenseId)
    if (expense) return expense
  }

  // Search in misc expenses
  for (const expenses of miscExpenses.values()) {
    const expense = expenses.find(e => e.id === expenseId)
    if (expense) return expense
  }

  return null
}

// Secure expense ID generation moved to secure-token-generator.ts