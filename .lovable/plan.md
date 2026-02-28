

# Feed Page Redesign: "The Informed Stream"

## The Problem

The current layout stacks 4 full-width sections (hero, stats bar, events carousel + sponsor, completion nudge) before the user ever sees a single post. The feed -- the main reason people visit -- is buried below the fold. The right sidebar widgets feel bolted on rather than integral.

## The New Layout Philosophy

**Feed-first, features woven in.** The feed stream takes center stage immediately. Supporting features (events, stats, community pulse, sponsor) surround and complement the feed rather than precede it. Think Twitter's clean center column but with DNA's warmth and extra utility panels.

## New Structure

```text
+------------------------------------------------------------------+
|  COMPACT GREETING BAR (name + pulse text + quick actions) inline  |
+------------------------------------------------------------------+
|                    |                          |                    |
|  LEFT RAIL (w-72)  |  CENTER FEED (flex-1)    |  RIGHT RAIL (w-80)|
|                    |                          |                    |
|  - Profile card    |  - Composer bar          |  - Events carousel |
|    (compact)       |  - Feed tabs + sort      |    (vertical mini) |
|  - Five C's stats  |  - Feed stream           |  - Sponsor card    |
|  - Active Spaces   |    (posts)               |  - Trending topics |
|  - DIA bubble      |                          |  - Community Pulse |
|                    |                          |  - Spotlight       |
|                    |                          |  - Footer links    |
+------------------------------------------------------------------+
```

### Key Differences from Current

1. **Greeting becomes a compact inline bar** -- not a big hero block. One line: greeting text, pulse stats, and quick-action chips all in a single slim row at the very top. Heritage warmth via subtle background tint, not a large banner.

2. **Feed is immediately visible** -- The composer and first posts appear above the fold. No scrolling past 3+ dashboard sections.

3. **Three-column layout returns but differently** -- Instead of the old LinkedIn pattern, the left rail is a slim personal panel, the center is the feed, and the right rail holds discovery/utility content (events, trending, community pulse). All three scroll together as one page (no fixed/independent scrolling).

4. **Events move to the right rail** -- Rendered as a compact vertical list (3-4 mini event cards stacked) rather than a full-width horizontal carousel. This keeps them visible alongside the feed instead of above it.

5. **Stats bar folds into the left rail** -- The Five C's stats become part of the left personal panel, not a separate full-width bar.

6. **Sponsor integrates into the right rail** -- Between events and trending, naturally positioned as a discovery element.

## Detailed Section Specs

### Compact Greeting Bar (top, full-width)
- Single row, `max-w-7xl mx-auto`, ~48px tall
- Left: Lora greeting ("Good evening, Jaune") + pulse text ("42 events this week")
- Right: Quick-action chips (Post, Event, Story) as small pill buttons
- Background: Very subtle warm tint `bg-[hsl(var(--dna-cream))]` with faint Kente at 3% opacity
- This replaces the tall `FeedHeroGreeting` banner

### Left Rail (w-72, sticky)
- **Compact profile card**: Avatar (48px), name, headline, "View Profile" link
- **Five C's mini stats**: 2x2 grid of stat boxes (Connections, Events, Spaces, Posts) with counts and icons
- **Active Spaces**: Existing `FeedActiveSpaces` component, rendered inline
- **DIA bubble**: "Ask DIA anything" card at the bottom
- Sticky positioning (`sticky top-20`) so it stays visible while scrolling the feed

### Center Feed (flex-1, max-w-2xl)
- **Composer bar**: The existing chat-style pill composer
- **Tab row**: Filter tabs (All, For You, Network, Mine, Saved) + sort toggle (Top/Latest) on same row
- **Feed stream**: `UniversalFeedInfinite` or `PersonalizedFeed` immediately below tabs
- No extra sections between composer and feed -- content starts fast

### Right Rail (w-80, sticky)
- **Upcoming Events**: Compact vertical stack of 3-4 mini event cards (date box + title + time), with "View All" link
- **Sponsor Card**: Existing `FeedSponsorCard`, rendered between sections
- **Trending Topics**: Tag pills from `FeedCommunityPulse`
- **Live Activity Ticker**: Compact recent activity stream
- **Spotlight Card**: Featured member
- **Footer**: About/Privacy/Terms links

## Technical Changes

### `src/pages/dna/Feed.tsx` -- Major Restructure
- Replace the vertically-stacked dashboard layout with a 3-column flex layout
- Top: Compact greeting bar (new inline component or simplified `FeedHeroGreeting`)
- Below: `flex gap-6` with left rail, center feed, right rail
- All columns scroll together (no `overflow: hidden` or independent scroll)
- Left and right rails use `sticky top-20` for desktop visibility

### `src/components/feed/FeedHeroGreeting.tsx` -- Simplify to Compact Bar
- Reduce from a padded banner to a slim single-line bar
- Remove the cultural pattern background (or make it extremely subtle)
- Greeting + pulse text on the left, quick-action chips on the right
- Height target: ~48-56px instead of the current ~120px+

### `src/components/feed/FeedStatsBar.tsx` -- Convert to Vertical Mini Grid
- Change from horizontal full-width bar to a compact 2x2 grid card
- Designed for the left rail width (w-72)
- Remove the inline profile strip (profile card handles that separately)

### `src/components/feed/FeedEventsCarousel.tsx` -- Convert to Vertical Stack
- Change from horizontal scroll carousel to a vertical stack of 3-4 compact event rows
- Each row: date box (small) + title + time on one line
- Fits the right rail width (w-80)
- "Explore Events" link at bottom

### Existing Components (Reused as-is)
- `FeedCommunityPulse` -- reused in right rail (contains LiveActivityTicker, SpotlightCard, TrendingTagPills, DIA bubble)
- `FeedSponsorCard` -- placed in right rail
- `FeedActiveSpaces` -- placed in left rail
- `UniversalFeedInfinite` / `PersonalizedFeed` -- unchanged in center
- `MobileFeedTabs`, mobile layout -- unchanged

### Components No Longer Needed at Page Level
- `ProfileCompletionNudge` as a full-width banner -- move inside left rail or remove
- The large widgets row grid (events carousel + sponsor side by side)

## Implementation Priority

1. Restructure `Feed.tsx` desktop layout to 3-column flex
2. Simplify `FeedHeroGreeting` to compact inline bar
3. Adapt `FeedStatsBar` for left rail (vertical mini grid)
4. Adapt `FeedEventsCarousel` for right rail (vertical stack)
5. Wire left rail: profile + stats + spaces + DIA
6. Wire right rail: events + sponsor + community pulse

## Result

The feed loads with posts visible immediately. Users see their personal panel on the left, discover events and trending content on the right, and can scroll through the feed without any preamble. It feels like a real social feed with great utility -- not a dashboard you have to scroll past to reach the content.

