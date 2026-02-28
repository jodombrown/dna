

# Full-Page Dashboard Feed Redesign

## The Concept

Replace the 3-column sidebar layout with a full-width, vertically-scrolling dashboard page. Think Notion's home view: a single scrolling canvas where content sections flow naturally across the full page width. No sidebars -- everything is woven into the main flow as horizontal sections.

## New Page Structure (Top to Bottom)

```text
+------------------------------------------------------------------+
| HERO GREETING (full-width, Kente pattern, quick actions)         |
+------------------------------------------------------------------+
| PROFILE STRIP + FIVE C's STATS (horizontal bar, full-width)     |
+------------------------------------------------------------------+
| UPCOMING EVENTS (horizontal scroll carousel)  | SPONSOR CARD    |
+------------------------------------------------------------------+
| COMPOSER BAR (full-width, centered, max-w-2xl)                   |
+------------------------------------------------------------------+
| TABS (All | For You | Network | Mine | Saved)  + Sort (Top|New) |
+------------------------------------------------------------------+
|                          |                                        |
|   FEED COLUMN            |   SIDEBAR WIDGETS (stacked)           |
|   (max-w-2xl)            |   - Trending tags                     |
|   Posts stream            |   - Live activity ticker              |
|   here                   |   - Spotlight member                  |
|                          |   - DIA bubble                        |
|                          |   - Active spaces                     |
+------------------------------------------------------------------+
```

### Key Layout Changes

1. **Full-width hero zone** -- The greeting, profile stats, upcoming events, and sponsor all span the full page width as horizontal sections at the top
2. **Centered feed stream** -- Below the dashboard header sections, the feed posts sit in a comfortable `max-w-2xl` centered column
3. **Widgets become a right rail only below the fold** -- Trending, spotlight, activity ticker, and DIA sit beside the feed stream in a 2-column grid (feed left, widgets right), but only once the user scrolls past the dashboard header
4. **No fixed sidebars** -- The entire page scrolls as one unit (like Notion, not like LinkedIn)
5. **Upcoming events as horizontal carousel** -- Full-width row of event cards you swipe/scroll through, not a cramped sidebar list

## Detailed Section Breakdown

### Section 1: Hero Greeting (existing `FeedHeroGreeting`)
- Stays as-is but stretched to full width (`max-w-7xl mx-auto`)
- Kente pattern background, Lora greeting, quick-action chips

### Section 2: Profile Stats Bar (extracted from `FeedLeftPanel`)
- Full-width horizontal bar with: avatar, name, headline, then the Four C stats inline
- Saved Items link on the far right
- Compact single-line, not a card -- more like a status bar

### Section 3: Dashboard Widgets Row
- 2-column grid: left side = Upcoming Events (horizontal scroll of event mini-cards), right side = Sponsor card
- Full width, visually separated with subtle background tint

### Section 4: Composer + Tabs + Feed
- The composer bar, filter tabs, and sort toggle sit at the top of a 2-column area:
  - **Left (flex-1, max-w-2xl)**: Feed stream
  - **Right (w-80)**: Community Pulse widgets stacked (Trending, Live Activity, Spotlight, Active Spaces, DIA)
- This 2-column area scrolls together as part of the full page (no independent scroll columns)

## Technical Changes

### `src/pages/dna/Feed.tsx` -- Major Restructure
- Remove the 3-column `overflow: hidden` flex container
- Replace with a single scrolling `max-w-7xl mx-auto` page
- Lay out sections vertically: Hero -> Stats Bar -> Widgets Row -> Feed+Sidebar Grid
- The page scrolls naturally (no `height: calc(100vh)` or `overflow: hidden`)

### `src/components/feed/FeedStatsBar.tsx` -- New
- Horizontal profile stats strip extracted from FeedLeftPanel
- Avatar + name + headline + 4 stat counters + Saved Items link
- Single row, no card wrapper, subtle bottom border

### `src/components/feed/FeedEventsCarousel.tsx` -- New
- Horizontal scrollable row of upcoming event mini-cards
- Uses existing `FeedUpcomingEvents` data but renders as a carousel instead of a vertical list
- Embla carousel or native CSS scroll-snap

### Existing Components (Reused, Not Rewritten)
- `FeedHeroGreeting` -- used as-is, just wider container
- `FeedCommunityPulse` -- reused for the sidebar widgets area beside the feed
- `FeedSponsorCard` -- placed in the widgets row
- `FeedLeftPanel` -- deprecated for desktop (still used on mobile if needed)
- `LiveActivityTicker`, `SpotlightCard`, trending tags -- stay in CommunityPulse

### What Gets Removed
- The fixed-height 3-column `overflow: hidden` container
- Independent column scrolling on desktop
- Left sidebar as a separate column

## Visual Impact
- The page will feel open and spacious, like a personal homepage
- Scrolling is natural (whole page), not trapped in columns
- Content flows left-to-right in sections, then settles into a comfortable feed + widgets layout
- Heritage patterns and warm backgrounds span the full width, not trapped in narrow columns

