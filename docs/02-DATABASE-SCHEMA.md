# DNA Platform Database Schema

## 1. Overview

The DNA platform uses **PostgreSQL via Supabase** with comprehensive Row Level Security (RLS) policies on all tables. The schema supports user profiles, social networking, events, collaboration spaces, opportunities, and engagement tracking.

**Database Project**: `ybhssuehmfnxrzneobok.supabase.co`

---

## 2. Core Tables

### **profiles**
User profile information and preferences.

**Columns**:
- `id` (uuid, PK) - References `auth.users(id)`
- `email` (text)
- `full_name` (text)
- `username` (text, unique) - URL-safe username
- `avatar_url` (text)
- `bio` (text)
- `headline` (text) - Professional tagline
- `location` (text)
- `city` (text)
- `country_of_origin` (text)
- `current_country` (text)
- `profession` (text)
- `company` (text)
- `skills` (text[]) - Array of skills
- `interests` (text[]) - Array of interests
- `impact_areas` (text[]) - Focus areas for impact
- `intentions` (text[]) - User's goals on platform
- `africa_focus_areas` (text[]) - African regions/topics of interest
- `diaspora_status` (text) - Relationship to diaspora
- `profile_completion_percentage` (integer) - Calculated field
- `onboarding_completed_at` (timestamptz)
- `is_public` (boolean) - Profile visibility
- `last_seen_at` (timestamptz) - Activity tracking
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public profiles OR own profile OR connected users
- **INSERT**: Own profile only (via trigger from auth.users)
- **UPDATE**: Own profile only
- **DELETE**: Own profile only (cascades from auth.users)

**Triggers**:
- `update_profile_completion`: Calculates completion percentage on update
- `update_last_seen`: Updates last_seen_at timestamp

---

### **connections**
User-to-user connections (bidirectional relationships).

**Columns**:
- `id` (uuid, PK)
- `a` (uuid) - First user
- `b` (uuid) - Second user
- `status` (text) - `requested`, `accepted`, `rejected`
- `connection_note` (text) - Optional message
- `adin_health` (integer, default: 50) - Connection strength score
- `adin_health_reason` (text) - Explanation for health score
- `created_at` (timestamptz)
- `last_interaction_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Participants only (a OR b = auth.uid())
- **INSERT**: Participants only
- **UPDATE**: Participants only

**Functions**:
- `ensure_connection(u1, u2)`: Creates connection if doesn't exist
- `are_users_connected(u1, u2)`: Boolean check for active connection
- `accept_connection(connection_id)`: Accepts connection and creates preferences

---

### **connection_requests**
Explicit connection request tracking (alternative to connections table).

**Columns**:
- `id` (uuid, PK)
- `sender_id` (uuid)
- `receiver_id` (uuid)
- `message` (text)
- `status` (text) - `pending`, `accepted`, `rejected`
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Sender OR receiver
- **INSERT**: Sender only
- **UPDATE**: Sender OR receiver

---

## 3. Social Feed Tables

### **posts**
User-generated content (posts, updates, media).

**Columns**:
- `id` (uuid, PK)
- `author_id` (uuid)
- `content` (text)
- `media_urls` (text[]) - Array of image/video URLs
- `post_type` (text) - `update`, `poll`, `opportunity`, `media`
- `visibility` (text) - `public`, `connections`, `private`
- `likes_count` (integer)
- `comments_count` (integer)
- `shares_count` (integer)
- `views_count` (integer)
- `is_seeded` (boolean) - Demo/sample content flag
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public posts OR own posts OR connections' posts
- **INSERT**: Authenticated users only
- **UPDATE**: Author only
- **DELETE**: Author only

**Triggers**:
- `log_post_event()`: Logs analytics events

---

### **comments**
Comments on posts.

**Columns**:
- `id` (uuid, PK)
- `post_id` (uuid)
- `author_id` (uuid)
- `parent_id` (uuid) - For nested replies
- `content` (text)
- `is_seeded` (boolean)
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Can view if can view parent post
- **INSERT**: Own comments only
- **UPDATE**: Own comments only
- **DELETE**: Own comments only

---

### **post_analytics**
Detailed analytics for posts (views, engagement).

**Columns**:
- `id` (uuid, PK)
- `post_id` (uuid)
- `event_type` (text) - `view`, `like`, `comment`, `share`
- `user_id` (uuid)
- `event_date` (date)
- `count` (integer) - Aggregated count
- `metadata` (jsonb) - Additional context

**RLS Policies**:
- **INSERT**: System/authenticated users
- **SELECT**: Post author only

**Function**:
- `log_post_event(post_id, event_type, metadata)`: Inserts/upserts analytics

---

## 4. Events Tables

### **events**
Event listings and details.

**Columns**:
- `id` (uuid, PK)
- `created_by` (uuid)
- `title` (text)
- `description` (text)
- `event_date` (timestamptz)
- `end_date` (timestamptz)
- `location` (text)
- `is_virtual` (boolean)
- `registration_url` (text)
- `image_url` (text)
- `max_attendees` (integer)
- `registration_required` (boolean)
- `status` (text) - `draft`, `published`, `cancelled`
- `attendee_count` (integer) - Cached count
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public events OR own events
- **INSERT**: Authenticated users
- **UPDATE**: Event creator only
- **DELETE**: Event creator only

---

### **event_registrations**
User registrations for events.

**Columns**:
- `id` (uuid, PK)
- `event_id` (uuid)
- `user_id` (uuid)
- `ticket_type_id` (uuid)
- `status` (text) - `going`, `interested`, `not_going`, `cancelled`
- `price_paid_cents` (integer)
- `currency` (text)
- `stripe_session_id` (text)
- `stripe_payment_intent_id` (text)
- `join_token` (text) - For check-in
- `answers` (jsonb) - Registration form responses
- `notes` (text)
- `registered_at` (timestamptz)
- `cancelled_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Own registrations OR event host
- **INSERT**: Own registrations only
- **UPDATE**: Event host (for status changes)
- **DELETE**: Own registrations only

