import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/schedule/plan-generator'

// Temporary: hardcoded user ID until auth is implemented
// TODO: Replace with actual auth
const TEMP_USER_ID = process.env.TEMP_USER_ID || 'demo-user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      heightCm,
      weightKg,
      longestRunKm,
      currentWeeklyKm,
      runsPerWeek,
      targetDate,
    } = body

    // Validate required fields
    if (!longestRunKm || !currentWeeklyKm || !targetDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate the training plan
    const plan = generatePlan({
      longestRunKm,
      currentWeeklyKm,
      runsPerWeek: runsPerWeek || 3,
      targetDate,
      includeModerateRuns: false, // Default to no moderate runs
    })

    const supabase = await createServerSupabase()

    // Update profile with fitness data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        height_cm: heightCm,
        weight_kg: weightKg,
        longest_run_km: longestRunKm,
        current_weekly_km: currentWeeklyKm,
        runs_per_week: runsPerWeek || 3,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', TEMP_USER_ID)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Continue anyway - profile might not exist yet
    }

    // Create the training plan
    const { data: trainingPlan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        user_id: TEMP_USER_ID,
        goal_race: 'half_marathon',
        target_date: plan.targetDate,
        start_date: plan.startDate,
        total_weeks: plan.totalWeeks,
        status: 'active',
        starting_longest_run_km: longestRunKm,
        starting_weekly_km: currentWeeklyKm,
      })
      .select()
      .single()

    if (planError) {
      console.error('Plan creation error:', planError)
      return NextResponse.json(
        { error: 'Failed to create training plan', details: planError.message },
        { status: 500 }
      )
    }

    // Insert all scheduled runs
    const scheduledRuns = plan.runs.map((run) => ({
      plan_id: trainingPlan.id,
      original_date: run.originalDate,
      scheduled_date: run.scheduledDate,
      distance_km: run.distanceKm,
      run_type: run.type,
      week_number: run.weekNumber,
      status: 'scheduled',
    }))

    const { error: runsError } = await supabase
      .from('scheduled_runs')
      .insert(scheduledRuns)

    if (runsError) {
      console.error('Runs creation error:', runsError)
      return NextResponse.json(
        { error: 'Failed to create scheduled runs', details: runsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      planId: trainingPlan.id,
      totalWeeks: plan.totalWeeks,
      totalRuns: plan.runs.length,
      warnings: plan.warnings,
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
