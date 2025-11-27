import { cookies } from 'next/headers'

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []

/**
 * Check if an email is an authorized admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

/**
 * Create admin session cookie
 */
export async function createAdminSession(email: string) {
  const cookieStore = await cookies()

  // Set session cookie (expires in 7 days)
  cookieStore.set('admin_session', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

/**
 * Get current admin session
 */
export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session) return null

  // Verify the email is still an admin
  if (!isAdminEmail(session.value)) {
    // Don't clear cookie here - can only be cleared in Server Actions/Route Handlers
    // Just return null and the user will be redirected to login
    return null
  }

  return session.value
}

/**
 * Clear admin session
 */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

/**
 * Require admin authentication (for API routes)
 */
export async function requireAdmin(): Promise<string> {
  const email = await getAdminSession()

  if (!email) {
    throw new Error('Unauthorized')
  }

  return email
}
