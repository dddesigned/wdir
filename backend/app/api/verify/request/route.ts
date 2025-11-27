import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendVerificationCode } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email has an active license (take most recent if multiple)
    const { data: licenses, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (licenseError || !licenses || licenses.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active license found for this email' },
        { status: 404 }
      )
    }

    const license = licenses[0]

    // Check rate limiting (max 5 requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentCodes } = await supabaseAdmin
      .from('verification_codes')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo)

    if (recentCodes && recentCodes.length >= 5) {
      return NextResponse.json(
        { success: false, message: 'Too many verification requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code in database with 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await supabaseAdmin
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt,
        used: false
      })

    if (insertError) {
      console.error('Failed to store verification code:', insertError)
      return NextResponse.json(
        { success: false, message: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // Send email with code
    try {
      await sendVerificationCode(email, code)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully'
    })

  } catch (error) {
    console.error('Verification request error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
