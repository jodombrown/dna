# DNA CONVENE Architecture Diagnostic

**Generated:** 2026-01-05  
**Purpose:** Complete architecture alignment for Claude Code PRD development

---

## PART 1: DATABASE SCHEMA

### 1.1 Events Table Structure

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | NO | gen_random_uuid() |
| organizer_id | uuid | NO | - |
| title | text | NO | - |
| description | text | NO | - |
| event_type | USER-DEFINED | NO | - |
| format | USER-DEFINED | NO | - |
| location_name | text | YES | - |
| location_address | text | YES | - |
| location_city | text | YES | - |
| location_country | text | YES | - |
| location_lat | numeric | YES | - |
| location_lng | numeric | YES | - |
| meeting_url | text | YES | - |
| meeting_platform | text | YES | - |
| start_time | timestamp with time zone | NO | - |
| end_time | timestamp with time zone | NO | - |
| timezone | text | NO | 'UTC'::text |
| max_attendees | integer | YES | - |
| cover_image_url | text | YES | - |
| is_public | boolean | NO | true |
| requires_approval | boolean | NO | false |
| allow_guests | boolean | NO | false |
| is_cancelled | boolean | NO | false |
| cancellation_reason | text | YES | - |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| group_id | uuid | YES | - |
| is_flagship | boolean | YES | false |
| subtitle | text | YES | - |
| agenda | jsonb | YES | - |
| dress_code | text | YES | - |
| tags | ARRAY | YES | - |
| slug | character varying | YES | - |

### 1.2 Event Attendees Table Structure

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO | - |
| user_id | uuid | NO | - |
| status | USER-DEFINED (rsvp_status) | NO | 'pending'::rsvp_status |
| response_note | text | YES | - |
| checked_in | boolean | NO | false |
| checked_in_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### 1.3 Event Registrations Table (Duplicate/Legacy)

**NOTE:** This table appears to be a duplicate/alternate system to `event_attendees`.

| column_name | data_type |
|-------------|-----------|
| id | uuid |
| user_id | uuid |
| event_id | uuid |
| status | text |
| registered_at | timestamp with time zone |
| cancelled_at | timestamp with time zone |
| notes | text |
| ticket_type_id | uuid |
| answers | jsonb |
| price_paid_cents | integer |
| currency | text |
| join_token | text |
| stripe_session_id | text |
| stripe_payment_intent_id | text |

### 1.4 Ticket-Related Tables

| table_name |
|------------|
| event_ticket_holds |
| event_ticket_types |

#### event_ticket_types

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | YES | - |
| name | text | NO | - |
| description | text | YES | - |
| payment_type | text | NO | 'free'::text |
| price_cents | integer | YES | - |
| min_price_cents | integer | YES | - |
| suggested_price_cents | integer | YES | - |
| sales_start | timestamp with time zone | YES | - |
| sales_end | timestamp with time zone | YES | - |
| total_tickets | integer | YES | - |
| hidden | boolean | YES | false |
| require_approval | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

#### event_ticket_holds

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | YES | - |
| ticket_type_id | uuid | YES | - |
| user_id | uuid | YES | - |
| quantity | integer | YES | 1 |
| expires_at | timestamp with time zone | NO | - |
| created_at | timestamp with time zone | NO | now() |

### 1.5 Payment/Order Tables

**Result:** NONE EXIST

No tables matching `%order%`, `%payment%`, or `%stripe%` were found.

### 1.6 Promo/Discount Tables

**Result:** NONE EXIST

No tables matching `%promo%`, `%discount%`, or `%coupon%` were found.

### 1.7 All Event-Related Tables

| table_name |
|------------|
| analytics_events |
| community_event_attendees |
| community_events |
| feed_engagement_events |
| event_analytics |
| event_blasts |
| event_checkins |
| event_registration_questions |
| event_registrations |
| event_reminder_logs |
| event_ticket_holds |
| event_ticket_types |
| events_log |
| events_old |
| event_reports |
| events |
| event_attendees |
| event_comments |
| event_waitlist |

