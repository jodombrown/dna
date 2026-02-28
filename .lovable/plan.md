
# Curated by DNA: Editorial Event Cards

## Overview

Curated events will have a completely distinct visual identity and interaction model from user-hosted events. They'll look like editorial content recommendations -- think "magazine picks" rather than community posts -- with a prominent external source link and a lightweight DNA preview page instead of the full event detail page.

## What Changes

### 1. New Component: `CuratedEventCard`

A dedicated card component (`src/components/convene/CuratedEventCard.tsx`) with an editorial / magazine aesthetic:

- **No amber left-border accent** -- instead uses a subtle DNA emerald gradient top-border (similar to DIA insight cards)
- **"Curated by DNA" badge** with Sparkles icon in the header area (emerald tones, not amber)
- **Source attribution line** showing the external source domain (e.g., "via diasporaafricaconference.com") with an ExternalLink icon
- **Cover image** displayed as a smaller, rounded thumbnail on the left (compact editorial feel) rather than a full-width hero
- **Key info** displayed cleanly: title, date, location, short description (2-line clamp)
- **Two CTAs at the bottom:**
  - "Interested" toggle button (maps to internal RSVP with `going` status) -- uses emerald accent
  - "View Event" button with ExternalLink icon that opens `curated_source_url` in a new tab
- **No organizer section** (since there's no organizer)
- **No attendee count / social proof** on the card itself (kept lightweight)
- Supports `full` and `compact` variants to match existing card system

### 2. New Page: `CuratedEventPreview`

A lightweight preview page (`src/pages/dna/convene/CuratedEventPreview.tsx`) that replaces the full EventDetail for curated events:

- Clean layout with cover image, title, date/time, location, and full description
- Prominent "Register at Source" button linking to `curated_source_url` (opens new tab)
- "Interested" / "Going" / "Maybe" RSVP buttons for internal tracking
- Source attribution with link
- "Curated by DNA" branding
- NO tabs, activity feed, attendees list, organizer card, manage/edit buttons, or other host-specific UI
- Share button retained
- Back navigation retained

### 3. Routing Update

Modify the EventDetail page or the router to detect `is_curated` and render `CuratedEventPreview` instead of the full detail page. The simplest approach: add a check at the top of `EventDetail.tsx` that redirects to/renders the preview component when `event.is_curated === true`.

### 4. Card Usage Integration

Update all surfaces where `ConveneEventCard` renders curated events to use `CuratedEventCard` instead:

- `ConveneDiscovery` / `ConveneHub` listings
- Feed cards (`EventFeedCard` in v2)
- `PopularEventsSection`
- Search results (`EventsResults`)
- Any carousel or widget showing mixed events

The switching logic: check `event.is_curated` and render the appropriate card component.

## Technical Details

### CuratedEventCard Visual Spec

```text
+--------------------------------------------------+
| [2px emerald gradient top border]                 |
|                                                   |
|  [Sparkles] Curated by DNA                        |
|                                                   |
|  [60x80 thumbnail]  Title of the Event            |
|                     Mar 15, 2026 - Houston, US    |
|                     Short description text that    |
|                     wraps to two lines max...      |
|                                                   |
|  via diasporaafricaconference.com [ExternalLink]  |
|                                                   |
|  [Interested]  [View Event ->]                    |
+--------------------------------------------------+
```

- Top border: `linear-gradient(90deg, #4A8D77, #2A7A8C)` (emerald to teal)
- Card background: subtle `from-emerald-50/30 via-transparent` gradient
- Border radius: 16px (matches DNA standard)
- Shadow: `shadow-dna-1` or `shadow-md`

### CuratedEventPreview Page Spec

- Route: same as regular events (`/dna/convene/events/:id`) but renders different component
- Fetches event from Supabase, checks `is_curated`
- Shows: cover image (full width), title, date/time, location, description, source link
- RSVP uses the same `event_attendees` upsert pattern (already works with null organizer)
- No organizer card, no activity feed, no attendees grid, no manage actions

### Files to Create

- `src/components/convene/CuratedEventCard.tsx` -- the editorial card
- `src/pages/dna/convene/CuratedEventPreview.tsx` -- the lightweight detail page

### Files to Modify

- `src/pages/dna/convene/EventDetail.tsx` -- add is_curated check to render CuratedEventPreview
- `src/components/convene/ConveneEventCard.tsx` -- no changes needed (it won't render curated events anymore)
- `src/pages/dna/convene/ConveneDiscovery.tsx` -- switch card component for curated events
- `src/components/feed/v2/cards/EventFeedCard.tsx` -- handle curated events differently in feed
- Any other surfaces rendering event cards with mixed curated/user events
