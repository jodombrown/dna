import { useQuery } from '@tanstack/react-query';
import { profilesService } from '@/services/profilesService';

export interface ProfileFilters {
  location?: string;
  skills?: string[];
  profession?: string;
  limit?: number;
}

export const usePublicProfiles = (filters?: ProfileFilters) => {
  return useQuery({
    queryKey: ['public-profiles', filters],
    queryFn: () => profilesService.getPublicProfiles(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
