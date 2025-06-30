
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  const filterSections = [
    {
      title: "Impact Areas",
      icon: filterIcons.Target,
      options: impactAreas,
      selectedValues: filters.impact_area,
      filterKey: 'impact_area' as keyof CollaborationFilters
    },
    {
      title: "African Regions",
      icon: filterIcons.MapPin,
      options: regions,
      selectedValues: filters.region,
      filterKey: 'region' as keyof CollaborationFilters
    },
    {
      title: "Ways to Contribute",
      icon: filterIcons.Users,
      options: contributionTypes,
      selectedValues: filters.contribution_types,
      filterKey: 'contribution_types' as keyof CollaborationFilters
    },
    {
      title: "Time Commitment",
      icon: filterIcons.Clock,
      options: timeCommitments,
      selectedValues: filters.time_commitment,
      filterKey: 'time_commitment' as keyof CollaborationFilters
    },
    {
      title: "Priority Level",
      icon: filterIcons.AlertCircle,
      options: urgencyLevels,
      selectedValues: filters.urgency,
      filterKey: 'urgency' as keyof CollaborationFilters
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <FilterHeader
        hasActiveFilters={hasActiveFilters}
        resultCount={resultCount}
        onClearFilters={onClearFilters}
      />

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 pb-4">
          <SearchSection
            searchQuery={filters.search_query}
            onFiltersChange={onFiltersChange}
          />

          {filterSections.map((section, index) => (
            <FilterSection
              key={section.title}
              title={section.title}
              icon={section.icon}
              options={section.options}
              selectedValues={section.selectedValues}
              onSelectionChange={(value, checked) =>
                handleCheckboxChange(section.filterKey, value, checked)
              }
              isLast={index === filterSections.length - 1}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CollaborationFiltersComponent;
