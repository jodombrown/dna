
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import { SearchFilters } from '@/types/searchTypes';

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
        onSearch={onSearch}
        onClear={onClear}
        loading={loading}
      />
    </div>
  );
};

export default SearchSidebar;
