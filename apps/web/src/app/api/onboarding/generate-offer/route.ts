import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jsPDF from 'jspdf'
import { ethers } from 'ethers'

// Validation schema for offer generation
const OfferGenerationSchema = z.object({
  candidateName: z.string().min(1),
  candidateEmail: z.string().email(),
  candidatePhone: z.string(),
  jobTitle: z.string().min(1),
  department: z.string().min(1),
  hourlyRate: z.string().min(1),
  hoursPerWeek: z.number().min(1).max(60),
  startDate: z.string().min(1),
  responsibilities: z.string().min(1),
  requirements: z.string().min(1),
  expectations: z.string().optional(),
  contractType: z.string().min(1),
  workLocation: z.string().min(1),
  enableSmartContract: z.boolean().optional(),
  visaStatus: z.string().optional(),
  totalExperience: z.number().optional()
})

// Smart Contract ABI for employment contract (simplified)
const EMPLOYMENT_CONTRACT_ABI = [
  {
    "inputs": [
      { "name": "_employee", "type": "address" },
      { "name": "_employer", "type": "address" },
      { "name": "_hourlyRate", "type": "uint256" },
      { "name": "_startDate", "type": "uint256" },
      { "name": "_contractHash", "type": "string" }
    ],
    "name": "createContract",
    "outputs": [],
    "type": "function"
  }
]

// AI Prompt for generating professional offer letter content
const generateOfferLetterContent = async (data: any) => {
  const prompt = `
    Generate a professional offer letter with the following details:
    
    Candidate: ${data.candidateName}
    Position: ${data.jobTitle}
    Department: ${data.department}
    Hourly Rate: $${data.hourlyRate}/hour
    Hours per Week: ${data.hoursPerWeek}
    Start Date: ${data.startDate}
    Contract Type: ${data.contractType}
    Location: ${data.workLocation}
    
    Key Responsibilities:
    ${data.responsibilities}
    
    Requirements:
    ${data.requirements}
    
    ${data.expectations ? `Expectations:\n${data.expectations}` : ''}
    
    Please format this as a formal offer letter from Humber Operations, including:
    1. Professional greeting
    2. Position details and compensation
    3. Responsibilities and requirements
    4. Benefits overview (standard engineering benefits)
    5. Next steps for acceptance
    6. Professional closing
    
    Make it formal but welcoming, emphasizing our commitment to engineering excellence.
  `
  
  // In production, this would call OpenAI/Anthropic API
  // For now, returning a template
  return `
Dear ${data.candidateName},

We are pleased to extend an offer of employment for the position of ${data.jobTitle} in our ${data.department} department at Humber Operations.

**Position Details:**
- Title: ${data.jobTitle}
- Department: ${data.department}
- Employment Type: ${data.contractType}
- Location: ${data.workLocation}
- Start Date: ${data.startDate}

**Compensation:**
- Hourly Rate: $${data.hourlyRate}/hour
- Expected Hours: ${data.hoursPerWeek} hours per week
- Estimated Annual Compensation: $${(parseFloat(data.hourlyRate) * data.hoursPerWeek * 52).toLocaleString()}

**Key Responsibilities:**
${data.responsibilities.split('\n').map((r: string) => `• ${r.trim()}`).join('\n')}

**Requirements:**
${data.requirements.split('\n').map((r: string) => `• ${r.trim()}`).join('\n')}

${data.expectations ? `**Performance Expectations:**\n${data.expectations}` : ''}

**Benefits Package:**
• Comprehensive health, dental, and vision insurance
• 401(k) retirement plan with company matching
• Professional development opportunities
• Flexible work arrangements
• Paid time off and holidays
• Access to cutting-edge engineering projects

**Next Steps:**
Please review this offer carefully. To accept this position, please sign and return this letter by ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.

We are excited about the possibility of you joining our team and contributing to our mission of delivering exceptional engineering solutions.

Sincerely,

The Humber Operations Team
Engineering Excellence, Delivered

${data.enableSmartContract ? '\n**Note:** This offer is backed by a blockchain smart contract on Polygon network for transparent and automated payment processing.' : ''}
  `.trim()
}

// Generate PDF from offer letter content
const generatePDF = (content: string, candidateName: string): string => {
  // In production, use a proper PDF generation service
  // For now, creating a base64 encoded PDF
  const doc = new jsPDF()
  
  // Add Humber logo/header
  doc.setFontSize(20)
  doc.text('HUMBER OPERATIONS', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Engineering Staffing Solutions', 105, 28, { align: 'center' })
  
  // Add content
  doc.setFontSize(11)
  const lines = doc.splitTextToSize(content, 170)
  doc.text(lines, 20, 45)
  
  // Generate base64 string
  const pdfBase64 = doc.output('datauristring')
  return pdfBase64
}

// Deploy smart contract on Polygon
const deploySmartContract = async (data: any): Promise<string | null> => {
  if (!data.enableSmartContract) return null
  
  try {
    // In production, use actual Polygon RPC and wallet
    // This is a placeholder for the smart contract deployment
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com')
    
    // Generate a unique contract address (mock)
    const contractAddress = ethers.hexlify(ethers.randomBytes(20))
    
    // In production, actually deploy the contract
    console.log('Deploying smart contract to Polygon...', {
      employee: data.candidateEmail,
      hourlyRate: data.hourlyRate,
      startDate: data.startDate
    })
    
    return contractAddress
  } catch (error) {
    console.error('Smart contract deployment failed:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = OfferGenerationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid offer details', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const data = validation.data
    
    // Generate offer letter content using AI
    const offerContent = await generateOfferLetterContent(data)
    
    // Generate PDF
    const pdfDataUri = generatePDF(offerContent, data.candidateName)
    
    // Deploy smart contract if enabled
    const contractAddress = await deploySmartContract(data)
    
    // In production, store the offer letter in database and S3
    // For now, returning the data URI
    
    return NextResponse.json({
      success: true,
      pdfUrl: pdfDataUri,
      contractAddress,
      offerContent,
      message: 'Offer letter generated successfully'
    })
    
  } catch (error) {
    console.error('Error generating offer letter:', error)
    return NextResponse.json(
      { error: 'Failed to generate offer letter' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}