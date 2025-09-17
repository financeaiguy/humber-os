import { NextRequest, NextResponse } from 'next/server'
import { PaymentRecord, PaymentStatus, PaymentMethod } from '@/types/invoicing'

// Mock payment storage - replace with actual database
const paymentRecords = new Map<string, PaymentRecord[]>()

export async function POST(request: NextRequest) {
  try {
    const { 
      invoiceId, 
      amount, 
      paymentMethod, 
      customerEmail, 
      returnUrl,
      cancelUrl 
    } = await request.json()
    
    if (!invoiceId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceId, amount, paymentMethod' },
        { status: 400 }
      )
    }

    // Get invoice details
    const invoice = await getInvoiceDetails(invoiceId)
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Validate payment amount
    if (amount > invoice.total) {
      return NextResponse.json(
        { error: 'Payment amount exceeds invoice total' },
        { status: 400 }
      )
    }

    // Generate payment link based on method
    let paymentResponse
    
    switch (paymentMethod) {
      case 'stripe':
        paymentResponse = await createStripePaymentLink({
          invoiceId,
          amount,
          customerEmail,
          invoice,
          returnUrl,
          cancelUrl
        })
        break
        
      case 'paypal':
        paymentResponse = await createPayPalPaymentLink({
          invoiceId,
          amount,
          customerEmail,
          invoice,
          returnUrl,
          cancelUrl
        })
        break
        
      case 'bank_transfer':
        paymentResponse = await generateBankTransferInstructions({
          invoiceId,
          amount,
          invoice
        })
        break
        
      default:
        return NextResponse.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        )
    }

    // Create payment record
    const paymentRecord: PaymentRecord = {
      id: generatePaymentId(),
      invoiceId,
      amount,
      currency: 'USD',
      status: 'pending',
      method: paymentMethod as PaymentMethod,
      transactionId: paymentResponse.transactionId,
      gatewayResponse: paymentResponse,
      processedAt: new Date().toISOString()
    }

    // Store payment record
    const invoicePayments = paymentRecords.get(invoiceId) || []
    invoicePayments.push(paymentRecord)
    paymentRecords.set(invoiceId, invoicePayments)

    console.log(`💳 Payment link created for invoice ${invoiceId}: ${paymentResponse.paymentUrl}`)

    return NextResponse.json({
      success: true,
      paymentRecord,
      paymentUrl: paymentResponse.paymentUrl,
      expiresAt: paymentResponse.expiresAt,
      instructions: paymentResponse.instructions
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// Webhook endpoint for payment status updates
export async function PUT(request: NextRequest) {
  try {
    const { 
      paymentId, 
      transactionId, 
      status, 
      gatewayResponse,
      webhookSource 
    } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, status' },
        { status: 400 }
      )
    }

    // Find and update payment record
    const paymentRecord = await findPaymentById(paymentId)
    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      )
    }

    // Update payment status
    paymentRecord.status = status as PaymentStatus
    paymentRecord.gatewayResponse = { 
      ...paymentRecord.gatewayResponse, 
      ...gatewayResponse 
    }
    
    if (transactionId) {
      paymentRecord.transactionId = transactionId
    }

    // Update invoice status if payment is completed
    if (status === 'completed') {
      await updateInvoicePaymentStatus(paymentRecord.invoiceId, paymentRecord.amount)
      
      // Send payment confirmation
      await sendPaymentConfirmation(paymentRecord)
      
      console.log(`✅ Payment completed for invoice ${paymentRecord.invoiceId}`)
    } else if (status === 'failed') {
      console.log(`❌ Payment failed for invoice ${paymentRecord.invoiceId}`)
    }

    return NextResponse.json({
      success: true,
      paymentRecord,
      message: `Payment status updated to ${status}`
    })

  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    let payments: PaymentRecord[] = []

    if (invoiceId) {
      payments = paymentRecords.get(invoiceId) || []
    } else {
      // Get all payments
      for (const invoicePayments of paymentRecords.values()) {
        payments.push(...invoicePayments)
      }
    }

    // Apply filters
    if (status) {
      payments = payments.filter(p => p.status === status)
    }

    if (method) {
      payments = payments.filter(p => p.method === method)
    }

    // Calculate summary
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    const completedAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      payments,
      summary: {
        totalPayments: payments.length,
        totalAmount,
        completedAmount,
        pendingAmount
      }
    })

  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// Payment gateway integrations
async function createStripePaymentLink(options: any) {
  // Mock Stripe integration - replace with actual Stripe API
  const { invoiceId, amount, customerEmail, invoice } = options
  
  return {
    transactionId: `stripe_${generateTransactionId()}`,
    paymentUrl: `https://checkout.stripe.com/c/pay/test_${generateTransactionId()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    gatewayMetadata: {
      stripe_session_id: `cs_test_${generateTransactionId()}`,
      customer_email: customerEmail
    }
  }
}

async function createPayPalPaymentLink(options: any) {
  // Mock PayPal integration - replace with actual PayPal API
  const { invoiceId, amount, customerEmail, invoice } = options
  
  return {
    transactionId: `paypal_${generateTransactionId()}`,
    paymentUrl: `https://www.paypal.com/checkoutnow?token=${generateTransactionId()}`,
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
    gatewayMetadata: {
      paypal_order_id: generateTransactionId(),
      customer_email: customerEmail
    }
  }
}

async function generateBankTransferInstructions(options: any) {
  const { invoiceId, amount, invoice } = options
  
  return {
    transactionId: `wire_${generateTransactionId()}`,
    paymentUrl: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    instructions: {
      accountName: 'Humber Operations LLC',
      accountNumber: '****-****-****-1234',
      routingNumber: '021000021',
      bankName: 'JPMorgan Chase Bank',
      referenceNumber: invoiceId,
      amount: amount,
      currency: 'USD',
      notes: `Payment for Invoice ${invoice.invoiceNumber} - ${invoice.projectName}`
    }
  }
}

// Helper functions
async function getInvoiceDetails(invoiceId: string) {
  // Mock invoice lookup - replace with actual database query
  return {
    id: invoiceId,
    invoiceNumber: 'HMB-202411-0001',
    projectName: 'GM Assembly Line Automation',
    clientEmail: 'customer@gm.com',
    total: 25000.00,
    status: 'sent'
  }
}

async function findPaymentById(paymentId: string): Promise<PaymentRecord | null> {
  for (const payments of paymentRecords.values()) {
    const payment = payments.find(p => p.id === paymentId)
    if (payment) return payment
  }
  return null
}

async function updateInvoicePaymentStatus(invoiceId: string, paidAmount: number) {
  // Mock invoice update - replace with actual database update
  console.log(`💰 Updating invoice ${invoiceId} with payment of $${paidAmount}`)
  
  // Check if invoice is fully paid and update status accordingly
  const invoice = await getInvoiceDetails(invoiceId)
  if (invoice && paidAmount >= invoice.total) {
    console.log(`📄 Invoice ${invoiceId} marked as paid`)
  } else {
    console.log(`📄 Invoice ${invoiceId} marked as partially paid`)
  }
}

async function sendPaymentConfirmation(paymentRecord: PaymentRecord) {
  // Mock notification sending - replace with actual email service
  console.log(`📧 Sending payment confirmation for ${paymentRecord.id}`)
}

function generatePaymentId(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateTransactionId(): string {
  return Math.random().toString(36).substr(2, 16).toUpperCase()
}