
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters } from '@/types/searchTypes';
import SearchFormFields from './SearchFormFields';
import SkillsSelector from './SkillsSelector';
import FilterCheckboxes from './FilterCheckboxes';
import SearchActions from './SearchActions';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading: boolean;
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  location: '',
  profession: '',
  skills: [],
  experience: '',
  isMentor: false,
  isInvestor: false,
  lookingForOpportunities: false,
  countryOfOrigin: ''
};

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClear, loading }) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: checked
    }));
  };

  const handleSkillSelect = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
      setFilters(prevFilters => ({
        ...prevFilters,
        skills: prevFilters.skills.filter(s => s !== skill)
      }));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
      setFilters(prevFilters => ({
        ...prevFilters,
        skills: [...prevFilters.skills, skill]
      }));
    }
  };

  const handleExperienceChange = (value: string) => {
    setFilters(prevFilters => ({ ...prevFilters, experience: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    setSelectedSkills([]);
    onClear();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchFormFields
          filters={filters}
          onInputChange={handleInputChange}
          onExperienceChange={handleExperienceChange}
        />
        <SkillsSelector
          selectedSkills={selectedSkills}
          onSkillSelect={handleSkillSelect}
        />
        <FilterCheckboxes
          filters={filters}
          onCheckboxChange={handleCheckboxChange}
        />
        <SearchActions
          onSearch={handleSearch}
          onClear={handleClear}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
