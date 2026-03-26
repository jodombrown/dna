

# Fix: Space Creation Wizard Not Mobile-Friendly

## Problem
The `SpaceCreationWizard` uses a raw Radix `Dialog`, which on mobile renders as a floating centered overlay with a semi-transparent backdrop. This creates a confusing, barely-usable experience - the content appears too small, misaligned, and users see a blurred/empty page behind it. DNA standards require all creation flows to use a bottom-sheet Drawer on mobile.

## Root Cause
`SpaceCreationWizard.tsx` imports `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` directly instead of using the existing `ResponsiveModal` component (`src/components/ui/responsive-modal.tsx`), which automatically switches between Dialog (desktop) and vaul Drawer (mobile).

## Fix

### Single file change: `src/components/collaborate/SpaceCreationWizard.tsx`

1. **Replace imports**: Swap `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` with `ResponsiveModal`, `ResponsiveModalHeader`, `ResponsiveModalTitle` from `@/components/ui/responsive-modal`

2. **Replace JSX wrapper**: Change the outer `<Dialog>` / `<DialogContent>` / `<DialogHeader>` / `<DialogTitle>` to their `ResponsiveModal` equivalents

3. **Adjust content container**: Add `overflow-y-auto` and proper mobile padding to ensure the multi-step wizard scrolls properly inside the Drawer on mobile. The Drawer gets `max-h-[90dvh]` automatically from `ResponsiveModal`.

4. **Add custom drag handle**: Per the vaul v0.9.3 constraint, the Drawer needs a custom `div` with `vaul-drawer-handle=""` attribute (already handled by ResponsiveModal's DrawerContent).

### No other files change. No data/logic changes. Pure presentation swap.

### What users will see after fix
- **Mobile**: Full-width bottom sheet sliding up from bottom, easy to swipe dismiss, all 4 wizard steps properly scrollable within the sheet
- **Desktop**: Same centered dialog as before (no change)

