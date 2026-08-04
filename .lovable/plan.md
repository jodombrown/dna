# Stop Near Me from asking for your location

## What is happening

Pressing the Near Me pill runs the proximity sort, and the first step of that sort calls the browser's location API directly. That is what triggers the "Allow ... to access your location?" box every time. Nothing remembers a previous answer, so it reappears on every press, and in the preview it shows the raw preview URL, which looks alarming.

Confirmed in the code: `src/lib/maps/eventsNear.ts` calls `getDevicePosition()` (the browser prompt) as the first anchor in its chain, and `useNearMeEvents` runs that as soon as the Near Me lens is active.

## The fix

Near Me never prompts on its own again. It uses the location you already declared on your profile, and the device location is only ever used if you deliberately ask for it.

1. **Never prompt automatically.** The device-location step becomes opt-in. Pressing Near Me sorts by your declared profile location instead, which needs no permission and no prompt.
2. **Silent reuse when already allowed.** If the browser already has location permission granted for this site from a previous deliberate choice, Near Me uses it with no prompt. If permission is denied or not yet decided, it is never asked for.
3. **One explicit control.** A small "Use my exact location" action sits in the Near Me lane header. Only pressing that can ever raise the browser box. Once used, the choice is remembered locally so it does not re-ask on every visit, and it can be turned back off.
4. **Honest headers stay honest.** The existing header states already cover each case ("Near your saved location", "Nothing near you yet", the error state). No new copy invented beyond the one control label.

If you have no declared location on your profile and have not opted in, Near Me shows the plain upcoming list with the existing "Nothing near you yet" header. Empty, never an error, never a prompt.

## Technical notes

- `src/lib/maps/eventsNear.ts`: `getEventsNear` takes an explicit `allowDevice` flag. When false, the device branch is skipped entirely and the chain starts at the declared anchor. When true, it checks `navigator.permissions.query({ name: 'geolocation' })` first and only calls `getCurrentPosition` when the state is `granted`, or when the call originates from the explicit opt-in action. The BD213 rule holds: the try/catch still guards only the prompt, and an RPC error still propagates.
- `src/hooks/convene/useNearMeEvents.ts`: accepts and threads the `allowDevice` value, keeps it out of the query key in coordinate form (only the boolean plus the declared coordinate participate), and continues to never persist a device coordinate.
- `src/components/convene/NearMeEventsLane.tsx`: reads the stored opt-in preference, renders the single opt-in control in the lane header, and passes `allowDevice` down. Design-system tokens only, no arbitrary values, existing `DiscoveryLane` reused with no new card or bespoke layout.
- Opt-in state is stored under one local key, read-only from this feature, and never written to the profile.
- `src/lib/maps/eventsNear.test.ts` gains cases for: `allowDevice: false` never touches geolocation, and `allowDevice: true` with permission not granted also never touches it.

Files touched: `src/lib/maps/eventsNear.ts`, `src/hooks/convene/useNearMeEvents.ts`, `src/components/convene/NearMeEventsLane.tsx`, `src/lib/maps/eventsNear.test.ts`.
