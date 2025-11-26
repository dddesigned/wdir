import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateVerificationCode, getCodeExpiration } from '@/lib/verification'
import { sendVerificationCode } from '@/lib/email'
import type { RequestVerificationCodeRequest } from '@/types/license'

const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW_MINUTES = 60

export async function POST(request: NextRequest) {
  try {
    const body: RequestVerificationCodeRequest = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim()

    // Check if license exists for this email
    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('id, email, is_active, company_name, inspector_name')
      .ilike('email', normalizedEmail)
      .single()

    if (licenseError || !license) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active license found for this email address'
        },
        { status: 404 }
      )
    }

    if (!license.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your license has been deactivated. Please contact support.'
        },
        { status: 403 }
      )
    }

    // Rate limiting: Check recent code requests
    const windowStart = new Date()
    windowStart.setMinutes(windowStart.getMinutes() - ATTEMPT_WINDOW_MINUTES)

    const { data: recentCodes } = await supabaseAdmin
      .from('verification_codes')
      .select('id')
      .eq('email', normalizedEmail)
      .gte('created_at', windowStart.toISOString())

    if (recentCodes && recentCodes.length >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many verification requests. Please try again later.'
        },
        { status: 429 }
      )
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = getCodeExpiration()

    // Store code in database
    const { error: insertError } = await supabaseAdmin
      .from('verification_codes')
      .insert({
        email: normalizedEmail,
        code,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('Failed to store verification code:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // Send verification email
    const emailResult = await sendVerificationCode(normalizedEmail, code)

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // Delete the code since email failed
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('email', normalizedEmail)
        .eq('code', code)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send verification email. Please try again.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    })
  } catch (error) {
    console.error('Request code error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
