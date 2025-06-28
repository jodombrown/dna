
import { useState } from 'react';
import { SearchResult, SearchFilters } from '@/types/searchTypes';
import { useProfileSearch } from './useProfileSearch';
import { useProfessionalSearch } from './useProfessionalSearch';

export const useAdvancedSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const profileSearch = useProfileSearch();
  const professionalSearch = useProfessionalSearch();

  const loading = profileSearch.loading || professionalSearch.loading;

  const searchProfiles = async (filters: SearchFilters) => {
    try {
      // For now, just show coming soon message
      await profileSearch.searchProfiles(''); // Pass empty string instead of filters
      setResults([]);
      setError(profileSearch.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const searchProfessionals = async (filters: SearchFilters) => {
    try {
      // For now, just show coming soon message  
      await professionalSearch.searchProfessionals(''); // Pass empty string instead of filters
      setResults([]);
      setError(professionalSearch.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    searchProfiles,
    searchProfessionals,
    clearResults
  };
};
