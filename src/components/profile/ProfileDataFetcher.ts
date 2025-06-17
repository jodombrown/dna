
import { supabase } from '@/integrations/supabase/client';

export const useProfileDataFetcher = (profile: any) => {
  const fetchProjectsAndInitiatives = async () => {
    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Fetch initiatives
      const { data: initiativesData } = await supabase
        .from('initiatives')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false });

      return {
        projects: projectsData || [],
        initiatives: initiativesData || [],
      };
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
