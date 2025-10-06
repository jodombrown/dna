import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OpportunityFilters, Opportunity } from '@/types/opportunityTypes';

const defaultFilters: OpportunityFilters = {
  search: '',
  tags: [],
  regions: [],
  type: [],
};

export const useOpportunityFilters = () => {
  const [filters, setFilters] = useState<OpportunityFilters>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities', filters, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          creator:profiles!opportunities_created_by_fkey(
            id,
            full_name,
            username,
            avatar_url,
            verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Search filter
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      // Tags filter (impact areas, contribution types, etc.)
      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Type filter
      if (filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      // Regions filter (by location)
      if (filters.regions.length > 0) {
        const locationFilters = filters.regions
          .map(r => `location.ilike.%${r}%`)
          .join(',');
        if (locationFilters) {
          query = query.or(locationFilters);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }

      return data || [];
    },
  });

  const updateFilters = (key: keyof OpportunityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.tags.length > 0 ||
      filters.regions.length > 0 ||
      filters.type.length > 0
    );
  };

  return {
    filters,
    opportunities,
    isLoading,
    updateFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    resultCount: opportunities.length,
  };
};