### 1.8 Supporting Tables Schemas

#### event_analytics

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| event_id | uuid | - |
| happened_at | timestamp with time zone | now() |
| kind | text | - |
| payload | jsonb | - |

#### event_blasts

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| event_id | uuid | - |
| subject | text | - |
| body_markdown | text | - |
| segment | jsonb | - |
| scheduled_for | timestamp with time zone | - |
| sent_at | timestamp with time zone | - |

#### event_waitlist

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| event_id | uuid | - |
| user_id | uuid | - |
| position | integer | - |
| created_at | timestamp with time zone | now() |

#### event_checkins

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| registration_id | uuid | - |
| checked_in_at | timestamp with time zone | now() |
| by_profile_id | uuid | - |

#### event_comments

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| event_id | uuid | - |
| author_id | uuid | - |
| content | text | - |
| created_at | timestamp with time zone | now() |
| updated_at | timestamp with time zone | now() |
| is_deleted | boolean | false |

#### event_registration_questions

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| event_id | uuid | - |
| label | text | - |
| type | text | - |
| required | boolean | false |
| options | jsonb | - |
| position | integer | 0 |
| created_at | timestamp with time zone | now() |

#### event_reminder_logs

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| id | uuid | gen_random_uuid() |
| event_id | uuid | - |
| user_id | uuid | - |
| reminder_type | text | 'event_24h'::text |
| sent_at | timestamp with time zone | now() |
| notification_id | uuid | - |
| created_at | timestamp with time zone | now() |

### 1.9 RLS Policies on Events

| policyname | cmd | qual |
|------------|-----|------|
| Authenticated users can create events | INSERT | - |
| Organizers can delete events | DELETE | (organizer_id = auth.uid()) |
| Organizers can update events | UPDATE | (organizer_id = auth.uid()) |
| Users can view accessible events | SELECT | ((is_public = true) OR (organizer_id = auth.uid()) OR (group_id IS NOT NULL AND EXISTS(group_members check))) |

### 1.10 RLS Policies on Event Attendees

| policyname | cmd | qual |
|------------|-----|------|
| Users can RSVP to events | INSERT | - |
| Users can delete their own RSVP | DELETE | (user_id = auth.uid()) |
| Users can update event attendance | UPDATE | (user_id = auth.uid() OR organizer check) |
| Users can view accessible event attendees | SELECT | (event is_public OR organizer check) |

### 1.11 Database Functions Related to Events

| routine_name | routine_type |
|--------------|--------------|
| notify_event_invite | FUNCTION |
| generate_event_slug | FUNCTION |
| get_event_attendees | FUNCTION |
| notify_event_rsvp | FUNCTION |
| get_event_analytics | FUNCTION |
| delete_event_posts | FUNCTION |
| get_event_details | FUNCTION |
| get_events | FUNCTION |
| _on_event_reg_change | FUNCTION |
| get_total_events | FUNCTION |
| rpc_event_attendee_count | FUNCTION |
| rpc_event_approve | FUNCTION |
| rpc_event_decline | FUNCTION |
| rpc_event_join_link | FUNCTION |
| rpc_event_register | FUNCTION (x2) |
| rpc_event_set_status | FUNCTION |
| rpc_event_waitlist_promote | FUNCTION |
| set_event_registration_join_token | FUNCTION |
| trg_event_reg_cancel_promote | FUNCTION |
| trg_events_ensure_profile | FUNCTION |
| update_event_attendee_count | FUNCTION |
| ensure_profile_on_event_insert | FUNCTION |

---

## PART 2: EDGE FUNCTIONS

### 2.1 Directory Listing

