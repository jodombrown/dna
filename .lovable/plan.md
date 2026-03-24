

# Fix Composer: Text Input Must Never Be Obstructed

## Problem
When typing in the mobile post composer, the auto-detected link preview card renders large and pushes content around, making the text input area feel obstructed. The link preview takes up too much vertical space inside the drawer, and the overall scroll behavior doesn't keep the textarea accessible.

## Root Causes
1. **Link preview too large**: Even with `size="compact"`, the `LinkPreviewCard` renders a full image thumbnail + metadata that dominates the limited drawer space.
2. **No max-height on scrollable body**: The composer body scrolls but the link preview can push the textarea out of view with no easy way back.
3. **Textarea too tall by default**: `min-h-[120px]` is generous for a drawer that's only 85dvh.

## Changes

### 1. Constrain link preview inside composer (`ComposerBody.tsx`)
- Wrap the link preview in a max-height container with overflow hidden so it never dominates the view.
- Reduce the link preview to a minimal inline