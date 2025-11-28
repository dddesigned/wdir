import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, device_id } = body

    if (!email || !code || !device_id) {
      return NextResponse.json(
        { success: false, error: 'Email, code, and device_id are required' },
        { status: 400 }
      )
    }

    // Find the most recent unused code for this email
    const { data: verificationCode, error: codeError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark code as used
    await supabaseAdmin
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationCode.id)

    // Get the license for this email (take most recent if multiple)
    const { data: licenses, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (licenseError || !licenses || licenses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active license found' },
        { status: 404 }
      )
    }

    const license = licenses[0]

    // Register or update device
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
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', existingDevice.id)
    } else {
      // Register new device
      await supabaseAdmin
        .from('devices')
        .insert({
          license_id: license.id,
          device_id,
          last_used_at: new Date().toISOString()
        })
    }

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
    console.error('Verification confirm error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
