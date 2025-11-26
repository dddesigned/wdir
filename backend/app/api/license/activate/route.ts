import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { LicenseActivationRequest } from '@/types/license'

export async function POST(request: NextRequest) {
  try {
    const body: LicenseActivationRequest = await request.json()
    const { license_key, device_info } = body

    if (!license_key) {
      return NextResponse.json(
        { success: false, error: 'License key is required' },
        { status: 400 }
      )
    }

    // Look up license
    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
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
        { success: false, error: 'License has been deactivated' },
        { status: 403 }
      )
    }

    // Check if expired
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'License has expired' },
        { status: 403 }
      )
    }

    // Update activation timestamp and device info
    const { data: updatedLicense, error: updateError } = await supabaseAdmin
      .from('licenses')
      .update({
        activated_at: license.activated_at || new Date().toISOString(),
        device_info: device_info || license.device_info,
        last_validated_at: new Date().toISOString()
      })
      .eq('id', license.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update license:', updateError)
    }

    return NextResponse.json({
      success: true,
      license: updatedLicense || license
    })
  } catch (error) {
    console.error('License activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
