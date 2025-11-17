# DNA FEED AND COMPOSER AUDIT

**Project**: Diaspora Network of Africa (DNA)  
**Date**: 2025-11-17  
**Scope**: Complete analysis of Feed and Post Composer systems before implementing Universal Composer  
**Status**: READ-ONLY ANALYSIS – No code changes made

---

## Overview

DNA is a single-dashboard platform built on a 3-column layout system with 5 core pillars: **Connect**, **Convene**, **Collaborate**, **Contribute**, and **Convey**. The platform currently has multiple post creation mechanisms and feed display systems scattered across different views. This audit identifies all existing composer and feed-related code, traces data flows, and maps the current implementation against the target architecture for a **Universal Composer** and professional-grade **LinkedIn-style Feed**.

**Key Finding**: The platform has **3 different composer implementations**, **multiple feed views**, and **inconsistent data flows** between composer creation and feed display. Some composers write to tables that feeds never read from, creating potential data loss scenarios.

---

## 1. Composer – Code Inventory

### 1.1 Primary Composer Components

#### **A. PostComposer** (Social Feed Composer)
- **Path**: `src/components/social-feed/PostComposer.tsx`
- **Lines**: 440+ lines (most comprehensive)
- **What it does**: 
  - Advanced composer with pillar selection (Connect, Collaborate, Contribute, etc.)
  - Supports multiple post types: text, image, video, link, poll, opportunity, question, spotlight
  - Auto-embed detection for URLs
  - Media upload via `useUploadPostMedia` hook
  - Adaptive UI that collapses/expands based on scroll position
  - Supports poll creation with up to 5 options
  - Admin-only content types (opportunity, spotlight)
- **Supabase Write**:
  - Table: `posts`
  - Columns: `author_id`, `content`, `post_type`, `privacy_level`, `image_url`, `link_url`, `link_title`, `link_description`
- **Used in**:
  - `src/pages/ActivityFeed.tsx` (line 114)
  - `src/components/mobile/MobilePostButton.tsx` (via Dialog)
  - Wrapped in `FloatingPostComposer` for sticky behavior

#### **B. EnhancedCreatePostDialog** (Modal Composer)
- **Path**: `src/components/posts/EnhancedCreatePostDialog.tsx`
- **Lines**: 355+ lines
- **What it does**:
  - Dialog-based post creation
  - Post type selection: update, article, question, celebration, text, image, video, link, poll, opportunity, spotlight
  - Privacy level: public, connections
  - Media upload with preview (images, videos, documents)
  - 5000 character limit
  - File size validation (10MB max)
- **Supabase Write**:
  - Table: `posts`
  - Columns: Same as PostComposer (lines 136-143)
- **Used in**:
  - `src/pages/dna/Feed.tsx` (line 221)
  - `src/components/dashboard/DashboardFeedColumn.tsx` (line 263)
  - `src/components/mobile/MobileBottomNav.tsx` (line 175)

#### **C. CreatePost** (Inline Simple Composer)
- **Path**: `src/components/feed/CreatePost.tsx`
- **Lines**: 118 lines
- **What it does**:
  - Simple inline composer (text-only)
  - Minimal UI with disabled media buttons (Photo, Video, Link shown but not functional)
  - Uses React Query mutation
  - Fixed `post_type: 'text'` and `privacy_level: 'public'`
- **Supabase Write**:
  - Table: `posts`
  - Columns: `author_id`, `content`, `post_type`, `privacy_level` (lines 20-27)
- **Used in**: Not actively used in current routes (legacy component)

#### **D. CreatePostDialog** (Basic Dialog)
- **Path**: `src/components/posts/CreatePostDialog.tsx`
- **Lines**: ~200 lines
- **What it does**:
  - Basic post creation dialog
  - Post type and privacy level selection
  - Text-only content
  - 5000 character limit
- **Supabase Write**:
  - Table: `posts`
  - Columns: `author_id`, `content`, `post_type`, `privacy_level` (lines 70-75)
- **Used in**:
  - `src/pages/FeedPage.tsx` (line 171)
  - `src/pages/NetworkFeedPage.tsx` (line 162)

