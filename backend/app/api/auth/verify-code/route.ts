import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isCodeExpired } from '@/lib/verification'
import { sendMultiDeviceAlert } from '@/lib/email'
import type { VerifyCodeRequest } from '@/types/license'

const MAX_ATTEMPTS = 3

export async function POST(request: NextRequest) {
  try {
    const body: VerifyCodeRequest = await request.json()
    const { email, code, device_info } = body

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Find verification code
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

    // Check if code has expired
    if (isCodeExpired(verificationCode.expires_at)) {
      return NextResponse.json(
        { success: false, error: 'Verification code has expired' },
        { status: 401 }
      )
    }

    // Check attempts
    if (verificationCode.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed attempts. Please request a new code.'
        },
        { status: 401 }
      )
    }

    // Get license
    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .ilike('email', normalizedEmail)
      .single()

    if (licenseError || !license) {
      return NextResponse.json(
        { success: false, error: 'License not found' },
        { status: 404 }
      )
    }

    if (!license.is_active) {
      return NextResponse.json(
        { success: false, error: 'License is not active' },
        { status: 403 }
      )
    }

    // Mark code as verified
    await supabaseAdmin
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', verificationCode.id)

    // Handle device registration if device_info provided
    if (device_info) {
      const { device_id, device_model, os_version } = device_info

      // Check if device already exists
      const { data: existingDevice } = await supabaseAdmin
        .from('devices')
        .select('*')
        .eq('license_id', license.id)
        .eq('device_id', device_id)
        .single()

      if (existingDevice) {
        // Update last_used_at
        await supabaseAdmin
          .from('devices')
          .update({
            last_used_at: new Date().toISOString(),
            device_model,
            os_version
          })
          .eq('id', existingDevice.id)
      } else {
        // Register new device
        await supabaseAdmin.from('devices').insert({
          license_id: license.id,
          device_id,
          device_model: device_model || null,
          os_version: os_version || null
        })
      }

      // Update license activation timestamp if not already activated
      if (!license.activated_at) {
        await supabaseAdmin
          .from('licenses')
          .update({ activated_at: new Date().toISOString() })
          .eq('id', license.id)
      }
    }

    // Get all devices for this license
    const { data: devices } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('license_id', license.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: false })

    // Check if license should be flagged for multi-device
    const recentDeviceCount = devices?.filter(d => {
      const lastUsed = new Date(d.last_used_at)
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      return lastUsed > twelveMonthsAgo
    }).length || 0

    const shouldFlag = recentDeviceCount >= 3
    const wasAlreadyFlagged = license.flagged_multi_device

    // Update license flag if needed
    if (shouldFlag && !wasAlreadyFlagged) {
      await supabaseAdmin
        .from('licenses')
        .update({ flagged_multi_device: true })
        .eq('id', license.id)

      // Send admin alert
      const recentDevices = devices?.slice(0, 5).map(d => ({
        device_model: d.device_model,
        last_used_at: d.last_used_at
      })) || []

      await sendMultiDeviceAlert(
        license.license_key,
        license.email,
        license.company_name,
        recentDeviceCount,
        recentDevices
      )
    }

    return NextResponse.json({
      success: true,
      license,
      devices: devices || []
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
