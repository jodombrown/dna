

# Fix: Composer Select Dropdowns Blocked on Mobile

## Root Cause

The Universal Composer uses a `vaul` Drawer on mobile at `z-50`. Radix `<SelectContent>` renders via a **portal** at the document root. Without an explicit z-index higher than z-50, the dropdown appears behind the Drawer overlay and is unclickable.

**Story mode already has the fix** -- its `SelectContent` uses `z-[9999]`. Event and Need modes do not.

## Changes

### File: `src/components/composer/ComposerBody.tsx`

Add `className="z-[9999]"` to every `<SelectContent>` missing it inside the Event and Need mode fields:

1. **Timezone Select** (line ~522): Add `z-[9999]` to existing `className`
2. **Dress Code Select** (line ~702): Add `z-[9999]` to `<SelectContent>`
3. **Category Select** (line ~1306): Add `z-[9999]` to `<SelectContent>`
4. **Compensation Select** (line ~1340): Add `z-[9999]` to `<SelectContent>`
5. **Duration Select** (line ~1427): Add `z-[9999]` to `<SelectContent>`

Six total `<SelectContent>` edits. No structural changes, no new files.

