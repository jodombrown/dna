# DNA Platform - Event Registration & Management System
## Comprehensive Technical Breakdown

**Status:** Demo → Production Ready
**Last Updated:** 2025-10-18

---

## 1. DATABASE ARCHITECTURE

### Core Tables

#### `events`
**Purpose:** Stores all event data
```sql
Columns:
- id (uuid, primary key)
- title (text, required)
- description (text)
- date_time (timestamp with time zone)
- location (text)
- type (text) - e.g., "networking", "workshop", "conference"
- attendee_count (integer, default: 0)
- max_attendees (integer, nullable)
- is_featured (boolean, default: false)
- is_virtual (boolean, default: false)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- created_by (uuid, references profiles.id)
- image_url (text)
- banner_url (text)
- waitlist_enabled (boolean)
- registration_url (text)
- slug (text) - NEEDED: Unique URL identifier

RLS Policies:
- ✅ Public can view active events
- ✅ Event creators can manage their own events
- ⚠️ NEEDS: Policy for event editing
```

#### `event_registrations`
**Purpose:** Tracks who registered for which events
```sql
Columns:
- id (uuid, primary key)
- event_id (uuid, references events.id)
- user_id (uuid, references profiles.id)
- registered_at (timestamp with time zone, default: now())
- status (text) - "going", "interested", "cancelled"
- ticket_type_id (uuid, nullable)
- price_paid_cents (integer)
- currency (text)
- stripe_session_id (text)
- stripe_payment_intent_id (text)
- answers (jsonb) - Registration form answers
- notes (text)
- join_token (text) - For unique access
- cancelled_at (timestamp with time zone)

RLS Policies:
- ✅ Users can register themselves
- ✅ Users can view their own registrations
- ✅ Event creators can view all registrations for their events
- ✅ Users can cancel their own registrations
```

#### `event_ticket_types`
**Purpose:** Different ticket tiers for events (free, paid, VIP, etc.)
```sql
Columns:
- id (uuid, primary key)
- event_id (uuid, references events.id)
- name (text) - "General Admission", "VIP", "Early Bird"
- description (text)
- price_cents (integer)
- quantity_available (integer)
- quantity_sold (integer, default: 0)
- sales_start (timestamp with time zone)
- sales_end (timestamp with time zone)
- payment_type (text) - "free", "paid", "flex" (pay what you want)
- hidden (boolean, default: false)
- position (integer) - Display order

RLS Policies:
- ✅ Public can view ticket types
- ✅ Event creators can manage ticket types
```

#### `event_registration_questions`
**Purpose:** Custom registration questions per event
```sql
Columns:
- id (uuid, primary key)
- event_id (uuid, references events.id)
- label (text) - Question text
- type (text) - "text", "textarea", "select", "checkbox", "radio"
- required (boolean, default: false)
- options (jsonb) - For select/radio/checkbox
- position (integer) - Display order

RLS Policies:
- ✅ Public can read questions
- ⚠️ NEEDS: Creators can manage questions
```

#### `event_reports`
**Purpose:** User-submitted reports for inappropriate events
```sql
Columns:
- id (uuid, primary key)
- event_id (uuid, references events.id)
- reported_by (uuid, references profiles.id)
- reason (text) - "spam", "inappropriate", "misleading", etc.
- description (text)
- status (text, default: "pending") - "pending", "reviewed", "resolved"
- created_at (timestamp with time zone)
- reviewed_by (uuid, nullable)
- reviewed_at (timestamp with time zone, nullable)

RLS Policies:
- ✅ Users can create reports
- ✅ Users can view their own reports
- ✅ Event creators can view reports on their events
```

#### `event_analytics`
**Purpose:** Track event performance metrics
```sql
Columns:
- id (uuid, primary key)
- event_id (uuid, references events.id)
- kind (text) - "view", "share", "registration", "payment_success", etc.
- payload (jsonb) - Additional data
- happened_at (timestamp with time zone, default: now())

RLS Policies:
- ✅ Event creators can view analytics for their events
- ✅ System can insert analytics
```

#### `event_blasts`
**Purpose:** Email campaigns to registrants
```sql
Columns:
- id (uuid, primary key)
- event_id (uuid, references events.id)
- subject (text)
- body_markdown (text)
- scheduled_for (timestamp with time zone)
- sent_at (timestamp with time zone, nullable)
- segment (jsonb) - Target specific registrants

RLS Policies:
- ✅ Event creators can manage blasts
```

