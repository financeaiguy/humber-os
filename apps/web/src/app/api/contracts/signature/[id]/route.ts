import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Development bypass for API testing
    const authHeader = request.headers.get('authorization')
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment && authHeader === 'Bearer test-token-for-api-testing') {
      // Allow the request to proceed with mock user context
    } else {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const contractId = params.id
    const { employeeEmail, employeeName, contractType, message } = await request.json()

    // Send signature request
    const signatureRequest = await sendSignatureRequest({
      contractId,
      employeeEmail,
      employeeName,
      contractType,
      message
    })

    return NextResponse.json({
      success: true,
      data: {
        signatureRequestId: signatureRequest.id,
        status: 'SENT',
        sentTo: employeeEmail,
        expiresAt: signatureRequest.expiresAt,
        signatureUrl: signatureRequest.signatureUrl,
        trackingUrl: signatureRequest.trackingUrl,
        message: 'Signature request sent successfully'
      }
    })

  } catch (error) {
    console.error('Signature request error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send signature request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id
    
    // Get signature status
    const signatureStatus = await getSignatureStatus(contractId)

    return NextResponse.json({
      success: true,
      data: signatureStatus
    })

  } catch (error) {
    console.error('Signature status error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get signature status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function sendSignatureRequest(params: {
  contractId: string
  employeeEmail: string
  employeeName: string
  contractType: string
  message?: string
}) {
  const { contractId, employeeEmail, employeeName, contractType, message } = params
  
  // Generate signature request
  const signatureRequestId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const signatureUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contracts/sign/${contractId}?token=${signatureRequestId}`
  const trackingUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contracts/track/${signatureRequestId}`

  // Mock email sending - in production, integrate with SendGrid, Twilio, or similar
  await sendSignatureEmail({
    to: employeeEmail,
    employeeName,
    contractType,
    signatureUrl,
    trackingUrl,
    expiresAt,
    message
  })

  // Mock blockchain notification - in production, this would trigger smart contract events
  if (contractType.includes('BLOCKCHAIN')) {
    await notifyBlockchainSignature({
      contractId,
      signatureRequestId,
      employeeEmail
    })
  }

  return {
    id: signatureRequestId,
    contractId,
    status: 'SENT',
    sentAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    signatureUrl,
    trackingUrl,
    employeeEmail,
    employeeName
  }
}

async function sendSignatureEmail(params: {
  to: string
  employeeName: string
  contractType: string
  signatureUrl: string
  trackingUrl: string
  expiresAt: Date
  message?: string
}) {
  const { to, employeeName, contractType, signatureUrl, trackingUrl, expiresAt, message } = params

  // Mock email content - in production, use proper email templates
  const emailContent = {
    to,
    subject: `Contract Signature Required - ${contractType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1>🔗 Humber Operations</h1>
          <h2>Contract Signature Required</h2>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Dear ${employeeName},</p>
          
          <p>You have a new contract that requires your digital signature:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3>${contractType}</h3>
            <p><strong>Expires:</strong> ${expiresAt.toLocaleDateString()}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signatureUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ✍️ Sign Contract
            </a>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4>🔗 Blockchain Integration</h4>
            <p>This contract includes Polygon blockchain integration for:</p>
            <ul>
              <li>Immutable contract terms</li>
              <li>Automated milestone payments</li>
              <li>Multi-signature approval</li>
              <li>Transparent transaction history</li>
            </ul>
          </div>
          
          <p><small>
            You can track the signature status at: <a href="${trackingUrl}">Signature Tracking</a><br>
            This signature request expires on ${expiresAt.toLocaleDateString()}.
          </small></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Humber Operations LLC.<br>
            If you have any questions, please contact your HR representative.
          </p>
        </div>
      </div>
    `
  }

  // Mock email sending - log to console for development
  console.log('📧 Signature Email Sent:', {
    to: emailContent.to,
    subject: emailContent.subject,
    signatureUrl,
    trackingUrl
  })

  // In production, use actual email service:
  // await sendGridClient.send(emailContent)
  // or
  // await twilioClient.messages.create({...})

  return { success: true, messageId: `msg_${Date.now()}` }
}

async function notifyBlockchainSignature(params: {
  contractId: string
  signatureRequestId: string
  employeeEmail: string
}) {
  const { contractId, signatureRequestId, employeeEmail } = params

  // Mock blockchain notification - in production, this would:
  // 1. Update smart contract state
  // 2. Emit blockchain events
  // 3. Notify all parties via blockchain
  
  console.log('🔗 Blockchain Signature Notification:', {
    contractId,
    signatureRequestId,
    employeeEmail,
    blockchainTx: `0x${Math.random().toString(16).substr(2, 64)}`,
    gasUsed: Math.floor(Math.random() * 50000) + 21000
  })

  return { success: true, txHash: `0x${Math.random().toString(16).substr(2, 64)}` }
}

async function getSignatureStatus(contractId: string) {
  // Mock signature status - in production, query actual database
  return {
    contractId,
    status: 'PENDING_SIGNATURE',
    signatures: {
      employee: {
        required: true,
        signed: false,
        signedAt: null,
        ipAddress: null,
        signatureMethod: null
      },
      employer: {
        required: true,
        signed: false,
        signedAt: null,
        signedBy: null,
        signatureMethod: null
      }
    },
    requests: [
      {
        id: `sig_${Date.now()}`,
        sentTo: 'john.smith@example.com',
        sentAt: new Date().toISOString(),
        status: 'SENT',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        remindersSent: 0,
        lastReminderAt: null
      }
    ],
    blockchain: {
      contractAddress: '0x742d35Cc6634C0532925a3b8D404fddBD4f5B8A2',
      network: 'polygon-testnet',
      signatureEvents: [],
      pendingTransactions: []
    },
    timeline: [
      {
        event: 'CONTRACT_GENERATED',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        description: 'Contract document generated'
      },
      {
        event: 'SIGNATURE_REQUEST_SENT',
        timestamp: new Date().toISOString(),
        description: 'Signature request sent to employee'
      }
    ]
  }
}
