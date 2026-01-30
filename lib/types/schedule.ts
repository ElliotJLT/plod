/**
 * Schedule Types
 *
 * Core types for training plans, scheduled runs, and cascade effects.
 * These types support the accountability system without pace/speed metrics.
 */

export type RunStatus = 'scheduled' | 'completed' | 'skipped' | 'moved'

export type RunType = 'easy' | 'long' | 'recovery' | 'moderate'

export type GoalRace = 'half_marathon' | '10k' | '5k' | 'custom'

export type EffortRating = 'easy' | 'good' | 'hard' | 'struggle'

export type RiskLevel = 'low' | 'moderate' | 'high'

/**
 * A single scheduled run in the training plan
 */
export interface ScheduledRun {
  id: string
  planId: string

  /** When this run was originally planned */
  originalDate: string // ISO date YYYY-MM-DD

  /** Current scheduled date (may differ if moved) */
  scheduledDate: string // ISO date YYYY-MM-DD

  /** Distance in kilometers */
  distanceKm: number

  /** Type of run - no tempo/interval, just effort levels */
  type: RunType

  /** Which week of training (1-indexed) */
  weekNumber: number

  /** Current status */
  status: RunStatus

  /** If moved, the date it was moved from */
  movedFrom?: string

  /** Link to Strava activity if completed */
  stravaActivityId?: string

  /** User's effort rating after completion */
  effortRating?: EffortRating

  /** Optional notes from the user */
  notes?: string

  createdAt: string
  updatedAt: string
}

/**
 * A complete training plan leading to a goal
 */
export interface TrainingPlan {
  id: string
  userId: string

  /** The goal race type */
  goalRace: GoalRace

  /** Custom goal name if goalRace is 'custom' */
  goalName?: string

  /** Target race/goal date */
  targetDate: string // ISO date

  /** When training started */
  startDate: string // ISO date

  /** Total weeks in the plan */
  totalWeeks: number

  /** Plan status */
  status: 'active' | 'completed' | 'paused' | 'abandoned'

  /** All scheduled runs in this plan */
  runs: ScheduledRun[]

  /** History of schedule adjustments */
  adjustments: ScheduleAdjustment[]

  createdAt: string
  updatedAt: string
}

/**
 * Record of a schedule adjustment (for pattern tracking)
 */
export interface ScheduleAdjustment {
  id: string
  planId: string

  /** When the adjustment was made */
  timestamp: string

  /** Type of adjustment */
  type: 'skip' | 'move' | 'swap'

  /** IDs of runs affected by this adjustment */
  affectedRunIds: string[]

  /** Optional reason from user */
  reason?: string

  /** The cascade effect this adjustment had */
  cascadeEffect: CascadeEffect

  /** LLM-generated suggestion shown to user */
  llmSuggestion?: string
}

/**
 * The ripple effect of moving/skipping a run
 */
export interface CascadeEffect {
  /** Number of runs that shift as a result */
  runsAffected: number

  /** Change in weekly distance (positive = more, negative = less) */
  weeklyDistanceChange: number

  /** Recovery/rest days lost this week */
  recoveryDaysLost: number

  /** Overall risk assessment */
  riskLevel: RiskLevel

  /** Human-readable summary of changes */
  summary: string[]
}

/**
 * A single day view for the schedule calendar
 */
export interface ScheduleDay {
  date: string // ISO date
  dayOfWeek: number // 0-6, Sunday-Saturday

  /** Run scheduled for this day (if any) */
  run?: ScheduledRun

  /** Is this a designated rest day? */
  isRestDay: boolean

  /** Is this day in the past? */
  isPast: boolean

  /** Is this today? */
  isToday: boolean
}

/**
 * A week view for the schedule
 */
export interface ScheduleWeek {
  weekNumber: number
  startDate: string
  endDate: string
  days: ScheduleDay[]

  /** Total planned distance for the week */
  plannedDistanceKm: number

  /** Completed distance so far */
  completedDistanceKm: number

  /** Number of runs planned */
  plannedRuns: number

  /** Number of runs completed */
  completedRuns: number
}

/**
 * Summary stats for the current plan
 */
export interface PlanProgress {
  /** Current week number */
  currentWeek: number

  /** Total weeks in plan */
  totalWeeks: number

  /** Days until goal date */
  daysUntilGoal: number

  /** Total runs completed */
  runsCompleted: number

  /** Total runs in plan */
  totalRuns: number

  /** Total distance completed (km) */
  distanceCompleted: number

  /** Total distance planned (km) */
  distancePlanned: number

  /** Runs skipped/missed */
  runsSkipped: number

  /** Runs moved to different days */
  runsMoved: number
}

/**
 * Input for creating a new training plan
 */
export interface CreatePlanInput {
  goalRace: GoalRace
  goalName?: string
  targetDate: string

  /** Preferred run days (0-6, Sunday-Saturday) */
  preferredDays: number[]

  /** Starting weekly distance (km) */
  startingWeeklyKm?: number

  /** Include moderate effort runs? (default: false) */
  includeModerateRuns?: boolean
}

/**
 * Preview of what happens when moving/skipping a run
 */
export interface CascadePreview {
  /** The run being moved/skipped */
  targetRun: ScheduledRun

  /** Action being previewed */
  action: 'skip' | 'move'

  /** New date if moving */
  newDate?: string

  /** The calculated cascade effect */
  effect: CascadeEffect

  /** Runs that will change */
  affectedRuns: Array<{
    run: ScheduledRun
    change: 'moved' | 'type_changed' | 'removed'
    newDate?: string
    newType?: RunType
  }>

  /** LLM-generated reassurance/suggestion */
  aiSuggestion: string
}
