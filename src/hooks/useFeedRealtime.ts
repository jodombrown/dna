/**
 * DNA | FEED v2 - Real-Time Hook
 *
 * Manages Supabase real-time subscription for live feed updates.
 * Integrates with useFeed to increment new item counts.
 */

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { feedRealtimeService } from '@/services/feedRealtimeService';
import type { FeedType } from '@/types/feedTypes';

interface UseFeedRealtimeOptions {
  feedType: FeedType;
  userId: string;
  onNewItem: () => void;
  onEngagementUpdate?: (itemId: string, action: string) => void;
  enabled?: boolean;
}

export function useFeedRealtime({
  feedType,
  userId,
  onNewItem,
  onEngagementUpdate,
  enabled = true,
}: UseFeedRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    const channel = feedRealtimeService.setupFeedSubscription(feedType, userId, {
      onNewItem: () => {
        onNewItem();
      },
      onEngagementUpdate: (itemId, action) => {
        onEngagementUpdate?.(itemId, action);
      },
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        feedRealtimeService.cleanup(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [feedType, userId, enabled, onNewItem, onEngagementUpdate]);

  return {
    isSubscribed: !!channelRef.current,
  };
}
