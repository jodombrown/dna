# Why Collaborate's lens bar looks different

## What the other four hubs do

Feed, Connect, Convene, Contribute and Convey all mount their lens bar the same way: inside `HubTabsRow` (`src/components/shell/HubTabsRow.tsx`), passed into the `tabs` slot of `DnaMobileHubShell`. That slot sits in the fixed top container directly under the header, so on mobile the bar is a full-bleed chrome row with a bottom hairline, a `px-3 py-1.5` rhythm, and it stays pinned while the body scrolls.

Verified mount points:
- Feed: `src/pages/dna/Feed.tsx:152` (`HubTabsRow` + `FeedLensBar`), desktop copy at line 305
- Connect: `src/components/connect/ConnectMobileHeader.tsx:63`
- Convene: `src/components/convene/ConveneShell.tsx` (`ConveneTabStrip` -> `HubTabsRow` + `LensBar`)
- Contribute: `src/pages/dna/contribute/ContributeHub.tsx:172-181` (`tabs={<HubTabsRow><ContributeLensBar /></HubTabsRow>}`, plus `{!isMobile && <ContributeLensBar />}` in content for desktop)
- Convey: `src/pages/dna/convey/ConveyStoryHub.tsx:429` mobile, `:229` desktop

## What Collaborate does instead

`src/pages/dna/collaborate/CollaborateHub.tsx` (last lines) renders:

```text
<SpacesShell tabs={null}>
  <div className="flex flex-col gap-6">
    <CollaborateLensBar />
    {renderLensBody()}
  </div>
</SpacesShell>
```

Two consequences, both purely presentational:

1. `tabs={null}` empties the shell's chrome row, so there is no pinned tab row and no bottom hairline under the header on mobile. `SpacesShell` even defaults that slot to `CollaborateMobileTabs`, and the hub explicitly nullifies it.
2. The single `CollaborateLensBar` renders inside the page's content column, which `SpacesShell` wraps in `mx-auto max-w-4xl px-4 py-6 sm:py-8`. So the bar is inset by the content gutter, pushed down by the column's top padding, and scrolls away with the body. That is exactly the "doesn't look like the others" difference.

There is nothing wrong with `CollaborateLensBar` itself: it uses the same `LensBar` primitive, `c="collaborate"`, three lenses, route-driven `?lens=`.

## Fix

Mirror the Contribute pattern exactly, so Collaborate becomes the fifth identical case rather than a fourth variant.

In `src/pages/dna/collaborate/CollaborateHub.tsx` only:
- Pass the bar into the shell's chrome slot: `tabs={<HubTabsRow><CollaborateLensBar /></HubTabsRow>}` instead of `tabs={null}`.
- Keep the in-content bar for desktop only, gated with `{!isMobile && <CollaborateLensBar />}` using the existing `useMobile` hook, so the bar is never mounted twice at the same width.
- Import `HubTabsRow` from `@/components/shell/HubTabsRow` and `useMobile` from `@/hooks/useMobile`.

`SpacesShell` also keeps its `max-w-4xl` content column while Contribute uses `max-w-2xl`; that is a separate width question and is not part of this change.

## Not changing

- `CollaborateLensBar`, `LensBar`, `HubTabsRow`, `SpacesShell`, `CollaborateMobileTabs`
- Any lens ids, labels, icons, colours, or query logic
- Collaborate sub-pages (Space detail, board, settings), which keep `tabs={null}`

## Verification

- Render `/dna/collaborate` at 393px: the lens bar sits in the pinned chrome row under the header with the same hairline and padding as `/dna/contribute`, and stays put while the list scrolls.
- Render at 1440px: exactly one lens bar, in content, as today.
- Switching lenses still writes `?lens=discover|mine|completed` and the back button moves between lenses.
