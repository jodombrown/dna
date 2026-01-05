# DNA | CONVENE | Event Creation & Management System
## Comprehensive Overview & Completion Assessment

**Document Version:** 1.0  
**Date:** January 5, 2026  
**Purpose:** Hand-off document for Claude Code to complete the Event System build

---

## 1. EXECUTIVE SUMMARY

### System Status: ~80% Complete (Alpha-Ready with Known Gaps)

The DNA CONVENE Event System provides event creation, discovery, RSVP management, and analytics for the diaspora community. Core functionality is operational, but several features need refinement or completion.

### What Works ✅
- Event creation via Universal Composer (edge function validated)
- Event feed cards with amber styling and action menus
- Event detail page with 65%/35% two-column layout
- RSVP system (going/maybe/not going)
- SEO-friendly slug URLs with redirect from UUID
- My Events page (hosting + attending tabs with calendar view)
- Event analytics pages
- "Add to Calendar" functionality (.ics export)
- Event cancellation and deletion (with attendee notifications)
- Profile event count (migration applied for `events_count`)

### What Needs Work ⚠️
- Edit Event page (exists but may need validation)
- Event image cropping (16:9 enforcement)
- Recurring events (not implemented)
- Co-host functionality (not implemented)
- Waitlist management (partial)
- Check-in system (partial - QR code exists)
- Event reminders (edge function exists, needs verification)

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Database Schema

**Primary Table: `events`**
```sql
events (
  id UUID PRIMARY KEY,
  organizer_id UUID REFERENCES auth.users,
  group_id UUID NULLABLE,  -- For group-hosted events
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  slug TEXT UNIQUE,  -- SEO-friendly URL
  
  -- Type & Format
  event_type TEXT CHECK (event_type IN ('conference','workshop','meetup','webinar','networking','social','other')),
  format TEXT CHECK (format IN ('in_person','virtual','hybrid')),
  
  -- Location (for in-person/hybrid)
  location_name TEXT,
  location_address TEXT,
  location_city TEXT,
  location_country TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  
  -- Virtual (for virtual/hybrid)
  meeting_url TEXT,
  meeting_platform TEXT,
  
  -- Date/Time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  
  -- Capacity
  max_attendees INTEGER,
  
  -- Media
  cover_image_url TEXT,
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  allow_guests BOOLEAN DEFAULT true,
  
  -- Status
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  
  -- Extended Fields (PRD additions)
  agenda JSONB DEFAULT '[]',  -- Array of {time, title}
  dress_code TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

**Related Tables:**
- `event_attendees` - RSVP tracking (status: going/maybe/not_going/pending/waitlist)
- `event_reports` - User-submitted reports
- `event_registrations` - Legacy registration table (may need consolidation)
- `posts` - Feed posts linked to events (post_type='event', event_id)

### 2.2 Edge Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `create-event` | Create new events with validation | ✅ Complete |
| `update-event` | Update event details, notify attendees | ✅ Complete |
| `send-event-reminders` | Send reminder emails before events | ⚠️ Needs verification |
| `send-event-blasts` | Send announcements to attendees | ⚠️ Needs verification |
| `get-event-recommendations` | AI-powered event suggestions | ⚠️ Needs verification |

### 2.3 Key File Locations

**Pages:**
```
src/pages/dna/convene/
├── ConveneHub.tsx          # Main Convene landing page
├── EventsIndex.tsx         # Events browse/list page
├── EventDetail.tsx         # Single event view (919 lines)
├── CreateEvent.tsx         # Redirects to Universal Composer
├── MyEvents.tsx            # User's hosting/attending events
├── EventAnalytics.tsx      # Organizer analytics
├── EventCheckIn.tsx        # QR check-in page
├── OrganizerAnalytics.tsx  # Detailed analytics
└── GroupEventsPage.tsx     # Group-specific events
```

**Components:**
```
src/components/events/
├── EventCard.tsx           # Standard event card
├── EventActivityFeed.tsx   # Event-specific feed
├── EventRecommendations.tsx
├── EventSocialProof.tsx
├── CreateEventDialog.tsx   # Legacy - deprecated
├── CreateEventForm.tsx     # Legacy - deprecated
├── EventCreateWizard/      # Legacy wizard steps
│   ├── StepBasics.tsx
│   ├── StepLocation.tsx
│   └── ...
├── checkin/
│   └── AttendeeQRCode.tsx
└── manage/                 # Event management components

