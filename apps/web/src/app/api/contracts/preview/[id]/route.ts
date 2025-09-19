import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

// Mock contract storage - in production, use actual database
const contractStorage = new Map<string, any>()

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

    // Get contract from storage (mock implementation)
    let contract = contractStorage.get(contractId)
    
    if (!contract) {
      // Generate mock contract for preview
      contract = generateMockContract(contractId)
      contractStorage.set(contractId, contract)
    }

    // Generate HTML preview
    const htmlPreview = generateContractHTML(contract)

    return new NextResponse(htmlPreview, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Contract preview error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate contract preview',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateMockContract(contractId: string) {
  return {
    id: contractId,
    type: 'CONTRACTOR',
    title: 'Independent Contractor Agreement - John Smith',
    content: `
# INDEPENDENT CONTRACTOR AGREEMENT

**Between:** Humber Operations LLC ("Company")  
**And:** John Smith ("Contractor")

## 1. SERVICES
Contractor will provide **Senior Mechanical Engineer** services for the **Engineering** department.

Location: **Chicago, IL** (HYBRID)

## 2. COMPENSATION
Hourly Rate: $85/hour
Contract Duration: 6 months

## 3. PROJECT MILESTONES

**Milestone 1:** Initial system design and requirements analysis  
Amount: $15,000  
Due Date: 10/15/2025

**Milestone 2:** Prototype development and testing  
Amount: $25,000  
Due Date: 11/30/2025

**Milestone 3:** Final implementation and documentation  
Amount: $20,000  
Due Date: 1/15/2026

## 4. INDEPENDENT CONTRACTOR STATUS
- Contractor is an independent business entity
- Responsible for own taxes and benefits
- No employee benefits provided
- Contractor maintains own equipment and workspace

## 5. BLOCKCHAIN SMART CONTRACT

**Polygon Network Integration:**
- Contract deployed on Polygon testnet network
- Automated milestone-based payments
- Immutable contract terms and payment history
- Multi-signature approval for modifications
- Wallet Address: 0x742d35Cc6634C0532925a3b8D404fddBD4f5B8A2

**Smart Contract Features:**
- Escrow-based milestone payments
- Automatic release upon milestone completion
- Dispute resolution mechanism
- Gas-efficient transactions on Polygon

## 6. TERM
Contract begins on **9/19/2025** and continues for 6 months.

## 7. GOVERNING LAW
This agreement is governed by the laws of the State of Illinois.

---
*Generated on 9/19/2025 for John Smith*
    `.trim(),
    signatures: {
      employee: { required: true, signed: false },
      employer: { required: true, signed: false }
    },
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    blockchainContract: {
      network: 'testnet',
      contractAddress: '0x742d35Cc6634C0532925a3b8D404fddBD4f5B8A2',
      deploymentTx: '0x1234567890abcdef1234567890abcdef12345678',
      gasUsed: 150000,
      deploymentCost: '0.008 MATIC'
    }
  }
}

function generateContractHTML(contract: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contract.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
        }
        
        .contract-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #007bff;
        }
        
        .header h1 {
            color: #007bff;
            font-size: 2.2rem;
            margin-bottom: 10px;
        }
        
        .contract-id {
            color: #666;
            font-size: 0.9rem;
            font-family: 'Courier New', monospace;
        }
        
        .content {
            white-space: pre-line;
            margin-bottom: 40px;
        }
        
        .content h1 {
            color: #007bff;
            font-size: 1.8rem;
            margin: 30px 0 20px 0;
            text-align: center;
        }
        
        .content h2 {
            color: #333;
            font-size: 1.3rem;
            margin: 25px 0 15px 0;
            border-left: 4px solid #007bff;
            padding-left: 15px;
        }
        
        .blockchain-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .blockchain-section h3 {
            color: #fff;
            margin-bottom: 15px;
        }
        
        .contract-address {
            font-family: 'Courier New', monospace;
            background: rgba(255,255,255,0.2);
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            word-break: break-all;
        }
        
        .signatures {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #eee;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        
        .signature-box {
            width: 45%;
            padding: 20px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            text-align: center;
            background: #f8f9fa;
        }
        
        .signature-status {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .signature-status.pending {
            color: #ffc107;
        }
        
        .signature-status.signed {
            color: #28a745;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        
        .status-draft {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-pending {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .status-signed {
            background: #d4edda;
            color: #155724;
        }
        
        .actions {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .contract-container {
                box-shadow: none;
                padding: 20px;
            }
            
            .actions {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="contract-container">
        <div class="header">
            <h1>${contract.title}</h1>
            <div class="contract-id">Contract ID: ${contract.id}</div>
            <div class="status-badge status-${contract.status.toLowerCase()}">${contract.status}</div>
        </div>
        
        <div class="content">
            ${contract.content.replace(/\n/g, '<br>')}
        </div>
        
        ${contract.blockchainContract ? `
        <div class="blockchain-section">
            <h3>🔗 Blockchain Contract Details</h3>
            <p><strong>Network:</strong> Polygon ${contract.blockchainContract.network}</p>
            <p><strong>Contract Address:</strong></p>
            <div class="contract-address">${contract.blockchainContract.contractAddress}</div>
            <p><strong>Deployment Transaction:</strong> ${contract.blockchainContract.deploymentTx}</p>
            <p><strong>Gas Used:</strong> ${contract.blockchainContract.gasUsed.toLocaleString()}</p>
            <p><strong>Deployment Cost:</strong> ${contract.blockchainContract.deploymentCost}</p>
        </div>
        ` : ''}
        
        <div class="signatures">
            <h2>Digital Signatures</h2>
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-status ${contract.signatures.employee.signed ? 'signed' : 'pending'}">
                        Employee Signature
                    </div>
                    <p>${contract.signatures.employee.signed ? '✅ Signed' : '⏳ Pending Signature'}</p>
                    ${contract.signatures.employee.signedAt ? `<p><small>Signed: ${new Date(contract.signatures.employee.signedAt).toLocaleString()}</small></p>` : ''}
                </div>
                
                <div class="signature-box">
                    <div class="signature-status ${contract.signatures.employer.signed ? 'signed' : 'pending'}">
                        Employer Signature
                    </div>
                    <p>${contract.signatures.employer.signed ? '✅ Signed' : '⏳ Pending Signature'}</p>
                    ${contract.signatures.employer.signedAt ? `<p><small>Signed: ${new Date(contract.signatures.employer.signedAt).toLocaleString()}</small></p>` : ''}
                </div>
            </div>
        </div>
        
        <div class="actions">
            <a href="/api/contracts/download/${contract.id}" class="btn btn-success">📄 Download PDF</a>
            <a href="/api/contracts/signature/${contract.id}" class="btn btn-primary">✍️ Send for Signature</a>
        </div>
    </div>
    
    <script>
        // Auto-refresh signature status every 30 seconds
        setInterval(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>
  `
}
