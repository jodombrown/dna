# DNA | FEED + COMPOSER - Trust-First Test Matrix

## Non-Negotiable Behavior

**For every post created via Universal Composer:**

### Global Feed Surfaces (MUST ALWAYS SHOW)
- ✅ `/dna/feed` → **All** tab
- ✅ `/dna/feed` → **My Posts** tab  
- ✅ `Profile → Activity` (author's profile)

### Context Feed Surfaces (MUST SHOW IF CONTEXT EXISTS)
- ✅ If `spaceId` set → **Space → Activity**
- ✅ If `eventId` set → **Event → Activity**
- ✅ If `communityId` set → **Community feed**

---

## Test Matrix

Run this matrix after ANY composer or feed changes:

| Mode | Context | Create Action | Expected Surfaces | Status |
|------|---------|---------------|------------------|--------|
| **post** | none | Create plain post | All, My Posts, Profile | ⬜ |
| **post** | spaceId | Post in space | All, My Posts, Profile, Space Activity | ⬜ |
| **post** | eventId | Post in event | All, My Posts, Profile, Event Activity | ⬜ |
| **story** | none | Publish story | All, My Posts, Profile | ⬜ |
| **story** | spaceId | Story in space | All, My Posts, Profile, Space Activity | ⬜ |
| **story** | eventId | Story in event | All, My Posts, Profile, Event Activity | ⬜ |
| **event** | none | Create event | All, My Posts, Profile | ⬜ |
| **event** | spaceId | Event in space | All, My Posts, Profile, Space Activity | ⬜ |
| **need** | spaceId | Post need | All, My Posts, Profile, Space Activity | ⬜ |
| **space** | none | Create space | All, My Posts, Profile | ⬜ |
| **community** | communityId | Community post | All, My Posts, Profile, Community feed | ⬜ |

---

## Quick Smoke Test (30 seconds)

Run this every time you ship a change:

1. ✅ **Plain post** → confirm in All / My Posts / Profile
2. ✅ **Post in Space** → confirm in Space Activity + All / My Posts / Profile  
3. ✅ **Post in Event** → confirm in Event Activity + All / My Posts / Profile
4. ✅ **Create Story** → confirm in All / My Posts / Profile
5. ✅ **Create Event** → confirm in All / My Posts / Profile
6. ✅ **Create Need** → confirm in All / My Posts / Profile + Space Activity
7. ✅ **Community Post** → confirm in Community + All / My Posts / Profile

---

## Failure Debugging Checklist

If a post does NOT appear where expected:

### 1. Check Composer Submission Path
- [ ] Is the correct `feedWriter` helper being called?
- [ ] Are `spaceId`/`eventId`/`communityId` being passed correctly?
- [ ] Does the insert succeed without error?

### 2. Check feedWriter Helper
- [ ] Is the post being inserted into `posts` table?
- [ ] Are `post_type`, `linked_entity_type`, `linked_entity_id` set correctly?
- [ ] Are context fields (`space_id`, `event_id`) being set?

### 3. Check get_universal_feed RPC
- [ ] Does the tab filter include this post? (check `p_tab` logic)
- [ ] Does the author filter work? (check `p_author_id` condition)
- [ ] Does the context filter work? (check `p_space_id`, `p_event_id`)
- [ ] Is the post actually in the database with `is_deleted = FALSE`?

### 4. Check RLS Policies
- [ ] Can the viewer see posts from this author?
- [ ] Is there a policy blocking space/event context posts?
- [ ] Run: `SELECT * FROM posts WHERE id = '<post_id>'` as the user

### 5. Check Client Cache
- [ ] Is optimistic insertion working? (check `useUniversalComposer`)
- [ ] Is the query invalidation happening?
- [ ] Try hard refresh to bypass cache

---

## Current Implementation Status

### ✅ Fully Working
- Standard `post` creation (no context)
- Optimistic cache injection for All / My Posts feeds
- Clear error messages on failure
- Content preservation on error

### ⚠️ Needs Verification
- Space context posts → Space Activity feed
- Event context posts → Event Activity feed
- Community posts → Community feed visibility
- Profile Activity feed integration

### 🔧 Known Issues
- [ ] Some entity types (story, event, need, space, community) don't create `UniversalFeedItem` optimistically
- [ ] Context feeds may not be getting optimistic updates
- [ ] Profile Activity feed not mounted/tested

---

## P0 Fixes Required

1. **Extend optimistic creation to ALL modes**
   - Currently only `post` mode creates a `createdPost` object
   - Need to map all modes (story, event, need, space, community) to `UniversalFeedItem` shape

2. **Add Profile Activity feed mounting**
   - Ensure `/profile/:username → Activity` tab uses `UniversalFeed` with `authorId` filter

3. **Add Space Activity feed mounting**  
   - Ensure `/spaces/:id → Activity` tab uses `UniversalFeed` with `spaceId` filter

4. **Add Event Activity feed mounting**
   - Ensure `/events/:id → Activity` tab uses `UniversalFeed` with `eventId` filter

5. **Test Community post visibility**
   - Verify community posts flow through `get_universal_feed` correctly
   - Check if `space_id = community_id` mapping works for filtering

---

## Success Criteria

**This system is TRUST-FIRST when:**

✅ Every composer submission creates a post that appears in the correct surfaces **immediately**  
✅ User never wonders "where did my post go?"  
✅ If submission fails, user gets a **clear error** and content is **preserved**  
✅ All (mode × context) combinations work reliably

**Phase 0 is complete when:** You can run the Quick Smoke Test and every checkbox passes.
