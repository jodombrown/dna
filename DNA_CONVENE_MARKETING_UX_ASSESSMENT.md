# DNA | CONVENE – Marketing & UX Concept Assessment

**Platform:** Diaspora Network of Africa (DNA)  
**Focus Area:** CONVENE Pillar (Events + Groups/Communities)  
**Assessment Date:** November 17, 2025  
**Assessment Type:** Marketing/Landing Experience → Product Alignment

---

## 1. Overview

### Purpose
This assessment documents the current state of the `/convene` marketing/landing page experience to inform the development of the authenticated `/dna/convene` product experience. The goal is to understand what story is being told, identify gaps between marketing promises and product capabilities, and provide actionable recommendations for evolving the marketing page to serve as a clean front door for the actual product.

### Key Findings Summary
- **Marketing page exists but is minimal** – `/convene` currently uses a generic "events discovery" interface with sample data
- **Strong component foundation** – Reusable card components, carousel patterns, and sidebar detail views are well-designed
- **Inconsistent mental models** – Some confusion between "events", "communities", "groups", and "spaces" terminology
- **Missing narrative bridge** – No clear explanation of how Convene connects to the broader DNA platform or other 5Cs
- **Product-ready components exist** – Many components built for `/dna/convene` are already functional but not represented in marketing

### DNA Context
DNA is structured around the 5Cs:
1. **Connect** – People & profiles
2. **Convene** – Events & groups/community gatherings ← **This assessment**
3. **Collaborate** – Project workspaces & execution
4. **Contribute** – Opportunities, capital, skills, resources
5. **Convey** – Stories, updates, narrative layer

Convene is the "heartbeat" – it turns connections into gatherings, and gatherings into collaboration and impact.

---

## 2. Code & Routes Map for `/convene`

### Public Marketing Routes
| Route | File | Purpose |
|-------|------|---------|
| `/convene` | `src/pages/Convene.tsx` | Main marketing landing page for Convene pillar |
| `/convene/category/:category` | `src/pages/ConveneCategoryPage.tsx` | Category-specific event browsing |
| `/convene/featured-calendars` | `src/pages/FeaturedCalendarsPage.tsx` | Featured calendar/organizer showcase |
| `/convene/local-events` | `src/pages/LocalEventsPage.tsx` | Local/geo-based event discovery |
| `/convene-example` | `src/pages/ConveneExample.tsx` | Legacy example page (redirects to `/dna/convene`) |

### Authenticated Product Routes (for reference)
| Route | File | Purpose |
|-------|------|---------|
| `/dna/convene` | `src/pages/dna/convene/ConveneHub.tsx` | Main hub for logged-in users |
| `/dna/convene/events` | `src/pages/dna/convene/EventsIndex.tsx` | Event browsing and calendar |
| `/dna/convene/events/:id` | `src/pages/dna/convene/EventDetail.tsx` | Single event detail view |
| `/dna/convene/events/new` | `src/pages/dna/convene/CreateEvent.tsx` | Event creation form |
| `/dna/convene/events/:id/edit` | `src/pages/EditEventPage.tsx` | Edit existing event |
| `/dna/convene/my-events` | `src/pages/dna/convene/MyEvents.tsx` | User's organized/registered events |
| `/dna/convene/groups` | `src/pages/dna/convene/GroupsBrowse.tsx` | Browse groups/communities |
| `/dna/convene/groups/:slug` | `src/pages/GroupDetailsPage.tsx` | Single group detail view |
| `/dna/convene/groups/:slug/events` | `src/pages/dna/convene/GroupEventsPage.tsx` | Group-specific events |

### Key Components (Reusable Across Marketing & Product)

**Event Display Components:**
- `src/components/connect/tabs/ConnectEventsTab.tsx` – Main events grid layout (currently used on `/convene`)
- `src/components/connect/PopularEventsSection.tsx` – Carousel of featured events with horizontal scroll
- `src/components/connect/ModernEventCard.tsx` – Primary event card component (banner image, metadata, CTA)
- `src/components/connect/EventRegistrationSidebar.tsx` – Detailed event view in sliding sidebar
- `src/components/convene/EventCalendarView.tsx` – Calendar grid view using `react-big-calendar`
- `src/components/convene/MyEventsWidget.tsx` – Dashboard widget for user's events (product-side)
- `src/components/convene/RegisteredEventsWidget.tsx` – Dashboard widget for registered events

**Marketing/Landing Components:**
- `src/components/platform/ConveneSection.tsx` – Swipeable card stack for landing page hero/showcase
- `src/components/connect/EventCategoriesSection.tsx` – Grid of event category cards
- `src/components/connect/FeaturedCalendarsSection.tsx` – Showcase of featured event organizers
- `src/components/connect/LocalEventsSection.tsx` – Geo-based event recommendations

**Shared UI Primitives:**
- `src/components/ui/carousel.tsx` – Embla carousel with wheel gestures
- `src/components/ui/sheet.tsx` – Radix sliding sidebar/drawer
- `src/components/ui/badge.tsx` – Tag/label badges for event types, format (virtual/hybrid/in-person)

