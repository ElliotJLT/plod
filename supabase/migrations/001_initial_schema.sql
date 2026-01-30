-- Plod Database Schema
-- Initial migration for training plans, routes, and feedback
-- Run this in your Supabase SQL editor

-- ============================================
-- ENUMS
-- ============================================

create type run_status as enum ('scheduled', 'completed', 'skipped', 'moved');
create type run_type as enum ('easy', 'long', 'recovery', 'moderate');
create type goal_race as enum ('half_marathon', '10k', '5k', 'custom');
create type effort_rating as enum ('easy', 'good', 'hard', 'struggle');
create type plan_status as enum ('active', 'completed', 'paused', 'abandoned');
create type adjustment_type as enum ('skip', 'move', 'swap');
create type risk_level as enum ('low', 'moderate', 'high');
create type lighting_score as enum ('well_lit', 'partial', 'unlit', 'unknown');
create type surface_type as enum ('paved', 'mixed', 'trail', 'unknown');
create type route_type as enum ('loop', 'out_and_back', 'point_to_point');
create type route_source as enum ('manual', 'generated', 'imported');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,

  -- Preferences
  preferred_run_days integer[] default array[1, 3, 6], -- Mon, Wed, Sat
  include_moderate_runs boolean default false,

  -- Strava integration
  strava_athlete_id text unique,
  strava_access_token text,
  strava_refresh_token text,
  strava_token_expires_at timestamptz,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- TRAINING PLANS
-- ============================================

create table training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,

  goal_race goal_race not null,
  goal_name text, -- for custom goals
  target_date date not null,
  start_date date not null,
  total_weeks integer not null,
  status plan_status default 'active' not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_training_plans_user on training_plans(user_id);
create index idx_training_plans_status on training_plans(status);

-- ============================================
-- SCHEDULED RUNS
-- ============================================

create table scheduled_runs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references training_plans(id) on delete cascade not null,

  original_date date not null,
  scheduled_date date not null,
  distance_km decimal(4,1) not null,
  run_type run_type not null,
  week_number integer not null,
  status run_status default 'scheduled' not null,

  moved_from date, -- original date if rescheduled
  strava_activity_id text,
  effort_rating effort_rating,
  notes text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_scheduled_runs_plan on scheduled_runs(plan_id);
create index idx_scheduled_runs_date on scheduled_runs(scheduled_date);
create index idx_scheduled_runs_status on scheduled_runs(status);
create index idx_scheduled_runs_strava on scheduled_runs(strava_activity_id);

-- ============================================
-- SCHEDULE ADJUSTMENTS (for pattern tracking)
-- ============================================

create table schedule_adjustments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references training_plans(id) on delete cascade not null,

  adjustment_type adjustment_type not null,
  affected_run_ids uuid[] not null,
  reason text,

  -- Cascade effect data
  runs_affected integer not null,
  weekly_distance_change decimal(4,1) not null,
  recovery_days_lost integer not null,
  risk_level risk_level not null,
  effect_summary text[] not null,

  llm_suggestion text,

  created_at timestamptz default now() not null
);

create index idx_adjustments_plan on schedule_adjustments(plan_id);
create index idx_adjustments_date on schedule_adjustments(created_at);

-- ============================================
-- ROUTES
-- ============================================

create table routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,

  name text not null,
  description text,
  distance_km decimal(5,2) not null,
  elevation_gain integer not null, -- meters
  elevation_loss integer not null,
  elevation_profile decimal[] not null, -- array of elevation samples

  -- Geometry stored as array of [lng, lat] pairs
  geometry jsonb not null,
  start_lat decimal(9,6) not null,
  start_lng decimal(9,6) not null,
  end_lat decimal(9,6) not null,
  end_lng decimal(9,6) not null,

  route_type route_type not null,
  lighting_score lighting_score default 'unknown' not null,
  surface surface_type default 'unknown' not null,

  is_favorite boolean default false not null,
  times_used integer default 0 not null,
  last_used_at timestamptz,
  source route_source default 'manual' not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_routes_user on routes(user_id);
create index idx_routes_favorite on routes(user_id, is_favorite);
create index idx_routes_distance on routes(distance_km);

