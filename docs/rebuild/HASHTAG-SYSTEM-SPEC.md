# Engineering Spec: DNA Hashtag System

## Overview

The DNA hashtag system has **4 layers**: text parsing/rendering, hashtag ownership (personal hashtags), a public hashtag feed page, and trending/discovery. It uses Supabase RPCs for all backend operations.

---

## 1. Text Parsing & Rendering

### Regex
```typescript
const HASHTAG_REGEX = /#[\w\u0080-\uFFFF]+/g;
```
Matches `#` followed by word characters + unicode (supports non-Latin scripts).

### `extractHashtags(text: string): string[]`
- Matches all hashtags in text via regex
- Strips `#` prefix, lowercases, deduplicates
- Returns array of clean tag names

### `parseContentWithHashtags(content: string): Array<{ type: 'text' | 'hashtag'; value: string }>`
- Splits content into alternating text/hashtag segments for rendering
- Preserves original casing in `value` (e.g., `#DiasporaRising`)

### `HashtagText` Component (`src/components/feed/HashtagText.tsx`)
- Renders parsed content with clickable hashtag buttons
- Each hashtag is a `<button>` with `text-primary hover:underline font-medium`
- Calls `onHashtagClick(tagName)` on click (strips `#`)
- Used in feed posts and story detail pages

### `DiaHashtagChip` Component (`src/components/dia/DiaHashtagChip.tsx`)
- Standalone chip button for hashtag display outside text
- Three sizes: `sm` (px-2 py-1 text-xs), `md` (px-3 py-1.5 text-sm), `lg` (px-4 py-2 text-base)
- Layout: vertical stack with `#{name}` on top, `{count} posts` below
- Hover: `bg-emerald-50 border-emerald-300` (dark: `bg-emerald-950/30 border-emerald-800`)
- Trending variant: orange borders/background + `Flame` icon with `animate-pulse`
- Default click navigates to `/dna/hashtag/{name}`

### `DiaHashtagInline` Component
- Simple `Badge variant="secondary"` for inline use
- Hover: `bg-emerald-600 text-white`

---

## 2. Data Types

### Core Types (`src/services/hashtagService.ts`)

```typescript
interface Hashtag {
  id: string;
  name: string;
  display_name: string;
  type: 'community' | 'personal';
  owner_id: string | null;
  description: string | null;
  status: 'active' | 'archived' | 'suspended' | 'reserved';
  is_verified: boolean;
  usage_count: number;
  follower_count: number;
  created_at: string;
}

interface HashtagDetails extends Hashtag {
  owner_name: string | null;
  owner_username: string | null;
  owner_avatar: string | null;
  is_following: boolean;  // for current user
}

interface TrendingHashtag {
  id: string;
  name: string;
  display_name: string;
  type: 'community' | 'personal';
  usage_count: number;
  follower_count: number;
  recent_uses: number;
  trending_score: number;
}

interface HashtagPost {
  post_id: string;
  content: string;
  media_urls: string[] | null;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  author_headline: string | null;
  like_count: number;
  comment_count: number;
  reshare_count: number;
  created_at: string;
}

interface ReservedHashtagInfo {
  is_reserved: boolean;
  category: string | null;
  reason: string | null;
  can_be_used: boolean;
}
```

### Ownership Types (`src/services/hashtagOwnershipService.ts`)

```typescript
interface UserHashtagLimits {
  max_hashtags: number;      // default 5
  active_count: number;
  archived_count: number;
  available_slots: number;
}

interface OwnedHashtag {
  id: string;
  tag: string;
  description: string | null;
  status: string;
  usage_count: number;
  follower_count: number;
  pending_requests: number;
  created_at: string;
  archived_at: string | null;
}

interface HashtagRequest {
  request_id: string;
  hashtag_id: string;
  hashtag_tag: string;
  post_id: string;
  post_content: string;
  requester_id: string;
  requester_name: string;
  requester_avatar: string | null;
  created_at: string;
}
```

---

## 3. Supabase RPCs (Backend)

All backend logic lives in Supabase RPC functions. These must be created as database functions:

| RPC Name | Parameters | Returns | Purpose |
|----------|-----------|---------|---------|
| `get_trending_hashtags` | `p_limit`, `p_days` | `TrendingHashtag[]` | Trending by usage in last N days |
| `get_hashtag_details` | `p_hashtag_name`, `p_user_id` | `HashtagDetails` | Full details + follow status |
| `get_hashtag_posts` | `p_hashtag_name`, `p_limit`, `p_offset`, `p_sort` | `HashtagPost[]` | Posts using hashtag (recent/top) |
| `search_hashtags` | `p_query`, `p_limit` | `Hashtag[]` | Autocomplete search |
| `toggle_hashtag_follow` | `p_hashtag_id`, `p_user_id` | `boolean` | Follow/unfollow, returns new state |
| `is_hashtag_reserved` | `p_name` | `ReservedHashtagInfo` | Check if tag is reserved |
| `get_user_hashtag_limits` | `p_user_id` | `UserHashtagLimits` | Current user's ownership limits |
| `create_personal_hashtag` | `p_user_id`, `p_tag`, `p_description` | `{success, hashtag_id, error_message}` | Create owned hashtag |
| `archive_personal_hashtag` | `p_user_id`, `p_hashtag_id` | `{success, error_message}` | Archive owned hashtag |
| `reactivate_personal_hashtag` | `p_user_id`, `p_hashtag_id` | `{success, error_message}` | Reactivate archived |
| `get_user_owned_hashtags` | `p_user_id` | `OwnedHashtag[]` | All user's owned hashtags |
| `get_pending_hashtag_requests` | `p_owner_id` | `HashtagRequest[]` | Pending usage requests |
| `review_hashtag_request` | `p_owner_id`, `p_request_id`, `p_approved`, `p_note` | `{success, error_message}` | Approve/deny request |

### Database Tables Required

```sql
-- Core hashtags table
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,          -- lowercase, no #
  display_name TEXT NOT NULL,         -- original casing
  type TEXT NOT NULL DEFAULT 'community',  -- 'community' | 'personal'
  owner_id UUID REFERENCES auth.users(id),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',   -- active|archived|suspended|reserved
  is_verified BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Hashtag followers
CREATE TABLE hashtag_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hashtag_id, user_id)
);

-- Post-hashtag junction (populated when posts are created)
CREATE TABLE post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  hashtag_id UUID REFERENCES hashtags(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Usage requests for personal hashtags
CREATE TABLE hashtag_usage_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag_id UUID REFERENCES hashtags(id),
  post_id UUID NOT NULL,
  requester_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',  -- pending|approved|denied
  owner_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Reserved hashtags (admin-controlled)
CREATE TABLE reserved_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  reason TEXT,
  can_be_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Service Layer (`src/services/hashtagService.ts`)

```typescript
const hashtagService = {
  getTrending(limit, days)          → calls RPC get_trending_hashtags
  getDetails(hashtagName, userId)   → calls RPC get_hashtag_details
  getPosts(hashtagName, limit, offset, sort) → calls RPC get_hashtag_posts
  search(query, limit)              → calls RPC search_hashtags
  toggleFollow(hashtagId, userId)   → calls RPC toggle_hashtag_follow
  checkReserved(name)               → calls RPC is_hashtag_reserved
  getUserFollowedHashtags(userId)   → direct query: hashtag_followers JOIN hashtags
  extractHashtags(content)          → client-side regex extraction
}
```

## 5. Ownership Service (`src/services/hashtagOwnershipService.ts`)

```typescript
const hashtagOwnershipService = {
  getUserLimits(userId)                        → RPC get_user_hashtag_limits
  createPersonalHashtag(userId, tag, desc)     → RPC create_personal_hashtag
  archiveHashtag(userId, hashtagId)            → RPC archive_personal_hashtag
  reactivateHashtag(userId, hashtagId)         → RPC reactivate_personal_hashtag
  getOwnedHashtags(userId)                     → RPC get_user_owned_hashtags
  getPendingRequests(ownerId)                  → RPC get_pending_hashtag_requests
  reviewRequest(ownerId, requestId, approved, note) → RPC review_hashtag_request
}
```

---

## 6. React Hooks

### `useHashtag(hashtagName)` — Single hashtag page data
```typescript
Returns {
  hashtag: HashtagDetails,        // queryKey: ['hashtag', name], staleTime: 60s
  posts: HashtagPost[],           // queryKey: ['hashtagPosts', name], staleTime: 30s
  isLoading, error,
  isFollowing: boolean,
  toggleFollow(),                 // mutation → invalidates ['hashtag', name]
  isTogglingFollow
}
```

### `useTrendingHashtags(limit)` — Trending sidebar
```typescript
Returns useQuery result with:
  queryKey: ['trending-hashtags', limit]
  refetchInterval: 5 min
  staleTime: 2 min
  Calls RPC get_trending_hashtags(p_limit, p_days: 7)
