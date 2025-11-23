# DNA | FEED + COMPOSER - Production Readiness Status

**Generated:** 2025-01-23  
**System Version:** Trust-First v1.0  
**Spec Compliance:** DNA Universal Feed + Universal Composer Master Spec

---

## 🎯 Mission: LinkedIn-Grade Trust & Predictability

> **"If I post, I immediately see it. Every time. Everywhere it should be."**

This document tracks the current production-readiness status of all DNA Feed and Composer modes against the Trust-First specification.

---

## ✅ FULLY PRODUCTION-READY MODES

These modes have been tested, verified, and deliver LinkedIn-grade behavior:

### 1. **Post** (Standard Text/Media Post)
- ✅ **Status:** PRODUCTION READY
- ✅ **Optimistic Injection:** Complete
- ✅ **Feed Surfaces:** All, My Posts, Profile Activity, Space Activity (if context), Event Activity (if context)
- ✅ **Error Handling:** Preserves content, shows clear message
- ✅ **Tested:** ✓ No context, ✓ With spaceId, ✓ With eventId
- **Implementation:** `createStandardPost()` → `feedWriter`
- **Returns:** Full `UniversalFeedItem` for immediate display

### 2. **Story** (Convey Long-Form Content)
- ✅ **Status:** PRODUCTION READY
- ✅ **Optimistic Injection:** Complete
- ✅ **Feed Surfaces:** All, My Posts, Profile Activity, Space Activity (if context), Event Activity (if context)
- ✅ **Error Handling:** Preserves content, shows clear message
- ✅ **Tested:** ✓ Standalone, ✓ With spaceId, ✓ With eventId
- **Implementation:** `convey_items` insert → `createStoryPost()` → `feedWriter`
- **Returns:** Full `UniversalFeedItem` for immediate display

---

## 🚧 NOT YET PRODUCTION-READY MODES

These modes have code paths but **do not meet Trust-First standards** yet. They are currently **HIDDEN** from the Composer UI via `src/config/composerModes.ts`.

### 3. **Event** (Convene Gathering Creation)
- ❌ **Status:** NOT PRODUCTION READY
- ❌ **Optimistic Injection:** Not implemented
- ❌ **Feed Surfaces:** Unknown (not verified)
- **Blocker:** Edge function `create-event` does not return a post object or `UniversalFeedItem`
- **Required Fix:**
  1. Update `create-event` edge function to return created post data
  2. Build `UniversalFeedItem` in `useUniversalComposer` after event creation
  3. Inject into feed caches (All, My Posts, Event Activity)
  4. Verify event appears instantly in all surfaces
- **Current Implementation:** Calls edge function, invalidates queries, but no optimistic display

### 4. **Need** (Contribute Request/Offer)
- ❌ **Status:** NOT PRODUCTION READY
- ❌ **Optimistic Injection:** Not implemented
- ❌ **Feed Surfaces:** Unknown (not verified)
- **Blocker:** `createNeedPost()` does not return post data for optimistic injection
- **Required Fix:**
  1. Modify `createNeedPost()` to return created post or query it back
  2. Build `UniversalFeedItem` in `useUniversalComposer`
  3. Inject into feed caches (All, My Posts, Space Activity)
  4. Verify need appears instantly in all surfaces
- **Current Implementation:** Inserts need + feed post, invalidates queries, but no optimistic display
- **Additional Note:** Requires `spaceId` in context to work

### 5. **Space** (Collaborate Project/Initiative Creation)
- ❌ **Status:** NOT PRODUCTION READY
- ❌ **Optimistic Injection:** Not implemented
- ❌ **Feed Surfaces:** Unknown (not verified)
- **Blocker:** `createSpacePost()` does not return post data for optimistic injection
- **Required Fix:**
  1. Modify `createSpacePost()` to return created post or query it back
  2. Build `UniversalFeedItem` in `useUniversalComposer`
  3. Inject into feed caches (All, My Posts, Profile Activity)
  4. Verify space announcement appears instantly in all surfaces
