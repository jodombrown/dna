
import { profilesService } from '@/services/profilesService';

export const useProfileDataFetcher = (profile: any) => {
  const fetchProjectsAndInitiatives = async () => {
    try {
      return await profilesService.getUserProjectsAndInitiatives(profile.id);
    } catch (error) {
      return {
        projects: [],
        initiatives: [],
      };
    }
  };

  return {
    fetchProjectsAndInitiatives,
  };
};
