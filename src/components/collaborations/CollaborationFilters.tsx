
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollaborationFilters } from '@/types/collaborationTypes';
import DynamicFilterPanel, { FilterSection } from '@/components/filters/DynamicFilterPanel';

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
  const filterSections: FilterSection[] = [
    {
      key: 'search_query',
      title: 'Search Projects',
      type: 'text',
      placeholder: 'Search by title, description, or keywords...',
      defaultOpen: true
    },
    {
      key: 'impact_area',
      title: 'Impact Areas',
      type: 'tags',
      defaultOpen: true,
      options: [
        { value: 'Education', label: 'Education', icon: '🎓', count: 34 },
        { value: 'Healthcare', label: 'Healthcare', icon: '🏥', count: 28 },
        { value: 'Agriculture', label: 'Agriculture', icon: '🌾', count: 22 },
        { value: 'Technology', label: 'Technology', icon: '💻', count: 45 },
        { value: 'Energy', label: 'Clean Energy', icon: '⚡', count: 18 },
        { value: 'Finance', label: 'Financial Inclusion', icon: '💰', count: 16 },
        { value: 'Environment', label: 'Environment', icon: '🌍', count: 25 },
        { value: 'Arts', label: 'Arts & Culture', icon: '🎨', count: 12 }
      ]
    },
    {
      key: 'region',
      title: 'African Regions',
      type: 'tags',
      defaultOpen: false,
      options: [
        { value: 'West Africa', label: 'West Africa', flag: '🌍', count: 89 },
        { value: 'East Africa', label: 'East Africa', flag: '🌍', count: 67 },
        { value: 'North Africa', label: 'North Africa', flag: '🌍', count: 34 },
        { value: 'Central Africa', label: 'Central Africa', flag: '🌍', count: 23 },
        { value: 'Southern Africa', label: 'Southern Africa', flag: '🌍', count: 45 }
      ]
    },
    {
      key: 'contribution_types',
      title: 'Ways to Contribute',
      type: 'tags',
      defaultOpen: false,
      options: [
        { value: 'Funding', label: 'Funding', icon: '💰', count: 56 },
        { value: 'Skills', label: 'Skills & Expertise', icon: '🛠️', count: 78 },
        { value: 'Mentorship', label: 'Mentorship', icon: '🎯', count: 45 },
        { value: 'Networking', label: 'Networking', icon: '🤝', count: 67 },
        { value: 'Resources', label: 'Resources', icon: '📚', count: 34 },
        { value: 'Advocacy', label: 'Advocacy', icon: '📢', count: 23 }
      ]
    },
    {
      key: 'time_commitment',
      title: 'Time Commitment',
      type: 'select',
      options: [
        { value: 'Flexible', label: 'Flexible Schedule', count: 89 },
        { value: '1-5 hours/week', label: '1-5 hours per week', count: 67 },
        { value: '6-10 hours/week', label: '6-10 hours per week', count: 34 },
        { value: '11-20 hours/week', label: '11-20 hours per week', count: 23 },
        { value: 'Full-time', label: 'Full-time commitment', count: 12 }
      ]
    },
    {
      key: 'urgency',
      title: 'Priority Level',
      type: 'select',
      options: [
        { value: 'High', label: 'High Priority', icon: '🔴', count: 23 },
        { value: 'Medium', label: 'Medium Priority', icon: '🟡', count: 45 },
        { value: 'Low', label: 'Low Priority', icon: '🟢', count: 67 }
      ]
    }
  ];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search_query') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== '';
  }).length;

  return (
    <div className="h-full">
      <DynamicFilterPanel
        sections={filterSections}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        resultCount={resultCount}
        className="h-full"
      />
    </div>
  );
};

export default CollaborationFiltersComponent;
