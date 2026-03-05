

# DNA Mobile Experience Modernization Plan

## Assessment Summary

After auditing the codebase, researching 2026 mobile webapp best practices, and cross-referencing the existing mobile audit document, here are the systemic issues and the targeted fixes to make DNA feel like a truly progressive mobile webapp.

---

## Issues Found

### 1. Viewport Meta Tag is Outdated
The current `index.html` viewport tag blocks accessibility and lacks modern keyboard handling:
```
width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no
```
- **`maximum-scale=1.0, user-scalable=no`** violates WCAG (prevents pinch-to-zoom for visually impaired users). iOS Safari ignores it anyway since iOS 10.
- **Missing `viewport-fit=cover`** means safe-area environment variables (`env(safe-area-inset-*)`) that the CSS already references are **not activated** on notched devices. The safe-area padding defined in `index.css` is essentially dead code right now.
- **Missing `interactive-widget=resizes-content`** means on Chrome Android the keyboard overlays content rather than resizing the layout viewport, which is likely contributing to the composer "moving around" issues.

### 2. Using `100vh` Instead of `dvh` Units
18 files use `100vh` or `calc(100vh - ...)`. On mobile browsers, `100vh` includes the browser chrome (URL bar), causing content to be hidden behind it. Modern approach is `dvh` (dynamic viewport height) which adjusts when the keyboard or browser UI appears/disappears. Tailwind supports `h-dvh` and `min-h-dvh` natively.

### 3. Inconsistent Bottom Padding for Nav Bar
36 files independently add `pb-16`, `pb-20`, or `pb-safe` to account for the bottom nav. There is no single source of truth. Some pages use `pb-20 md:pb-0`, others `pb-16 sm:pb-20 md:pb-6`. This causes either content clipping or excessive whitespace depending on the page.

### 4. No `overscroll-behavior` on Scrollable Containers
Scroll chaining (where scrolling inside a modal/drawer triggers the parent page to scroll) is not prevented globally. Only the composer has `overscroll-contain`. All bottom sheets, the More menu, and messaging views lack this.

### 5. Missing Haptic Feedback on Key Interactions
Only the QR check-in scanner uses `navigator.vibrate()`. Modern progressive webapps use haptic feedback on primary actions (tab switches, composer open, pull-to-refresh) for native-like feel. This is a low-effort, high-impact enhancement.

### 6. No `prefers-reduced-motion` Respect for Animations
The bokeh animations, breathing pulses, and card hover transforms run regardless of user preference. Users with motion sensitivity or low-end devices get unnecessary animation overhead.

---

## Plan: 6 Targeted Changes

### Change 1: Modernize Viewport Meta Tag
**File:** `index.html`

Replace the viewport meta tag:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content" />
```
- Removes `maximum-scale=1.0, user-scalable=no` (accessibility fix)
- Adds `viewport-fit=cover` (activates `env(safe-area-inset-*)` on notched devices)
- Adds `interactive-widget=resizes-content` (keyboard resizes layout viewport on Android Chrome, preventing fixed elements from being hidden)

### Change 2: Replace `100vh` with `dvh` Units
**Files:** ~10 active files (excluding `_archived/`)

Key replacements:
- `src/pages/dna/Feed.tsx`: `calc(100vh - 7.5rem)` → `calc(100dvh - 7.5rem)`
- `src/layouts/DetailViewLayout.tsx`: `calc(100vh - 64px)` → `calc(100dvh - 64px)`
- `src/layouts/TwoColumnLayout.tsx`: same pattern
- `src/components/ui/sheet.tsx`: `max-h-[100vh]` → `max-h-[100dvh]`
- `src/index.css`: `#root { min-height: 100vh }` → `min-height: 100dvh`
- `src/index.css`: `.mobile-sheet max-h-[100vh]` → `max-h-[100dvh]`
- Connect hub layout columns

This gives correct full-height behavior on every mobile browser.

### Change 3: Add Global `overscroll-behavior` Rules
**File:** `src/index.css`

Add to the global mobile styles:
```css
/* Prevent scroll chaining on modals, drawers, and sheets */
[data-state="open"] [data-radix-scroll-area-viewport],
[vaul-drawer] [data-vaul-drawer-content],
.overflow-y-auto {
  overscroll-behavior: contain;
}

/* Prevent pull-to-refresh on the app shell */
html {
  overscroll-behavior-y: contain;
}
```
This prevents the entire page from bouncing or scrolling when users interact with drawers, sheets, or scrollable lists.

### Change 4: Add `prefers-reduced-motion` Guard
**File:** `src/index.css`

Wrap all animations in a motion preference check:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-breathing-pulse,
  .bokeh-drift-1, .bokeh-drift-2, .bokeh-drift-3, .bokeh-drift-4,
  .interactive-element:hover,
  .card-hover:hover {
    animation: none !important;
    transform: none !important;
    transition: none !important;
  }
}
```

### Change 5: Create Haptic Feedback Utility
**File:** `src/utils/haptics.ts` (new)

A tiny utility for native-feel interactions:
```typescript
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!('vibrate' in navigator)) return;
  const patterns = { light: [10], medium: [20], heavy: [40] };
  navigator.vibrate(patterns[style]);
}
```

Then wire it into key touch points:
- `MobileBottomNav.tsx`: tab switch → `haptic('light')`
- `MobileFeedTabs.tsx`: tab switch → `haptic('light')`
- Composer open → `haptic('medium')`

### Change 6: Standardize Bottom Nav Padding
**File:** `src/index.css`

Create a single CSS custom property and utility class:
```css
:root {
  --bottom-nav-height: 4rem;
}

.pb-bottom-nav {
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px));
}
```

Then migrate the most critical pages (`Feed.tsx`, `Connect.tsx`, `BaseLayout.tsx`, `FeedLayout.tsx`, `Notifications.tsx`, `ProfileV2.tsx`) from ad-hoc `pb-16`/`pb-20` to `pb-bottom-nav`. This creates one place to adjust if the nav height ever changes.

---

## Impact Summary

| Change | Impact | Effort |
|--------|--------|--------|
| Viewport meta fix | Activates safe areas, fixes keyboard overlap | 1 line |
| `dvh` migration | Fixes height on every mobile browser | ~10 edits |
| `overscroll-behavior` | Eliminates scroll chaining globally | 5 lines CSS |
| `prefers-reduced-motion` | Accessibility + performance for low-end devices | 8 lines CSS |
| Haptic feedback | Native-like feel on interactions | New util + 3 wiring points |
| Bottom nav padding standard | Eliminates inconsistent spacing | CSS var + 6 page edits |

No new dependencies. No structural refactors. All changes are additive and backward-compatible.

