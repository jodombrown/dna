
import { profilesService } from '@/services/profilesService';

export const useProfileDataFetcher = (profile: any) => {
  const fetchProjectsAndInitiatives = async () => {
    try {
      return await profilesService.getUserProjectsAndInitiatives(profile.id);
    } catch (error) {
      console.error('Error fetching projects and initiatives:', error);
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
