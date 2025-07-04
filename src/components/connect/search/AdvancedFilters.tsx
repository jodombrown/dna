import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SKILL_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Agriculture', 'Education',
  'Energy', 'Creative', 'Marketing', 'Consulting', 'Legal'
];

const LOCATION_OPTIONS = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Morocco', 'Egypt',
  'United States', 'United Kingdom', 'Canada', 'France', 'Germany'
];

interface AdvancedFiltersProps {
  filters: {
    location: string;
    skills: string[];
    isMentor: boolean;
    isInvestor: boolean;
    lookingForOpportunities: boolean;
  };
  onFiltersChange: (filters: any) => void;
  activeFilterCount: number;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  activeFilterCount
}) => {
  const updateFilters = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = filters.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    updateFilters('skills', updatedSkills);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      location: '',
      skills: [],
      isMentor: false,
      isInvestor: false,
      lookingForOpportunities: false
    });
  };

  const hasActiveFilters = filters.location || 
    filters.skills.length > 0 || 
    filters.isMentor || 
    filters.isInvestor || 
    filters.lookingForOpportunities;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-dna-emerald text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select 
              value={filters.location || ''} 
              onValueChange={(value) => updateFilters('location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATION_OPTIONS.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {SKILL_OPTIONS.map(skill => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    checked={filters.skills?.includes(skill) || false}
                    onCheckedChange={() => toggleSkill(skill)}
                  />
                  <label 
                    htmlFor={skill} 
                    className="text-sm cursor-pointer"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Filters */}
          <div>
            <label className="text-sm font-medium mb-2 block">Professional Status</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mentor"
                  checked={filters.isMentor || false}
                  onCheckedChange={(checked) => updateFilters('isMentor', checked)}
                />
                <label htmlFor="mentor" className="text-sm cursor-pointer">
                  Available as Mentor
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="investor"
                  checked={filters.isInvestor || false}
                  onCheckedChange={(checked) => updateFilters('isInvestor', checked)}
                />
                <label htmlFor="investor" className="text-sm cursor-pointer">
                  Active Investor
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opportunities"
                  checked={filters.lookingForOpportunities || false}
                  onCheckedChange={(checked) => updateFilters('lookingForOpportunities', checked)}
                />
                <label htmlFor="opportunities" className="text-sm cursor-pointer">
                  Open to Opportunities
                </label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedFilters;