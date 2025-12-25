# DNA Platform - Master Product Requirements Document

**Version:** 1.0  
**Last Updated:** December 25, 2024  
**Status:** Active Development

---

## Executive Summary

DNA (Diaspora Network of Africa) is a platform built on the "Five C's" methodology: **CONNECT, CONVENE, COLLABORATE, CONTRIBUTE, and CONVEY**. The core differentiator is an interconnection layer where actions in one module trigger opportunities in others, powered by the African Diaspora Intelligence Network (ADIN).

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Current Feature Status](#4-current-feature-status)
5. [Database Schema](#5-database-schema)
6. [Build Plan](#6-build-plan)
7. [Phase Requirements](#7-phase-requirements)
8. [Design System](#8-design-system)
9. [Testing Requirements](#9-testing-requirements)
10. [Naming Conventions](#10-naming-conventions)

---

## 1. Platform Overview

### Vision
Connect the African diaspora through meaningful professional relationships, collaborative projects, cultural events, and impactful contributions back to the continent.

### The Five C's

| Pillar | Purpose | Core Features |
|--------|---------|---------------|
| **CONNECT** | Build professional relationships | Connections, messaging, people discovery, ADIN recommendations |
| **CONVENE** | Gather for events and experiences | Event creation, registration, check-ins, reminders |
| **COLLABORATE** | Work together on projects | Spaces, tasks, milestones, contribution needs |
| **CONTRIBUTE** | Give back to Africa | Contribution cards, offers, impact tracking |
| **CONVEY** | Share stories and knowledge | Posts, hashtags, mentions, reshares, media |

### ADIN (African Diaspora Intelligence Network)

ADIN is the intelligence layer powering the platform:
- **Geographic relevance scoring**: Matches users to regional opportunities
- **Live metrics aggregation**: Real-time counts per region
- **Cross-module data synthesis**: Pulls from all Five C's
- **Heritage mapping**: Links diaspora members to ancestral regions
- **Opportunity scoring**: Weights skill match, location, engagement history

**Design Principle**: Intelligence should feel like serendipity, not surveillance.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix primitives)
- **State Management**: Zustand, React Query (TanStack)
- **Animation**: Framer Motion
- **Routing**: React Router DOM v6

### Backend
- **Platform**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password, OAuth ready)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Edge Functions**: Deno runtime

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.49.9",
  "@tanstack/react-query": "^5.56.2",
  "framer-motion": "^12.23.26",
  "lucide-react": "^0.462.0",
  "zustand": "^5.0.6",
  "date-fns": "^4.1.0",
  "recharts": "^2.12.7",
  "zod": "^3.23.8"
}
```

---

## 3. Architecture

### Adaptive Dashboard Architecture (ADA)
Single-page application with 8 view states transforming a 3-column layout without traditional navigation.

### Project Structure
```
src/
├── components/           # UI components by feature
│   ├── admin/           # Admin dashboard components
│   ├── collaborate/     # Collaboration spaces
│   ├── connect/         # Connections & people
│   ├── contribute/      # Contributions & offers
│   ├── convene/         # Events system
│   ├── feed/            # Social feed & posts
│   ├── messaging/       # Direct messages
│   ├── notifications/   # Notification system
│   ├── profile/         # User profiles
│   ├── settings/        # Settings pages
│   └── ui/              # Reusable UI primitives
├── hooks/               # Custom React hooks
├── services/            # API service layers
├── stores/              # Zustand stores
├── pages/               # Route pages
├── integrations/        # Supabase client & types
└── lib/                 # Utilities
```

### Database Pattern
- All tables use UUID primary keys
- Row Level Security (RLS) on all tables
- Timestamps: `created_at`, `updated_at` with triggers
- Soft deletes where appropriate (`archived_at`, `deleted_at`)

---

## 4. Current Feature Status

### ✅ Fully Functional (100%)

| Feature | Components | Database |
|---------|------------|----------|
| Authentication | Login, signup, password reset | auth.users, profiles |
| User Profiles | Creation, editing, completion tracking | profiles, public_profiles view |
| Onboarding | Multi-step flow, 40% completion gate | profiles.onboarding_completed |
| Connections | Request, accept, reject, health tracking | connections, adin_nudges |
| Events (Convene) | Create, register, check-in, analytics | events, event_attendees, event_registrations |
| Collaboration Spaces | Create, manage, membership | collaboration_spaces, collaboration_memberships |
| Tasks & Milestones | CRUD, assignment, comments | space_tasks, task_milestones, task_comments |
| Social Feed | Posts with text/media, comments | posts, comments, post_comments |
| Hashtags Core | Create, link to posts, trending | hashtags, post_hashtags |
| Hashtag Ownership | Personal hashtags, approval flow | hashtags (is_personal, requires_approval), hashtag_usage_requests |
| Mentions | @username in posts, notifications | post_mentions |
| Reshares | Share posts, attribution | post_reshares |
| Notifications | In-app, preferences | notifications, adin_preferences |

### 🚧 Partially Implemented (50-90%)

| Feature | Status | Missing |
|---------|--------|---------|
| Messaging | 80% | Delete message, real-time polish, group conversations |
| Opportunities | 70% | Application review workflow, org profiles |
| Contribution Cards | 60% | Submit offer flow, impact tracking |
| ADIN Intelligence | 40% | Smart recommendations, match scoring |
| Regional Hubs | 30% | Live metrics, heritage matching |
| Admin Dashboard | 60% | Content moderation actions, analytics depth |

### 📋 Not Started (0%)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Block/Report User | HIGH | Medium |
| Video/Audio Intros | LOW | High |
| Calendar Integrations | MEDIUM | Medium |
| PWA Support | LOW | Medium |
| Push Notifications | LOW | High |

---

## 5. Database Schema

### Core Tables

#### profiles
```sql
id UUID PRIMARY KEY REFERENCES auth.users
username TEXT UNIQUE
full_name TEXT
avatar_url TEXT
bio TEXT
headline TEXT
location TEXT
country_of_origin TEXT
heritage_countries TEXT[]
skills TEXT[]
interests TEXT[]
impact_areas TEXT[]
is_public BOOLEAN DEFAULT true
onboarding_completed BOOLEAN DEFAULT false
profile_completion INTEGER DEFAULT 0
role TEXT DEFAULT 'user' -- user, moderator, admin
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### connections
```sql
id UUID PRIMARY KEY
requester_id UUID REFERENCES profiles
recipient_id UUID REFERENCES profiles
status TEXT -- pending, accepted, rejected
message TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### posts
```sql
id UUID PRIMARY KEY
author_id UUID REFERENCES profiles
content TEXT
media_urls TEXT[]
visibility TEXT DEFAULT 'public'
original_post_id UUID -- for reshares
is_reshare BOOLEAN DEFAULT false
reshare_count INTEGER DEFAULT 0
like_count INTEGER DEFAULT 0
comment_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### hashtags
```sql
id UUID PRIMARY KEY
tag TEXT UNIQUE NOT NULL
description TEXT
owner_id UUID REFERENCES profiles
is_personal BOOLEAN DEFAULT false
requires_approval BOOLEAN DEFAULT false
archived_at TIMESTAMPTZ
usage_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ
```

#### events
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
description TEXT
organizer_id UUID REFERENCES profiles
start_date TIMESTAMPTZ
end_date TIMESTAMPTZ
location TEXT
is_virtual BOOLEAN
meeting_url TEXT
max_attendees INTEGER
is_public BOOLEAN DEFAULT true
status TEXT DEFAULT 'draft'
created_at TIMESTAMPTZ
```

#### collaboration_spaces (spaces)
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
description TEXT
created_by UUID REFERENCES profiles
visibility TEXT DEFAULT 'public'
status TEXT DEFAULT 'active'
tags TEXT[]
image_url TEXT
created_at TIMESTAMPTZ
```

#### notifications
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles
type TEXT NOT NULL
title TEXT
message TEXT
data JSONB
read BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
```

### Key Relationships

```
profiles 1--* connections (requester_id, recipient_id)
profiles 1--* posts (author_id)
profiles 1--* events (organizer_id)
profiles 1--* collaboration_spaces (created_by)
posts *--* hashtags (via post_hashtags)
posts 1--* post_mentions
posts 1--* post_reshares
events 1--* event_attendees
collaboration_spaces 1--* collaboration_memberships
collaboration_spaces 1--* space_tasks
```

---

## 6. Build Plan

### Phase 1: Safety & Trust (Priority: CRITICAL)
**Effort**: 2-3 days  
**Goal**: Users can protect themselves and report abuse

1. **Block User Flow**
   - Block button on profile
   - blocked_users table integration
   - Hide blocked users from feeds, search, suggestions
   - Prevent messaging blocked users

2. **Report User/Content**
   - Report dialog with reason selection
   - content_flags table integration
   - Admin notification

3. **Delete Message**
   - Soft delete in messages table
   - UI confirmation dialog
   - Update conversation last_message

4. **Content Moderation Actions**
   - Admin review queue
   - Approve/reject/warn actions
   - User notification on action

### Phase 2: ADIN Intelligence (Priority: HIGH)
**Effort**: 3-4 days  
**Goal**: Smart recommendations feel magical

1. **Connection Recommendations**
   - Match scoring algorithm
   - Factors: skills, interests, heritage, mutual connections
   - "People you may know" component

2. **Regional Hub Metrics**
   - Live counts: members, events, projects per region
   - Aggregate queries with caching
   - Regional activity feed

3. **Heritage Matching**
   - Country-to-region mapping
   - Preference weighting
   - Personalized opportunity surfacing

4. **Opportunity Scoring**
   - Weighted factors algorithm
   - Score display on cards
   - "Why recommended" tooltip

### Phase 3: Contribute Flow (Priority: HIGH)
**Effort**: 2-3 days  
**Goal**: Complete contribution lifecycle

1. **Submit Offer**
   - Offer form with amount/description
   - contribution_offers table integration
   - Owner notification

2. **Contribution Tracking**
   - Status updates: pending → accepted → fulfilled
   - Progress visualization
   - Impact metrics

3. **Impact Attribution**
   - Link contributions to outcomes
   - Display on profile
   - Community impact dashboard

### Phase 4: Collaborate Enhancement (Priority: MEDIUM)
**Effort**: 2-3 days  
**Goal**: Spaces feel like real workspaces

1. **Space Board View**
   - Kanban-style task board
   - Drag-and-drop status changes
   - Filter by assignee, priority

2. **Task Dependencies**
   - Blocked by / blocks relationships
   - Visual dependency graph
   - Auto-status updates

3. **Member Invitations**
   - Invite by email/username
   - Role assignment
   - Pending invitations list

4. **Activity Feed**
   - Space-scoped activity log
   - Task updates, comments, milestones
   - Real-time via Supabase

### Phase 5: Convene Polish (Priority: MEDIUM)
**Effort**: 2-3 days  
**Goal**: Events are delightful to manage

1. **Featured Events**
   - Admin-curated featured flag
   - Featured events carousel
   - Category highlighting

2. **Event Reminders**
   - 24h and 1h before notifications
   - Edge function cron job
   - User preference respect

3. **Ticketing Basics**
   - Free vs paid ticket types
   - Quantity limits
   - Waitlist support

4. **Calendar Export**
   - ICS file generation
   - Add to Google/Outlook buttons
   - Recurring events support

### Phase 6: Mobile & Polish (Priority: LOW)
**Effort**: 2-3 days  
**Goal**: Mobile experience is first-class

1. **Mobile Navigation**
   - Bottom tab bar
   - Swipe gestures
   - Pull-to-refresh

2. **Filter Improvements**
   - Mobile-friendly filter sheets
   - Saved filter presets
   - Quick filter chips

3. **Profile Editing**
   - Full profile edit flow
   - Image cropping
   - Preview mode

4. **PWA Enhancements**
   - Service worker caching
   - Offline indicator
   - Install prompt

---

## 7. Phase Requirements

### Phase 1: Safety & Trust

#### 1.1 Block User

**User Story**: As a user, I want to block another user so they cannot contact me or see my content.

**Acceptance Criteria**:
- [ ] Block button visible on user profile (not own profile)
- [ ] Confirmation dialog before blocking
- [ ] Blocked user cannot send messages
- [ ] Blocked user hidden from feeds
- [ ] Blocked user hidden from search results
- [ ] Blocked user hidden from recommendations
- [ ] Can view and unblock from settings
- [ ] Bidirectional: blocker also hidden from blocked user's view

**Database**:
```sql
-- Table exists: blocked_users
-- Columns: id, blocker_id, blocked_id, reason, created_at
```

**Components**:
- `BlockUserButton.tsx` - Button with confirmation
- `BlockedUsersSettings.tsx` - List and unblock
- Update: feed queries, search queries, message queries

**Service Functions**:
```typescript
blockUser(blockedId: string, reason?: string): Promise<void>
unblockUser(blockedId: string): Promise<void>
getBlockedUsers(): Promise<BlockedUser[]>
isBlocked(userId: string): Promise<boolean>
```

#### 1.2 Report User/Content

**User Story**: As a user, I want to report inappropriate content or behavior.

**Acceptance Criteria**:
- [ ] Report button on posts, comments, profiles, events
- [ ] Reason selection (spam, harassment, hate speech, etc.)
- [ ] Optional description field
- [ ] Confirmation message after report
- [ ] Admin receives notification
- [ ] User can view their submitted reports

**Database**:
```sql
-- Table exists: content_flags
-- Columns: id, content_id, content_type, flagged_by, reason, 
--          moderator_notes, resolved_at, resolved_by, created_at
```

**Components**:
- `ReportDialog.tsx` - Universal report modal
- `ReportButton.tsx` - Trigger button
- `MyReportsSettings.tsx` - View submitted reports

#### 1.3 Delete Message

**User Story**: As a user, I want to delete a message I sent.

**Acceptance Criteria**:
- [ ] Delete option on own messages only
- [ ] Confirmation dialog
- [ ] Message marked as deleted (soft delete)
- [ ] Shows "Message deleted" placeholder
- [ ] Updates conversation preview if last message

**Components**:
- Update `MessageBubble.tsx` with delete action
- `DeleteMessageDialog.tsx` - Confirmation

#### 1.4 Content Moderation Actions

**User Story**: As an admin, I want to review and act on reported content.

**Acceptance Criteria**:
- [ ] Admin moderation queue page
- [ ] Filter by content type, status
- [ ] Actions: approve, remove, warn user
- [ ] Bulk actions support
- [ ] User notified of action taken

**Components**:
- `ModerationQueue.tsx` - List of reports
- `ModerationActions.tsx` - Action buttons
- Update admin dashboard navigation

---

### Phase 2: ADIN Intelligence

#### 2.1 Connection Recommendations

**User Story**: As a user, I want to discover relevant people to connect with.

**Acceptance Criteria**:
- [ ] "People you may know" section on Connect page
- [ ] Relevance score based on:
  - Shared skills (weight: 0.25)
  - Shared interests (weight: 0.25)
  - Same heritage country (weight: 0.2)
  - Mutual connections (weight: 0.2)
  - Same region (weight: 0.1)
- [ ] Exclude: existing connections, pending requests, blocked
- [ ] "Why recommended" tooltip
- [ ] Dismiss recommendation option

**Database Function**:
```sql
CREATE OR REPLACE FUNCTION get_connection_recommendations(
  p_user_id UUID,
  p_limit INT DEFAULT 10
) RETURNS TABLE (
  user_id UUID,
  match_score NUMERIC,
  shared_skills TEXT[],
  shared_interests TEXT[],
  mutual_connection_count INT,
  heritage_match BOOLEAN
)
```

**Components**:
- `ConnectionRecommendations.tsx` - Recommendation list
- `RecommendationCard.tsx` - Individual card with score
- `WhyRecommended.tsx` - Tooltip explanation

#### 2.2 Regional Hub Metrics

**User Story**: As a user, I want to see live activity in regions I care about.

**Acceptance Criteria**:
- [ ] Regional hub pages show live metrics
- [ ] Metrics: member count, active events, ongoing projects
- [ ] Refresh on demand
- [ ] Cache for 5 minutes

**Database Function**:
```sql
CREATE OR REPLACE FUNCTION get_region_metrics(p_region_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'member_count', (SELECT COUNT(*) FROM profiles WHERE ...),
    'event_count', (SELECT COUNT(*) FROM events WHERE ...),
    'project_count', (SELECT COUNT(*) FROM collaboration_spaces WHERE ...),
    'opportunity_count', (SELECT COUNT(*) FROM opportunities WHERE ...)
  )
$$ LANGUAGE sql;
```

**Components**:
- `RegionalMetrics.tsx` - Metrics display
- `useRegionalMetrics.ts` - Data fetching hook

#### 2.3 Heritage Matching

**User Story**: As a user, I want opportunities relevant to my heritage.

**Acceptance Criteria**:
- [ ] Profile includes heritage_countries array
- [ ] Map heritage to regions
- [ ] Weight heritage in opportunity scoring
- [ ] "Based on your heritage" section

**Components**:
- Update `ProfileForm.tsx` with heritage selector
- `HeritageOpportunities.tsx` - Filtered opportunities

---

### Phase 3: Contribute Flow

#### 3.1 Submit Offer

**User Story**: As a user, I want to offer my skills/money to a contribution need.

**Acceptance Criteria**:
- [ ] "Offer to Help" button on contribution cards
- [ ] Form: message, amount (if financial), skills offered
- [ ] Submit creates contribution_offers record
- [ ] Owner notified
- [ ] User sees pending offers in profile

**Components**:
- `SubmitOfferDialog.tsx` - Offer form
- `MyOffers.tsx` - User's submitted offers
- `OfferManagement.tsx` - Owner's received offers

#### 3.2 Contribution Tracking

**User Story**: As an owner, I want to track contribution progress.

**Acceptance Criteria**:
- [ ] Status flow: pending → accepted → in_progress → fulfilled
- [ ] Progress percentage on cards
- [ ] Activity log per contribution
- [ ] Milestone support

**Components**:
- `ContributionProgress.tsx` - Progress bar
- `ContributionTimeline.tsx` - Activity log

---

## 8. Design System

### Brand Colors (HSL)
```css
--forest-green: 150 36% 13%;      /* #1a472a - Primary */
--emerald: 150 32% 27%;           /* #2d5a3d - Secondary */
--copper: 28 53% 46%;             /* #b87333 - Accent */
--gold: 45 63% 52%;               /* #d4af37 - Highlight */
```

### Semantic Tokens
```css
--background: 0 0% 100%;
--foreground: 150 36% 13%;
--primary: 150 36% 13%;
--primary-foreground: 0 0% 100%;
--secondary: 150 32% 27%;
--accent: 28 53% 46%;
--muted: 150 10% 96%;
--muted-foreground: 150 10% 40%;
```

### Typography
- **UI**: Inter (system default via Tailwind)
- **Heritage Moments**: Lora (serif, for headers, quotes)

### Pattern Library
- Kente-inspired geometric patterns
- Mud Cloth textures
- Ndebele geometric accents

### Component Principles
1. Use semantic tokens, never direct colors
2. All colors in HSL format
3. Mobile-first responsive
4. Framer Motion for animations
5. Accessible (WCAG AA)

---

## 9. Testing Requirements

### Manual Testing Checklist

For each feature:
- [ ] Happy path works
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Empty states displayed
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] No console errors

### Database Testing

After migrations:
```sql
-- Verify table exists
SELECT * FROM information_schema.tables WHERE table_name = 'table_name';

-- Verify columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'table_name';

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'table_name';
```

### Integration Points

Test cross-module triggers:
- [ ] New connection → ADIN recommendation update
- [ ] Event registration → notification created
- [ ] Post with hashtag → hashtag usage updated
- [ ] Contribution offer → owner notified

---

## 10. Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `ConnectionCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useConnections.ts`)
- Services: `camelCase.ts` suffixed with `Service` (e.g., `connectionService.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)

### Database
- Tables: `snake_case` (e.g., `user_profiles`)
- Columns: `snake_case` (e.g., `created_at`)
- Functions: `snake_case` (e.g., `get_user_connections`)

### TypeScript
- Interfaces: `PascalCase` (e.g., `Profile`, `EventData`)
- Types: `PascalCase` (e.g., `ConnectionStatus`)
- Enums: `PascalCase` with `UPPER_CASE` values

### CSS/Tailwind
- Custom classes: `kebab-case` (e.g., `heritage-pattern`)
- CSS variables: `--kebab-case` (e.g., `--primary-foreground`)

---

## Appendix A: Quick Reference Commands

### Supabase CLI
```bash
# Generate types
supabase gen types typescript --project-id PROJECT_ID > src/integrations/supabase/types.ts

# Run migration
supabase db push

# Reset database
supabase db reset
```

### Development
```bash
# Start dev server
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

---

## Appendix B: Key File Locations

| Purpose | Path |
|---------|------|
| Supabase Client | `src/integrations/supabase/client.ts` |
| Database Types | `src/integrations/supabase/types.ts` |
| Design Tokens | `src/index.css` |
| Tailwind Config | `tailwind.config.ts` |
| App Routes | `src/App.tsx` |
| Global Store | `src/stores/` |

---

## Appendix C: Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

---

*This PRD is the source of truth for DNA Platform development. Update this document as features are completed or requirements change.*