```
supabase/functions/
├── _shared/
├── adin-hub-intelligence/
├── adin-nightly-health/
├── ai-search/
├── auto-archive-releases/
├── connection-health-analyzer/
├── create-event/               ✅ Event creation
├── create-payment/             ✅ Stripe payment
├── delete-account/
├── dia-search/
├── engagement-reminders/
├── engagement-tracker/
├── generate-connect-nudges/
├── generate-opportunity-nudges/
├── get-event-recommendations/  ✅ Event recommendations
├── global-search/
├── handle-beta-approval/
├── link-preview/
├── oembed-proxy/
├── seed-test-accounts/
├── send-connection-request/
├── send-contact-email/
├── send-event-blasts/          ✅ Event emails
├── send-event-reminders/       ✅ Event reminders
├── send-magic-link/
├── send-newsletter/
├── send-notification-email/
├── send-password-reset/
├── send-survey-response/
├── send-universal-email/
├── send-welcome-email/
├── stripe-webhook/             ✅ Stripe webhook
├── suggest-usernames/
├── transcribe-voice/
├── trigger-adin-prompt/
├── unsubscribe-email/
├── update-event/               ✅ Event update
├── verify-payment/             ✅ Payment verification
└── deno.json
```

### 2.2 create-event/index.ts Summary

**Input Schema:**
```typescript
interface CreateEventRequest {
  title: string;              // 10-200 chars
  description: string;        // min 50 chars
  event_type: 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other';
  format: 'in_person' | 'virtual' | 'hybrid';
  location_name?: string;
  location_address?: string;
  location_city?: string;     // Required for in_person/hybrid
  location_country?: string;  // Required for in_person/hybrid
  meeting_url?: string;       // Required for virtual/hybrid
  meeting_platform?: string;
  start_time: string;         // Must be in future
  end_time: string;           // Must be after start_time
  timezone?: string;
  max_attendees?: number;
  is_public?: boolean;
  requires_approval?: boolean;
  allow_guests?: boolean;
  cover_image_url?: string;
  subtitle?: string;
  agenda?: AgendaItem[];
  dress_code?: string;
  tags?: string[];
}
```

**Key Features:**
- Profile completion check (40% minimum)
- Banned user check
- Auto-generates SEO slug
- Creates feed post for event
- Tracks analytics

### 2.3 update-event/index.ts Summary

**Input Schema:**
```typescript
interface UpdateEventRequest {
  event_id: string;  // Required
  // All other fields optional, same as CreateEventRequest
  is_cancelled?: boolean;
  cancellation_reason?: string;
}
```

**Key Features:**
- Verifies organizer ownership
- Cannot edit past events
- Notifies attendees on significant changes
- Creates feed post for updates

### 2.4 send-event-reminders/index.ts Summary

- Sends 24-hour reminder notifications
- Uses cron job logging
- Checks existing reminders (idempotent)
- Sends both in-app and email notifications
- Feature-flagged via `ENABLE_EVENT_REMINDERS`

---

## PART 3: FRONTEND STRUCTURE

### 3.1 Event Pages (src/pages)

**Root Level:**
- `Convene.tsx` - Public marketing page
- `ConveneCategoryPage.tsx` - Category browsing
- `ConveneExample.tsx` - Example page
- `EditEventPage.tsx` - Event editing
- `EventDetailsPage.tsx` - Event detail (legacy)
- `EventsPage.tsx` - Event listing
- `FeaturedCalendarsPage.tsx` - Calendar subscriptions
- `LocalEventsPage.tsx` - Local events

**DNA Convene Pages (src/pages/dna/convene):**
- `ComingSoonConvene.tsx`
- `ConveneDiscovery.tsx`
- `ConveneHub.tsx` - Main hub
- `CreateEvent.tsx` - Event creation (redirects to composer)
- `EventAnalytics.tsx`
- `EventCheckIn.tsx`
- `EventDetail.tsx` - Main event detail page
- `EventsIndex.tsx`
- `GroupEventsPage.tsx`
- `GroupsBrowse.tsx`
- `MyEvents.tsx`
- `OrganizerAnalytics.tsx`

### 3.2 Event Components (src/components/events)