### 1.2 Community-Specific Composer

#### **E. CreatePostDialog (Community Posts)**
- **Path**: `src/components/community/CreatePostDialog.tsx`
- **Lines**: ~200 lines
- **What it does**:
  - Community-specific post creation
  - Requires community selection
  - Post type: discussion, announcement, question, event
  - Optional title field
- **Supabase Write**:
  - Table: **`community_posts`** (NOT `posts` table!)
  - Columns: `community_id`, `author_id`, `content`, `post_type`, `title`
- **Used in**: Community pages
- **⚠️ Critical Gap**: These posts go to `community_posts` table, which **is NOT read by the main feed**.

### 1.3 Composer Helper Components

- **FloatingPostComposer** (`src/components/social-feed/FloatingPostComposer.tsx`): Wrapper that makes PostComposer sticky/floating
- **MobilePostButton** (`src/components/mobile/MobilePostButton.tsx`): Mobile FAB that opens PostComposer in dialog
- **useUploadPostMedia** (`src/components/social-feed/useUploadPostMedia.ts`): Hook for media uploads to Supabase Storage (`user-posts` bucket)
- **useAutoEmbedDetection** (referenced in PostComposer): Detects URLs and fetches link previews

### 1.4 Summary Table

| Component | Location | Post Types Supported | Media Support | Target Table | Currently Used |
|-----------|----------|---------------------|---------------|--------------|----------------|
| PostComposer | social-feed/ | 8 types (text, image, video, link, poll, opportunity, question, spotlight) | ✅ Full (image, video, embeds, polls) | `posts` | ActivityFeed, Mobile |
| EnhancedCreatePostDialog | posts/ | 11 types | ✅ Full (image, video, docs) | `posts` | DNA Feed, Dashboard, Mobile |
| CreatePost | feed/ | text only | ❌ Disabled | `posts` | Not used |
| CreatePostDialog | posts/ | All basic types | ❌ Text only | `posts` | FeedPage, NetworkFeedPage |
| CreatePostDialog (Community) | community/ | 4 community types | ❌ Text only | `community_posts` | Communities |

---

## 2. Feed – Code Inventory

### 2.1 Primary Feed Views

#### **A. DNA Feed (Main Multi-C Feed)**
- **Path**: `src/pages/dna/Feed.tsx`
- **Lines**: 257 lines
- **What it shows**:
  - 3 tabs: "All", "Connections", "My Posts"
  - Posts from all 5Cs (Connect, Convene, Collaborate, Contribute, Convey)
  - Real-time updates via Supabase subscriptions
  - Post comments expandable inline
- **Data Source**:
  - RPC: `get_feed_posts` with params `p_user_id`, `p_feed_type`, `p_limit: 20`, `p_offset: 0`
  - Feed types: 'all', 'connections', 'my_posts'
- **Displays**: `PostCard` component for each post
- **Route**: `/dna/feed`

#### **B. ActivityFeed (Legacy Feed)**
- **Path**: `src/pages/ActivityFeed.tsx`
- **What it shows**:
  - General activity feed
  - Uses `fetchPosts()` service function
  - Real-time subscriptions
- **Data Source**:
  - Service: `postsService.fetchPosts()` → calls `get_feed_posts` RPC
- **Route**: Not clearly mapped in current routing

#### **C. FeedPage (Generic Feed)**
- **Path**: `src/pages/FeedPage.tsx`
- **What it shows**:
  - 3 tabs: All, Connections, My Posts
  - Similar to DNA Feed but wrapped in FeedLayout
- **Data Source**: 
  - RPC: `get_feed_posts`
- **Route**: Not primary route

#### **D. NetworkFeedPage**
- **Path**: `src/pages/NetworkFeedPage.tsx`
- **What it shows**:
  - 2 tabs: "Network Updates" (connections), "My Posts"
- **Data Source**:
  - RPC: `get_feed_posts` with `p_feed_type: 'connections'` or `'my_posts'`
- **Route**: Not primary route

