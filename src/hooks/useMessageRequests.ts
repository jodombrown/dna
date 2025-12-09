import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { MessageRequest } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast';

/**
 * useMessageRequests - Hook for managing message requests
 *
 * Implements PRD requirements:
 * - Message Request queue for non-connected users
 * - Limited Preview: Show first 100-150 characters only
 * - Silent Decline: Sender not notified if declined
 * - Real-time updates when new requests arrive
 */
export function useMessageRequests(limit: number = 50) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  // Query for message requests
  const query = useQuery<MessageRequest[]>({
    queryKey: ['messageRequests', user?.id],
    queryFn: () => messageService.getMessageRequests(limit),
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Subscribe to real-time request updates
  useEffect(() => {
    if (!user) return;

    subscriptionRef.current = messageService.subscribeToMessageRequests(
      user.id,
      () => {
        // Invalidate query when new request arrives
        queryClient.invalidateQueries({ queryKey: ['messageRequests'] });
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [user, queryClient]);

  return {
    requests: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    requestCount: query.data?.length || 0,
  };
}

/**
 * useAcceptMessageRequest - Mutation hook for accepting requests
 */
export function useAcceptMessageRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messageService.acceptMessageRequest(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageRequests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({ title: 'Message request accepted' });
    },
    onError: () => {
      toast({ title: 'Failed to accept request', variant: 'destructive' });
    },
  });
}

/**
 * useDeclineMessageRequest - Mutation hook for declining requests
 */
export function useDeclineMessageRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messageService.declineMessageRequest(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageRequests'] });
      // Silent decline - no toast shown per PRD
    },
    onError: () => {
      toast({ title: 'Failed to decline request', variant: 'destructive' });
    },
  });
}

/**
 * useMessageRequestCount - Simple hook to get unread request count
 */
export function useMessageRequestCount() {
  const { requestCount, isLoading } = useMessageRequests();
  return { count: requestCount, isLoading };
}
