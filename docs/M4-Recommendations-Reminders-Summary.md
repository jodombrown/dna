# M4 - Recommendations & Reminders Implementation Summary

**Status:** ✅ Complete

## Features Implemented

### 1. AI-Powered Event Recommendations (`get-event-recommendations` edge function)

**What it does:**
- Uses Lovable AI (Google Gemini 2.5 Flash) to intelligently recommend events to users
- Analyzes user profile (interests, tags, location)
- Considers user's group memberships
- Calculates social proof (friends attending)
- Scores events 0-100 with reasoning

**How it works:**
1. Fetches user's profile data (interests, location, groups)
2. Fetches user's connections for social proof calculation
3. Gets upcoming public events
4. Calls Lovable AI with structured tool calling to score events
5. Returns top 10 recommendations with scores and reasoning

**UI Components:**
- `EventRecommendations` component displays personalized recommendations on ConveneHub
- Shows match scores, reasoning, and social proof ("X friends attending")
- Responsive card design with badges for top matches

### 2. Automated Event Reminders (`send-event-reminders` edge function)

**What it does:**
- Scheduled function that sends 24-hour reminders to event attendees
- Creates in-app notifications for users who RSVP'd "going"
- Respects user email notification preferences

**How it works:**
1. Finds events starting in 24-26 hours
2. Gets all attendees with "going" status
3. Creates notifications for each attendee
4. Includes event details and relevant links

**To activate:**
Set up a cron job in Supabase to run this function daily:
```sql
select cron.schedule(
  'send-event-reminders-daily',
  '0 9 * * *', -- 9 AM daily
  $$
  select net.http_post(
    url:='https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/send-event-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

### 3. Social Proof (`EventSocialProof` component)

**What it does:**
- Shows mutual connections attending an event
- Displays avatars of friends attending
- "X friends you know are attending" messaging

**Usage:**
```tsx
<EventSocialProof eventId={event.id} compact={true} />
```

## Database Changes

- ✅ `group_id` column added to `events` table (for group-hosted events)
- ✅ RLS policy added for group members to view group events
- ✅ Index created on `events.group_id` for performance

## Configuration

- ✅ Lovable AI enabled with `LOVABLE_API_KEY` secret
- ✅ Edge functions configured in `supabase/config.toml`
- ✅ Functions deployed and operational

## Key Files

### Edge Functions
- `supabase/functions/get-event-recommendations/index.ts` - AI recommendation engine
- `supabase/functions/send-event-reminders/index.ts` - Automated reminder system

### React Components
- `src/components/events/EventRecommendations.tsx` - Displays AI recommendations
- `src/components/events/EventSocialProof.tsx` - Shows friends attending

### Pages Updated
- `src/pages/dna/convene/ConveneHub.tsx` - Now shows recommendations section

### Types
- `src/types/events.ts` - Added `group_id` to Event interface

## Usage

### For Users
1. Navigate to `/dna/convene` to see personalized event recommendations
2. Recommendations appear with match scores and reasoning
3. Social proof shows which friends are attending
4. Users receive automatic reminders 24 hours before their events

### For Developers
- Recommendations update based on user profile changes
- Easy to extend recommendation logic in the edge function
- Reminder schedule can be adjusted via cron configuration
- Social proof automatically queries connections table

## Performance Considerations

- Recommendations are cached per user via React Query
- AI calls use `google/gemini-2.5-flash` for cost efficiency
- Social proof queries are optimized with proper indexing
- Batch notification creation for reminders

## Next Steps / Future Enhancements

1. Add email notifications (integrate with send-universal-email)
2. Add SMS reminders for premium users
3. Implement 1-hour before reminder
4. Add "interested" status tracking for better recommendations
5. Machine learning feedback loop (track which recommendations users click)
6. Group-specific event recommendations
7. Recurring event support in reminders

## Testing

To test recommendations:
1. Ensure user profile has interests/tags filled in
2. Create some test events
3. Visit `/dna/convene` while logged in
4. Check browser console for any AI API errors

To test reminders:
1. Create an event starting 24 hours from now
2. RSVP as "going"
3. Manually trigger the edge function or wait for cron
4. Check notifications table for created reminders

## Cost Considerations

- AI recommendations: ~1 credit per user per request
- Structured output via tool calling included
- Recommendation queries are cached
- Reminder function runs once daily (low cost)
