# DNA | FEED Interaction Test v1 – Lockdown Report

**Date:** 2025-11-23  
**Version:** Lockdown v1  
**Tester:** AI + Manual Verification Required  
**Environment:** Staging

---

## 🎯 Test Scope

Verify core Feed interactions work reliably:
1. **Post Creation** - Posts appear in All, Mine, and Profile tabs
2. **Likes** - Toggle on/off using `post_likes` table
3. **Bookmarks** - Toggle on/off using `post_bookmarks` table, Saved tab works
4. **Error UX** - No technical errors shown to users

---

## ✅ Code Review Results

### A. Create Post (Base Case)

**Status:** ✅ **PASS** (Code Review)

**Verification:**
- ✅ Composer uses `UniversalComposer` component
- ✅ Post creation writes to `posts` table
- ✅ Feed invalidation on success: `['universal-feed']`, `['universal-feed-infinite']`
- ✅ RLS allows authenticated users to insert posts

**Manual Test Required:**
1. Go to `/dna/feed` → All tab
2. Click "What's on your mind?" card
3. Type: "Testing Post – Lockdown v1"
4. Click Post

**Expected:**
- [ ] No error toast
- [ ] Composer closes
- [ ] Post appears at top of All tab
- [ ] After refresh, post persists

---

### B. Post Appears in Mine + Profile

**Status:** ✅ **PASS** (Code Review)

**Verification:**
- ✅ `get_universal_feed` RPC handles `p_tab = 'my_posts'`
- ✅ Filter: `AND p.author_id = p_viewer_id`
- ✅ Profile feed uses same `UniversalFeedInfinite` with `authorId` filter

**Manual Test Required:**

**B1. Mine Tab**
1. Click Mine tab
2. Verify post appears

**Expected:**
- [ ] Post "Testing Post – Lockdown v1" visible in Mine tab

**B2. Profile Activity**
1. Avatar → View Profile
2. Go to Activity/Posts section

**Expected:**
- [ ] Same post appears in profile feed

---

### C. Like Interaction

**Status:** ✅ **FIXED**

**Changes Made:**
- ✅ Updated `usePostLikes.ts` to use `post_likes` table (was using `post_reactions`)
- ✅ Removed `emoji` field from like operations
- ✅ Updated invalidation keys to include `['universal-feed']` and `['universal-feed-infinite']`
- ✅ Verified RLS on `post_likes`:
  - SELECT: `auth.uid() IS NOT NULL`
  - INSERT: `auth.uid() = user_id`
  - DELETE: `auth.uid() = user_id`

**Manual Test Required:**

**C1. Like On**
1. Tap heart/like button on test post

**Expected:**
- [ ] Icon toggles to "liked" state
- [ ] No error toast
- [ ] Like count increments

**C2. Like Persists**
1. Refresh page
2. Find same post

**Expected:**
- [ ] Like still active
- [ ] Count matches

**C3. Unlike**
1. Tap like again

**Expected:**
- [ ] Icon toggles off
- [ ] Count decrements
- [ ] After refresh, still unliked

---

### D. Bookmark / Saved Interaction

**Status:** ✅ **FIXED**

**Changes Made:**
- ✅ Created RLS policy: "Users can view all post bookmarks" with `USING (true)`
  - Required for `get_universal_feed` to calculate `bookmark_count`
- ✅ Updated `usePostBookmark.ts` to invalidate `['universal-feed']` and `['universal-feed-infinite']`
- ✅ Verified `get_universal_feed` RPC handles `p_tab = 'bookmarks'`:
  - Filter: `EXISTS (SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = p_viewer_id)`
  - Returns `has_bookmarked` flag correctly

**Manual Test Required:**

**D1. Bookmark On**
1. Tap bookmark icon on test post

**Expected:**
- [ ] Icon toggles to "saved" state
- [ ] Toast: "Post saved"
- [ ] No technical error

**D2. Saved Tab**
1. Click Saved tab

**Expected:**
- [ ] Bookmarked post appears
- [ ] No "No posts to show" message

**D3. Bookmark Persists**
1. Refresh `/dna/feed`
2. Go to Saved tab

**Expected:**
- [ ] Post still present

**D4. Remove Bookmark**
1. In Saved tab, tap bookmark icon
2. Refresh Saved tab

**Expected:**
- [ ] Post disappears from Saved
- [ ] Toast: "Bookmark removed"

---

### E. Error UX – Trust-First

**Status:** ✅ **PASS** (Code Review)