src/components/convene/
├── WelcomeStrip.tsx        # Personalized welcome + quick actions
├── MyEventsWidget.tsx      # Sidebar widget
├── EventCalendarView.tsx   # Calendar visualization
├── AddToCalendarButton.tsx # .ics export
├── UpcomingEventsSection.tsx
├── FlagshipEventsSection.tsx
└── analytics/              # Analytics components

src/components/connect/
└── ModernEventCard.tsx     # Browse view card (amber border)

src/components/feed/activity-cards/
└── FeedEventCard.tsx       # Feed view card (amber border + menu)
```

**Composer (Event Creation):**
```
src/components/composer/
├── UniversalComposer.tsx   # Main modal
├── ComposerBody.tsx        # Mode-specific form fields (1637 lines)
├── ComposerModeSelector.tsx
└── ComposerFooter.tsx

src/hooks/
└── useUniversalComposer.ts # Composer state + submit logic (569 lines)
```

---

## 3. FEATURE-BY-FEATURE ASSESSMENT

### 3.1 Event Creation ✅ COMPLETE

**Entry Points (All redirect to Universal Composer):**
- Header "+" button → Event mode
- WelcomeStrip "Host an Event" button
- MyEventsWidget "Create New Event" button
- `/dna/convene/events/new` route (redirects)

**Composer Event Mode Features:**
- Title (100 char max) ✅
- Subtitle (150 char max) ✅
- Cover image with 16:9 aspect ratio ✅
- Date/time pickers (start + end) ✅
- Format selector (in-person/virtual/hybrid) ✅
- Location field (conditional on format) ✅
- Meeting URL (conditional on format) ✅
- Event type dropdown ✅
- Max attendees (optional) ✅
- Agenda builder (time + title items) ✅
- Dress code selector ✅
- Tags input ✅

**Validation (Edge Function):**
- Profile completion ≥40% required ✅
- Title: 10-200 characters ✅
- Description: ≥50 characters ✅
- Start time must be in future ✅
- End time must be after start ✅
- Location required for in-person/hybrid ✅
- Meeting URL required for virtual/hybrid ✅
- SEO slug generated automatically ✅

**Issues Found:**
- None critical

### 3.2 Event Browse/Discovery ✅ MOSTLY COMPLETE

**ModernEventCard Features:**
- 2px amber border ✅
- Cover image with date badge overlay ✅
- Format badge (In-Person/Virtual/Hybrid) ✅
- Creator avatar on banner ✅
- Title, description truncation ✅
- Location/virtual indicator ✅
- Attendee count ✅
- RSVP button (amber) ✅

**Issues Found:**
- Date parsing relies on `start_time` || `date_time` - ensure consistency

### 3.3 Event Detail Page ✅ MOSTLY COMPLETE

**Layout:**
- Full-width hero image (21:9 aspect) ✅
- 65%/35% two-column grid ✅
- Sticky sidebar ✅

**Content:**
- Event badges (type, format, status) ✅
- Title + subtitle ✅
- Date/time formatting ✅
- Location display ✅
- Meeting URL (with copy) ✅
- Description ✅
- Agenda section (if exists) ⚠️ NOT DISPLAYED - needs implementation
- Dress code ⚠️ NOT DISPLAYED - needs implementation
- Tags ⚠️ NOT DISPLAYED - needs implementation

**Actions:**
- RSVP buttons (going/maybe/not going) ✅
- Add to Calendar ✅
- Share button ✅
- Edit (organizer only) ✅
- Cancel event ✅
- Delete event (only if 0 attendees) ✅
- Report event ✅
- QR Check-in link ✅

**Sidebar:**
- Organizer card ✅
- Attendee avatars ✅
- Event Spaces section ✅
- Activity feed ✅

**Issues Found:**
- Agenda, dress code, and tags are stored but NOT rendered in detail view
- Need to add these sections to EventDetail.tsx

### 3.4 Feed Event Card ✅ COMPLETE

**FeedEventCard Features:**
- 2px amber border ✅
- Calendar icon indicator ✅
- Creator info + timestamp ✅
- Event title + description ✅
- Date/time badge ✅
- Location/virtual badge ✅
- RSVP button (amber) ✅
- Action menu (⋯) ✅
  - Edit event (owner) ✅
  - Pin to profile (owner) ⚠️ UI only, may need backend
  - Copy link ✅
  - Delete event (owner) ✅

### 3.5 My Events Page ✅ COMPLETE

**Features:**
- Hosting tab with event list ✅
- Attending tab with event list ✅
- List view ✅
- Calendar view ✅
- Empty states ✅
- Quick actions (View, Analytics, Edit) ✅
- Past vs upcoming grouping ✅

### 3.6 Event Analytics ⚠️ NEEDS VERIFICATION

**Claimed Features:**
- Attendee count trends
- RSVP breakdown
- Check-in stats

**Status:** Pages exist but need content verification

### 3.7 Event Check-in ⚠️ PARTIAL

**Features:**
- QR code generation ✅
- Check-in page exists ✅
- Scanner functionality ⚠️ Needs testing

### 3.8 Event Reminders ⚠️ NEEDS VERIFICATION

**Edge Function:** `send-event-reminders`
- Exists but needs testing
- Should send 24h and 1h before event

---

## 4. KNOWN ISSUES & GAPS

### 4.1 Critical (Must Fix for Alpha)

| Issue | Location | Fix Needed |
|-------|----------|------------|
| Agenda not displayed | EventDetail.tsx | Add agenda section rendering |
| Dress code not displayed | EventDetail.tsx | Add dress code badge |
| Tags not displayed | EventDetail.tsx | Add tags section |
| "Pin to profile" no backend | FeedEventCard.tsx | Implement profile pinning |

### 4.2 High Priority (Should Fix)

| Issue | Location | Fix Needed |
|-------|----------|------------|
| Edit Event page validation | Unknown | Verify edit form works correctly |
| Event image cropping | ComposerBody.tsx | Add react-easy-crop for 16:9 |
| Check-in verification | EventCheckIn.tsx | Test QR scanning flow |
| Reminder emails | send-event-reminders | Verify cron job runs |

### 4.3 Medium Priority (Post-Alpha)

| Issue | Location | Fix Needed |
|-------|----------|------------|
| Recurring events | Not implemented | New feature build |
| Co-host functionality | Not implemented | New feature build |
| Waitlist management | Partial | Complete waitlist flow |
| Event duplication | Not implemented | Clone event feature |
| Advanced capacity controls | Not implemented | Ticket types, etc. |

### 4.4 Low Priority (Future)

- Event series/programs
- Paid ticketing (Stripe integration exists)
- Live streaming integration
- Post-event surveys
- Speaker/presenter management

---

## 5. TYPE DEFINITIONS

### src/types/events.ts
```typescript
export type EventType = 
  | 'conference' | 'workshop' | 'meetup' 
  | 'webinar' | 'networking' | 'social' | 'other';

