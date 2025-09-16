# Security Documentation - Humber OS

## Table of Contents
- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [3-Layer Trust Verification](#3-layer-trust-verification)
- [Security Implementation](#security-implementation)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Compliance](#compliance)

## Overview

Humber OS implements enterprise-grade security with multiple layers of protection, ensuring data integrity, user authentication, and compliance with industry standards.

## Authentication & Authorization

### JWT Token Management

#### Token Structure
```javascript
// Access Token Payload
{
  // Standard Claims
  "sub": "user_123",              // Subject (user ID)
  "iat": 1704067200,              // Issued at
  "exp": 1704070800,              // Expiration (1 hour)
  "jti": "token_abc123",          // JWT ID (unique)
  
  // Custom Claims
  "email": "user@example.com",
  "role": "manager",
  "tenantId": "tenant_001",
  "permissions": [
    "read:time",
    "write:time",
    "approve:time",
    "read:engineers",
    "write:engineers"
  ],
  
  // Security Claims
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "deviceId": "device_xyz789",
  "sessionId": "session_123"
}
```

#### Token Lifecycle
1. **Login**: User provides credentials
2. **Verification**: Credentials validated against database
3. **Token Generation**: Access (1hr) and refresh (7d) tokens created
4. **Token Storage**: Secure httpOnly cookies or localStorage
5. **Token Refresh**: Automatic refresh before expiration
6. **Token Blacklist**: Revoked tokens stored in KV

### Implementation Files

#### JWT Manager (`apps/worker/src/lib/jwt.ts`)
```typescript
export class JWTManager {
  private secret: string
  private blacklistKV?: KVNamespace

  async createToken(
    payload: TokenPayload,
    expiresIn: string = '1h',
    options?: TokenOptions
  ): Promise<string> {
    // Add security claims
    const enrichedPayload = {
      ...payload,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      deviceId: options?.deviceId
    }
    
    return await new SignJWT(enrichedPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(this.secret)
  }

  async verifyToken(
    token: string,
    options?: VerifyOptions
  ): Promise<JWTPayload | null> {
    // Check blacklist
    if (options?.checkBlacklist && this.blacklistKV) {
      const isBlacklisted = await this.blacklistKV.get(`blacklist:${token}`)
      if (isBlacklisted) return null
    }

    // Verify signature and claims
    const { payload } = await jwtVerify(token, this.secret)
    
    // Validate additional claims
    if (options?.expectedTokenType) {
      if (payload.type !== options.expectedTokenType) return null
    }
    
    return payload
  }

  async blacklistToken(token: string, ttl?: number): Promise<void> {
    if (!this.blacklistKV) return
    
    const decoded = decodeJWT(token)
    const expiresIn = ttl || (decoded.exp - Math.floor(Date.now() / 1000))
    
    await this.blacklistKV.put(
      `blacklist:${token}`,
      'true',
      { expirationTtl: expiresIn }
    )
  }
}
```

#### Authentication Middleware (`apps/worker/src/middleware/auth.ts`)
```typescript
export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)
    const jwtManager = new JWTManager(c.env.JWT_SECRET)
    
    const payload = await jwtManager.verifyToken(token, {
      checkBlacklist: true,
      expectedTokenType: 'access',
      kvStore: c.env.TOKEN_BLACKLIST
    })

    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Check IP address consistency
    const clientIP = c.req.header('CF-Connecting-IP')
    if (payload.ipAddress && payload.ipAddress !== clientIP) {
      await jwtManager.blacklistToken(token)
      return c.json({ error: 'Token compromised' }, 401)
    }

    c.set('user', payload)
    await next()
  }
}
```

### Role-Based Access Control (RBAC)

#### Roles and Permissions
```typescript
const ROLES = {
  ADMIN: {
    name: 'Administrator',
    permissions: ['*']  // All permissions
  },
  MANAGER: {
    name: 'Manager',
    permissions: [
      'read:*',
      'write:time',
      'approve:time',
      'write:engineers',
      'read:analytics'
    ]
  },
  ENGINEER: {
    name: 'Engineer',
    permissions: [
      'read:own-profile',
      'write:own-time',
      'read:projects'
    ]
  },
  VIEWER: {
    name: 'Viewer',
    permissions: [
      'read:time',
      'read:engineers',
      'read:analytics'
    ]
  }
}
```

## 3-Layer Trust Verification

### Layer 1: Biometric Authentication (40% weight)

#### Methods Supported
- Face ID (iOS)
- Touch ID (iOS/macOS)
- Fingerprint (Android)
- Windows Hello
- Voice Recognition (future)

#### Implementation
```typescript
async function verifyBiometric(type: BiometricType): Promise<BiometricResult> {
  const result = {
    verified: false,
    type,
    timestamp: new Date().toISOString(),
    score: 0
  }

  try {
    // Platform-specific biometric verification
    switch (type) {
      case 'FaceID':
        result.verified = await verifyFaceID()
        break
      case 'TouchID':
        result.verified = await verifyTouchID()
        break
      case 'Fingerprint':
        result.verified = await verifyFingerprint()
        break
    }

    if (result.verified) {
      result.score = 40  // Maximum biometric score
    }
  } catch (error) {
    console.error('Biometric verification failed:', error)
  }

  return result
}
```

### Layer 2: Geolocation Verification (35% weight)

#### Geofencing Configuration
```typescript
const GEOFENCES = {
  'GM_TECH_CENTER': {
    center: { lat: 42.3314, lng: -83.0458 },
    radius: 500,  // meters
    name: 'GM Tech Center - Detroit'
  },
  'FORD_ROUGE': {
    center: { lat: 42.3154, lng: -83.2165 },
    radius: 750,
    name: 'Ford Rouge Complex - Dearborn'
  }
}

function isWithinGeofence(
  location: Coordinates,
  geofence: Geofence
): boolean {
  const distance = calculateDistance(
    location,
    geofence.center
  )
  
  return distance <= geofence.radius
}
```

#### Location Verification Methods
1. **GPS**: Primary method, ±5-10m accuracy
2. **WiFi Triangulation**: Backup, ±20-40m accuracy
3. **Cell Tower**: Fallback, ±100-300m accuracy
4. **Bluetooth Beacons**: Indoor positioning, ±1-3m accuracy

### Layer 3: Device Trust (25% weight)

#### Device Verification Checks
```typescript
interface DeviceTrust {
  deviceId: string
  platform: string
  jailbroken: boolean
  appVersion: string
  osVersion: string
  networkSecurity: 'secure' | 'unsecure'
  certificatePinning: boolean
}

async function verifyDevice(device: DeviceInfo): Promise<DeviceTrustResult> {
  const checks = {
    registered: await isDeviceRegistered(device.deviceId),
    jailbroken: await detectJailbreak(device),
    versionValid: isVersionSupported(device.appVersion),
    networkSecure: await checkNetworkSecurity(),
    certificateValid: await verifyCertificatePinning()
  }

  const score = calculateDeviceTrustScore(checks)
  
  return {
    verified: score >= 20,  // Minimum 80% of checks passed
    score: Math.min(score, 25),  // Maximum device score
    checks
  }
}
```

### Trust Score Calculation
```typescript
function calculateTrustScore(
  biometric: BiometricResult,
  location: LocationResult,
  device: DeviceTrustResult
): number {
  const totalScore = 
    (biometric.verified ? biometric.score : 0) +
    (location.verified ? location.score : 0) +
    (device.verified ? device.score : 0)
  
  return Math.round(totalScore)
}

// Trust score thresholds
const TRUST_LEVELS = {
  HIGH: 90,      // All layers verified perfectly
  MEDIUM: 75,    // Minor issues in one layer
  LOW: 60,       // Issues in multiple layers
  FAILED: 0      // Critical failure
}
```

## Security Implementation

### Security Headers

```typescript
export const securityHeaders = (): MiddlewareHandler => {
  return async (c, next) => {
    // Prevent clickjacking
    c.header('X-Frame-Options', 'DENY')
    
    // XSS Protection
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-XSS-Protection', '1; mode=block')
    
    // HTTPS enforcement
    c.header('Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload')
    
    // Content Security Policy
    c.header('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.humber-os.com"
    )
    
    // Referrer Policy
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Permissions Policy
    c.header('Permissions-Policy', 
      'geolocation=(self), camera=(), microphone=()')
    
    await next()
  }
}
```

### Rate Limiting

```typescript
export class RateLimiter {
  private kv: KVNamespace
  private limits: RateLimitConfig

  async checkLimit(
    identifier: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    const key = `rate:${endpoint}:${identifier}`
    const limit = this.limits[endpoint] || this.limits.default
    
    const current = await this.kv.get(key)
    const count = current ? parseInt(current) : 0
    
    if (count >= limit.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + limit.window
      }
    }
    
    await this.kv.put(
      key,
      String(count + 1),
      { expirationTtl: limit.window }
    )
    
    return {
      allowed: true,
      remaining: limit.requests - count - 1,
      resetAt: Date.now() + limit.window
    }
  }
}

// Rate limit configuration
const RATE_LIMITS = {
  '/api/auth/login': { requests: 5, window: 60 },      // 5 per minute
  '/api/time/clock-in': { requests: 10, window: 60 },  // 10 per minute
  '/api/time/entries': { requests: 100, window: 60 },  // 100 per minute
  'default': { requests: 100, window: 60 }             // Default limit
}
```

### Input Sanitization

```typescript
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove HTML tags
    input = input.replace(/<[^>]*>/g, '')
    
    // Escape special characters
    input = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
    
    // Remove SQL injection attempts
    input = input.replace(
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/gi,
      ''
    )
    
    // Trim whitespace
    input = input.trim()
  } else if (Array.isArray(input)) {
    input = input.map(sanitizeInput)
  } else if (typeof input === 'object' && input !== null) {
    Object.keys(input).forEach(key => {
      input[key] = sanitizeInput(input[key])
    })
  }
  
  return input
}
```

## Data Protection

### Encryption at Rest

```typescript
import { AES, enc } from 'crypto-js'

export class DataEncryption {
  private key: string

  encrypt(data: string): string {
    return AES.encrypt(data, this.key).toString()
  }

  decrypt(encryptedData: string): string {
    const bytes = AES.decrypt(encryptedData, this.key)
    return bytes.toString(enc.Utf8)
  }

  // Encrypt sensitive fields before storage
  encryptSensitiveFields(obj: any, fields: string[]): any {
    const encrypted = { ...obj }
    
    fields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field])
      }
    })
    
    return encrypted
  }
}

// Usage
const SENSITIVE_FIELDS = [
  'ssn',
  'bankAccount',
  'salary',
  'medicalInfo'
]
```

### Audit Logging

```typescript
export class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      result: event.result,
      metadata: event.metadata
    }
    
    // Store in database
    await db.auditLogs.insert(entry)
    
    // Alert on suspicious activity
    if (this.isSuspicious(event)) {
      await this.alertSecurityTeam(entry)
    }
  }

  private isSuspicious(event: AuditEvent): boolean {
    // Check for suspicious patterns
    return (
      event.action.includes('DELETE') ||
      event.action.includes('EXPORT_ALL') ||
      event.failedAttempts > 3 ||
      this.isUnusualLocation(event.ipAddress) ||
      this.isUnusualTime(event.timestamp)
    )
  }
}
```

## API Security

### API Key Management

```typescript
export class APIKeyManager {
  async generateKey(clientId: string): Promise<APIKey> {
    const key = {
      id: crypto.randomUUID(),
      clientId,
      key: this.generateSecureKey(),
      secret: this.generateSecureSecret(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      permissions: [],
      rateLimit: 1000
    }
    
    // Hash the secret before storage
    key.secret = await this.hashSecret(key.secret)
    
    await db.apiKeys.insert(key)
    return key
  }

  private generateSecureKey(): string {
    return `hmbr_${crypto.randomUUID().replace(/-/g, '')}`
  }

  private generateSecureSecret(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }
}
```

### Webhook Security

```typescript
export class WebhookSecurity {
  async verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const expectedSignature = await this.computeSignature(payload, secret)
    
    // Constant-time comparison to prevent timing attacks
    return this.secureCompare(signature, expectedSignature)
  }

  private async computeSignature(
    payload: string,
    secret: string
  ): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const key = encoder.encode(secret)
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      data
    )
    
    return `sha256=${btoa(String.fromCharCode(...new Uint8Array(signature)))}`
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    
    return result === 0
  }
}
```

## Compliance

### GDPR Compliance

- **Data Minimization**: Only collect necessary data
- **Right to Access**: API endpoints for data export
- **Right to Erasure**: Soft delete with hard delete after 30 days
- **Data Portability**: Export in JSON/CSV formats
- **Consent Management**: Explicit consent tracking
- **Privacy by Design**: Encryption and anonymization

### SOC 2 Type II Controls

- **Access Controls**: RBAC, MFA, session management
- **Change Management**: Git-based deployment, code reviews
- **Data Backup**: Daily backups with 30-day retention
- **Incident Response**: 24/7 monitoring, automated alerts
- **Vulnerability Management**: Regular security audits

### Industry Standards

- **OWASP Top 10**: Protection against common vulnerabilities
- **PCI DSS**: Secure payment processing (future)
- **ISO 27001**: Information security management
- **NIST Cybersecurity Framework**: Risk management

## Security Best Practices

### Development
1. **Code Reviews**: All code requires peer review
2. **Dependency Scanning**: Automated vulnerability checks
3. **Static Analysis**: ESLint security rules
4. **Secret Management**: No hardcoded secrets
5. **Secure Defaults**: Security on by default

### Operations
1. **Monitoring**: Real-time security event monitoring
2. **Logging**: Comprehensive audit trails
3. **Backup**: Regular encrypted backups
4. **Updates**: Regular security patches
5. **Training**: Security awareness for all staff

### Incident Response
1. **Detection**: Automated threat detection
2. **Containment**: Immediate isolation of threats
3. **Eradication**: Complete removal of threats
4. **Recovery**: Restore from clean backups
5. **Lessons Learned**: Post-incident review

## Security Contacts

- **Security Team**: security@humber-os.com
- **Bug Bounty**: bugbounty@humber-os.com
- **Emergency**: +1-555-SEC-RITY (24/7)
- **Compliance**: compliance@humber-os.com

---

Last Updated: January 2025
Version: 1.0.0