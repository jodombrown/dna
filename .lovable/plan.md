

## Problem

When an event is deleted, it disappears from some surfaces but lingers on others because cache invalidation is inconsistent across the three deletion paths:

| Deletion location | Cache keys invalidated |
|---|---|
| `EventSettingsPage` (management) | `events`, `events-index`, `convene-featured-events`, `convene-category-counts`, `event-recommendations` — **best coverage** |
| `EventDetail` page | `events` only — **missing 6+ keys** |
| `FeedEventCard` (activity feed) | `activities`, `events` only — **missing 6+ keys** |

Additionally, none of them invalidate `happening-now-events`, `feed-happening-now`, `feed-upcoming-events`, `organizer-event-count`, `profile-events`, or `event-details-feed`. So deleted events can still appear in the Convene hero, discovery lanes, feed widgets, profile sections, and map pins until their caches expire naturally (up to 5 minutes).

## Solution

1. **Create a shared `invalidateAllEventCaches` helper** that exhaustively invalidates every event-related query key in one call. This prevents future drift when new surfaces are added.

2. **Use it in all three deletion paths** — `EventDetail.tsx`, `FeedEventCard.tsx`, and `EventSettingsPage.tsx` — replacing the ad-hoc invalidation lists.

3. **Also use it in the cancel-event mutation** in `EventDetail.tsx`, since cancelled events should also vanish from discovery/upcoming surfaces.

## Technical details

**New helper** — `src/lib/eventCacheInvalidation.ts`:
```ts
import { QueryClient } from '@tanstack/react-query';

export function invalidateAllEventCaches(queryClient: QueryClient, eventId?: string) {
  // Core event lists
  queryClient.invalidateQueries({ queryKey: ['events'] });
  queryClient.invalidateQueries({ queryKey: ['events-index'] });
  
  // Convene discovery
  queryClient.invalidateQueries({ queryKey: ['convene-featured-events'] });
  queryClient.invalidateQueries({ queryKey: ['convene-category-counts'] });
  queryClient.invalidateQueries({ queryKey: ['event-recommendations'] });
  queryClient.invalidateQueries({ queryKey: ['happening-now-events'] });
  
  // Feed widgets
  queryClient.invalidateQueries({ queryKey: ['feed-happening-now'] });
  queryClient.invalidateQueries({ queryKey: ['feed-upcoming-events'] });
  queryClient.invalidateQueries({ queryKey: ['activities'] });
  
  // Profile sections
  queryClient.invalidateQueries({ queryKey: ['profile-events'] });
  queryClient.invalidateQueries({ queryKey: ['organizer-event-count'] });
  
  // Specific event detail (if id provided)
  if (eventId) {
    queryClient.invalidateQueries({ queryKey: ['event-detail', eventId] });
    queryClient.invalidateQueries({ queryKey: ['event-details-feed', eventId] });
  }
}
```

**Files to update:**
- `src/pages/dna/convene/EventDetail.tsx` — replace delete + cancel `onSuccess` invalidation with `invalidateAllEventCaches(queryClient, id)`
- `src/components/feed/activity-cards/FeedEventCard.tsx` — replace delete `onSuccess` invalidation with `invalidateAllEventCaches(queryClient, eventData.event_id)`
- `src/components/convene/management/settings/EventSettingsPage.tsx` — replace delete `onSuccess` invalidation with `invalidateAllEventCaches(queryClient, event.id)`

This ensures that when an organizer deletes or cancels an event from any surface, it immediately vanishes from every place it could appear: discovery hub, feed widgets, profile cards, map, and detail pages.

