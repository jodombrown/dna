import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adinService, AdinProfile } from '@/services/adinService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAdinProfile = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const {
    data: adinProfile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['adin-profile', targetUserId],
    queryFn: () => adinService.getAdinProfile(targetUserId!),
    enabled: !!targetUserId,
  });

  const {
    data: contributions,
    isLoading: contributionsLoading
  } = useQuery({
    queryKey: ['user-contributions', targetUserId],
    queryFn: () => adinService.getUserContributions(targetUserId!),
    enabled: !!targetUserId,
  });

  const {
    data: impactLogs,
    isLoading: impactLogsLoading
  } = useQuery({
    queryKey: ['impact-logs', targetUserId],
    queryFn: () => adinService.getImpactLogs(targetUserId!),
    enabled: !!targetUserId,
  });

  const {
    data: signals,
    isLoading: signalsLoading
  } = useQuery({
    queryKey: ['adin-signals', targetUserId],
    queryFn: () => adinService.getAdinSignals(targetUserId!),
    enabled: !!targetUserId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<AdinProfile>) => 
      adinService.upsertAdinProfile(targetUserId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adin-profile', targetUserId] });
      toast({
        title: "Profile Updated",
        description: "Your ADIN profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markSignalSeenMutation = useMutation({
    mutationFn: adinService.markSignalSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adin-signals', targetUserId] });
    },
  });

  return {
    adinProfile,
    contributions,
    impactLogs,
    signals,
    isLoading,
    contributionsLoading,
    impactLogsLoading,
    signalsLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    markSignalSeen: markSignalSeenMutation.mutate,
  };
};