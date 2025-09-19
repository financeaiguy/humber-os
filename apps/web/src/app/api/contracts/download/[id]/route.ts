import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(
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

    // Generate PDF content (mock implementation)
    const pdfBuffer = await generateContractPDF(contractId)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract_${contractId}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Contract download error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate contract PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateContractPDF(contractId: string): Promise<Buffer> {
  // Mock PDF generation - in production, use jsPDF or similar library
  // This creates a simple PDF-like structure as a demonstration
  
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 12 Tf
50 750 Td
(HUMBER OPERATIONS LLC) Tj
0 -20 Td
(CONTRACT AGREEMENT) Tj
0 -40 Td
(Contract ID: ${contractId}) Tj
0 -40 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
0 -60 Td
(This is a mock PDF for demonstration purposes.) Tj
0 -20 Td
(In production, this would be a complete contract document) Tj
0 -20 Td
(with full formatting, signatures, and blockchain integration.) Tj
0 -60 Td
(BLOCKCHAIN INTEGRATION:) Tj
0 -20 Td
(- Polygon Network: Testnet) Tj
0 -20 Td
(- Smart Contract: 0x742d35Cc6634C0532925a3b8D404fddBD4f5B8A2) Tj
0 -20 Td
(- Milestone-based payments enabled) Tj
0 -20 Td
(- Multi-signature approval required) Tj
0 -60 Td
(SIGNATURES:) Tj
0 -20 Td
(Employee: ________________________  Date: ________) Tj
0 -40 Td
(Employer: ________________________  Date: ________) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000826 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
884
%%EOF`

  return Buffer.from(pdfContent, 'utf8')
}

// Alternative implementation using a proper PDF library (commented out for now)
/*
import jsPDF from 'jspdf'

async function generateContractPDFWithLibrary(contractId: string): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Add header
  doc.setFontSize(20)
  doc.text('HUMBER OPERATIONS LLC', 20, 30)
  doc.setFontSize(16)
  doc.text('CONTRACT AGREEMENT', 20, 45)
  
  // Add contract details
  doc.setFontSize(12)
  doc.text(`Contract ID: ${contractId}`, 20, 65)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 75)
  
  // Add contract content
  doc.setFontSize(14)
  doc.text('INDEPENDENT CONTRACTOR AGREEMENT', 20, 100)
  
  doc.setFontSize(10)
  const contractText = [
    'Between: Humber Operations LLC ("Company")',
    'And: John Smith ("Contractor")',
    '',
    '1. SERVICES',
    'Contractor will provide Senior Mechanical Engineer services',
    'for the Engineering department.',
    '',
    '2. BLOCKCHAIN INTEGRATION',
    'This contract includes Polygon blockchain integration:',
    '- Smart contract address: 0x742d35Cc6634C0532925a3b8D404fddBD4f5B8A2',
    '- Automated milestone payments',
    '- Immutable contract terms',
    '- Multi-signature approval required'
  ]
  
  let yPosition = 120
  contractText.forEach(line => {
    doc.text(line, 20, yPosition)
    yPosition += 10
  })
  
  // Add signature section
  yPosition += 20
  doc.text('SIGNATURES:', 20, yPosition)
  yPosition += 20
  doc.text('Employee: ________________________  Date: ________', 20, yPosition)
  yPosition += 20
  doc.text('Employer: ________________________  Date: ________', 20, yPosition)
  
  return Buffer.from(doc.output('arraybuffer'))
}
*/
