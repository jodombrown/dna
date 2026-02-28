

# Sponsorship Widget + Sponsorship Management System

## Overview

This plan adds a "Sponsored" widget to the Feed's left sidebar (below "Upcoming For You") and establishes the backend infrastructure and admin tooling for managing sponsors across the platform.

## Part 1: Feed Sponsor Widget (GABA Center as First Sponsor)

### New Component: `FeedSponsorCard.tsx`

A compact, warm sidebar card placed between `FeedUpcomingEvents` and `FeedActiveSpaces` in `Feed.tsx`.

**Design:**
- Gold accent stripe at top (4px) to signal it's a premium/partner placement
- "Sponsored" label in small muted text (top-right corner, transparent)
- GABA Center logo (stored in Supabase Storage or as URL)
- Sponsor name ("GABA Marketplace Center") in bold
- One-line tagline: "Empowering African & Caribbean entrepreneurs"
- CTA button: "Learn More" linking to sponsor's URL or a DNA partner page
- Warm hover state (`bg-amber-50/40`) consistent with sidebar design language
- "WBENC Certified" badge if applicable

**Data source:** Fetches from a new `sponsorships` table, filtered by `placement = 'feed_sidebar'` and `is_active = true`, ordered by priority.

### Feed.tsx Update

Insert `<FeedSponsorCard />` between `<FeedUpcomingEvents />` and `<FeedActiveSpaces />` in the left sidebar.

## Part 2: Database Schema (New Tables)

### `sponsors` table
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid PK | |
| name | text | "GABA Marketplace Center" |
| slug | text UNIQUE | "gaba-center" |
| logo_url | text | Logo image URL |
| description | text | Short description |
| website_url | text | External link |
| tier | text | "gold", "silver", "bronze", "community" |
| contact_name | text | Primary contact |
| contact_email | text | Contact email |
| is_active | boolean | Global active toggle |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `sponsor_placements` table
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid PK | |
| sponsor_id | uuid FK -> sponsors | |
| placement | text | "feed_sidebar", "event_page", "convene_hub", "email_footer" |
| headline | text | Contextual tagline for this placement |
| cta_label | text | "Learn More", "Visit", etc. |
| cta_url | text | Where CTA links to |
| priority | int | Display order (lower = higher priority) |
| starts_at | timestamptz | Campaign start |
| ends_at | timestamptz | Campaign end (null = indefinite) |
| is_active | boolean | Placement-level toggle |
| impression_count | bigint default 0 | Basic analytics |
| click_count | bigint default 0 | Basic analytics |
| created_at | timestamptz | |

**RLS:** Read access for all authenticated users (they see the ads). Write access restricted to admins via `is_admin` check on profiles.

## Part 3: Admin Sponsorship Management

### New Admin Page: `/app/admin/sponsorships`

Added as a new tab in the existing `AdminLayout.tsx` navigation.

**Features:**
- **Sponsors List**: Table showing all sponsors with name, tier, status, active placements count
- **Add/Edit Sponsor**: Dialog form for sponsor details (name, logo, tier, contact info)
- **Placements Manager**: For each sponsor, manage where their content appears (feed sidebar, event pages, etc.)
- **Basic Analytics**: Impression and click counts per placement
- **Toggle Active/Inactive**: Quick switches for sponsors and individual placements

### Impression/Click Tracking

- `FeedSponsorCard` fires an impression track on mount (debounced, once per session per placement)
- Click tracking increments `click_count` via an RPC or direct update when CTA is clicked

## Part 4: Event Page Sponsor Integration

Update the event detail page to optionally show sponsors from the `sponsors` JSON field on events, pulling richer data from the `sponsors` table when a match exists. This connects the existing event sponsor data with the new management system.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/feed/FeedSponsorCard.tsx` | **Create** - New sidebar sponsor widget |
| `src/pages/dna/Feed.tsx` | **Edit** - Insert FeedSponsorCard in left sidebar |
| `supabase/migrations/[timestamp]_create_sponsorship_tables.sql` | **Create** - sponsors + sponsor_placements tables with RLS |
| `src/pages/admin/SponsorshipManagement.tsx` | **Create** - Admin CRUD page for sponsors |
| `src/pages/admin/AdminLayout.tsx` | **Edit** - Add "Sponsorships" nav link |
| `src/App.tsx` | **Edit** - Add sponsorship admin route |
| `src/hooks/useSponsorPlacements.ts` | **Create** - Hook to fetch active placements by location |
| `src/services/sponsorshipService.ts` | **Create** - Service for sponsor CRUD + tracking |

## Seed Data: GABA Center

The migration will seed the first sponsor:
- **Name:** GABA Marketplace Center
- **Tier:** Gold
- **Description:** Empowering African & Caribbean entrepreneurs. WBENC Certified.
- **Website:** https://gabanetwork.com/
- **Placement:** feed_sidebar, priority 1, CTA "Learn More"

## Design Rationale

- The sponsor card uses the same visual language as other sidebar widgets (accent stripe, warm hover, compact layout) so it feels native, not intrusive
- The `sponsor_placements` table decouples sponsor identity from where they appear, allowing the same sponsor to have different messaging in different contexts
- Admin management lives in the existing admin section, following established patterns
- Impression/click tracking provides basic ROI data for sponsors without adding external analytics dependencies