export type EventFormat = 'in_person' | 'virtual' | 'hybrid';

export type RsvpStatus = 'going' | 'maybe' | 'not_going' | 'pending' | 'waitlist';

export interface Event {
  id: string;
  organizer_id: string;
  group_id?: string;
  title: string;
  description: string;
  event_type: EventType;
  format: EventFormat;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  location_lat?: number;
  location_lng?: number;
  meeting_url?: string;
  meeting_platform?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  max_attendees?: number;
  cover_image_url?: string;
  is_public: boolean;
  requires_approval: boolean;
  allow_guests: boolean;
  is_cancelled: boolean;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Extended fields (may need adding)
  subtitle?: string;
  slug?: string;
  agenda?: Array<{ time: string; title: string }>;
  dress_code?: string;
  tags?: string[];
}
```

---

## 6. EDGE FUNCTION DETAILS

### create-event (Complete ✅)

**Endpoint:** POST /functions/v1/create-event

**Request Body:**
```typescript
{
  title: string;           // 10-200 chars
  description: string;     // ≥50 chars
  event_type: EventType;
  format: EventFormat;
  start_time: string;      // ISO timestamp
  end_time: string;        // ISO timestamp
  timezone?: string;       // Default 'UTC'
  location_name?: string;
  location_city?: string;
  location_country?: string;
  meeting_url?: string;
  meeting_platform?: string;
  max_attendees?: number;
  is_public?: boolean;     // Default true
  requires_approval?: boolean;
  allow_guests?: boolean;
  cover_image_url?: string;
  subtitle?: string;
  agenda?: AgendaItem[];
  dress_code?: string;
  tags?: string[];
}
```

**Response:**
```typescript
// Success (201)
{ success: true, event: Event }