**Triggers**:
- `_on_event_reg_change()`: Updates event attendee count
- `gen_join_token()`: Generates unique join token

---

### **event_checkins**
Event check-in tracking.

**Columns**:
- `id` (uuid, PK)
- `registration_id` (uuid)
- `by_profile_id` (uuid) - Who checked in the user
- `checked_in_at` (timestamptz)

**RLS Policies**:
- **ALL**: Event staff/creator only

---

## 5. Collaboration Tables

### **collaboration_spaces**
Project/initiative collaboration spaces.

**Columns**:
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `created_by` (uuid)
- `image_url` (text)
- `visibility` (text) - `public`, `private`
- `status` (text) - `active`, `archived`, `completed`
- `tags` (text[])
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public spaces OR members
- **INSERT**: Creator only
- **UPDATE**: Owners/admins only
- **DELETE**: Owners/admins only

**Triggers**:
- `create_collab_owner_membership()`: Auto-creates owner membership

---

### **collaboration_memberships**
User memberships in collaboration spaces.

**Columns**:
- `id` (uuid, PK)
- `space_id` (uuid)
- `user_id` (uuid)
- `role` (text) - `owner`, `admin`, `member`
- `status` (text) - `pending`, `approved`, `rejected`
- `joined_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Approved members only
- **INSERT**: Self OR admins
- **UPDATE**: Self OR admins
- **DELETE**: Self OR admins

**Functions**:
- `rpc_request_join_space(space_id)`: Request membership
- `rpc_membership_approve(space_id, user_id)`: Approve request
- `rpc_membership_reject(space_id, user_id)`: Reject request

---

### **tasks**
Tasks within collaboration spaces.

**Columns**:
- `id` (uuid, PK)
- `space_id` (uuid)
- `title` (text)
- `description` (text)
- `assignee_id` (uuid)
- `status` (text) - `todo`, `in_progress`, `review`, `done`
- `priority` (text) - `low`, `medium`, `high`, `urgent`
- `due_date` (date)
- `milestone_id` (uuid)
- `created_by` (uuid)
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **ALL**: Space members only

**Functions**:
- `rpc_task_create(space_id, title, ...)`: Creates task
- `rpc_task_update(task_id, ...)`: Updates task
- `rpc_task_assign(task_id, assignee_id)`: Assigns task
- `rpc_task_set_status(task_id, status)`: Updates status

---

### **milestones**
Project milestones for collaboration spaces.

**Columns**:
- `id` (uuid, PK)
- `space_id` (uuid)
- `title` (text)
- `description` (text)
- `target_date` (date)
- `status` (text) - `planned`, `active`, `completed`, `missed`
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **ALL**: Space members only

---

## 6. Opportunities & Contributions

### **opportunities**
Job postings, grants, partnerships.

**Columns**:
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `organization_id` (uuid)
- `opportunity_type` (text) - `job`, `grant`, `partnership`, `volunteer`
- `location` (text)
- `application_deadline` (date)
- `status` (text) - `draft`, `published`, `closed`
- `application_url` (text)
- `created_by` (uuid)
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public opportunities
- **INSERT**: Organization members
- **UPDATE**: Organization admins
- **DELETE**: Organization admins

---

### **applications**
User applications to opportunities.

**Columns**:
- `id` (uuid, PK)
- `opportunity_id` (uuid)
- `user_id` (uuid)
- `cover_letter` (text)
- `resume_url` (text)
- `status` (text) - `submitted`, `under_review`, `accepted`, `rejected`
- `applied_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Own applications
- **INSERT**: Own applications
- **UPDATE**: Own applications

