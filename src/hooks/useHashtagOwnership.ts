import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hashtagOwnershipService } from '@/services/hashtagOwnershipService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useHashtagOwnership() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's limits
  const { data: limits, isLoading: limitsLoading } = useQuery({
    queryKey: ['hashtagLimits', user?.id],
    queryFn: () => hashtagOwnershipService.getUserLimits(user!.id),
    enabled: !!user?.id,
    staleTime: 60000
  });

  // Get owned hashtags
  const { data: ownedHashtags = [], isLoading: hashtagsLoading } = useQuery({
    queryKey: ['ownedHashtags', user?.id],
    queryFn: () => hashtagOwnershipService.getOwnedHashtags(user!.id),
    enabled: !!user?.id,
    staleTime: 30000
  });

  // Get pending requests
  const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['pendingHashtagRequests', user?.id],
    queryFn: () => hashtagOwnershipService.getPendingRequests(user!.id),
    enabled: !!user?.id,
    staleTime: 30000
  });

  // Create hashtag mutation
  const createHashtagMutation = useMutation({
    mutationFn: ({ tag, description }: { tag: string; description?: string }) =>
      hashtagOwnershipService.createPersonalHashtag(user!.id, tag, description),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Personal hashtag created!');
        queryClient.invalidateQueries({ queryKey: ['ownedHashtags'] });
        queryClient.invalidateQueries({ queryKey: ['hashtagLimits'] });
      } else {
        toast.error(result.error_message || 'Failed to create hashtag');
      }
    },
    onError: () => {
      toast.error('Failed to create hashtag');
    }
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (hashtagId: string) =>
      hashtagOwnershipService.archiveHashtag(user!.id, hashtagId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Hashtag archived');
        queryClient.invalidateQueries({ queryKey: ['ownedHashtags'] });
        queryClient.invalidateQueries({ queryKey: ['hashtagLimits'] });
      } else {
        toast.error(result.error_message || 'Failed to archive');
      }
    }
  });

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: (hashtagId: string) =>
      hashtagOwnershipService.reactivateHashtag(user!.id, hashtagId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Hashtag reactivated');
        queryClient.invalidateQueries({ queryKey: ['ownedHashtags'] });
        queryClient.invalidateQueries({ queryKey: ['hashtagLimits'] });
      } else {
        toast.error(result.error_message || 'Failed to reactivate');
      }
    }
  });

  // Review request mutation
  const reviewRequestMutation = useMutation({
    mutationFn: ({ requestId, approved, note }: { requestId: string; approved: boolean; note?: string }) =>
      hashtagOwnershipService.reviewRequest(user!.id, requestId, approved, note),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(variables.approved ? 'Request approved' : 'Request denied');
        queryClient.invalidateQueries({ queryKey: ['pendingHashtagRequests'] });
        queryClient.invalidateQueries({ queryKey: ['ownedHashtags'] });
      } else {
        toast.error(result.error_message || 'Failed to review request');
      }
    }
  });

  return {
    // Data
    limits,
    ownedHashtags,
    pendingRequests,

    // Loading states
    isLoading: limitsLoading || hashtagsLoading || requestsLoading,

    // Computed
    availableSlots: limits?.available_slots || 0,
    canCreateMore: (limits?.available_slots || 0) > 0,
    activeHashtags: ownedHashtags.filter(h => h.status === 'active'),
    archivedHashtags: ownedHashtags.filter(h => h.status === 'archived'),
    pendingCount: pendingRequests.length,

    // Actions
    createHashtag: (tag: string, description?: string) =>
      createHashtagMutation.mutateAsync({ tag, description }),
    archiveHashtag: (hashtagId: string) =>
      archiveMutation.mutateAsync(hashtagId),
    reactivateHashtag: (hashtagId: string) =>
      reactivateMutation.mutateAsync(hashtagId),
    approveRequest: (requestId: string) =>
      reviewRequestMutation.mutateAsync({ requestId, approved: true }),
    denyRequest: (requestId: string, note?: string) =>
      reviewRequestMutation.mutateAsync({ requestId, approved: false, note }),

    // Mutation states
    isCreating: createHashtagMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isReactivating: reactivateMutation.isPending,
    isReviewing: reviewRequestMutation.isPending
  };
}