```
src/components/events/
├── EventCreateWizard/
├── checkin/
├── manage/
├── CreateEventDialog.tsx
├── CreateEventForm.tsx
├── DashboardEventsView.tsx
├── EventActivityFeed.tsx
├── EventCard.tsx              ✅ List view card
├── EventCreateWizard.tsx
├── EventRecommendations.tsx
├── EventSocialProof.tsx
├── EventsBreadcrumb.tsx
└── Join.tsx
```

### 3.3 Convene Components (src/components/convene)

```
src/components/convene/
├── analytics/
├── AddToCalendarButton.tsx
├── ConveneContextWidgets.tsx
├── ConveneLeftNav.tsx
├── ConveneRightWidgets.tsx
├── CreateEventModal.tsx
├── CreateLeadSection.tsx
├── EventCalendarView.css
├── EventCalendarView.tsx
├── EventRecommendationsWidget.tsx
├── EventsNearYouSection.tsx
├── FlagshipEventsSection.tsx
├── MyEventsWidget.tsx
├── RegisteredEventsWidget.tsx
├── UpcomingEventsSection.tsx
├── WelcomeStrip.tsx
└── YourCommunitiesSection.tsx
```

### 3.4 Composer Components (src/components/composer)

```
src/components/composer/
├── ComposerBody.tsx           ✅ Contains EventModeFields
├── ComposerFooter.tsx
├── ComposerModeSelector.tsx
└── UniversalComposer.tsx
```

---

## PART 4: KEY COMPONENTS ANALYSIS

### 4.1 EventCard.tsx (List View)

**Props:**
```typescript
interface EventCardProps {
  event: EventListItem;
  onRSVP?: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
}
```

**Features:**
- Displays cover image or gradient placeholder
- Shows event type badge (colored by type)
- Shows format badge with icon
- Displays organizer info
- Shows date, time, location
- Shows attendee count
- RSVP status badge or View Details button
- Manage button for organizers

### 4.2 ModernEventCard.tsx (Browse View)

**Props:**
```typescript
interface ModernEventCardProps {
  event: Event;
  onEventClick: (event: Event) => void;
  onRegisterEvent: () => void;
  onCreatorClick?: (creatorId: string) => void;
}
```

**Features:**
- 2px amber border
- Cover image with date badge overlay (bottom-left)
- Format badge (top-right)
- Creator avatar badge (top-left)
- Amber RSVP button

### 4.3 FeedEventCard.tsx (Activity Feed)

**Props:**
```typescript
interface FeedEventCardProps {
  activity: Activity;
}
```

**Features:**
- 2px amber border
- Action menu (⋯) with: Edit, Pin to profile, Copy link, Delete
- Event details card
- Amber RSVP button
- Delete confirmation dialog

### 4.4 EventDetail.tsx (Detail Page)

**Features:**
- SEO-friendly slug support (redirects UUID to slug)
- Full-width hero image
- Event type and format badges
- Organizer info with avatar
- Group info (if group-hosted)
- Add to Calendar button
- Share button
- Edit/Cancel/Delete for organizers
- Report functionality
- RSVP buttons (Going/Maybe/Not Going)
- Attendee avatars
- Tabs: Discussion, About, Linked Spaces

**Missing (per PRD):**
- Agenda rendering
- Dress code display
- Tags display

### 4.5 ComposerBody.tsx - EventModeFields

**Features:**
- Event title (100 chars max)
- Subtitle (150 chars max)
- Cover image upload
- Start/End date & time pickers
- Format selector (in_person/virtual/hybrid)
- Location fields (for in_person/hybrid)
- Meeting URL (for virtual/hybrid)
- Event type selector
- Dress code selector
- Agenda items (add/remove/edit)
- Tags input
- Max attendees
- Privacy toggle (Public/Private)
- Requires approval toggle
- Allow guests toggle

---

## PART 5: SERVICES

### 5.1 eventsService.ts

**Location:** `src/services/eventsService.ts`

```typescript
interface EventSearchFilters {
  type?: string;
  is_virtual?: boolean;
  upcoming_only?: boolean;
}

export const searchEvents = async (
  searchTerm: string = '', 
  filters: EventSearchFilters = {}
): Promise<Event[]>
```