#### **E. DiscoveryFeedPage**
- **Path**: `src/pages/DiscoveryFeedPage.tsx`
- **What it shows**:
  - Public discovery feed
  - "Posts from the entire community"
- **Data Source**:
  - Hook: `useFeedPosts('all', user?.id)`
- **Route**: Not primary route

#### **F. DashboardFeedColumn**
- **Path**: `src/components/dashboard/DashboardFeedColumn.tsx`
- **What it shows**:
  - Embedded feed column for profile dashboards
  - Infinite scroll implementation
  - 2 tabs: "Network" (connections), "My Posts"
- **Data Source**:
  - Hook: `useInfiniteFeedPosts` (pagination support)
- **Used in**: Profile dashboard 3-column layout

#### **G. MobileFeedView**
- **Path**: `src/components/mobile/MobileFeedView.tsx`
- **What it shows**:
  - Mobile-optimized feed
  - 3 tabs: All, Connections, My Posts
  - Infinite scroll
  - Floating action button for post creation
- **Data Source**:
  - Hook: `useInfiniteFeedPosts`
- **Used in**: Mobile layout

### 2.2 Feed Card Components

#### **PostCard** (Primary Post Display)
- **Path**: `src/components/posts/PostCard.tsx`
- **Lines**: 504+ lines (very comprehensive)
- **Features**:
  - Displays post content, author info, timestamps
  - Emoji reactions system (ReactionPicker, ReactionSummary)
  - Like button (heart) + like count
  - Comment button + comment count
  - Repost/Share buttons
  - Bookmark button
  - Post analytics for own posts
  - Delete functionality
  - Privacy level badges (Public/Connections)
  - Link/embed previews
  - Repost display (SharedPostCard)
  - "Liked by" modal
- **Used in**: All feed views

#### **SharedPostCard**
- **Path**: `src/components/posts/SharedPostCard.tsx`
- **What it does**: Displays a reposted/shared post within another post
- **Shows**: Original post content within a card border

### 2.3 Feed Support Components

- **PostComments** (`src/components/posts/PostComments.tsx`): Expandable comments section
- **PostAnalytics** (`src/components/posts/PostAnalytics.tsx`): Shows view counts, engagement stats
- **SkeletonPostCard** (`src/components/social-feed/SkeletonPostCard.tsx`): Loading placeholder
- **LikedByModal** (`src/components/posts/LikedByModal.tsx`): Shows who liked a post
- **RepostDialog** (`src/components/posts/RepostDialog.tsx`): Repost with commentary
- **ShareDialog** (`src/components/posts/ShareDialog.tsx`): Share post externally
- **ReactionPicker** (`src/components/posts/ReactionPicker.tsx`): Emoji reaction selector
- **ReactionSummary** (`src/components/posts/ReactionSummary.tsx`): Shows reaction counts

### 2.4 Feed Hooks

- **useFeedPosts** (`src/hooks/useFeedPosts.ts`): Fetches posts via `get_feed_posts` RPC (basic, no pagination)
- **useInfiniteFeedPosts** (`src/hooks/useInfiniteFeedPosts.ts`): Infinite scroll feed with pagination
- **usePostReactions** (`src/hooks/usePostReactions.ts`): Manages emoji reactions
- **usePostLikes** (`src/hooks/usePostLikes.ts`): Manages like/unlike
- **usePostBookmark** (`src/hooks/usePostBookmark.ts`): Bookmark management
- **usePostRepost** (`src/hooks/usePostRepost.ts`): Repost functionality
- **usePostShares** (`src/hooks/usePostShares.ts`): Track shares

### 2.5 Widget Components (Feed Previews)

- **NetworkFeedWidget** (`src/components/dashboard/NetworkFeedWidget.tsx`): Shows last 3 connection posts
- **RecentPostsWidget** (`src/components/dashboard/RecentPostsWidget.tsx`): Shows last 5 posts
- **ProfilePosts** (`src/components/profile/ProfilePosts.tsx`): User's posts on profile page

---

## 3. Supabase Schema – Posts & Activities

