-- ============================================================
-- SQL Migration: Admin Analytics and Event Tracking Table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the analytics_events table
--    NOTE: course_id / exam_id are stored as TEXT (no FK constraint)
--    because courses/exams use bigint PKs while auth uses uuid.
--    We store them for reference only; joins are not used in the app.
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  VARCHAR(50) NOT NULL,
  page_path   TEXT        NOT NULL,
  visitor_id  TEXT        NOT NULL,
  course_id   TEXT,                          -- stores bigint id as text, no FK
  exam_id     TEXT,                          -- stores bigint id as text, no FK
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata    JSONB
);

-- 2. Create indexes for quick aggregation and charting
CREATE INDEX IF NOT EXISTS idx_analytics_events_type       ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_course_id  ON public.analytics_events(course_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_exam_id    ON public.analytics_events(exam_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON public.analytics_events(visitor_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Security Policies

-- Policy A: Anyone (anonymous or authenticated) can INSERT tracking records
CREATE POLICY "Allow anonymous and authenticated inserts"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy B: Only administrators can SELECT records
-- Uses the public.is_admin() helper defined in supabase_fix_admin_rls.sql
CREATE POLICY "Allow admins to read events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
