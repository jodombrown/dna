# Event Reminders System - Setup & Monitoring

## Overview

The automated event reminder system sends in-app notifications to event attendees 24 hours before their events start. The system is built with idempotency, logging, and monitoring to ensure reliable delivery without duplicates.

## Features

✅ **Automated Reminders** - Cron job runs daily at 9 AM UTC
✅ **Idempotency** - No duplicate reminders per user/event
✅ **Feature Flag** - Can be disabled without code changes
✅ **Comprehensive Logging** - Tracks every job execution and reminder sent
✅ **Admin Monitoring** - Real-time dashboard for system health
✅ **Error Handling** - Graceful failures with detailed error logs

## Architecture

### Database Tables

1. **`event_reminder_logs`** - Tracks every reminder sent
   - Ensures idempotency via unique constraint on (event_id, user_id, reminder_type)
   - Links to notification for full traceability
   - Indexed for performance

2. **`cron_job_logs`** - Tracks every job execution
   - Records start time, completion time, status
   - Stores metrics: events_processed, reminders_sent
   - Captures errors for debugging

### Edge Function: `send-event-reminders`

**Schedule**: Daily at 9:00 AM UTC (via pg_cron)

**Logic**:
1. Fetch events starting in 24-26 hours
2. For each event, get attendees with status='going'
3. Check `event_reminder_logs` to skip already-reminded users
4. Create notifications for new users
5. Log each reminder in `event_reminder_logs`
6. Log job execution in `cron_job_logs`

**Idempotency**: Unique constraint prevents duplicate reminders even if job runs multiple times

**Feature Flag**: Set `ENABLE_EVENT_REMINDERS=false` in Supabase secrets to disable

## Setup Instructions

### 1. Database Tables (Already Created)

Tables created via migration:
- `event_reminder_logs`
- `cron_job_logs`

### 2. Deploy Edge Function (Already Deployed)

The `send-event-reminders` function is already deployed and configured in `supabase/config.toml`:

```toml
[functions.send-event-reminders]
verify_jwt = false
```

### 3. Create Cron Job ⚠️ **ACTION REQUIRED**

**IMPORTANT**: This step requires manual execution in Supabase SQL Editor.

1. Go to: https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok/sql/new

2. Copy the entire contents of `docs/EVENT-REMINDERS-CRON-SETUP.sql`

3. Execute the SQL to create the cron job

4. Verify with:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'daily-event-reminders';
   ```

### 4. Access Admin Monitor (Already Built)

The `EventReminderMonitor` component provides real-time monitoring:
- Last run status and time
- Reminders sent in last run and last 24 hours
- History of last 20 job executions
- Error tracking

**To use**: Import and render the component in an admin-only page:

```tsx
import { EventReminderMonitor } from "@/components/admin/EventReminderMonitor";

// In your admin dashboard
<EventReminderMonitor />
```

## Monitoring & Debugging

### View Cron Job Status

```sql
-- Check if job is scheduled
SELECT * FROM cron.job WHERE jobname = 'daily-event-reminders';

-- View recent executions
SELECT * FROM cron.job_run_details 
WHERE jobname = 'daily-event-reminders'
ORDER BY start_time DESC 
LIMIT 10;
```

### View Job Logs

```sql
-- Recent job runs
SELECT * FROM cron_job_logs
WHERE job_name = 'send-event-reminders'
ORDER BY started_at DESC
LIMIT 10;

-- Failed jobs
SELECT * FROM cron_job_logs
WHERE job_name = 'send-event-reminders'
AND status = 'error'
ORDER BY started_at DESC;
```

### View Reminder Logs

```sql
-- Reminders sent today
SELECT COUNT(*) FROM event_reminder_logs
WHERE sent_at >= CURRENT_DATE;

-- Reminders by event
SELECT 
  e.title,
  COUNT(erl.id) as reminders_sent,
  MIN(erl.sent_at) as first_sent,
  MAX(erl.sent_at) as last_sent
FROM event_reminder_logs erl
JOIN events e ON e.id = erl.event_id
GROUP BY e.id, e.title
ORDER BY reminders_sent DESC;
```

### Manual Testing

Trigger the function manually:

```bash
curl -X POST 'https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/send-event-reminders' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y" \
  -H "Content-Type: application/json"
```

## Feature Flag Control

### Disable Reminders

To temporarily disable without deleting the cron job:

1. Go to Supabase Project Settings > Edge Functions > Secrets
2. Add secret: `ENABLE_EVENT_REMINDERS` = `false`
3. Redeploy the edge function

The cron job will still run but will exit early.

### Re-enable Reminders

1. Remove the `ENABLE_EVENT_REMINDERS` secret, or
2. Set it to `true`
3. Redeploy the edge function

## Troubleshooting

### No reminders being sent

1. Check cron job is scheduled:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'daily-event-reminders';
   ```

2. Check recent job executions:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobname = 'daily-event-reminders'
   ORDER BY start_time DESC LIMIT 5;
   ```

3. Check job logs for errors:
   ```sql
   SELECT * FROM cron_job_logs 
   WHERE job_name = 'send-event-reminders'
   ORDER BY started_at DESC LIMIT 5;
   ```

4. Verify events exist in reminder window:
   ```sql
   SELECT * FROM events
   WHERE start_time >= NOW() + INTERVAL '24 hours'
   AND start_time <= NOW() + INTERVAL '26 hours'
   AND is_cancelled = false;
   ```

### Duplicate reminders

This should not happen due to unique constraint, but if it does:

1. Check `event_reminder_logs` for duplicates:
   ```sql
   SELECT event_id, user_id, reminder_type, COUNT(*) 
   FROM event_reminder_logs
   GROUP BY event_id, user_id, reminder_type
   HAVING COUNT(*) > 1;
   ```

2. The unique constraint should prevent this at database level

### Job failing with errors

1. Check error message in `cron_job_logs`:
   ```sql
   SELECT error_message, metadata FROM cron_job_logs
   WHERE status = 'error'
   ORDER BY started_at DESC LIMIT 1;
   ```

2. Check edge function logs in Supabase dashboard

3. Verify edge function is deployed correctly

## Performance Considerations

- **Indexing**: All tables are indexed on frequently queried columns
- **RLS Policies**: Optimized to minimize query overhead
- **Batch Size**: Processes all eligible events in one run (daily at 9 AM)
- **Window**: 24-26 hour window ensures reminders sent once per event

## Future Enhancements

- [ ] Multiple reminder types (1 week, 1 hour before)
- [ ] Email reminders (in addition to in-app)
- [ ] SMS reminders (optional)
- [ ] User preference for reminder timing
- [ ] Organizer reminders (different cadence)
- [ ] Retry logic for failed reminders
- [ ] Analytics on reminder open/click rates