-- ============================================
-- FEEDBACK
-- ============================================

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,

  scheduled_run_id uuid references scheduled_runs(id) on delete set null,
  strava_activity_id text,

  captured_at timestamptz not null,
  effort_rating effort_rating not null,

  text_note text,
  voice_note_url text,
  voice_note_duration integer, -- seconds
  voice_transcript text,
  transcript_edited boolean default false,

  -- Conditions at capture time
  conditions_temp decimal(4,1),
  conditions_weather text,
  conditions_aqi integer,
  conditions_time_of_day text,
  conditions_is_daylight boolean,

  sources text[] not null, -- array of: quick_rating, text_note, voice_note

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_feedback_user on feedback(user_id);
create index idx_feedback_run on feedback(scheduled_run_id);
create index idx_feedback_date on feedback(captured_at);
create index idx_feedback_strava on feedback(strava_activity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table training_plans enable row level security;
alter table scheduled_runs enable row level security;
alter table schedule_adjustments enable row level security;
alter table routes enable row level security;
alter table feedback enable row level security;

-- Profiles: users can only access their own
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Training plans: users can only access their own
create policy "Users can view own plans"
  on training_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on training_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on training_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete own plans"
  on training_plans for delete
  using (auth.uid() = user_id);

-- Scheduled runs: users can access runs from their plans
create policy "Users can view own scheduled runs"
  on scheduled_runs for select
  using (
    exists (
      select 1 from training_plans
      where training_plans.id = scheduled_runs.plan_id
      and training_plans.user_id = auth.uid()
    )
  );

create policy "Users can insert own scheduled runs"
  on scheduled_runs for insert
  with check (
    exists (
      select 1 from training_plans
      where training_plans.id = scheduled_runs.plan_id
      and training_plans.user_id = auth.uid()
    )
  );

create policy "Users can update own scheduled runs"
  on scheduled_runs for update
  using (
    exists (
      select 1 from training_plans
      where training_plans.id = scheduled_runs.plan_id
      and training_plans.user_id = auth.uid()
    )
  );

create policy "Users can delete own scheduled runs"
  on scheduled_runs for delete
  using (
    exists (
      select 1 from training_plans
      where training_plans.id = scheduled_runs.plan_id
      and training_plans.user_id = auth.uid()
    )
  );

-- Schedule adjustments: same as scheduled runs
create policy "Users can view own adjustments"
  on schedule_adjustments for select
  using (
    exists (
      select 1 from training_plans
      where training_plans.id = schedule_adjustments.plan_id
      and training_plans.user_id = auth.uid()
    )
  );

create policy "Users can insert own adjustments"
  on schedule_adjustments for insert
  with check (
    exists (
      select 1 from training_plans
      where training_plans.id = schedule_adjustments.plan_id
      and training_plans.user_id = auth.uid()
    )
  );

-- Routes: users can only access their own
create policy "Users can view own routes"
  on routes for select
  using (auth.uid() = user_id);

create policy "Users can insert own routes"
  on routes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own routes"
  on routes for update
  using (auth.uid() = user_id);

create policy "Users can delete own routes"
  on routes for delete
  using (auth.uid() = user_id);

-- Feedback: users can only access their own
create policy "Users can view own feedback"
  on feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert own feedback"
  on feedback for insert
  with check (auth.uid() = user_id);

create policy "Users can update own feedback"
  on feedback for update
  using (auth.uid() = user_id);

create policy "Users can delete own feedback"
  on feedback for delete
  using (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

create trigger update_training_plans_updated_at
  before update on training_plans
  for each row execute procedure update_updated_at();

create trigger update_scheduled_runs_updated_at
  before update on scheduled_runs
  for each row execute procedure update_updated_at();

create trigger update_routes_updated_at
  before update on routes
  for each row execute procedure update_updated_at();

create trigger update_feedback_updated_at
  before update on feedback
  for each row execute procedure update_updated_at();

-- ============================================
-- STORAGE BUCKET FOR VOICE NOTES
-- ============================================

-- Run this separately in Supabase dashboard or via API:
-- insert into storage.buckets (id, name, public) values ('voice-notes', 'voice-notes', false);

-- Storage policy (add via dashboard):
-- Allow users to upload to their own folder: user_id/filename
-- Allow users to read their own files
