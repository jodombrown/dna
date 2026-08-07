# Mobile hub spacing and DIA cleanup

## What is causing the spacing

The screenshots contain two overlapping problems:

1. Connect and the shared mobile hub shell measure the full fixed header, then add an extra 12px buffer before rendering the body. Because this behavior is shared, the gap returns across multiple hub lenses whenever the shell is reused.
2. Convene My Events also renders its desktop title panel on mobile directly below the mobile chrome. Its padding and bottom margin create the much larger blank region in that screenshot.

The fix will remove the extra buffer only from the affected hub shells. Feed will not be changed. My Events will keep its title panel on desktop and hide it on mobile.

## Changes

### 1. Remove recurring mobile hub gaps

- Make `DnaMobileHubShell` offset content by the measured header height only, with no added visual buffer.
- Apply the same exact-height measurement to Connect's bespoke mobile shell.
- Keep safe-area inset handling intact so content never sits under the device status bar.
- Hide the redundant My Events title panel on mobile while preserving it on desktop.

### 2. Remove the requested mobile intro rows

- Hide the Collaborate title, description, and `Start a Space` row on mobile only.
- Hide the Contribute title, description, and `Post a Need` row on mobile only.
- Keep both rows unchanged on desktop. Their lens bars become the first mobile content below the shared header.

### 3. Expand the DIA search text area

- Give the full DIA search surface two visible rows so `Discover stories, content, or trending topics...` can wrap and remain readable on mobile.
- Keep the compact desktop DIA surface at one row.
- Preserve the existing auto-grow and scrolling behavior for longer queries.

### 4. Remove the floating Convey icon

- Remove the mobile floating `DiaContextual` launcher from Convey across its lenses.
- Keep DIA accessible through the canonical MateMasie control already present in the shared mobile header.
- Keep the desktop inline DIA panel unchanged.

## Technical scope

Expected source files:

- `src/components/mobile/DnaMobileHubShell.tsx`
- `src/pages/dna/connect/Connect.tsx`
- `src/pages/dna/convene/MyEvents.tsx`
- `src/pages/dna/collaborate/CollaborateHub.tsx`
- `src/pages/dna/contribute/ContributeHub.tsx`
- `src/components/dia/DiaSearch.tsx`
- `src/pages/dna/convey/ConveyStoryHub.tsx`

No schema, backend, Feed, desktop hub behavior, or public copy changes.

## Verification

- Run the focused mobile shell regression tests and the project design-system checks.
- Verify the structural behavior at mobile width for Connect Members, Network, Map, Convene My Events, Collaborate, Contribute, and Convey.
- Confirm the header and lens bars remain fixed without content overlap, the DIA placeholder wraps fully, and the floating icon is absent.
- Authenticated browser verification may be limited because this project uses an external unmanaged Supabase session. If so, verify authenticated-only states through focused component tests and report that limitation explicitly.

## Design system check

- Reuse existing background, foreground, border, and module tokens.
- Compose the existing mobile shell, lens bars, Button, and DIA components.
- Add no token, component, dependency, arbitrary value, font, or color.
- Preserve canonical mobile chrome and desktop menus.