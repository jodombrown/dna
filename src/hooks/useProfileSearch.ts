
import { useState } from 'react';
import { SearchResult, SearchFilters } from '@/types/searchTypes';
import { buildProfileQuery, filterByExperience } from '@/services/searchService';

export const useProfileSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfiles = async (filters: SearchFilters): Promise<SearchResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const query = buildProfileQuery(filters);
      const { data, error } = await query;

      if (error) throw error;

      // Filter by boolean fields and experience
      let filteredData = data || [];

      if (filters.isMentor) {
        filteredData = filteredData.filter(profile => 
          profile.mentorship_areas && profile.mentorship_areas.length > 0
        );
      }

      filteredData = filterByExperience(filteredData, filters.experience);

      // Map to SearchResult format
      const searchResults: SearchResult[] = filteredData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown',
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        skills: profile.skills,
        is_mentor: profile.mentorship_areas && profile.mentorship_areas.length > 0,
        is_investor: false,
        looking_for_opportunities: false,
        years_experience: profile.years_in_diaspora,
        country_of_origin: undefined
      }));

      return searchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile search failed';
      setError(errorMessage);
      console.error('Profile search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    searchProfiles,
    loading,
    error
  };
};
