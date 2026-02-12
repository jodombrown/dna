/**
 * DNA | FEED - Real-Time Service
 *
 * Manages Supabase real-time subscriptions for live feed updates.
 * Handles new item notifications and engagement count updates.
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { FeedType, FeedEngagement } from '@/types/feedTypes';

export interface FeedRealtimeCallbacks {
  onNewItem: (count: number) => void;
  onEngagementUpdate: (itemId: string, action: string) => void;
}

export const feedRealtimeService = {
  setupFeedSubscription(
    feedType: FeedType,
    userId: string,
    callbacks: FeedRealtimeCallbacks
  ): RealtimeChannel {
    const channel = supabase.channel(`feed-${feedType}-${userId}`);

    // New content items
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feed_items',
      },
      () => {
        callbacks.onNewItem(1);
      }
    );

    // Engagement updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feed_engagement',
      },
      (payload) => {
        const newRecord = payload.new as Record<string, unknown> | undefined;
        const oldRecord = payload.old as Record<string, unknown> | undefined;

        const record = newRecord || oldRecord;
        if (record?.feed_item_id) {
          callbacks.onEngagementUpdate(
            record.feed_item_id as string,
            (record.action as string) || ''
          );
        }
      }
    );

    channel.subscribe();
    return channel;
  },

  cleanup(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  },
};
