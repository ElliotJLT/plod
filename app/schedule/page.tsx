'use client'

import { useState, useMemo } from 'react'
import { startOfWeek, addDays, format } from 'date-fns'
import { Target } from 'lucide-react'
import { WeekCalendar } from '@/components/features/schedule'
import {
  calculateMoveEffect,
  calculateSkipEffect,
} from '@/lib/schedule/cascade-calculator'
import type {
  ScheduledRun,
  TrainingPlan,
  ScheduleWeek,
  CascadePreview,
} from '@/lib/types/schedule'

// Mock training plan for development
// In production, this would come from Supabase
const mockPlan: TrainingPlan = {
  id: 'plan-1',
  userId: 'user-1',
  goalRace: 'half_marathon',
  targetDate: '2026-04-19',
  startDate: '2026-01-27',
  totalWeeks: 12,
  status: 'active',
  runs: [
    // Week 1
    {
      id: 'run-1',
      planId: 'plan-1',
      originalDate: '2026-01-27',
      scheduledDate: '2026-01-27',
      distanceKm: 4,
      type: 'easy',
      weekNumber: 1,
      status: 'completed',
      effortRating: 'good',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'run-2',
      planId: 'plan-1',
      originalDate: '2026-01-29',
      scheduledDate: '2026-01-29',
      distanceKm: 5,
      type: 'easy',
      weekNumber: 1,
      status: 'completed',
      effortRating: 'easy',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'run-3',
      planId: 'plan-1',
      originalDate: '2026-02-01',
      scheduledDate: '2026-02-01',
      distanceKm: 8,
      type: 'long',
      weekNumber: 1,
      status: 'scheduled',
      createdAt: '',
      updatedAt: '',
    },
    // Week 2
    {
      id: 'run-4',
      planId: 'plan-1',
      originalDate: '2026-02-02',
      scheduledDate: '2026-02-02',
      distanceKm: 3,
      type: 'recovery',
      weekNumber: 2,
      status: 'scheduled',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'run-5',
      planId: 'plan-1',
      originalDate: '2026-02-04',
      scheduledDate: '2026-02-04',
      distanceKm: 5,
      type: 'easy',
      weekNumber: 2,
      status: 'scheduled',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'run-6',
      planId: 'plan-1',
      originalDate: '2026-02-06',
      scheduledDate: '2026-02-06',
      distanceKm: 5,
      type: 'easy',
      weekNumber: 2,
      status: 'scheduled',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'run-7',
      planId: 'plan-1',
      originalDate: '2026-02-08',
      scheduledDate: '2026-02-08',
      distanceKm: 10,
      type: 'long',
      weekNumber: 2,
      status: 'scheduled',
      createdAt: '',
      updatedAt: '',
    },
  ],
  adjustments: [],
  createdAt: '',
  updatedAt: '',
}

function calculateDaysUntilGoal(targetDate: string): number {
  const target = new Date(targetDate)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getWeekInfo(
  runs: ScheduledRun[],
  weekStart: Date,
  planStartDate: string
): ScheduleWeek {
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd')

  // Calculate week number from plan start
  const planStart = new Date(planStartDate)
  const diffTime = weekStart.getTime() - planStart.getTime()
  const weekNumber = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000)) + 1

  // Filter runs for this week
  const weekRuns = runs.filter((run) => {
    return run.scheduledDate >= weekStartStr && run.scheduledDate <= weekEndStr
  })

  const plannedRuns = weekRuns.filter((r) => r.status !== 'skipped')
  const completedRuns = weekRuns.filter((r) => r.status === 'completed')

  const plannedDistanceKm = plannedRuns.reduce((sum, r) => sum + r.distanceKm, 0)
  const completedDistanceKm = completedRuns.reduce(
    (sum, r) => sum + r.distanceKm,
    0
  )

  return {
    weekNumber: Math.max(1, weekNumber),
    startDate: weekStartStr,
    endDate: weekEndStr,
    days: [], // Not used in this view
    plannedDistanceKm,
    completedDistanceKm,
    plannedRuns: plannedRuns.length,
    completedRuns: completedRuns.length,
  }
}

export default function SchedulePage() {
  const [plan, setPlan] = useState<TrainingPlan>(mockPlan)
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  )

  const daysUntilGoal = calculateDaysUntilGoal(plan.targetDate)
  const weekInfo = useMemo(
    () => getWeekInfo(plan.runs, currentWeekStart, plan.startDate),
    [plan.runs, currentWeekStart, plan.startDate]
  )

  function handleMoveRun(runId: string, newDate: string) {
    setPlan((prev) => ({
      ...prev,
      runs: prev.runs.map((run) =>
        run.id === runId
          ? {
              ...run,
              scheduledDate: newDate,
              status: 'moved' as const,
              movedFrom: run.movedFrom || run.originalDate,
            }
          : run
      ),
    }))
  }

  function handleSkipRun(runId: string) {
    setPlan((prev) => ({
      ...prev,
      runs: prev.runs.map((run) =>
        run.id === runId
          ? {
              ...run,
              status: 'skipped' as const,
            }
          : run
      ),
    }))
  }

  function handleCalculateCascade(
    runId: string,
    newDate: string
  ): CascadePreview | null {
    return calculateMoveEffect(plan, runId, newDate)
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 pb-6">
        <h1 className="text-lg font-medium text-foreground">Schedule</h1>
      </header>

      <main className="px-4 space-y-4 stagger-children">
        {/* Goal card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Half Marathon</p>
              <p className="text-sm text-foreground mt-0.5">
                {format(new Date(plan.targetDate), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-light text-foreground">
                {daysUntilGoal}
              </p>
              <p className="text-xs text-muted-foreground">days to go</p>
            </div>
          </div>
        </div>

        {/* Week calendar */}
        <WeekCalendar
          runs={plan.runs}
          currentWeekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
          onMoveRun={handleMoveRun}
          onSkipRun={handleSkipRun}
          onCalculateCascade={handleCalculateCascade}
          weekInfo={weekInfo}
        />
      </main>
    </div>
  )
}
