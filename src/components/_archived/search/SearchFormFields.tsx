
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilters } from '@/types/searchTypes';

interface SearchFormFieldsProps {
  filters: SearchFilters;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExperienceChange: (value: string) => void;
}

const SearchFormFields: React.FC<SearchFormFieldsProps> = ({ 
  filters, 
  onInputChange, 
  onExperienceChange 
}) => {
  return (
    <>
      <div>
        <Label htmlFor="searchTerm">Search Term</Label>
        <Input
          type="text"
          id="searchTerm"
          name="searchTerm"
          value={filters.searchTerm}
          onChange={onInputChange}
          placeholder="Enter keyword"
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          type="text"
          id="location"
          name="location"
          value={filters.location}
          onChange={onInputChange}
          placeholder="Enter location"
        />
      </div>
      <div>
        <Label htmlFor="profession">Profession</Label>
        <Input
          type="text"
          id="profession"
          name="profession"
          value={filters.profession}
          onChange={onInputChange}
          placeholder="Enter profession"
        />
      </div>
      <div>
        <Label htmlFor="countryOfOrigin">Country of Origin</Label>
        <Input
          type="text"
          id="countryOfOrigin"
          name="countryOfOrigin"
          value={filters.countryOfOrigin}
          onChange={onInputChange}
          placeholder="Enter country of origin"
        />
      </div>
      <div>
        <Label htmlFor="experience">Experience</Label>
        <Select onValueChange={onExperienceChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select experience" defaultValue={filters.experience} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="11-15">11-15 years</SelectItem>
            <SelectItem value="15+">15+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default SearchFormFields;
