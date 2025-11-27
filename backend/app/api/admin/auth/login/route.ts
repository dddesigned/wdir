import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateVerificationCode, getCodeExpiration, isCodeExpired } from '@/lib/verification'
import { sendVerificationCode } from '@/lib/email'
import { isAdminEmail, createAdminSession } from '@/lib/admin-auth'

// POST /api/admin/auth/login - Request code or verify code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email is authorized admin
    if (!isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // If no code provided, send verification code
    if (!code) {
      // Generate and send code
      const verificationCode = generateVerificationCode()
      const expiresAt = getCodeExpiration()

      // Store code
      const { error: insertError } = await supabaseAdmin
        .from('verification_codes')
        .insert({
          email: normalizedEmail,
          code: verificationCode,
          expires_at: expiresAt.toISOString()
        })

      if (insertError) {
        console.error('Failed to store verification code:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to generate verification code' },
          { status: 500 }
        )
      }

      // Send email
      const emailResult = await sendVerificationCode(normalizedEmail, verificationCode)

      if (!emailResult.success) {
        console.error('Failed to send email:', emailResult.error)
        return NextResponse.json(
          { success: false, error: 'Failed to send verification email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email'
      })
    }

    // Verify code and create session
    const { data: verificationCode, error: codeError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    // Check expiration
    if (isCodeExpired(verificationCode.expires_at)) {
      return NextResponse.json(
        { success: false, error: 'Verification code has expired' },
        { status: 401 }
      )
    }

    // Mark code as verified
    await supabaseAdmin
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', verificationCode.id)

    // Create session
    await createAdminSession(normalizedEmail)

    return NextResponse.json({
      success: true,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
