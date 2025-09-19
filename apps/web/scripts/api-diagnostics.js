#!/usr/bin/env node

/**
 * Comprehensive API Diagnostics Script
 * Tests all API endpoints and provides detailed analysis
 */

const https = require('https');
const http = require('http');

// Configuration
const NEXT_JS_URL = 'http://localhost:3000';
const WORKER_URL = 'http://localhost:8787';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = url.startsWith('https:') ? https : http;

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HumberOS-Diagnostics/1.0'
      },
      timeout: 5000,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }

        resolve({
          success: true,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: parsedData,
          responseTime,
          error: null
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      resolve({
        success: false,
        status: 0,
        statusMessage: 'Network Error',
        headers: {},
        data: null,
        responseTime,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      resolve({
        success: false,
        status: 0,
        statusMessage: 'Timeout',
        headers: {},
        data: null,
        responseTime,
        error: 'Request timeout after 5 seconds'
      });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testEndpoint(name, url, method = 'GET', body = null) {
  log(`\n🔍 Testing: ${name}`, 'cyan');
  log(`   URL: ${url}`, 'dim');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'HumberOS-Diagnostics/1.0'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const result = await makeRequest(url, options);

  if (result.success) {
    const statusColor = result.status >= 200 && result.status < 300 ? 'green' :
                       result.status >= 300 && result.status < 400 ? 'yellow' : 'red';
    log(`   ✅ Status: ${result.status} ${result.statusMessage}`, statusColor);
    log(`   ⏱️  Response Time: ${result.responseTime}ms`, 'blue');

    // Check for important headers
    const corsHeaders = result.headers['access-control-allow-origin'];
    if (corsHeaders) {
      log(`   🌍 CORS: ${corsHeaders}`, 'green');
    } else {
      log(`   ⚠️  CORS: Not found`, 'yellow');
    }

    // Check response data structure
    if (result.data && typeof result.data === 'object') {
      if (result.data.success !== undefined) {
        log(`   📊 API Success: ${result.data.success}`, result.data.success ? 'green' : 'red');
      }
      if (result.data.data && Array.isArray(result.data.data.recruits)) {
        log(`   👥 Recruits Count: ${result.data.data.recruits.length}`, 'blue');
      }
      if (result.data.data && result.data.data.recruit) {
        log(`   ➕ Created Recruit: ${result.data.data.recruit.id}`, 'green');
      }
    }
  } else {
    log(`   ❌ Failed: ${result.error}`, 'red');
    log(`   ⏱️  Time to Fail: ${result.responseTime}ms`, 'yellow');
  }

  return result;
}

async function runDiagnostics() {
  log('🚀 Starting Comprehensive API Diagnostics', 'bright');
  log('='.repeat(50), 'dim');

  const results = {};

  // Test Next.js server connectivity
  log('\n🏠 Testing Next.js Server Connectivity', 'magenta');
  results.nextjs_health = await testEndpoint(
    'Next.js Health Check',
    `${NEXT_JS_URL}/`
  );

  // Test Worker server connectivity
  log('\n⚡ Testing Worker Server Connectivity', 'magenta');
  results.worker_health = await testEndpoint(
    'Worker Health Check',
    `${WORKER_URL}/`
  );

  // Test Recruits API - GET
  log('\n👥 Testing Recruits API', 'magenta');
  results.recruits_get = await testEndpoint(
    'GET Recruits (Next.js)',
    `${NEXT_JS_URL}/api/recruits?limit=5`
  );

  results.recruits_get_worker = await testEndpoint(
    'GET Recruits (Worker)',
    `${WORKER_URL}/api/recruits?limit=5`
  );

  // Test Recruits API - POST
  const testRecruit = {
    firstName: 'Diagnostic',
    lastName: 'Test',
    email: `test-${Date.now()}@example.com`,
    phone: '(555) 999-0000',
    position: 'Test Engineer',
    department: 'QA',
    status: 'pending'
  };

  results.recruits_post = await testEndpoint(
    'POST Recruits (Next.js)',
    `${NEXT_JS_URL}/api/recruits`,
    'POST',
    testRecruit
  );

  // Generate comprehensive report
  log('\n📊 DIAGNOSTIC SUMMARY', 'bright');
  log('='.repeat(50), 'dim');

  let totalTests = 0;
  let passedTests = 0;
  let avgResponseTime = 0;
  let totalResponseTime = 0;

  for (const [testName, result] of Object.entries(results)) {
    totalTests++;
    if (result.success && result.status >= 200 && result.status < 300) {
      passedTests++;
    }
    totalResponseTime += result.responseTime;
  }

  avgResponseTime = Math.round(totalResponseTime / totalTests);

  log(`\n📈 Overall Health: ${passedTests}/${totalTests} tests passed`,
      passedTests === totalTests ? 'green' : passedTests > totalTests / 2 ? 'yellow' : 'red');
  log(`⚡ Average Response Time: ${avgResponseTime}ms`, 'blue');

  // Specific recommendations
  log('\n🔧 RECOMMENDATIONS', 'bright');

  if (!results.nextjs_health.success) {
    log('❌ Next.js server is not responding. Start with: PORT=3000 pnpm dev', 'red');
  }

  if (!results.worker_health.success) {
    log('❌ Worker server is not responding. Start with: cd apps/worker && pnpm dev', 'red');
  }

  if (results.recruits_get.success && results.recruits_get.status === 200) {
    log('✅ Recruits API is working correctly on Next.js', 'green');
  } else {
    log('⚠️  Recruits API has issues on Next.js', 'yellow');
  }

  if (results.recruits_get_worker.success) {
    log('✅ Worker correctly routes to Next.js for recruits API', 'green');
  } else {
    log('⚠️  Worker routing may have issues', 'yellow');
  }

  if (avgResponseTime > 1000) {
    log('⚠️  Response times are slow (>1s). Consider optimization.', 'yellow');
  } else if (avgResponseTime < 200) {
    log('✅ Excellent response times (<200ms)', 'green');
  }

  log('\n🎯 NEXT STEPS', 'bright');

  if (passedTests === totalTests) {
    log('🎉 All tests passed! Your API is working correctly.', 'green');
    log('🌐 You can now test in browser: http://localhost:3000/api-test-enhanced.html', 'cyan');
  } else {
    log('🔧 Some tests failed. Check the issues above and:', 'yellow');
    log('   1. Ensure both servers are running', 'dim');
    log('   2. Check for port conflicts', 'dim');
    log('   3. Verify database connections', 'dim');
    log('   4. Check middleware configurations', 'dim');
  }

  log('\n✨ Diagnostics Complete!', 'bright');
}

// Run diagnostics if this script is executed directly
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics, testEndpoint, makeRequest };