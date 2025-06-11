
import { useState } from 'react';
import { SearchResult, SearchFilters } from '@/types/searchTypes';
import { buildProfessionalQuery, filterByExperience } from '@/services/searchService';

export const useProfessionalSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfessionals = async (filters: SearchFilters): Promise<SearchResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const query = buildProfessionalQuery(filters);
      const { data, error } = await query;

      if (error) throw error;

      // Filter by experience
      let filteredData = filterByExperience(data || [], filters.experience);

      // Map to SearchResult format
      const searchResults: SearchResult[] = filteredData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        skills: profile.expertise,
        is_mentor: profile.is_mentor,
        is_investor: profile.is_investor,
        looking_for_opportunities: profile.looking_for_opportunities,
        years_experience: profile.years_experience,
        country_of_origin: profile.country_of_origin
      }));

      return searchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Professional search failed';
      setError(errorMessage);
      console.error('Professional search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    searchProfessionals,
    loading,
    error
  };
};
