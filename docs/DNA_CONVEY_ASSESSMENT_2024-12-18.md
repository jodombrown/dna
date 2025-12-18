# DNA | CONVEY — System Audit & Feature Map
**M0 Diagnostic Assessment**  
**Date:** December 18, 2024  
**Document Version:** 1.0

---

## Executive Summary

### Current State

DNA | CONVEY is the **narrative layer** of the 5 Cs Mobilization Engine—the mechanism by which activity across Connect, Convene, Collaborate, and Contribute is transformed into shareable stories that inspire, inform, and drive the network forward.

CONVEY currently exists in a **hybrid state** with two parallel story systems:

1. **Legacy `convey_items` table** — Original schema with slug-based routing, rich metadata (focus_areas, region, visibility), and direct foreign keys to spaces/events/needs
2. **Modern `posts` table** — Universal Composer-created stories with `post_type='story'` and `story_type` classification, integrated into the Universal Feed

The frontend intelligently bridges both systems, attempting slug-based lookup first (`convey_items`) and falling back to UUID-based lookup (`posts`). This creates a functional but complex architecture.

### Key Strengths

1. **Rich Story Type Framework** — Four structured templates (Impact, Update, Spotlight, Photo Essay) with type-specific placeholders and suggested lengths
2. **Cross-5C Integration** — Stories can link to Spaces (COLLABORATE), Events (CONVENE), and Needs (CONTRIBUTE) 
3. **BuzzFeed-Inspired Hub** — Modern ConveyStoryHub with category sections, trending algorithm, and engagement-driven discovery
4. **Full Engagement Stack** — Reactions, comments, views, bookmarks all tracked with real-time counters
5. **Trending Algorithm** — 48-hour engagement velocity scoring (views×1 + reactions×3 + comments×5 + bookmarks×2)
6. **Rich Text Editor** — Floating toolbar + slash commands + media drag-and-drop + URL auto-embed

### Key Gaps

1. **Dual Data Model Complexity** — Two story systems (`convey_items` vs `posts.post_type='story'`) create routing confusion and maintenance burden
2. **Impact Story Flow Incomplete** — The Contribute→Convey "share your impact" pathway exists but prefill/validation integration is rough
3. **Admin Analytics Partial** — ConveyAnalytics page exists but only tracks `convey_items`, not `posts` table stories
4. **No Editorial Curation** — Phase 2 (platform-curated content) infrastructure not started
5. **Legacy Mock Data** — `useConveyLogic.ts` contains 500+ lines of hardcoded sample stories

### Top 5 Priorities

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | **Unify story data model** — Migrate to `posts` table exclusively, deprecate `convey_items` | High | Critical |
| 2 | **Fix Impact Story flow** — Clean Contribute→Convey pathway with proper prefill | Medium | High |
| 3 | **Update Admin Analytics** — Track `posts` table stories, not just `convey_items` | Low | Medium |
| 4 | **Remove legacy mock data** — Delete `useConveyLogic.ts` hardcoded stories | Low | Low |
| 5 | **Add story series/collections** — Enable multi-part story publishing | Medium | Medium |

---

## Feature Inventory

### 1. ConveyStoryHub (Main Feed)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Central discovery hub for all diaspora stories with category filtering and trending discovery |
| **User Actions** | Browse stories by type (All/Impact/Update/Spotlight/Photo), switch between All/My Stories/Saved tabs, search, write new story |
| **Routes** | `/dna/convey` (primary entry point) |
| **Components** | `ConveyStoryHub.tsx`, `ConveyTrendingSection.tsx`, `ConveyCategorySection.tsx`, `ConveyStoryCard.tsx` |
| **Hooks** | `useInfiniteUniversalFeed`, `useTrendingStories` |
| **Backend** | `posts` table, `get_trending_stories` RPC |
| **Consumes** | Universal Feed (CONNECT), Profile data (CONNECT) |
| **Drives** | Profile discovery (CONNECT), Space discovery (COLLABORATE) |
| **Maturity** | **Stable** — Fully functional with BuzzFeed-inspired design |
| **Recommendation** | **KEEP** — Core experience is solid |

