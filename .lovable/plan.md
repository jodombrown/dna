

# Engineering Spec: DNA Header + Pulse Bar System

## Overview

The DNA platform uses a two-tier fixed navigation system visible in the screenshot: a **UnifiedHeader** (top bar) and a **PulseBar** (second bar below). Together they occupy ~120px of vertical space on desktop and are both `position: fixed`.

---

## 1. UnifiedHeader (Top Bar)

**Position**: `fixed top-0 left-0 right-0 z-50`, height `h-16` (64px), `bg-background border-b shadow-sm`

**Layout**: `max-w-7xl mx-auto`, flexbox `justify-between items-center`

### Left Section
- **Logo**: DNA logo image (`h-[60px] md:h-[80px]`), links to `/` via `NavLink`

### Right Section (Authenticated) — left to right:
1. **Feed button** — ghost icon button (`Home` icon), active state uses `text-primary`
2. **Messages button** — ghost icon button (`MessageCircle` icon) with red unread badge (`-top-1 -right-1`, shows `9+` if >9). Uses `useUnreadMessageCount()` hook
3. **+ Create button** — solid primary button (`bg-primary`), opens `UniversalComposer` with mode `'post'`. Hidden on mobile (`hidden md:flex`)
4. **Admin button** — conditional, only shown when `supabase.rpc('has_role', { _user_id, _role: 'admin' })` returns true. Ghost button with `Shield` icon
5. **Feedback button** — ghost `MessageSquarePlus` icon, navigates to `/dna/feedback`
6. **Notification Bell** — `<UnifiedNotificationBell />` component (self-contained, manages its own unread count)
7. **Avatar dropdown** — `DropdownMenu` with user avatar, "Profile" opens account drawer, "Sign Out" calls `signOut()`

### Right Section (Unauthenticated):
- Desktop nav links: "About Us" dropdown + Five C's links (Connect, Convene, Collaborate, Contribute, Convey)
- "Sign In" outline button + "Join Now" solid button (`bg-dna-copper`)
- Mobile: hamburger `Sheet` (slide-from-left) with same nav items

### Conditional Hiding
- On mobile + Connect routes (`/dna/connect`): returns `null` (Connect has its own `ConnectMobileHeader`)
- When `useHeaderVisibility().isHeaderHidden` is true (e.g., during mobile chat): returns `null`
- During auth loading: shows skeleton header with logo + hamburger only

---

## 2. PulseBar (Second Bar — Desktop Only)

**Position**: `fixed top-14 sm:top-16 z-40 left-0`, full width
**Visibility**: Desktop only + authenticated only (`if (isMobile || !user) return null`)
**Styling**: `backdrop-blur-md`, gradient background (`from-background/90 via-background/95 to-background/90`), `border-b border-border/40`, `shadow-sm`, `py-1.5`

### Animation
- Entry: `framer-motion` slide down (`y: -10 → 0, opacity: 0 → 1`, 0.4s ease-out)
- Each item staggers by 60ms (`delay: index * 0.06`)

### Layout
- `max-w-7xl mx-auto`, flexbox with `gap-1.5 sm:gap-2`
- 5 items, each `flex-1 min-w-0`

### PulseItem (each of the 5 C's)

Each item is a `Link` to its module route with these elements:

```text
┌──────────────────────────┐
│  ● 👥 CONNECT      [3]  │  ← status dot + icon + label + count badge
│     3 pending            │  ← micro-text (11px, 70% opacity)
└──────────────────────────┘
```

**Status System** — 4 states drive all styling:
| Status | Indicator | Background | Glow |
|--------|-----------|------------|------|
| `active` | solid green dot + pulse animation (2.5s) | `bg-primary/8` | `shadow primary/30` |
| `attention` | amber dot + slow pulse (3s) | `bg-amber-500/8` | `shadow amber/30` |
| `dormant` | grey dot, no animation | `bg-muted/40` | none |
| `urgent` | red dot + fast pulse (1.2s) | `bg-destructive/8` | `shadow destructive/40` |