### 3.1 Core Post Tables

#### **`posts`** (Main Content Table)
**Columns**:
- `id` (uuid, PK)
- `author_id` (uuid, FK → profiles) 
- `content` (text)
- `post_type` (text): 'update', 'article', 'question', 'celebration', 'text', 'image', 'video', 'link', 'poll', 'opportunity', 'spotlight'
- `privacy_level` (text): 'public', 'connections'
- `image_url` (text, nullable)
- `link_url` (text, nullable)
- `link_title` (text, nullable)
- `link_description` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `is_deleted` (boolean, default false)
- `original_post_id` (uuid, nullable) – for reposts
- `moderation_status` (text, nullable)
- `moderated_by` (uuid, nullable)
- `moderated_at` (timestamp, nullable)

**RLS Policies**:
- Users can create their own posts
- Users can view posts based on privacy_level and connections
- Users can update/delete their own posts
- Soft delete via `is_deleted = true`

**Usage**: Primary table for all user-generated posts across DNA platform

#### **`community_posts`** (Community-Specific Posts)
**Columns**:
- `id`, `community_id`, `author_id`, `content`, `post_type`, `title`, `media_url`, `event_date`, `event_location`, `is_pinned`, `created_at`, `updated_at`

**⚠️ Critical Issue**: This is a **separate table** from `posts`. Community posts are **NOT** visible in main feed.

### 3.2 Engagement Tables

#### **`post_likes`**
- `id`, `post_id` (FK → posts), `user_id` (FK → profiles), `created_at`
- Tracks simple "heart" likes

#### **`post_comments`**
- `id`, `post_id` (FK → posts), `user_id` (FK → profiles), `content`, `created_at`, `updated_at`, `parent_id` (for threaded comments)

#### **`post_reactions`** (Emoji Reactions)
- Referenced in code but not visible in types provided
- Likely: `id`, `post_id`, `user_id`, `emoji`, `created_at`

#### **`post_bookmarks`**
- `id`, `post_id`, `user_id`, `created_at`

#### **`post_shares`**
- `id`, `post_id`, `user_id`, `platform`, `created_at`

#### **`post_views`**
- Referenced in PostAnalytics
- Tracks post impressions

### 3.3 Database RPCs (Functions)

#### **`get_feed_posts`**
**Parameters**:
- `p_user_id` (uuid)
- `p_feed_type` (text): 'all', 'connections', 'my_posts'
- `p_hashtag` (text, optional)
- `p_limit` (integer, default 20)
- `p_offset` (integer, default 0)

**Returns**: Array of `PostWithAuthor` objects
- Joins `posts` with `profiles` (author data)
- Counts likes, comments
- Checks if user has liked
- Filters by privacy level and connection status
- Handles reposts/shares

**Critical**: This is the **main feed query function**. All feeds use this.

#### **`get_post_details`**
- Fetches single post with full engagement data

#### **`get_post_comments`**
- Fetches comments for a specific post with author details

#### **`get_post_likers`**
- Returns users who liked a post

### 3.4 Other Content Tables

These tables exist but are **NOT integrated into main feed**:

- **`events`**: Event data (from Convene pillar)
- **`spaces`**: Collaboration spaces
- **`contribution_needs`**: Needs/offers
- **`opportunities`**: Job/volunteer opportunities
- **`convey_items`**: Stories/articles (Convey pillar)

**⚠️ Gap**: None of these feed into the main `posts` table or `get_feed_posts` RPC. They are siloed content types.

---

## 4. Current Data Flow: Composer → Database → Feed

### 4.1 Standard Post Creation Flow

```
1. User interacts with composer
   ↓
   PostComposer / EnhancedCreatePostDialog / CreatePostDialog
   ↓
2. Content validation (length, required fields)
   ↓
3. Media upload (if applicable)
   → uploadMedia() → Supabase Storage (user-posts bucket)
   → Returns image_url
   ↓
4. Supabase INSERT
   → supabase.from('posts').insert({ author_id, content, post_type, privacy_level, image_url, ... })
   ↓
5. Success
   → Toast notification
   → Query invalidation: queryClient.invalidateQueries(['feed-posts'])
   ↓
6. Feed refetch (automatic or manual)
   → useFeedPosts / useInfiniteFeedPosts
   → supabase.rpc('get_feed_posts', { p_user_id, p_feed_type, ... })
   ↓
7. Feed updates with new post
   → PostCard renders new data
```