#### `event_checkins`
**Purpose:** Track attendance at events
```sql
Columns:
- id (uuid, primary key)
- registration_id (uuid, references event_registrations.id)
- checked_in_at (timestamp with time zone, default: now())
- by_profile_id (uuid) - Staff member who checked them in

RLS Policies:
- ✅ Event staff can manage check-ins
```

#### `profiles` (Social Media Integration)
**Purpose:** User profiles with social media links
```sql
Recent Additions:
- instagram_url (text)
- linkedin_url (text)
- twitter_url (text)
- facebook_url (text)
- website_url (text)

Status: ✅ IMPLEMENTED
```

---

## 2. EDGE FUNCTIONS (Supabase)

### `create-payment`
**Purpose:** Create Stripe checkout session for paid event tickets
**Location:** `supabase/functions/create-payment/index.ts`

**Functionality:**
- Validates user authentication
- Fetches ticket type details
- Checks ticket availability
- Creates Stripe checkout session
- Returns checkout URL

**Input:**
```typescript
{
  ticketTypeId: uuid,
  eventId: uuid
}
```

**Output:**
```typescript
{
  url: string // Stripe checkout URL
}
```

**Status:** ✅ IMPLEMENTED

### `verify-payment`
**Purpose:** Verify Stripe payment completion
**Location:** `supabase/functions/verify-payment/index.ts`

**Functionality:**
- Retrieves Stripe session
- Verifies payment status
- Logs analytics
- Returns payment details and event info

**Input:**
```typescript
{
  sessionId: string
}
```

**Output:**
```typescript
{
  success: boolean,
  payment_status: string,
  amount_total: number,
  currency: string,
  event_title?: string,
  event_slug?: string
}
```

**Status:** ✅ IMPLEMENTED

### **NEEDED:** `send-registration-notification`
**Purpose:** Email event creator when someone registers
**Status:** ⚠️ NOT IMPLEMENTED

**Required Functionality:**
- Trigger on new event_registration
- Fetch event creator's email
- Send templated email with registrant details
- Use Resend API

---

## 3. FRONTEND COMPONENTS

### Pages

#### `/convene` (Convene.tsx)
**Purpose:** Main events discovery page
**Location:** `src/pages/Convene.tsx`

**Features:**
- ✅ Display live events
- ✅ Event filtering
- ✅ Event search
- ✅ Click event to view details
- ⚠️ NEEDS: Create event button for authenticated users

**Status:** Partially Complete

#### **NEEDED:** `/events/create`
**Purpose:** Event creation wizard
**Status:** ⚠️ NOT IMPLEMENTED

**Required Features:**
- Multi-step form (Basics, Details, Tickets, Questions)
- Image upload for banner/thumbnail
- Ticket type configuration
- Custom registration questions
- Preview before publish
- Auto-generate unique slug

#### **NEEDED:** `/events/:slug`
**Purpose:** Public event detail page
**Status:** ⚠️ NOT IMPLEMENTED

**Required Features:**
- Full event information
- Registration form
- Share functionality
- Event creator info
- Related events
- SEO optimized

#### **NEEDED:** `/dashboard/events`
**Purpose:** User's event management dashboard
**Status:** ⚠️ NOT IMPLEMENTED

**Required Features:**
- Created events list
- Registered events list
- Quick actions (edit, view analytics, cancel)
- Event stats overview

#### **NEEDED:** `/dashboard/events/:id/manage`
**Purpose:** Event management interface for creators
**Status:** ⚠️ NOT IMPLEMENTED

**Required Features:**
- Edit event details
- View registrations list
- Export attendees
- Send email blasts
- View analytics
- Check-in interface
- Manage ticket types

### Components

#### `EventRegistrationSidebar.tsx`
**Location:** `src/components/connect/EventRegistrationSidebar.tsx`

**Features:**
- ✅ Event details display
- ✅ Navigation between events
- ✅ Registration CTA
- ✅ Host information
- ⚠️ PARTIAL: Social media links (needs dynamic data)
- ⚠️ PARTIAL: Contact host (needs implementation)
- ⚠️ PARTIAL: Report event (needs implementation)
- ⚠️ PARTIAL: Share event (needs unique URL)

#### Sidebar Sections:

**EventTicketSection.tsx**
- ✅ Display ticket pricing
- ⚠️ NEEDS: Dynamic ticket type selection
- ⚠️ NEEDS: Payment integration UI

**EventDetailsSection.tsx**
- ✅ Date, time, location display
- ✅ Virtual/in-person indicator

**EventAboutSection.tsx**
- ✅ Event description display

**EventLocationSection.tsx**
- ✅ Location details
- ⚠️ NEEDS: Map integration

