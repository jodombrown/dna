

## Root Cause: Zero-Buffer Padding Math

The content bleeding is not a CSS stacking or z-index issue. It's a **math issue with zero margin of error**.

### The Current Math

| Element | Height |
|---------|--------|
| MobileHeader (`h-14`) | 56px |
| Tabs row (`py-1.5` + inner `p-1` + buttons `py-2` + icons) | ~48px |
| `border-b` on tabs row | 1px |
| **Total fixed content** | **~105px** |
| `MOBILE_STACKED_HEADER_VISIBLE` (`pt-[6.5rem]`) | **104px** |

The padding is **1px short** of the actual fixed content height. Any additional pixel from borders, sub-pixel rendering, or the `FeedTabExplainer` banner that renders as the first child inside `<main>` causes visible overlap.

When the header hides, `MOBILE_STACKED_HEADER_HIDDEN` is `pt-[3rem]` (48px) for a tabs row that is also ~48-49px — again zero buffer.

The same pattern exists on Connect, where the `ConnectMobileHeader` contains both rows in one fixed block.

### Why Previous Fixes Failed

Every previous fix adjusted the padding value by a pixel or two, which works until any child component (like `FeedTabExplainer`, `MobileProfileCompletionBanner`, or a border change) shifts things by even 1px. The approach of hardcoding pixel-perfect padding against dynamic content heights is fundamentally fragile.

### The Real Fix

**Stop guessing pixel values. Measure the actual fixed header height at runtime and apply it as padding.**

1. **In `mobileHeaderSpacing.ts`** — increase both constants to include a proper 12px buffer:
   - `MOBILE_STACKED_HEADER_VISIBLE`: change from `pt-[6.5rem]` (104px) to `pt-[7.25rem]` (116px) — adds 12px breathing room
   - `MOBILE_STACKED_HEADER_HIDDEN`: change from `pt-[3rem]` (48px) to `pt-[3.75rem]` (60px) — adds 12px breathing room

2. **In `Feed.tsx`** — wrap both fixed header rows (header + tabs) in a single measured container with a ref, and use a `useEffect` + `ResizeObserver` to read `getBoundingClientRect().height` and set the content `padding-top` dynamically via inline style. This eliminates the hardcoded constant entirely for Feed.

3. **In `Connect.tsx`** — same pattern: measure the `ConnectMobileHeader` container height dynamically.

4. **Create a shared hook `useMobileHeaderHeight`** that:
   - Takes a ref to the fixed header container
   - Uses `ResizeObserver` to track its height
   - Returns `headerHeight` (number)
   - Used as `style={{ paddingTop: headerHeight + 12 }}` on the content `<main>`

This way, if the header ever changes height (logo size, tab count, border changes), the content padding automatically adjusts. The 12px buffer is explicit and guaranteed.

### Files Changed

- **`src/hooks/useMobileHeaderHeight.ts`** — new shared hook (ResizeObserver-based)
- **`src/pages/dna/Feed.tsx`** — replace hardcoded `MOBILE_STACKED_HEADER_VISIBLE/HIDDEN` with dynamic measurement from the hook
- **`src/pages/dna/connect/Connect.tsx`** — same replacement
- **`src/lib/mobileHeaderSpacing.ts`** — update constants as fallback values (for any page not yet using the hook), add buffer

### Why This is the Permanent Fix

Hardcoded pixel constants will always drift when any header child changes. A `ResizeObserver` on the fixed container is the only approach that self-corrects. Feed and Connect get it first; every future page uses the same `useMobileHeaderHeight` hook.

