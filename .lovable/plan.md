
# Fix mobile messaging so it behaves like WhatsApp, and remove the SWC startup blocker

## What is happening
There are two separate problems:

1. **Mobile chat behavior**
   - When the user taps the message field, the thread is not staying stable like WhatsApp.
   - The header/composer are not being treated as fixed rails inside the chat shell.
   - The message list is not isolated enough as the only scrollable region.
   - The textarea keeps resizing, which encourages the viewport to shift instead of preserving a steady thread.

2. **Build is blocked before Vite starts**
   - `vite.config.ts` imports `@vitejs/plugin-react-swc`, which depends on the native `@swc/core` binding.
   - The environment currently cannot load that native binding, so the app fails before any UI code runs.

## Implementation plan

### 1) Remove the SWC dependency from Vite startup
Update the Vite React plugin so the dev server no longer depends on native SWC bindings.

**Files**
- `vite.config.ts`
- `package.json`
- lockfile(s)

**Changes**
- Replace `@vitejs/plugin-react-swc` with `@vitejs/plugin-react`.
- Update the import in `vite.config.ts` to use the non-SWC plugin.
- Update dependencies in `package.json`.
- Refresh the lockfile so the install is consistent.

**Why**
This is the cleanest fix for the current build blocker because it removes the failing native dependency entirely instead of hoping the environment-specific binding installs correctly.

---

### 2) Make the chat thread a strict 3-part shell
Restructure the chat layout so it behaves like:

```text
[Header - fixed within chat]
[Messages - only vertical scroll area]
[Composer - fixed within chat]
```

**Primary file**
- `src/components/messaging/inbox/ChatThread.tsx`

**Changes**
- Make the root thread container explicitly:
  - `h-full`
  - `min-h-0`
  - `overflow-hidden`
  - `flex flex-col`
- Make the header region non-shrinking.
- Make the messages region the only scroll container:
  - `flex-1`
  - `min-h-0`
  - `overflow-y-auto`
  - `overscroll-y-contain`
- Keep the composer as a non-shrinking bottom rail.
- Add bottom scroll padding so the last messages do not disappear behind the composer.

**Why**
Right now the thread is visually split into header/messages/input, but only loosely. On mobile Safari this often causes the viewport to “help” by shifting the screen when the input gets focus. A strict shell makes the chat area stable.

---

### 3) Keep the mobile full-screen overlay stable while typing
Tighten the mobile route container so the browser treats the chat like a dedicated app screen.

**Primary file**
- `src/pages/dna/Messages.tsx`

**Changes**
- Keep the existing full-screen mobile overlay, but make it explicitly:
  - full-height
  - `min-h-0`
  - `overflow-hidden`
  - non-scrolling at the page-shell level
- Ensure the `ChatThread` receives the entire available height and the route itself does not become an extra scroll container.
- Preserve the hidden header / hidden dock behavior already added.

**Why**
If both the page shell and the messages list can scroll, focusing the textarea can trigger screen adjustment. The route should be a fixed shell; the message list should do the scrolling.

---

### 4) Make the composer behave like WhatsApp
Refine the input so typing does not push the screen around.

**Primary file**
- `src/components/messaging/inbox/ChatInput.tsx`

**Changes**
- Keep the composer `flex-shrink-0`.
- Limit textarea growth to a tighter WhatsApp-like max height.
- Let the textarea scroll internally after that max height instead of continuing to expand the layout.
- Add mobile-safe bottom padding/inset handling so the composer sits comfortably above device safe areas.
- Keep send/attachment controls fixed and aligned while the textarea grows within bounds.

**Why**
WhatsApp does not let the composer expand indefinitely and displace the screen. It grows a bit, then the text field scrolls internally. That is the key behavior your screenshots are showing.

---

### 5) Make the header always visible while typing
Ensure the top bar remains visible and never scrolls away when the user focuses the composer.

**Files**
- `src/components/messaging/inbox/ChatThread.tsx`
- `src/components/messaging/inbox/ChatHeader.tsx`

**Changes**
- Treat the header as a fixed-height, non-shrinking top rail.
- If needed, make it sticky within the thread shell.
- Preserve the current visual design, but lock the layout behavior.

**Why**
The user should always know who they are messaging. That is part of the WhatsApp pattern you want to match.

---

### 6) Verify the scrolling behavior end-to-end on mobile
After implementation, validate the exact flow shown in your screenshots.

**Test cases**
1. Open a thread on mobile.
2. Tap the textarea.
3. Confirm:
   - header stays visible
   - prior messages remain visible
   - the thread scrolls vertically while keyboard is open
   - composer stays anchored at the bottom
   - long draft text scrolls inside the textarea instead of pushing the whole screen
4. Test both short and very long conversations.
5. Test iPhone-sized viewport first.

## Technical details

### Root cause in the current code
- `Messages.tsx` correctly uses a full-screen mobile overlay now, but the thread itself still needs stronger internal height/scroll boundaries.
- `ChatThread.tsx` currently makes the messages area scrollable, but the root shell is not constrained enough for iOS keyboard behavior.
- `ChatInput.tsx` auto-resizes the textarea, which is good visually, but without a stricter cap/internal scrolling it contributes to layout movement.
- `vite.config.ts` currently hard-depends on SWC through `@vitejs/plugin-react-swc`, which is why Vite never starts in this environment.

### Expected outcome
After these changes:
- the project starts again without the SWC native-binding crash
- mobile chat feels app-like
- selecting the text area does not visually “rebuild” the screen
- users can keep seeing the conversation while typing
- users can vertically scroll the chat while the keyboard is open, matching the WhatsApp behavior you referenced

## Scope
- `vite.config.ts`
- `package.json`
- lockfile(s)
- `src/pages/dna/Messages.tsx`
- `src/components/messaging/inbox/ChatThread.tsx`
- `src/components/messaging/inbox/ChatInput.tsx`
- possibly `src/components/messaging/inbox/ChatHeader.tsx` for layout hardening