---

### 2. Story Detail Page

| Attribute | Details |
|-----------|---------|
| **Purpose** | Full reading experience for individual stories with engagement features |
| **User Actions** | Read story, react, bookmark, share, view linked space/event, navigate to author profile |
| **Routes** | `/dna/convey/stories/:slug` (slug or UUID supported) |
| **Components** | `StoryDetail.tsx`, uses `DetailViewLayout` |
| **Hooks** | `useConveyItemBySlug`, `useStoryById`, `useStoryEngagement` |
| **Backend** | `convey_items` OR `posts` table (dual lookup), `post_reactions`, `post_comments`, `post_views`, `post_bookmarks` |
| **Consumes** | Space data (COLLABORATE), Event data (CONVENE), Author profiles (CONNECT) |
| **Drives** | Space pages (COLLABORATE), Event pages (CONVENE), Profile pages (CONNECT) |
| **Maturity** | **Usable but rough** — Dual-system lookup adds complexity |
| **Recommendation** | **REFACTOR** — Standardize on single data source |

---

### 3. Story Creation (Universal Composer Path)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Allow users to create and publish stories via Universal Composer |
| **User Actions** | Open composer in "story" mode, select story type, add title/content/media, publish |
| **Routes** | Triggered via `useUniversalComposer().open('story')` from any surface |
| **Components** | `UniversalComposer.tsx` (story mode), `StoryModeContent.tsx` |
| **Hooks** | `useUniversalComposer` |
| **Backend** | `createStoryPost()` in `feedWriter.ts` → `posts` table |
| **Consumes** | User profile (CONNECT), Spaces (COLLABORATE), Events (CONVENE) |
| **Drives** | Feed appearance (CONNECT), Space activity (COLLABORATE) |
| **Maturity** | **Stable** — Primary story creation path |
| **Recommendation** | **KEEP** — This is the canonical creation path |

---

### 4. Legacy Story Creation (ConveyItemForm Path)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Original story creation form with rich metadata fields |
| **User Actions** | Fill form with type, title, subtitle, body, visibility, region, tags, series |
| **Routes** | `/dna/convey/new?space_id=X&event_id=Y&need_id=Z` |
| **Components** | `CreateStory.tsx`, `ConveyItemForm.tsx`, `RichTextEditor.tsx`, `CoverImageEditor.tsx`, `StoryTagsInput.tsx`, `StorySeriesSelect.tsx` |
| **Hooks** | `useCreateConveyItem`, `useUpdateConveyItem`, `useCheckExistingImpactDraft` |
| **Backend** | `convey_items` table, also creates `posts` entry via `createStoryPost()` |
| **Consumes** | Space/Event/Need context, User profile |
| **Drives** | Feed, Space updates, Event stories |
| **Maturity** | **Partial/WIP** — Rich features but creates in legacy table |
| **Recommendation** | **REFACTOR** — Merge capabilities into Universal Composer or consolidate to single table |

---

### 5. Rich Text Editor

| Attribute | Details |
|-----------|---------|
| **Purpose** | Markdown-based story authoring with formatting tools |
| **Features** | Fixed toolbar (bold, italic, underline, strikethrough, highlight, code, headings, quotes, lists), slash command menu, media drag-and-drop, URL auto-embed for YouTube/Vimeo/images, word count, reading time estimate |
| **Components** | `RichTextEditor.tsx`, `FloatingToolbar.tsx`, `SlashCommandMenu.tsx`, `MediaDropZone.tsx` |
| **Maturity** | **Stable** — Full-featured markdown editor |
| **Recommendation** | **KEEP** — Well-implemented editing experience |

---

### 6. Space Updates Section

