-- Add user profile fields for personalized training plans
-- Run this in your Supabase SQL editor after 001_initial_schema.sql

-- Add fitness profile fields to profiles table
alter table profiles add column if not exists height_cm integer;
alter table profiles add column if not exists weight_kg decimal(4,1);
alter table profiles add column if not exists longest_run_km decimal(4,1);
alter table profiles add column if not exists current_weekly_km decimal(4,1);
alter table profiles add column if not exists runs_per_week integer default 3;
alter table profiles add column if not exists onboarding_completed boolean default false;

-- Add profile fields to training_plans for plan-specific context
alter table training_plans add column if not exists starting_longest_run_km decimal(4,1);
alter table training_plans add column if not exists starting_weekly_km decimal(4,1);

comment on column profiles.height_cm is 'User height in centimeters';
comment on column profiles.weight_kg is 'User weight in kilograms';
comment on column profiles.longest_run_km is 'Longest single run distance ever completed';
comment on column profiles.current_weekly_km is 'Current average weekly running volume';
comment on column profiles.runs_per_week is 'Preferred number of runs per week (3 or 4)';
comment on column profiles.onboarding_completed is 'Whether user has completed initial setup';
