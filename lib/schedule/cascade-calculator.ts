/**
 * Cascade Calculator
 *
 * Calculates the ripple effects of moving or skipping a run.
 * Shows users what changes without judgment.
 */

import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import type {
  CascadeEffect,
  CascadePreview,
  RiskLevel,
  RunType,
  ScheduledRun,
  TrainingPlan,
} from '@/lib/types/schedule'

/**
 * Rules for scheduling:
 * 1. Hard runs (long, moderate) cannot be on consecutive days
 * 2. Recovery runs can be compressed but not eliminated
 * 3. Weekly volume should stay within 10% of planned
 * 4. Long run should stay on weekend when possible
 * 5. At least 1 rest day per week must remain
 */

const HARD_RUN_TYPES: RunType[] = ['long', 'moderate']
const WEEKEND_DAYS = [0, 6] // Sunday, Saturday

interface DaySlot {
  date: string
  run?: ScheduledRun
  isRestDay: boolean
}

/**
 * Get all runs for a specific week
 */
function getWeekRuns(runs: ScheduledRun[], weekStart: Date): ScheduledRun[] {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }) // Monday start
  return runs.filter((run) => {
    const runDate = parseISO(run.scheduledDate)
    return !isBefore(runDate, weekStart) && !isAfter(runDate, weekEnd)
  })
}

/**
 * Calculate weekly distance for a set of runs
 */
function calculateWeeklyDistance(runs: ScheduledRun[]): number {
  return runs
    .filter((r) => r.status !== 'skipped')
    .reduce((sum, run) => sum + run.distanceKm, 0)
}

/**
 * Count rest days in a week
 */
function countRestDays(runs: ScheduledRun[], weekStart: Date): number {
  const weekRuns = getWeekRuns(runs, weekStart)
  const runDates = new Set(weekRuns.map((r) => r.scheduledDate))
  let restDays = 0

  for (let i = 0; i < 7; i++) {
    const date = format(addDays(weekStart, i), 'yyyy-MM-dd')
    if (!runDates.has(date)) {
      restDays++
    }
  }

  return restDays
}

/**
 * Check if two dates are consecutive
 */
function areConsecutive(date1: string, date2: string): boolean {
  const d1 = parseISO(date1)
  const d2 = parseISO(date2)
  return Math.abs(differenceInDays(d1, d2)) === 1
}

/**
 * Check if a run is a hard effort
 */
function isHardRun(run: ScheduledRun): boolean {
  return HARD_RUN_TYPES.includes(run.type)
}

/**
 * Find runs that would conflict with a new date
 */
function findConflicts(
  runs: ScheduledRun[],
  targetRun: ScheduledRun,
  newDate: string
): ScheduledRun[] {
  const conflicts: ScheduledRun[] = []

  for (const run of runs) {
    if (run.id === targetRun.id) continue
    if (run.status === 'skipped') continue

    // Same day conflict
    if (run.scheduledDate === newDate) {
      conflicts.push(run)
      continue
    }

    // Hard run on consecutive days conflict
    if (isHardRun(targetRun) && isHardRun(run)) {
      if (areConsecutive(newDate, run.scheduledDate)) {
        conflicts.push(run)
      }
    }
  }

  return conflicts
}

/**
 * Generate AI-friendly summary of changes
 */
function generateSummary(
  targetRun: ScheduledRun,
  action: 'skip' | 'move',
  newDate: string | undefined,
  affectedRuns: ScheduledRun[],
  distanceChange: number,
  restDaysLost: number
): string[] {
  const summary: string[] = []
  const runLabel = `${targetRun.distanceKm}km ${targetRun.type} run`

  if (action === 'skip') {
    summary.push(`${runLabel} will be removed from this week`)
  } else if (newDate) {
    const newDay = format(parseISO(newDate), 'EEEE')
    summary.push(`${runLabel} moves to ${newDay}`)
  }

  if (affectedRuns.length > 0) {
    summary.push(`${affectedRuns.length} other run${affectedRuns.length > 1 ? 's' : ''} will adjust`)
  }

  if (distanceChange !== 0) {
    const direction = distanceChange > 0 ? 'increases' : 'decreases'
    summary.push(`Weekly distance ${direction} by ${Math.abs(distanceChange).toFixed(1)}km`)
  }

  if (restDaysLost > 0) {
    summary.push(`${restDaysLost} rest day${restDaysLost > 1 ? 's' : ''} reduced this week`)
  }

  return summary
}

/**
 * Determine risk level based on cascade effects
 */
