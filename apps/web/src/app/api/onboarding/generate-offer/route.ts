import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()

    await new Promise(resolve => setTimeout(resolve, 500))

    // Generate a mock PDF URL (in production, this would generate actual PDF)
    const candidateName = `${requestData.firstName || 'John'} ${requestData.lastName || 'Doe'}`
    const offerID = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create a mock PDF blob URL
    const pdfContent = generateOfferLetterHTML({
      candidateName,
      position: requestData.position || 'Software Engineer',
      department: requestData.department || 'Engineering',
      startDate: requestData.startDate || '2025-02-01',
      salary: requestData.desiredSalary || 95000,
      location: requestData.preferredLocation || 'Detroit, MI',
      benefits: 'Health, Dental, Vision, 401k, PTO',
      offerID
    })
    
    const pdfBlob = new Blob([pdfContent], { type: 'text/html' })
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    const mockOfferData = {
      success: true,
      pdfUrl,
      contractAddress: requestData.enableSmartContract ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
      offerID,
      data: {
        offerId: offerID,
        candidateName,
        position: requestData.position || 'Software Engineer',
        salary: requestData.desiredSalary || 95000,
        startDate: requestData.startDate || '2025-02-01',
        generatedAt: new Date().toISOString(),
        status: 'pending_review'
      }
    }

// Helper function to generate offer letter HTML
function generateOfferLetterHTML(data: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Employment Offer Letter - ${data.candidateName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; }
    .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
    .letter-title { font-size: 20px; margin-top: 20px; }
    .content { line-height: 1.6; }
    .highlight { background-color: #eff6ff; padding: 2px 4px; }
    .signature-section { margin-top: 40px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">Humber Operations</div>
    <div>Engineering Staffing Solutions</div>
    <div class="letter-title">Employment Offer Letter</div>
  </div>
  
  <div class="content">
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Offer ID:</strong> ${data.offerID}</p>
    
    <p>Dear ${data.candidateName},</p>
    
    <p>We are pleased to offer you the position of <span class="highlight">${data.position}</span> 
    in our ${data.department} department. This offer is contingent upon successful completion 
    of background checks and reference verification.</p>
    
    <h3>Position Details:</h3>
    <ul>
      <li><strong>Position:</strong> ${data.position}</li>
      <li><strong>Department:</strong> ${data.department}</li>
      <li><strong>Start Date:</strong> ${data.startDate}</li>
      <li><strong>Work Location:</strong> ${data.location}</li>
      <li><strong>Annual Salary:</strong> $${data.salary.toLocaleString()}</li>
    </ul>
    
    <h3>Benefits Package:</h3>
    <p>${data.benefits}</p>
    
    <p>This offer expires in 7 days from the date above. Please confirm your acceptance 
    by signing and returning this letter by email.</p>
    
    <p>We look forward to welcoming you to the Humber Operations team!</p>
    
    <div class="signature-section">
      <p>Sincerely,</p>
      <br><br>
      <p><strong>Human Resources Department</strong><br>
      Humber Operations<br>
      engineering@humber-operations.com</p>
    </div>
    
    <hr style="margin: 40px 0;">
    
    <div class="signature-section">
      <p><strong>Acceptance:</strong></p>
      <p>I, ${data.candidateName}, accept this offer of employment under the terms stated above.</p>
      <br><br>
      <p>Signature: _________________________ Date: _____________</p>
      <p>Print Name: ${data.candidateName}</p>
    </div>
  </div>
  
  <div class="footer">
    <p>This document was generated electronically by Humber Operations HR System</p>
    <p>Document ID: ${data.offerID} | Generated: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`
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