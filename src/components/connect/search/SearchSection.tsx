import React from 'react';
import SearchInput from './SearchInput';
import AdvancedFilters from './AdvancedFilters';
import ActiveFilters from './ActiveFilters';
import SearchResultsSummary from './SearchResultsSummary';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  loading: boolean;
  filters?: {
    location: string;
    skills: string[];
    isMentor: boolean;
    isInvestor: boolean;
    lookingForOpportunities: boolean;
  };
  onFiltersChange?: (filters: any) => void;
  resultCounts?: {
    professionals: number;
    communities: number;
    events: number;
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onClearSearch,
  loading,
  filters,
  onFiltersChange,
  resultCounts,
  activeTab,
  onTabChange
}) => {
  const handleClearSearch = () => {
    onSearchChange('');
    onClearSearch();
  };

  const hasActiveFilters = filters && (
    filters.location || 
    filters.skills.length > 0 || 
    filters.isMentor || 
    filters.isInvestor || 
    filters.lookingForOpportunities
  );

  const activeFilterCount = filters ? [
    filters.location,
    ...(filters.skills || []),
    filters.isMentor && 'Mentor',
    filters.isInvestor && 'Investor',
    filters.lookingForOpportunities && 'Open to Opportunities'
  ].filter(Boolean).length : 0;

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="flex gap-4 max-w-4xl mx-auto">
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onClearSearch={handleClearSearch}
        />

        {/* Advanced Filters */}
        {filters && onFiltersChange && (
          <AdvancedFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            activeFilterCount={activeFilterCount}
          />
        )}
      </div>

      {/* Active Filters Display */}
      {filters && onFiltersChange && (
        <ActiveFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      )}

      {/* Tabs Section */}
      {activeTab && onTabChange && resultCounts && (
        <Tabs value={activeTab} onValueChange={onTabChange} className="mb-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professionals">Professionals ({resultCounts.professionals})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({resultCounts.communities})</TabsTrigger>
            <TabsTrigger value="events">Events ({resultCounts.events})</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Search Results Summary */}
      {resultCounts && !activeTab && (
        <SearchResultsSummary
          searchTerm={searchTerm}
          hasActiveFilters={!!hasActiveFilters}
          resultCounts={resultCounts}
        />
      )}
    </div>
  );
};

export default SearchSection;