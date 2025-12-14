import { useAnalytics, ConnectEventName } from './useAnalytics';
import { feedAnalytics } from '@/lib/feedAnalytics';

export type ConveyEventType = 
  | 'created'
  | 'published'
  | 'viewed'
  | 'cta_clicked'
  | 'feed_filtered'
  | 'reaction_added'
  | 'reaction_removed'
  | 'bookmarked'
  | 'unbookmarked'
  | 'shared';

export type CTATargetType = 
  | 'space'
  | 'event'
  | 'need'
  | 'contribute_needs'
  | 'profile'
  | 'external_link';

interface LogConveyEventParams {
  eventType: ConveyEventType;
  conveyItemId?: string;
  ctaTargetType?: CTATargetType;
  ctaTargetId?: string;
  metadata?: Record<string, any>;
}

export function useConveyAnalytics() {
  const { trackEvent } = useAnalytics();

  const logConveyEvent = async ({
    eventType,
    conveyItemId,
    ctaTargetType,
    ctaTargetId,
    metadata = {},
  }: LogConveyEventParams) => {
    // Map event types to proper event names
    const eventNameMap: Record<ConveyEventType, ConnectEventName> = {
      created: 'convey_item_created',
      published: 'convey_item_published',
      viewed: 'convey_item_viewed',
      cta_clicked: 'convey_item_cta_clicked',
      feed_filtered: 'convey_feed_filtered',
      // Map new events to existing event names for now
      reaction_added: 'convey_item_cta_clicked',
      reaction_removed: 'convey_item_cta_clicked',
      bookmarked: 'convey_item_cta_clicked',
      unbookmarked: 'convey_item_cta_clicked',
      shared: 'convey_item_cta_clicked',
    };
    
    const eventName = eventNameMap[eventType];
    
    const eventMetadata = {
      ...metadata,
      convey_item_id: conveyItemId,
      cta_target_type: ctaTargetType,
      cta_target_id: ctaTargetId,
      action_type: eventType, // Track the specific action
    };

    await trackEvent(eventName, eventMetadata);
  };

  // Track story engagement for ADIN
  const trackStoryEngagement = async (
    userId: string,
    storyId: string,
    action: 'view' | 'like' | 'unlike' | 'comment' | 'bookmark' | 'unbookmark' | 'reshare'
  ) => {
    await feedAnalytics[action === 'unlike' ? 'unlike' : action === 'reshare' ? 'reshare' : action]({
      userId,
      postId: storyId,
      postType: 'story',
      context: { surface: 'home', tab: 'all' },
    });
  };

  return { logConveyEvent, trackStoryEngagement };
}
