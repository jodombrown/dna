# DNA | CONNECT v2 – Smoke Test Script

**Purpose**: Quick 10-step verification that CONNECT v2 is working as expected after deployment.

**Time**: ~10-15 minutes

**Prerequisites**: 
- At least 2 test accounts (one with ≥40% profile, one with <40%)
- Some test data: events, spaces, connections, posts

---

## 1. Login Flow

**Action**: Log in as a regular user with ≥40% profile completion.

**Expected**:
- ✅ Land on `/dna/feed` (not `/dna/discover` or another route)
- ✅ See the feed interface with activity cards

**If fails**: Check routing in `App.tsx` and protected route setup.

---

## 2. Feed Variety

**Action**: Scroll through the feed for 2-3 screens.

**Expected**:
- ✅ See at least **posts + 1 other activity type** (connections/events/spaces/contributions/stories)
- ✅ Click 2-3 cards → they route correctly:
  - Profile cards → `/dna/:username`
  - Event cards → event detail
  - Space cards → space detail
  - Contribution cards → contribute detail
  - Story cards → convey detail

**If fails**: 
- Check `FeedActivityCard` routing logic
- Verify activity feed query is pulling multi-C data
- Check that you have diverse test data

---

## 3. Discover Filters + Search

**Action**: 
1. Go to `/dna/connect/discover`
2. Enter search term (e.g., "engineer", "climate")
3. Apply 2 filters (e.g., focus area + industry)
4. Scroll to bottom, click "Load More"

**Expected**:
- ✅ Search narrows results
- ✅ Each filter changes the results appropriately
- ✅ "Load More" appends new results without resetting filters
- ✅ Match scores are visible on cards

**If fails**:
- Check `Discover.tsx` filter state management
- Verify `discover_members` RPC receives correct params
- Check pagination logic (offset calculation)

---

## 4. Profile Gate (Critical Security Test)

**Action**:
1. Log in as user with **<40% completion** (create one if needed)
2. Try to appear in Discover (log in as another user and search)
3. Try to send a connection request as the <40% user

**Expected**:
- ✅ <40% user **does NOT appear** in Discover results
- ✅ When trying to connect, see toast: "Complete your profile to at least 40% to send connection requests"
- ✅ User is redirected to `/app/profile/edit`

**If fails**: 
- **CRITICAL**: Profile gate is not enforced
- Check `discover_members` RPC has `COALESCE(p.profile_completion_percentage, 0) >= 40`
- Check edge function `send-connection-request` validates completion
- Verify toast handler in `MemberCard.tsx`

---

## 5. Connection State Machine

**Action**:
1. From Discover, find a stranger
2. Click "Connect" → send request
3. Refresh or navigate away and back
4. Log in as recipient → accept request from Network
5. Return to Discover as original requester

**Expected**:
- ✅ Initial card shows "Connect" button
- ✅ After sending: card updates to "Request Sent" (disabled button)
- ✅ State persists on page refresh
- ✅ After acceptance: card shows "Message" + "Profile" buttons
- ✅ No TypeScript errors in console

**If fails**:
- Check `useConnectionStatus` hook and query invalidation
- Verify `MemberCard` connection state rendering logic
- Check connection status types match `ConnectionStatus` enum

---

## 6. Messages

**Action**: 
1. Find a connected user in Discover
2. Click "Message" button

**Expected**:
- ✅ Opens conversation route `/dna/connect/messages?conversation=<id>`
- ✅ Or creates new conversation if none exists
- ✅ Message interface loads

**If fails**:
- Check `handleMessage` in `MemberCard.tsx`
- Verify conversations table and RPC functions
- Check routing to messages page

---

## 7. My DNA Hub

**Action**:
1. Navigate to `/dna/me`
2. Look for key elements

**Expected**:
- ✅ See profile strength indicator
- ✅ See "View My Public Profile" button → click → goes to `/dna/:username`
- ✅ See "Edit Profile" button → click → goes to `/app/profile/edit`
- ✅ See sections for: Suggested Connections, Events, Spaces, Contributions

**If fails**:
- Check `Me.tsx` component structure
- Verify profile strength calculation
- Check navigation button handlers

---

