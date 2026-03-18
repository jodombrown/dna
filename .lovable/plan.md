

# Fix: Mobile Chat Keyboard Pushes Header & Messages Out of View

## Problem
On iOS mobile, when the keyboard opens in the chat view, `interactive-widget=resizes-content` shrinks the visual viewport. The chat container uses `fixed inset-0` with `pb-bottom-nav`, so the shrunken viewport plus wasted bottom-nav padding leaves no room for the header and messages — only the input is visible.

## Root Cause
Two issues in `src/pages/dna/Messages.tsx` (line 105):

1. **`pb-bottom-nav` is wrong here** — The bottom nav (PulseDock) is visually behind the full-screen chat. Reserving ~70px of padding for it wastes critical vertical space when the keyboard is open.

2. **`fixed inset-0` + keyboard resize** — When the keyboard appears, `inset-0` collapses the container height to the visual viewport minus keyboard. Combined with the wasted bottom padding, the header and messages get squeezed to zero height.

## Fix

### `src/pages/dna/Messages.tsx` (~line 105)
Remove `pb-bottom-nav` from the mobile chat container. The chat is full-screen and sits above the bottom nav, so it should not reserve space for it:

```tsx
// Before
<div className="fixed inset-0 flex flex-col bg-background pb-bottom-nav">

// After
<div className="fixed inset-0 flex flex-col bg-background">
```

This single change gives the header and messages area the full viewport height, so when the keyboard opens the layout has enough room for: header (~48px) + scrollable messages + input bar.

## Scope
- 1 file, 1 line change

