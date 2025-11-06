# Product Requirements Document
## Social Feed Completion + ADIN Engagement System

**Version:** 1.0  
**Created:** 2025-11-06  
**Owner:** Jaûne Odombrown + Makena (AI Co-Founder)  
**Status:** 🚧 In Progress

---

## Vision & Strategic Context

This PRD represents DNA's core retention engine. We're building **two interconnected systems** that transform passive users into active community builders:

1. **Social Feed Completion** (Phase 1) - Quick wins that make the platform feel alive
2. **ADIN Engagement System** (Phase 2) - Our proprietary retention gold that proactively nurtures connections

**Guiding Principle:** "The platform should work harder than the user to maintain their connections."

---

## Phase 1: Social Feed Completion ✅

### Objective
Complete all pending social feed interactions so users can fully engage with content and each other.

### Features to Implement

#### 1.1 Repost/Share Feature ✅
**Database:** ✅ Complete  
**UI/UX:** ✅ Complete  
**Status:** SHIPPED

**Completed:**
- [x] Repost button on all post cards
- [x] Repost modal with original post preview
- [x] Optional commentary text area (max 500 chars)
- [x] Privacy selector (public/connections)
- [x] Reposts display in feed with "User shared this" header
- [x] Original post embedded/quoted
- [x] Share commentary displayed above original
- [x] Attribution preserved (original author visible)
- [x] Feed query updated to fetch original post data
- [x] SharedPostCard component created for clean repost display

---

#### 1.2 Post Likes UI ✅
**Database:** ✅ Complete  
**UI/UX:** ✅ Complete  
**Status:** SHIPPED

**Completed:**
- [x] Heart icon on all post cards (filled when liked)
- [x] Like count displays next to heart icon
- [x] Optimistic UI updates (instant feedback)
- [x] "Liked by" modal showing:
  - Avatar list of likers
  - Full names + headlines
  - Clickable to view profiles
- [x] Like analytics tracked in `post_reactions` table
- [x] Dual system: Simple heart like + Emoji reactions
- [x] RLS policies verified secure

**Note:** Users now have two engagement options:
1. **Quick Like** - Simple heart button for fast appreciation
2. **Nuanced Reaction** - Emoji picker for specific emotions (celebrate, love, insightful, etc.)

---

#### 1.3 Post Bookmarks ✅
**Database:** ✅ Complete  
**UI/UX:** ✅ Complete  
**Status:** SHIPPED

**Completed:**
- [x] Created `post_bookmarks` table with RLS policies
- [x] Bookmark icon on all post cards (filled when saved)
- [x] One-click save/unsave functionality
- [x] "Saved Posts" page at `/dna/saved`:
  - Shows all bookmarked posts
  - Search functionality
  - Filter by content/author
  - Click to view original post
  - Remove bookmark option
- [x] Bookmark count accessible (for future profile stats)
- [x] Optimistic UI updates
- [x] Performance indexes on database

**Acceptance Criteria Met:**
- ✅ User can bookmark any visible post
- ✅ Bookmarks are private (only user can see)
- ✅ Saved Posts page accessible from navigation
- ✅ Bookmarks persist indefinitely
- ✅ User can unbookmark from feed or saved view
- ✅ Search works on post content and author names

**Future Enhancement (v2):**
- Folder/collection organization (schema ready)
- Export saved posts
- Bookmark analytics

---

## 🎉 PHASE 1 COMPLETE! 🎉

**All Social Feed Features Shipped:**
1. ✅ Repost/Share with commentary
2. ✅ Heart likes + Emoji reactions (dual system)
3. ✅ Post bookmarks with search

**Next:** Phase 2 - ADIN Engagement System

---

## Phase 2: ADIN Engagement System 🧠
- [ ] 70%+ of active users like at least 1 post/week
- [ ] 40%+ of posts get at least 1 repost
- [ ] 30%+ of users have 5+ saved posts within 2 weeks
- [ ] Feed engagement time increases 25%+

---

## Phase 2: ADIN Engagement System 🧠

### Objective
Build an intelligent, proactive engagement engine that identifies dormant users, weak connections, and engagement opportunities—then automatically nudges users back into meaningful activity.

**ADIN = African Diaspora Intelligence Network**

---

### 2.1 Database Schema

#### Tables to Create:

