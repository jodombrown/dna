# Lens Bar handoff brief (for an external design agent)

Purpose: a self-contained written spec of the DNA Lens Bar so another agent can reproduce its exact look, behaviour and constraints. Nothing in the app changes; the deliverable is this document (I can also drop it in `docs/LENS_BAR_SPEC.md` if you want it in the repo).

## What the Lens Bar is

One primitive, `src/components/shell/LensBar.tsx`, used by every hub. A horizontal, icon-first segmented control that switches which slice of a surface is shown. It is not navigation between pages and it is not a filter set: filters live in the Rail / Narrow sheet.

Surfaces and their lens sets (order is canonical):
- Feed: All, For You, My Network, Mine, Saved (no C colour)
- Connect: Members, Network, Map, Messages (Messages present-but-disabled)
- Convene: All, Near Me, This Week, Online, Network, Curated by DNA
- Collaborate: Discover, Mine, Completed
- Contribute: Needs, Mine, Fulfilled
- Convey: Pulse, Curated, My Circle, My Voice, Saved

## Behaviour, the load-bearing part

- State lives in the URL as `?lens=<id>`. No component state, no context. A link can land on a lens; the back button moves between lenses rather than off the surface (`replace: false`).
- Unknown or absent `?lens=` selects the first lens and does not rewrite the URL.
- Tapping the ACTIVE lens does not re-navigate: it toggles the descriptor line.
- A disabled lens keeps its seat: `aria-disabled`, `tabIndex -1`, dashed border, no click. Sets must not renumber when a flag flips.
- Light haptic on every accepted tap.

## Structure

Track: `role="tablist"` with an `aria-label`; each lens is a `<button role="tab" aria-selected>`. Accessible name is `"{label}: {description}"`, so the descriptor copy has one source per lens.

Active chip: an absolutely positioned span behind the active button, measured from the button's `offsetLeft`/`offsetWidth`. It is content-sized, never `flex-1`, so tapping never reflows siblings. Placement runs before paint, so the first frame is already correct; the transform/width transition only enables after that first placement. A `ResizeObserver` on the active button re-measures when the surrounding rail collapses or expands.

Sizing rules:
- Active lens: `flex-none`, `p-2`, icon plus label.
- Inactive lenses: `flex-1` with a 32px floor, icon only below `lg:`.
- At `lg:` and up every label renders.
- Min height 36px. Track scrolls horizontally (`overflow-x-auto`, hidden scrollbar) only when the set genuinely cannot fit; the active chip is auto-scrolled into view with a 4px margin. Nothing truncates, nothing compresses, nothing clips.

Descriptor line: one italic, muted, single-line `text-meta` sentence under the track, only when the active lens has a description. Visible on arrival and on every lens change. Collapses on scroll-down away from top and latches collapsed (scroll-up does not bring it back, so it cannot flicker); tapping the active lens is the only way back. Collapse animates `max-height` (0 to 20), not opacity, so content below rises into the reclaimed space. 150ms, ease-out, matching the chip. Not persisted: a fresh visit starts visible.

## Colour and tokens

Only one place hue appears: the ACTIVE lens icon. It resolves through the `c5` Tailwind key for the surface's C (`text-c5-connect|convene|collaborate|contribute|convey`). Feed is not a C, so its active icon is `text-foreground`. Inactive icons/labels are `text-foreground/70`, hover `text-foreground`.

Track: `bg-muted`, `rounded-lg`, `p-1`, `gap-1`, plus a 1px inset top hairline in `--border`. Active chip: `bg-surface-raised`, `rounded-md`, `shadow-dna-2`. Focus ring is the emerald `--ring` on every surface and both themes, never the C's colour.

Hard prohibitions the design must respect: no raw hex/rgb/hsl literal, no bracket/arbitrary Tailwind values, no font size outside `hero display h1 h2 h3 body meta micro` (the bar uses `text-meta` only), no `text-sm`/`text-xs`, only `sm md lg` breakpoints. Colour classes must be built literally, never string-interpolated, or Tailwind's scanner misses them.

## Chrome placement

`HubTabsRow` (`px-3 py-1.5 bg-background border-b border-border`) is the only wrapper. It goes in `DnaMobileHubShell`'s `tabs` slot on mobile and `AppShell`'s `tabs` slot on desktop, so the row is a pinned full-bleed chrome band under the header, never inside the page's content column. All five hubs plus Feed do this identically; a hub that renders its bar in content is the defect (that was Collaborate's bug).

Desktop alternative: `LensRail` is the same URL contract presented as a ~208px vertical labelled sidebar with live counts (a count renders only when greater than 0). Exactly one of LensBar / LensRail is mounted at a time.

Empty, loading and error are all part of the surface: the Lens Bar never changes between the three, only the body below it swaps.

Icons are Lucide, one glyph one meaning, unique within a surface and globally reserved (`docs/ICON_USAGE_GUIDE.md`, enforced by `scripts/check-icon-duplicates.ts`). Adinkra is reserved for the C nav itself and never appears in the bar.

## What I need from you before writing the "new enhancements" section

The brief above documents the bar as it ships today. Tell me which enhancements you want the other agent to design toward (for example: label reveal rules, count badges on mobile, animated descriptor, overflow affordance, keyboard arrow-key roving tabindex) and I will add a section stating each as a constraint rather than leaving it open to interpretation.
