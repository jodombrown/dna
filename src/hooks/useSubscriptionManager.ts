import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SubscriptionConfig {
  channelName: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
}

export const useSubscriptionManager = () => {
  const subscriptionsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  const createSubscription = useCallback((config: SubscriptionConfig) => {
    const { channelName, table, event, filter, callback } = config;
    
    // Remove existing subscription if it exists
    const existingChannel = subscriptionsRef.current.get(channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
      subscriptionsRef.current.delete(channelName);
    }

    // Create new subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          ...(filter && { filter })
        },
        callback
      )
      .subscribe();

    subscriptionsRef.current.set(channelName, channel);
    
    return channel;
  }, []);

  const createPresenceSubscription = useCallback((
    channelName: string,
    callbacks: {
      onSync?: () => void;
      onJoin?: (payload: any) => void;
      onLeave?: (payload: any) => void;
    }
  ) => {
    // Remove existing subscription if it exists
    const existingChannel = subscriptionsRef.current.get(channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
      subscriptionsRef.current.delete(channelName);
    }

    let channel = supabase.channel(channelName);

    if (callbacks.onSync) {
      channel = channel.on('presence' as any, { event: 'sync' }, callbacks.onSync);
    }
    if (callbacks.onJoin) {
      channel = channel.on('presence' as any, { event: 'join' }, callbacks.onJoin);
    }
    if (callbacks.onLeave) {
      channel = channel.on('presence' as any, { event: 'leave' }, callbacks.onLeave);
    }

    channel = channel.subscribe();
    subscriptionsRef.current.set(channelName, channel);
    
    return channel;
  }, []);

  const removeSubscription = useCallback((channelName: string) => {
    const channel = subscriptionsRef.current.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      subscriptionsRef.current.delete(channelName);
    }
  }, []);

  const removeAllSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    subscriptionsRef.current.clear();
  }, []);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      removeAllSubscriptions();
    };
  }, [removeAllSubscriptions]);

  return {
    createSubscription,
    createPresenceSubscription,
    removeSubscription,
    removeAllSubscriptions,
    activeSubscriptions: subscriptionsRef.current
  };
};