/**
 * Supabase Database Types
 *
 * These types match the schema in supabase/migrations/001_initial_schema.sql
 * Ideally, regenerate these using `supabase gen types typescript`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          preferred_run_days: number[] | null
          include_moderate_runs: boolean
          strava_athlete_id: string | null
          strava_access_token: string | null
          strava_refresh_token: string | null
          strava_token_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          preferred_run_days?: number[] | null
          include_moderate_runs?: boolean
          strava_athlete_id?: string | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          strava_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          preferred_run_days?: number[] | null
          include_moderate_runs?: boolean
          strava_athlete_id?: string | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          strava_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      training_plans: {
        Row: {
          id: string
          user_id: string
          goal_race: 'half_marathon' | '10k' | '5k' | 'custom'
          goal_name: string | null
          target_date: string
          start_date: string
          total_weeks: number
          status: 'active' | 'completed' | 'paused' | 'abandoned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_race: 'half_marathon' | '10k' | '5k' | 'custom'
          goal_name?: string | null
          target_date: string
          start_date: string
          total_weeks: number
          status?: 'active' | 'completed' | 'paused' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_race?: 'half_marathon' | '10k' | '5k' | 'custom'
          goal_name?: string | null
          target_date?: string
          start_date?: string
          total_weeks?: number
          status?: 'active' | 'completed' | 'paused' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_runs: {
        Row: {
          id: string
          plan_id: string
          original_date: string
          scheduled_date: string
          distance_km: number
          run_type: 'easy' | 'long' | 'recovery' | 'moderate'
          week_number: number
          status: 'scheduled' | 'completed' | 'skipped' | 'moved'
          moved_from: string | null
          strava_activity_id: string | null
          effort_rating: 'easy' | 'good' | 'hard' | 'struggle' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          original_date: string
          scheduled_date: string
          distance_km: number
          run_type: 'easy' | 'long' | 'recovery' | 'moderate'
          week_number: number
          status?: 'scheduled' | 'completed' | 'skipped' | 'moved'
          moved_from?: string | null
          strava_activity_id?: string | null
          effort_rating?: 'easy' | 'good' | 'hard' | 'struggle' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          original_date?: string
          scheduled_date?: string
          distance_km?: number
          run_type?: 'easy' | 'long' | 'recovery' | 'moderate'
          week_number?: number
          status?: 'scheduled' | 'completed' | 'skipped' | 'moved'
          moved_from?: string | null
          strava_activity_id?: string | null
          effort_rating?: 'easy' | 'good' | 'hard' | 'struggle' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedule_adjustments: {
        Row: {
          id: string
          plan_id: string
          adjustment_type: 'skip' | 'move' | 'swap'
          affected_run_ids: string[]
          reason: string | null
          runs_affected: number
          weekly_distance_change: number
          recovery_days_lost: number
          risk_level: 'low' | 'moderate' | 'high'
          effect_summary: string[]
          llm_suggestion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          adjustment_type: 'skip' | 'move' | 'swap'
          affected_run_ids: string[]
          reason?: string | null
          runs_affected: number
          weekly_distance_change: number
          recovery_days_lost: number
          risk_level: 'low' | 'moderate' | 'high'
          effect_summary: string[]
          llm_suggestion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          adjustment_type?: 'skip' | 'move' | 'swap'
          affected_run_ids?: string[]
          reason?: string | null
          runs_affected?: number
          weekly_distance_change?: number
          recovery_days_lost?: number
          risk_level?: 'low' | 'moderate' | 'high'
          effect_summary?: string[]
          llm_suggestion?: string | null
          created_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          distance_km: number
          elevation_gain: number
          elevation_loss: number
          elevation_profile: number[]
          geometry: Json
          start_lat: number
          start_lng: number
          end_lat: number
          end_lng: number
          route_type: 'loop' | 'out_and_back' | 'point_to_point'
          lighting_score: 'well_lit' | 'partial' | 'unlit' | 'unknown'
          surface: 'paved' | 'mixed' | 'trail' | 'unknown'
          is_favorite: boolean
          times_used: number
          last_used_at: string | null
          source: 'manual' | 'generated' | 'imported'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          distance_km: number
          elevation_gain: number
          elevation_loss: number
          elevation_profile: number[]
          geometry: Json
          start_lat: number
          start_lng: number
          end_lat: number
          end_lng: number
          route_type: 'loop' | 'out_and_back' | 'point_to_point'
          lighting_score?: 'well_lit' | 'partial' | 'unlit' | 'unknown'
          surface?: 'paved' | 'mixed' | 'trail' | 'unknown'
          is_favorite?: boolean
          times_used?: number
          last_used_at?: string | null
          source?: 'manual' | 'generated' | 'imported'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          distance_km?: number
          elevation_gain?: number
          elevation_loss?: number
          elevation_profile?: number[]
          geometry?: Json
          start_lat?: number
          start_lng?: number
          end_lat?: number
          end_lng?: number
          route_type?: 'loop' | 'out_and_back' | 'point_to_point'
          lighting_score?: 'well_lit' | 'partial' | 'unlit' | 'unknown'
          surface?: 'paved' | 'mixed' | 'trail' | 'unknown'
          is_favorite?: boolean
          times_used?: number
          last_used_at?: string | null
          source?: 'manual' | 'generated' | 'imported'
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          scheduled_run_id: string | null
          strava_activity_id: string | null
          captured_at: string
          effort_rating: 'easy' | 'good' | 'hard' | 'struggle'
          text_note: string | null
          voice_note_url: string | null
          voice_note_duration: number | null
          voice_transcript: string | null
          transcript_edited: boolean
          conditions_temp: number | null
          conditions_weather: string | null
          conditions_aqi: number | null
          conditions_time_of_day: string | null
          conditions_is_daylight: boolean | null
          sources: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_run_id?: string | null
          strava_activity_id?: string | null
          captured_at: string
          effort_rating: 'easy' | 'good' | 'hard' | 'struggle'
          text_note?: string | null
          voice_note_url?: string | null
          voice_note_duration?: number | null
          voice_transcript?: string | null
          transcript_edited?: boolean
          conditions_temp?: number | null
          conditions_weather?: string | null
          conditions_aqi?: number | null
          conditions_time_of_day?: string | null
          conditions_is_daylight?: boolean | null
          sources: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_run_id?: string | null
          strava_activity_id?: string | null
          captured_at?: string
          effort_rating?: 'easy' | 'good' | 'hard' | 'struggle'
          text_note?: string | null
          voice_note_url?: string | null
          voice_note_duration?: number | null
          voice_transcript?: string | null
          transcript_edited?: boolean
          conditions_temp?: number | null
          conditions_weather?: string | null
          conditions_aqi?: number | null
          conditions_time_of_day?: string | null
          conditions_is_daylight?: boolean | null
          sources?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      run_status: 'scheduled' | 'completed' | 'skipped' | 'moved'
      run_type: 'easy' | 'long' | 'recovery' | 'moderate'
      goal_race: 'half_marathon' | '10k' | '5k' | 'custom'
      effort_rating: 'easy' | 'good' | 'hard' | 'struggle'
      plan_status: 'active' | 'completed' | 'paused' | 'abandoned'
      adjustment_type: 'skip' | 'move' | 'swap'
      risk_level: 'low' | 'moderate' | 'high'
      lighting_score: 'well_lit' | 'partial' | 'unlit' | 'unknown'
      surface_type: 'paved' | 'mixed' | 'trail' | 'unknown'
      route_type: 'loop' | 'out_and_back' | 'point_to_point'
      route_source: 'manual' | 'generated' | 'imported'
    }
  }
}
