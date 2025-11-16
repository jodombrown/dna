# ADA v2.0 Testing Guide

## Overview

This guide explains how to manually test the adaptive right rail behavior for different user cohorts.

## Seeded Data Summary

### Policies Created

1. **Global Default Modules** (ID: auto-generated)
   - Type: `modules`
   - Scope: `global`
   - Purpose: Default module configuration when no cohort matches
   - Modules: upcoming_events, suggested_people, recommended_spaces, trending_stories, open_needs

2. **New User Modules** (ID: auto-generated)
   - Type: `modules`
   - Scope: `cohort`
   - Cohort: `new_users`
   - Purpose: Simplified onboarding-focused modules for new members
   - Modules: resume_section (1), whats_next (2), suggested_people (3), upcoming_events (4)
   - Hidden: trending_stories, open_needs

3. **Event Organizer Modules** (ID: auto-generated)
   - Type: `modules`
   - Scope: `cohort`
   - Cohort: `event_organizers`
   - Purpose: Event and space management focus for organizers
   - Modules: upcoming_events (1), recommended_spaces (2), open_needs (3), suggested_people (4), trending_stories (5)
   - Hidden: resume_section

### Cohorts Created

1. **new_users**
   - Criteria: Account age ≤ 7 days
   - Database function checks: `EXTRACT(DAY FROM NOW() - created_at) <= 7`

2. **event_organizers**
   - Criteria: Created at least 1 event
   - Database function checks: `COUNT(*) FROM events WHERE created_by = user_id >= 1`

## Testing Instructions

### Test 1: New User Experience

**Setup:**
1. Create a new test account or use an account created within the last 7 days
2. Ensure the test user has NOT created any events

**Expected Right Rail Behavior:**
- **Position 1**: "Complete Your Profile" (resume_section)
- **Position 2**: "Getting Started" (whats_next) with onboarding steps
- **Position 3**: "Start Building Your Network" (suggested_people) - emphasized, 8 people
- **Position 4**: "Events to Get You Started" (upcoming_events) - 3 events, beginner-friendly filter
- **NOT VISIBLE**: trending_stories, open_needs

**Verification Query:**
```sql
-- Check which cohort this user belongs to
SELECT * FROM get_user_cohorts('[USER_ID]');
-- Should return: new_users

-- Check which policy is being used
SELECT 
  p.name, 
  p.type, 
  p.scope,
  p.config->'modules' as modules
FROM ada_policies p
WHERE p.name = 'New User Modules';
```

### Test 2: Event Organizer Experience

**Setup:**
1. Use an existing account or create a test account
2. Create at least 1 event using that account
3. Wait for cohort membership cache to refresh (or clear cache)

**Expected Right Rail Behavior:**
- **Position 1**: "Your Events & Upcoming" (upcoming_events) - 5 events, managed events first, create CTA
- **Position 2**: "Collaboration Spaces" (recommended_spaces) - 4 spaces, manage CTA
- **Position 3**: "Contribution Opportunities" (open_needs) - 4 needs, relevant filter
- **Position 4**: "Potential Collaborators" (suggested_people) - 5 people, organizers filter
- **Position 5**: "Community Stories" (trending_stories) - 2 stories
- **NOT VISIBLE**: resume_section

**Verification Query:**
```sql
-- Check which cohort this user belongs to
SELECT * FROM get_user_cohorts('[USER_ID]');
-- Should return: event_organizers

-- Verify event count
SELECT COUNT(*) FROM events WHERE created_by = '[USER_ID]';
-- Should be >= 1
```

### Test 3: Default Experience

**Setup:**
1. Use an account that is:
   - Older than 7 days (not a new user)
   - Has not created any events (not an organizer)

**Expected Right Rail Behavior:**
- **Position 1**: "Upcoming Events" (upcoming_events) - 3 events
- **Position 2**: "People You May Know" (suggested_people) - 5 people
- **Position 3**: "Spaces to Explore" (recommended_spaces) - 3 spaces
- **Position 4**: "Trending Stories" (trending_stories) - 3 stories
- **Position 5**: "Open Contribution Needs" (open_needs) - 3 needs

**Verification Query:**
```sql
-- Check which cohort this user belongs to
SELECT * FROM get_user_cohorts('[USER_ID]');
-- Should return: (empty result or no rows)

-- Verify they don't match criteria
SELECT 
  EXTRACT(DAY FROM NOW() - created_at)::INTEGER as account_age_days,
  (SELECT COUNT(*) FROM events WHERE created_by = profiles.id) as events_created
FROM profiles
WHERE id = '[USER_ID]';
-- account_age_days should be > 7
-- events_created should be 0
```