**Hover behavior**: `whileHover: { y: -2, scale: 1.02 }`, `whileTap: { scale: 0.96 }` (spring stiffness 400, damping 25)

**Hover Preview Card** (`PulsePreviewCard`): Appears after mouse enter, hides with 150ms delay. Shows top 3 items with avatar, title, subtitle. Positioned `absolute top-full`, 264px wide, white card with shadow-xl.

### Five C's Configuration

```typescript
const PULSE_CONFIG = {
  connect:     { label: 'CONNECT',     icon: 'Users',     href: '/dna/connect',      color: 'emerald' },
  convene:     { label: 'CONVENE',     icon: 'Calendar',  href: '/dna/convene',      color: 'emerald' },
  collaborate: { label: 'COLLABORATE', icon: 'Layers',    href: '/dna/collaborate',  color: 'emerald' },
  contribute:  { label: 'CONTRIBUTE',  icon: 'Gift',      href: '/dna/contribute',   color: 'emerald' },
  convey:      { label: 'CONVEY',      icon: 'Megaphone', href: '/dna/convey',       color: 'emerald' },
};
```

---

## 3. Data Layer (`usePulseBar` hook)

Uses React Query (`staleTime: 2min`, `refetchInterval: 5min`) + Supabase realtime subscriptions.

**Fetches 5 queries in parallel** per authenticated user:
- **Connect**: pending connection requests + recommendation count → status/micro_text
- **Convene**: upcoming event attendances → next event relative time
- **Collaborate**: active space memberships, flags stalled spaces (>14 days no update) as `attention`
- **Contribute**: pending contribution offers + open listings
- **Convey**: post engagement (likes + comments) in last 24h, trending detection (>20 engagements)

**Realtime channels** (per user, unique instance IDs):
- `connections` table (recipient_id filter)
- `event_attendees` table (user_id filter)
- `space_members` table (user_id filter)
- `contribution_offers` table
- `posts` table (author_id filter)

Each channel invalidates the `pulse-bar` query key on any change.

---

## 4. BaseLayout Integration

```text
┌─────────────────────────────────┐  fixed z-50, h-16
│         UnifiedHeader           │
├─────────────────────────────────┤  fixed z-40, top-16
│          PulseBar               │  (desktop + auth only)
├─────────────────────────────────┤
│                                 │  pt-14 sm:pt-16 lg:pt-[7.5rem]
│         Page Content            │  (extra top padding on desktop
│                                 │   to clear both fixed bars)
├─────────────────────────────────┤
│  PulseDock (mobile bottom nav)  │  pb-20 on mobile
└─────────────────────────────────┘
```

The content area also applies route-based gradient backgrounds (e.g., mint for Feed, terra/ochre for Connect, sunset/purple for Convene).

---

## 5. Key Dependencies
- `framer-motion` — PulseBar/PulseItem animations
- `lucide-react` — all icons
- `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip` — header controls
- `@tanstack/react-query` — pulse data caching
- `@supabase/supabase-js` — data fetching + realtime
- `zustand` — header visibility state (`useHeaderVisibility`)

## 6. Files to Recreate
| File | Purpose |
|------|---------|
| `src/components/UnifiedHeader.tsx` | Main header (578 lines) |
| `src/components/pulse/PulseBar.tsx` | Pulse bar container |
| `src/components/pulse/PulseItem.tsx` | Individual pulse item |
| `src/components/pulse/PulsePreviewCard.tsx` | Hover preview card |
| `src/types/pulse.ts` | All pulse types + config |
| `src/hooks/usePulseBar.ts` | Data fetching + realtime |
| `src/hooks/useHeaderVisibility.ts` | Zustand store for header show/hide |
| `src/hooks/useUnreadCounts.ts` | Message/notification counts |
| `src/hooks/usePulseNavigation.ts` | Unified nav data for mobile dock |
| `src/layouts/BaseLayout.tsx` | Layout wrapper composing both |
| `src/components/header/navigationConfig.ts` | Nav item definitions |

