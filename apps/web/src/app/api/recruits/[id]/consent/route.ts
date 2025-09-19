import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const recruitId = params.id

    // Mock consent update response
    const response = {
      success: true,
      data: {
        id: recruitId,
        consentType: body.consentType || 'privacy',
        consentGiven: body.consentGiven !== undefined ? body.consentGiven : true,
        consentText: body.consentText || 'I consent to the processing of my personal data for recruitment and employment purposes in accordance with GDPR Article 6 and 7.',
        consentVersion: '1.0',
        consentTimestamp: new Date().toISOString(),
        purposeSpecification: body.purposeSpecification || 'Recruitment and employment data processing',
        retentionPeriod: '7 years',
        withdrawalRights: 'You may withdraw consent at any time by contacting HR',
        processingBasis: 'Legitimate interest and consent',
        dataCategories: [
          'Personal identification data',
          'Contact information',
          'Professional qualifications',
          'Employment history'
        ]
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update consent',
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
    const recruitId = params.id

    // Mock get consent status response
    const response = {
      success: true,
      data: {
        id: recruitId,
        consents: [
          {
            type: 'privacy',
            given: true,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            version: '1.0'
          },
          {
            type: 'marketing',
            given: false,
            timestamp: null,
            version: '1.0'
          },
          {
            type: 'biometric',
            given: true,
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            version: '1.0'
          }
        ],
        gdprCompliant: true,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get consent status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recruitId = params.id

    // Mock consent withdrawal response
    const response = {
      success: true,
      data: {
        id: recruitId,
        consentWithdrawn: true,
        withdrawalTimestamp: new Date().toISOString(),
        dataRetentionNotice: 'Your data will be retained for legal compliance purposes only',
        erasureScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to withdraw consent',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}