

# Curated Diaspora Events: Perplexity-Powered Event Pipeline

## Overview

Three connected deliverables:
1. An edge function that uses Perplexity to fetch real upcoming diaspora events and seed them into the `events` table
2. Database changes to support "curated" events (no real organizer, source attribution)
3. UI updates to show a "Curated by DNA" badge on event cards

---

## Part 1: Database Migration

The `events` table has `organizer_id` as `NOT NULL`. Instead of making it nullable (which would break RLS and existing logic), we will:

- Add `is_curated BOOLEAN DEFAULT false` -- flags DNA-curated events
- Add `curated_source TEXT` -- e.g. "Perplexity", "Manual"
- Add `curated_source_url TEXT` -- link to original event page
- Add `curated_at TIMESTAMPTZ` -- when the curation happened

For curated events, `organizer_id` will be set to a **DNA Platform system user**. We will create a profile entry for this system account (or use the admin user's ID). The RLS INSERT policy will be bypassed by the edge function using the service role key.

Update RLS SELECT policy: curated events are always public (already handled by `is_public = true`).

---

## Part 2: Edge Function `curate-diaspora-events`

A new edge function that:

1. Calls Perplexity API (`sonar` model) with a structured output prompt asking for 15-20 real upcoming African diaspora events (conferences, festivals, summits, workshops)
2. Uses `response_format: json_schema` to get structured event data matching the events table schema
3. Deduplicates against existing events (title similarity + date match)
4. Inserts new events using the service role key (bypasses RLS)
5. Sets `is_curated = true`, `curated_source = 'perplexity'`, `is_published = true`, `status = 'published'`

**Perplexity Prompt** (embedded in the edge function):
```
Find 15-20 real upcoming events in 2026 relevant to the African diaspora community worldwide. Include conferences, summits, festivals, workshops, and networking events. Cover categories: tech, business/investment, culture/arts, healthcare, education, and social. Include events in Africa (Lagos, Nairobi, Accra, Kigali, Cape Town, Addis Ababa) AND diaspora cities (London, New York, Atlanta, Toronto, Paris, Dubai). For each event provide: title, description (2-3 sentences), event_type, format (in_person/virtual/hybrid), location_name, location_city, location_country, start_time (ISO 8601), end_time (ISO 8601), cover image search term, website URL, tags array.
```

**Structured output schema** ensures clean JSON that maps directly to the events table columns.

**Config**: `verify_jwt = false` (for cron invocation), but validates a shared secret header for security.

---

## Part 3: Cron Setup

A `pg_cron` job that calls `curate-diaspora-events` weekly (every Sunday at 6 AM UTC) to keep the events fresh. This uses the same pattern as existing cron jobs (e.g., `send-event-reminders`).

---

## Part 4: Update `sampleConveneEvents.ts`

Replace the current mock data with the first batch of real events fetched from Perplexity. This ensures the marketing/landing page (`/convene`) also shows real events. The edge function will be called once manually to generate the initial seed, and the results will populate both the database and the static sample file.

---

## Part 5: UI - "Curated by DNA" Badge

Update `ConveneEventCard.tsx` to show a curated badge when `is_curated` is true:

- A small badge reading "Curated by DNA" with the DNA Emerald color and a sparkle icon
- Replaces the organizer avatar/name section -- instead shows "DNA Curated" with the DNA logo
- If `curated_source_url` exists, the card title links to the original source

Also update:
- `EventCard.tsx` (events list card)
- `ModernEventCard.tsx` (connect tab card)
- Event detail page -- show source attribution ("Originally found on [source]") in event details

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/[timestamp]_add_curated_events_fields.sql` | **Create** - Add is_curated, curated_source, curated_source_url, curated_at columns |
| `supabase/functions/curate-diaspora-events/index.ts` | **Create** - Perplexity-powered event curation edge function |
| `supabase/config.toml` | **Edit** - Add curate-diaspora-events function config |
| `src/data/sampleConveneEvents.ts` | **Edit** - Replace mock data with real events from first Perplexity run |
| `src/components/convene/ConveneEventCard.tsx` | **Edit** - Add curated badge and source attribution |
| `src/components/events/EventCard.tsx` | **Edit** - Add curated badge |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

---

## Edge Function Flow

```text
curate-diaspora-events (weekly cron or manual trigger)
    |
    v
Call Perplexity API (sonar model, structured JSON output)
    |
    v
Parse 15-20 events with title, dates, location, type
    |
    v
Deduplicate: check existing events by title similarity + date range
    |
    v
Insert new events with is_curated=true, organizer_id=SYSTEM_USER
    |
    v
Return summary: { inserted: N, skipped: N, errors: [] }
```

---

## Security

- Edge function uses `SUPABASE_SERVICE_ROLE_KEY` for inserts (bypasses RLS)
- Cron invocation authenticated via Authorization header with anon key
- Manual invocation also supported for initial seeding
- `PERPLEXITY_API_KEY` already available as a secret

---

## Implementation Order

1. Database migration (add curated columns)
2. Create edge function with Perplexity integration
3. Deploy and run manually to seed initial real events
4. Update `sampleConveneEvents.ts` with the results
5. Add curated badge to event card components
6. Set up weekly cron job for auto-refresh