**Data & Logic:**
- `src/data/sampleConveneEvents.ts` – Sample event data for marketing demos (17 events)
- `src/hooks/useLiveEvents.ts` – React hook for fetching real events from Supabase
- `src/hooks/useConveneLogic.ts` – State management for Convene-specific UI (legacy, may need refactor)
- `src/services/eventsService.ts` – Event search/filter API service
- `src/utils/eventFilters.ts` – Client-side event filtering logic
- `src/utils/eventHelpers.ts` – Data transformation helpers (DB ↔ App formats)

**Types:**
- `src/types/events.ts` – Modern event type definitions (aligned with new DB schema)
- `src/types/eventTypes.ts` – Legacy event types (backward compatibility)
- `src/types/groups.ts` – Group/community type definitions
- `src/types/search.ts` – Search result types (includes Event type)

**Styling:**
- `src/components/convene/EventCalendarView.css` – Custom CSS for react-big-calendar theming
- `src/index.css` – Global design system tokens (DNA color palette, semantic colors)
- `tailwind.config.ts` – DNA brand colors extended into Tailwind utilities

---

## 3. Current Page Structure & Layout

### `/convene` (Main Marketing Page)

**Current Implementation:**
The current `/convene` route is *minimal*. It does NOT have a dedicated hero section, multi-section narrative, or clear CTAs. Instead, it simply renders:
1. A container with padding
2. The `ConnectEventsTab` component (which was originally built for the Connect page)
3. An `EventRegistrationSidebar` that opens when clicking an event
4. A footer

**Page Sections (as rendered by ConnectEventsTab):**

#### Section 1: Header / Introduction
- **Component:** Inline in `ConnectEventsTab`
- **Layout:** Centered text block
- **Content:**
  - Heading: "Discover Events"
  - Subheading: "Explore, share, and create events near you, building meaningful connections through gatherings that matter"
- **Purpose:** Generic introduction to event discovery
- **Assessment:** Generic, not Convene-specific. Doesn't position Convene as the "heartbeat" of DNA.

#### Section 2: Popular Events
- **Component:** `PopularEventsSection`
- **Layout:** Horizontal scrolling carousel (Embla) with navigation arrows
  - Desktop: 5 cards visible (2xl breakpoint), scales down to 1 card on mobile
  - Each card: 420px height fixed
