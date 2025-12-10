/**
 * useMessageRequests - Hooks for message request management
 *
 * Uses the database RPCs:
 * - get_message_requests(p_user_id, p_limit, p_offset) - Get pending requests
 * - respond_to_message_request(p_conversation_id, p_user_id, p_accept) - Accept/decline
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageRequest } from '@/types/messaging';

/**
 * Hook to fetch pending message requests
 */
export function useMessageRequests(limit: number = 50) {
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['message-requests', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_message_requests', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: 0,
      });

      if (error) {
        console.error('Error fetching message requests:', error);
        throw error;
      }

      return (data || []) as MessageRequest[];
    },
    enabled: !!user,
    staleTime: 30000, // Consider stale after 30 seconds
  });

  return {
    requests: data || [],
    isLoading,
    isError,
    error,
    refetch,
    requestCount: data?.length || 0,
  };
}

/**
 * Hook to accept a message request
 */
export function useAcceptMessageRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('respond_to_message_request', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
        p_accept: true,
      });

      if (error) {
        console.error('Error accepting message request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

/**
 * Hook to decline a message request
 */
export function useDeclineMessageRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('respond_to_message_request', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
        p_accept: false,
      });

      if (error) {
        console.error('Error declining message request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

/**
 * Hook to get the count of pending message requests
 */
export function useMessageRequestCount() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['message-requests-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase.rpc('get_message_requests', {
        p_user_id: user.id,
        p_limit: 100,
        p_offset: 0,
      });

      if (error) {
        console.error('Error fetching message request count:', error);
        return 0;
      }

      return data?.length || 0;
    },
    enabled: !!user,
    staleTime: 30000,
  });

  return {
    count: data || 0,
    isLoading,
  };
}
