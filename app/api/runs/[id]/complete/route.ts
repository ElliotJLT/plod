import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { effortRating } = body

    if (!effortRating || !['easy', 'good', 'hard', 'struggle'].includes(effortRating)) {
      return NextResponse.json(
        { error: 'Invalid effort rating' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('scheduled_runs')
      .update({
        status: 'completed',
        effort_rating: effortRating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Complete run error:', error)
      return NextResponse.json(
        { error: 'Failed to complete run' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      run: {
        id: data.id,
        status: data.status,
        effortRating: data.effort_rating,
      },
    })
  } catch (error) {
    console.error('Complete run error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
