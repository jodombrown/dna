-- Enable required extensions for scheduling
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Schedule ADIN nightly health function to run daily at 03:00 UTC
select
  cron.schedule(
    'adin-nightly-health-daily',
    '0 3 * * *',
    $$
    select
      net.http_post(
          url:='https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/adin-nightly-health',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y"}'::jsonb,
          body:=jsonb_build_object('trigger', 'cron', 'invoked_at', now())
      ) as request_id;
    $$
  );