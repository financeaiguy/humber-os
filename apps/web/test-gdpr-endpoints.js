// Test script for GDPR endpoints
const baseUrl = 'http://localhost:3000/api/recruits'
const testRecruitId = 'rec_123'

// Test Audit Trail endpoint (GDPR Article 15)
async function testAuditTrail() {
  console.log('\n📋 Testing Audit Trail Endpoint (GDPR Article 15)...')
  console.log(`GET ${baseUrl}/${testRecruitId}/audit-trail`)
  
  try {
    const response = await fetch(`${baseUrl}/${testRecruitId}/audit-trail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Audit Trail Response:', JSON.stringify(data, null, 2).substring(0, 500) + '...')
      console.log(`✅ Total audit events: ${data.data?.auditEvents?.length || 0}`)
      console.log(`✅ GDPR Article: ${data.gdprCompliance?.article}`)
      console.log(`✅ Right Type: ${data.gdprCompliance?.rightType}`)
    } else {
      console.error('❌ Error:', data)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Test Anonymize endpoint (GDPR Article 17)
async function testAnonymize() {
  console.log('\n🔒 Testing Anonymize Endpoint (GDPR Article 17)...')
  console.log(`POST ${baseUrl}/${testRecruitId}/anonymize`)
  
  const requestBody = {
    reason: 'GDPR Article 17 - Right to be forgotten',
    requestorEmail: 'john.smith@example.com',
    confirmDeletion: true
  }
  
  console.log('Request body:', requestBody)
  
  try {
    const response = await fetch(`${baseUrl}/${testRecruitId}/anonymize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Anonymize Response:', JSON.stringify(data, null, 2).substring(0, 500) + '...')
      console.log(`✅ Status: ${data.data?.status}`)
      console.log(`✅ Systems updated: ${data.data?.systemsUpdated?.length || 0}`)
      console.log(`✅ GDPR Compliant: ${data.gdprCompliance?.compliant}`)
      console.log(`✅ Certificate ID: ${data.data?.confirmationDetails?.confirmationId}`)
    } else {
      console.error('❌ Error:', data)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting GDPR Endpoint Tests...')
  console.log('================================')
  
  // Test audit trail first
  await testAuditTrail()
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Test anonymize
  await testAnonymize()
  
  console.log('\n✨ Tests completed!')
  console.log('================================')
}

// Node 18+ has built-in fetch, no need to import

// Run the tests
runTests().catch(console.error)