

# Feed Desktop Overhaul: From Boring to Best-in-Class

## The Problem

The current `/dna/feed` desktop layout is a static LinkedIn clone: three columns that don't scroll independently, a left sidebar that's mostly dead space (profile card + 5 links), a right sidebar with **hardcoded fake trending data**, and a center column that does all the heavy lifting alone. It feels like a template, not a living social network.

## What Top Social Networks Get Right

The best feeds share three principles:
1. **The feed IS the product** -- everything else orbits it, not the other way around
2. **Right sidebar earns its space** -- it surfaces dynamic, actionable content (not static links)
3. **Independent column scrolling** -- each column is its own world (your Connect Hub already nails this)

## The Plan

### 1. Independent Column Scrolling (Like Connect Hub)

Apply the same `ConnectHubLayout` pattern: each column gets `height: calc(100vh - 7.5rem)` and `overflow-y-auto`, so left/center/right scroll independently. The center feed scrolls infinitely while sidebars stay accessible.

**Technical approach:** Replace the current `sticky top-[...] h-fit` pattern on both `<aside>` elements with the Connect Hub's `height: columnHeight` + `overflow-y-auto` approach. The outer container becomes a flex row with fixed height instead of a scrollable page.

### 2. Left Sidebar: Make It Useful

**Keep:** Profile card (it's well-built), Saved Items link.

**Remove:** "Explore DNA" quick links card -- it duplicates the top navigation bar and adds nothing. Every user already sees CONNECT / CONVENE / COLLABORATE / CONTRIBUTE / CONVEY in the header.

**Add -- "Upcoming For You" mini-widget:**
- Show 2-3 upcoming events the user is attending (from `event_attendees`), with compact date + title
- If none, show next upcoming event from their city
- Links to CONVENE -- this creates a **CONVENE cross-C moment** on every feed visit

**Add -- "Active Spaces" mini-widget:**
- Show 2-3 spaces the user is a member of with recent activity indicators
- Links to COLLABORATE -- another **cross-C circulation moment**

This turns the left sidebar from "navigation I already have" into "personalized context that makes me feel the platform is alive."

### 3. Right Sidebar: Fix Trending + Add Life

**Fix "Trending in DNA":**
- The current `FeedRightSidebar` uses **hardcoded fake data** (`trendingTopics` array with static numbers like "234 posts"). The real `TrendingHashtags` component exists and calls `get_trending_hashtags` RPC -- but it's not used here.
- Replace the fake trending section with the real `<TrendingHashtags />` component.
- If the RPC returns empty results (likely in alpha), show a graceful "Trending topics coming soon" state instead of nothing.

**Enhance "People to Connect":**
- Currently fetches random profiles. Should exclude existing connections and prioritize mutual connections (2nd-degree).
- Add a compact "Connect" button inline (1-tap connect, not navigate-away).

**Add -- "Happening Now" widget:**
- Show events currently live or starting within 2 hours
- Green pulse dot for live events
- Creates urgency and FOMO -- key engagement driver

**Keep:** DIA promo card and footer links (they're appropriate here).

### 4. Center Column: Small but Impactful Polish

- **Composer card:** Already good. No changes needed.
- **Tab bar:** Already good. Keep as-is.
- **Feed content:** Already good with infinite scroll.
- **One addition -- "Welcome back" greeting:** Above the composer, show a contextual one-liner: "Good morning, Jaune" with a subtle DIA insight like "3 new posts from your network since yesterday." This personalizes the experience and makes the feed feel warm vs. clinical.

### 5. Mobile: Keep Current (It's Good)

You said you love the mobile look. The mobile layout with its fixed header, compact tabs, and full-width feed cards is solid. No changes to mobile.

## Files to Create/Modify

| File | Action | What |
|------|--------|------|
| `src/pages/dna/Feed.tsx` | Modify | Independent scrolling columns, remove FeedQuickLinks, add new widgets, contextual greeting |
| `src/components/feed/FeedRightSidebar.tsx` | Modify | Replace hardcoded trending with real `TrendingHashtags`, add Happening Now widget, improve People to Connect query |
| `src/components/feed/FeedUpcomingEvents.tsx` | Create | Compact "Upcoming For You" widget for left sidebar |
| `src/components/feed/FeedActiveSpaces.tsx` | Create | Compact "Active Spaces" widget for left sidebar |
| `src/components/feed/FeedHappeningNow.tsx` | Create | Live/imminent events widget for right sidebar |
| `src/components/feed/FeedGreeting.tsx` | Create | Contextual "Good morning" + network activity summary |

## What This Achieves

- **Not boring:** Every sidebar section is dynamic, personalized, and connected to real data
- **Independent scrolling:** Matches Connect Hub quality -- each column is its own scroll context
- **Cross-C circulation:** Left sidebar surfaces CONVENE + COLLABORATE content on every feed visit
- **Trending fixed:** Real hashtag data replaces fake numbers
- **Alive feel:** Happening Now creates urgency; Active Spaces shows the platform is breathing
- **No mobile changes:** The mobile experience you love stays untouched

