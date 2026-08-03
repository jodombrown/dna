# DIA panel will not scroll: diagnose, then give it one scroll owner

## What I can confirm from the code

`src/components/dia/DiaSheet.tsx` renders inside `src/components/ui/sheet.tsx`. Two things are true today, both read directly from those files:

1. **There are two competing scroll containers.** `SheetContent` already carries `overflow-y-auto max-h-[100dvh]` (sheet.tsx line 32), and every one of the five `TabsContent` panels in DiaSheet also carries `flex-1 overflow-y-auto`. So the panel has a scroller nested inside a scroller, both sized to the viewport.
2. **The inner panels are flex children with no `min-h-0`.** `TabsContent` is `flex-1` in a column flex chain whose parents do set `min-h-0`, but the panels themselves do not.

What I have **not** yet confirmed is which of those is actually eating the wheel event. Your own observation is the useful clue: drag-select scrolls, wheel and touch do not. Drag-select is driven by the browser and always finds the real scrollable ancestor, while wheel and touch are cancellable and can be swallowed by the modal scroll lock (`react-remove-scroll`, which Radix Dialog uses under `modal`). That points at the lock refusing the gesture rather than at a missing scrollbar, but I am not going to name it as the cause before measuring it. I could not measure it this turn: the DIA panel needs a signed-in session and this project is on external Supabase, so no authenticated browser run is available to me here.

Answers to your direct questions, with that caveat: the geometry issue is in shared code, so it is **not preview-only and not mobile-only** - it applies to mobile and desktop alike. Your personal phone probably works because native momentum scrolling on iOS reaches the outer sheet scroller that the preview iframe's synthetic wheel/touch never gets to.

## Step 1: measure before changing anything

With the panel open, capture for the dialog node and every descendant: `overflow-y`, `clientHeight`, `scrollHeight`, `min-height`, plus whether `document.body` still carries the scroll-lock attributes and whether a `wheel` listener cancels the event. That tells us in one read whether the scroller has no overflow to scroll (geometry) or has overflow but the gesture is cancelled (scroll lock).

## Step 2: the fix, which is the same either way

Collapse to **one scroll owner** and stop nesting.

- Give `DiaSheet`'s `SheetContent` `overflow-hidden` at the call site so the outer sheet stops pretending to be a scroller.
- Keep exactly one scroller: the active `TabsContent`. Add `min-h-0` alongside `flex-1 overflow-y-auto` so the panel is genuinely height-constrained, and `overscroll-contain` so the gesture terminates in the panel instead of being handed to the locked body.
- Move the `absolute inset-0` readability overlay so it sits behind the scrolling column rather than spanning it.

If Step 1 shows the scroll lock is cancelling the gesture, the additional change is to mark the scrolling panel as the allowed scroll region for the lock, rather than turning the sheet non-modal (non-modal would change focus and dismiss behaviour, which is not what you asked for).

## Step 3: verify, not assume

Re-run the Step 1 measurement on the fixed panel at 393px, 768px and 1440px, confirm `scrollTop` actually advances on a synthetic wheel and on a touch drag, and confirm the header stays pinned while the body moves. I will report the measured numbers, not a success message.

## Files in scope

- `src/components/dia/DiaSheet.tsx` (the panel: scroller ownership, `min-h-0`, overlay placement)
- `src/components/ui/sheet.tsx` - read only unless Step 1 proves the shared variant is the culprit, in which case I will flag it before touching it, since every sheet in the app inherits it

No token, colour, type or spacing value changes. No behaviour change beyond scrolling.