---

### **user_contributions**
Track user contributions (posts, projects, connections).

**Columns**:
- `id` (uuid, PK)
- `user_id` (uuid)
- `type` (text) - `post`, `project`, `connection`, `event`
- `target_id` (uuid) - ID of contributed item
- `description` (text)
- `sector` (text) - Industry/sector
- `region` (text) - Geographic region
- `created_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Own contributions OR public profiles
- **INSERT**: Via function only

**Function**:
- `_log_contrib_fixed(user_id, type, target_id, ...)`: Logs contribution

---

## 7. Engagement & Gamification

### **impact_badges**
Available badges users can earn.

**Columns**:
- `id` (uuid, PK)
- `name` (text)
- `description` (text)
- `badge_type` (text) - Category
- `icon` (text) - Icon identifier
- `criteria` (jsonb) - Earning criteria
- `created_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public

---

### **user_badges**
Badges earned by users.

**Columns**:
- `id` (uuid, PK)
- `user_id` (uuid)
- `badge_id` (uuid)
- `earned_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Public OR own
- **INSERT**: Via system only

**Function**:
- `check_badge_unlocks(user_id)`: Checks and awards badges

---

### **adin_nudges**
AI-driven engagement nudges for users.

**Columns**:
- `id` (uuid, PK)
- `user_id` (uuid)
- `connection_id` (uuid)
- `nudge_type` (text) - `kickstart`, `follow_up`, `reconnect`
- `message` (text)
- `status` (text) - `sent`, `acted`, `dismissed`
- `payload` (jsonb)
- `created_at`, `resolved_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Own nudges
- **UPDATE**: Own nudges
- **INSERT**: System only

---

## 8. Messaging

### **conversations**
One-on-one conversation threads.

