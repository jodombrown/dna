
import { useState } from 'react';
import { SearchResult, SearchFilters, SearchState } from '@/types/searchTypes';
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
      const searchResults = await profileSearch.searchProfiles(filters);
      setResults(searchResults);
      setError(profileSearch.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const searchProfessionals = async (filters: SearchFilters) => {
    try {
      const searchResults = await professionalSearch.searchProfessionals(filters);
      setResults(searchResults);
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
