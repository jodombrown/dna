

# Convene Mobile Header Redesign

## Problem
The Convene page (`/dna/convene`) lacks a dedicated mobile header. It currently renders a location selector and action buttons inline within the scrollable content area, inconsistent with the polished fixed-header patterns on Feed and Connect.

The screenshot shows the circled area: the current Convene mobile header is a mishmash of a location dropdown, search/map/create buttons, and pill filters — none of which follow the standard DNA mobile header pattern.

## Reference Pattern (Feed + Connect)

Both Feed and Connect use a two-row fixed mobile header:

**Row 1** (hides on scroll-down):
- DNA logo (left)
- Composer bubble / search input (center, flex-1)
- Notification bell + profile avatar (right)

**Row 2** (always visible):
- Tab/filter bar with pill-style selection

This is measured by `useMobileHeaderHeight` and content gets dynamic `paddingTop`.

## Plan

### 1. Create `ConveneMobileHeader` component
`src/components/convene/ConveneMobileHeader.tsx`

Follows the exact same structure as `ConnectMobileHeader` and `MobileHeader variant="feed"`:

**Row 1**: DNA logo | Composer bubble ("Host or find an event...") | Notification bell | Profile avatar

- Clicking the composer bubble opens the Universal Composer in `event` mode
- Uses same sizing: `h-14`, logo at `h-[80px]`, avatar at `h-9 w-9`

**Row 2**: Pill filter bar (All, Near Me, This Week, Online, Free, My Network)

- Reuse the existing `PillFilterBar` component, wrapped in the same `px-3 py-1.5 bg-background border-b` container used by Feed and Connect tabs
- Add location selector as a compact chip/dropdown at the start of the row (or integrate into Row 1 as a small location badge next to the logo)

### 2. Update `ConveneDiscovery.tsx` mobile layout

Add a mobile-specific branch (like Feed does with `if (isMobile)`):

- Wrap both header rows in a single `ref={mobileHeaderRef}` fixed container
- Use `useMobileHeaderHeight` for dynamic padding
- Use `useHeaderVisibility` to hide the global UnifiedHeader on mobile
- Use `useScrollDirection` to hide Row 1 on scroll-down (Row 2 stays)
- Remove the inline header section (`ConveneLocationSelector` + action buttons) from mobile — keep it for desktop only
- Move search, map toggle, and create button into Row 1's right section or keep search in the composer bubble area

### 3. Files to modify

| File | Change |
|------|--------|
| `src/components/convene/ConveneMobileHeader.tsx` | **New** — dedicated mobile header matching Feed/Connect pattern |
| `src/pages/dna/convene/ConveneDiscovery.tsx` | Add mobile branch with fixed header, `useMobileHeaderHeight`, scroll-hide behavior; desktop layout unchanged |

### 4. Key details

- The composer bubble text: "Host or find an event..." (contextual to Convene)
- Clicking it calls `composer.open('event')`
- Location selector moves into Row 1 (small chip next to logo) or into a dropdown accessible from Row 1, keeping Row 2 clean for just the pill filters
- The pill filter bar styling remains unchanged (copper accent active states)
- Bottom padding already uses `pb-bottom-nav` — no changes needed there