**A. `user_engagement_tracking`**
```sql
CREATE TABLE user_engagement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_login TIMESTAMP WITH TIME ZONE,
  last_post_created TIMESTAMP WITH TIME ZONE,
  last_comment_made TIMESTAMP WITH TIME ZONE,
  last_connection_request TIMESTAMP WITH TIME ZONE,
  last_message_sent TIMESTAMP WITH TIME ZONE,
  last_event_registered TIMESTAMP WITH TIME ZONE,
  
  -- Aggregate metrics
  total_posts INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_connections INT DEFAULT 0,
  total_messages_sent INT DEFAULT 0,
  
  -- Engagement scoring
  engagement_score DECIMAL(5,2) DEFAULT 0, -- 0-100 scale
  engagement_tier TEXT DEFAULT 'new', -- new, active, champion, dormant, at_risk
  
  -- ADIN intelligence
  primary_use_case TEXT, -- networking, learning, investing, etc.
  preferred_engagement_time TIME, -- when user is most active
  nudge_frequency TEXT DEFAULT 'weekly', -- daily, weekly, biweekly
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_engagement_user ON user_engagement_tracking(user_id);
CREATE INDEX idx_engagement_tier ON user_engagement_tracking(engagement_tier);
CREATE INDEX idx_engagement_score ON user_engagement_tracking(engagement_score);
```

**B. `reminder_logs`**
```sql
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- connection_nudge, post_prompt, event_reminder, etc.
  reminder_content JSONB, -- stores personalized message data
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE,
  action_taken BOOLEAN DEFAULT false, -- did user complete suggested action?
  action_type TEXT, -- what action they took
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_reminder_user ON reminder_logs(user_id);
CREATE INDEX idx_reminder_type ON reminder_logs(reminder_type);
CREATE INDEX idx_reminder_sent ON reminder_logs(sent_at);
```

**C. `adin_nudges`** (already exists in connection_nudges, expand)
```sql
-- Expand existing connection_nudges to be more general
ALTER TABLE connection_nudges RENAME TO adin_nudges;

ALTER TABLE adin_nudges
ADD COLUMN IF NOT EXISTS nudge_category TEXT DEFAULT 'connection', -- connection, content, event, milestone
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

COMMENT ON TABLE adin_nudges IS 'AI-generated personalized nudges to drive user engagement across all platform features';
```

**D. `engagement_milestones`**
```sql
CREATE TABLE engagement_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL, -- first_post, 10_connections, 30_day_streak, etc.
  milestone_name TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  celebrated BOOLEAN DEFAULT false, -- did we show celebration modal?
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_milestone_user ON engagement_milestones(user_id);
CREATE INDEX idx_milestone_type ON engagement_milestones(milestone_type);
```

---

### 2.2 Edge Functions

#### A. `engagement-tracker` (runs hourly)
**Purpose:** Update engagement scores and tiers for all users

**Logic:**
1. Query all user activity from past 7/30/90 days
2. Calculate engagement score (0-100):
   - Posts created: +10 each (max 30)
   - Comments: +5 each (max 20)
   - Connections made: +8 each (max 24)
   - Messages sent: +3 each (max 12)
   - Events attended: +7 each (max 14)
3. Assign tier:
   - Champion: 80-100, active weekly
   - Active: 50-79, active in last 2 weeks
   - Moderate: 25-49, active in last month
   - At Risk: 10-24, active 1-2 months ago
   - Dormant: 0-9, no activity 2+ months
4. Update `user_engagement_tracking` table

**Schedule:** Every hour via cron

---

#### B. `engagement-reminders` (runs daily)
**Purpose:** Send personalized nudges based on user tier and behavior

**Logic:**
1. Query users by tier:
   - **At Risk** (10-24 score): Daily check
   - **Dormant** (0-9 score): Weekly check
   - **Moderate** (25-49): Bi-weekly check
2. For each user, generate personalized nudge:
   - Check last activity type
   - Identify neglected features
   - Create contextual reminder
3. Insert nudge into `adin_nudges` and `reminder_logs`
4. Trigger in-app notification + optional email

**Nudge Types:**
- "Your network is growing - check out new connection requests"
- "3 professionals in [your industry] joined this week"
- "[Connection name] just posted about [topic] you care about"
- "You haven't posted in 2 weeks - share an update?"
- "Complete your profile to unlock collaboration features"

**Schedule:** Daily at 9am user local time

---

#### C. `connection-health-analyzer` (runs weekly)
**Purpose:** Identify weak/strong connections and suggest re-engagement

**Logic:**
1. For each user, analyze connections:
   - Last interaction date
   - Interaction frequency
   - Shared interests/groups
2. Flag connections as:
   - **Strong:** Interact weekly, multiple touchpoints
   - **Moderate:** Interact monthly
   - **Weak:** No interaction 2+ months
   - **Fading:** Used to be strong, now infrequent
3. Generate reconnection nudges:
   - "You haven't connected with [Name] in 3 months - send a message?"
   - "[Name] posted about [topic] - perfect time to reconnect"
4. Update `connection_activities` with health score

**Schedule:** Every Sunday at 8am

---

### 2.3 Admin Analytics Dashboard

**New Route:** `/app/admin/adin-analytics`

**Metrics to Display:**

