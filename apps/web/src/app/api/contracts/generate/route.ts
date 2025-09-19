import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export interface ContractData {
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeType: 'EMPLOYEE' | 'CONTRACTOR'
  position: string
  department: string
  location: string
  startDate: string
  salary?: number
  hourlyRate?: number
  contractDuration?: string
  workArrangement: 'REMOTE' | 'HYBRID' | 'ONSITE'
  
  // Blockchain specific
  enableBlockchain: boolean
  polygonNetwork?: 'mainnet' | 'testnet'
  walletAddress?: string
  
  // Contract terms
  milestones?: Array<{
    description: string
    amount: number
    dueDate: string
  }>
}

export async function POST(request: NextRequest) {
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

    const contractData: ContractData = await request.json()

    // Validate required fields
    const requiredFields = ['employeeId', 'employeeName', 'employeeEmail', 'employeeType', 'position', 'location', 'startDate']
    const missingFields = requiredFields.filter(field => !contractData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      )
    }

    // Generate contract based on type
    const contract = await generateContract(contractData)
    
    // If blockchain is enabled, prepare smart contract
    let blockchainContract = null
    if (contractData.enableBlockchain) {
      blockchainContract = await generatePolygonContract(contractData)
    }

    return NextResponse.json({
      success: true,
      data: {
        contractId: `contract_${Date.now()}`,
        contract,
        blockchainContract,
        previewUrl: `/api/contracts/preview/${contract.id}`,
        downloadUrl: `/api/contracts/download/${contract.id}`,
        signatureUrl: `/api/contracts/signature/${contract.id}`,
        metadata: {
          generatedAt: new Date().toISOString(),
          employeeType: contractData.employeeType,
          blockchainEnabled: contractData.enableBlockchain,
          network: contractData.polygonNetwork || null
        }
      }
    })

  } catch (error) {
    console.error('Contract generation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate contract',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateContract(data: ContractData) {
  const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Generate contract content based on employee type
  const contractContent = data.employeeType === 'EMPLOYEE' 
    ? generateEmployeeContract(data)
    : generateContractorAgreement(data)

  return {
    id: contractId,
    type: data.employeeType,
    title: `${data.employeeType === 'EMPLOYEE' ? 'Employment' : 'Contractor'} Agreement - ${data.employeeName}`,
    content: contractContent,
    terms: generateContractTerms(data),
    signatures: {
      employee: {
        required: true,
        signed: false,
        signedAt: null,
        ipAddress: null
      },
      employer: {
        required: true,
        signed: false,
        signedAt: null,
        signedBy: null
      }
    },
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  }
}

function generateEmployeeContract(data: ContractData): string {
  return `
# EMPLOYMENT AGREEMENT

**Between:** Humber Operations LLC ("Company")  
**And:** ${data.employeeName} ("Employee")

## 1. POSITION AND DUTIES
Employee is hired as **${data.position}** in the **${data.department}** department, based in **${data.location}**.

Work Arrangement: **${data.workArrangement}**

## 2. COMPENSATION
${data.salary ? `Annual Salary: $${data.salary.toLocaleString()}` : `Hourly Rate: $${data.hourlyRate}/hour`}

## 3. START DATE
Employment begins on **${new Date(data.startDate).toLocaleDateString()}**.

## 4. TERMS AND CONDITIONS
- This is an at-will employment agreement
- Employee agrees to maintain confidentiality of company information
- Employee will comply with all company policies and procedures
- Benefits package as outlined in employee handbook

## 5. BLOCKCHAIN INTEGRATION
${data.enableBlockchain ? `
This contract includes blockchain verification on Polygon ${data.polygonNetwork} network.
- Contract milestones and payments will be automated via smart contracts
- Immutable record of employment terms and modifications
- Multi-signature approval required for contract changes
` : 'Standard contract without blockchain integration.'}

## 6. GOVERNING LAW
This agreement is governed by the laws of the State of Illinois.

---
*Generated on ${new Date().toLocaleDateString()} for ${data.employeeName}*
  `.trim()
}

function generateContractorAgreement(data: ContractData): string {
  return `
# INDEPENDENT CONTRACTOR AGREEMENT

**Between:** Humber Operations LLC ("Company")  
**And:** ${data.employeeName} ("Contractor")

## 1. SERVICES
Contractor will provide **${data.position}** services for the **${data.department}** department.

Location: **${data.location}** (${data.workArrangement})

## 2. COMPENSATION
${data.hourlyRate ? `Hourly Rate: $${data.hourlyRate}/hour` : `Project Rate: $${data.salary}`}
${data.contractDuration ? `Contract Duration: ${data.contractDuration}` : ''}

## 3. PROJECT MILESTONES
${data.milestones?.map((milestone, index) => `
**Milestone ${index + 1}:** ${milestone.description}  
Amount: $${milestone.amount.toLocaleString()}  
Due Date: ${new Date(milestone.dueDate).toLocaleDateString()}
`).join('\n') || 'No specific milestones defined.'}

## 4. INDEPENDENT CONTRACTOR STATUS
- Contractor is an independent business entity
- Responsible for own taxes and benefits
- No employee benefits provided
- Contractor maintains own equipment and workspace

## 5. BLOCKCHAIN SMART CONTRACT
${data.enableBlockchain ? `
**Polygon Network Integration:**
- Contract deployed on Polygon ${data.polygonNetwork} network
- Automated milestone-based payments
- Immutable contract terms and payment history
- Multi-signature approval for modifications
- Wallet Address: ${data.walletAddress || 'To be provided'}

**Smart Contract Features:**
- Escrow-based milestone payments
- Automatic release upon milestone completion
- Dispute resolution mechanism
- Gas-efficient transactions on Polygon
` : 'Standard contractor agreement without blockchain integration.'}

## 6. TERM
Contract begins on **${new Date(data.startDate).toLocaleDateString()}**
${data.contractDuration ? `and continues for ${data.contractDuration}.` : 'with no fixed end date.'}

## 7. GOVERNING LAW
This agreement is governed by the laws of the State of Illinois.

---
*Generated on ${new Date().toLocaleDateString()} for ${data.employeeName}*
  `.trim()
}

function generateContractTerms(data: ContractData) {
  const baseTerms = [
    'Confidentiality and non-disclosure requirements',
    'Intellectual property assignment',
    'Termination procedures and notice requirements',
    'Dispute resolution and governing law'
  ]

  if (data.employeeType === 'EMPLOYEE') {
    baseTerms.push(
      'At-will employment status',
      'Benefits eligibility and enrollment',
      'Vacation and sick leave policies',
      'Performance review procedures'
    )
  } else {
    baseTerms.push(
      'Independent contractor status confirmation',
      'Tax responsibility and 1099 reporting',
      'Equipment and workspace requirements',
      'Invoice and payment procedures'
    )
  }

  if (data.enableBlockchain) {
    baseTerms.push(
      'Blockchain contract deployment and management',
      'Smart contract milestone and payment automation',
      'Multi-signature approval requirements',
      'Polygon network transaction fees and responsibilities'
    )
  }

  return baseTerms
}

async function generatePolygonContract(data: ContractData) {
  // Mock smart contract generation - in production, this would interact with actual Polygon network
  const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`
  
  return {
    network: data.polygonNetwork || 'testnet',
    contractAddress,
    abi: generateContractABI(data),
    deploymentTx: `0x${Math.random().toString(16).substr(2, 64)}`,
    gasUsed: Math.floor(Math.random() * 200000) + 100000,
    deploymentCost: (Math.random() * 0.01 + 0.005).toFixed(6) + ' MATIC',
    features: {
      milestonePayments: data.milestones?.length > 0,
      multiSignature: true,
      escrow: data.employeeType === 'CONTRACTOR',
      automaticRelease: true
    },
    functions: [
      'addMilestone(string memory description, uint256 amount, uint256 dueDate)',
      'completeMilestone(uint256 milestoneId)',
      'releaseFunds(uint256 milestoneId)',
      'terminateContract()',
      'updateTerms(bytes32 termsHash)'
    ]
  }
}

function generateContractABI(data: ContractData) {
  // Simplified ABI for the smart contract
  return [
    {
      "inputs": [
        {"name": "employee", "type": "address"},
        {"name": "employer", "type": "address"},
        {"name": "totalAmount", "type": "uint256"}
      ],
      "name": "constructor",
      "type": "constructor"
    },
    {
      "inputs": [
        {"name": "description", "type": "string"},
        {"name": "amount", "type": "uint256"},
        {"name": "dueDate", "type": "uint256"}
      ],
      "name": "addMilestone",
      "outputs": [],
      "type": "function"
    },
    {
      "inputs": [{"name": "milestoneId", "type": "uint256"}],
      "name": "completeMilestone",
      "outputs": [],
      "type": "function"
    },
    {
      "inputs": [{"name": "milestoneId", "type": "uint256"}],
      "name": "releaseFunds",
      "outputs": [],
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractStatus",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    }
  ]
}
