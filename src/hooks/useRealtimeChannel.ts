import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeChannelOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table?: string;
  filter?: string;
}

interface UseRealtimeChannelProps {
  channelName: string;
  options: RealtimeChannelOptions;
  onData?: (payload: any) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

export function useRealtimeChannel({
  channelName,
  options,
  onData,
  onError,
  enabled = true
}: UseRealtimeChannelProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleChange = useCallback((payload: any) => {
    try {
      console.log(`[${channelName}] Change received:`, payload);
      onData?.(payload);
    } catch (err) {
      console.error(`[${channelName}] Error handling change:`, err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    }
  }, [channelName, onData, onError]);

  useEffect(() => {
    // Don't subscribe if disabled or no user when user-specific
    if (!enabled || (channelName.includes('{userId}') && !user?.id)) {
      return;
    }

    // Replace user placeholders in channel name
    const finalChannelName = channelName.replace('{userId}', user?.id || '');
    
    console.log(`[${finalChannelName}] Setting up realtime subscription`);
    
    const channel = supabase
      .channel(finalChannelName)
      .on(
        'postgres_changes' as any,
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: options.table || '',
          filter: options.filter || ''
        },
        handleChange
      )
      .subscribe((status: string) => {
        console.log(`[${finalChannelName}] Subscription status:`, status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to channel: ${finalChannelName}`);
          setError(error);
          onError?.(error);
        } else {
          setError(null);
        }
      });

    return () => {
      console.log(`[${finalChannelName}] Cleaning up subscription`);
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [channelName, user?.id, enabled, options.event, options.schema, options.table, options.filter, handleChange, onError]);

  return {
    isConnected,
    error,
    channelName: channelName.replace('{userId}', user?.id || '')
  };
}

// Convenience hooks for common use cases
export function useRealtimeTable(
  tableName: string,
  onData?: (payload: any) => void,
  options: Partial<UseRealtimeChannelProps> = {}
) {
  return useRealtimeChannel({
    channelName: `table-${tableName}`,
    options: {
      schema: 'public',
      table: tableName,
      event: '*'
    },
    onData,
    ...options
  });
}

export function useRealtimeUserTable(
  tableName: string,
  onData?: (payload: any) => void,
  options: Partial<UseRealtimeChannelProps> = {}
) {
  const { user } = useAuth();
  
  return useRealtimeChannel({
    channelName: `user-${tableName}-{userId}`,
    options: {
      schema: 'public',
      table: tableName,
      event: '*',
      filter: `user_id=eq.${user?.id}`
    },
    onData,
    enabled: !!user?.id,
    ...options
  });
}