**EventPresenterSection.tsx**
- ⚠️ NEEDS: Dynamic presenter from event.created_by
- Currently hardcoded

**EventHostSection.tsx**
- ✅ Display host avatar and name
- ✅ Click to view profile
- ⚠️ NEEDS: Fetch from event.created_by

**EventActionsSection.tsx**
- ⚠️ NEEDS: Contact host implementation
- ⚠️ NEEDS: Report event implementation

**EventSocialSection.tsx**
- ⚠️ NEEDS: Dynamic social media from creator's profile
- Currently hardcoded

**EventDemoDialogs.tsx**
- ✅ Demo explanation dialogs
- ⚠️ NEEDS: Replace with real functionality

#### `ModernEventCard.tsx`
**Location:** `src/components/connect/ModernEventCard.tsx`

**Features:**
- ✅ Event thumbnail
- ✅ Title, date, location
- ✅ Attendee count
- ✅ "Click to Learn More" CTA
- ⚠️ NEEDS: Share functionality
- ⚠️ NEEDS: Save/bookmark functionality

---

## 4. DATA FLOW

### Event Creation Flow (TO BE IMPLEMENTED)
```
1. User clicks "Create Event" button
2. Navigate to /events/create
3. Step 1: Basic Info (title, description, date, location, type)
   - Auto-generate slug from title
   - Upload banner image
4. Step 2: Tickets & Pricing
   - Add ticket types (free, paid, VIP, etc.)
   - Set quantities and prices
5. Step 3: Registration Questions (optional)
   - Add custom questions
6. Step 4: Review & Publish
   - Preview event page
   - Publish event
7. Insert into events table with created_by = auth.uid()
8. Redirect to /events/:slug or /dashboard/events/:id/manage
```

### Event Registration Flow (PARTIAL)
```
✅ 1. User views event in sidebar
✅ 2. Clicks "Register Now"
⚠️ 3. IF paid ticket:
      a. Select ticket type
      b. Click "Pay Now"
      c. Redirect to Stripe checkout (via create-payment edge function)
      d. Complete payment
      e. Stripe redirects to success page
      f. Verify payment (via verify-payment edge function)
      g. Create event_registration record
⚠️ 3. IF free ticket:
      a. Fill out registration questions (if any)
      b. Click "Complete Registration"
      c. Create event_registration record
✅ 4. Show confirmation message
⚠️ 5. Send email to event creator (NEEDS: send-registration-notification edge function)
⚠️ 6. Send confirmation email to registrant
⚠️ 7. Add to user's "My Events" in dashboard
```

### Event Management Flow (TO BE IMPLEMENTED)
```
1. Creator navigates to /dashboard/events
2. See list of created events
3. Click event to manage
4. Navigate to /dashboard/events/:id/manage
5. Available actions:
   - Edit event details
   - View registrations
   - Export attendee list (CSV)
   - Send email blast
   - View analytics (views, registrations, revenue)
   - Check-in attendees (QR code scanner)
   - Cancel event
   - Duplicate event
```

---

## 5. KEY FEATURES BREAKDOWN

### ✅ COMPLETED
1. **Database Schema** - All tables created with RLS
2. **Event Display** - View events in Convene page
3. **Event Details Sidebar** - Comprehensive event information
4. **Basic Registration** - Insert into event_registrations table
5. **Stripe Integration** - Edge functions for payment processing
6. **Social Media Fields** - Added to profiles table
7. **Event Reports** - Table and basic structure

### ⚠️ IN PROGRESS
1. **Dynamic Event Data** - Need to fetch creator info properly
2. **Social Media Display** - Need to show creator's social links
3. **Unique Event URLs** - Need slug generation and routing

### ❌ NOT STARTED (PRIORITY)

#### High Priority
1. **Event Creation Wizard**
   - Multi-step form component
   - Image upload integration
   - Slug auto-generation
   - Ticket type builder
   - Custom questions builder

2. **Event Management Dashboard**
   - Creator's event list
   - Quick edit/view/delete
   - Analytics overview
   - Registrations management

3. **Registration Flow Completion**
   - Free ticket registration form
   - Paid ticket checkout integration
   - Custom question answers
   - Confirmation emails

4. **Email Notifications**
   - Registration confirmation to attendee
   - New registration alert to creator
   - Event reminders
   - Event updates

5. **User Event Dashboard**
   - My registered events
   - Past events
   - Upcoming events
   - Calendar view

#### Medium Priority
6. **Event Editing**
   - Edit event details
   - Update tickets
   - Modify questions
   - Publish/unpublish

