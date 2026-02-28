

# Desktop Feed Redesign: Breaking Away from LinkedIn

## The Problem

The current desktop feed follows a classic "LinkedIn 3-column" pattern: narrow left sidebar with profile card + widgets, center feed of stacked cards, narrow right sidebar with suggestions. While functional, this is the exact template LinkedIn, Facebook, and every corporate social network uses. DNA deserves its own visual identity.

## Design Direction: "The Living Room"

Instead of a corporate social feed, DNA's desktop should feel like walking into a warm, curated community space -- more like a blend of **Notion's workspace feel**, **Are.na's visual discovery**, and **Discord's lively community pulse**, all wrapped in DNA's heritage warmth.

## Proposed Changes (Phase 1 -- Feed Page Overhaul)

### 1. Hero Greeting Zone (replaces plain "Good morning" text)

Replace the small text greeting with a warm, full-width greeting banner at the top of the center column that includes:
- Time-contextual greeting with the user's first name in Lora (heritage font)
- A subtle animated heritage pattern background (Kente at 5% opacity)
- Quick-action chips: "Start a Post", "Create Event", "Share a Story" -- horizontally scrollable
- A "pulse" line showing today's platform activity ("42 events this week, 128 new connections today")

This immediately breaks the "stacked cards" monotony and gives the feed a warm, editorial feel.

### 2. Mosaic Feed Layout (replaces uniform card stack)

Instead of every post being the same rectangular card stacked vertically, introduce a **mosaic/magazine-style layout** for the feed:
- **Standard posts**: Full-width card (like now)
- **Image/media posts**: Can span as a larger visual card with the image prominent and text overlaid
- **Story previews**: Horizontal scrollable row of circular story avatars (Instagram-style) inserted between feed items periodically
- **Event cards**: Rendered as horizontal "ticket-style" cards with the date box on the left and a colored accent border matching CONVENE
- **DIA Insights**: Rendered as a distinct "wisdom card" with Adinkra pattern background and a gold border

The key: **not every card looks the same**. Content type drives visual treatment.

### 3. Left Sidebar: "My DNA" Navigation Panel

Replace the LinkedIn-style profile card + widget stack with a cohesive **navigation panel** that feels like a personal dashboard:
- **Compact profile strip** at top (avatar + name + headline in one line, not a full card)
- **Five C's quick stats** as a mini horizontal bar (connections count, events attended, spaces active, contributions, stories published)
- **Pinned items** section: User can pin their favorite spaces, events, or connections for quick access
- **Sidebar widgets** (Upcoming Events, Active Spaces, Sponsor) remain but are rendered as **collapsible sections** rather than separate cards, reducing visual noise

### 4. Right Sidebar: "Community Pulse"

Redesign the right sidebar as a live, dynamic community panel:
- **Live Activity Stream**: A real-time ticker showing "Amara just joined", "New event: Lagos Tech Meetup", "Trending: #AfricanInnovation" -- feels alive
- **"Spotlight" Card**: A rotating featured member, event, or story with a warm photo treatment (not just a list of suggested people)
- **Trending Topics** stays but rendered as **word cloud** or **tag pills** instead of a numbered list
- **DIA prompt card** with a warm conversation bubble aesthetic instead of a generic promo card

### 5. Visual Refinements Across All Columns

- **Remove all hard card borders**: Use subtle shadows and warm background tints instead of bordered cards. This is the single biggest thing that makes it look like LinkedIn.
- **Warm cream background**: Change the feed background from pure white to the DNA cream (#F9F7F4) for a warmer, less corporate feel
- **Rounded, softer everything**: Increase border-radius to 16px on cards, use more rounded avatars, softer shadows
- **Heritage accent moments**: Thin Kente or Mudcloth dividers between feed sections instead of plain gray lines
- **Typography hierarchy**: Use Lora for section headers ("Upcoming For You", "Trending in DNA") to add warmth; Inter stays for body text

### 6. Sticky Composer Redesign

Replace the LinkedIn "What's on your mind?" bar with a **floating action concept**:
- A warm, rounded composer bar that looks more like a chat input than a form
- The avatar sits inside the input area (like iMessage)
- Quick-mode icons (Photo, Event, Story) appear as subtle pills inside the bar
- On click, it expands into the full UniversalComposer

## Technical Approach

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/dna/Feed.tsx` | Major restructure of desktop layout: Hero zone, mosaic feed, sidebar redesigns |
| `src/components/feed/FeedGreeting.tsx` | Upgrade to hero greeting with heritage pattern and quick actions |
| `src/components/feed/FeedProfileCard.tsx` | Compact into a slim navigation strip |
| `src/components/feed/FeedRightSidebar.tsx` | Redesign as "Community Pulse" with live stream and spotlight |
| `src/components/feed/FeedUpcomingEvents.tsx` | Render as collapsible section, remove card wrapper |
| `src/components/feed/FeedActiveSpaces.tsx` | Render as collapsible section, remove card wrapper |
| `src/components/feed/FeedSponsorCard.tsx` | Adapt to collapsible sidebar section style |
| `src/components/feed/UniversalFeedItem.tsx` | Add content-type-driven card variants (ticket, mosaic, wisdom) |

### New Files
| File | Purpose |
|------|---------|
| `src/components/feed/FeedHeroGreeting.tsx` | Full-width hero greeting with heritage pattern and quick actions |
| `src/components/feed/FeedStoryRow.tsx` | Horizontal scrollable story avatar row |
| `src/components/feed/LiveActivityTicker.tsx` | Real-time community activity stream for right sidebar |
| `src/components/feed/SpotlightCard.tsx` | Featured member/event/story rotating card |
| `src/components/feed/FeedLeftPanel.tsx` | Unified left sidebar navigation panel with collapsible sections |

### CSS/Design Token Changes
- Add `bg-[#F9F7F4]` as feed page background
- Increase default card `border-radius` to 16px
- Remove `border` from sidebar cards, use `shadow-sm` only
- Add Lora font to section headers via `font-heritage` class

## Implementation Priority

1. **Visual refinements** (warm background, borderless cards, Lora headers) -- biggest visual impact, smallest code change
2. **Hero Greeting Zone** -- replaces the plain greeting, sets the tone
3. **Left sidebar consolidation** -- compact profile + collapsible sections
4. **Right sidebar "Community Pulse"** -- live ticker + spotlight
5. **Composer redesign** -- floating chat-style input
6. **Mosaic feed cards** -- content-type-driven visual treatments (most complex)

## What This Achieves

- **Warm, not corporate**: Cream backgrounds, heritage typography, soft shadows
- **Alive, not static**: Live activity ticker, rotating spotlight, story rows
- **Magazine, not spreadsheet**: Varied card sizes and treatments by content type
- **Culturally rooted**: Heritage patterns as design elements, not decorations
- **Unmistakably DNA**: No other platform will look like this

