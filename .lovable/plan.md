
# Curated by DNA: Editorial Event Cards — IMPLEMENTED

## Status: ✅ Complete

### What Was Built

1. **`CuratedEventCard`** (`src/components/convene/CuratedEventCard.tsx`) — Editorial magazine-style card with emerald gradient top border, "Curated by DNA" badge, source attribution, compact thumbnail layout, and dual CTAs (Interested + View Event).

2. **`CuratedEventPreview`** (`src/pages/dna/convene/CuratedEventPreview.tsx`) — Lightweight detail page with cover image, date/time, location, description, prominent "Register at Source" button, and internal RSVP tracking. No organizer card, activity feed, or manage actions.

3. **Routing** — `EventDetail.tsx` detects `is_curated` and renders `CuratedEventPreview` instead of the full detail page.

4. **Card Switching** — `ConveneDiscovery.tsx` uses `CuratedEventCard` for curated events in both the featured carousel and upcoming events list.
