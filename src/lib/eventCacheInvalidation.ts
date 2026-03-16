/**
 * Centralized event cache invalidation
 *
 * Call this after any event delete, cancel, or status change
 * so the event disappears from every surface immediately.
 */
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
