/**
 * Training Plan Generator
 *
 * Creates personalized half marathon training plans based on:
 * - User's current fitness level (longest run, weekly volume)
 * - Preferred runs per week (3 or 4)
 * - Target race date
 *
 * Follows 80/20 polarized training principles:
 * - 80% of runs at easy effort
 * - 20% optional moderate effort
 * - Progressive long run building to 16-18km
 * - Deload weeks every 4th week
 * - 2-week taper before race
 */

import { addDays, format, startOfWeek, differenceInWeeks } from 'date-fns'

export interface PlanInput {
  longestRunKm: number
  currentWeeklyKm: number
  runsPerWeek: 3 | 4
  targetDate: string // YYYY-MM-DD
  includeModerateRuns?: boolean
}

export interface GeneratedRun {
  originalDate: string
  scheduledDate: string
  distanceKm: number
  type: 'easy' | 'long' | 'recovery' | 'moderate'
  weekNumber: number
}

export interface GeneratedPlan {
  startDate: string
  targetDate: string
  totalWeeks: number
  runs: GeneratedRun[]
  warnings: string[]
}

/**
 * Calculate the starting long run distance
 * Start at 70-80% of their current longest run
 */
function calculateStartingLongRun(longestRunKm: number): number {
  const starting = Math.round(longestRunKm * 0.75 * 2) / 2 // Round to nearest 0.5
  return Math.max(5, Math.min(starting, 10)) // Clamp between 5-10km
}

/**
 * Calculate starting weekly volume
 * Start at or slightly below current weekly volume
 */
function calculateStartingWeeklyVolume(currentWeeklyKm: number): number {
  const starting = Math.round(currentWeeklyKm * 0.9 * 2) / 2
  return Math.max(12, Math.min(starting, 25)) // Clamp between 12-25km
}

/**
 * Generate a week's runs based on phase and targets
 */
function generateWeekRuns(
  weekNumber: number,
  weekStart: Date,
  targetLongRun: number,
  targetWeeklyVolume: number,
  runsPerWeek: 3 | 4,
  isDeloadWeek: boolean,
  isTaperWeek: boolean,
  includeModerate: boolean
): GeneratedRun[] {
  const runs: GeneratedRun[] = []

  // Adjust targets for deload/taper
  let longRun = targetLongRun
  let weeklyVolume = targetWeeklyVolume

  if (isDeloadWeek) {
    longRun = Math.round(targetLongRun * 0.75 * 2) / 2
    weeklyVolume = Math.round(targetWeeklyVolume * 0.8 * 2) / 2
  } else if (isTaperWeek) {
    longRun = Math.round(targetLongRun * 0.6 * 2) / 2
    weeklyVolume = Math.round(targetWeeklyVolume * 0.6 * 2) / 2
  }

  // Calculate remaining volume for other runs
  const remainingVolume = weeklyVolume - longRun
  const otherRuns = runsPerWeek - 1
  const avgOtherRun = Math.round((remainingVolume / otherRuns) * 2) / 2

  // Determine run days (Monday = 0 offset from weekStart)
  // 3 runs: Tue (1), Thu (3), Sat (5) - long run
  // 4 runs: Mon (0), Wed (2), Fri (4), Sun (6) - long run
  const runDays = runsPerWeek === 3
    ? [1, 3, 5] // Tue, Thu, Sat
    : [0, 2, 4, 6] // Mon, Wed, Fri, Sun

  const longRunDayIndex = runDays.length - 1 // Last run is long run

  runDays.forEach((dayOffset, index) => {
    const runDate = addDays(weekStart, dayOffset)
    const dateStr = format(runDate, 'yyyy-MM-dd')

    const isLongRun = index === longRunDayIndex

    // Determine type and distance
    let type: GeneratedRun['type']
    let distance: number

    if (isLongRun) {
      type = 'long'
      distance = longRun
    } else if (index === 0 && runsPerWeek === 4 && !isDeloadWeek && !isTaperWeek) {
      // First run of 4-run week could be recovery
      type = 'recovery'
      distance = Math.max(3, avgOtherRun - 1)
    } else if (includeModerate && index === 1 && !isDeloadWeek && !isTaperWeek) {
      // Optional moderate run mid-week
      type = 'moderate'
      distance = avgOtherRun
    } else {
      type = 'easy'
      distance = avgOtherRun
    }

    runs.push({
      originalDate: dateStr,
      scheduledDate: dateStr,
      distanceKm: Math.max(3, Math.round(distance * 2) / 2),
      type,
      weekNumber,
    })
  })

  return runs
}

