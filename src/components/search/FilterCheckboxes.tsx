
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SearchFilters } from '@/types/searchTypes';

interface FilterCheckboxesProps {
  filters: SearchFilters;
  onCheckboxChange: (name: string, checked: boolean) => void;
}

const FilterCheckboxes: React.FC<FilterCheckboxesProps> = ({ filters, onCheckboxChange }) => {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isMentor"
          name="isMentor"
          checked={filters.isMentor}
          onCheckedChange={(checked) => onCheckboxChange('isMentor', !!checked)}
        />
        <Label htmlFor="isMentor">Is Mentor</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isInvestor"
          name="isInvestor"
          checked={filters.isInvestor}
          onCheckedChange={(checked) => onCheckboxChange('isInvestor', !!checked)}
        />
        <Label htmlFor="isInvestor">Is Investor</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="lookingForOpportunities"
          name="lookingForOpportunities"
          checked={filters.lookingForOpportunities}
          onCheckedChange={(checked) => onCheckboxChange('lookingForOpportunities', !!checked)}
        />
        <Label htmlFor="lookingForOpportunities">Looking for Opportunities</Label>
      </div>
    </>
  );
};

export default FilterCheckboxes;
