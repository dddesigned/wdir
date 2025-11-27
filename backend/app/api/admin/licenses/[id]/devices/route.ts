import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/licenses/[id]/devices - Get devices for a license
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const { data: devices, error } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('license_id', id)
      .order('last_used_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch devices' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      devices: devices || []
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Failed to fetch devices:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
