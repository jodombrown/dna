# Lens Bar: pill-track to open-rail redesign (handoff spec for the Claude design agent)

## What differs between the screenshots

Screenshot 1 and 3 are the live build. Screenshot 2 is the target design.

Live (screenshots 1 and 3):
- The whole row sits inside a filled grey container: `bg-muted`, `rounded-lg`, `p-1`, plus an inset top hairline. It reads as a segmented control glued to the header.
- The active chip is a small `rounded-md` raised rectangle inside that container, so there are two nested rounded boxes competing at the same scale.
- The descriptor line under the track is set in the body face, upright, and sits close under the container.
- The container's fill is the same warm grey family as the page, so the bar looks like a strip of chrome rather than navigation.

Target (screenshot 2):
- No container fill at all. The lenses sit directly on the page ground, and the row is bounded only by hairlines above and below.
- The active lens is a single fully rounded chip: `--card` white, hairline border, one soft shadow, icon plus label. It is the only filled object in the row.
- Inactive lenses are bare icons on the ground, evenly distributed across the full width, no box, no hover fill.
- The descriptor is one italic line in the display face (Lora), muted, sitting a clear step below the row.
- The active chip is a pill, not a rounded rectangle: corner radius equals half its height.

Net: the design removes one nesting level. The old bar drew a track and then drew a chip inside it. The new bar draws no track and lets the chip be the only shape.

## What the design agent must build toward

Row container
- Transparent background. No fill, no radius, no inner padding ring.
- One hairline above and one hairline below the row, `--border`, full bleed to the shell's content width.
- Row height 44px on mobile, unchanged across breakpoints.
- Lenses distributed evenly across available width. The active chip is content-sized and never stretches; inactive icons share the remainder equally.

Active chip
- Pill: fully rounded, `--card` fill, 1px `--border`, one soft shadow at the system's smallest elevation. No gradient, no ring.
- Contains icon plus label, always, at every breakpoint.
- Icon carries the surface's C hue from the `c5` ramp (Connect green on Connect, Convey wine on Convey, and so on). On Feed, which is not a C, the icon carries `--foreground`.
- Label is the meta type token, medium weight, foreground colour, never bold.
- Chip is absolutely positioned and animated by transform and width, 150ms ease-out, so tapping a lens never reflows siblings.

Inactive lenses
- Icon only below `lg`. Icon plus label at `lg` and above.
- Colour `--foreground` at 70%, to full `--foreground` on hover. No background on hover, no scale, no translate.
- Disabled lens keeps its position and renders a dashed hairline outline, no fill.

Descriptor
- One line, display face, italic, `--muted-foreground`, meta size, left aligned to the row's left edge.
- Sits below the lower hairline with a clear gap, not flush against it.
- Same string feeds the accessible name of the active tab, so there is one source per lens.
- Collapses by max-height on scroll down, 150ms, latched. Only tapping the active lens brings it back. Instant under reduced motion.

Behaviour that must not change
- Active lens lives in the URL as `?lens=<id>`. First lens is the fallback and the URL is not rewritten on mount. Back button moves between lenses.
- `role="tablist"`, `role="tab"`, `aria-selected`, accessible name folds in the descriptor, visible focus ring on every lens.
- Active chip position measured, kept in view, re-measured on resize of the active button.
- Tapping the active lens toggles the descriptor rather than re-navigating. Light haptic on any accepted tap.
- Horizontal scroll only when the set genuinely cannot fit. Nothing truncates or compresses.

Refusals
- No raw hex, rgb, or hsl literals. No bracket values. Colour only through semantic tokens and the `c5` ramp.
- Type only from `hero display h1 h2 h3 body meta micro`. No Tailwind default sizes.
- No coloured track, no accent stripe, no per-C background. Per-C hue appears on the active icon only.
- Focus ring stays emerald on every surface and both themes, never the C hue.

## Files this touches when implemented

- `src/components/shell/LensBar.tsx` (track fill, chip shape, descriptor typography)
- `src/components/shell/HubTabsRow.tsx` and `src/components/shell/LensRail.tsx` (surrounding padding and hairlines, only if the row's own hairlines duplicate theirs)

No other file changes, no behaviour changes, no token additions expected. If the smallest-elevation shadow or the pill radius has no existing token, name it and stop rather than inventing a value.
