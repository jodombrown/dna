import { useAnalytics, ConnectEventName } from './useAnalytics';

export type ConveyEventType = 
  | 'created'
  | 'published'
  | 'viewed'
  | 'cta_clicked'
  | 'feed_filtered';

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
    };
    
    const eventName = eventNameMap[eventType];
    
    const eventMetadata = {
      ...metadata,
      convey_item_id: conveyItemId,
      cta_target_type: ctaTargetType,
      cta_target_id: ctaTargetId,
    };

    await trackEvent(eventName, eventMetadata);
  };

  return { logConveyEvent };
}
