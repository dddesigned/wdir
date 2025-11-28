import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, device_id } = body

    if (!email || !device_id) {
      return NextResponse.json(
        { success: false, error: 'Email and device_id are required' },
        { status: 400 }
      )
    }

    // Verify device is registered
    const { data: device, error: deviceError } = await supabaseAdmin
      .from('devices')
      .select('license_id')
      .eq('device_id', device_id)
      .single()

    if (deviceError || !device) {
      return NextResponse.json(
        { success: false, error: 'Device not registered' },
        { status: 403 }
      )
    }

    // Get the license for this device
    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('id', device.license_id)
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (licenseError || !license) {
      return NextResponse.json(
        { success: false, error: 'No active license found' },
        { status: 404 }
      )
    }

    // Update device last_used_at
    await supabaseAdmin
      .from('devices')
      .update({ last_used_at: new Date().toISOString() })
      .eq('device_id', device_id)

    // Return license details
    return NextResponse.json({
      success: true,
      license_key: license.license_key,
      company_name: license.company_name,
      company_license_number: license.company_license_number,
      inspector_name: license.inspector_name,
      inspector_license: license.inspector_license
    })

  } catch (error) {
    console.error('License refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
