

# Fix: Bulletproof Text Legibility on All Event Cards

## The Problem
The gradient overlay on event cards with text over images is too weak. On bright or busy images (like the circled "pan fest" example), the title, category, date, and location text become nearly unreadable.

## The Fix — Three Components Need Stronger Overlays

### 1. `ConveneHeroEvent.tsx` (the featured hero card)
**Current overlay:** `from-black/70 via-black/30 to-transparent`
**New overlay:** A two-layer approach:
- Base layer: `from-black/80 via-black/40 to-black/10` — ensures even the top of the image has a slight tint so badges remain legible
- The bottom text zone gets extra protection with a second gradient layer concentrated on the lower 50%

### 2. `ConveneEventCard.tsx` (full variant — the regular discovery card)
**Current overlay:** `from-black/50 via-transparent to-transparent` — far too weak
**New overlay:** Match the hero approach with `from-black/70 via-black/25 to-black/5`
- This card doesn't have text directly on images (text is below), so a lighter treatment works, but the category/urgency chips on the image still need a readable background

### 3. `CuratedEventCard.tsx` (curated events — if it has image overlay text)
- Review and apply same pattern if text sits on images

## Design Approach
- **Two-layer gradient**: A full-card subtle tint (black/5 to black/10) plus a heavier bottom gradient (black/75-80) where text lives
- **Text shadow as insurance**: Add `text-shadow` via inline style or utility class on all white text over images — `0 1px 3px rgba(0,0,0,0.6)` — this guarantees legibility even if the gradient somehow doesn't cover enough
- **Badge backdrop-blur**: Ensure all chips/badges on images use `backdrop-blur-sm` with adequate `bg-black/40` or `bg-black/50`

## Specific Changes

| File | Change |
|------|--------|
| `ConveneHeroEvent.tsx` | Strengthen gradient to `from-black/80 via-black/45 to-black/10`, add `style={{ textShadow }}` on title + meta text |
| `ConveneEventCard.tsx` | Strengthen gradient to `from-black/70 via-black/25 to-black/5`, ensure category chip has `bg-black/50 backdrop-blur-sm` |
| `CuratedEventCard.tsx` | Apply same overlay pattern if images carry text |

No layout changes. No new components. Pure legibility fix across all image-bearing event cards.