- **Current Implementation:** Inserts space + feed post, invalidates queries, but no optimistic display

### 6. **Community** (Community-Specific Post)
- ❌ **Status:** NOT PRODUCTION READY
- ❌ **Optimistic Injection:** Not implemented
- ❌ **Feed Surfaces:** Unknown (not verified)
- **Blocker:** `createCommunityFeedPost()` does not return post data for optimistic injection
- **Required Fix:**
  1. Modify `createCommunityFeedPost()` to return created post or query it back
  2. Build `UniversalFeedItem` in `useUniversalComposer`
  3. Inject into feed caches (All, My Posts, Community Activity if exists)
  4. Verify community post appears instantly in all surfaces
- **Current Implementation:** Inserts community post + feed post, invalidates queries, but no optimistic display
- **Additional Note:** Requires `communityId` in context to work

---

## 📊 TRUST-FIRST COMPLIANCE MATRIX

| Mode | Optimistic Injection | Feed: All | Feed: My Posts | Profile Activity | Context Activity | Error Preserves Content | Enabled in UI |
|------|---------------------|-----------|----------------|------------------|------------------|------------------------|---------------|
| **post** | ✅ | ✅ | ✅ | ✅ | ✅ (if context) | ✅ | ✅ |
| **story** | ✅ | ✅ | ✅ | ✅ | ✅ (if context) | ✅ | ✅ |
| **event** | ❌ | ❓ | ❓ | ❓ | ❓ | ✅ | ❌ |
| **need** | ❌ | ❓ | ❓ | ❓ | ❓ (Space) | ✅ | ❌ |
| **space** | ❌ | ❓ | ❓ | ❓ | ❌ | ✅ | ❌ |
| **community** | ❌ | ❓ | ❓ | ❓ | ❓ | ✅ | ❌ |

**Legend:**
- ✅ = Verified working
- ❌ = Not implemented / Not working
- ❓ = Unknown / Not tested

---

## 🏗️ ARCHITECTURAL VERIFICATION

### ✅ Universal Feed System
- **All feed surfaces use:** `useUniversalFeed` or `useInfiniteUniversalFeed`
- **Profile Activity:** `<ProfileActivityFeed>` → `<UniversalFeed authorId={profileUserId} />`
- **Space Activity:** `<SpaceActivityFeed>` → `<UniversalFeed spaceId={spaceId} />`
- **Event Activity:** `<EventActivityFeed>` → `<UniversalFeed eventId={eventId} />`
- **Home Feed:** `/dna/feed` → `<UniversalFeedInfinite>` with tab filters
- **No legacy feed code paths detected** ✅

### ✅ Universal Composer System
- **All creation flows route through:** `useUniversalComposer`
- **All database inserts route through:** `src/lib/feedWriter.ts` helpers
- **No direct `posts` table inserts outside feedWriter** ✅

### ✅ Error Handling
- **All modes:** Preserve content on failure
- **All modes:** Show mode-specific error messages
- **All modes:** Never close composer on error
- **Logging:** Uses `logHighError()` for all failures

---

## 🧪 RECOMMENDED TESTING WORKFLOW

For any mode you want to promote from "Not Ready" → "Production Ready":

### Step 1: Implement Optimistic Injection
1. Ensure the creation function returns post data or re-fetches it
2. Build a complete `UniversalFeedItem` object in `useUniversalComposer.submit()`
3. Inject into:
   - `['universal-feed-infinite', { tab: 'all', ... }]`
   - `['universal-feed-infinite', { tab: 'my_posts', authorId: user.id, ... }]`
   - Context feed if applicable (Space/Event/Community)

### Step 2: Manual Runtime Test
Create content in these scenarios:
- ✅ No context (from /dna/feed)
- ✅ From within a Space (if applicable)
- ✅ From within an Event (if applicable)
- ✅ From within a Community (if applicable)

