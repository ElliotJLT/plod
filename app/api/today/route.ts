import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns'

// Temporary: hardcoded user ID until auth is implemented
const TEMP_USER_ID = process.env.TEMP_USER_ID || 'demo-user'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    // Get active training plan
    const { data: plan } = await supabase
      .from('training_plans')
      .select('id, target_date, goal_race')
      .eq('user_id', TEMP_USER_ID)
      .eq('status', 'active')
      .single()

    if (!plan) {
      return NextResponse.json({
        hasActivePlan: false,
        todayRun: null,
        lastRun: null,
        weekProgress: null,
      })
    }

    // Get today's run
    const { data: todayRun } = await supabase
      .from('scheduled_runs')
      .select('*')
      .eq('plan_id', plan.id)
      .eq('scheduled_date', today)
      .neq('status', 'skipped')
      .single()

    // Get last completed run
    const { data: lastRuns } = await supabase
      .from('scheduled_runs')
      .select('*')
      .eq('plan_id', plan.id)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false })
      .limit(1)

    const lastRun = lastRuns?.[0] || null

    // Get this week's runs for progress
    const { data: weekRuns } = await supabase
      .from('scheduled_runs')
      .select('*')
      .eq('plan_id', plan.id)
      .gte('scheduled_date', weekStart)
      .lte('scheduled_date', weekEnd)

    // Calculate week progress
    type RunRecord = { status: string; distance_km: number }
    const plannedRuns = weekRuns?.filter((r: RunRecord) => r.status !== 'skipped') || []
    const completedRuns = weekRuns?.filter((r: RunRecord) => r.status === 'completed') || []

    const weekProgress = {
      planned: plannedRuns.length,
      completed: completedRuns.length,
      plannedKm: plannedRuns.reduce((sum: number, r: RunRecord) => sum + Number(r.distance_km), 0),
      completedKm: completedRuns.reduce((sum: number, r: RunRecord) => sum + Number(r.distance_km), 0),
    }

    // Get next upcoming run (if not today)
    let nextRun = todayRun
    if (!nextRun) {
      const { data: upcomingRuns } = await supabase
        .from('scheduled_runs')
        .select('*')
        .eq('plan_id', plan.id)
        .gt('scheduled_date', today)
        .neq('status', 'skipped')
        .neq('status', 'completed')
        .order('scheduled_date', { ascending: true })
        .limit(1)

      nextRun = upcomingRuns?.[0] || null
    }

    return NextResponse.json({
      hasActivePlan: true,
      targetDate: plan.target_date,
      goalRace: plan.goal_race,
      todayRun: todayRun
        ? {
            id: todayRun.id,
            date: todayRun.scheduled_date,
            distanceKm: Number(todayRun.distance_km),
            type: todayRun.run_type,
            status: todayRun.status,
          }
        : null,
      nextRun: nextRun && nextRun.id !== todayRun?.id
        ? {
            id: nextRun.id,
            date: nextRun.scheduled_date,
            distanceKm: Number(nextRun.distance_km),
            type: nextRun.run_type,
          }
        : null,
      lastRun: lastRun
        ? {
            id: lastRun.id,
            date: lastRun.scheduled_date,
            distanceKm: Number(lastRun.distance_km),
            type: lastRun.run_type,
            effortRating: lastRun.effort_rating,
          }
        : null,
      weekProgress,
    })
  } catch (error) {
    console.error('Today API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch today data' },
      { status: 500 }
    )
  }
}
