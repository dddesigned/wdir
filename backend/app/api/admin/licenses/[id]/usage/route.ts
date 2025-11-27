import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/licenses/[id]/usage - Get usage stats for a license
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const { data: usage, error } = await supabaseAdmin
      .from('usage_stats')
      .select('*')
      .eq('license_id', id)
      .order('period', { ascending: false })
      .limit(12) // Last 12 months

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch usage stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      usage: usage || []
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Failed to fetch usage:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
