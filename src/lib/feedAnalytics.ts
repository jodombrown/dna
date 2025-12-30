/**
 * DNA | FEED - ADIN Engagement Analytics
 * 
 * Structured event logging for feed engagement.
 * These events will be consumed by ADIN for personalization and recommendations.
 */

import { supabase } from '@/integrations/supabase/client';

export type FeedEventAction =
  | 'view'
  | 'click_through'
  | 'like'
  | 'unlike'
  | 'comment'
  | 'reshare'
  | 'bookmark'
  | 'unbookmark';

export type FeedSurface = 'home' | 'profile' | 'space' | 'event' | 'mobile' | 'bookmarks';

export interface FeedEvent {
  userId: string;
  postId: string;
  postType: string;
  linkedEntityType?: string | null;
  linkedEntityId?: string | null;
  action: FeedEventAction;
  context: {
    surface: FeedSurface;
    tab?: 'all' | 'network' | 'my_posts' | 'bookmarks';
  };
  metadata?: Record<string, any>;
}

/**
 * Track a feed engagement event
 */
export async function trackFeedEvent(event: FeedEvent) {
  try {
    const { error } = await supabase.from('feed_engagement_events').insert({
      user_id: event.userId,
      post_id: event.postId,
      post_type: event.postType,
      linked_entity_type: event.linkedEntityType || null,
      linked_entity_id: event.linkedEntityId || null,
      action: event.action,
      surface: event.context.surface,
      tab: event.context.tab || null,
      metadata: event.metadata || null,
    });

    if (error) {
      // Silently fail - analytics are non-blocking
    }
  } catch (err) {
    // Non-blocking - don't throw
  }
}

/**
 * Convenience helpers for common events
 */
export const feedAnalytics = {
  like: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'like' }),

  unlike: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'unlike' }),

  comment: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'comment' }),

  reshare: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'reshare' }),

  bookmark: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'bookmark' }),

  unbookmark: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'unbookmark' }),

  clickThrough: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'click_through' }),

  view: (event: Omit<FeedEvent, 'action'>) =>
    trackFeedEvent({ ...event, action: 'view' }),
};