/**
 * Generate a complete training plan
 */
export function generatePlan(input: PlanInput): GeneratedPlan {
  const warnings: string[] = []

  const targetDate = new Date(input.targetDate)
  const today = new Date()
  const weeksUntilRace = differenceInWeeks(targetDate, today)

  // Validate timeline
  if (weeksUntilRace < 8) {
    warnings.push('Less than 8 weeks to race. Plan will be compressed.')
  }
  if (weeksUntilRace > 20) {
    warnings.push('More than 20 weeks to race. Consider starting closer to race date.')
  }

  // Calculate plan length (ideally 12 weeks, but adapt to timeline)
  const totalWeeks = Math.max(8, Math.min(weeksUntilRace, 16))

  // Calculate start date (work backwards from race)
  const startDate = startOfWeek(addDays(targetDate, -(totalWeeks * 7)), {
    weekStartsOn: 1,
  })

  // Calculate starting points based on user's fitness
  const startingLongRun = calculateStartingLongRun(input.longestRunKm)
  const startingWeeklyVolume = calculateStartingWeeklyVolume(input.currentWeeklyKm)

  // Define phase targets
  // Phase 1: Base (weeks 1-4) - build from starting point
  // Phase 2: Development (weeks 5-8) - increase to 35-40km/week
  // Phase 3: Peak (weeks 9-10) - maintain or slight increase
  // Phase 4: Taper (final 2 weeks) - reduce volume

  const peakLongRun = 16 // km
  const peakWeeklyVolume = 40 // km

  const runs: GeneratedRun[] = []

  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = addDays(startDate, (week - 1) * 7)

    // Determine phase
    const taperWeeks = 2
    const weeksFromEnd = totalWeeks - week
    const isTaperWeek = weeksFromEnd < taperWeeks
    const isDeloadWeek = !isTaperWeek && week % 4 === 0

    // Calculate progression
    let targetLongRun: number
    let targetWeeklyVolume: number

    if (isTaperWeek) {
      // Taper: reduce from peak
      const taperProgress = (taperWeeks - weeksFromEnd) / taperWeeks
      targetLongRun = peakLongRun * (0.75 - taperProgress * 0.25)
      targetWeeklyVolume = peakWeeklyVolume * (0.7 - taperProgress * 0.2)
    } else {
      // Progressive build
      const buildWeeks = totalWeeks - taperWeeks
      const progress = Math.min(1, (week - 1) / (buildWeeks - 1))

      targetLongRun = startingLongRun + (peakLongRun - startingLongRun) * progress
      targetWeeklyVolume =
        startingWeeklyVolume + (peakWeeklyVolume - startingWeeklyVolume) * progress
    }

    const weekRuns = generateWeekRuns(
      week,
      weekStart,
      targetLongRun,
      targetWeeklyVolume,
      input.runsPerWeek,
      isDeloadWeek,
      isTaperWeek,
      input.includeModerateRuns ?? false
    )

    runs.push(...weekRuns)
  }

  // Validate prerequisites
  if (input.longestRunKm < 5) {
    warnings.push(
      'Your longest run is under 5km. Consider building a base before starting a half marathon plan.'
    )
  }
  if (input.currentWeeklyKm < 10) {
    warnings.push(
      'Your weekly volume is under 10km. The plan will start conservatively.'
    )
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    targetDate: input.targetDate,
    totalWeeks,
    runs,
    warnings,
  }
}

/**
 * Get a summary of what the plan looks like
 */
export function getPlanSummary(plan: GeneratedPlan): {
  weeks: number
  totalRuns: number
  totalDistanceKm: number
  peakWeekKm: number
  longestRunKm: number
} {
  const weeklyVolumes = new Map<number, number>()
  let longestRun = 0

  for (const run of plan.runs) {
    const current = weeklyVolumes.get(run.weekNumber) || 0
    weeklyVolumes.set(run.weekNumber, current + run.distanceKm)
    longestRun = Math.max(longestRun, run.distanceKm)
  }

  const peakWeekKm = Math.max(...Array.from(weeklyVolumes.values()))
  const totalDistanceKm = plan.runs.reduce((sum, r) => sum + r.distanceKm, 0)

  return {
    weeks: plan.totalWeeks,
    totalRuns: plan.runs.length,
    totalDistanceKm: Math.round(totalDistanceKm),
    peakWeekKm: Math.round(peakWeekKm),
    longestRunKm: longestRun,
  }
}
