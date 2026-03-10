# HEADER + PULSE BAR MIGRATION PROMPT

<!-- PROMPT START -->

## Task

Recreate the DNA Header + Pulse Bar navigation system. This is a two-tier fixed navigation: a **UnifiedHeader** (top bar, 64px) and a **PulseBar** (second bar below, desktop-only). Together they occupy ~120px on desktop.

Use `cross_project` tools to read source files from project ID `866bbb52-dc1d-4eb7-807c-62f17d69e56e`. Read each file listed below and recreate it with the same logic.

---

## Architecture Overview

```
┌─────────────────────────────────┐  fixed z-50, h-16 (64px)
│         UnifiedHeader           │
├─────────────────────────────────┤  fixed z-40, top-16
│          PulseBar               │  (desktop + auth only, ~56px)
├─────────────────────────────────┤
│         Page Content            │  pt-14 sm:pt-16 lg:pt-[7.5rem]
├─────────────────────────────────┤
│  PulseDock (mobile bottom nav)  │  pb-20 on mobile
└─────────────────────────────────┘
```

---

## Required Dependencies

Ensure these are installed: `framer-motion`, `lucide-react`, `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-dialog`, `@radix-ui/react-scroll-area`

---

## Files to Read & Recreate

Read these from project `866bbb52-dc1d-4eb7-807c-62f17d69e56e`:

### 1. Types & Config
- `src/types/pulse.ts` — All pulse types (PulseStatus, PulseSection, ConnectPulse, ConvenePulse, CollaboratePulse, ContributePulse, ConveyPulse, UserPulseData, PulseKey, PulseConfig, PULSE_CONFIG, PulseDockNavItem, MoreButtonState)
- `src/components/header/navigationConfig.ts` — Nav item arrays (publicNavItems, aboutUsDropdown, mainNavItems, pillarNavigation)

### 2. State Management
- `src/hooks/useHeaderVisibility.ts` — Zustand store with `isHeaderHidden`, `hideHeader()`, `showHeader()`. Used to hide header during mobile chat.