## 8. Profile as Engine Node

**Action**:
1. From `/dna/me`, click "View My Public Profile"
2. Look for cross-5C sections

**Expected**:
- ✅ See at least ONE of: Spaces / Events / Contributions / Stories sections
- ✅ If sections exist, items within them link correctly:
  - Space → space detail
  - Event → event detail
  - Contribution → contribute detail
  - Story → convey detail
- ✅ If no data, sections show friendly empty states

**If fails**:
- Check `ProfileSpacesSection`, `ProfileEventsSection`, `ProfileContributionsSection`, `ProfileStoriesSection`
- Verify queries are fetching data correctly
- Check that you have test data linked to the user

---

## 9. Blocking (Critical Safety Test)

**Action**:
1. Go to another user's profile
2. Click "Block User"
3. Check:
   - Go to `/dna/connect/discover` → search for them
   - Go to `/dna/feed` → look for their activity
   - Go to Network → Suggestions

**Expected**:
- ✅ Blocked user **disappears from Discover**
- ✅ Blocked user's activity **does NOT appear in Feed**
- ✅ Blocked user **not in Suggestions**
- ✅ On their profile, "Connect" and "Message" CTAs are **hidden or disabled**

**If fails**:
- **CRITICAL**: Blocking is not enforced
- Check `discover_members` filters `blocked_users` table
- Check Feed query excludes blocked users
- Verify profile page blocks/hides CTAs for blocked users

---

## 10. No Obvious Errors

**Action**: While doing all of the above, keep browser console and network tab open.

**Expected**:
- ✅ No console errors (TypeScript, runtime errors)
- ✅ No network 500 errors
- ✅ No unhandled promise rejections
- ✅ RPC calls return expected data

**If fails**:
- Check console for specific error messages
- Review edge function logs in Supabase dashboard
- Check database logs for query errors

---

## Test Account Setup Guide

### Account A: High-Completion User
- Profile completion: **≥40%** (ideally 60-80%)
- Has: username, full_name, headline, bio, focus_areas, location, skills
- Member of: 1-2 spaces
- Has: 2-3 connections
- RSVP'd to: 1-2 events

### Account B: Low-Completion User (for Profile Gate testing)
- Profile completion: **<40%** (e.g., 20-30%)
- Has: username, full_name only
- Missing: headline, bio, focus_areas, etc.

### Account C: Active User (for blocking tests)
- Profile completion: **≥40%**
- Has some activity (posts, events, spaces)
- Will be blocked by Account A

---

## Quick Pass/Fail Summary

Copy this checklist for quick signoff:

```
[ ] 1. Login → lands on /dna/feed
[ ] 2. Feed shows multi-C activity + routing works
[ ] 3. Discover filters + search + pagination work
[ ] 4. Profile gate blocks <40% from Discover & connecting
[ ] 5. Connection states transition correctly
[ ] 6. Message button opens conversation
[ ] 7. /dna/me shows profile strength + nav buttons
[ ] 8. Public profile shows cross-5C sections
[ ] 9. Blocking removes user from all surfaces
[ ] 10. No console errors or network failures
```

**If all 10 are checked**: ✅ CONNECT v2 is production-ready.

**If 4 or 9 fail**: 🚨 **DO NOT SHIP** — critical safety issues.

---

## Troubleshooting Common Issues

### Issue: Users can't find each other in Discover
- Check profile completion is ≥40%
- Verify no blocking relationships exist
- Check filters aren't too restrictive
- Verify `discover_members` RPC is being called with correct params

### Issue: Connection state not updating
- Check `useConnectionStatus` query key includes user ID
- Verify `refetchStatus()` is called after connection actions
- Check `send-connection-request` edge function returns correct status

### Issue: Feed is empty
- Verify user has connections or activity
- Check feed query is pulling from correct tables
- Verify RLS policies allow reading feed data
- Check that test data exists

### Issue: Profile gate not working
- **Critical**: Check database migration applied successfully
- Verify `discover_members` has `>= 40` filter
- Check edge function validates completion percentage
- Ensure `profile_completion_percentage` column exists and is calculated

---

**Last Updated**: 2025-11-15 (CONNECT v2 Engine-Ready Release)
