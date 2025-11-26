import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateLicenseKey } from '@/lib/license-utils'
import { sendWelcomeEmail } from '@/lib/email'
import type { License } from '@/types/license'

// GET /api/admin/licenses - List all licenses
export async function GET(request: NextRequest) {
  try {
    const { data: licenses, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch licenses:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch licenses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      licenses: licenses || []
    })
  } catch (error) {
    console.error('List licenses error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/licenses - Create a new license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      company_name,
      company_phone,
      company_license_number,
      inspector_name,
      inspector_license,
      license_type = 'individual',
      expires_at
    } = body

    // Validate required fields
    if (!email || !company_name || !inspector_name || !inspector_license) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: email, company_name, inspector_name, inspector_license'
        },
        { status: 400 }
      )
    }

    // Generate unique license key
    let license_key = generateLicenseKey()
    let attempts = 0
    const maxAttempts = 10

    // Ensure license key is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from('licenses')
        .select('id')
        .eq('license_key', license_key)
        .single()

      if (!existing) break

      license_key = generateLicenseKey()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique license key' },
        { status: 500 }
      )
    }

    // Insert new license
    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .insert({
        license_key,
        email,
        company_name,
        company_phone: company_phone || null,
        company_license_number: company_license_number || null,
        inspector_name,
        inspector_license,
        license_type,
        expires_at: expires_at || null,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create license:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create license' },
        { status: 500 }
      )
    }

    // Send welcome email
    await sendWelcomeEmail(email, company_name, inspector_name)

    return NextResponse.json({
      success: true,
      license
    })
  } catch (error) {
    console.error('Create license error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