// Error (400/403)
{ success: false, error: string, required_completion?: number, current_completion?: number }
```

**Validation Logic:**
1. Check auth header
2. Verify user profile exists
3. Calculate profile completion (5-pillar system)
4. Require ≥40% completion
5. Check user not banned
6. Validate all required fields
7. Generate SEO slug
8. Insert event
9. Create feed post
10. Track analytics

### update-event (Complete ✅)

**Endpoint:** POST /functions/v1/update-event

**Request Body:**
```typescript
{
  event_id: string;        // Required
  // All other fields optional - only provided fields are updated
  title?: string;
  description?: string;
  // ... same as create-event
  is_cancelled?: boolean;
  cancellation_reason?: string;
}
```

**Special Logic:**
- Only organizer can edit
- Cannot edit past events
- Significant changes trigger attendee notifications
- Creates feed post for updates

---

## 7. RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Critical Fixes (1-2 days)

1. **Add missing fields to EventDetail.tsx**
   - Render agenda section (accordion or timeline)
   - Show dress code badge
   - Display tags as pills

2. **Verify Edit Event flow**
   - Test edit form loads existing data
   - Test updates save correctly
   - Test attendee notifications

### Phase 2: Polish (2-3 days)

3. **Image cropping in Composer**
   - Add react-easy-crop for 16:9 enforcement
   - Apply to cover image upload

4. **Pin to Profile backend**
   - Create `profile_pinned_items` table or use existing
   - Add toggle mutation

5. **Verify Check-in System**
   - Test QR generation
   - Test QR scanning
   - Test check-in status updates

### Phase 3: Enhancements (3-5 days)

6. **Event Reminders**
   - Verify cron job
   - Test email sending
   - Add user preferences

7. **Event Recommendations**
   - Verify AI recommendation function
   - Display on ConveneHub

8. **Mobile Polish**
   - Test all flows on mobile
   - Fix any responsive issues

---

## 8. TESTING CHECKLIST

### Event Creation
- [ ] Can create event with minimum required fields
- [ ] Validation prevents incomplete events
- [ ] Profile completion check works
- [ ] SEO slug generated correctly
- [ ] Feed post created
- [ ] Event appears in My Events

### Event Discovery
- [ ] Events display in browse view
- [ ] ModernEventCard shows all info
- [ ] Clicking card navigates to detail
- [ ] Filters work (if implemented)

### Event Detail
- [ ] UUID URLs redirect to slug URLs
- [ ] All event info displays
- [ ] Agenda section renders (if exists)
- [ ] RSVP buttons work
- [ ] Add to Calendar works
- [ ] Share copies correct URL
- [ ] Organizer sees edit/cancel/delete

### Event Edit
- [ ] Form loads with existing data
- [ ] Changes save correctly
- [ ] Attendees notified of changes

### My Events
- [ ] Hosting tab shows my events
- [ ] Attending tab shows RSVPd events
- [ ] Calendar view works
- [ ] Quick actions work

### Feed
- [ ] Event card appears in feed
- [ ] Amber border styling correct
- [ ] Action menu works
- [ ] Delete works (owner only)

---

## 9. RELATED MEMORIES

These platform memories contain additional context:

- `memory/features/event-system-data-schema-v2` - Schema details
- `memory/features/event-system/seo-friendly-slugs-and-profile-integration-v3` - SEO slugs
- `memory/features/universal-composer/core-architecture-v11` - Composer system
- `memory/design/event-page-layout-standards` - Layout specs
- `memory/features/event-system/legacy-form-deprecation` - Legacy form info

---

## 10. QUICK REFERENCE

### Color Tokens
- **Event Amber:** `hsl(38, 92%, 50%)` / `#F59E0B`
- **Event Amber Border:** `border: 2px solid hsl(38, 92%, 50%)`

### Key Routes
- Browse: `/dna/convene/events`
- Create: `/dna/convene/events/new` (redirects to composer)
- Detail: `/dna/convene/events/:slug`
- Edit: `/dna/convene/events/:id/edit`
- My Events: `/dna/convene/my-events`
- Analytics: `/dna/convene/events/:id/analytics`

### Key Queries
```typescript
// Fetch event by slug or UUID
const { data } = await supabase
  .from('events')
  .select('*')
  .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
  .maybeSingle();

// Fetch user's hosted events
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('organizer_id', userId)
  .order('start_time', { ascending: true });

// Fetch events user is attending
const { data: attendeeData } = await supabase
  .from('event_attendees')
  .select('event_id')
  .eq('user_id', userId)
  .in('status', ['going', 'maybe']);
```

---

**Document End**

*This assessment is current as of January 5, 2026. Update after significant changes.*
