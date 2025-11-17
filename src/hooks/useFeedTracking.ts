/**
 * DNA | FEED v1.1 - ADIN Event Tracking
 * 
 * Centralized hook for tracking feed engagement events.
 * All feed interactions flow through here for future ADIN analysis.
 */

import { useAnalytics } from './useAnalytics';

export type FeedEventAction =
  | 'view'
  | 'click_through'
  | 'like'
  | 'unlike'
  | 'comment'
  | 'reshare'
  | 'bookmark'
  | 'unbookmark';

export type FeedSurface = 'home' | 'profile' | 'space' | 'event' | 'mobile';
export type FeedTabType = 'all' | 'network' | 'my_posts' | 'bookmarks';

export interface FeedTrackingEvent {
  postId: string;
  postType: string;
  linkedEntityType?: string | null;
  linkedEntityId?: string | null;
  action: FeedEventAction;
  surface: FeedSurface;
  tab?: FeedTabType;
  metadata?: Record<string, any>;
}

export function useFeedTracking() {
  const { trackEvent } = useAnalytics();

  const trackFeedEvent = async (event: FeedTrackingEvent) => {
    try {
      await trackEvent('convey_item_viewed' as any, {
        feed_event_action: event.action,
        post_id: event.postId,
        post_type: event.postType,
        linked_entity_type: event.linkedEntityType,
        linked_entity_id: event.linkedEntityId,
        surface: event.surface,
        tab: event.tab,
        ...event.metadata,
      });
    } catch (error) {
      // Fail silently - don't break UX for analytics
      console.warn('[Feed Tracking]', error);
    }
  };

  return { trackFeedEvent };
}