| Attribute | Details |
|-----------|---------|
| **Purpose** | Display CONVEY items linked to a specific Space on the Space detail page |
| **User Actions** | View updates, leads can post new updates |
| **Routes** | Embedded in `/dna/collaborate/spaces/:slug` |
| **Components** | `SpaceUpdatesSection.tsx`, `ConveyFeedCard.tsx` |
| **Hooks** | `useSpaceConveyItems` |
| **Backend** | `convey_items` table filtered by `primary_space_id` |
| **Consumes** | Space context (COLLABORATE) |
| **Drives** | Story creation (via "Post an update" CTA) |
| **Maturity** | **Stable** — Well-integrated cross-C component |
| **Recommendation** | **KEEP** — Key interconnection point |

---

### 7. Event Stories Section

| Attribute | Details |
|-----------|---------|
| **Purpose** | Display stories and updates linked to a specific Event |
| **User Actions** | View event-related stories, navigate to full story |
| **Routes** | Embedded in `/dna/convene/events/:id` |
| **Components** | `EventStoriesSection.tsx` |
| **Hooks** | `useEventConveyItems` |
| **Backend** | `convey_items` table filtered by `primary_event_id` |
| **Consumes** | Event context (CONVENE) |
| **Drives** | Story detail pages (CONVEY) |
| **Maturity** | **Stable** — Clean integration |
| **Recommendation** | **KEEP** — Key interconnection point |

---

### 8. Profile Stories Section

| Attribute | Details |
|-----------|---------|
| **Purpose** | Display a user's published stories on their profile |
| **User Actions** | Browse profile owner's stories, navigate to full story |
| **Routes** | Embedded in `/dna/profile`, `/u/:username`, `/dna/:username` |
| **Components** | `ProfileStoriesSection.tsx` |
| **Hooks** | Direct Supabase query on `convey_items` |
| **Backend** | `convey_items` table filtered by `author_id` |
| **Consumes** | Profile context (CONNECT) |
| **Drives** | Story detail pages, Convey hub ("View all stories") |
| **Maturity** | **Stable** — Clean profile integration |
| **Recommendation** | **KEEP** — Key cross-C surface |

---

### 9. Trending Stories Section

| Attribute | Details |
|-----------|---------|
| **Purpose** | Surface highest-engagement stories from past 48 hours |
| **Algorithm** | Score = views(1x) + reactions(3x) + comments(5x) + bookmarks(2x) |
| **Routes** | Displayed on ConveyStoryHub main page |
| **Components** | `ConveyTrendingSection.tsx`, `TrendingCard` subcomponent |
| **Hooks** | `useTrendingStories` |
| **Backend** | `get_trending_stories` RPC function |
| **Maturity** | **Stable** — Algorithm implemented and working |
| **Recommendation** | **KEEP** — Drives discovery and engagement |

---

### 10. Story Engagement System

| Attribute | Details |
|-----------|---------|
| **Purpose** | Track and display reactions, comments, views, bookmarks on stories |
| **Features** | Emoji reactions (👏❤️🔥💡🙌), comment counts, view tracking (IntersectionObserver), bookmark toggle |
| **Components** | `ConveyStoryCard.tsx` (engagement row), `StoryDetail.tsx` (engagement bar) |
| **Hooks** | `useStoryEngagement`, `useStoryViewTracker` |
| **Backend** | `post_reactions`, `post_comments`, `post_views`, `post_bookmarks` tables, `log_post_view` RPC |
| **Maturity** | **Stable** — Full engagement stack working |
| **Recommendation** | **KEEP** — Core engagement infrastructure |

---

### 11. Convey Analytics (Admin)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Admin dashboard for tracking CONVEY performance |
| **Metrics** | Stories created, published, viewed, CTA clicks; top stories by views; space activity |
| **Routes** | `/app/admin/convey` |
| **Components** | `ConveyAnalytics.tsx` |
| **Backend** | `analytics_events` table (convey_* events), `convey_items` table |
| **Maturity** | **Partial** — Only tracks `convey_items`, not `posts` table stories |
| **Recommendation** | **REFACTOR** — Update to track unified story system |

