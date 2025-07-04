import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesService, Profile } from '@/services/profilesService';

export const useProfiles = (filters?: {
  location?: string;
  skills?: string[];
  profession?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => profilesService.getPublicProfiles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProfile = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => profilesService.getProfileById(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Profile> }) =>
      profilesService.updateProfile(id, updates),
    onSuccess: (data) => {
      // Invalidate and refetch profiles queries
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.setQueryData(['profile', data.id], data);
    },
  });
};