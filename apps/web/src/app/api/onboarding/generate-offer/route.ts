import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockOfferData = {
      success: true,
      data: {
        offerId: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        offerDetails: {
          position: requestData.position || 'Software Engineer',
          department: requestData.department || 'Engineering',
          startDate: requestData.startDate || '2025-02-01',
          salary: {
            annual: requestData.desiredSalary || 95000,
            currency: 'USD',
            payFrequency: 'bi-weekly'
          },
          benefits: {
            healthInsurance: true,
            dentalInsurance: true,
            visionInsurance: true,
            retirement401k: true,
            paidTimeOff: 25,
            sickLeave: 10,
            parentalLeave: 12
          },
          workArrangement: {
            type: 'hybrid',
            remoteAllowance: 3,
            officeLocation: requestData.preferredLocation || 'Detroit, MI'
          },
          equipment: {
            laptop: true,
            monitor: true,
            deskSetup: true,
            phoneStipend: 50
          }
        },
        legalTerms: {
          employmentType: 'full-time',
          probationPeriod: 90,
          terminationNotice: 14,
          nonCompeteClause: false,
          confidentialityAgreement: true
        },
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        generatedAt: new Date().toISOString(),
        status: 'pending_review'
      }
    }

    return NextResponse.json(mockOfferData)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate offer letter'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('offerId')

    if (!offerId) {
      return NextResponse.json({
        success: false,
        error: 'offerId is required'
      }, { status: 400 })
    }

    await new Promise(resolve => setTimeout(resolve, 200))

    const mockOffer = {
      success: true,
      data: {
        offerId,
        status: 'pending_review',
        lastModified: new Date().toISOString(),
        offerDetails: {
          position: 'Software Engineer',
          department: 'Engineering',
          startDate: '2025-02-01',
          salary: {
            annual: 95000,
            currency: 'USD',
            payFrequency: 'bi-weekly'
          }
        }
      }
    }

    return NextResponse.json(mockOffer)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch offer details'
    }, { status: 500 })
  }
}