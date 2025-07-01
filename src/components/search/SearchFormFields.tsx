
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SearchFilters } from '@/types/searchTypes';
import { X } from 'lucide-react';

interface SearchFormFieldsProps {
  filters: SearchFilters;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (key: keyof SearchFilters, value: string) => void;
  onSkillToggle: (skill: string) => void;
}

const POPULAR_SKILLS = [
  'Software Development', 'Data Science', 'Product Management', 'Digital Marketing',
  'Finance', 'Healthcare', 'Education', 'Agriculture', 'Energy', 'Creative Arts',
  'Consulting', 'Sales', 'Human Resources', 'Legal', 'Engineering'
];

const LOCATIONS = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Morocco', 'Egypt',
  'United States', 'United Kingdom', 'Canada', 'France', 'Germany',
  'Australia', 'Brazil', 'UAE'
];

const PROFESSIONS = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing Manager',
  'Financial Analyst', 'Doctor', 'Teacher', 'Entrepreneur', 'Consultant',
  'Designer', 'Researcher', 'Sales Representative'
];

const EXPERIENCE_LEVELS = [
  { value: '0-2', label: 'Entry Level (0-2 years)' },
  { value: '3-5', label: 'Mid Level (3-5 years)' },
  { value: '6-10', label: 'Senior (6-10 years)' },
  { value: '11-15', label: 'Lead (11-15 years)' },
  { value: '15+', label: 'Executive (15+ years)' }
];

const SearchFormFields: React.FC<SearchFormFieldsProps> = ({ 
  filters, 
  onInputChange, 
  onSelectChange,
  onSkillToggle
}) => {
  return (
    <div className="space-y-6">
      {/* Search Term */}
      <div>
        <Label htmlFor="searchTerm" className="text-sm font-medium mb-2 block">
          Search Keywords
        </Label>
        <Input
          type="text"
          id="searchTerm"
          name="searchTerm"
          value={filters.searchTerm}
          onChange={onInputChange}
          placeholder="Search by name, skills, company, bio..."
          className="w-full"
        />
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="text-sm font-medium mb-2 block">
          Location
        </Label>
        <Select value={filters.location} onValueChange={(value) => onSelectChange('location', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select location..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
            {LOCATIONS.map(location => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Profession */}
      <div>
        <Label htmlFor="profession" className="text-sm font-medium mb-2 block">
          Profession
        </Label>
        <Select value={filters.profession} onValueChange={(value) => onSelectChange('profession', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select profession..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Professions</SelectItem>
            {PROFESSIONS.map(profession => (
              <SelectItem key={profession} value={profession}>
                {profession}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Company */}
      <div>
        <Label htmlFor="company" className="text-sm font-medium mb-2 block">
          Company
        </Label>
        <Input
          type="text"
          id="company"
          name="company"
          value={filters.company}
          onChange={onInputChange}
          placeholder="Enter company name..."
          className="w-full"
        />
      </div>

      {/* Experience Level */}
      <div>
        <Label htmlFor="experience" className="text-sm font-medium mb-2 block">
          Experience Level
        </Label>
        <Select value={filters.experience} onValueChange={(value) => onSelectChange('experience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select experience level..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Experience</SelectItem>
            {EXPERIENCE_LEVELS.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skills */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Skills & Expertise
        </Label>
        <div className="space-y-3">
          {/* Selected Skills */}
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.skills.map(skill => (
                <Badge
                  key={skill}
                  className="bg-dna-emerald text-white flex items-center gap-1"
                >
                  {skill}
                  <button
                    onClick={() => onSkillToggle(skill)}
                    className="ml-1 hover:bg-dna-forest rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Available Skills */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.filter(skill => !filters.skills.includes(skill)).map(skill => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-dna-emerald hover:text-white transition-colors"
                onClick={() => onSkillToggle(skill)}
              >
                + {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Country of Origin */}
      <div>
        <Label htmlFor="countryOfOrigin" className="text-sm font-medium mb-2 block">
          Country of Origin
        </Label>
        <Select value={filters.countryOfOrigin} onValueChange={(value) => onSelectChange('countryOfOrigin', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select country of origin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Country</SelectItem>
            {LOCATIONS.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFormFields;
