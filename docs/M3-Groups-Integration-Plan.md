# M3: Groups Integration Plan

## Overview
Integrate the Convene event system with DNA's existing groups infrastructure, enabling group-based events, discovery, and community engagement.

## Objectives
- Connect events to groups (group-hosted events)
- Enable groups to browse and manage their own events
- Build group discovery for event attendees
- Add group posts/discussions feed
- Integrate group membership with event access

## Features to Implement

### 1. Group Event Creation
**Route**: `/dna/convene/events/new` (enhanced)
- Add optional "Host as Group" selector in Create Event form
- Show user's groups (where they're admin/moderator)
- Link event to group via `group_id` foreign key
- Update edge function to handle group-hosted events

**Files to modify**:
- `src/components/events/CreateEventForm.tsx` - Add group selector
- `supabase/functions/create-event/index.ts` - Validate group ownership

### 2. Group Events Page
**Route**: `/dna/groups/:id/events`
- Show all events hosted by the group
- Upcoming vs Past tabs
- "Host Event" CTA (for group admins/moderators only)
- Filter by event type and format

**Files to create**:
- `src/pages/dna/groups/GroupEvents.tsx`

### 3. Group Browse & Discovery
**Route**: `/dna/convene/groups`
- Browse all public groups
- Search by name, category, location
- Filter by category (Professional, Social, Cultural, Tech, etc.)
- Show member count, recent activity
- "Join" or "Request to Join" CTAs

**Files to create**:
- `src/pages/dna/convene/GroupsBrowse.tsx`
- `src/components/groups/GroupCard.tsx`

### 4. Group Detail Page Enhancement
**Route**: `/dna/groups/:id`
- Add "Events" tab alongside "Posts" and "Members"
- Show upcoming group events
- Group admin can create events from here
- Members can RSVP to group events

**Files to modify**:
- Existing group detail page (if exists in codebase)

### 5. Group Posts Feed
**Route**: `/dna/groups/:id/posts`
- Display group discussions/posts
- Create new post (for members only)
- Like, comment on posts
- Filter by recent, popular, pinned

**Files to create**:
- `src/pages/dna/groups/GroupPosts.tsx`
- `src/components/groups/GroupPostCard.tsx`
- `src/components/groups/CreatePostForm.tsx`

### 6. Group Join/Request Flow
**Components**:
- "Join Group" button (for public groups)
- "Request to Join" button (for private groups)
- Admin approval interface for join requests
- Notification when request is approved/denied

**Files to create**:
- `src/components/groups/JoinGroupButton.tsx`
- Edge function: `supabase/functions/join-group/index.ts`
- Edge function: `supabase/functions/handle-group-request/index.ts`

### 7. Group-Event Integration
**Features**:
- Events show "Hosted by [Group Name]" when group-hosted
- Event attendees can see group info and join group
- Group members get priority/automatic approval for group events
- Group events appear in group feed

**Files to modify**:
- `src/pages/dna/convene/EventDetail.tsx` - Show group host info
- `src/pages/dna/convene/EventsIndex.tsx` - Add group filter

## Database Considerations

### Existing Tables (to leverage)
- `groups` - Group info
- `group_members` - Membership tracking
- `group_posts` - Group discussions
- `events` - Has `group_id` column (nullable)

### Potential New Tables/Columns
- `group_join_requests` - Track pending join requests
- Add `event_count` to groups table (or compute dynamically)

## Edge Functions

### New Functions
1. `join-group` - Handle public group joins
2. `request-group-join` - Request to join private group
3. `approve-group-request` - Admin approves/denies join request
4. `create-group-post` - Create post in group
5. `create-group-event` - Create event on behalf of group (may merge with create-event)

### Modified Functions
- `create-event` - Add group validation and linking
- `update-event` - Handle group event updates

## RLS Policies to Review
- Ensure group members can view private group events
- Group admins can edit/delete group events
- Non-members cannot see private group content

## UI/UX Enhancements
- Group branding on event cards (group logo, colors)
- "You're a member of this group" badges
- "Join group to see more events" CTAs
- Group event calendar view

## Success Metrics
- Group-hosted events created
- Group joins via event discovery
- Group post engagement
- Cross-group event attendance

## Next Steps After M3
- M4: Recommendations & Reminders
- M5: Analytics & Reporting
- M6: Notifications & Email Digests
