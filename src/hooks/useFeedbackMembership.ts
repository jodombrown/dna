import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { feedbackService } from '@/services/feedbackService';
import { useAuth } from '@/contexts/AuthContext';
import type { FeedbackChannel, FeedbackMembership } from '@/types/feedback';
import { toast } from 'sonner';

const CHANNEL_QUERY_KEY = 'feedback-channel';
const MEMBERSHIP_QUERY_KEY = 'feedback-membership';

/**
 * Hook for managing feedback hub membership
 */
export function useFeedbackMembership() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch default channel
  const {
    data: channel,
    isLoading: isChannelLoading,
  } = useQuery({
    queryKey: [CHANNEL_QUERY_KEY],
    queryFn: () => feedbackService.getDefaultChannel(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch membership
  const {
    data: membership,
    isLoading: isMembershipLoading,
  } = useQuery({
    queryKey: [MEMBERSHIP_QUERY_KEY, user?.id, channel?.id],
    queryFn: async () => {
      if (!user?.id || !channel?.id) return null;
      // Ensure membership exists
      return feedbackService.ensureMembership(channel.id);
    },
    enabled: !!user?.id && !!channel?.id,
  });

  // Check if user is admin
  useEffect(() => {
    if (user) {
      feedbackService.isAdmin().then(setIsAdmin);
    }
  }, [user]);

  // Opt out mutation
  const optOut = useMutation({
    mutationFn: async () => {
      if (!channel?.id) throw new Error('No channel');
      const success = await feedbackService.optOut(channel.id);
      if (!success) throw new Error('Failed to opt out');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERSHIP_QUERY_KEY] });
      toast.success('You have opted out of the Feedback Hub');
    },
    onError: () => {
      toast.error('Failed to opt out. Please try again.');
    },
  });

  // Opt in mutation
  const optIn = useMutation({
    mutationFn: async () => {
      if (!channel?.id) throw new Error('No channel');
      const success = await feedbackService.optIn(channel.id);
      if (!success) throw new Error('Failed to opt in');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERSHIP_QUERY_KEY] });
      toast.success('Welcome back to the Feedback Hub!');
    },
    onError: () => {
      toast.error('Failed to opt in. Please try again.');
    },
  });

  // Update last read
  const updateLastRead = async () => {
    if (channel?.id) {
      await feedbackService.updateLastRead(channel.id);
    }
  };

  const isLoading = isChannelLoading || isMembershipLoading;
  const isOptedIn = membership?.status === 'active';
  const isOptedOut = membership?.status === 'opted_out';

  return {
    channel,
    membership,
    isLoading,
    isOptedIn,
    isOptedOut,
    isAdmin,
    optOut: optOut.mutate,
    optIn: optIn.mutate,
    isOptingOut: optOut.isPending,
    isOptingIn: optIn.isPending,
    updateLastRead,
  };
}
