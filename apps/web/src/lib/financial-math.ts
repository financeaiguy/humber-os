/**
 * MASTER-LEVEL FINANCIAL CALCULATIONS
 * 
 * CRITICAL: Never use JavaScript number for money calculations
 * Uses decimal.js for precise financial arithmetic
 * Complies with financial regulations and audit requirements
 */

import Decimal from 'decimal.js'

// Configure Decimal for financial precision
Decimal.set({
  precision: 28,        // 28 decimal places for maximum precision
  rounding: Decimal.ROUND_HALF_UP,  // Standard financial rounding
  toExpNeg: -7,         // Use exponential notation for very small numbers
  toExpPos: 21,         // Use exponential notation for very large numbers
  maxE: 9e15,          // Maximum exponent
  minE: -9e15,         // Minimum exponent
  modulo: Decimal.ROUND_DOWN,
  crypto: true         // Use crypto-secure random number generation
})

export class FinancialMath {
  
  /**
   * Create a financial decimal from number, string, or another decimal
   * ALWAYS use this instead of raw numbers for money
   */
  static decimal(value: number | string | Decimal): Decimal {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error('Invalid financial value: must be finite number')
    }
    return new Decimal(value)
  }
  
  /**
   * Add two financial amounts with precision
   */
  static add(a: number | string | Decimal, b: number | string | Decimal): Decimal {
    return this.decimal(a).plus(this.decimal(b))
  }
  
  /**
   * Subtract two financial amounts with precision
   */
  static subtract(a: number | string | Decimal, b: number | string | Decimal): Decimal {
    return this.decimal(a).minus(this.decimal(b))
  }
  
  /**
   * Multiply financial amounts (e.g., hours * rate)
   */
  static multiply(a: number | string | Decimal, b: number | string | Decimal): Decimal {
    return this.decimal(a).times(this.decimal(b))
  }
  
  /**
   * Divide financial amounts with proper rounding
   */
  static divide(a: number | string | Decimal, b: number | string | Decimal): Decimal {
    const divisor = this.decimal(b)
    if (divisor.isZero()) {
      throw new Error('Division by zero in financial calculation')
    }
    return this.decimal(a).dividedBy(divisor)
  }
  
  /**
   * Calculate percentage with financial precision
   */
  static percentage(amount: number | string | Decimal, percent: number | string | Decimal): Decimal {
    return this.multiply(amount, this.divide(percent, 100))
  }
  
  /**
   * Round to currency precision (2 decimal places)
   */
  static toCurrency(amount: number | string | Decimal): Decimal {
    return this.decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  }
  
  /**
   * Format as currency string
   */
  static formatCurrency(amount: number | string | Decimal, currency = 'USD'): string {
    const decimal = this.toCurrency(amount)
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return formatter.format(decimal.toNumber())
  }
  
  /**
   * Validate financial amount
   */
  static validate(amount: any): { valid: boolean; error?: string; value?: Decimal } {
    try {
      if (amount === null || amount === undefined) {
        return { valid: false, error: 'Amount cannot be null or undefined' }
      }
      
      const decimal = this.decimal(amount)
      
      if (!decimal.isFinite()) {
        return { valid: false, error: 'Amount must be finite' }
      }
      
      if (decimal.isNaN()) {
        return { valid: false, error: 'Amount is not a valid number' }
      }
      
      // Check for reasonable financial limits (adjust as needed)
      const maxAmount = new Decimal('999999999999.99') // ~$1 trillion
      const minAmount = new Decimal('-999999999999.99')
      
      if (decimal.greaterThan(maxAmount) || decimal.lessThan(minAmount)) {
        return { valid: false, error: 'Amount exceeds reasonable financial limits' }
      }
      
      return { valid: true, value: decimal }
      
    } catch (error) {
      return { valid: false, error: 'Invalid amount format' }
    }
  }
  
  /**
   * Calculate compound interest with precision
   */
  static compoundInterest(
    principal: number | string | Decimal,
    rate: number | string | Decimal,
    periods: number,
    compoundingFrequency: number = 1
  ): Decimal {
    const p = this.decimal(principal)
    const r = this.decimal(rate)
    const n = this.decimal(compoundingFrequency)
    const t = this.decimal(periods)
    
    // A = P(1 + r/n)^(nt)
    const ratePerPeriod = r.dividedBy(n)
    const exponent = n.times(t)
    const base = this.decimal(1).plus(ratePerPeriod)
    
    return p.times(base.pow(exponent.toNumber()))
  }
  
  /**
   * Calculate tax with proper rounding
   */
  static calculateTax(amount: number | string | Decimal, taxRate: number | string | Decimal): {
    pretax: Decimal;
    tax: Decimal;
    total: Decimal;
  } {
    const pretax = this.decimal(amount)
    const tax = this.toCurrency(this.multiply(pretax, this.divide(taxRate, 100)))
    const total = this.add(pretax, tax)
    
    return { pretax, tax, total }
  }
  
  /**
   * Sum array of financial amounts
   */
  static sum(amounts: (number | string | Decimal)[]): Decimal {
    return amounts.reduce((total, amount) => this.add(total, amount), this.decimal(0))
  }
  
  /**
   * Calculate weighted average
   */
  static weightedAverage(values: { amount: number | string | Decimal; weight: number | string | Decimal }[]): Decimal {
    const totalWeightedValue = values.reduce((sum, item) => 
      this.add(sum, this.multiply(item.amount, item.weight)), this.decimal(0)
    )
    
    const totalWeight = values.reduce((sum, item) => 
      this.add(sum, item.weight), this.decimal(0)
    )
    
    if (totalWeight.isZero()) {
      throw new Error('Total weight cannot be zero for weighted average')
    }
    
    return this.divide(totalWeightedValue, totalWeight)
  }
}

/**
 * Financial validation schemas for API endpoints
 */
export const FinancialValidation = {
  
  /**
   * Validate and sanitize financial input
   */
  sanitizeAmount(input: any): Decimal {
    const validation = FinancialMath.validate(input)
    if (!validation.valid) {
      throw new Error(`Invalid financial amount: ${validation.error}`)
    }
    return validation.value!
  },
  
  /**
   * Validate positive amount (for expenses, costs, etc.)
   */
  validatePositiveAmount(input: any): Decimal {
    const amount = this.sanitizeAmount(input)
    if (amount.lessThanOrEqualTo(0)) {
      throw new Error('Amount must be positive')
    }
    return amount
  },
  
  /**
   * Validate percentage (0-100)
   */
  validatePercentage(input: any): Decimal {
    const percent = this.sanitizeAmount(input)
    if (percent.lessThan(0) || percent.greaterThan(100)) {
      throw new Error('Percentage must be between 0 and 100')
    }
    return percent
  },
  
  /**
   * Validate hourly rate
   */
  validateHourlyRate(input: any): Decimal {
    const rate = this.sanitizeAmount(input)
    if (rate.lessThan(0)) {
      throw new Error('Hourly rate cannot be negative')
    }
    if (rate.greaterThan(10000)) { // $10,000/hour seems reasonable max
      throw new Error('Hourly rate exceeds reasonable maximum')
    }
    return rate
  }
}

export default FinancialMath
