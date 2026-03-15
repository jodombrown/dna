

## Scroll-Aware Two-Line Menu Bar

**Goal**: When the user scrolls down (reading content), the top header row (MobileHeader with logo/composer/notifications) slides up and fades out, and the tabs row animates up to take its place at `top-0`. When the user scrolls back up, the header row reappears and pushes the tabs back down.

### Implementation

**File: `src/pages/dna/Feed.tsx`** (lines 149-172)

1. Import `useScrollDirection` from `@/hooks/useScrollDirection`
2. Get `isScrollingDown` and `isAtTop` from the hook
3. Derive `hideHeader = isScrollingDown && !isAtTop`
4. Apply transitions to both fixed containers:
   - **Header row** (`top-0`): When `hideHeader` is true, translate it up by its own height (`-translate-y-full`) and fade to `opacity-0`. Add `transition-all duration-300`.
   - **Tabs row** (`top-14`): When `hideHeader` is true, move from `top-14` to `top-0`. Add `transition-all duration-300`.
5. Update main content padding: When header is hidden, reduce from `pt-[6.75rem]` to ~`pt-[3.25rem]` (tabs only). Use `transition-all duration-300` for smooth content shift.

No new files needed. ~15 lines changed in Feed.tsx.

