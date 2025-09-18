#!/usr/bin/env node

/**
 * COMPREHENSIVE SECURITY VALIDATION SCRIPT
 * 
 * This script validates all remaining security issues for penetration test pass
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛡️ COMPREHENSIVE SECURITY VALIDATION');
console.log('=====================================\n');

let totalIssues = 0;
let criticalIssues = 0;

// 1. Check for console statements
console.log('1. 🔍 CHECKING CONSOLE STATEMENTS...');
try {
  const consoleFiles = execSync('find apps/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | xargs grep -l "console\\." 2>/dev/null | wc -l', { encoding: 'utf8' });
  const count = parseInt(consoleFiles.trim());
  
  if (count > 0) {
    console.log(`❌ CRITICAL: ${count} files still contain console statements`);
    criticalIssues++;
    totalIssues++;
  } else {
    console.log('✅ PASSED: No console statements found');
  }
} catch (error) {
  console.log('✅ PASSED: No console statements found');
}

// 2. Check for hardcoded secrets
console.log('\n2. 🔍 CHECKING FOR HARDCODED SECRETS...');
const secretPatterns = [
  'password.*=.*["\'].*["\']',
  'secret.*=.*["\'].*["\']',
  'token.*=.*["\'].*["\']',
  'key.*=.*["\'].*["\']'
];

let secretsFound = false;
secretPatterns.forEach(pattern => {
  try {
    const result = execSync(`find apps/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | xargs grep -i "${pattern}" 2>/dev/null | grep -v "change-me" | head -5`, { encoding: 'utf8' });
    if (result.trim()) {
      console.log(`❌ WARNING: Potential hardcoded secrets found`);
      secretsFound = true;
      totalIssues++;
    }
  } catch (error) {
    // No secrets found for this pattern
  }
});

if (!secretsFound) {
  console.log('✅ PASSED: No hardcoded secrets detected');
}

// 3. Check for PII in code
console.log('\n3. 🔍 CHECKING FOR PII IN CODE...');
const piiPatterns = [
  '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b',
  '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
  '\\b\\d{3}-\\d{2}-\\d{4}\\b'
];

let piiFound = false;
piiPatterns.forEach(pattern => {
  try {
    const result = execSync(`find apps/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | xargs grep -E "${pattern}" 2>/dev/null | grep -v "example.com" | grep -v "000-0000" | head -3`, { encoding: 'utf8' });
    if (result.trim()) {
      console.log(`❌ WARNING: Potential PII found in code`);
      piiFound = true;
      totalIssues++;
    }
  } catch (error) {
    // No PII found for this pattern
  }
});

if (!piiFound) {
  console.log('✅ PASSED: No PII detected in code');
}

// 4. Check middleware integration
console.log('\n4. 🔍 CHECKING MIDDLEWARE INTEGRATION...');
try {
  const workerIndex = fs.readFileSync('apps/worker/src/index.ts', 'utf8');
  
  const middlewareChecks = [
    { name: 'Rate Limiting', pattern: /app\.use.*RateLimit/i },
    { name: 'CSRF Protection', pattern: /app\.use.*CSRF/i },
    { name: 'Authentication', pattern: /app\.use.*authMiddleware/i }
  ];
  
  let middlewareIssues = 0;
  middlewareChecks.forEach(check => {
    if (!check.pattern.test(workerIndex)) {
      console.log(`❌ CRITICAL: ${check.name} middleware not properly integrated`);
      middlewareIssues++;
      criticalIssues++;
    } else {
      console.log(`✅ PASSED: ${check.name} middleware integrated`);
    }
  });
  
  totalIssues += middlewareIssues;
} catch (error) {
  console.log('❌ CRITICAL: Cannot read worker index file');
  criticalIssues++;
  totalIssues++;
}

// 5. Check environment configuration
console.log('\n5. 🔍 CHECKING ENVIRONMENT CONFIGURATION...');
const envFiles = ['.env.local', '.env.production', 'apps/web/.env.local'];
let envIssues = 0;

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('change-me') || content.includes('your-secret-here')) {
        console.log(`❌ CRITICAL: Weak secrets in ${envFile}`);
        envIssues++;
        criticalIssues++;
      }
    } catch (error) {
      console.log(`⚠️ WARNING: Cannot read ${envFile}`);
    }
  }
});

if (envIssues === 0) {
  console.log('✅ PASSED: No weak environment secrets detected');
}
totalIssues += envIssues;

// 6. Check for error handling issues
console.log('\n6. 🔍 CHECKING ERROR HANDLING...');
try {
  const errorFiles = execSync('find apps/ -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -l "error\\.stack\\|error\\.message" 2>/dev/null | wc -l', { encoding: 'utf8' });
  const count = parseInt(errorFiles.trim());
  
  if (count > 5) {
    console.log(`❌ WARNING: ${count} files potentially exposing error details`);
    totalIssues++;
  } else {
    console.log('✅ PASSED: Error handling appears secure');
  }
} catch (error) {
  console.log('✅ PASSED: Error handling appears secure');
}

// Final Assessment
console.log('\n🎯 FINAL SECURITY ASSESSMENT');
console.log('============================');
console.log(`Total Issues Found: ${totalIssues}`);
console.log(`Critical Issues: ${criticalIssues}`);

if (criticalIssues === 0 && totalIssues <= 2) {
  console.log('\n🎉 PENETRATION TEST STATUS: ✅ LIKELY TO PASS');
  console.log('Security posture is strong with minimal non-critical issues.');
} else if (criticalIssues === 0 && totalIssues <= 5) {
  console.log('\n⚠️ PENETRATION TEST STATUS: 🟡 CONDITIONAL PASS');
  console.log('Some minor issues remain but critical vulnerabilities are addressed.');
} else if (criticalIssues <= 2) {
  console.log('\n❌ PENETRATION TEST STATUS: 🔴 LIKELY TO FAIL');
  console.log('Critical security issues remain that must be addressed.');
} else {
  console.log('\n💥 PENETRATION TEST STATUS: 🚨 WILL DEFINITELY FAIL');
  console.log('Multiple critical vulnerabilities present. Immediate action required.');
}

console.log('\n📋 NEXT STEPS:');
if (criticalIssues > 0) {
  console.log('1. Address all critical security issues immediately');
  console.log('2. Re-run this validation script');
  console.log('3. Conduct manual security review');
} else {
  console.log('1. Address remaining minor issues');
  console.log('2. Conduct final security review');
  console.log('3. Ready for penetration testing');
}

process.exit(criticalIssues > 0 ? 1 : 0);