**Note:** This is a simple search service. Most event fetching uses RPCs directly.

---

## PART 6: TYPE DEFINITIONS

### 6.1 src/types/events.ts

```typescript
export type EventType = 
  | 'conference' | 'workshop' | 'meetup' 
  | 'webinar' | 'networking' | 'social' | 'other';

export type EventFormat = 'in_person' | 'virtual' | 'hybrid';

export type RsvpStatus = 'going' | 'maybe' | 'not_going' | 'pending' | 'waitlist';

export interface Event { ... }
export interface EventWithOrganizer extends Event { ... }
export interface EventListItem { ... }
export interface EventAttendee { ... }
export interface CreateEventInput { ... }
```

### 6.2 src/types/eventTypes.ts (Legacy)

Contains older `Event` interface with backward compatibility fields.

---

## PART 7: ROUTES

### 7.1 Convene Routes (inferred from pages)

| Route | Page Component |
|-------|----------------|
| /convene | Convene.tsx (public) |
| /convene-example | ConveneExample.tsx |
| /dna/convene | ConveneHub.tsx |
| /dna/convene/discovery | ConveneDiscovery.tsx |
| /dna/convene/events | EventsIndex.tsx |
| /dna/convene/events/new | CreateEvent.tsx (redirects) |
| /dna/convene/events/:id | EventDetail.tsx |
| /dna/convene/events/:id/edit | EditEventPage.tsx |
| /dna/convene/events/:id/analytics | EventAnalytics.tsx |
| /dna/convene/events/:id/check-in | EventCheckIn.tsx |
| /dna/convene/my-events | MyEvents.tsx |
| /dna/convene/groups | GroupsBrowse.tsx |
| /dna/convene/groups/:id | GroupEventsPage.tsx |
| /dna/convene/organizer-analytics | OrganizerAnalytics.tsx |

---

## PART 8: ENVIRONMENT VARIABLES

**Required for Events:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENABLE_EVENT_REMINDERS` (feature flag)

**Required for Payments:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## PART 9: KEY FINDINGS & ISSUES

### 9.1 Architecture Issues

1. **Duplicate Registration Systems**
   - `event_attendees` (RSVP-based, status enum)
   - `event_registrations` (ticket-based, payment support)
   - Need to consolidate or clearly separate use cases

2. **Missing Promo/Discount Tables**
   - No coupon or discount infrastructure exists
   - Will need new tables for M4

3. **Agenda/Tags Not Rendered**
   - EventDetail.tsx doesn't display `agenda`, `dress_code`, or `tags`
   - Data is stored but not shown

4. **Pin to Profile Backend Missing**
   - FeedEventCard has "Pin to profile" option but no backend

### 9.2 Positive Findings

1. **Comprehensive Edge Functions**
   - create-event with validation
   - update-event with notifications
   - send-event-reminders with idempotency
   - Stripe integration ready

2. **SEO Slug Support**
   - `generate_event_slug` RPC exists
   - EventDetail redirects UUID to slug

3. **Rich Event Schema**
   - Supports groups, flagship events
   - Has subtitle, agenda, dress_code, tags
   - Full location and virtual meeting support

4. **Complete RLS Policies**
   - Proper access control on events and attendees

---

## PART 10: ERRORS/MISSING

### Files That Don't Exist
- No dedicated `eventService.ts` (uses `eventsService.ts` or direct Supabase)
- No `ticket*` service files

### Tables That Don't Exist
- No payment orders table
- No promo codes table
- No discount table

---

## APPENDIX: Quick Reference

### Event Types (enum)
```
conference, workshop, meetup, webinar, networking, social, other
```

### Event Formats (enum)
```
in_person, virtual, hybrid
```

### RSVP Statuses (enum)
```
going, maybe, not_going, pending, waitlist
```

### Color Tokens (for event cards)
```css
--amber-border: hsl(38, 92%, 50%)
--dna-emerald: hsl(151, 75%, 50%)
--dna-forest: hsl(151, 75%, 40%)
```
