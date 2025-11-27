# DNA | FEED & COMPOSER - QA Checklist

## Purpose
This checklist ensures the Trust-First principle is maintained across all feed features.
Run through this list after any changes to feed, composer, or story systems.

## Core Post & Story Creation

### Standard Posts
- [ ] Create Post → appears immediately in /dna/feed All tab
- [ ] Create Post → appears in My Posts tab
- [ ] Create Post with media → image displays correctly
- [ ] Delete Post → disappears from all feeds
- [ ] Like Post → count updates immediately
- [ ] Bookmark Post → appears in Saved tab

### Stories
- [ ] Create Story → appears in /dna/feed All tab
- [ ] Create Story → appears in My Posts tab
- [ ] Create Story → appears in /dna/convey All Stories
- [ ] Create Story → appears in /dna/convey My Stories
- [ ] Story with subtitle → subtitle displays in feed card
- [ ] Story with hero image → image displays in feed card
- [ ] Story title click → navigates to /dna/story/:id (no 404)
- [ ] Story hero image click → navigates to /dna/story/:id
- [ ] Story detail page → full content renders with paragraphs
- [ ] Story detail page → subtitle displays if present
- [ ] Story detail page → hero image displays if present
- [ ] Story detail page → author info displays correctly
- [ ] Story detail direct URL → works on refresh (no 404)
- [ ] Delete Story → disappears from all feeds
- [ ] Like Story → count updates immediately (book icon)
- [ ] Bookmark Story → appears in Saved tab (both Feed and Convey)

## Feed Tabs

### All Tab
- [ ] Shows mix of posts and stories
- [ ] Shows posts from all users (respecting privacy)
- [ ] Pagination works (scrolls to load more)
- [ ] No duplicate items on pagination

### Network Tab
- [ ] Shows only posts/stories from connections
- [ ] Empty state when no connections have posted

### My Posts Tab
- [ ] Shows only current user's posts and stories
- [ ] Includes both post and story types

### Saved Tab
- [ ] Shows only bookmarked posts and stories
- [ ] Unbookmark removes item from this view

## Convey Hub (/dna/convey)

### All Stories
- [ ] Shows ONLY stories (no regular posts)
- [ ] Pagination works correctly
- [ ] Does not stop prematurely when mixed-content pages exist

### My Stories
- [ ] Shows only current user's stories
- [ ] Empty state when user has no stories

### Saved Stories
- [ ] Shows only bookmarked stories
- [ ] Unbookmark removes from this view

## Data Integrity

### RPC Contract
- [ ] get_universal_feed returns all expected fields
- [ ] subtitle field is included in RPC response
- [ ] image_url (hero image) is included
- [ ] post_type values are lowercase ('story', 'post')
- [ ] No console errors about missing fields

### Pagination
- [ ] Cursor/offset calculation based on raw items, not filtered
- [ ] Story-only feeds can paginate through mixed-content results
- [ ] "You're all caught up" only shows when truly at end

### Filtering
- [ ] post_type filtering is case-insensitive
- [ ] No accidental global filtering breaking other feeds

## Edge Cases

- [ ] Deleted stories show "Story not available" message (not 404)
- [ ] Empty feed states display appropriate messages
- [ ] No red error toasts for normal interactions
- [ ] Network errors handle gracefully with user-friendly messages

## Performance

- [ ] Feed loads within 2 seconds on typical connection
- [ ] Infinite scroll feels smooth (no stuttering)
- [ ] No unnecessary re-renders or refetches

## Notes

- Run this checklist after any changes to:
  - `get_universal_feed` RPC function
  - `useInfiniteUniversalFeed` hook
  - `UniversalFeedInfinite` component
  - Story creation/update flows
  - Feed card components

- If any test fails, consider it a regression and fix before deployment.
- The goal is zero Trust-First violations: users should always see their content appear where expected.