### 4.2 Real-Time Update Flow

```
1. Post inserted into 'posts' table
   ↓
2. Supabase real-time subscription fires
   → channel.on('postgres_changes', { event: 'INSERT', table: 'posts' }, ...)
   ↓
3. Feed component receives event
   → Calls refetch()
   ↓
4. Feed reruns get_feed_posts RPC
   ↓
5. UI updates with new post
```

### 4.3 Community Post Flow (BROKEN)

```
1. User creates post in community
   ↓
   CreatePostDialog (community version)
   ↓
2. Supabase INSERT
   → supabase.from('community_posts').insert({ community_id, author_id, content, ... })
   ↓
3. Post written to 'community_posts' table
   ↓
4. ❌ DEAD END: Main feed queries 'posts' table via get_feed_posts RPC
   → Community posts NEVER appear in main DNA feed
```

---

## 5. Current Gaps & Risks – Composer + FEED

### 5.1 Critical Issues

1. **Multiple Composer Implementations (3+)**
   - PostComposer, EnhancedCreatePostDialog, CreatePost, CreatePostDialog all write to same table but have different UIs/features
   - No single source of truth
   - Maintenance nightmare: Bug fixes must be applied to 3-4 places
   - Inconsistent user experience across different entry points

2. **Community Posts Isolated**
   - `community_posts` table is **never read** by main feed
   - Community activity is invisible to broader network
   - Users posting in communities won't see content in `/dna/feed`
   - Siloed content contradicts DNA's mission of connection

3. **Hardcoded Feed Logic**
   - All feeds use same `get_feed_posts` RPC with limited filtering
   - No support for pillar-based filtering (e.g., "Show only Contribute posts")
   - No algorithmic ranking
   - No personalization based on user interests

4. **No Content Mixing**
   - Feed only shows `posts` table content
   - Events, spaces, opportunities, needs, stories exist but don't appear in feed
   - Missed opportunity for rich, diverse content stream

5. **Repost Ambiguity**
   - PostCard supports reposts via `original_post_id`
   - But repost creation flow is unclear
   - RepostDialog exists but integration is partial

6. **Post Type Overload**
   - 11 different post_type values in schema: 'update', 'article', 'question', 'celebration', 'text', 'image', 'video', 'link', 'poll', 'opportunity', 'spotlight'
   - Some types are media-based (image/video), some are content-based (question/article)
   - Confusing taxonomy

7. **Privacy Level Limitations**
   - Only 'public' and 'connections' supported
   - No space-specific privacy
   - No group/community-level sharing

### 5.2 Data Integrity Risks

1. **RLS Policy Gaps**
   - Posts can be created but silently blocked from appearing in feeds if RLS denies read access
   - No clear error messaging to user

2. **Soft Delete Inconsistency**
   - Some composers use `is_deleted = true`, others may orphan data
   - No cascade handling for likes/comments on deleted posts

3. **Missing Validation**
   - No server-side content length validation (relies on client-side 5000 char limit)
   - No spam/profanity checking
   - No duplicate post detection

### 5.3 UX/UI Gaps

1. **No Draft System**
   - Composers don't support saving drafts
   - User loses work if they navigate away

2. **Limited Media Support**
   - Some composers have disabled media buttons
   - No video thumbnail generation
   - No image optimization

3. **No Hashtag Support**
   - `get_feed_posts` accepts `p_hashtag` param but frontend doesn't extract/display hashtags
   - Missed engagement opportunity

4. **No Trending/Discovery**
   - Feed is purely chronological
   - No "Trending" posts
   - No "For You" algorithmic feed

### 5.4 Performance Issues

1. **Inefficient Queries**
   - Feed refetches entire result set on every real-time change
   - No incremental updates
   - No caching strategy

