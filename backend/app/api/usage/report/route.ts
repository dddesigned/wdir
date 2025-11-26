import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ReportUsageRequest } from '@/types/license'

export async function POST(request: NextRequest) {
  try {
    const body: ReportUsageRequest = await request.json()
    const { email, period, report_count } = body

    if (!email || !period || report_count === undefined) {
      return NextResponse.json(
        { success: false, error: 'Email, period, and report_count are required' },
        { status: 400 }
      )
    }

    // Validate period format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json(
        { success: false, error: 'Invalid period format. Use YYYY-MM' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Get license
    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select('id, is_active')
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

    // Check if usage stat already exists for this period
    const { data: existingStat } = await supabaseAdmin
      .from('usage_stats')
      .select('*')
      .eq('license_id', license.id)
      .eq('period', period)
      .single()

    if (existingStat) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('usage_stats')
        .update({
          report_count,
          last_reported_at: new Date().toISOString()
        })
        .eq('id', existingStat.id)

      if (updateError) {
        console.error('Failed to update usage stats:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update usage statistics' },
          { status: 500 }
        )
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabaseAdmin
        .from('usage_stats')
        .insert({
          license_id: license.id,
          period,
          report_count
        })

      if (insertError) {
        console.error('Failed to insert usage stats:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to save usage statistics' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usage statistics recorded successfully'
    })
  } catch (error) {
    console.error('Report usage error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
