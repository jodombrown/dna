
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { SearchFilters } from '@/types/searchTypes';
import { SearchFilters as AdvancedSearchFilters } from '@/components/search/AdvancedSearch';

interface SearchSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading: boolean;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({
  activeTab,
  setActiveTab,
  onSearch,
  onClear,
  loading
}) => {
  return (
    <div className="lg:col-span-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="professionals">Professionals</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <AdvancedSearch
        onSearch={(filters: AdvancedSearchFilters) => {
          // Convert advanced search filters to basic search filters
          const basicFilters: SearchFilters = {
            searchTerm: filters.query,
            profession: filters.industry,
            location: filters.location,
            skills: filters.skills,
            experience: filters.experience.join('-'),
            isMentor: filters.mentorshipAreas.length > 0,
            isInvestor: filters.investorType !== '',
            lookingForOpportunities: filters.availability.includes('opportunities'),
            countryOfOrigin: filters.location
          };
          onSearch(basicFilters);
        }}
      />
    </div>
  );
};

export default SearchSidebar;
