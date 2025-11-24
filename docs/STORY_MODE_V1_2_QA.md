# DNA | CONVEY - Story Engine v1.2 QA Checklist

## Overview
This document tracks the Trust-First acceptance criteria for Story Mode v1.2, ensuring stories work reliably across all feed surfaces before being marked as fully stable.

## Status: 🟡 Testing Phase

---

## 8.1 Creation ✅

### Test: Create Story from /dna/feed
- [ ] Open Universal Composer from /dna/feed
- [ ] Select "Story" mode
- [ ] Fill in:
  - Title: "Trust-First Story Test v1.2"
  - Subtitle (optional): "Testing the full story engine"
  - Content: (200+ chars of meaningful story content)
- [ ] Click "Share Story"

**Expected:**
- ✅ No red "Publishing failed" banner
- ✅ Composer closes immediately
- ✅ Story appears at top of All tab with:
  - Story badge
  - Title displayed prominently
  - Subtitle if provided
  - Content preview (clamped ~240 chars)
  - "Read More" button if content > 240 chars
- ✅ Story appears in My Posts tab
- ✅ Story appears in Profile → Activity (/dna/{username})
- ✅ After refresh, story persists in all 3 places

---

### Test: Create Story from Space Context
- [ ] Navigate to a Space page
- [ ] Open composer (should show "Posting in Space" badge)
- [ ] Select Story mode
- [ ] Fill required fields
- [ ] Publish

**Expected:**
- ✅ Story appears in All feed
- ✅ Story appears in My Posts
- ✅ Story appears in Space Activity feed
- ✅ Story shows "Posted in {Space Title}" context badge

---

### Test: Create Story from Event Context
- [ ] Navigate to an Event page
- [ ] Open composer
- [ ] Select Story mode
- [ ] Fill required fields
- [ ] Publish

**Expected:**
- ✅ Story appears in All feed
- ✅ Story appears in My Posts
- ✅ Story appears in Event Activity feed
- ✅ Story shows "Shared at {Event Title}" context badge

---

## 8.2 Reading ✅

### Test: StoryCard Preview
- [ ] View story in feed (All / Network / My Posts)
- [ ] Verify StoryCard shows:
  - [ ] Hero image (if uploaded)
  - [ ] Title (H3, bold, clickable)
  - [ ] Subtitle (if provided, italic, muted)
  - [ ] Body preview (~240 chars)
  - [ ] "Read More" button if content > 240 chars

**Expected:**
- ✅ Card renders correctly on mobile + desktop
- ✅ Clicking title navigates to /dna/story/:id
- ✅ Clicking "Read More" expands inline OR navigates to detail page

---

### Test: Story Detail Page
- [ ] Click story title or "Read More"
- [ ] Lands on /dna/story/:id

**Expected:**
- ✅ Full page layout with:
  - Back button (navigates to previous page)
  - Story badge
  - Hero image (full width, if present)
  - Title (H1, large)
  - Subtitle (if present)
  - Author info (avatar, name, timestamp)
  - Context badge (Space/Event if linked)
  - Full story content (no truncation)
  - Like / Comment / Bookmark / Share buttons
  - Comments section (placeholder "Coming Soon" for v1.2)

---

### Test: Story URL Direct Access
- [ ] Copy story URL (e.g., /dna/story/abc123)
- [ ] Open in new tab

**Expected:**
- ✅ Story loads correctly
- ✅ If story deleted → Shows "Story Not Available" friendly message

---

## 8.3 Interactions ✅

### Test: Like/Unlike Story
- [ ] Click heart icon on Story (feed or detail page)
- [ ] Heart fills with brand color (dna-amber)
- [ ] Count increments
- [ ] Click again to unlike
- [ ] Heart unfills
- [ ] Count decrements
- [ ] Refresh page → State persists

**Expected:**
- ✅ No error toast
- ✅ Like state persists across All / My Posts / Saved / Profile
- ✅ Like action updates immediately (optimistic UI)

---

### Test: Bookmark/Unbookmark Story
- [ ] Click bookmark icon on Story
- [ ] Icon fills
- [ ] Story appears in Saved tab
- [ ] Click bookmark again to remove
- [ ] Story disappears from Saved tab
- [ ] Refresh → State persists

**Expected:**
- ✅ No error toast
- ✅ Bookmark state consistent across all surfaces

---

### Test: Comment on Story (Future)
- [ ] Click "Comment" button

**Expected:**
- ✅ For v1.2: Shows placeholder "Comments coming soon"
- ✅ No broken UI or errors

---

### Test: Delete Story (as owner)
- [ ] View your own story in feed
- [ ] Click 3-dot menu → "Delete Story"
- [ ] Confirm deletion

**Expected:**
- ✅ Story disappears from:
  - All feed
  - My Posts
  - Profile Activity
  - Space/Event feed (if context-linked)
  - Saved tab (if bookmarked)
- ✅ If someone tries to open deleted story URL:
  - Shows: "This Story is no longer available"
  - Offers: "Back to Feed" button

---

## 8.4 Trust-First Validation ✅

### Test: Story Creation with Bad Network
- [ ] Simulate slow/failing network (DevTools → Network → Offline)
- [ ] Try to publish a story

**Expected:**
- ✅ Error toast (gentle, not red banner): "We couldn't publish this Story. Your writing is safe—please try again."
- ✅ Composer does NOT close
- ✅ Form content preserved (no data loss)
- ✅ User can retry without re-typing

---

### Test: Story Mode Not Visible When Not Authenticated
- [ ] Log out
- [ ] Visit /dna/feed

**Expected:**
- ✅ Composer either hidden OR only shows Auth CTA
- ✅ No broken "Story" mode selector

---

### Test: No Red Banners or Raw SQL Errors
- [ ] Perform all above tests
- [ ] Monitor console for errors

**Expected:**
- ✅ No scary technical error messages
- ✅ No Supabase 400/500 errors logged to console for normal user actions
- ✅ Gentle toasts only

---

## Configuration Update

Once all boxes are checked ✅, update `src/config/composerModes.ts`:

```ts
story: {
  id: 'story',
  enabled: true,
  tested: true, // ← Change this
  optimisticFeedInjection: true,
  notes: 'Full Story Engine v1.2 – trusted and stable',
}
```

---

## Non-Goals for v1.2 (Deferred)

The following are **NOT** in scope for this release:
- ❌ Rich text editor (bold, lists, etc.) — plain text/markdown only
- ❌ Story drafts / auto-save
- ❌ Story series / collections
- ❌ ADIN ranking logic (stories use chronological / existing rankingMode)
- ❌ Reshare (still locked down)

These can be addressed in Story v1.3+ / ADIN integration phases.

---

## Sign-Off

**QA Completed By:** _________________  
**Date:** _________________  
**Status:** 🟢 Passed / 🟡 Pending / 🔴 Failed  
**Notes:**  