**Verification:**
- ✅ `usePostLikes` uses gentle toast on error: "Could not update like. Please try again."
- ✅ `usePostBookmark` uses gentle toast on error: "Could not update bookmark. Please try again."
- ✅ Errors logged to console with `console.warn()` (not `console.error()`)
- ✅ No raw SQL or table names shown to users
- ✅ Optimistic updates revert on error

**Manual Test Required:**
1. Simulate network failure (offline mode)
2. Try to like or bookmark

**Expected:**
- [ ] Gentle toast message only
- [ ] No technical error details shown
- [ ] Feed remains functional
- [ ] No page crash

---

## 🔍 Database Schema Verification

### Tables Confirmed:

✅ **post_likes**
```sql
- id: uuid (PK)
- post_id: uuid (FK to posts)
- user_id: uuid (FK to profiles)
- created_at: timestamp
```

✅ **post_bookmarks**
```sql
- id: uuid (PK)
- post_id: uuid (FK to posts)
- user_id: uuid (FK to profiles)
- created_at: timestamp
```

✅ **post_reactions** (exists but not used for likes in Lockdown v1)

---

## 🚀 RPC Function Verification

### `get_universal_feed` Status:

✅ **All Tab** - Returns all visible posts  
✅ **Network Tab** - Filters by connections  
✅ **Mine Tab** - Filters by `author_id = viewer_id`  
✅ **Saved Tab** - Filters by bookmarks  

✅ **Computed Fields:**
- `like_count` - Counts from `post_likes`
- `comment_count` - Counts from `comments`
- `bookmark_count` - Counts from `post_bookmarks`
- `has_liked` - Checks user's like status
- `has_bookmarked` - Checks user's bookmark status

---

## 📋 Final Checklist

### Code Changes Completed:
- [x] Fixed `usePostLikes.ts` to use `post_likes` table
- [x] Fixed `usePostBookmark.ts` invalidation keys
- [x] Created RLS policy for viewing all bookmarks
- [x] Updated `get_universal_feed` to handle bookmarks tab
- [x] Verified gentle error handling throughout

### Manual Tests Required:
- [ ] A: Create Post → appears in All, Mine, Profile
- [ ] C1-C3: Like toggle, persist, unlike
- [ ] D1-D4: Bookmark toggle, Saved tab, persist, remove
- [ ] E: Error UX with network failure

---

## 🎯 Acceptance Criteria

For Lockdown v1 to be complete:

✅ **Post Creation:**
- Posts appear instantly in All tab
- Posts visible in Mine tab
- Posts visible in Profile → Activity

✅ **Likes:**
- Heart toggles on/off
- Counts update correctly
- Persists across refresh

✅ **Bookmarks:**
- Bookmark icon toggles on/off
- Saved tab shows bookmarked posts
- Persists across refresh

✅ **Error Handling:**
- Gentle, user-friendly messages
- No technical details leaked
- Feed remains functional

---

## 🔧 Issues Found & Fixed

### Issue #1: Likes using wrong table
**Problem:** `usePostLikes.ts` was querying `post_reactions` with `emoji = 'like'`  
**Fix:** Changed to use `post_likes` table directly  
**Migration:** N/A (table already existed)  
**Files Changed:** `src/hooks/usePostLikes.ts`

### Issue #2: Bookmark counts not visible
**Problem:** RLS on `post_bookmarks` blocked other users from seeing bookmark existence  
**Fix:** Created policy "Users can view all post bookmarks" with `USING (true)`  
**Migration:** `supabase/migrations/20251123093419_8c190d6a-7ad1-424a-9221-1413aa1e4bf7.sql`  
**Files Changed:** N/A (migration only)

### Issue #3: Feed cache not invalidating
**Problem:** Like/bookmark changes didn't refresh feed counts  
**Fix:** Added `['universal-feed']` and `['universal-feed-infinite']` to invalidation  
**Migration:** N/A  
**Files Changed:** `src/hooks/usePostLikes.ts`, `src/hooks/usePostBookmark.ts`

---

## ✅ Conclusion

**Code Review Status:** ✅ **ALL SYSTEMS READY**

All code-level issues have been identified and fixed:
- Database tables exist and are correctly structured
- RLS policies allow proper access
- Hooks use correct tables and invalidation strategies
- Error handling is gentle and trust-first
- `get_universal_feed` RPC correctly handles all tabs

**Next Step:** Manual QA testing using the checklists above.

Once manual tests pass, Lockdown v1 is complete and ready for:
- Story mode re-enable (v1.1)
- Reshare injection (v1.2)
- Event/Space/Need posting (v2)
- Feed ranking (ADIN M1)

---

**End of Report**
