

# Fix Feedback Entry Points + Redesign Feedback Hub

## Problem
Three issues with the current feedback system:
1. **"Give Feedback" button** (Alpha Welcome Banner) opens the old `AlphaFeedbackForm` panel (screenshot 2) instead of the Feedback Hub drawer
2. **Feedback chevron tab** (screenshot 3) navigates to `/dna/feedback` page on desktop instead of opening the drawer — it should always open the side drawer regardless of screen size
3. **The `/dna/feedback` page** needs a full redesign (separate effort, noted below)

## Changes

### 1. Wire "Give Feedback" to open the Feedback Drawer
**File: `src/layouts/BaseLayout.tsx`**
- Remove the `AlphaFeedbackForm` component and its state (`isFeedbackFormOpen`)
- Add a new state `isFeedbackDrawerOpen` and render `FeedbackDrawer` directly in BaseLayout
- Pass `onOpenFeedback` to `AlphaWelcomeBanner` so it sets `isFeedbackDrawerOpen = true`
- Update the `AlphaTestGuide`'s `onOpenFeedback` callback the same way

### 2. Make the Chevron FAB always open the drawer (never navigate)
**File: `src/components/feedback/FeedbackFAB.tsx`**
- Remove the desktop vs. mobile branching logic that navigates to `/dna/feedback`
- Always call `setIsDrawerOpen(true)` on click regardless of screen size
- Remove the `isFeedbackPage` guard so the chevron still appears (users can access the hub from any DNA route)

### 3. Remove the old AlphaFeedbackForm dependency
**File: `src/layouts/BaseLayout.tsx`**
- Remove the `AlphaFeedbackForm` import since it's no longer used from BaseLayout
- Clean up the associated state variable

## Technical Details

```text
BaseLayout.tsx
  - Remove: import AlphaFeedbackForm
  - Remove: isFeedbackFormOpen state
  - Add: isFeedbackDrawerOpen state
  - Add: <FeedbackDrawer isOpen={isFeedbackDrawerOpen} onClose={...} />
  - Update: onOpenFeedback={() => setIsFeedbackDrawerOpen(true)}

FeedbackFAB.tsx
  - Remove: navigate import usage for feedback
  - Remove: isMobile check in handleClick
  - Always: setIsDrawerOpen(true)
```

## What This Does NOT Change (Future Work)
- The `/dna/feedback` full page will get a complete redesign in a separate task
- The FeedbackDrawer content/layout stays as-is for now
- The AlphaFeedbackForm component file remains (just no longer triggered from the banner)