7. **Attendee Management**
   - View registrations
   - Export CSV
   - Manual add/remove
   - Send targeted emails

8. **Event Analytics**
   - Views tracking
   - Registration conversion
   - Revenue tracking
   - Demographic insights

9. **Social Features**
   - Share event (unique URL)
   - Copy event link
   - Social media sharing
   - Embed event widget

10. **Contact & Reporting**
    - Contact host dialog
    - Report event functionality
    - Admin moderation queue

#### Low Priority
11. **Check-in System**
    - QR code generation
    - QR scanner for mobile
    - Manual check-in

12. **Event Blasts**
    - Email composer
    - Segment attendees
    - Schedule sends
    - Track opens/clicks

13. **Advanced Features**
    - Waitlist management
    - Group registrations
    - Discount codes
    - Referral tracking

---

## 6. TECHNICAL REQUIREMENTS

### Environment Variables Needed
```bash
# Already configured
VITE_SUPABASE_URL=https://ybhssuehmfnxrzneobok.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...

# Need to add
RESEND_API_KEY=re_... # For email notifications
STRIPE_SECRET_KEY=sk_test_... # For payments (you'll add later)
APP_URL=https://yourdomain.com # For redirect URLs
```

### Supabase Setup Required
1. ✅ Enable Row Level Security on all tables
2. ⚠️ Set up Resend integration for emails
3. ⚠️ Configure Stripe webhook (when ready)
4. ⚠️ Set up Storage bucket for event images
5. ⚠️ Create database triggers for attendee_count updates

### Frontend Dependencies
All dependencies already installed:
- React Hook Form - ✅
- Zod - ✅ (for validation)
- Supabase Client - ✅
- Tailwind CSS - ✅
- Radix UI components - ✅

---

## 7. IMMEDIATE NEXT STEPS

### Phase 1: Core Functionality (Week 1-2)
1. **Event Creation**
   - Build `/events/create` wizard
   - Implement slug generation
   - Add image upload
   - Create ticket type form

2. **Dynamic Event Display**
   - Fix EventPresenterSection to use event.created_by
   - Fix EventHostSection to fetch creator profile
   - Fix EventSocialSection to show creator's social media

3. **Unique Event URLs**
   - Add slug column to events table (if not exists)
   - Implement `/events/:slug` route
   - Add copy link functionality

### Phase 2: Registration & Management (Week 3-4)
4. **Complete Registration Flow**
   - Free registration form
   - Payment integration UI
   - Registration confirmation

5. **Email Notifications**
   - Set up Resend API key
   - Create send-registration-notification edge function
   - Email templates

6. **Event Management Dashboard**
   - Build `/dashboard/events` page
   - Create event list view
   - Build `/dashboard/events/:id/manage` page

### Phase 3: Advanced Features (Week 5+)
7. **Attendee Management**
   - Registrations list
   - Export functionality
   - Email blasts

8. **Analytics & Reporting**
   - Track event views
   - Registration metrics
   - Revenue tracking

9. **Contact & Reporting**
   - Contact host implementation
   - Report event implementation
   - Admin moderation

---

## 8. PAYMENT INTEGRATION NOTES

### Current State
- ✅ Stripe edge functions created
- ✅ Database fields for payment tracking
- ⚠️ UI shows "Register Now" but needs payment flow

### To Implement (When Ready)
1. Add Stripe publishable key to frontend
2. Update EventTicketSection to show ticket selection
3. Add "Pay Now" button that calls create-payment
4. Handle Stripe redirect back to platform
5. Call verify-payment on success page
6. Create registration record after successful payment

### Temporary Solution
Add notice in EventTicketSection:
```
"💳 Payment processing coming soon! 
For now, registration is free for all events."
```

---

## 9. FILE STRUCTURE

