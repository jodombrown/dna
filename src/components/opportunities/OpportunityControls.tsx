import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Grid, List } from 'lucide-react';

import { SortOption } from '@/hooks/useOpportunityFilters';

interface OpportunityControlsProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  resultCount: number;
}

const OpportunityControls: React.FC<OpportunityControlsProps> = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
}) => {
  return (
    <div className="flex items-center justify-between mb-6 bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'opportunity' : 'opportunities'}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border border-border rounded-md p-1">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityControls;
