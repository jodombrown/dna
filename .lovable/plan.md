

# Fix Convene Mobile: Gap & Composer Stacking Issues

## Issues Identified

### 1. Gap between pill filter bar and first content
**Screenshot**: IMG_3885 — red circle highlights empty space between pills and hero event.

**Root cause**: The content container on line 299 uses `py-2` which adds 8px top padding ON TOP of the dynamic `paddingTop: headerHeight`. Connect's equivalent container uses NO vertical padding — just `px-3 sm:px-4` with only the dynamic paddingTop. That extra `py-2` creates the visible gap.

### 2. Composer drawer stacking under the fixed header
**Screenshot**: IMG_3884 — the composer drawer appears visually misaligned/clipped because the Convene fixed header (`z-50`) and the vaul Drawer overlay + content (`z-50`) share the same z-index. While the Portal renders at the end of the DOM (so it *should* stack above), this is fragile and causes rendering issues on some devices, especially iOS Safari where the fixed header bleeds through.

**Fix**: Bump the Drawer's overlay and content z-index above the header. The project's z-index hierarchy doc shows dialogs at `z-[9998-9999]` — the composer drawer should match dialog-level stacking.

## Changes

### File 1: `src/pages/dna/convene/ConveneDiscovery.tsx`
- **Line 299**: Change `py-2 lg:py-6` to `pt-0 pb-0 lg:py-6` on mobile. The dynamic `paddingTop: headerHeight` already provides the correct top spacing — adding `py-2` creates the gap. Match Connect's pattern of zero vertical padding on the content container for mobile.

### File 2: `src/components/composer/UniversalComposer.tsx`
- **Line 419**: Bump Drawer.Overlay from `z-50` to `z-[9998]` (matches dialog overlay level).
- **Line 420**: Bump Drawer.Content from `z-50` to `z-[9999]` (matches dialog content level).
- This ensures the composer always renders above any fixed page headers (`z-50`), sticky elements, and sheets — consistent with how desktop Sheet/Dialog already stacks.

## Why This Matches Feed & Connect
- Connect's mobile content container: `className="px-3 sm:px-4 overflow-x-hidden"` with only dynamic `paddingTop` — no `py-*`.
- The composer stacking fix is global and benefits all pages, not just Convene.

