# Beta Access Control Guide

## Overview
Registration is now controlled by a database feature flag that can be toggled on/off without code deployments.

## Current Status
🔒 **Registration is LOCKED** (Beta Access Only)

## How It Works

### 1. Database Feature Flag
The registration status is controlled by the `REGISTRATION_ENABLED` flag in the `feature_flags` table:

```sql
-- Current value: false (registration locked)
SELECT * FROM feature_flags WHERE feature_key = 'REGISTRATION_ENABLED';
```

### 2. What Users See When Locked
- **Signup Page**: Shows a beta access notice with your contact email
- **OAuth Signup**: Blocked with a friendly message
- **Login**: Still works for existing users ✅
- **Password Reset**: Still works ✅

### 3. What Still Works
✅ **Existing users can log in**
✅ **Password reset flows**
✅ **Admin magic links**
✅ **All authenticated features**

## How to Enable Public Registration

When you're ready to open registration to everyone:

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project: https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok
2. Navigate to **Table Editor** > **feature_flags**
3. Find the row where `feature_key` = 'REGISTRATION_ENABLED'
4. Change `is_enabled` from `false` to `true`
5. Save
6. ✨ Registration is now open!

### Option 2: Via SQL Editor
```sql
UPDATE feature_flags 
SET is_enabled = true 
WHERE feature_key = 'REGISTRATION_ENABLED';
```

## How to Lock Registration Again

Simply reverse the process:

```sql
UPDATE feature_flags 
SET is_enabled = false 
WHERE feature_key = 'REGISTRATION_ENABLED';
```

## Testing

### Test That Registration is Blocked
1. Go to `/auth` page
2. Switch to "Sign Up" mode
3. You should see the beta access notice
4. Attempting to sign up should show: "Registration Closed"

### Test That Login Still Works
1. Go to `/auth` page
2. Stay in "Login" mode
3. Existing users should be able to log in normally

### Test When Registration is Enabled
1. Enable the flag in database
2. Refresh the `/auth` page
3. The beta notice should disappear
4. New users should be able to sign up

## User Messaging

When registration is locked, users see:
> **Beta Access Only**  
> We're currently in private beta. New registrations are temporarily paused.  
> Contact us for early access

## Current Admin Access

You (Jaûne) can still:
- ✅ Log in with your existing account
- ✅ Use admin magic links if configured
- ✅ Access all features as normal

## Future: Invite-Only System

If you want more control later, you could:
- Keep registration locked
- Create an invite system where you manually approve users
- Send them invite links that bypass the registration check

This is already partially built in `src/pages/InviteSignup.tsx` and could be expanded.

## Support

If users contact you for early access:
1. You can manually create accounts for them via Supabase Dashboard
2. Or temporarily enable registration, have them sign up, then lock it again
3. Or build out the invite system for more automation

---

**Quick Links:**
- [Supabase Feature Flags Table](https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok/editor/public/feature_flags)
- [Supabase SQL Editor](https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok/sql/new)
