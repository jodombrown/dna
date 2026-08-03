## What happened to Raymond

He was upright the whole time. The notice fired because of the software keyboard, not rotation.

`src/components/mobile/LandscapeGate.tsx` decides with one media query:

```
(orientation: landscape) and (max-height: 500px)
```

Both halves are measured against the **layout viewport**, which shrinks when the keyboard opens. On a 402x725 phone, an open keyboard leaves roughly 402x300: wider than tall, and under 500px. So the CSS reports "landscape" while the phone is vertical.

Worse, the component re-arms on every change to that query (`if (!matches) setDismissed(false)`). Tapping a field opened the notice, tapping "Continue anyway" dismissed it, the keyboard closing rearmed it, the next field opened it again. That is the back-and-forth he lived through, and on signup it lands on the worst possible screen.

## The fix (one file)

`src/components/mobile/LandscapeGate.tsx`:

1. **Decide orientation from the device, not the viewport.** Read `screen.orientation.type` (fall back to `window.orientation`, then to the media query where neither exists). A keyboard never changes `screen.orientation`, so this alone ends the false positive. Keep the existing `(orientation: landscape) and (max-height: 500px)` query as the size check and last-resort fallback, so the desktop scoping guarantee and the BD158 tests in `src/test/appChromeSafeArea.test.tsx` stay intact.
2. **Suppress while typing.** If the software keyboard is up, never show the gate. Detect it the way the app already does: `window.visualViewport.height` well below `window.innerHeight`, plus an active `input` / `textarea` / `contenteditable` element. This is a second, independent guard so a browser with unreliable `screen.orientation` still cannot flash the notice mid-form.
3. **Stop the flicker.** Re-arm the dismissal only on a real device-orientation change, not on every media-query flip.

Net: the gate shows only when the device is genuinely on its side and no keyboard is open, and it does not reappear repeatedly within a session on the same rotation.

## Verification

- Playwright at 402x725: focus the signup email field, shrink the visual viewport to simulate the keyboard, assert no `role="alertdialog"` with "Turn your phone upright".
- Assert it still appears at 725x402 with `screen.orientation` landscape.
- Run the BD158 tests in `src/test/appChromeSafeArea.test.tsx` and a typecheck.

## Notes

No database, auth or signup logic changes. Raymond's account is unaffected; this was presentation only. Nothing else in `src/` is touched.