---

### 12. Convey Feed Card (Legacy)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Display card for `convey_items` in various surfaces |
| **Routes** | Used in SpaceUpdatesSection, legacy feeds |
| **Components** | `ConveyFeedCard.tsx` |
| **Data** | `ConveyItemWithDetails` type |
| **Maturity** | **Usable** — Works with legacy data model |
| **Recommendation** | **DEPRECATE** when unified on `posts` table |

---

### 13. Feed Story Card (Activity Feed)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Display story activity in profile activity feeds |
| **Routes** | Used in activity timeline components |
| **Components** | `FeedStoryCard.tsx` |
| **Data** | `Activity` type with `entity_data` containing story info |
| **Maturity** | **Stable** |
| **Recommendation** | **KEEP** |

---

### 14. Story Types Configuration

| Attribute | Details |
|-----------|---------|
| **Purpose** | Define structured templates for different story types |
| **Types** | `impact`, `update`, `spotlight`, `photo_essay` |
| **Config** | Label, description, icon, placeholders (title/subtitle/content), suggested length, gallery support |
| **Location** | `src/types/storyTypes.ts` |
| **Maturity** | **Stable** — Well-defined type system |
| **Recommendation** | **KEEP** — Foundation for story structure |

---

### 15. Convey Analytics Hook

| Attribute | Details |
|-----------|---------|
| **Purpose** | Log CONVEY-specific analytics events |
| **Events** | created, published, viewed, cta_clicked, feed_filtered, reaction_added/removed, bookmarked/unbookmarked, shared |
| **Location** | `src/hooks/useConveyAnalytics.ts` |
| **Backend** | `analytics_events` table |
| **Maturity** | **Stable** |
| **Recommendation** | **KEEP** |

---

### 16. Legacy Mock Data (useConveyLogic)

| Attribute | Details |
|-----------|---------|
| **Purpose** | Originally provided hardcoded sample stories for prototyping |
| **Location** | `src/hooks/useConveyLogic.ts` |
| **Lines** | 500+ lines of mock `ImpactStory` data |
| **Maturity** | **Deprecated** — No longer used in production |
| **Recommendation** | **REMOVE** — Dead code creating maintenance burden |

---

## Data Model & Backend

### Primary Tables

| Table | Purpose | Used By |
|-------|---------|---------|
| `convey_items` | Legacy story storage with rich metadata | SpaceUpdatesSection, EventStoriesSection, ProfileStoriesSection, ConveyItemForm |
| `posts` | Universal feed posts including `post_type='story'` | Universal Feed, ConveyStoryHub, trending |
| `post_reactions` | Emoji reactions on posts/stories | useStoryEngagement |
| `post_comments` | Comments on posts/stories | Comment count display |
| `post_views` | View tracking | Trending algorithm, view counts |
| `post_bookmarks` | User bookmarks | Saved stories tab |
| `analytics_events` | Event logging | ConveyAnalytics, tracking |

### Key Columns in `convey_items`

```sql
id, slug, title, subtitle, body, type, status, visibility,
author_id, primary_space_id, primary_event_id, primary_need_id,
primary_offer_id, primary_badge_id, focus_areas, region,
created_at, updated_at, published_at
```

### Key Columns in `posts` for Stories

```sql
id, author_id, title, subtitle, content, post_type ('story'),
story_type ('impact'|'update'|'spotlight'|'photo_essay'),
image_url, gallery_urls, space_id, event_id, privacy_level,
created_at
```

### RPCs

| RPC | Purpose |
|-----|---------|
| `get_trending_stories` | Returns top stories by 48-hour engagement velocity |
| `log_post_view` | Increments view count for a post |

---

## Mobilization Engine Map

### CONVEY ← Inputs (Consumes)

