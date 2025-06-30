
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CollaborationFilters } from '@/types/collaborationTypes';

interface SearchSectionProps {
  searchQuery: string;
  onFiltersChange: (filters: Partial<CollaborationFilters>) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onFiltersChange
}) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="bg-gray-50 px-3 py-2 rounded-lg border">
        <Label htmlFor="search" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-dna-copper" />
          Search Initiatives
        </Label>
      </div>
      <div className="px-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="search"
            placeholder="Search by title, description, or skills..."
            value={searchQuery}
            onChange={(e) => onFiltersChange({ search_query: e.target.value })}
            className="pl-10 border-gray-200 focus:border-dna-copper focus:ring-dna-copper"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
