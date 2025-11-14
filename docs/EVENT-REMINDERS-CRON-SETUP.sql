-- ============================================
-- EVENT REMINDERS CRON JOB SETUP
-- ============================================
-- 
-- IMPORTANT: This SQL contains project-specific credentials.
-- DO NOT run this as a migration (it would expose credentials).
-- 
-- Setup Instructions:
-- 1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok/sql/new
-- 2. Copy and paste this entire file
-- 3. Execute the SQL to create the cron job
-- 
-- ============================================

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule existing job if it exists (to avoid duplicates)
SELECT cron.unschedule('daily-event-reminders');

-- Schedule send-event-reminders to run daily at 9:00 AM UTC
-- This checks for events starting in 24-26 hours and sends reminders
SELECT cron.schedule(
  'daily-event-reminders',
  '0 9 * * *',  -- Every day at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/send-event-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- View all scheduled cron jobs
SELECT * FROM cron.job;

-- View recent cron job executions
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- ============================================
-- MANUAL TESTING
-- ============================================

-- To manually trigger the function for testing:
-- curl -X POST 'https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/send-event-reminders' \
--   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y" \
--   -H "Content-Type: application/json"

-- ============================================
-- DISABLE REMINDERS (FEATURE FLAG)
-- ============================================

-- To temporarily disable reminders without deleting the cron job:
-- Set ENABLE_EVENT_REMINDERS=false in your edge function secrets

-- To re-enable:
-- Set ENABLE_EVENT_REMINDERS=true or remove the secret

-- ============================================
-- UNSCHEDULE JOB (IF NEEDED)
-- ============================================

-- To completely remove the cron job:
-- SELECT cron.unschedule('daily-event-reminders');
