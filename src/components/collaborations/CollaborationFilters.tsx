
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CollaborationFilters } from '@/types/collaborationTypes';
import FilterHeader from './filters/FilterHeader';
import SearchSection from './filters/SearchSection';
import FilterSection from './filters/FilterSection';
import { 
  impactAreas, 
  regions, 
  contributionTypes, 
  timeCommitments, 
  urgencyLevels,
  filterIcons 
} from './filters/filterData';

interface CollaborationFiltersProps {
  filters: CollaborationFilters;
  onFiltersChange: (filters: Partial<CollaborationFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

const CollaborationFiltersComponent: React.FC<CollaborationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  resultCount
}) => {
  const handleCheckboxChange = (
    filterKey: keyof CollaborationFilters,
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({ [filterKey]: newArray });
  };

  return (
    <div className="space-y-4">
      <Card>
        <FilterHeader
          hasActiveFilters={hasActiveFilters}
          resultCount={resultCount}
          onClearFilters={onClearFilters}
        />

        <CardContent className="space-y-4 p-4">
          <SearchSection
            searchQuery={filters.search_query}
            onFiltersChange={onFiltersChange}
          />

          <FilterSection
            title="Impact Areas"
            icon={filterIcons.Target}
            options={impactAreas}
            selectedValues={filters.impact_area}
            onSelectionChange={(value, checked) =>
              handleCheckboxChange('impact_area', value, checked)
            }
          />

          <FilterSection
            title="African Regions"
            icon={filterIcons.MapPin}
            options={regions}
            selectedValues={filters.region}
            onSelectionChange={(value, checked) =>
              handleCheckboxChange('region', value, checked)
            }
          />

          <FilterSection
            title="How You Can Contribute"
            icon={filterIcons.Users}
            options={contributionTypes}
            selectedValues={filters.contribution_types}
            onSelectionChange={(value, checked) =>
              handleCheckboxChange('contribution_types', value, checked)
            }
          />

          <FilterSection
            title="Time Commitment"
            icon={filterIcons.Clock}
            options={timeCommitments}
            selectedValues={filters.time_commitment}
            onSelectionChange={(value, checked) =>
              handleCheckboxChange('time_commitment', value, checked)
            }
          />

          <FilterSection
            title="Priority Level"
            icon={filterIcons.AlertCircle}
            options={urgencyLevels}
            selectedValues={filters.urgency}
            onSelectionChange={(value, checked) =>
              handleCheckboxChange('urgency', value, checked)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationFiltersComponent;