- **Content:**
  - Section title: "Popular Events ({count})"
  - Subtitle: "Trending events in your network"
  - CTA: "View All" (currently shows a toast explaining it's a preview)
- **Card Details (ModernEventCard):**
  - Top: Event banner image (aspect ratio ~5:2)
  - Overlaid: Event organizer logo (circular, top-left) + Creator profile button (top-right)
  - Content area: Event title, type badge, date/time, location, attendee count
  - Footer: "RSVP Free" button (green) + "View Details" link
- **Interaction:** Click card → opens EventRegistrationSidebar
- **Assessment:** Well-designed, reusable. Already functional for product use.

#### Section 3: Event Categories
- **Component:** `EventCategoriesSection`
- **Layout:** 3-column grid on desktop, responsive stack on mobile
- **Content:**
  - Hardcoded categories: "Networking & Socials", "Tech & Innovation", "Arts & Culture", "Education & Learning", "Health & Wellness", "Business & Finance"
  - Each category: Icon + title + subtitle + "Browse {count} events"
- **Interaction:** Click → navigates to `/convene/category/:slug`
- **Assessment:** Static demo. Not connected to real event data. Needs dynamic event counts.

#### Section 4: Featured Calendars
- **Component:** `FeaturedCalendarsSection`
- **Layout:** Horizontal card grid with scroll
- **Content:**
  - Mock organizers/calendars (diaspora chapters, organizations)
  - "Subscribe to Calendar" CTAs
- **Interaction:** Click → navigates to `/convene/featured-calendars`
- **Assessment:** Concept is strong (calendar subscriptions are valuable) but not yet wired to real data.

#### Section 5: Local Events (Geo-based Discovery)
- **Component:** `LocalEventsSection`
- **Layout:** Map placeholder + event list
- **Content:**
  - "Events Near You" heading
  - Map showing pins (currently static/demo)
  - List of nearby events
- **Interaction:** Click → navigates to `/convene/local-events`
- **Assessment:** Important for in-person event discovery. Not yet geo-enabled.

#### Footer
- **Component:** `Footer` (shared across DNA platform)
- **Content:** Links to About, Contact, Terms, Privacy, social links
- **Assessment:** Standard, no Convene-specific messaging

---

### Missing Sections (Expected for Marketing Landing Page)

The current `/convene` page is **missing critical marketing elements**:

1. **Hero Section**
   - No headline explaining what Convene is
   - No primary CTA (e.g., "Browse Events", "Host an Event", "Join DNA")
   - No visual that shows events + groups in action

2. **Value Proposition**
   - No "Why Convene?" or "How it works" section
   - No clear differentiation from Eventbrite, Meetup, etc.
   - No explanation of DNA-specific benefits (network effects, 5C integration)

3. **Social Proof**
   - No testimonials from event organizers or attendees
   - No stats (e.g., "1,200+ events hosted", "50+ cities worldwide")
   - No logos of partner organizations or chapters

4. **Call to Action (Bottom)**
   - No clear signup CTA for beta access or account creation
   - No "Create Your First Event" pathway

5. **Narrative Bridge to Other 5Cs**
   - No mention of how Convene connects to Connect, Collaborate, Contribute, Convey
   - Feels isolated, not part of a platform ecosystem

---

## 4. Visual & Interaction Design

### Typography

**Heading Styles:**
- Primary headings: `text-2xl` or `text-3xl`, `font-bold`, `text-gray-900`
- Subheadings: `text-gray-600`, `text-lg`
- Font family: `font-sans` (Inter) for UI, `font-serif` (Lora) for emphasis
- **Assessment:** Clean, professional, but not particularly distinctive for Convene vs other DNA pages.

**Body Text:**
- Standard: `text-base`, `text-gray-600` or `text-gray-700`
- Muted text: `text-gray-500` or `text-muted-foreground`

**Convene-Specific Typography:**
- None identified. No custom heading treatments or decorative fonts specific to events/gatherings theme.

### Color & Imagery

**Brand Colors in Use:**
The DNA color palette is extensive (see `src/index.css` and `tailwind.config.ts`):

**Primary Brand Colors:**
- `--dna-forest` (183 28% 28%) – Deep green, heritage & stability
- `--dna-emerald` (160 35% 45%) – Sage green, growth & opportunity
- Used as primary CTA colors, hover states, and accents

**Cultural Warm Tones (African Heritage):**
- `--dna-terra` (18 60% 55%) – Terra cotta
- `--dna-ochre` (38 70% 50%) – Ochre/golden earth
- `--dna-sunset` (25 85% 55%) – Sunset orange
- `--dna-purple` (270 60% 55%) – Royal purple
- **Used in:** `ConveneSection` card gradients (e.g., `from-dna-copper to-dna-gold`)

**Legacy/Updated Colors:**
- `--dna-copper` (25 75% 46%) – Warm copper (WCAG AA compliant)
- `--dna-gold` (45 85% 35%) – Vibrant gold (WCAG AA compliant)
- `--dna-mint` (170 45% 75%) – Fresh mint
- `--dna-crimson` (0 100% 40%) – Bold crimson

**Where Colors Appear:**
- **Event cards:** Primarily white backgrounds with brand color accents on badges, CTAs, hover states
- **Gradients:** `ConveneSection` uses multi-color gradients (e.g., `from-dna-copper to-dna-gold`, `from-dna-ochre to-dna-emerald`) to visually differentiate event categories
- **Buttons:** 
  - Primary CTA: `bg-dna-emerald` with `hover:bg-dna-forest`
  - Secondary CTA: `variant="outline"` with brand color borders
- **Badges:** Event type badges use muted backgrounds with brand color text

**Imagery:**
- **Event banners:** Sourced from Unsplash, thematically matched to event type (tech, culture, business, etc.)
- **Event logos/icons:** Circular avatars, also from Unsplash or placeholder images
- **No custom DNA Convene illustrations or icons** – relies on Lucide icons (Calendar, MapPin, Users, Clock, Globe, Video, etc.)

**Assessment:**
- Strong color system with African heritage tones
- Gradients add visual interest but may need refinement for accessibility (some gradient text combinations fail WCAG contrast)
- Missing Convene-specific visual identity (e.g., custom illustrations of people gathering, events in action, etc.)

### Layout Patterns

**Desktop Layout:**
- Container: `container mx-auto px-4` (max-width: 1400px on 2xl screens)
- Section spacing: `space-y-16` (4rem vertical gaps between sections)
- Card grids: 3-5 columns depending on content type and breakpoint

**Responsive Behavior:**
- Carousel-based sections: Horizontal scroll with wheel gestures enabled
- Grid sections: Stack to 1 column on mobile
- Event sidebar: Full-width sheet on mobile, max-width 600px on desktop

**Z-index Management:**
- Event sidebar: `z-index: 1000`
- Dialogs/modals on top of sidebar: `z-index: 1100`
- **Issue:** No z-index conflicts noted, but documentation would help prevent future issues

### Component Patterns

**Reusable Components in Convene Context:**

1. **ModernEventCard**
   - Banner image (aspect ratio ~5:2)
   - Overlaid elements: organizer logo, creator profile button
   - Content: title, type badge, date/time, location, attendee count
   - CTA: "RSVP Free" + "View Details"
   - Hover state: `hover:shadow-xl`, `hover:-translate-y-1`, image scale on hover
   - **Assessment:** Production-ready, well-designed, accessible

2. **EventRegistrationSidebar**
   - Sliding sheet from right
   - Navigation header: Previous/Next event arrows + close button
   - Event header: Banner image + title + metadata
   - Sections: Ticket/RSVP, Event Details, About, Location (map placeholder), Presenter, Host, Actions (contact/report), Social sharing
   - **Assessment:** Feature-rich, feels like a real product. Could be used in authenticated product as-is.

3. **Badge System**
   - Event type: `Conference`, `Workshop`, `Networking`, `Social`, `Webinar`
   - Format: `Virtual`, `Hybrid`, `In-Person` (with icons)
   - Status: `Featured`, `Sold Out`, `Free`, etc.
   - **Assessment:** Comprehensive, semantic, accessible

4. **Carousel (Embla)**
   - Horizontal scroll with navigation arrows
   - Wheel gesture support
   - Responsive column counts
   - **Assessment:** Smooth, performant, good UX

**Convene-Themed Components:**
- **ConveneSection** (landing page swipeable card stack): Gradient cards with category labels ("Innovation Summits", "Cultural Gatherings", etc.)
- **EventCalendarView**: Calendar grid with color-coded event formats
- **Assessment:** ConveneSection feels more like a demo/landing component. EventCalendarView is product-ready.

### Interaction & Animation

**Hover States:**
- Cards: Shadow elevation, subtle y-axis translation (-1px)
- Images: Scale transform (105%) on parent hover
- Buttons: Background color shift, border color shift
- **Assessment:** Polished, consistent, feels premium

**Loading States:**
- Not prominently featured on marketing page (uses static sample data)
- Product pages: Skeleton loaders, spinners

**Empty States:**
- Not needed on marketing page (always shows sample data)
- Product pages: "No events found" with CTAs to create or adjust filters

**Error Handling:**
- Marketing page: Minimal (sample data always succeeds)
- Product pages: Toast notifications for errors, fallback images for broken event banners

---

## 5. UX Flows & Messaging – What Story Is Convene Telling Now?

### Current User Journey on `/convene`

**Step 1: Arrival**
- User lands on `/convene` (likely from main nav or marketing link)
- Sees: "Discover Events" heading + generic subheading
- **Friction:** No context about *why* DNA events are different, or what Convene means in the DNA ecosystem

**Step 2: Browse Events**
- User scrolls through "Popular Events" carousel
- Sees: 17 sample events (tech summits, diaspora mixers, cultural nights, webinars, etc.)
- **Friction:** No way to filter by date, location, or personal interests. "View All" just shows a toast.

**Step 3: Event Detail Exploration**
- User clicks an event card → EventRegistrationSidebar opens
- Sees: Full event details, location, presenter, host profile, social proof
- CTA: "Get Ticket" (demo button shows explanation that registration is a beta feature)
- **Friction:** Can't actually register. Sidebar feels product-ready, but it's a demo.

**Step 4: Category Browsing**
- User scrolls to "Event Categories"
- Clicks a category (e.g., "Tech & Innovation")
- Navigates to `/convene/category/:slug`
- **Friction:** Category pages don't exist yet (or show placeholder content)

**Step 5: Featured Calendars / Local Events**
- User explores other sections
- Clicks "Featured Calendars" or "Local Events"
- **Friction:** These pages feel incomplete, navigating to them doesn't provide real value

**Step 6: Footer**
- User scrolls to footer
- Sees: Standard DNA footer links
- **Friction:** No clear "next step" CTA. No signup, no "Create Event", no "Join Beta"

### Who Is the Page Speaking To?

**Inferred Personas (based on content/copy):**
1. **Diaspora Event Attendees** – "Explore events near you, building meaningful connections"
2. **Event Organizers** – Implied by categories like "Networking & Socials", "Tech & Innovation"
3. **General DNA Community** – Reference to "your network" suggests existing users

**Copy Tone:**
- Friendly, inclusive, aspirational
- Emphasizes "meaningful connections" and "gatherings that matter"
- Not overly technical or business-focused

**Assessment:**
- The page speaks to *attendees* more than *organizers*
- Missing: Value prop for event organizers ("Host your next diaspora event on DNA")
- Missing: Clear call to join DNA if not already a member

### Primary Call to Action

**Current CTAs:**
1. "RSVP Free" (on event cards) → Opens demo sidebar
2. "View All" (popular events section) → Shows toast explaining it's a demo
3. "Browse {count} events" (category cards) → Navigates to non-existent category pages
4. "Subscribe to Calendar" (featured calendars) → Demo action

**Assessment:**
- **No primary conversion CTA** – No "Sign Up", "Join Beta", "Create Account"
- **No organizer CTA** – No "Host an Event", "Create Your First Event"
- **All CTAs are demo/placeholder** – Nothing drives real user action

### Main Promises/Benefits Communicated

**Explicit Promises (from copy):**
1. "Explore, share, and create events near you" – Event discovery + creation
2. "Building meaningful connections through gatherings that matter" – Community focus
3. "Trending events in your network" – Personalized, network-driven recommendations
4. Event categories span tech, culture, education, health, business, finance – Diverse, inclusive

**Implicit Promises (from UI/features):**
1. Event registration/RSVP
2. Calendar subscriptions
3. Location-based discovery
4. Presenter/organizer profiles
5. Social sharing

**Assessment:**
- Promises are **broad and aspirational**
- Not specific to DNA's unique value (e.g., "diaspora-focused", "Africa-centric", "network effects across 5Cs")
- Features shown in UI (sidebar, calendar, etc.) are more advanced than the copy suggests

### How Clearly Does the Page Explain Events, Groups, Communities?

**Events:**
- **Well-explained:** Event cards, sidebar, calendar all make "events" very clear
- Types shown: Conference, Workshop, Networking, Social, Webinar
- Formats shown: In-Person, Virtual, Hybrid

**Groups/Communities:**
- **Not mentioned at all** on `/convene` marketing page
- Groups are a key part of `/dna/convene` product (see routes like `/dna/convene/groups`)
- **Missing:** No explanation that Convene = Events + Groups
- **Missing:** No visual representation of groups, chapters, or recurring community gatherings

**Connection from Convene → Other 5Cs:**
- **Not mentioned**
- No explanation that Convene → Collaborate (event leads to project)
- No explanation that Convene → Contribute (fundraising for events, volunteer opportunities)
- No explanation that Convene → Convey (story-sharing from events)

**Assessment:**
- `/convene` currently feels like a **standalone event discovery platform**
- Doesn't communicate that it's part of the DNA ecosystem
- Groups are entirely absent from the narrative

---

## 6. Gaps vs DNA | CONVENE Product Vision

### Marketing Story Ahead of Product

**Features shown in marketing/UI that are NOT fully built:**

1. **Category-specific event pages** (`/convene/category/:category`)
   - Marketing shows: 6 event categories with "Browse events" CTAs
   - Product reality: Category pages don't exist or are placeholders

2. **Featured Calendars** (`/convene/featured-calendars`)
   - Marketing shows: Subscribe to organizer calendars (chapters, organizations)
   - Product reality: Calendar subscription feature not implemented

3. **Local Events** (`/convene/local-events`)
   - Marketing shows: Map-based geo discovery, "Events Near You"
   - Product reality: No geolocation, no map integration

4. **Event Registration** (via EventRegistrationSidebar)
   - Marketing shows: "Get Ticket", "RSVP Free" buttons
   - Product reality: Registration works in authenticated product (`/dna/convene/events/:id`), but not on marketing page (correctly shows demo explanation)

5. **Personalized "Trending in Your Network"**
   - Marketing copy: "Trending events in your network"
   - Product reality: Uses static sample data, no personalization

### Product Vision Ahead of Marketing

**Features that exist in `/dna/convene` but are NOT shown in `/convene` marketing:**

1. **Groups/Communities**
   - Product: Full groups system (`/dna/convene/groups`, `/dna/convene/groups/:slug`)
   - Marketing: Not mentioned at all
   - **Gap:** Groups are 50% of Convene's value, but marketing only shows events

2. **Event Creation**
   - Product: Full event creation form (`/dna/convene/events/new`)
   - Marketing: Copy mentions "create events" but no CTA or explanation of how

3. **My Events Dashboard**
   - Product: `/dna/convene/my-events` shows user's organized + registered events
   - Marketing: No preview of logged-in experience, no "See your upcoming events" CTA

4. **Event Analytics**
   - Product: Organizer analytics (`/dna/convene/events/:id/analytics`, `/dna/convene/analytics`)
   - Marketing: No mention that organizers get insights, analytics, attendee data

5. **RSVP Statuses**
   - Product: Going, Maybe, Not Going, Waitlist
   - Marketing: Only shows "RSVP Free"

6. **Group Events**
   - Product: Groups can host events (`/dna/convene/groups/:slug/events`)
   - Marketing: No explanation of this workflow

7. **Event Recommendations (ADIN)**
   - Product: AI-driven event recommendations based on user profile
   - Marketing: No mention of smart recommendations

8. **Calendar View**
   - Product: Full calendar grid view (`EventCalendarView`)
   - Marketing: Not shown (could be a great visual on landing page)

### Term/Language Clashes or Confusion

**Inconsistent Terminology:**

1. **"Communities" vs "Groups" vs "Spaces"**
   - `src/types/groups.ts` defines "Groups"
   - Some DB tables use "communities" (`community_events`, `community_posts`)
   - Product routes use "groups" (`/dna/convene/groups`)
   - Marketing page doesn't mention either
   - **Risk:** User confusion when terms change between marketing → product

2. **"Events" vs "Convenings"**
   - Marketing page title: "Convene"
   - Content/copy: "Events"
   - DNA branding: "Convene" implies gatherings, convenings, assemblies
   - **Risk:** "Events" feels generic (like Eventbrite). "Convenings" feels more unique, culturally rooted.

3. **"Spaces" in Other Contexts**
   - Collaborate pillar uses "Spaces" (`collaboration_spaces`)
   - Could clash with "Group Spaces" if not clearly differentiated
   - **Recommendation:** Reserve "Spaces" for Collaborate, use "Groups" or "Communities" for Convene

4. **"Chapters" vs "Groups"**
   - Sample data mentions "DNA NYC Chapter", "DNA Toronto Hub"
   - These are shown as event hosts, not as groups
   - **Question:** Are chapters the same as groups? If so, marketing should clarify.

### Data Model Gaps

**Type Definitions:**
- `src/types/events.ts` – Modern, comprehensive event types (aligned with new DB schema)
- `src/types/eventTypes.ts` – Legacy types (some fields marked as optional for backward compatibility)
- **Gap:** Two event type files could cause confusion. Recommend deprecating `eventTypes.ts` and migrating fully to `events.ts`.

**Sample Data:**
- `src/data/sampleConveneEvents.ts` – 17 sample events
- **Gap:** Sample data uses legacy format, doesn't include all new fields (e.g., `group_id`, `requires_approval`, `allow_guests`)
- **Recommendation:** Update sample data to match modern schema

---

## 7. Recommendations & Next Steps

### Section 1: Refined `/convene` Marketing Page Structure

**Proposed Page Flow:**

#### Hero Section (NEW)
**Purpose:** Immediate clarity on what Convene is and why it matters

**Layout:** Full-width, centered, image or gradient background
- **Headline:** "Convene: Where the Diaspora Gathers"
- **Subheadline:** "Discover events, join communities, and turn connections into collaboration across the African diaspora."
- **Primary CTA:** "Explore Events" (scrolls to Popular Events)
- **Secondary CTA:** "Host an Event" (navigates to `/auth` or `/dna/convene/events/new` if logged in)
- **Visual:** Hero image or illustration showing diaspora gathering (conference, cultural event, networking mixer)
- **Trust Badge:** "1,200+ events hosted | 50+ cities worldwide | 10,000+ community members"

**Components to Build:**
- New `ConveneHero` component (similar to other landing page heroes)
- Reuse DNA gradient backgrounds and brand colors

---

#### What Is Convene? (NEW)
**Purpose:** Explain the dual nature of Convene (Events + Groups)

**Layout:** 2-column, icon-led
- **Left Column:**
  - Icon: Calendar
  - Heading: "Events & Gatherings"
  - Copy: "From tech summits to cultural celebrations, find and create events that matter to the diaspora."
- **Right Column:**
  - Icon: Users
  - Heading: "Communities & Groups"
  - Copy: "Join local chapters, affinity groups, and networks that keep the gatherings going."
- **Bottom:** "Convene is where connections become convenings, and convenings become collaboration."

**Components to Build:**
- `ConveneValueProp` component (2-column icon + copy pattern)

---

#### Popular Events (EXISTING – Enhanced)
**Keep:** Current `PopularEventsSection` with carousel
**Enhance:**
- Add filter bar above carousel: "All Events", "Virtual", "In-Person", "This Week", "This Month"
- Make "View All" CTA functional → navigates to `/dna/convene/events` (if logged in) or `/auth` with redirect (if not)

**No new components needed** – just wire up CTAs and add filter UI

---

#### How It Works (NEW)
**Purpose:** Show user journey from discovery → RSVP → attendance → collaboration

**Layout:** 3-step horizontal flow with icons
1. **Discover** – Browse events by category, location, or interests
2. **RSVP** – Register for free or paid events, sync to calendar
3. **Connect** – Meet attendees, join groups, collaborate on projects

**Visual:** Could show screenshots or illustrations of event card → sidebar → group page

**Components to Build:**
- `ConveneHowItWorks` component (3-step flow pattern, reusable for other 5Cs)

---

#### Event Categories (EXISTING – Enhanced)
**Keep:** Current `EventCategoriesSection`
**Enhance:**
- Make dynamic: Show real event counts from DB
- Add "All Categories" CTA → navigates to filterable event index

**Wire Up:** Connect to real event data, replace hardcoded counts

---

#### Featured Communities / Chapters (NEW)
**Purpose:** Introduce groups as a core part of Convene

**Layout:** Horizontal card grid
- Each card: Group avatar, name, member count, location, "Join Group" CTA
- Examples: "DNA NYC Chapter", "African Women in Tech", "Pan-African Climate Coalition"

**Components to Build:**
- `FeaturedGroupsSection` (similar to `FeaturedCalendarsSection`)
- Reuse `ModernEventCard` pattern but adapt for groups

---

#### Convene Across the 5Cs (NEW)
**Purpose:** Show how Convene connects to Connect, Collaborate, Contribute, Convey

**Layout:** 4-column grid or carousel
- **Connect:** "Meet people at events, grow your network"
- **Collaborate:** "Turn meetups into projects and partnerships"
- **Contribute:** "Find volunteer opportunities, fund initiatives"
- **Convey:** "Share stories from events, amplify impact"

**Visual:** Could use icons or small illustrations for each C

**Components to Build:**
- `Convene5CIntegration` component (shows cross-pillar connections)

---

#### Social Proof / Testimonials (NEW)
**Purpose:** Build trust with quotes from event organizers and attendees

**Layout:** 3-column grid or carousel
- **Testimonial 1:** Event organizer – "Convene helped us connect 200+ diaspora professionals in Toronto..."
- **Testimonial 2:** Attendee – "I found my co-founder at a DNA tech mixer in Lagos..."
- **Testimonial 3:** Chapter leader – "Our monthly meetups have grown from 15 to 80 people..."

**Components to Build:**
- `ConveneTestimonials` component (testimonial card pattern)

---

#### Local Events Near You (EXISTING – Enhanced)
**Keep:** Current `LocalEventsSection`
**Enhance:**
- Make functional: Add geolocation, real map integration
- Fallback: If location denied, show events in major cities

**Wire Up:** Integrate with geolocation API, map component (Mapbox or Google Maps)

---

#### Call to Action – Join DNA (NEW)
**Purpose:** Convert visitors to signups

**Layout:** Full-width, centered, accent background (e.g., `bg-dna-emerald`)
- **Headline:** "Join the Diaspora Network"
- **Copy:** "Access thousands of events, connect with communities, and turn gatherings into impact."
- **Primary CTA:** "Get Early Access" (navigates to `/auth` or `/invite`)
- **Secondary CTA:** "Learn More About DNA" (navigates to `/about`)

**Components to Build:**
- `ConveneCTASection` component (full-width CTA banner, reusable)

---

#### Footer (EXISTING – Keep as-is)
- No changes needed

---

### Section 2: Specific UI/UX Improvements

**Sections to Add:**
1. Hero Section (top priority)
2. What Is Convene? (dual nature: events + groups)
3. How It Works (user journey)
4. Featured Communities/Chapters
5. Convene Across the 5Cs
6. Social Proof/Testimonials
7. Join DNA CTA

**Sections to Enhance:**
1. Popular Events → Add filter bar, wire up "View All"
2. Event Categories → Make dynamic with real counts
3. Local Events → Add geolocation, real map

**Sections to Merge:**
- None

**Sections to Remove:**
- None (all existing sections are valuable)

**Visual Representation Improvements:**

1. **Show Groups Visually**
   - Add group cards (avatar, name, member count, "Join" CTA)
   - Show example group pages in "How It Works"

2. **Show Logged-In Experience Preview**
   - Screenshot or illustration of `/dna/convene` dashboard
   - "My Events" widget preview
   - "My Groups" widget preview

3. **Calendar View on Marketing Page**
   - Consider adding `EventCalendarView` to show visual richness
   - OR: Screenshot of calendar view in "How It Works"

4. **Show Ongoing Convenings**
   - Not just one-time events, but recurring meetups, monthly gatherings, standing circles
   - Example: "DNA Toronto Meetup – 3rd Thursday of every month"

**Primary CTAs to Tie to Real Funnel:**

1. **"Explore Events"** (Hero) → `/dna/convene/events` (if logged in) or `/auth` with redirect
2. **"Host an Event"** (Hero) → `/dna/convene/events/new` (if logged in) or `/auth` with redirect
3. **"Get Early Access"** (Bottom CTA) → `/invite` or `/auth`
4. **"Join Group"** (Featured Communities) → `/dna/convene/groups/:slug` (if logged in) or `/auth` with redirect
5. **"View All Events"** (Popular Events) → `/dna/convene/events`

---

### Section 3: Reusable Components (Marketing vs Product)

**Keep as-is for Both Marketing & Product:**

1. `ModernEventCard` – Event card component
2. `EventRegistrationSidebar` – Event detail sidebar
3. `PopularEventsSection` – Event carousel
4. `EventCalendarView` – Calendar grid view
5. `Badge` system – Event type, format, status badges
6. `Carousel` (Embla) – Horizontal scroll pattern

**Recommendation:** These components are production-ready and should be used identically in both `/convene` (marketing) and `/dna/convene` (product) for consistency.

---

**Keep for Marketing Only:**

1. `ConveneSection` – Swipeable card stack (landing page hero demo)
2. `FeaturedCalendarsSection` – Calendar subscription showcase (until feature is built)
3. Hero components (to be built)
4. Testimonial components (to be built)

**Recommendation:** These are narrative/storytelling components. Don't bloat the product UI with them.

---

**Keep for Product Only:**

1. `MyEventsWidget` – Dashboard widget for user's events
2. `RegisteredEventsWidget` – Dashboard widget for registered events
3. Event creation form (`CreateEvent`)
4. Event edit form (`EditEventPage`)
5. Event analytics (`EventAnalytics`, `OrganizerAnalytics`)
6. Group detail pages (`GroupDetailsPage`, `GroupSettingsPage`)

**Recommendation:** These are functional, logged-in components. Don't show them on marketing page (but could screenshot them in "How It Works").

---

### Section 4: Design System Alignment

**Colors:**
- Continue using DNA brand palette (`dna-forest`, `dna-emerald`, `dna-terra`, `dna-ochre`, `dna-sunset`, `dna-purple`)
- **For Convene specifically:** Recommend emphasizing `dna-emerald` (growth, gatherings) and warm tones (`dna-terra`, `dna-sunset`) for cultural warmth
- **Gradients:** Use sparingly, ensure WCAG AA contrast for text overlays

**Typography:**
- Keep `font-serif` (Lora) for headlines when emphasizing cultural heritage, storytelling
- Keep `font-sans` (Inter) for UI, body text
- **Recommendation:** Consider using `font-serif` in Convene hero: "Convene: Where the Diaspora Gathers"

**Iconography:**
- Continue using Lucide icons (Calendar, MapPin, Users, etc.)
- **Add:** Consider custom illustrations for hero, "How It Works", testimonials (show people gathering, events in action)

**Spacing & Layout:**
- Keep `container mx-auto px-4` for horizontal consistency
- Keep `space-y-16` for section gaps
- **Recommendation:** Ensure mobile spacing is equally generous (test on small screens)

---

### Section 5: Content & Messaging Recommendations

**Headline Refinement:**
- Current: "Discover Events"
- Proposed: "Convene: Where the Diaspora Gathers"
- **Why:** More culturally rooted, aligns with DNA brand voice

**Subheadline Refinement:**
- Current: "Explore, share, and create events near you, building meaningful connections through gatherings that matter"
- Proposed: "Discover events, join communities, and turn connections into collaboration across the African diaspora."
- **Why:** Adds "communities", makes diaspora focus explicit, ties to collaboration (bridges to other 5Cs)

**Event Category Labels:**
- Current: Generic categories (Tech & Innovation, Arts & Culture, etc.)
- Proposed: Add diaspora-specific framing
  - "Tech & Innovation" → "African Tech & Innovation"
  - "Arts & Culture" → "Afro-Diaspora Arts & Culture"
  - "Business & Finance" → "Diaspora Investment & Business"
- **Why:** Reinforces that these are not generic events, they're diaspora-specific

**Group/Community Language:**
- Recommend: Use "Communities" on marketing page (feels more inclusive, welcoming)
- Use "Groups" in product UI (more functional, clear)
- Use "Chapters" for geographic DNA nodes (e.g., "DNA NYC Chapter")

**"Convenings" vs "Events":**
- Consider using both: "Events & Convenings"
- "Events" for one-time gatherings
- "Convenings" for recurring, ongoing gatherings (monthly meetups, standing circles, chapter meetings)

---

### Section 6: Implementation Roadmap

**Phase 1: Quick Wins (No New Components)**
1. Wire up "View All" CTA → `/dna/convene/events` or `/auth`
2. Wire up "Host an Event" → `/dna/convene/events/new` or `/auth`
3. Update copy: "Discover Events" → "Convene: Where the Diaspora Gathers"
4. Update sample data to match modern event schema
5. Add filter bar above Popular Events

**Phase 2: New Sections (Moderate Lift)**
1. Build `ConveneHero` component
2. Build `ConveneValueProp` component (What Is Convene?)
3. Build `ConveneHowItWorks` component
4. Build `FeaturedGroupsSection` component
5. Build `Convene5CIntegration` component
6. Build `ConveneCTASection` component

**Phase 3: Enhanced Sections (Higher Lift)**
1. Make Event Categories dynamic (real event counts from DB)
2. Add geolocation to Local Events
3. Integrate map component (Mapbox or Google Maps)
4. Build Featured Calendars functionality (calendar subscription)

**Phase 4: Polish & Optimization**
1. Add testimonials (collect real quotes from organizers/attendees)
2. Add stats/social proof (total events, cities, members)
3. A/B test CTAs, headlines
4. SEO optimization (meta tags, structured data)

---

### Section 7: Cross-Pillar Considerations

**How Convene Connects to Other 5Cs:**

1. **Connect → Convene**
   - User browses profiles → sees "Upcoming Events" on profile
   - User sees connection's RSVP → "Join them at this event"
   - **Implementation:** Add event widgets to profile pages

2. **Convene → Collaborate**
   - After event, organizer creates "Project Space" to continue work
   - Example: "African Climate Summit → Climate Action Project Space"
   - **Implementation:** CTA in event sidebar: "Turn this into a project"

3. **Convene → Contribute**
   - Event needs volunteers, sponsors, speakers
   - Example: "Volunteer at African Art Showcase"
   - **Implementation:** Link events to contribution opportunities

4. **Convene → Convey**
   - Attendees share stories from events
   - Example: "I attended DNA Tech Summit – here's what I learned..."
   - **Implementation:** Post composer with "Event Story" mode

**Recommendation:** Add a "Convene in the DNA Ecosystem" section to marketing page showing these flows.

---

## 8. Conclusion

### Current State Summary
- `/convene` marketing page exists but is minimal
- Uses sample data and demo components
- Strong component foundation (cards, sidebar, carousel)
- Missing: Hero, value prop, groups, social proof, clear CTAs

### Product Readiness
- `/dna/convene` product routes are well-structured
- Event creation, editing, analytics are built
- Groups system is functional
- Many components can be reused from marketing → product

### Key Gaps
1. **Marketing doesn't mention groups** (50% of Convene's value)
2. **No clear CTAs** (signup, create event, join group)
3. **No narrative bridge to other 5Cs**
4. **Some features shown but not built** (calendar subscriptions, geo-discovery)

### Top Priorities
1. Add Hero Section with clear value prop
2. Add "What Is Convene?" (events + groups)
3. Add Featured Groups/Communities section
4. Wire up CTAs to real flows (signup, event creation)
5. Update copy to be diaspora-specific

### Long-Term Vision
- `/convene` becomes the clean, inspiring front door for Convene
- Clearly explains events + groups + how they connect to DNA ecosystem
- Converts visitors to signups
- Previews the logged-in experience (`/dna/convene`)
- Feels culturally rooted, not generic

---

**End of Assessment**

This document is ready to be shared with another AI assistant or engineering team to turn into an implementation plan for refining `/convene` and building out `/dna/convene`.
