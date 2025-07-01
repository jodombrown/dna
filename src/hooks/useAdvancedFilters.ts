
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface BaseFilterOptions {
  searchTerm: string;
  location: string;
  skills: string[];
  interests: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ProfessionalFilters extends BaseFilterOptions {
  profession: string;
  company: string;
  experience: string;
  is_mentor: boolean;
  is_investor: boolean;
  looking_for_opportunities: boolean;
  countryOfOrigin: string;
  yearsExperience: string;
  education: string;
  languages: string[];
  availability: string[];
}

export interface CommunityFilters extends BaseFilterOptions {
  category: string;
  memberCount: string;
  isFeatured: boolean;
  activityLevel: string;
}

export interface EventFilters extends BaseFilterOptions {
  eventType: string;
  dateRange: string;
  isVirtual: boolean;
  attendeeCount: string;
  price: string;
  organizer: string;
}

export interface ContributionFilters extends BaseFilterOptions {
  contributionType: string;
  impactArea: string;
  region: string;
  urgency: string;
  timeCommitment: string;
  amountRange: string;
  status: string;
}

export const useAdvancedFilters = <T extends BaseFilterOptions>(
  initialFilters: T,
  data: any[],
  filterFunction: (items: any[], filters: T) => any[]
) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<T>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState<T>(initialFilters);

  // Debounce filter changes to avoid excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Apply filters with loading state
  const filteredData = useMemo(() => {
    setLoading(true);
    const result = filterFunction(data, debouncedFilters);
    setLoading(false);
    return result;
  }, [data, debouncedFilters, filterFunction]);

  // Update single filter
  const updateFilter = (key: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Update multiple filters at once
  const updateFilters = (newFilters: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(initialFilters);
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset to default values",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== '' && value !== initialFilters[key as keyof T];
    });
  }, [filters, initialFilters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== '' && value !== initialFilters[key as keyof T];
    }).length;
  }, [filters, initialFilters]);

  return {
    filters,
    filteredData,
    loading,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  };
};
