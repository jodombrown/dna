
# Fix: Content clipping behind bottom nav on Connect mobile

## Problem
The screenshot shows the last member card on `/dna/connect` is partially hidden behind the PulseDock bottom navigation. 

**Root cause** (line 160 of `Connect.tsx`):
```tsx
<div className="min-h-screen bg-background pb-20 overflow-x-hidden">
```

`pb-20` is a hardcoded 80px guess. The platform already has a standard utility class `pb-bottom-nav` (defined in `index.css`) that calculates the correct padding from `--bottom-nav-height` (64px) plus `env(safe-area-inset-bottom)`. The hardcoded value doesn't account for safe area insets on notched devices, and it also doesn't match the actual dock height precisely.

Additionally, line 195 renders `<MobileBottomNav />` — but the app already renders `PulseDock` globally for authenticated mobile users. This may cause a double bottom nav or at minimum is redundant.

## Changes

### 1. `src/pages/dna/connect/Connect.tsx`
- **Line 160**: Replace `pb-20` with `pb-bottom-nav` to use the standard CSS variable-based padding
- **Line 195**: Remove the redundant `<MobileBottomNav />` render (PulseDock is already rendered globally)
- Remove the `MobileBottomNav` import if no longer used

### 2. Verify other mobile routes
Quick check that Feed and Messages also use `pb-bottom-nav` instead of hardcoded values — these were already migrated in prior work.

## Why this fixes it
`pb-bottom-nav` resolves to `calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))` which is `calc(4rem + safe-area)` — exactly matching the PulseDock's `h-16` (4rem) plus its `pb-safe`. This ensures the last card always clears the dock, including on notched iPhones.