### 3. Data Hooks
- `src/hooks/usePulseBar.ts` (561 lines) — **THE CORE DATA HOOK**. Contains:
  - `fetchConnectPulse(userId)` — queries `connections` (pending where recipient_id=user) + `adin_recommendations` (connection type, last 7 days). Returns pending count, suggestion count, top 3 items with profile data.
  - `fetchConvenePulse(userId)` — queries `event_attendees` joined with `events` (going/maybe, future start_time). Returns upcoming count, next event with relative time formatting.
  - `fetchCollaboratePulse(userId)` — queries `space_members` joined with `spaces` (active status). Detects stalled spaces (>14 days since update) as `attention` status.
  - `fetchContributePulse(userId)` — queries `contribution_offers` joined with `contribution_needs` (pending offers on user's needs) + `contribution_needs` (open listings by user).
  - `fetchConveyPulse(userId)` — queries `posts` (last 7 days, non-deleted, type in post/story/reshare/update/impact) then `post_likes` and `post_comments` per post. Calculates 24h engagement, trending detection (>20 engagements).
  - Main hook: React Query with `staleTime: 2min`, `refetchInterval: 5min`, fetches all 5 in `Promise.all`.
  - Realtime: 5 Supabase channels with unique instance IDs (`pulse-connect-${userId}-${instanceId}`) on tables: `connections`, `event_attendees`, `space_members`, `contribution_offers`, `post_likes`+`post_comments`. Each invalidates `pulse-bar` query key.

- `src/hooks/useUnreadCounts.ts` — Singleton channel pattern for message/notification counts. Uses RPCs `get_unread_message_count` and `get_unread_notification_count` with fallback queries. Realtime on `messages` and `notifications` tables.

- `src/hooks/useUnreadMessageCount.ts` — Simpler hook using `messageService.getTotalUnreadCount()`, 30s refetch.

- `src/hooks/usePulseNavigation.ts` — Combines `usePulseBar` + `useUnreadCounts` into unified navigation data. Computes MORE button aggregate state from contribute, convey, messages, notifications.

### 4. Pulse Bar Components
- `src/components/pulse/PulseBar.tsx` — Container. Returns null on mobile or unauthenticated. Fixed `top-14 sm:top-16 z-40`. Backdrop blur, gradient bg. Renders 5 `PulseItem` components with staggered framer-motion entry (60ms delay per item).

- `src/components/pulse/PulseItem.tsx` (207 lines) — Individual item. Key details:
  - **Status color system** (STATUS_COLORS record):
    - `active`: `bg-primary/8`, `shadow primary/30`, green indicator with 2.5s pulse
    - `attention`: `bg-amber-500/8`, amber indicator with 3s pulse
    - `dormant`: `bg-muted/40`, grey indicator, no animation
    - `urgent`: `bg-destructive/8`, red indicator with 1.2s pulse
  - Hover: `whileHover: { y: -2, scale: 1.02 }`, `whileTap: { scale: 0.96 }`, spring stiffness 400, damping 25
  - Layout: status dot (2x2 with animated ring) + icon (4x4) + label (xs semibold, hidden on sm-) + count badge
  - Micro-text below (11px, 70% opacity)
  - Shows `PulsePreviewCard` on hover with 150ms hide delay

- `src/components/pulse/PulsePreviewCard.tsx` (88 lines) — Hover card. Absolute positioned `top-full`, centered, 264px wide. White card with shadow-xl. Shows header label, up to 3 items (avatar + title + subtitle), "View All" footer link with chevron.

### 5. Header Component
- `src/components/UnifiedHeader.tsx` (578 lines) — Main header. Key details:
  - **Position**: `fixed top-0 left-0 right-0 z-50`, `bg-background border-b shadow-sm`, `h-16`
  - **Logo**: DNA logo image, `h-[60px] md:h-[80px]`, links to `/`
  - **Auth check**: Uses `useAuth()` for user/profile/signOut/loading
  - **Admin check**: `useQuery` calling `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })`
  - **Conditional hiding**: Returns null on mobile + Connect routes (`/dna/connect`) or when `isHeaderHidden`
  - **Loading state**: Skeleton with logo + hamburger only
  - **Authenticated right section** (left to right):
    1. Feed button (Home icon, ghost, active=text-primary)
    2. Messages button (MessageCircle icon, ghost, red badge showing unread count, 9+ cap)
    3. "+ Create" button (primary, `hidden md:flex`, opens UniversalComposer with mode 'post')
    4. Admin button (Shield icon, conditional on `isAdmin`, navigates to `/app/admin`)
    5. Feedback button (MessageSquarePlus, `hidden md:flex`, navigates to `/dna/feedback`)
    6. `<UnifiedNotificationBell />` (self-contained component)
    7. Avatar dropdown (DropdownMenu: Profile → opens AccountDrawer, Sign Out)
  - **Unauthenticated right section**:
    - Desktop: "About Us" dropdown + Five C's NavLinks + "Sign In" outline button + "Join Now" solid button (`bg-dna-copper`)
    - Mobile: Sheet (side=left, w-[85vw]) with About section, 5 C's section, Sign In/Join Now buttons
  - Renders `<BetaSignupDialog>` and `<UniversalComposer>` at bottom

### 6. Layout Integration
- `src/layouts/BaseLayout.tsx` — Composes `<UnifiedHeader />`, `<PulseBar />`, and `<PulseDock />`. Content area has:
  - `pt-14 sm:pt-16 lg:pt-[7.5rem]` (extra for PulseBar on desktop)
  - `pb-20 lg:pb-0` (for PulseDock on mobile)
  - Route-based gradient backgrounds (mint for feed, terra/ochre for connect, sunset/purple for convene, etc.)

---

## Database Tables Referenced

The pulse system queries these tables (ensure they exist or adapt):
- `connections` (requester_id, recipient_id, status)
- `profiles` (id, full_name, display_name, headline, avatar_url)
- `adin_recommendations` (user_id, rec_type, created_at)
- `event_attendees` (user_id, status, events join)
- `events` (id, slug, title, start_time, cover_image_url)
- `space_members` (user_id, space_id, spaces join)
- `spaces` (id, name, status, updated_at)
- `contribution_needs` (id, title, created_by, status)
- `contribution_offers` (id, status, created_at, need_id)
- `posts` (id, content, author_id, created_at, post_type, is_deleted)
- `post_likes` (post_id)
- `post_comments` (post_id)
- `messages` (id, read, sender_id)
- `notifications` (user_id)

RPCs used: `has_role(_user_id, _role)`, `get_unread_message_count(p_user_id)`, `get_unread_notification_count(p_user_id)`

---

## Design Tokens Used

Ensure these CSS variables/Tailwind tokens exist:
- `--primary`, `--primary-foreground` (DNA Emerald)
- `--destructive`, `--destructive-foreground` (red for badges/urgent)
- `--muted`, `--muted-foreground` (dormant states)
- `--background`, `--foreground`, `--border`
- `dna-copper`, `dna-gold`, `dna-forest`, `dna-mint`, `dna-emerald` (brand colors in tailwind config)
- `dna-terra`, `dna-ochre`, `dna-sunset`, `dna-purple` (gradient backgrounds)

---

## Implementation Order

1. Install dependencies
2. Create `src/types/pulse.ts` and `src/components/header/navigationConfig.ts`
3. Create `src/hooks/useHeaderVisibility.ts`
4. Create `src/hooks/usePulseBar.ts` (adapt table names to your schema)
5. Create `src/hooks/useUnreadCounts.ts` and `src/hooks/useUnreadMessageCount.ts`
6. Create `src/hooks/usePulseNavigation.ts`
7. Create `src/components/pulse/PulsePreviewCard.tsx`
8. Create `src/components/pulse/PulseItem.tsx`
9. Create `src/components/pulse/PulseBar.tsx` + `src/components/pulse/index.ts` barrel
10. Create `src/components/UnifiedHeader.tsx` (adapt to your auth/composer/notification components)
11. Integrate both into your layout with correct padding

<!-- PROMPT END -->
