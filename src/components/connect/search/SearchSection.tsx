import React from 'react';
import SearchInput from './SearchInput';
import AdvancedFilters from './AdvancedFilters';
import ActiveFilters from './ActiveFilters';
import SearchResultsSummary from './SearchResultsSummary';

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
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onClearSearch,
  loading,
  filters,
  onFiltersChange,
  resultCounts
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
    <div className="mb-8 space-y-4">
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

      {/* Search Results Summary */}
      {resultCounts && (
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