**Columns**:
- `id` (uuid, PK)
- `user_a` (uuid)
- `user_b` (uuid)
- `last_message_at` (timestamptz)
- `created_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Participants only
- **INSERT**: Participants only

---

### **messages**
Messages within conversations.

**Columns**:
- `id` (uuid, PK)
- `conversation_id` (uuid)
- `sender_id` (uuid)
- `content` (text)
- `is_read` (boolean)
- `created_at` (timestamptz)

**RLS Policies**:
- **SELECT**: Conversation participants
- **INSERT**: Own messages only
- **UPDATE**: Own messages (mark as read)

---

## 9. Admin & Moderation

### **user_roles**
User role assignments (admin, moderator, user).

**Enum**: `app_role` (`admin`, `moderator`, `user`)

**Columns**:
- `id` (uuid, PK)
- `user_id` (uuid)
- `role` (app_role)
- Unique constraint on (user_id, role)

**RLS Policies**:
- **ALL**: Managed via security definer functions

**Function**:
- `has_role(user_id, role)`: Returns boolean, security definer

---

### **content_moderation**
Moderation actions on content.

**Columns**:
- `id` (uuid, PK)
- `content_type` (text) - `post`, `comment`, `profile`
- `content_id` (uuid)
- `action` (text) - `flag`, `hide`, `remove`, `warn`
- `reason` (text)
- `moderator_id` (uuid)
- `status` (text) - `pending`, `approved`, `rejected`
- `created_at`, `resolved_at` (timestamptz)

**RLS Policies**:
- **ALL**: Admins only (via `has_role()`)

---

## 10. Analytics & Logging

### **events_log**
System event logging for analytics.

**Columns**:
- `id` (uuid, PK)
- `event_type` (text) - `profile_completed`, `connection_made`, etc.
- `user_id` (uuid)
- `payload` (jsonb)
- `created_at` (timestamptz)

**RLS Policies**:
- **INSERT**: System/authenticated users
- **SELECT**: Admins only

---

### **error_logs**
Client-side error tracking.

**Columns**:
- `id` (uuid, PK)
- `user_id` (uuid)
- `error_type` (text)
- `error_message` (text)
- `error_stack` (text)
- `component_stack` (text)
- `url` (text)
- `user_agent` (text)
- `severity` (text) - `error`, `warning`, `info`
- `metadata` (jsonb)
- `created_at` (timestamptz)

**RLS Policies**:
- **INSERT**: Anyone (for error reporting)
- **SELECT**: Admins only

---

## 11. Key Database Functions

### **Security Functions**
```sql
-- Check if user has specific role
has_role(user_id uuid, role app_role) RETURNS boolean

-- Check username availability
check_username_available(username text, user_id uuid) RETURNS boolean

-- Calculate profile completion
calculate_profile_completion_percentage(profile_id uuid) RETURNS integer
```

### **Connection Functions**
```sql
-- Ensure connection exists
ensure_connection(u1 uuid, u2 uuid) RETURNS uuid

-- Check if users are connected
are_users_connected(u1 uuid, u2 uuid) RETURNS boolean

-- Accept connection request
accept_connection(connection_id uuid) RETURNS void
```

### **Collaboration Functions**
```sql
-- Check space membership
is_member_of_space(space_id uuid, user_id uuid, roles text[], approved_only boolean) RETURNS boolean

-- Request to join space
rpc_request_join_space(space_id uuid) RETURNS void

-- Approve membership
rpc_membership_approve(space_id uuid, user_id uuid) RETURNS void
```

### **Analytics Functions**
```sql
-- Log post event
log_post_event(post_id uuid, event_type text, metadata jsonb) RETURNS void

-- Log contribution
_log_contrib_fixed(user_id uuid, type text, target_id uuid, description text, sector text, region text) RETURNS void
```

---

## 12. Realtime Setup

Tables with realtime enabled:
- `profiles` - Profile updates
- `connections` - Connection status changes
- `messages` - New messages
- `notifications` - New notifications
- `posts` - Feed updates

```sql
-- Enable realtime
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
```

---

## 13. Storage Buckets

### **avatars** (Public)
User profile pictures.

**RLS Policies**:
- **SELECT**: Public
- **INSERT**: Own folder only
- **UPDATE**: Own folder only
- **DELETE**: Own folder only

### **events** (Public)
Event cover images.

---

**Last Updated**: October 2024  
**Database Version**: PostgreSQL 15+ via Supabase
