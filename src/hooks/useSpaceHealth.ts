import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { spaceHealthService, SpaceHealthData, SpaceNeedingAttention } from '@/services/spaceHealthService';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to get health data for a specific space
 */
export function useSpaceHealth(spaceId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['space-health', spaceId],
    queryFn: async () => {
      if (!spaceId) throw new Error('Space ID required');
      return spaceHealthService.calculateSpaceHealth(spaceId);
    },
    enabled: !!spaceId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get all spaces that need attention for the current user
 */
export function useSpacesNeedingAttention() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spaces-needing-attention', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return spaceHealthService.getSpacesNeedingAttention(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to process health nudges for the current user
 */
export function useProcessHealthNudges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return spaceHealthService.processHealthNudgesForUser(user.id);
    },
    onSuccess: (nudgesCreated) => {
      if (nudgesCreated > 0) {
        queryClient.invalidateQueries({ queryKey: ['dia-nudges'] });
      }
    },
  });
}

/**
 * Hook to archive a space
 */
export function useArchiveSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spaceId,
      summary,
      notifyMembers = true,
    }: {
      spaceId: string;
      summary?: string;
      notifyMembers?: boolean;
    }) => {
      return spaceHealthService.archiveSpace(spaceId, summary, notifyMembers);
    },
    onSuccess: (_, { spaceId }) => {
      toast({
        title: 'Space Archived',
        description: 'The space has been archived successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['space-health', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['spaces-needing-attention'] });
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to archive space',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to reactivate an archived space
 */
export function useReactivateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spaceId: string) => {
      return spaceHealthService.reactivateSpace(spaceId);
    },
    onSuccess: (_, spaceId) => {
      toast({
        title: 'Space Reactivated',
        description: 'The space has been reactivated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['space-health', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['spaces-needing-attention'] });
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reactivate space',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to mark a space as complete
 */
export function useMarkSpaceComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spaceId: string) => {
      return spaceHealthService.markSpaceComplete(spaceId);
    },
    onSuccess: (_, spaceId) => {
      toast({
        title: 'Congratulations!',
        description: 'The project has been marked as complete.',
      });
      queryClient.invalidateQueries({ queryKey: ['space-health', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['spaces-needing-attention'] });
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark space as complete',
        variant: 'destructive',
      });
    },
  });
}