```

### `useHashtagOwnership()` — Settings management
```typescript
Returns {
  // Data (3 parallel queries)
  limits: UserHashtagLimits,          // staleTime: 60s
  ownedHashtags: OwnedHashtag[],     // staleTime: 30s
  pendingRequests: HashtagRequest[],  // staleTime: 30s
  
  // Computed
  availableSlots, canCreateMore,
  activeHashtags, archivedHashtags,
  pendingCount,
  
  // Mutations (all invalidate ownedHashtags + hashtagLimits)
  createHashtag(tag, description),
  archiveHashtag(hashtagId),
  reactivateHashtag(hashtagId),
  approveRequest(requestId),
  denyRequest(requestId, note),
  
  // States
  isCreating, isArchiving, isReactivating, isReviewing
}
```

---

## 7. Pages & UI

### Hashtag Feed Page (`/dna/hashtag/:hashtag`)

**Layout**: Container `max-w-6xl`, 3-column grid (2:1 on desktop)

**Header Card** (left-bordered with `border-l-4 border-l-dna-copper`):
- Circle icon: `h-10 w-10 bg-dna-copper/10` with `Hash` icon in `text-dna-copper`
- Title: `#{displayName}` + optional Verified badge + Owner badge (copper)
- Type badge: "Personal" (default variant) or "Community" (secondary)
- Owner info strip (if personal & not owner): avatar + name link in `bg-muted/50` strip
- Description text
- **StatsGrid**: 3-column grid showing Posts / Followers / Created date
  - Counts formatted: 1K+ / 1M+ shorthand
  - Dates: "Today", "Yesterday", "N days ago", "MMM d", "MMM yyyy"
- Action buttons: Follow/Following toggle (copper), Share dropdown (copy link, native share), Manage (if owner → `/dna/settings/hashtags`)

**Main Column**:
- Sort tabs: Recent / Top
- Feed items rendered via `UniversalFeedItemComponent` (maps `HashtagPost` → `UniversalFeedItem`)

**Sidebar** (desktop):
- Trending Hashtags card with ranked list (1-10)
- Each item links to `/dna/hashtag/{name}`
- Current hashtag highlighted with "Current" copper badge

### My Hashtags Settings Page (`/dna/settings/hashtags`)

**Entry**: Settings sidebar with `#` icon + "My Hashtags" + "New" badge

**Header Card**:
- Stats row: Active / Archived / Available counts (bold `text-2xl`)
- "+ Create Hashtag" button (disabled when no slots)

**Create Dialog**:
- Tag input with `#` prefix, alphanumeric + underscore only
- Optional description textarea
- Validation: strips non-word characters in real-time

**Three Tabs**:
1. **Active (N)**: Cards with `#{tag}`, description, usage/follower counts, pending count (orange), Archive button
2. **Archived (N)**: Same cards at `opacity-75` with "Archived" badge + Reactivate button (disabled if no slots)
3. **Requests**: Pending request cards with requester avatar, name, hashtag, post preview (2-line clamp), Approve/Deny buttons

### Trending Hashtags Widget (`src/components/feed/TrendingHashtags.tsx`)

- Card component for feed sidebars
- Ranked list with numbered circles (`bg-dna-copper/10 text-dna-copper`)
- Each item: `Hash` icon + name + "N posts today · N followers"
- Hover: `bg-muted` transition
- Loading: skeleton with circle + text placeholders
- Returns `null` if no data

---

## 8. Route Configuration

```typescript
// Required route
{ path: '/dna/hashtag/:hashtag', element: <HashtagFeed /> }

// Settings route
{ path: '/dna/settings/hashtags', element: <MyHashtagsSettings /> }
```

---

## 9. Post Integration

When creating posts:
1. Extract hashtags from content using `extractHashtags()`
2. Store tags in post's `tags` column (text array)
3. Upsert each tag into `hashtags` table (auto-create community hashtags)
4. Insert `post_hashtags` junction records
5. Increment `usage_count` on hashtag

This can be done via a database trigger on `posts` insert/update or in the post creation RPC.

---

## 10. Files to Recreate

| File | Purpose |
|------|---------|
| `src/utils/hashtagUtils.ts` | Regex, extraction, parsing |
| `src/services/hashtagService.ts` | CRUD + trending + follow service |
| `src/services/hashtagOwnershipService.ts` | Personal hashtag management |
| `src/hooks/useHashtag.ts` | Single hashtag page hook |
| `src/hooks/useTrendingHashtags.ts` | Trending data hook |
| `src/hooks/useHashtagOwnership.ts` | Ownership management hook |
| `src/components/feed/HashtagText.tsx` | Inline clickable hashtag renderer |
| `src/components/feed/TrendingHashtags.tsx` | Sidebar trending widget |
| `src/components/hashtag/HashtagStatsGrid.tsx` | Stats display (posts/followers/date) |
| `src/components/dia/DiaHashtagChip.tsx` | Standalone chip + inline variant |
| `src/pages/dna/HashtagFeed.tsx` | Hashtag feed page |
| `src/pages/dna/settings/MyHashtagsSettings.tsx` | Settings management page |

## 11. Dependencies

- `@tanstack/react-query` — all data fetching
- `@supabase/supabase-js` — RPC calls + direct queries
- `lucide-react` — icons (Hash, TrendingUp, Crown, Archive, Settings, etc.)
- `date-fns` — date formatting in StatsGrid
- `sonner` — toast notifications
