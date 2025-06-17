
import { useState } from 'react';
import { SearchResult, SearchFilters } from '@/types/searchTypes';
import { useProfessionalSearch } from './useProfessionalSearch';

export const useAdvancedSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const professionalSearch = useProfessionalSearch();

  const loading = professionalSearch.loading;

  const searchProfiles = async (filters: SearchFilters) => {
    try {
      // For now, just return empty results since profiles table is removed
      setResults([]);
      setError(null);
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
