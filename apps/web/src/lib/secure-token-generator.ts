/**
 * Secure token generation utilities using cryptographically strong random values
 * Replaces weak Math.random() based token generation across the application
 */

/**
 * Generates a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hexadecimal string representation of the token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates a secure alphanumeric token
 * @param length - Length of the resulting string (default: 16)
 * @returns Base62 encoded secure random string
 */
export function generateSecureAlphanumericToken(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}

/**
 * Generates a secure ID with a prefix
 * @param prefix - Prefix for the ID (e.g., 'approval', 'expense', 'invoice')
 * @param length - Length of the random part (default: 16)
 * @returns Prefixed secure ID
 */
export function generateSecureId(prefix: string, length: number = 16): string {
  const randomPart = generateSecureAlphanumericToken(length)
  const timestamp = Date.now().toString(36) // Not for security, just for rough ordering
  return `${prefix}-${timestamp}-${randomPart}`
}

/**
 * Generates a secure approval ID
 */
export function generateApprovalId(): string {
  return generateSecureId('approval')
}

/**
 * Generates a secure expense ID
 */
export function generateExpenseId(): string {
  return generateSecureId('exp')
}

/**
 * Generates a secure payment ID
 */
export function generatePaymentId(): string {
  return generateSecureId('pay')
}

/**
 * Generates a secure invoice ID
 */
export function generateInvoiceId(): string {
  return generateSecureId('inv')
}

/**
 * Generates a secure line item ID
 */
export function generateLineItemId(): string {
  return generateSecureId('line')
}

/**
 * Generates a secure time entry ID
 */
export function generateTimeEntryId(): string {
  return generateSecureId('entry')
}

/**
 * Generates a secure transaction ID (for payments)
 */
export function generateTransactionId(): string {
  return generateSecureAlphanumericToken(20).toUpperCase()
}

/**
 * Generates a secure invoice number with format HMB-YYYYMM-XXXX
 * where XXXX is a secure random 4-digit number
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  
  // Generate secure 4-digit sequence instead of Math.random()
  const randomBytes = new Uint8Array(2)
  crypto.getRandomValues(randomBytes)
  const sequence = String((randomBytes[0] << 8 | randomBytes[1]) % 9999 + 1).padStart(4, '0')
  
  return `HMB-${year}${month}-${sequence}`
}

/**
 * Generates a secure request ID for error tracking
 */
export function generateRequestId(): string {
  return generateSecureAlphanumericToken(12)
}

/**
 * Generates a secure session ID
 */
export function generateSessionId(): string {
  return generateSecureToken(48) // Extra long for session security
}

/**
 * Generates a secure anonymous user ID
 */
export function generateAnonymousUserId(): string {
  return 'anonymous_' + generateSecureAlphanumericToken(12)
}

/**
 * Generates a secure knowledge base ID
 */
export function generateKnowledgeId(): string {
  return generateSecureId('kn')
}

/**
 * Validates that a token appears to be securely generated
 * (basic heuristic - checks length and character distribution)
 */
export function isTokenSecure(token: string): boolean {
  // Minimum length check
  if (token.length < 16) return false
  
  // Check for sufficient entropy (basic check for character variety)
  const uniqueChars = new Set(token.split(''))
  if (uniqueChars.size < Math.min(token.length * 0.3, 20)) return false
  
  // Check that it's not obviously predictable (no simple patterns)
  const patterns = [
    /^(\d+)$/, // All digits
    /^([a-z]+)$/, // All lowercase
    /^([A-Z]+)$/, // All uppercase
    /^(.)\1{10,}/, // Repeated characters
    /^(abc|123|aaa|000)/, // Simple sequences
  ]
  
  return !patterns.some(pattern => pattern.test(token))
}

/**
 * Generates a secure challenge for authentication purposes
 */
export function generateAuthChallenge(): string {
  return generateSecureToken(64) // Extra long for auth security
}

/**
 * Generates a secure nonce for cryptographic operations
 */
export function generateNonce(length: number = 32): string {
  return generateSecureToken(length)
}