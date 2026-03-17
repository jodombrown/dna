

# Fix Connect Tab Explainer + Reduce Convene Gap

## Problem 1: Connect Tab Explainer Not Showing

The `ConnectTabExplainer` is only rendered inside `ConnectLayout.tsx`, which is **not used** for mobile routing. The actual mobile Connect page is `src/pages/dna/connect/Connect.tsx`, which renders its own `ConnectMobileHeader` + `Outlet`. The explainer is never rendered in this path.

**Fix**: Import and render `ConnectTabExplainer` in `Connect.tsx` inside the mobile content area (line ~186), right before the `<Outlet>`, passing `mobileView` as `activeTab`.

```
// In the mobile content div (line 183-193):
<div style={{ paddingTop: connectHeaderPadding || undefined }}>
  <ConnectTabExplainer activeTab={mobileView} />   // ← ADD THIS
  <Outlet context={...} />
</div>
```

## Problem 2: Convene Gap Between Tab Bar and Content

The screenshot shows excessive space between the segmented tab bar and the "My Network" explainer card on Convene. The `pt-2` wrapper around the explainer adds 8px, and `space-y-0` doesn't help because the explainer wrapper is a separate child.

**Fix in `ConveneDiscovery.tsx` (line 304)**:
- Remove the `pt-2` wrapper div around the explainer — render it directly with no extra padding, matching how Feed renders its explainer flush against the header.

Change:
```tsx
{isMobile && <div className="pt-2"><ConveneTabExplainer activeTab={activePill} /></div>}
```
To:
```tsx
{isMobile && <ConveneTabExplainer activeTab={activePill} />}
```

## Scope
- `src/pages/dna/connect/Connect.tsx` — add ConnectTabExplainer import + render
- `src/pages/dna/convene/ConveneDiscovery.tsx` — remove pt-2 wrapper

