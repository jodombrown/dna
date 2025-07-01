
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
          id="is_mentor"
          name="is_mentor"
          checked={filters.is_mentor}
          onCheckedChange={(checked) => onCheckboxChange('is_mentor', !!checked)}
        />
        <Label htmlFor="is_mentor">Is Mentor</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_investor"
          name="is_investor"
          checked={filters.is_investor}
          onCheckedChange={(checked) => onCheckboxChange('is_investor', !!checked)}
        />
        <Label htmlFor="is_investor">Is Investor</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="looking_for_opportunities"
          name="looking_for_opportunities"
          checked={filters.looking_for_opportunities}
          onCheckedChange={(checked) => onCheckboxChange('looking_for_opportunities', !!checked)}
        />
        <Label htmlFor="looking_for_opportunities">Looking for Opportunities</Label>
      </div>
    </>
  );
};

export default FilterCheckboxes;
