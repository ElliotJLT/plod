/**
 * Feedback Types
 *
 * Types for post-run feedback capture, including voice notes.
 */

import type { EffortRating } from './schedule'

export type FeedbackSource = 'quick_rating' | 'text_note' | 'voice_note'

/**
 * Post-run feedback entry
 */
export interface RunFeedback {
  id: string
  userId: string

  /** Link to the scheduled run (if from a plan) */
  scheduledRunId?: string

  /** Link to Strava activity (if synced) */
  stravaActivityId?: string

  /** When feedback was captured */
  capturedAt: string

  /** Quick effort rating (always captured first) */
  effortRating: EffortRating

  /** Optional text note */
  textNote?: string

  /** Voice note URL in storage */
  voiceNoteUrl?: string

  /** Voice note duration in seconds */
  voiceNoteDuration?: number

  /** AI-transcribed text from voice note */
  voiceTranscript?: string

  /** Was transcription reviewed/edited by user? */
  transcriptEdited?: boolean

  /** Auto-captured conditions at time of feedback */
  conditions?: FeedbackConditions

  /** How the feedback was captured */
  sources: FeedbackSource[]

  createdAt: string
  updatedAt: string
}

/**
 * Auto-captured conditions when feedback is submitted
 */
export interface FeedbackConditions {
  /** Temperature at feedback time */
  temperature?: number

  /** Weather description */
  weather?: string

  /** Air quality index */
  aqi?: number

  /** Time of day */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'

  /** Was it daylight? */
  isDaylight: boolean
}

/**
 * Input for quick feedback capture
 */
export interface QuickFeedbackInput {
  /** The scheduled run this feedback is for */
  scheduledRunId?: string

  /** Strava activity ID if synced */
  stravaActivityId?: string

  /** The effort rating */
  effortRating: EffortRating
}

/**
 * Input for adding a text note to feedback
 */
export interface TextNoteInput {
  /** Existing feedback ID to add note to */
  feedbackId: string

  /** The text note content */
  text: string
}

/**
 * Input for voice note upload
 */
export interface VoiceNoteInput {
  /** Existing feedback ID to add voice to */
  feedbackId: string

  /** Audio blob to upload */
  audioBlob: Blob

  /** Audio duration in seconds */
  duration: number

  /** Audio MIME type */
  mimeType: string
}

/**
 * Voice recording state for the UI
 */
export interface VoiceRecordingState {
  /** Is currently recording? */
  isRecording: boolean

  /** Recording duration so far (seconds) */
  duration: number

  /** Is processing/uploading? */
  isProcessing: boolean

  /** Error message if failed */
  error?: string

  /** Audio levels for visualization (0-1) */
  audioLevel: number
}

/**
 * Feedback prompt shown to user
 */
export interface FeedbackPrompt {
  /** What triggered this prompt */
  trigger: 'strava_sync' | 'manual_log' | 'scheduled_completed'

  /** The run this feedback is for */
  runInfo: {
    date: string
    distanceKm: number
    durationMinutes?: number
    type?: string
  }

  /** Pre-filled conditions */
  conditions?: FeedbackConditions

  /** Has user already given feedback for this run? */
  existingFeedbackId?: string
}

/**
 * Feedback summary for a time period
 */
export interface FeedbackSummary {
  /** Period covered */
  periodStart: string
  periodEnd: string

  /** Total feedback entries */
  totalEntries: number

  /** Breakdown by effort rating */
  effortBreakdown: {
    easy: number
    good: number
    hard: number
    struggle: number
  }

  /** Percentage with text notes */
  withTextNotes: number

  /** Percentage with voice notes */
  withVoiceNotes: number

  /** Common themes from notes (AI-extracted) */
  commonThemes?: string[]
}

/**
 * Feedback pattern detected by AI
 */
export interface FeedbackPattern {
  /** Type of pattern */
  type: 'day_preference' | 'effort_trend' | 'condition_correlation' | 'distance_correlation'

  /** Pattern description */
  description: string

  /** Confidence level (0-1) */
  confidence: number

  /** Suggested action based on pattern */
  suggestion?: string

  /** Data points supporting this pattern */
  evidence: {
    feedbackIds: string[]
    summary: string
  }
}

/**
 * Effort rating with metadata for display
 */
export const EFFORT_RATINGS: Record<EffortRating, {
  label: string
  emoji: string
  description: string
  color: string
}> = {
  easy: {
    label: 'Easy',
    emoji: '',
    description: 'Felt effortless',
    color: 'text-green-400'
  },
  good: {
    label: 'Good',
    emoji: '',
    description: 'Comfortable effort',
    color: 'text-accent'
  },
  hard: {
    label: 'Hard',
    emoji: '',
    description: 'Challenging but manageable',
    color: 'text-yellow-400'
  },
  struggle: {
    label: 'Struggle',
    emoji: '',
    description: 'Really tough today',
    color: 'text-orange-400'
  }
}
