import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { LicenseValidationRequest } from '@/types/license'

export async function POST(request: NextRequest) {
  try {
    const body: LicenseValidationRequest = await request.json()
    const { license_key } = body

    if (!license_key) {
      return NextResponse.json(
        { success: false, error: 'License key is required' },
        { status: 400 }
      )
    }

    // Look up license
    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .select('is_active, expires_at, license_type')
      .eq('license_key', license_key)
      .single()

    if (error || !license) {
      return NextResponse.json(
        { success: false, error: 'Invalid license key' },
        { status: 404 }
      )
    }

    // Check if active
    if (!license.is_active) {
      return NextResponse.json(
        {
          success: true,
          is_active: false,
          expires_at: license.expires_at,
          error: 'License has been deactivated or revoked'
        },
        { status: 200 }
      )
    }

    // Check if expired
    const isExpired = license.expires_at && new Date(license.expires_at) < new Date()

    if (isExpired) {
      return NextResponse.json(
        {
          success: true,
          is_active: false,
          expires_at: license.expires_at,
          error: 'License has expired'
        },
        { status: 200 }
      )
    }

    // Update last validated timestamp
    await supabaseAdmin
      .from('licenses')
      .update({ last_validated_at: new Date().toISOString() })
      .eq('license_key', license_key)

    return NextResponse.json({
      success: true,
      is_active: true,
      expires_at: license.expires_at
    })
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
