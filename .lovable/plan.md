

# Add Tab Explainer to Convene (Matching Feed & Connect Pattern)

## What Already Exists
- **Feed** has `FeedTabExplainer` — shows animated explainer on first tab click per day
- **Connect** has `ConnectTabExplainer` — identical pattern, already wired into `ConnectLayout`
- **Convene** has nothing — needs a new `ConveneTabExplainer` component

## Plan

### 1. Create `src/components/convene/ConveneTabExplainer.tsx`
Clone the exact same pattern from `ConnectTabExplainer` with Convene-specific tabs and descriptions:

| Tab | Title | Description | Icon | Gradient |
|-----|-------|-------------|------|----------|
| `all` | All Events | Browse every upcoming event across the diaspora community | `CalendarDays` | primary gradient |
| `near_me` | Near Me | Events happening close to your current location | `MapPin` | emerald gradient |
| `this_week` | This Week | Events taking place within the next seven days | `Clock` | copper/gold gradient |
| `online` | Online | Virtual events you can join from anywhere in the world | `Globe` | terracotta gradient |
| `free` | Free Events | No-cost events open to all community members | `Ticket` | ochre gradient |
| `network` | My Network | Events hosted by or attended by people in your network | `Users` | emerald gradient |

- Storage key prefix: `dna_convene_explainer_`
- Same animation, timing (10s display), and session-aware logic

### 2. Wire into `ConveneDiscovery.tsx`
- Import `ConveneTabExplainer`
- Render `<ConveneTabExplainer activeTab={activePill} />` immediately after the header padding area (inside the content container, before the first content section) on mobile only
- Wrap in `px-3` for proper horizontal alignment with content

### Scope
- 1 new file, 1 small edit to `ConveneDiscovery.tsx`
- No prop changes needed — `activePill` is already a string matching