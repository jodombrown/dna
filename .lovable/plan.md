

# Feed Left Sidebar Polish: Upcoming Events & Profile Card

## What's Changing

### 1. FeedUpcomingEvents — Richer, More Self-Explanatory Card

The current card is minimal: a tiny header, compact rows, and a faint hover. Here's the redesign:

- **Card header**: Add a warm amber/gold accent stripe at the top (4px, like Convene's module color `#C4942A`). Include a count badge showing number of upcoming events (e.g., "CONVENE 2").
- **Event rows**: Make the Luma-style date boxes larger (48x48 instead of 40x40) with stronger amber background. Add a subtle left border accent on hover instead of the washed-out `bg-muted/60`. Hover state uses `bg-amber-50 dark:bg-amber-950/20` for warmth.
- **Empty state**: When user has no upcoming events, show a warm invitation card: "No upcoming events — Discover what's happening" with a button linking to CONVENE hub, instead of just returning null.
- **Footer**: "View All Events" gets a chevron and slightly bolder styling.

### 2. FeedProfileCard — Less LinkedIn, More DNA

- **Remove** the generic stats pill badges ("X connections", "Y posts") — these are the most LinkedIn-ish element.
- **Replace with** a single warm tagline area below the headline, showing the user's `current_city` if available (e.g., "Based in London") — contextual and personal.
- **Saved Items**: Keep but with a warmer icon color (amber bookmark instead of gray).
- **Header band**: Keep the Kente pattern but make it slightly taller (20px instead of 16px) for more visual presence.

### 3. FeedActiveSpaces — Better Hover States

- Match the same warm hover treatment as events: `hover:bg-emerald-50 dark:hover:bg-emerald-950/20` instead of the generic `hover:bg-muted`.
- Add a Forest Green (`#2D5A3D`) accent stripe at top to match COLLABORATE module color.

### 4. Trending in DNA — Stronger Hover

- Change hover from `hover:bg-muted/60` to `hover:bg-orange-50 dark:hover:bg-orange-950/20` (copper-warm) for each trending item row.

## Technical Details

| File | Action |
|------|--------|
| `src/components/feed/FeedUpcomingEvents.tsx` | Redesign with accent stripe, larger date boxes, warm hover, empty state, count badge |
| `src/components/feed/FeedProfileCard.tsx` | Remove stats pills, add city line, warmer saved items icon, taller header |
| `src/components/feed/FeedActiveSpaces.tsx` | Warm hover states, green accent stripe |
| `src/components/feed/FeedRightSidebar.tsx` | Warmer hover on trending items |

## Design Rationale

The current hover color (`bg-muted/60`) is essentially transparent gray — it's invisible. Social platforms like Instagram, Twitter/X, and Threads all use warmer, module-colored hover states that feel intentional. Each sidebar card should immediately communicate which C-module it belongs to through its accent color, making the Five C's system tangible in the UI.