2. **N+1 Reactions**
   - PostCard loads reactions, likes, bookmarks, shares separately
   - Could batch into single query

3. **Infinite Scroll Without Deduplication**
   - New posts inserted at top can cause duplicate renders during scroll

---

## 6. Alignment With Target DNA FEED + Composer Architecture

### 6.1 Target Architecture (From Prompt)

**Universal Composer** should support:
- Post (text, image, video, link)
- Event (from Convene)
- Need/Offer (from Contribute)
- Story/Article (from Convey)
- Space Share (from Collaborate)
- Reshare (as an action on existing posts)

**Two Feed Surfaces**:
- Universal Feed at `/dna/feed` (algorithmic / network-based)
- Personal Feed on profile pages (user's own posts/activity)

**Feed Content Sources**:
- Connections
- Spaces
- Events
- Contributions
- Stories

### 6.2 What's Already Close

✅ **PostComposer Structure**
- Already supports multiple post types (8 types)
- Has pillar selection UI
- Media upload working
- Auto-embed detection

✅ **Feed Tabs**
- Feed already has "All", "Connections", "My Posts" tabs
- Structure supports filtering

✅ **Engagement Features**
- Reactions, likes, comments, bookmarks, shares all implemented
- Real-time updates working

✅ **Post Display**
- PostCard is very comprehensive
- Handles embeds, media, reactions, analytics

### 6.3 What Needs Extension

🔧 **Composer Type Expansion**
- Add "Event", "Need", "Story", "Space" post types
- Need to integrate with existing `events`, `contribution_needs`, `convey_items`, `spaces` tables
- OR: Create unified content approach where these items are referenced/linked in posts

🔧 **Feed Query Enhancement**
- Extend `get_feed_posts` RPC to include:
  - Events (from `events` table)
  - Spaces activity (from `collaboration_spaces`)
  - Needs/Offers (from `contribution_needs`)
  - Stories (from `convey_items`)
- OR: Create new RPC `get_universal_feed` that unions all content types

🔧 **Content Unification**
- Need to decide: Should all content live in `posts` table with references? Or should feed aggregate from multiple tables?
- Current architecture suggests **aggregation approach** (multiple tables)

🔧 **Privacy/Filtering**
- Add space-specific privacy
- Add pillar-based filtering in feed UI

### 6.4 What's Missing Entirely

❌ **Algorithmic Feed**
- No ranking logic
- No personalization
- Feed is purely chronological

❌ **Event/Space/Story Composers**
- No integrated way to "post" an event from Universal Composer
- Events are created in separate `/convene` flows
- Spaces created in `/collaborate` flows
- Stories created in `/convey` flows
- **These never integrate into feed**

❌ **Cross-Content Interactions**
- Can't comment on events in feed
- Can't like a space from feed
- Can't bookmark a story from feed

❌ **Unified Content Card**
- PostCard only renders `posts` table content
- Would need `EventCard`, `SpaceCard`, `StoryCard`, or **UniversalContentCard** that adapts

❌ **Unified RPC**
- Need `get_universal_feed(user_id, filters, limit, offset)` that returns:
  ```typescript
  {
    type: 'post' | 'event' | 'space' | 'need' | 'story',
    id: string,
    data: { ... }, // Type-specific data
    engagement: { likes, comments, shares },
    created_at: timestamp
  }
  ```

❌ **Reshare Composer Flow**
- RepostDialog exists but not fully integrated
- Need clear "Reshare with commentary" flow

❌ **Draft System**
- No auto-save
- No draft retrieval

---

## 7. Suggested Next Steps (High-Level Only)

### Phase 1: Consolidate Composers
1. **Deprecate** CreatePost.tsx, CreatePostDialog.tsx (basic)
2. **Enhance** PostComposer as **UniversalComposer**
   - Add Event, Need, Story, Space creation modes
   - Integrate with respective tables
3. Keep EnhancedCreatePostDialog for modal contexts
4. Standardize on single composer API

### Phase 2: Unify Content Model
**Option A**: Extend `posts` table with polymorphic approach
   - Add `linked_entity_type` and `linked_entity_id` columns
   - Keep detailed data in respective tables (events, spaces, etc.)
   - Feed shows posts that link to other entities

**Option B**: Create new `feed_items` table
   - Aggregation table with references to all content types
   - Feed queries this single table
   - More complex but cleaner separation

**Recommendation**: **Option A** (extend posts table) is simpler and leverages existing infrastructure.

### Phase 3: Enhance Feed RPC
1. Extend `get_feed_posts` to include linked entities:
   - Join with `events` if `linked_entity_type = 'event'`
   - Join with `spaces` if `linked_entity_type = 'space'`
   - etc.
2. Return unified JSON structure with type-discriminated data

### Phase 4: Update Feed UI
1. Create `UniversalContentCard` that renders different content types
2. Add pillar filter buttons to feed
3. Implement hashtag clickability
4. Add trending/discovery section

### Phase 5: Implement Reshare
1. Clarify repost vs share semantics
2. Integrate RepostDialog fully
3. Add "Reshare" button to all content types

### Phase 6: Optimize & Scale
1. Implement incremental real-time updates
2. Add query caching
3. Implement algorithmic ranking (engagement-based, recency-weighted)
4. Add lazy loading for comments/likes

---

## 8. Files Requiring Attention (Alphabetical)

### Composer Files
- `src/components/community/CreatePostDialog.tsx` – Isolates community posts
- `src/components/feed/CreatePost.tsx` – Redundant, should deprecate
- `src/components/mobile/MobilePostButton.tsx` – Needs UniversalComposer integration
- `src/components/posts/CreatePostDialog.tsx` – Redundant, should deprecate
- `src/components/posts/EnhancedCreatePostDialog.tsx` – Keep as modal variant
- `src/components/social-feed/FloatingPostComposer.tsx` – Wrapper for sticky composer
- `src/components/social-feed/PostComposer.tsx` – **PRIMARY COMPOSER** to enhance

### Feed Files
- `src/components/dashboard/DashboardFeedColumn.tsx` – Profile feed column
- `src/components/mobile/MobileFeedView.tsx` – Mobile feed
- `src/components/posts/PostCard.tsx` – **PRIMARY CONTENT CARD** to enhance
- `src/pages/ActivityFeed.tsx` – Legacy feed (consider deprecating)
- `src/pages/DiscoveryFeedPage.tsx` – Public feed
- `src/pages/FeedPage.tsx` – Generic feed (consider deprecating)
- `src/pages/NetworkFeedPage.tsx` – Network feed (consider deprecating)
- `src/pages/dna/Feed.tsx` – **PRIMARY FEED** for DNA dashboard

### Data/Service Files
- `src/hooks/useFeedPosts.ts` – Basic feed hook
- `src/hooks/useInfiniteFeedPosts.ts` – Infinite scroll feed hook (preferred)
- `src/services/postsService.ts` – Post CRUD operations
- `src/types/posts.ts` – Type definitions

### Database Schema
- `supabase/migrations/` – Need to inspect for `posts` table schema
- RPC functions in database: `get_feed_posts`, `get_post_details`, `get_post_comments`, `get_post_likers`

---

## Conclusion

DNA has a **robust but fragmented** feed and composer system. The core building blocks exist:
- Multiple composer UIs (consolidation needed)
- Comprehensive engagement features (reactions, likes, comments, shares, bookmarks)
- Real-time updates
- Basic feed filtering (all/connections/my_posts)

**Critical blockers** before implementing Universal Composer:
1. Unify content model (decide on single-table vs multi-table aggregation)
2. Consolidate composer implementations into single UniversalComposer
3. Extend feed RPC to support cross-content types (events, spaces, needs, stories)
4. Create UniversalContentCard to render any content type

**Risk if not addressed**: New Universal Composer could add a 5th parallel implementation, creating more technical debt. Must deprecate old composers as part of implementation.

**Next Step**: Design unified content model and get stakeholder approval before writing any code.

---

**End of Audit**
