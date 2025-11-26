/**
 * Generate a random license key in format: XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars (0, O, I, 1)
  const segments = 4
  const segmentLength = 4

  const key = Array.from({ length: segments }, () => {
    return Array.from({ length: segmentLength }, () => {
      return characters.charAt(Math.floor(Math.random() * characters.length))
    }).join('')
  }).join('-')

  return key
}

/**
 * Validate license key format
 */
export function isValidLicenseKeyFormat(key: string): boolean {
  const pattern = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/
  return pattern.test(key)
}
