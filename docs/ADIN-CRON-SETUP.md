# ADIN Engagement System - Cron Setup

## Automated Edge Functions

The DNA platform uses Supabase cron jobs to run automated engagement tracking and reminder systems.

### Edge Functions Scheduled:

1. **engagement-tracker** - Runs every hour
   - Updates user engagement scores
   - Tracks activity patterns
   - Calculates engagement tiers (dormant, at_risk, moderate, active, champion)

2. **engagement-reminders** - Runs daily at 10 AM
   - Generates personalized nudges for low-engagement users
   - Sends emails via the send-universal-email function
   - Logs reminder activity

### Setup Instructions:

**IMPORTANT**: The cron setup SQL contains project-specific credentials. Do NOT run this as a migration (it would expose credentials to remix users).

To set up cron jobs:

1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok/sql/new

2. Copy and paste the contents of `docs/CRON-SETUP.sql`

3. Execute the SQL to create the cron jobs

### Verify Cron Jobs:

```sql
SELECT * FROM cron.job;
```

### View Cron Job History:

```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### Manual Invocation (for testing):

```bash
# Test engagement tracker
curl -X POST 'https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/engagement-tracker' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Test engagement reminders
curl -X POST 'https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/engagement-reminders' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Monitoring:

- Check edge function logs: https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok/functions
- Review reminder_logs table for sent reminders
- Monitor adin_nudges table for generated nudges
- Check user_engagement_tracking for updated scores
