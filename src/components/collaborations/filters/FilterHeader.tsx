
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  resultCount: number;
  onClearFilters: () => void;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  hasActiveFilters,
  resultCount,
  onClearFilters
}) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="w-5 h-5" />
          Discover Initiatives
        </CardTitle>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-medium">
          {resultCount} initiative{resultCount !== 1 ? 's' : ''}
        </Badge>
        {hasActiveFilters && (
          <Badge variant="outline" className="text-dna-copper">
            Filtered
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};

export default FilterHeader;
