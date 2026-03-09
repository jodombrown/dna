# DNA Platform — Complete Codebase Audit & Rebuild Handoff Document

**Generated:** March 9, 2026  
**Purpose:** Claude Code handoff for DNA platform rebuild  
**Platform:** Diaspora Network of Africa (DNA)

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Core Systems Inventory](#5-core-systems-inventory)
6. [The Five C's Module Breakdown](#6-the-five-cs-module-breakdown)
7. [Database Schema Overview](#7-database-schema-overview)
8. [Edge Functions Catalog](#8-edge-functions-catalog)
9. [Build Order History](#9-build-order-history)
10. [Technical Debt & Known Issues](#10-technical-debt--known-issues)
11. [Recommended Rebuild Strategy](#11-recommended-rebuild-strategy)
12. [Critical Learnings](#12-critical-learnings)

---

# 1. EXECUTIVE SUMMARY

## Platform Metrics (March 2026)

| Metric | Count |
|--------|-------|
| Total Routes | ~120+ |
| Total Components | 500+ |
| Total Hooks | 115+ |
| Total Services | 50+ |
| Database Tables | 330+ |
| Edge Functions | 42 |
| TypeScript Files | ~1,200 |
| Lines of Code | ~200,000 |

## Module Completion Status

| Module | Completion | Key Features |
|--------|------------|--------------|
| **CONNECT** | 85% | Profiles, connections, discovery, introductions |
| **CONVENE** | 80% | Events, RSVP, check-in, organizer tools |
| **COLLABORATE** | 70% | Spaces, tasks, boards, milestones |
| **CONTRIBUTE** | 60% | Needs/offers marketplace, matching |
| **CONVEY** | 75% | Stories, posts, feed, engagement |
| **DIA** | 70% | AI search, nudges, recommendations |

---

# 2. ARCHITECTURE OVERVIEW

## Design Philosophy

DNA follows the **Five C's Methodology** — an integrated value circulation system where each module feeds the others:

```
CONNECT → CONVENE → COLLABORATE → CONTRIBUTE → CONVEY → CONNECT (cycle)
```

## Key Architectural Patterns

### 2.1 Adaptive Dashboard Architecture (ADA)
- 8 view states: FEED, HUB, DETAIL, COMPOSE, CHAT, PROFILE, SETTINGS, SEARCH
- View-state-driven layout transformations (push/pop navigation stack)
- Three-column responsive layout (sidebar/main/detail)

### 2.2 Universal Composer
- Single "Create" interface that transforms based on intent
- Modes: Post, Story, Event, Space, Opportunity
- Mobile drawer, desktop modal patterns

### 2.3 DIA (Diaspora Intelligence Agent)
- Intelligence layer woven through all Five C's
- External search (Perplexity API) + internal analytics
- Proactive nudges, recommendations, matching

### 2.4 Type Augmentation Layer
- `src/types/database.types.augmentation.ts` extends Supabase types
- `src/lib/typedSupabase.ts` singleton wrapper
- Handles provisional tables and missing schema fields

---

# 3. TECHNOLOGY STACK

## Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.3.1 | UI framework |
| TypeScript | ^5.5.3 | Type safety |
| Vite | ^5.4.1 | Build tool |
| Tailwind CSS | ^3.4.11 | Styling |
| Framer Motion | ^12.23.26 | Animations |
| React Query | ^5.56.2 | Server state |
| Zustand | ^5.0.6 | Client state |
| React Router DOM | ^7.13.0 | Routing |
| React Hook Form | ^7.53.0 | Forms |
| Zod | ^3.23.8 | Validation |

## UI Components
| Library | Purpose |
|---------|---------|
| shadcn/ui | Component primitives |
| Radix UI | Accessible primitives |
| Lucide React | Icons |
| Sonner | Toast notifications |
| Vaul | Mobile drawers |
| cmdk | Command palette |

## Backend (Supabase)
| Service | Purpose |
|---------|---------|
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Supabase Storage | File storage |
| Edge Functions (Deno) | Serverless logic |
| Row Level Security | Data access control |

## External APIs
| API | Purpose |
|-----|---------|
| Perplexity | DIA AI search |
| OpenAI | Intent analysis |
| Stripe | Payments |
| Resend | Email delivery |

---

# 4. DIRECTORY STRUCTURE

```
src/
├── App.tsx                    # Main app with all routes
├── main.tsx                   # Entry point
├── index.css                  # Global styles + CSS variables
│
├── components/                # UI Components (~500 files)
│   ├── _archived/             # Deprecated components
│   ├── admin/                 # Admin dashboard
│   ├── auth/                  # Auth guards, onboarding
│   ├── collaborate/           # COLLABORATE module
│   ├── composer/              # Universal composer
│   ├── connect/               # CONNECT module
│   ├── contribute/            # CONTRIBUTE module
│   ├── convene/               # CONVENE module
│   ├── convey/                # CONVEY module
│   ├── dia/                   # DIA intelligence UI
│   ├── feed/                  # Feed components
│   ├── hubs/                  # Hub page patterns
│   ├── layout/                # Layout components
│   ├── messaging/             # Chat/messages
│   ├── navigation/            # Nav components
│   ├── notifications/         # Notification UI
│   ├── profile/               # Profile components
│   ├── profile-v2/            # Profile V2 redesign
│   ├── settings/              # Settings UI
│   ├── shared/                # Reusable components
│   ├── spaces/                # Space detail components
│   └── ui/                    # shadcn primitives
│
├── contexts/                  # React contexts
│   ├── AuthContext.tsx        # Auth state + user profile
│   ├── ViewStateContext.tsx   # ADA navigation state
│   ├── MessageContext.tsx     # Messaging state
│   └── DashboardContext.tsx   # Dashboard preferences
│
├── hooks/                     # Custom hooks (~115 files)
│   ├── convene/               # Event-specific hooks
│   ├── useAuth hooks          # Auth utilities
│   ├── useCollaborate.ts      # Space operations
│   ├── useConvene*.ts         # Event operations
│   ├── useConvey*.ts          # Content operations
│   ├── useFeed*.ts            # Feed logic
│   └── useProfile*.ts         # Profile operations
│
├── layouts/                   # Page layouts
│   ├── BaseLayout.tsx         # App shell + nav
│   ├── ThreeColumnLayout.tsx  # Hub pattern
│   ├── TwoColumnLayout.tsx    # Content + sidebar
│   ├── DetailViewLayout.tsx   # Detail pages
│   └── FullCanvasLayout.tsx   # Full-width pages
│
├── lib/                       # Utilities & config
│   ├── config.ts              # Centralized config
│   ├── queryClient.ts         # React Query setup
│   ├── logger.ts              # Error logging
│   ├── typedSupabase.ts       # Typed Supabase client
│   └── utils.ts               # General utilities
│
├── pages/                     # Route pages (~80 files)
│   ├── _archived/             # Legacy pages
│   ├── admin/                 # Admin routes
│   ├── africa/                # Regional hubs
│   ├── dna/                   # Main app routes
│   │   ├── connect/           # CONNECT pages
│   │   ├── convene/           # CONVENE pages
│   │   ├── collaborate/       # COLLABORATE pages
│   │   ├── contribute/        # CONTRIBUTE pages
│   │   ├── convey/            # CONVEY pages
│   │   └── settings/          # Settings pages
│   └── documentation/         # Docs pages
│
├── services/                  # Business logic (~50 files)
│   ├── dia/                   # DIA intelligence services
│   │   ├── connectCards.ts    # CONNECT recommendations
│   │   ├── conveneCards.ts    # CONVENE recommendations
│   │   ├── collaborateCards.ts# COLLABORATE recommendations
│   │   ├── contributeCards.ts # CONTRIBUTE recommendations
│   │   ├── conveyCards.ts     # CONVEY recommendations
│   │   ├── matchingEngine.ts  # People matching
│   │   ├── nudgeEngine.ts     # Nudge generation
│   │   └── diaChat.ts         # AI chat interface
│   ├── eventsService.ts       # Event CRUD
│   ├── feedService.ts         # Feed operations
│   ├── postsService.ts        # Post operations
│   ├── profilesService.ts     # Profile operations
│   └── connectionService.ts   # Connection operations
│
├── types/                     # TypeScript types (~40 files)
│   ├── dia.ts                 # DIA types
│   ├── diaEngine.ts           # DIA engine types
│   ├── eventTypes.ts          # Event types
│   ├── spaceTypes.ts          # Space types
│   └── database.types.augmentation.ts  # Schema extensions
│
└── integrations/
    └── supabase/
        ├── client.ts          # Supabase client
        └── types.ts           # Auto-generated types (READ-ONLY)
```

---

# 5. CORE SYSTEMS INVENTORY

## 5.1 Authentication System
**Location:** `src/contexts/AuthContext.tsx`

- Email/password authentication
- Session management via Supabase
- Profile auto-fetch on auth state change
- Protected routes via `OnboardingGuard`

**Key Methods:**
- `signUp()` - New user registration
- `signIn()` - Email/password login
- `signOut()` - Session termination
- `refreshProfile()` - Profile refetch

## 5.2 Navigation System
**Location:** `src/contexts/ViewStateContext.tsx`

ADA View States:
```typescript
type ViewState = 
  | 'FEED' 
  | 'HUB' 
  | 'DETAIL' 
  | 'COMPOSE' 
  | 'CHAT' 
  | 'PROFILE' 
  | 'SETTINGS' 
  | 'SEARCH';
```

## 5.3 Feed System
**Location:** `src/services/feedService.ts`, `src/hooks/useFeed*.ts`

- Universal feed combining posts, stories, events
- DIA card injection (every 5-6 items)
- Real-time updates via Supabase subscriptions
- Feed scoring and personalization

## 5.4 Messaging System
**Location:** `src/services/messageService.ts`, `src/contexts/MessageContext.tsx`

- 1:1 conversations (working)
- Group conversations (schema ready, not wired)
- Real-time via Supabase subscriptions
- Tables: `conversations`, `conversation_participants`, `messages`

## 5.5 Notification System
**Location:** `src/services/notificationSystemService.ts`

- In-app notifications
- Email notifications (via Resend)
- Push notification schema (not fully implemented)
- Badge counts for nav items

---

# 6. THE FIVE C'S MODULE BREAKDOWN

## 6.1 CONNECT (85% Complete)

### Purpose
Professional networking for 200M+ diaspora

### Key Components
```
src/components/connect/
├── ConnectLayout.tsx          # Hub layout
├── ConnectionCard.tsx         # User cards
├── ProfessionalCard.tsx       # Professional preview
├── ConnectionRequestModal.tsx # Request flow
├── IntroductionModal.tsx      # Smart intros
├── MemberCard.tsx             # Member display
└── hub/                       # Hub-specific
```

### Key Pages
```
src/pages/dna/connect/
├── Connect.tsx                # Hub entry
├── Discover.tsx               # Discovery feed
└── Network.tsx                # My network
```

### Key Hooks
- `useConnectionStatus` - Connection state
- `useConnectFiltering` - Filter logic
- `useMutualConnections` - Mutual friends

### Database Tables
- `profiles` - User profiles
- `connections` - Relationship graph
- `blocked_users` - Block list
- `adin_recommendations` - DIA suggestions

---

## 6.2 CONVENE (80% Complete)

### Purpose
Event discovery, hosting, and management

### Key Components
```
src/components/convene/
├── ConveneEventCard.tsx       # Event cards
├── EventCalendarView.tsx      # Calendar
├── EventFormFields.tsx        # Event creation
├── EventOrganizerCard.tsx     # Organizer info
├── MutualAttendeesLine.tsx    # Social proof
├── AddToCalendarButton.tsx    # Calendar export
├── StickyRSVPBar.tsx          # Mobile RSVP
└── management/                # Organizer console
    ├── EventManagementLayout.tsx
    ├── AttendeeManagement.tsx
    ├── CheckInDashboard.tsx
    ├── CommunicationsHub.tsx
    └── AnalyticsDashboard.tsx
```

### Key Pages
```
src/pages/dna/convene/
├── ConveneHub.tsx             # Hub entry
├── EventsIndex.tsx            # Browse events
├── EventDetail.tsx            # Event detail
├── MyEvents.tsx               # My events
├── EventAnalytics.tsx         # Event stats
├── OrganizerAnalytics.tsx     # Organizer stats
└── EventCheckIn.tsx           # Check-in page
```

### Database Tables
- `events` - Event data
- `event_registrations` - RSVPs
- `event_check_ins` - Check-in records
- `event_analytics` - Event metrics
- `event_threads` - Event discussions

---

## 6.3 COLLABORATE (70% Complete)

### Purpose
Project spaces with task management

### Key Components
```
src/components/collaborate/
├── SpaceDirectory.tsx         # Space listing
├── SpaceCreationWizard.tsx    # Create space
├── TaskBoard.tsx              # Kanban board
├── TaskCard.tsx               # Task cards
├── TaskColumn.tsx             # Board columns
├── TaskDetailDrawer.tsx       # Task details
├── ActivityFeed.tsx           # Space activity
└── ContributorRanking.tsx     # Leaderboard
```

### Key Pages
```
src/pages/dna/collaborate/
├── CollaborateHub.tsx         # Hub entry
├── SpacesIndex.tsx            # Browse spaces
├── SpaceDetail.tsx            # Space view
├── SpaceBoard.tsx             # Kanban view
├── CreateSpace.tsx            # Create space
├── SpaceSettings.tsx          # Space config
└── MySpaces.tsx               # My spaces
```

### Database Tables
- `spaces` - Space metadata
- `space_members` - Membership
- `space_tasks` - Tasks
- `space_milestones` - Milestones
- `task_comments` - Task discussions
- `space_channels` - Discussion channels

---

## 6.4 CONTRIBUTE (60% Complete)

### Purpose
Needs/offers marketplace for diaspora contribution

### Key Components
```
src/components/contribute/
├── ImpactDashboard.tsx        # Impact overview
├── NeedFormDialog.tsx         # Create need
├── OfferFormDialog.tsx        # Create offer
├── FulfillmentModal.tsx       # Match flow
├── PathwayGrid.tsx            # Impact pathways
├── SpaceNeedsSection.tsx      # Space needs
└── OpportunityRecommendations.tsx
```

### Key Pages
```
src/pages/dna/contribute/
├── ContributeHub.tsx          # Hub entry
├── NeedsIndex.tsx             # Browse needs
├── NeedDetail.tsx             # Need detail
├── OpportunityDetail.tsx      # Opportunity detail
└── MyContributions.tsx        # My activity
```

### Database Tables
- `contribution_needs` - Needs posted
- `contribution_offers` - Offers made
- `opportunities` - Job/grant listings
- `applications` - Job applications
- `contribution_cards` - Contribution tracking

---

## 6.5 CONVEY (75% Complete)

### Purpose
Content publishing and storytelling

### Key Components
```
src/components/convey/
├── ConveyStoryCard.tsx        # Story cards
├── ConveyFeedCard.tsx         # Feed items
├── RichTextEditor.tsx         # Content editor
├── CoverImageEditor.tsx       # Image cropping
├── StoryTagsInput.tsx         # Tag input
└── editor/                    # Editor components
```

### Key Pages
```
src/pages/dna/convey/
├── ConveyHub.tsx              # Hub entry
├── StoryDetail.tsx            # Story view
└── CreateStory.tsx            # Story editor
```

### Database Tables
- `posts` - All content (post_type: 'post', 'story')
- `post_comments` - Comments
- `post_likes` - Reactions
- `post_shares` - Shares
- `post_views` - View tracking

---

# 7. DATABASE SCHEMA OVERVIEW

## Core Tables by Module

### Authentication & Users
- `profiles` - User profiles (primary user data)
- `user_roles` - Role assignments (admin, moderator, user)
- `beta_waitlist` - Waitlist signups

### CONNECT
- `connections` - Bidirectional relationships
- `blocked_users` - Block list
- `adin_recommendations` - DIA recommendations
- `adin_nudges` - DIA nudges

### CONVENE
- `events` - Event data
- `event_registrations` - RSVPs
- `event_check_ins` - Check-in records
- `event_analytics` - Event metrics
- `community_events` - Community-hosted events
- `groups` - Event groups/calendars

### COLLABORATE
- `spaces` / `collaboration_spaces` - Project spaces
- `space_members` / `collaboration_memberships` - Members
- `space_tasks` - Kanban tasks
- `space_milestones` - Milestones
- `task_comments` - Task discussions

### CONTRIBUTE
- `contribution_needs` - Needs marketplace
- `contribution_offers` - Offers made
- `opportunities` - Job/grant listings
- `applications` - Applications

### CONVEY
- `posts` - Posts and stories
- `post_comments` / `comments` - Comments
- `post_likes` - Likes
- `post_shares` - Shares
- `hashtags` - Hashtag definitions
- `post_hashtags` - Post-hashtag links

### Messaging
- `conversations` - 1:1 conversations
- `conversations_new` - New conversation model
- `conversation_participants` - Group members
- `messages` - Message content

### DIA Intelligence
- `adin_signals` - Intelligence signals
- `adin_recommendations` - Recommendations
- `adin_nudges` - Nudges
- `adin_preferences` - User preferences

### Geography
- `continents` - Continental data
- `regions` - Regional data (e.g., West Africa)
- `countries` - Country profiles

---

# 8. EDGE FUNCTIONS CATALOG

## Communication Functions
| Function | Purpose |
|----------|---------|
| `send-welcome-email` | New user welcome |
| `send-notification-email` | Notification emails |
| `send-event-reminders` | Event reminder emails |
| `send-event-blasts` | Event broadcasts |
| `send-magic-link` | Magic link auth |
| `send-password-reset` | Password reset |
| `send-newsletter` | Newsletter delivery |
| `send-push-notification` | Push notifications |
| `send-universal-email` | Generic email sender |
| `send-contact-email` | Contact form |

## Event Functions
| Function | Purpose |
|----------|---------|
| `create-event` | Event creation |
| `update-event` | Event updates |
| `curate-diaspora-events` | Event curation |
| `get-event-recommendations` | DIA event matching |

## Intelligence Functions
| Function | Purpose |
|----------|---------|
| `dia-search` | DIA AI search (Perplexity) |
| `ai-search` | General AI search |
| `adin-hub-intelligence` | Hub intelligence |
| `adin-nightly-health` | Nightly health check |
| `connection-health-analyzer` | Connection health |
| `generate-connect-nudges` | CONNECT nudges |
| `generate-opportunity-nudges` | CONTRIBUTE nudges |
| `process-automated-nudges` | Nudge processing |
| `trigger-adin-prompt` | DIA prompt trigger |

## Engagement Functions
| Function | Purpose |
|----------|---------|
| `engagement-reminders` | Re-engagement emails |
| `engagement-tracker` | Track engagement |

## Utility Functions
| Function | Purpose |
|----------|---------|
| `global-search` | Platform-wide search |
| `link-preview` | URL preview generation |
| `oembed-proxy` | Embed proxy |
| `suggest-usernames` | Username suggestions |
| `transcribe-voice` | Voice transcription |
| `generate-sitemap` | SEO sitemap |

## Payment Functions
| Function | Purpose |
|----------|---------|
| `create-payment` | Stripe payment creation |
| `verify-payment` | Payment verification |
| `stripe-webhook` | Stripe webhooks |

## Admin Functions
| Function | Purpose |
|----------|---------|
| `handle-beta-approval` | Beta waitlist approval |
| `seed-test-accounts` | Test data seeding |
| `delete-account` | Account deletion |
| `auto-archive-releases` | Release archival |

---

# 9. BUILD ORDER HISTORY

## Phase 1: Foundation (Months 1-2)
**What was built first:**

1. **Project scaffolding**
   - Vite + React + TypeScript setup
   - Tailwind CSS configuration
   - shadcn/ui component installation
   - Supabase project connection

2. **Authentication system**
   - AuthContext implementation
   - Login/signup pages
   - Password reset flow
   - Session management

3. **Profile system**
   - Profiles table schema
   - Basic profile CRUD
   - Avatar upload
   - Username system

4. **Basic routing**
   - React Router setup
   - Public vs protected routes
   - Basic navigation

---

## Phase 2: Core Modules (Months 3-5)

5. **Connection system** (CONNECT v1)
   - Connections table
   - Request/accept flow
   - Connection list
   - Basic discovery

6. **Feed system** (CONVEY v1)
   - Posts table
   - Post creation
   - Feed display
   - Basic engagement (likes)

7. **Event system** (CONVENE v1)
   - Events table
   - Event creation form
   - Event listing
   - Basic RSVP

8. **Messaging** (CONNECT messaging)
   - Conversations table
   - Messages table
   - 1:1 chat UI
   - Real-time subscriptions

---

## Phase 3: Module Expansion (Months 6-8)

9. **Collaboration spaces** (COLLABORATE v1)
   - Spaces tables
   - Space creation
   - Membership system
   - Basic task management

10. **Stories** (CONVEY v2)
    - Post types expansion
    - Rich text editor
    - Cover images
    - Story detail pages

11. **Event management** (CONVENE v2)
    - Check-in system
    - Organizer dashboard
    - Event analytics
    - Registration forms

12. **Contribution marketplace** (CONTRIBUTE v1)
    - Needs/offers tables
    - Need creation flow
    - Offer matching
    - Basic fulfillment

---

## Phase 4: Intelligence Layer (Months 9-11)

13. **DIA foundation**
    - DIA service architecture
    - Profile intelligence
    - Network intelligence
    - Matching engine

14. **Nudge system**
    - Nudge tables
    - Nudge generation
    - Nudge delivery
    - Dismissal tracking

15. **DIA cards**
    - Per-hub card generators
    - Feed card injection
    - Discovery cards
    - Cross-C recommendations

16. **AI search integration**
    - Perplexity API integration
    - DIA chat interface
    - Intent detection
    - Contextual search

---

## Phase 5: Polish & Scale (Months 12-14)

17. **ADA architecture**
    - View state system
    - Layout transformations
    - Navigation stack
    - Mobile optimization

18. **Universal composer**
    - Unified creation interface
    - Mode switching
    - Media upload
    - Draft saving

19. **Notification system v2**
    - Unified notification service
    - Email templates
    - In-app notifications
    - Badge counts

20. **Admin dashboard**
    - Platform health
    - User management
    - Content moderation
    - Analytics

---

# 10. TECHNICAL DEBT & KNOWN ISSUES

## Critical Issues

### 1. TypeScript `any` Types
- **Count:** ~3,600 instances across 247 files
- **Impact:** Type safety compromised
- **Recommendation:** Systematic type augmentation

### 2. Console.log Statements
- **Count:** 400+ statements
- **Impact:** Performance, security
- **Recommendation:** Replace with logger utility

### 3. Hardcoded URLs
- **Count:** 40+ instances
- **Impact:** Environment portability
- **Recommendation:** Use `src/lib/config.ts`

### 4. Vaul Drawer Version Mismatch
- **Issue:** Using Drawer.Handle from v1.0+ on v0.9.3
- **Impact:** Mobile composer crashes
- **Resolution:** Fixed with custom handle element

## High Priority

### 5. Duplicate Components
- Multiple spinner implementations
- Multiple country selectors
- Multiple button variants
- **Recommendation:** Consolidate to shared/

### 6. Orphaned Components
- 75+ orphaned profile components
- 35+ orphaned messaging components
- **Recommendation:** Archive or delete

### 7. Oversized Files
- 13 files over 700 lines
- `App.tsx` at 794 lines
- **Recommendation:** Extract routes to separate files

### 8. Legacy Code
- `_archived/` directories contain deprecated code
- Some legacy pages still imported
- **Recommendation:** Full cleanup pass

## Medium Priority

### 9. Inconsistent Naming
- "Assistant" vs "Agent" for DIA
- Mixed naming conventions in services
- **Recommendation:** Naming audit

### 10. RLS Policy Gaps
- Some tables missing RLS
- Admin checks need verification
- **Recommendation:** Security audit

---

# 11. RECOMMENDED REBUILD STRATEGY

## Strategy: Modular Rebuild with Parallel Tracks

### Track 1: Foundation (Week 1-2)
1. Project scaffolding (Vite + React + TS)
2. Design system setup (Tailwind + shadcn)
3. Supabase connection
4. Auth system (COMPLETE before anything else)
5. Profile system (basic)
6. Base routing

### Track 2: Core Infrastructure (Week 3-4)
1. Layout system (ThreeColumn, TwoColumn, etc.)
2. Navigation system (ADA view states)
3. Universal composer (core only)
4. Feed system (basic)

### Track 3: CONNECT Module (Week 5-6)
1. Profiles (full implementation)
2. Connections (request/accept)
3. Discovery (search/filter)
4. Introductions (DIA-powered)

### Track 4: CONVENE Module (Week 7-8)
1. Events (CRUD)
2. Registration (RSVP)
3. Check-in system
4. Organizer tools

### Track 5: COLLABORATE Module (Week 9-10)
1. Spaces (CRUD)
2. Membership system
3. Task board (Kanban)
4. Activity feed

### Track 6: CONTRIBUTE Module (Week 11-12)
1. Needs marketplace
2. Offers system
3. Matching logic
4. Fulfillment flow

### Track 7: CONVEY Module (Week 13-14)
1. Posts (basic)
2. Stories (long-form)
3. Rich text editor
4. Engagement (likes, comments, shares)

### Track 8: Intelligence (Week 15-17)
1. DIA foundation services
2. Matching engine
3. Nudge system
4. AI search integration

### Track 9: Polish (Week 18-20)
1. Notification system
2. Admin dashboard
3. Mobile optimization
4. Performance tuning

---

## Critical Dependencies (Build in This Order)

```
1. Auth → 2. Profiles → 3. Layouts → 4. Navigation
     ↓
5. Feed → 6. Posts → 7. Comments/Likes
     ↓
8. Connections → 9. Discovery → 10. Messaging
     ↓
11. Events → 12. Spaces → 13. Tasks
     ↓
14. Needs/Offers → 15. Stories
     ↓
16. DIA Services → 17. Nudges → 18. AI Search
     ↓
19. Notifications → 20. Admin
```

---

# 12. CRITICAL LEARNINGS

## What Worked Well

1. **Five C's Framework** - Clear mental model for features
2. **shadcn/ui** - Rapid UI development with consistency
3. **Supabase** - RLS + real-time + auth in one platform
4. **React Query** - Server state management simplified
5. **Type augmentation pattern** - Bridged schema gaps elegantly

## What to Do Differently

1. **Start with strict TypeScript** - No `any` from day one
2. **Design system first** - Define tokens before components
3. **Mobile-first layouts** - Don't retrofit responsive
4. **Single source of truth** - One location for each entity type
5. **Smaller components** - 200 lines max
6. **Feature flags** - Built-in from the start
7. **Testing infrastructure** - Vitest from day one

## Architecture Recommendations

1. **Route code splitting** - Extract routes from App.tsx
2. **Service layer** - Strict separation from components
3. **Hook organization** - One hook per concern
4. **State management** - Clear boundaries (server vs client)
5. **Error boundaries** - Per-route, not just global

## Database Design Recommendations

1. **Consistent naming** - `snake_case` everywhere
2. **Soft deletes** - `deleted_at` timestamps
3. **Audit columns** - `created_by`, `updated_by`
4. **RLS from start** - Never add tables without policies
5. **Indexes** - Plan for query patterns early

---

# APPENDIX A: Key File Locations Quick Reference

| System | Key File |
|--------|----------|
| Auth | `src/contexts/AuthContext.tsx` |
| Navigation | `src/contexts/ViewStateContext.tsx` |
| Routing | `src/App.tsx` |
| Config | `src/lib/config.ts` |
| Supabase Client | `src/integrations/supabase/client.ts` |
| Types | `src/types/` |
| DIA Services | `src/services/dia/` |
| Feed Service | `src/services/feedService.ts` |
| Profile Service | `src/services/profilesService.ts` |
| Event Service | `src/services/eventsService.ts` |
| Design Tokens | `src/index.css` |
| Tailwind Config | `tailwind.config.ts` |

---

# APPENDIX B: Environment Variables Required

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=https://diasporanetwork.africa
VITE_APP_DOMAIN=diasporanetwork.africa
```

## Edge Function Secrets
- `RESEND_API_KEY` - Email delivery
- `PERPLEXITY_API_KEY` - AI search
- `STRIPE_SECRET_KEY` - Payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhooks
- `OPENAI_API_KEY` - Intent analysis

---

**Document End**

*This handoff document provides Claude Code with comprehensive context for rebuilding DNA with improved architecture and reduced technical debt.*
