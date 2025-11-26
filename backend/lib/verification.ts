/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Get expiration timestamp (10 minutes from now)
 */
export function getCodeExpiration(): Date {
  const expiration = new Date()
  expiration.setMinutes(expiration.getMinutes() + 10)
  return expiration
}

/**
 * Check if a code has expired
 */
export function isCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

/**
 * Format period as YYYY-MM from Date
 */
export function formatPeriod(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
