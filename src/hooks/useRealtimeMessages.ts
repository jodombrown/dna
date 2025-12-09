import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';

/**
 * useRealtimeMessages - Hook for fetching and subscribing to realtime message updates
 * 
 * Features:
 * - Fetches initial messages via React Query
 * - Subscribes to realtime message inserts
 * - Auto-invalidates queries on new messages
 * - Handles cleanup on unmount
 * 
 * @param conversationId - The conversation ID to subscribe to
 * @returns React Query result with messages data
 */
export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  // Fetch messages with React Query
  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages_new',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}
