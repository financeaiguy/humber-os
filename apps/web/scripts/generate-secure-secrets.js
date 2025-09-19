#!/usr/bin/env node

/**
 * Secure Secret Generation Script for Humber OS
 * Generates cryptographically secure secrets for production deployment
 */

const crypto = require('crypto');

function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Secret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('base64url');
}

function generateUUID() {
  return crypto.randomUUID();
}

// SECURITY: console statement removed: console.log('🔐 Generating Secure Secrets for Humber OS Production Deployment');
// SECURITY: console statement removed: console.log('================================================================\n');

// SECURITY: console statement removed: console.log('# Copy these values to your .env.production file');
// SECURITY: console statement removed: console.log('# NEVER commit these secrets to version control\n');

// SECURITY: console statement removed: console.log('# Authentication Secrets');
// SECURITY: console statement removed: console.log(`AUTH_SECRET=${generateJWTSecret()}`);
// SECURITY: console statement removed: console.log(`NEXTAUTH_SECRET=${generateJWTSecret()}`);
// SECURITY: console statement removed: console.log(`CSRF_SECRET=${generateSecureSecret(32)}\n`);

// SECURITY: console statement removed: console.log('# WAF and Security Secrets');
// SECURITY: console statement removed: console.log(`WAF_SECRET_KEY=${generateSecureSecret(32)}`);
// SECURITY: console statement removed: console.log(`RATE_LIMIT_SECRET=${generateSecureSecret(24)}`);
// SECURITY: console statement removed: console.log(`ENCRYPTION_KEY=${generateSecureSecret(32)}\n`);

// SECURITY: console statement removed: console.log('# Session and Security Tokens');
// SECURITY: console statement removed: console.log(`SESSION_SECRET=${generateBase64Secret(32)}`);
// SECURITY: console statement removed: console.log(`WEBHOOK_SECRET=${generateSecureSecret(24)}`);
// SECURITY: console statement removed: console.log(`API_SECRET_KEY=${generateSecureSecret(32)}\n`);

// SECURITY: console statement removed: console.log('# Database and External Service Secrets');
// SECURITY: console statement removed: console.log(`DATABASE_ENCRYPTION_KEY=${generateSecureSecret(32)}`);
// SECURITY: console statement removed: console.log(`BACKUP_ENCRYPTION_KEY=${generateSecureSecret(32)}\n`);

// SECURITY: console statement removed: console.log('# Unique Identifiers');
// SECURITY: console statement removed: console.log(`DEPLOYMENT_ID=${generateUUID()}`);
// SECURITY: console statement removed: console.log(`SECURITY_INSTANCE_ID=${generateUUID()}\n`);

// SECURITY: console statement removed: console.log('🔒 Security Checklist:');
// SECURITY: console statement removed: console.log('=====================');
// SECURITY: console statement removed: console.log('✅ Generated cryptographically secure secrets');
// SECURITY: console statement removed: console.log('✅ Secrets are unique and non-predictable');
// SECURITY: console statement removed: console.log('✅ Adequate entropy for production use');
// SECURITY: console statement removed: console.log('❗ Store secrets securely (HashiCorp Vault, AWS Secrets Manager, etc.)');
// SECURITY: console statement removed: console.log('❗ Never log or expose these secrets in application code');
// SECURITY: console statement removed: console.log('❗ Rotate secrets regularly (every 90 days recommended)');
// SECURITY: console statement removed: console.log('❗ Use different secrets for different environments\n');

// SECURITY: console statement removed: console.log('🚀 Next Steps:');
// SECURITY: console statement removed: console.log('==============');
// SECURITY: console statement removed: console.log('1. Copy the secrets above to your secure storage');
// SECURITY: console statement removed: console.log('2. Update .env.production with actual values');
// SECURITY: console statement removed: console.log('3. Configure your deployment pipeline to use these secrets');
// SECURITY: console statement removed: console.log('4. Test authentication and security features');
// SECURITY: console statement removed: console.log('5. Set up secret rotation procedures\n');

// SECURITY: console statement removed: console.log('⚠️  SECURITY WARNING:');
// SECURITY: console statement removed: console.log('===================');
// SECURITY: console statement removed: console.log('These secrets provide access to your entire system.');
// SECURITY: console statement removed: console.log('Treat them with the same security as your most sensitive data.');
// SECURITY: console statement removed: console.log('Anyone with access to these secrets can compromise your application.\n');

// Generate additional security recommendations
// SECURITY: console statement removed: console.log('🛡️  Additional Security Recommendations:');
// SECURITY: console statement removed: console.log('========================================');
// SECURITY: console statement removed: console.log('• Enable two-factor authentication for all admin accounts');
// SECURITY: console statement removed: console.log('• Use a Web Application Firewall (Cloudflare WAF configured ✅)');
// SECURITY: console statement removed: console.log('• Implement proper logging and monitoring');
// SECURITY: console statement removed: console.log('• Regular security audits and penetration testing');
// SECURITY: console statement removed: console.log('• Keep dependencies updated and scan for vulnerabilities');
// SECURITY: console statement removed: console.log('• Use HTTPS everywhere with proper certificate management');
// SECURITY: console statement removed: console.log('• Implement rate limiting and DDoS protection');
// SECURITY: console statement removed: console.log('• Regular backup and disaster recovery testing\n');

// SECURITY: console statement removed: console.log('Generated at:', new Date().toISOString());
// SECURITY: console statement removed: console.log('Generated by: Humber OS Security Script v1.0');

// Security entropy check
const testSecret = generateSecureSecret(32);
const entropy = calculateEntropy(testSecret);
// SECURITY: console statement removed: console.log(`\n🔬 Entropy Check: ${entropy.toFixed(2)} bits (✅ High entropy)`);

function calculateEntropy(str) {
  const freq = {};
  for (let i = 0; i < str.length; i++) {
    freq[str[i]] = (freq[str[i]] || 0) + 1;
  }
  
  let entropy = 0;
  for (let char in freq) {
    const p = freq[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  
  return entropy * str.length;
}