**A. Engagement Overview**
- Total users by tier (pie chart)
- Average engagement score (line chart over time)
- Tier movement (how many moved up/down this week)

**B. Nudge Performance**
- Nudges sent this week/month
- Open rate by nudge type
- Action completion rate
- Best performing nudge templates

**C. Retention Metrics**
- 7/30/90 day retention rates
- Resurrection rate (dormant → active)
- Churn risk (users trending down)

**D. User Cohort Analysis**
- Engagement by signup date
- Engagement by region/profession
- Power users (top 10% by score)

**E. Connection Health**
- Average connection health score
- Weak connection rate
- Reconnection success rate

**Requirements:**
- [ ] Create admin-only route with auth guard
- [ ] Build data visualization with Recharts
- [ ] Add date range filters
- [ ] Export reports to CSV
- [ ] Real-time updates every 5 mins

---

### 2.4 In-App Nudge System

**UI Components:**

**A. Nudge Center (Bell Icon in Header)**
- Badge showing unread nudge count
- Dropdown panel with:
  - Recent nudges (last 7 days)
  - Quick action buttons
  - "View all" link to full page

**B. Nudge Card Component**
- Icon based on category (🔗 connection, 📝 content, 📅 event)
- Personalized message text
- Primary CTA button
- Dismiss option
- Timestamp

**C. Nudge Full Page**
- Route: `/app/nudges`
- Filter by category/priority
- Mark as read/unread
- Archive dismissed nudges
- Search nudges

**Requirements:**
- [ ] Create nudge UI components
- [ ] Add real-time subscription to new nudges
- [ ] Implement mark as read/dismissed
- [ ] Track which nudges drive action
- [ ] Add nudge preferences in user settings

---

### 2.5 Personalization Engine

**User Preferences Table:**
```sql
CREATE TABLE adin_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  nudge_frequency TEXT DEFAULT 'moderate', -- minimal, moderate, maximum
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  email_nudges_enabled BOOLEAN DEFAULT true,
  push_nudges_enabled BOOLEAN DEFAULT true,
  nudge_categories JSONB DEFAULT '["connection","content","event"]',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Settings UI:**
- Route: `/app/settings/notifications`
- Toggle nudge frequency
- Set quiet hours
- Choose which categories to receive
- Disable email/push per category

---

### Phase 2 Success Metrics
- [ ] 60%+ of "at risk" users return to active within 2 weeks of first nudge
- [ ] 40%+ of dormant users return within 1 month
- [ ] Nudge open rate >50%
- [ ] Nudge action rate >25%
- [ ] 30-day retention improves by 35%+
- [ ] Connection health score averages 70+/100
- [ ] Admin dashboard used 3+ times/week

---

## Implementation Order

Complete features sequentially. No jumping ahead. Check boxes as you go.

### Phase 1: Social Feed Completion
1. Repost/Share Feature
2. Likes UI Completion  
3. Bookmarks Feature

### Phase 2: ADIN System
1. Database schema + migrations
2. Engagement tracker edge function
3. Engagement reminders edge function
4. Connection health analyzer
5. Nudge UI components
6. Admin analytics dashboard
7. Personalization preferences

**Current Focus:** Phase 1.1 - Repost Feature

---

## Quality Gates

Before marking ANY feature complete, it must pass:
1. ✅ **Functional:** Works as specified in acceptance criteria
2. ✅ **Accessible:** Keyboard navigable, screen reader friendly
3. ✅ **Responsive:** Works on mobile, tablet, desktop
4. ✅ **Performant:** <3s load time, smooth interactions
5. ✅ **Secure:** RLS policies enforced, no data leaks
6. ✅ **Tested:** Manual testing on dev + staging

---

## Open Questions & Decisions Needed

- [ ] Should bookmarks support folders/collections? (Future v2)
- [ ] Email vs in-app nudge priority (start in-app only)
- [ ] Nudge frequency limits to avoid spam (max 1/day per user)
- [ ] Should we gamify engagement scores? (show to users?)
- [ ] Connection health score visibility (private or show to both parties?)

---

## Progress Tracking

**Phase 1 Progress:** 3/3 features complete ✅✅✅  
**Phase 2 Progress:** 0/7 systems complete  

**Overall Completion:** 🎉 **PHASE 1 COMPLETE!** Moving to Phase 2 🚀

---

## Mantras for This Build

1. **"Start narrow, go deep"** - Perfect one feature before moving to next
2. **"Data drives decisions"** - Every feature logs metrics
3. **"The platform nurtures, users engage"** - Proactive, not reactive
4. **"Ubuntu in code"** - Every line serves the community

---

**Next Action:** Review this PRD together, confirm scope, then begin Phase 1.1 (Repost Feature).

Let's build. Asante sana. 🌍✊🏿
