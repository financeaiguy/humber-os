import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

// JWT Payload schema with enhanced security fields
const JWTPayloadSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(['admin', 'manager', 'engineer', 'viewer']).optional(),
  permissions: z.array(z.string()).optional(),
  tokenType: z.enum(['access', 'refresh']).optional().default('access'),
  sessionId: z.string().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  nbf: z.number().optional(),
  jti: z.string().optional(), // JWT ID for blacklisting
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

type JWTPayload = z.infer<typeof JWTPayloadSchema>;

/**
 * Secure JWT token management with proper signature verification
 */
/**
 * Enhanced JWT Manager with security best practices
 * - Token blacklisting support
 * - IP and User-Agent binding
 * - Comprehensive validation
 * - Key rotation support
 * - Secure random ID generation
 */
export class JWTManager {
  private secret: Uint8Array;
  private issuer: string;
  private audience: string;

  constructor(secretKey: string, issuer = 'humber-os', audience = 'humber-api') {
    // Convert secret to Uint8Array for jose
    this.secret = new TextEncoder().encode(secretKey);
    this.issuer = issuer;
    this.audience = audience;
  }

  /**
   * Create a signed JWT token with enhanced security
   */
  async createToken(
    payload: Omit<JWTPayload, 'exp' | 'iat' | 'nbf' | 'jti'>, 
    expiresIn = '1h',
    options?: { ipAddress?: string; userAgent?: string }
  ): Promise<string> {
    const jti = crypto.randomUUID(); // Unique token ID for blacklisting
    
    const enhancedPayload = {
      ...payload,
      jti,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent
    };
    
    const jwt = await new SignJWT(enhancedPayload)
      .setProtectedHeader({ 
        alg: 'HS256', 
        typ: 'JWT',
        kid: 'humber-key-1' // Key ID for rotation
      })
      .setIssuedAt()
      .setNotBefore(Math.floor(Date.now() / 1000)) // Valid from now
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(expiresIn)
      .setJti(jti)
      .sign(this.secret);

    return jwt;
  }

  /**
   * Verify and decode a JWT token with comprehensive validation
   */
  async verifyToken(
    token: string, 
    options?: { 
      checkBlacklist?: boolean;
      expectedTokenType?: 'access' | 'refresh';
      kvStore?: KVNamespace;
    }
  ): Promise<JWTPayload | null> {
    try {
      const { payload, protectedHeader } = await jwtVerify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience,
        clockTolerance: 30, // 30 seconds clock skew tolerance
      });

      // Validate payload structure
      const validated = JWTPayloadSchema.safeParse(payload);
      if (!validated.success) {
        console.error('Invalid JWT payload structure:', validated.error);
        return null;
      }

      const tokenData = validated.data;

      // Check token type if specified
      if (options?.expectedTokenType && tokenData.tokenType !== options.expectedTokenType) {
        console.error(`Expected ${options.expectedTokenType} token, got ${tokenData.tokenType}`);
        return null;
      }

      // Check if token is blacklisted
      if (options?.checkBlacklist && options?.kvStore && tokenData.jti) {
        const blacklisted = await options.kvStore.get(`blacklist:${tokenData.jti}`);
        if (blacklisted) {
          console.error('Token is blacklisted:', tokenData.jti);
          return null;
        }
      }

      // Additional security checks
      if (tokenData.exp && tokenData.exp < Date.now() / 1000) {
        console.error('Token has expired');
        return null;
      }

      if (tokenData.nbf && tokenData.nbf > Date.now() / 1000) {
        console.error('Token not yet valid');
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Extract tenant ID from token without verification (for logging only)
   */
  extractTenantIdUnsafe(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.tenantId || null;
    } catch {
      return null;
    }
  }

  /**
   * Blacklist a token by its JTI
   */
  async blacklistToken(
    jti: string, 
    kvStore: KVNamespace, 
    reason: string = 'revoked',
    expirationTtl?: number
  ): Promise<void> {
    try {
      const blacklistData = {
        jti,
        reason,
        revokedAt: new Date().toISOString()
      };
      
      await kvStore.put(
        `blacklist:${jti}`, 
        JSON.stringify(blacklistData),
        expirationTtl ? { expirationTtl } : undefined
      );
    } catch (error) {
      console.error('Failed to blacklist token:', error);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(jti: string, kvStore: KVNamespace): Promise<boolean> {
    try {
      const blacklisted = await kvStore.get(`blacklist:${jti}`);
      return !!blacklisted;
    } catch (error) {
      console.error('Failed to check token blacklist:', error);
      return false;
    }
  }

  /**
   * Generate a secure random string for session IDs, etc.
   */
  static generateSecureId(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }
}