function assessRisk(
  runsAffected: number,
  distanceChangePercent: number,
  restDaysLost: number,
  hasConsecutiveHardDays: boolean
): RiskLevel {
  // High risk conditions
  if (hasConsecutiveHardDays) return 'high'
  if (restDaysLost >= 2) return 'high'
  if (Math.abs(distanceChangePercent) > 20) return 'high'

  // Moderate risk conditions
  if (runsAffected > 2) return 'moderate'
  if (restDaysLost >= 1) return 'moderate'
  if (Math.abs(distanceChangePercent) > 10) return 'moderate'

  return 'low'
}

/**
 * Calculate what happens when a run is skipped
 */
export function calculateSkipEffect(
  plan: TrainingPlan,
  runId: string
): CascadePreview | null {
  const targetRun = plan.runs.find((r) => r.id === runId)
  if (!targetRun) return null

  const runDate = parseISO(targetRun.scheduledDate)
  const weekStart = startOfWeek(runDate, { weekStartsOn: 1 })

  // Calculate before/after distances
  const weekRuns = getWeekRuns(plan.runs, weekStart)
  const beforeDistance = calculateWeeklyDistance(weekRuns)
  const afterDistance = beforeDistance - targetRun.distanceKm
  const distanceChange = afterDistance - beforeDistance

  // Calculate rest days change (skipping adds a rest day)
  const beforeRestDays = countRestDays(plan.runs, weekStart)
  const recoveryDaysLost = 0 // Skipping actually adds a rest day

  const summary = generateSummary(
    targetRun,
    'skip',
    undefined,
    [],
    distanceChange,
    recoveryDaysLost
  )

  const distanceChangePercent =
    beforeDistance > 0 ? (distanceChange / beforeDistance) * 100 : 0

  const riskLevel = assessRisk(0, distanceChangePercent, recoveryDaysLost, false)

  const effect: CascadeEffect = {
    runsAffected: 0,
    weeklyDistanceChange: distanceChange,
    recoveryDaysLost,
    riskLevel,
    summary,
  }

  return {
    targetRun,
    action: 'skip',
    effect,
    affectedRuns: [],
    aiSuggestion: generateAISuggestion(effect, targetRun, 'skip'),
  }
}

/**
 * Calculate what happens when a run is moved to a new date
 */
export function calculateMoveEffect(
  plan: TrainingPlan,
  runId: string,
  newDate: string
): CascadePreview | null {
  const targetRun = plan.runs.find((r) => r.id === runId)
  if (!targetRun) return null

  const activeRuns = plan.runs.filter((r) => r.status !== 'skipped')

  // Find conflicts
  const conflicts = findConflicts(activeRuns, targetRun, newDate)

  // Build list of affected runs with their changes
  const affectedRuns: CascadePreview['affectedRuns'] = []

  for (const conflict of conflicts) {
    if (conflict.scheduledDate === newDate) {
      // Same-day conflict: the existing run needs to move
      // Try to find a new spot for it
      const alternateDate = findAlternateDate(activeRuns, conflict, targetRun, newDate)
      if (alternateDate) {
        affectedRuns.push({
          run: conflict,
          change: 'moved',
          newDate: alternateDate,
        })
      } else {
        // Can't find a good spot, suggest converting to recovery
        affectedRuns.push({
          run: conflict,
          change: 'type_changed',
          newType: 'recovery',
        })
      }
    } else {
      // Consecutive hard day conflict
      affectedRuns.push({
        run: conflict,
        change: 'type_changed',
        newType: 'recovery',
      })
    }
  }

  // Calculate distance changes
  const runDate = parseISO(targetRun.scheduledDate)
  const weekStart = startOfWeek(runDate, { weekStartsOn: 1 })
  const weekRuns = getWeekRuns(plan.runs, weekStart)
  const beforeDistance = calculateWeeklyDistance(weekRuns)

  // After moving, distance stays same (unless a run was removed)
  let afterDistance = beforeDistance
  for (const affected of affectedRuns) {
    if (affected.change === 'removed') {
      afterDistance -= affected.run.distanceKm
    }
  }
  const distanceChange = afterDistance - beforeDistance

  // Calculate rest days
  const beforeRestDays = countRestDays(plan.runs, weekStart)
  // Moving a run might reduce rest days if it goes to a rest day
  const newDateInWeek = parseISO(newDate)
  const isNewDateInSameWeek =
    !isBefore(newDateInWeek, weekStart) &&
    !isAfter(newDateInWeek, endOfWeek(weekStart, { weekStartsOn: 1 }))

  let recoveryDaysLost = 0
  if (isNewDateInSameWeek) {
    // Check if new date was a rest day
    const wasRestDay = !activeRuns.some(
      (r) => r.scheduledDate === newDate && r.id !== targetRun.id
    )
    if (wasRestDay) {
      recoveryDaysLost = 1
    }
  }

  // Check for consecutive hard days after the move
  const hasConsecutiveHardDays =
    isHardRun(targetRun) &&
    activeRuns.some(
      (r) =>
        r.id !== targetRun.id &&
        isHardRun(r) &&
        areConsecutive(newDate, r.scheduledDate)
    )

  const summary = generateSummary(
    targetRun,
    'move',
    newDate,
    conflicts,
    distanceChange,
    recoveryDaysLost
  )

  const distanceChangePercent =
    beforeDistance > 0 ? (distanceChange / beforeDistance) * 100 : 0

  const riskLevel = assessRisk(
    affectedRuns.length,
    distanceChangePercent,
    recoveryDaysLost,
    hasConsecutiveHardDays
  )

  const effect: CascadeEffect = {
    runsAffected: affectedRuns.length,
    weeklyDistanceChange: distanceChange,
    recoveryDaysLost,
    riskLevel,
    summary,
  }

  return {
    targetRun,
    action: 'move',
    newDate,
    effect,
    affectedRuns,
    aiSuggestion: generateAISuggestion(effect, targetRun, 'move'),
  }
}

