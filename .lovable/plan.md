

## What's Going On — Mobile Feed Header/Tabs Padding Issue

### The Problem

Looking at your screenshot, the **tab bar** (All, For You, Network, etc.) is sitting at the very top of the screen with **no visible header above it** — the DNA logo / composer / notification row is missing or hidden behind the status bar. The content (event card) starts immediately below the tabs with no breathing room.

Here's what's happening technically:

### Root Cause: Double Fixed Header Conflict

Your mobile Feed page (`src/pages/dna/Feed.tsx`) builds its **own custom fixed header system** — two stacked fixed rows:

1. **Row 1 (z-40):** `MobileHeader` with logo, composer bubble, notifications — fixed at `top-0`
2. **Row 2 (z-30):** `MobileFeedTabs` (All / For You / Network / etc.) — fixed at `top-14` (56px below Row 1)

Meanwhile, `BaseLayout.tsx` **also** renders the `UnifiedHeader` (another fixed `top-0 z-50` header) and applies `pt-14` top padding to the page content wrapper.

So what happens:
- The **UnifiedHeader** (z-50) sits on top and covers Feed's custom MobileHeader (z-40)
- The Feed page's own `pt-[4.5rem]` (72px) padding for its content is **added on top of** BaseLayout's `pt-14` (56px), pushing content down inconsistently
- When the header hides on scroll, the padding drops to `pt-[1rem]` but the BaseLayout padding remains, causing a jarring jump

In the screenshot, it appears the MobileHeader row (logo/composer) is **hidden behind the UnifiedHeader or status bar**, so you only see the tabs row flush at the top.

### The Fix

The Feed page needs to properly coordinate with BaseLayout:

1. **Hide `UnifiedHeader` on the mobile feed route** — The Feed page already has `data-mobile-feed='true'` logic but it's not fully suppressing the UnifiedHeader on mobile
2. **Adjust the Feed page's top padding** to account for the actual visible fixed elements (header row ~56px + tabs row ~40px = ~96px), not conflict with BaseLayout's padding
3. **Ensure the MobileHeader sits above the UnifiedHeader** or the UnifiedHeader is fully hidden so the feed's custom header is visible

### Specific Changes

**`src/pages/dna/Feed.tsx`:**
- Increase mobile z-index of the feed's MobileHeader from `z-40` to `z-50` or higher so it renders above UnifiedHeader
- Fix the content `pt-[4.5rem]` value — it should be enough to clear both the header row (56px) and tabs row (~40px), so roughly `pt-[6rem]` (96px)
- When header is hidden, padding should account for just the tabs row: `pt-[3rem]`

**`src/components/UnifiedHeader.tsx`:**
- Add logic to hide on the mobile feed route (or reduce its z-index) so it doesn't overlap the Feed's custom header

**`src/layouts/BaseLayout.tsx`:**
- On the mobile feed route, skip the default `pt-14` since the Feed manages its own padding

### Summary

The core issue is **two competing fixed headers** (UnifiedHeader from BaseLayout + MobileHeader from Feed.tsx) fighting for the same screen space, with padding values that don't properly account for what's actually visible. The fix is to properly suppress the global header on the mobile feed and correct the padding math.