```
CONNECT (Profiles)
├── Author information for stories
├── Profile context for ProfileStoriesSection
└── Network graph for discovery personalization

CONVENE (Events)
├── Event context for event-linked stories
├── primary_event_id linkage
└── EventStoriesSection embedding

COLLABORATE (Spaces)
├── Space context for space-linked stories  
├── primary_space_id linkage
├── SpaceUpdatesSection embedding
└── Space leads can create updates

CONTRIBUTE (Needs/Offers)
├── Impact story context from validated contributions
├── primary_need_id linkage (for impact stories)
└── "Share Your Impact" CTA from needs
```

### CONVEY → Outputs (Drives)

```
CONNECT
├── Author profile clicks from stories
├── "View Profile" CTAs on story cards
└── Profile discovery via authored content

CONVENE  
├── "View Event" CTAs in story sidebar
├── Event page links from event-linked stories
└── Event discovery via story content

COLLABORATE
├── "View Space" CTAs in story sidebar
├── Space page links from space-linked stories
├── Space discovery and join conversions
└── Membership growth via compelling stories

CONTRIBUTE
├── Impact stories showcase contribution outcomes
├── Inspire new contributions via success narratives
└── "Get Involved" CTAs on unlinked stories
```

### Closed Loops (Working)

1. **Space → Story → Space**: Space leads create updates, readers discover and join space
2. **Event → Story → Event**: Event stories drive event page visits and RSVPs
3. **Story → Profile → Connect**: Story readers discover and connect with authors

### Open/Broken Loops

1. **Contribute → Impact Story**: CTA exists but prefill flow is rough; need_id linkage incomplete
2. **Story → Contribute**: "Get Involved" section shows generic CTAs, not contextual needs
3. **Editorial → All Cs**: Platform-curated content (Phase 2) not implemented

---

## Gaps, Risks & Recommendations

### Gaps vs M1-M4 Scope

| Expected | Status | Notes |
|----------|--------|-------|
| Story Hub with category filters | ✅ Complete | BuzzFeed-inspired design |
| Story type templates | ✅ Complete | 4 types with config |
| Space/Event integration | ✅ Complete | SpaceUpdatesSection, EventStoriesSection |
| Impact story flow from Contribute | ⚠️ Partial | CTA exists, prefill rough |
| Trending algorithm | ✅ Complete | 48-hour velocity scoring |
| Rich text editor | ✅ Complete | Full markdown + media |
| Story analytics | ⚠️ Partial | Admin page tracks wrong table |
| Story series/collections | ❌ Stubbed | UI exists, backend not wired |
| Editorial curation (Phase 2) | ❌ Not started | No infrastructure |

### Risks & Tech Debt

| Risk | Severity | Impact |
|------|----------|--------|
| **Dual data model** (`convey_items` + `posts`) | High | Routing complexity, data fragmentation, maintenance burden |
| **Legacy mock data** (useConveyLogic.ts 500+ lines) | Low | Bundle size, confusion |
| **Admin analytics wrong table** | Medium | Metrics don't reflect actual usage |
| **Hardcoded regions** in ConveyItemForm | Low | Not using dynamic region system |
| **No RLS on `convey_items`** mentioned | High | Potential data exposure (needs verification) |

### Recommendations

#### Short-term (0-1 month)

1. **Verify `convey_items` RLS policies** — Ensure proper access control
2. **Remove `useConveyLogic.ts`** — Delete 500+ lines of dead mock data
3. **Update ConveyAnalytics** — Track `posts` table stories, not just `convey_items`
4. **Fix Impact Story prefill** — Clean the Contribute→Convey flow with proper data passing

#### Medium-term (1-3 months)

1. **Unify story data model** — Migrate all story features to `posts` table exclusively:
   - Add missing columns to `posts` if needed (`focus_areas`, `region`, `visibility`)
   - Update SpaceUpdatesSection, EventStoriesSection, ProfileStoriesSection to query `posts`
   - Deprecate `convey_items` table
   - Remove dual-lookup logic from StoryDetail