```
src/
├── pages/
│   ├── Convene.tsx ✅
│   ├── events/
│   │   ├── Create.tsx ❌ NEEDED
│   │   ├── [slug].tsx ❌ NEEDED
│   │   └── PaymentSuccess.tsx ❌ NEEDED
│   └── dashboard/
│       └── events/
│           ├── index.tsx ❌ NEEDED (My Events)
│           └── [id]/
│               └── Manage.tsx ❌ NEEDED
├── components/
│   ├── connect/
│   │   ├── EventRegistrationSidebar.tsx ✅
│   │   ├── ModernEventCard.tsx ✅
│   │   └── sidebar/
│   │       ├── EventTicketSection.tsx ⚠️ NEEDS UPDATE
│   │       ├── EventPresenterSection.tsx ⚠️ NEEDS UPDATE
│   │       ├── EventHostSection.tsx ⚠️ NEEDS UPDATE
│   │       ├── EventSocialSection.tsx ⚠️ NEEDS UPDATE
│   │       └── EventActionsSection.tsx ⚠️ NEEDS UPDATE
│   └── events/ ❌ NEW DIRECTORY NEEDED
│       ├── CreateEventWizard/
│       │   ├── StepBasics.tsx
│       │   ├── StepTickets.tsx
│       │   ├── StepQuestions.tsx
│       │   └── StepReview.tsx
│       ├── EventManagement/
│       │   ├── RegistrationsList.tsx
│       │   ├── AnalyticsDashboard.tsx
│       │   └── EmailBlast.tsx
│       └── Registration/
│           ├── RegistrationForm.tsx
│           └── PaymentForm.tsx
├── hooks/
│   ├── useLiveEvents.ts ✅
│   └── useEventManagement.ts ❌ NEEDED
├── services/
│   └── eventsService.ts ✅
└── types/
    └── eventTypes.ts ✅

supabase/
├── functions/
│   ├── create-payment/ ✅
│   ├── verify-payment/ ✅
│   └── send-registration-notification/ ❌ NEEDED
└── migrations/
    └── [latest]_event_system.sql ✅
```

---

## 10. TESTING CHECKLIST

### Database
- [ ] Can create event with all fields
- [ ] Can register for event (free)
- [ ] Can register for event (paid)
- [ ] Can cancel registration
- [ ] Can report event
- [ ] RLS prevents unauthorized access
- [ ] Triggers update attendee_count correctly

### Frontend
- [ ] Event creation wizard works end-to-end
- [ ] Events display correctly on /convene
- [ ] Event details sidebar shows correct data
- [ ] Registration flow completes successfully
- [ ] Payment flow redirects correctly
- [ ] User dashboard shows registered events
- [ ] Creator dashboard shows created events
- [ ] Social media links display correctly
- [ ] Contact host opens dialog
- [ ] Report event submits correctly
- [ ] Copy event link works

### Edge Functions
- [ ] create-payment returns checkout URL
- [ ] verify-payment validates session
- [ ] send-registration-notification sends email
- [ ] Error handling works properly

### Email
- [ ] Registration confirmation sent to attendee
- [ ] New registration alert sent to creator
- [ ] Emails render correctly
- [ ] Links in emails work

---

## 11. DEMO vs PRODUCTION

### Current Demo Features (To Remove/Update)
1. **EventDemoDialogs.tsx**
   - Shows demo explanation messages
   - ⚠️ Replace with actual registration flow

2. **Hardcoded Data**
   - EventPresenterSection - hardcoded presenter
   - EventSocialSection - hardcoded social links
   - ⚠️ Make all data dynamic from database

3. **Mock Functionality**
   - "Contact Host" shows demo dialog
   - "Report Event" shows demo dialog
   - ⚠️ Implement real functionality

### Production Requirements
1. Real user authentication required
2. Real payment processing with Stripe
3. Real email notifications via Resend
4. Real-time updates using Supabase realtime
5. Error handling and validation
6. Loading states and optimistic UI
7. SEO optimization for event pages
8. Analytics tracking
9. Image optimization and CDN
10. Mobile responsiveness

---

## SUMMARY

**What Works:**
- ✅ Database schema is complete and robust
- ✅ Events can be viewed and filtered
- ✅ Detailed event information displayed
- ✅ Stripe payment infrastructure ready
- ✅ Social media fields added to profiles
- ✅ Event reporting structure in place

**What's Missing:**
- ❌ Event creation interface
- ❌ Event management dashboard
- ❌ Complete registration flow
- ❌ Email notifications
- ❌ User event dashboard (My Events)
- ❌ Dynamic creator information
- ❌ Unique shareable event URLs
- ❌ Contact host functionality
- ❌ Report event functionality

**Priority Order:**
1. Event creation wizard
2. Dynamic event data (creator info, social media)
3. Unique event URLs and sharing
4. Complete registration flow
5. Event management dashboard
6. Email notifications
7. User event dashboard
8. Contact/Report functionality
9. Advanced features (analytics, check-ins, etc.)

**Estimated Development Time:**
- Phase 1 (Core): 2 weeks
- Phase 2 (Management): 2 weeks
- Phase 3 (Advanced): 2-3 weeks
- **Total: 6-7 weeks for MVP**

---

This breakdown provides everything your engineers need to complete the event platform. The database is solid, payment infrastructure is ready, and the frontend needs the missing pieces listed above to go from demo to production.
