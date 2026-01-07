import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { feedbackService } from '@/services/feedbackService';
import type { FeedbackFilter, FeedbackMessage, SendMessageParams, FeedbackEmoji } from '@/types/feedback';
import { toast } from 'sonner';

const MESSAGES_QUERY_KEY = 'feedback-messages';

/**
 * Hook for fetching and managing feedback messages
 * @param channelId - The channel ID to fetch messages from
 * @param filter - Filter for messages
 * @param isReady - Whether the membership is ready (must be true before fetching)
 */
export function useFeedbackMessages(
  channelId: string | null, 
  filter: FeedbackFilter = 'all',
  isReady: boolean = true
) {
  const queryClient = useQueryClient();

  // Infinite query for paginated messages
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [MESSAGES_QUERY_KEY, channelId, filter],
    queryFn: async ({ pageParam }) => {
      if (!channelId) return { messages: [], nextCursor: null, hasMore: false };
      return feedbackService.getMessages(channelId, {
        cursor: pageParam,
        filter,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!channelId && isReady,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Flatten all pages into a single array
  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  // Subscribe to real-time updates - only when ready
  useEffect(() => {
    if (!channelId || !isReady) return;

    const newMsgChannel = feedbackService.subscribeToMessages(channelId, () => {
      // Refetch to get the new message with sender info
      queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, channelId] });
    });

    const updateChannel = feedbackService.subscribeToMessageUpdates(channelId, () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, channelId] });
    });

    return () => {
      feedbackService.unsubscribe(newMsgChannel);
      feedbackService.unsubscribe(updateChannel);
    };
  }, [channelId, isReady, queryClient]);

  return {
    messages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}

/**
 * Hook for sending feedback messages
 */
export function useSendFeedbackMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      const message = await feedbackService.sendMessage(params);
      if (!message) throw new Error('Failed to send message');
      return message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, variables.channelId] });
      toast.success('Feedback sent!');
    },
    onError: () => {
      toast.error('Failed to send feedback. Please try again.');
    },
  });
}

/**
 * Hook for managing reactions
 */
export function useFeedbackReactions(messageId: string, channelId: string) {
  const queryClient = useQueryClient();

  const addReaction = useMutation({
    mutationFn: async (emoji: FeedbackEmoji) => {
      const success = await feedbackService.addReaction(messageId, emoji);
      if (!success) throw new Error('Failed to add reaction');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, channelId] });
    },
  });

  const removeReaction = useMutation({
    mutationFn: async (emoji: FeedbackEmoji) => {
      const success = await feedbackService.removeReaction(messageId, emoji);
      if (!success) throw new Error('Failed to remove reaction');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, channelId] });
    },
  });

  const toggleReaction = async (emoji: FeedbackEmoji, isReacted: boolean) => {
    if (isReacted) {
      await removeReaction.mutateAsync(emoji);
    } else {
      await addReaction.mutateAsync(emoji);
    }
  };

  return {
    addReaction,
    removeReaction,
    toggleReaction,
    isPending: addReaction.isPending || removeReaction.isPending,
  };
}

/**
 * Hook for thread replies
 */
export function useFeedbackThread(parentMessageId: string | null) {
  return useQuery({
    queryKey: ['feedback-thread', parentMessageId],
    queryFn: async () => {
      if (!parentMessageId) return [];
      return feedbackService.getThread(parentMessageId);
    },
    enabled: !!parentMessageId,
  });
}