## Manual Testing Checklist

### Browser DevTools Testing

1. **Check Policy Resolution:**
   - Open browser DevTools → Console
   - Navigate to `/dna/feed`
   - Check React Query DevTools (if installed) for query: `['module-policy', userId, route]`
   - Verify the policy being returned matches expected cohort

2. **Check Module Rendering:**
   - Inspect the right rail DOM
   - Count visible modules
   - Verify module order matches policy config
   - Check that hidden modules are not rendered

3. **Check Cache Behavior:**
   - Refresh the page
   - Modules should load immediately (from cache)
   - Check Network tab - should not re-fetch policies for 5 minutes (staleTime)

### Database Verification

```sql
-- View all active policies
SELECT id, name, type, scope, is_active 
FROM ada_policies 
WHERE is_active = true
ORDER BY scope, type;

-- View all active cohorts
SELECT id, name, description, criteria 
FROM ada_cohorts 
WHERE is_active = true;

-- Test cohort evaluation for any user
SELECT * FROM get_user_cohorts('[USER_ID]');

-- Check cached cohort memberships
SELECT 
  cm.user_id,
  c.name as cohort_name,
  cm.computed_at,
  cm.expires_at
FROM ada_cohort_memberships cm
JOIN ada_cohorts c ON c.id = cm.cohort_id
WHERE cm.user_id = '[USER_ID]'
  AND cm.expires_at > NOW();
```

## Troubleshooting

### Issue: All users see the same modules

**Possible Causes:**
1. Cohort evaluation function not working
2. Policy resolution falling back to global default
3. Cache issues

**Debug Steps:**
```sql
-- 1. Test cohort function directly
SELECT * FROM get_user_cohorts(auth.uid());

-- 2. Check if policies are active
SELECT * FROM ada_policies WHERE is_active = true;

-- 3. Clear cohort membership cache
DELETE FROM ada_cohort_memberships WHERE user_id = auth.uid();

-- 4. Check CohortEvaluationService logs in browser console
```

### Issue: New user doesn't see new user modules

**Possible Causes:**
1. Account is older than 7 days
2. Cohort criteria not evaluating correctly
3. Policy not linked to cohort

**Debug Steps:**
```sql
-- Check account age
SELECT 
  id,
  email,
  created_at,
  EXTRACT(DAY FROM NOW() - created_at)::INTEGER as account_age_days
FROM profiles
WHERE id = auth.uid();

-- Manually test cohort criteria
SELECT 
  c.name,
  c.criteria,
  (EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER <= 7) as matches_new_user_criteria
FROM ada_cohorts c
CROSS JOIN profiles p
WHERE p.id = auth.uid() AND c.name = 'new_users';
```

### Issue: Event organizer still sees new user modules

**Possible Causes:**
1. User belongs to both cohorts
2. Policy resolution priority issue
3. Events not counted correctly

**Debug Steps:**
```sql
-- Check all cohort memberships
SELECT * FROM get_user_cohorts(auth.uid());

-- Verify event count
SELECT COUNT(*) FROM events WHERE created_by = auth.uid();

-- Check policy resolution order in AdaptiveConfigService
-- (Should prioritize experiment > cohort > global)
```

## Expected Behavior Summary

| User Type | Account Age | Events Created | Cohort Assigned | Primary Module Focus |
|-----------|-------------|----------------|-----------------|---------------------|
| Brand New User | ≤ 7 days | 0 | `new_users` | Profile completion, onboarding |
| New Organizer | ≤ 7 days | ≥ 1 | `new_users`, `event_organizers` | Event management (organizer policy takes priority) |
| Established Organizer | > 7 days | ≥ 1 | `event_organizers` | Event/space management, collaboration |
| Regular User | > 7 days | 0 | (none) | Balanced discovery: events, people, spaces |

## Next Steps

After verifying these three scenarios work correctly:

1. **Add More Cohorts:**
   - Active contributors (contributed to ≥ 3 spaces)
   - Community builders (joined ≥ 5 communities)
   - Story creators (published ≥ 3 stories)

2. **Create First Experiment:**
   - A/B test different module orders for event_organizers
   - Test: "Events first" vs "Spaces first"

3. **Add ViewState-Specific Modules:**
   - CONNECT_MODE → connection-focused modules
   - CONVENE_MODE → event-focused modules
   - COLLABORATE_MODE → space-focused modules

4. **Build Admin UI:**
   - Visual policy editor
   - Cohort membership viewer
   - Experiment dashboard