2. **Implement story series** — Wire up StorySeriesSelect with actual backend
3. **Add contextual CTAs** — "Get Involved" section should show related needs/spaces

#### Longer-term (3-6+ months)

1. **Phase 2: Editorial curation** — Build infrastructure for platform-curated stories:
   - Admin story creation/scheduling
   - Featured story carousel
   - Curated collections
2. **Phase 3: Multimedia** — Enhanced media support:
   - Native video upload/playback
   - Photo essay gallery experience
   - Audio story support
3. **AI-powered features** — Story recommendations, auto-tagging, translation

---

## Routes Reference

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dna/convey` | `Convey.tsx` → `ConveyStoryHub.tsx` | Main story hub |
| `/dna/convey/new` | `CreateStory.tsx` | Legacy story creation |
| `/dna/convey/stories/:slug` | `StoryDetail.tsx` | Story detail view |
| `/app/admin/convey` | `ConveyAnalytics.tsx` | Admin analytics |
| `/convey` (public) | `ConveyExample.tsx` | Marketing/example page |

---

## File Inventory

### Pages
- `src/pages/dna/Convey.tsx`
- `src/pages/dna/convey/ConveyStoryHub.tsx`
- `src/pages/dna/convey/ConveyHub.tsx` (legacy)
- `src/pages/dna/convey/ConveyNewsroom.tsx` (legacy)
- `src/pages/dna/convey/CreateStory.tsx`
- `src/pages/dna/convey/StoryDetail.tsx`
- `src/pages/dna/admin/ConveyAnalytics.tsx`

### Components
- `src/components/convey/ConveyStoryCard.tsx`
- `src/components/convey/ConveyTrendingSection.tsx`
- `src/components/convey/ConveyCategorySection.tsx`
- `src/components/convey/ConveyFeedCard.tsx`
- `src/components/convey/ConveyItemForm.tsx`
- `src/components/convey/ConveyFeedFilters.tsx`
- `src/components/convey/SpaceUpdatesSection.tsx`
- `src/components/convey/EventStoriesSection.tsx`
- `src/components/convey/RichTextEditor.tsx`
- `src/components/convey/CoverImageEditor.tsx`
- `src/components/convey/StoryTagsInput.tsx`
- `src/components/convey/StorySeriesSelect.tsx`
- `src/components/convey/editor/FloatingToolbar.tsx`
- `src/components/convey/editor/SlashCommandMenu.tsx`
- `src/components/convey/editor/MediaDropZone.tsx`
- `src/components/profile/cross-5c/ProfileStoriesSection.tsx`
- `src/components/feed/activity-cards/FeedStoryCard.tsx`

### Hooks
- `src/hooks/useConveyFeed.ts`
- `src/hooks/useConveyMutations.ts`
- `src/hooks/useConveyAnalytics.ts`
- `src/hooks/useConveyLogic.ts` (legacy mock data)
- `src/hooks/useTrendingStories.ts`
- `src/hooks/useStoryEngagement.ts`

### Types
- `src/types/conveyTypes.ts`
- `src/types/storyTypes.ts`

### Services
- `src/lib/feedWriter.ts` (createStoryPost function)

---

## Conclusion

CONVEY is **functionally complete for MVP/beta** with a solid foundation for story creation, discovery, and engagement. The main technical debt is the **dual data model** (`convey_items` vs `posts`), which should be unified before scaling further.

The system successfully closes loops with COLLABORATE (Spaces) and CONVENE (Events), but the CONTRIBUTE integration needs polish. Editorial curation (Phase 2) and multimedia (Phase 3) remain future opportunities.

**Priority 1 for next sprint:** Unify the data model and fix admin analytics to get accurate usage metrics.

---

*Document prepared by system architecture audit*  
*Last updated: December 18, 2024*