/**
 * Find an alternate date for a conflicting run
 */
function findAlternateDate(
  runs: ScheduledRun[],
  conflictRun: ScheduledRun,
  targetRun: ScheduledRun,
  targetNewDate: string
): string | null {
  const runDate = parseISO(conflictRun.scheduledDate)
  const weekStart = startOfWeek(runDate, { weekStartsOn: 1 })

  // Try each day of the week
  for (let i = 0; i < 7; i++) {
    const candidateDate = format(addDays(weekStart, i), 'yyyy-MM-dd')

    // Skip the new target date
    if (candidateDate === targetNewDate) continue

    // Skip dates that already have runs
    const hasRun = runs.some(
      (r) =>
        r.scheduledDate === candidateDate &&
        r.id !== conflictRun.id &&
        r.id !== targetRun.id
    )
    if (hasRun) continue

    // Check hard run consecutive constraint
    if (isHardRun(conflictRun)) {
      const hasAdjacentHardRun = runs.some(
        (r) =>
          r.id !== conflictRun.id &&
          r.id !== targetRun.id &&
          isHardRun(r) &&
          areConsecutive(candidateDate, r.scheduledDate)
      )
      if (hasAdjacentHardRun) continue
    }

    // Try to keep long runs on weekends
    if (conflictRun.type === 'long') {
      const dayOfWeek = addDays(weekStart, i).getDay()
      if (WEEKEND_DAYS.includes(dayOfWeek)) {
        return candidateDate
      }
    } else {
      return candidateDate
    }
  }

  // If we couldn't find a weekend for a long run, try any valid day
  if (conflictRun.type === 'long') {
    for (let i = 0; i < 7; i++) {
      const candidateDate = format(addDays(weekStart, i), 'yyyy-MM-dd')
      if (candidateDate === targetNewDate) continue

      const hasRun = runs.some(
        (r) =>
          r.scheduledDate === candidateDate &&
          r.id !== conflictRun.id &&
          r.id !== targetRun.id
      )
      if (!hasRun) return candidateDate
    }
  }

  return null
}

/**
 * Generate a calm, non-judgmental AI suggestion
 */
function generateAISuggestion(
  effect: CascadeEffect,
  targetRun: ScheduledRun,
  action: 'skip' | 'move'
): string {
  const suggestions: string[] = []

  if (effect.riskLevel === 'low') {
    suggestions.push("This change fits well with your schedule.")
  } else if (effect.riskLevel === 'moderate') {
    suggestions.push("This works, though your week will be a bit tighter.")
  } else {
    suggestions.push("This is manageable, but consider taking it easy.")
  }

  if (action === 'skip' && targetRun.type === 'long') {
    suggestions.push("You could add distance to another run this week if you'd like.")
  }

  if (effect.recoveryDaysLost > 0) {
    suggestions.push("Listen to your body—extra rest next week is fine.")
  }

  // Always end with reassurance
  suggestions.push("Your goal date hasn't changed.")

  return suggestions.join(' ')
}

/**
 * Get valid drop dates for a run (for drag-and-drop UI)
 */
export function getValidDropDates(
  plan: TrainingPlan,
  runId: string,
  weekStart: Date
): string[] {
  const targetRun = plan.runs.find((r) => r.id === runId)
  if (!targetRun) return []

  const validDates: string[] = []

  for (let i = 0; i < 7; i++) {
    const candidateDate = format(addDays(weekStart, i), 'yyyy-MM-dd')

    // Skip current date
    if (candidateDate === targetRun.scheduledDate) continue

    // Check if date is available or has low-risk conflict
    const effect = calculateMoveEffect(plan, runId, candidateDate)
    if (effect && effect.effect.riskLevel !== 'high') {
      validDates.push(candidateDate)
    }
  }

  return validDates
}
