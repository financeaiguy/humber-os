import { createHash, createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, type CipherGCM, type DecipherGCM } from 'crypto'

export interface EncryptionConfig {
  algorithm: string
  keyDerivationIterations: number
  saltLength: number
  ivLength: number
  tagLength: number
}

export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyDerivationIterations: 100000,
  saltLength: 32,
  ivLength: 16,
  tagLength: 16
}

export interface EncryptedData {
  encrypted: string
  salt: string
  iv: string
  tag: string
  version: number
}

export class RecruitingEncryption {
  private config: EncryptionConfig
  private masterKey: string

  constructor(masterKey: string, config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG) {
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Master key must be at least 32 characters long')
    }
    this.masterKey = masterKey
    this.config = config
  }

  /**
   * Encrypt sensitive PII data with versioned encryption
   */
  encrypt(plaintext: string, keyVersion: number = 1): EncryptedData {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty data')
    }

    try {
      // Generate random salt and IV
      const salt = randomBytes(this.config.saltLength)
      const iv = randomBytes(this.config.ivLength)

      // Derive encryption key from master key and salt
      const derivedKey = pbkdf2Sync(
        this.masterKey,
        salt,
        this.config.keyDerivationIterations,
        32, // 256 bits
        'sha256'
      )

      // Create cipher
      const cipher = createCipheriv(this.config.algorithm, derivedKey, iv) as CipherGCM
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Get authentication tag
      const tag = cipher.getAuthTag()

      return {
        encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        version: keyVersion
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypt encrypted PII data
   */
  decrypt(encryptedData: EncryptedData): string {
    if (!encryptedData || !encryptedData.encrypted) {
      throw new Error('Cannot decrypt empty or invalid data')
    }

    try {
      // Convert hex strings back to buffers
      const salt = Buffer.from(encryptedData.salt, 'hex')
      const iv = Buffer.from(encryptedData.iv, 'hex')
      const tag = Buffer.from(encryptedData.tag, 'hex')

      // Derive the same key using the stored salt
      const derivedKey = pbkdf2Sync(
        this.masterKey,
        salt,
        this.config.keyDerivationIterations,
        32,
        'sha256'
      )

      // Create decipher
      const decipher = createDecipheriv(this.config.algorithm, derivedKey, iv) as DecipherGCM
      decipher.setAuthTag(tag)

      // Decrypt the data
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid encrypted data'}`)
    }
  }

  /**
   * Create searchable hash for PII fields (for duplicate detection)
   */
  createSearchableHash(data: string): string {
    if (!data) return ''
    
    // Normalize data (lowercase, trim)
    const normalized = data.toLowerCase().trim()
    
    // Create deterministic hash with salt
    const saltedData = normalized + this.masterKey
    return createHash('sha256').update(saltedData).digest('hex')
  }

  /**
   * Encrypt all PII fields in recruit data
   */
  encryptRecruitData(data: any): any {
    const PII_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'currentLocation']
    const encrypted = { ...data }

    PII_FIELDS.forEach(field => {
      if (encrypted[field]) {
        // Encrypt the field
        const encryptedField = this.encrypt(encrypted[field])
        encrypted[`${field}_encrypted`] = JSON.stringify(encryptedField)
        
        // Create searchable hash for email and phone
        if (field === 'email' || field === 'phone') {
          encrypted[`${field}_hash`] = this.createSearchableHash(encrypted[field])
        }
        
        // Remove plaintext
        delete encrypted[field]
      }
    })

    return encrypted
  }

  /**
   * Decrypt all PII fields in recruit data
   */
  decryptRecruitData(data: any): any {
    const PII_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'currentLocation']
    const decrypted = { ...data }

    PII_FIELDS.forEach(field => {
      const encryptedField = `${field}_encrypted`
      if (decrypted[encryptedField]) {
        try {
          const encryptedData = JSON.parse(decrypted[encryptedField])
          decrypted[field] = this.decrypt(encryptedData)
          // Keep encrypted version for storage
        } catch (error) {
          console.error(`Failed to decrypt ${field}:`, error)
          decrypted[field] = '[DECRYPTION_FAILED]'
        }
      }
    })

    return decrypted
  }

  /**
   * Anonymize recruit data for GDPR compliance
   */
  anonymizeRecruitData(data: any): any {
    const anonymized = { ...data }
    
    // Replace PII with anonymized values
    const piiFields = {
      firstName_encrypted: this.encrypt('ANONYMIZED_FIRST_NAME'),
      lastName_encrypted: this.encrypt('ANONYMIZED_LAST_NAME'),
      email_encrypted: this.encrypt(`anonymized_${Date.now()}@example.com`),
      phone_encrypted: this.encrypt('XXX-XXX-XXXX'),
      currentLocation_encrypted: this.encrypt('ANONYMIZED_LOCATION')
    }

    Object.assign(anonymized, piiFields)
    
    // Update hashes
    anonymized.email_hash = this.createSearchableHash(`anonymized_${Date.now()}@example.com`)
    if (anonymized.phone_hash) {
      anonymized.phone_hash = this.createSearchableHash('XXX-XXX-XXXX')
    }

    // Mark as anonymized
    anonymized.anonymized = 1
    anonymized.updated_at = Date.now()

    return anonymized
  }

  /**
   * Validate encrypted data integrity
   */
  validateEncryptedData(encryptedData: EncryptedData): boolean {
    try {
      // Try to decrypt - if it fails, data is corrupted
      this.decrypt(encryptedData)
      return true
    } catch {
      return false
    }
  }

  /**
   * Rotate encryption for existing data (for key rotation)
   */
  rotateEncryption(oldEncryptedData: EncryptedData, newKeyVersion: number): EncryptedData {
    // Decrypt with old key
    const plaintext = this.decrypt(oldEncryptedData)
    
    // Re-encrypt with new key version
    return this.encrypt(plaintext, newKeyVersion)
  }
}

// Utility functions for common operations
export function createRecruitingEncryption(masterKey?: string): RecruitingEncryption {
  const key = masterKey || process.env.RECRUITING_ENCRYPTION_KEY
  if (!key) {
    throw new Error('Recruiting encryption key not provided')
  }
  return new RecruitingEncryption(key)
}

export function hashEmail(email: string): string {
  if (!email) return ''
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

export function hashPhone(phone: string): string {
  if (!phone) return ''
  // Remove all non-digits for consistent hashing
  const cleanPhone = phone.replace(/\D/g, '')
  return createHash('sha256').update(cleanPhone).digest('hex')
}

// GDPR/BIPA compliance helpers
export const SENSITIVE_RECRUIT_FIELDS = [
  'firstName',
  'lastName', 
  'email',
  'phone',
  'currentLocation'
] as const

export const PII_RETENTION_POLICIES = {
  ACTIVE_RECRUITMENT: 365, // 1 year
  COMPLETED_HIRE: 2555, // 7 years (employment records)
  REJECTED_CANDIDATE: 90, // 3 months
  LEGAL_HOLD: -1 // Indefinite until hold lifted
} as const

export type PIIField = typeof SENSITIVE_RECRUIT_FIELDS[number]
export type RetentionPolicy = keyof typeof PII_RETENTION_POLICIES