For each scenario, verify:
- ✅ Content appears immediately at top of Home → All
- ✅ Content appears immediately in My Posts
- ✅ Content appears in Profile → Activity
- ✅ Content appears in Context Activity (Space/Event/Community)

### Step 3: Enable in Config
Update `src/config/composerModes.ts`:
```typescript
{
  id: 'your-mode',
  enabled: true,  // ← Change from false
  tested: true,   // ← Change from false
  optimisticFeedInjection: true, // ← Change from false
  notes: 'Fully tested and verified',
}
```

### Step 4: Update This Document
Mark the mode as "PRODUCTION READY" in this status report.

---

## 🚀 NEXT STEPS TO UNLOCK MORE MODES

### To Enable **Event** Mode:
1. Update `supabase/functions/create-event/index.ts`:
   - After event creation, call `createEventPost()` 
   - Return the created post data in the response
2. In `useUniversalComposer.ts`:
   - Extract returned post data from edge function response
   - Build `UniversalFeedItem` object
   - Inject into feed caches
3. Test across all contexts
4. Enable in `composerModes.ts`

### To Enable **Need** Mode:
1. Update `src/lib/feedWriter.ts → createNeedPost()`:
   - After inserting feed post, fetch and return it
2. In `useUniversalComposer.ts`:
   - Capture returned post
   - Build `UniversalFeedItem`
   - Inject into feed caches
3. Test in Space contexts
4. Enable in `composerModes.ts`

### To Enable **Space** Mode:
1. Update `src/lib/feedWriter.ts → createSpacePost()`:
   - After inserting feed post, fetch and return it
2. In `useUniversalComposer.ts`:
   - Capture returned post
   - Build `UniversalFeedItem`
   - Inject into feed caches
3. Test
4. Enable in `composerModes.ts`

### To Enable **Community** Mode:
1. Update `src/lib/feedWriter.ts → createCommunityFeedPost()`:
   - After inserting feed post, fetch and return it
2. In `useUniversalComposer.ts`:
   - Capture returned post
   - Build `UniversalFeedItem`
   - Inject into feed caches
3. Test in Community contexts
4. Enable in `composerModes.ts`

---

## 📋 SYSTEM HEALTH CHECKLIST

Before any production launch or major release, confirm:

- [ ] Only production-ready modes are visible in Composer UI
- [ ] All enabled modes have optimistic injection working
- [ ] All feed surfaces use Universal Feed (no legacy code)
- [ ] Error handling preserves user content across all modes
- [ ] Test matrix passes for all enabled modes
- [ ] `docs/FEED-TRUST-TEST-MATRIX.md` is up to date

---

## 📞 HOW TO USE THIS DOCUMENT

**For Product/Founders:**
- Check "FULLY PRODUCTION-READY MODES" to see what's safe to show users
- Check "NOT YET PRODUCTION-READY MODES" to understand what's coming next
- Use "NEXT STEPS TO UNLOCK MORE MODES" to plan sprints

**For Developers:**
- Use "RECOMMENDED TESTING WORKFLOW" to verify new modes
- Use "NEXT STEPS TO UNLOCK MORE MODES" as implementation specs
- Update this doc whenever mode status changes

**For QA:**
- Use "TRUST-FIRST COMPLIANCE MATRIX" to guide testing
- Use "RECOMMENDED TESTING WORKFLOW" as test plan
- Use "SYSTEM HEALTH CHECKLIST" before signoff

---

## 🔄 DOCUMENT UPDATE POLICY

Update this document whenever:
- A mode is enabled or disabled in `composerModes.ts`
- Optimistic injection is added to a mode
- A mode passes full testing and is promoted to production-ready
- New feed surfaces are added
- Architecture changes affect feed or composer

**Last Updated:** 2025-01-23 by Makena AI  
**Next Review:** After next mode promotion or sprint completion
