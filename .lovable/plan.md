

## Root Problem: Negative Margins Causing Horizontal Overflow

The `InteractiveTimeline` component on line 56 uses `-mx-4 sm:-mx-6 lg:-mx-8` to try to break out of its parent container and go "full width." This is the root cause of the right-side content bleeding off screen on mobile — the negative margins push the section beyond the viewport, and combined with the horizontally scrollable card container, it creates visible overflow on the right edge.

Additionally, unlike the other sections in `DiasporaStats` which are wrapped in `max-w-7xl mx-auto`, the `InteractiveTimeline` is rendered unwrapped, so it has no centering constraint.

### Changes

**`src/components/stats/InteractiveTimeline.tsx`**
- Remove the negative margins (`-mx-4 sm:-mx-6 lg:-mx-8`) from the outer `<section>` — these are the direct cause of the overflow
- Add `overflow-x-hidden` to the outer section to prevent any child scroll containers from bleeding out
- Keep the inner horizontal scroll container as-is (it scrolls within bounds)

**`src/components/DiasporaStats.tsx`**
- Wrap `<InteractiveTimeline />` in a `max-w-7xl mx-auto` container like the other sections, or add `overflow-hidden` on the parent `<div>` to contain any bleed

This will properly center the timeline section and prevent it from extending past the screen edges on mobile.

