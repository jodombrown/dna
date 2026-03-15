

# CONNECT Member Card Redesign — Prompt 1

## Objective
Redesign the `EnhancedMemberCard` to follow the "Alive Before Accomplished" hierarchy: Presence → Credibility → Value → Belonging. The current card leads with sector badges and match scores, burying presence and activity signals. The redesign inverts this.

## What Changes

### New Component: `src/components/connect/hub/ConnectMemberCard.tsx`
A new, clean member card component replacing the current `EnhancedMemberCard` layout. The existing component is 620 lines of accumulated complexity — the new card will be focused and lean (~250 lines), reusing the same hooks and infrastructure.

### Card Structure (top to bottom)

```text
┌─────────────────────────────────────┐
│  🇳🇬                          (flag) │  ← top-right country flag
│                                     │
│  ┌──────┐  Name Surname             │  ← 56px avatar with presence dot
│  │Avatar│  Headline text here...    │     bottom-right of avatar
│  │  ●   │  ┌──────────┐            │  ← green pulse dot = active
│  └──────┘  │ Fintech  │            │  ← sector chip, Forest outline
│            └──────────┘            │
│                                     │
│  "Building bridges between African  │  ← value line: bio first sentence
│   tech ecosystems and global..."    │     italic, 60 char max
│                                     │
│  👤👤👤 3 mutual connections        │  ← social proof: avatar stack
│                                     │     OR "247 connections" fallback
│                                     │
│  📍 Lagos, Nigeria    [Connect]     │  ← action row
│                       [Message]     │     (state-dependent button)
│                       [Pending]     │
└─────────────────────────────────────┘
```

### Layer 1 — Presence (top priority)
- Avatar: `h-14 w-14` (56px), `ring-2 ring-dna-emerald/20` on hover
- Presence dot: absolute `bottom-right` of avatar
  - Green `#22C55E` + `animate-pulse` = "Active today" (last_seen < 24h)
  - Emerald static `#10B981` = "Active this week" (< 7 days)
  - Gray `#9CA3AF` = inactive
- Uses existing `activitySignal` logic from `EnhancedMemberCard` (lines 175-191)

### Layer 2 — Credibility
- Name: `font-semibold text-base`
- Headline: `text-sm text-muted-foreground`, 1 line, truncate
- Sector chip: Forest `#2D6A4F` outline pill, `text-xs` — derived from `industries[0]` or `focus_areas[0]`
- Country flag: `text-lg`, positioned top-right of card

### Layer 3 — Value
- First sentence of `bio` (split on `.` or `!` or `?`), max 60 chars, truncated
- `text-xs text-muted-foreground italic`
- Only rendered if data exists

### Layer 4 — Social Proof
- Mutual connections: uses existing `useMutualConnections` hook
- If mutuals > 0: small overlapping avatar stack (3 max, 20px) + "N mutual connections"
- If zero mutuals: show connection count as fallback text
- Only rendered if data exists

### Action Row
- Left: `MapPin` icon + location text, `text-xs`
- Right: State-dependent button using existing `useConnectionStatus` hook:
  - Default: "Connect" — `bg-dna-emerald text-white rounded-full px-4 py-1.5`
  - Connected: "Message" — Forest outline style
  - Pending sent: "Pending" — ghost, disabled

### Card Container
- `bg-card border border-border rounded-2xl p-4`
- `hover:shadow-md hover:border-dna-emerald/30 transition-all duration-200`
- Click navigates to profile (existing `handleViewProfile` pattern)
- Mobile: full width single column
- Desktop: fits 3-column grid, `min-w-[240px]`

### Three Visible States
The card renders in 3 states based on `connectionStatus`:
1. **Active today** — green pulse dot, "Connect" button
2. **Connected** — presence dot, "Message" button (emerald outline)
3. **Pending** — presence dot, "Pending" button (ghost, disabled)

## Infrastructure Reuse
- `useConnectionStatus(member.id)` — existing hook for button state
- `useMutualConnections(user?.id, member.id)` — existing hook for social proof
- `useAuth()` — current user context
- `getActivityStatus()` from `src/lib/username/validation.ts` — presence logic
- `COUNTRY_FLAGS` map — copy from existing `EnhancedMemberCard`
- `handleConnect`, `handleMessage`, `handleViewProfile` — same logic patterns

## Files Changed

| File | Action |
|------|--------|
| `src/components/connect/hub/ConnectMemberCard.tsx` | **Create** — new card component |
| `src/components/connect/hub/index.ts` | **Edit** — export new component |
| `src/components/connect/hub/DiscoveryFeed.tsx` | **Edit** — swap `EnhancedMemberCard` for `ConnectMemberCard` |

The existing `EnhancedMemberCard` is preserved (not deleted) to avoid breaking any other imports. The new card is used in the discovery feed going forward.

## What Does NOT Change
- No new hooks or services
- No database changes
- No routing changes
- Brand colors, fonts, design tokens unchanged
- `EnhancedMemberCard` kept for backward compatibility

